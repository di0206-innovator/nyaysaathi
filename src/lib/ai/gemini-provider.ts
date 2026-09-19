import {
  LLMProvider,
  LLMGenerationOptions,
  LLMResponse,
  StructuredGenerationSchema
} from './types';
import { DeterministicLLMProvider } from './mock-providers';
import { Logger } from '@/lib/observability/logger';

/**
 * Production Gemini LLM Provider
 * Connects to Google Gemini API (gemini-2.5-flash) using standard HTTPS REST calls.
 * Includes timeout control via AbortController, retry logic for 429/5xx,
 * resilient JSON parsing, and transparent fallback accounting.
 */
export class GeminiLLMProvider implements LLMProvider {
  public name = 'Google-Gemini-2.5-Legal';
  private apiKey?: string;
  private fallback: DeterministicLLMProvider;
  private timeoutMs: number;

  constructor(apiKey?: string, timeoutMs: number = 15000) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY;
    this.fallback = new DeterministicLLMProvider();
    this.timeoutMs = timeoutMs;
  }

  public async generateText(
    prompt: string,
    options?: LLMGenerationOptions
  ): Promise<LLMResponse<string>> {
    if (!this.apiKey) {
      Logger.info('Gemini API key not configured, executing with deterministic mock', {
        provider: 'deterministic_mock',
        isFallback: true
      });
      return this.fallback.generateText(prompt, options);
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`;
    const systemInstruction = options?.systemPrompt
      ? { parts: [{ text: options.systemPrompt }] }
      : undefined;

    const body = {
      system_instruction: systemInstruction,
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: options?.temperature ?? 0.2,
        maxOutputTokens: options?.maxTokens ?? 1024
      }
    };

    // Attempt with retry on 429 / 5xx
    const maxRetries = 2;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.status === 429 || res.status >= 500) {
          if (attempt < maxRetries) {
            await new Promise(r => setTimeout(r, attempt * 500));
            continue;
          }
          Logger.warn(`Gemini API returned status ${res.status}, falling back to deterministic mock`, {
            httpStatus: res.status,
            attempt,
            isFallback: true
          });
          return this.fallback.generateText(prompt, options);
        }

        if (!res.ok) {
          Logger.warn(`Gemini API error ${res.status}: ${res.statusText}, falling back`, {
            httpStatus: res.status,
            isFallback: true
          });
          return this.fallback.generateText(prompt, options);
        }

        const json = await res.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text || '';

        return {
          content: text,
          rawText: text,
          model: 'gemini-2.5-flash',
          provider: 'gemini_production',
          isFallback: false,
          confidenceScore: 0.96
        };
      } catch (err) {
        clearTimeout(timeoutId);
        if (attempt === maxRetries) {
          Logger.warn('Gemini request failed or timed out after retries, engaging fallback', {
            error: err instanceof Error ? err.message : String(err),
            isFallback: true
          });
          return this.fallback.generateText(prompt, options);
        }
        await new Promise(r => setTimeout(r, 400));
      }
    }

    return this.fallback.generateText(prompt, options);
  }

  public async generateStructured<T>(
    prompt: string,
    schema: StructuredGenerationSchema<T>,
    options?: LLMGenerationOptions
  ): Promise<LLMResponse<T>> {
    if (!this.apiKey) {
      return this.fallback.generateStructured(prompt, schema, options);
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`;
    const systemPrompt = `${options?.systemPrompt || ''}\nYou must return strictly valid JSON matching this schema: ${schema.description}. Do not include markdown code block ticks or commentary.`;

    const body = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        response_mime_type: 'application/json',
        temperature: options?.temperature ?? 0.1
      }
    };

    const maxRetries = 2;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.status === 429 || res.status >= 500) {
          if (attempt < maxRetries) {
            await new Promise(r => setTimeout(r, attempt * 500));
            continue;
          }
          Logger.warn(`Gemini structured API returned ${res.status}, engaging fallback`, {
            httpStatus: res.status,
            isFallback: true
          });
          return this.fallback.generateStructured(prompt, schema, options);
        }

        if (!res.ok) {
          return this.fallback.generateStructured(prompt, schema, options);
        }

        const json = await res.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const parsed = this.cleanAndParseJSON<T>(text);

        if (!parsed) {
          Logger.warn('Gemini structured response failed JSON parsing, falling back', {
            rawLength: text.length,
            isFallback: true
          });
          return this.fallback.generateStructured(prompt, schema, options);
        }

        return {
          content: parsed,
          rawText: text,
          model: 'gemini-2.5-flash',
          provider: 'gemini_production',
          isFallback: false,
          confidenceScore: 0.97
        };
      } catch (err) {
        clearTimeout(timeoutId);
        if (attempt === maxRetries) {
          Logger.warn('Gemini structured request failed or timed out, engaging fallback', {
            error: err instanceof Error ? err.message : String(err),
            isFallback: true
          });
          return this.fallback.generateStructured(prompt, schema, options);
        }
        await new Promise(r => setTimeout(r, 400));
      }
    }

    return this.fallback.generateStructured(prompt, schema, options);
  }

  /**
   * Cleans common LLM markdown artifacts (```json ... ```) and parses JSON.
   */
  private cleanAndParseJSON<T>(text: string): T | null {
    try {
      let cleaned = text.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/, '').replace(/```$/, '').trim();
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\s*/, '').replace(/```$/, '').trim();
      }
      return JSON.parse(cleaned) as T;
    } catch {
      return null;
    }
  }
}
