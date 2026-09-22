import {
  LLMProvider,
  LLMGenerationOptions,
  LLMResponse,
  StructuredGenerationSchema,
  EmbeddingProvider
} from './types';
import { DeterministicLLMProvider, LocalEmbeddingProvider } from './mock-providers';
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
    const isProd = process.env.NODE_ENV === 'production';
    if (!this.apiKey) {
      if (isProd) {
        throw new Error('AI service temporarily unavailable: GEMINI_API_KEY is not configured in production.');
      }
      Logger.info('Gemini API key not configured, executing with deterministic test provider', {
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
          Logger.warn(`Gemini API returned status ${res.status}`, {
            httpStatus: res.status,
            attempt,
            isFallback: !isProd
          });
          if (isProd) {
            throw new Error(`AI service temporarily unavailable (status ${res.status}). The deterministic document analysis remains available.`);
          }
          return this.fallback.generateText(prompt, options);
        }

        if (!res.ok) {
          Logger.warn(`Gemini API error ${res.status}: ${res.statusText}`, {
            httpStatus: res.status,
            isFallback: !isProd
          });
          if (isProd) {
            throw new Error(`AI service temporarily unavailable (error ${res.status}). The deterministic document analysis remains available.`);
          }
          return this.fallback.generateText(prompt, options);
        }

        const json = await res.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text || '';

        const finishReason = json.candidates?.[0]?.finishReason;
        const confidenceScore = text.trim().length > 0 ? (finishReason === 'STOP' ? 0.90 : 0.70) : 0.1;

        return {
          content: text,
          rawText: text,
          model: 'gemini-2.5-flash',
          provider: 'gemini_production',
          isFallback: false,
          confidenceScore
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
    const isProd = process.env.NODE_ENV === 'production';
    if (!this.apiKey) {
      if (isProd) {
        throw new Error('AI service temporarily unavailable: GEMINI_API_KEY is not configured in production.');
      }
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
          Logger.warn(`Gemini structured API returned ${res.status}`, {
            httpStatus: res.status,
            isFallback: !isProd
          });
          if (isProd) {
            throw new Error(`AI service temporarily unavailable (status ${res.status}). The deterministic document analysis remains available.`);
          }
          return this.fallback.generateStructured(prompt, schema, options);
        }

        if (!res.ok) {
          if (isProd) {
            throw new Error(`AI service temporarily unavailable (error ${res.status}). The deterministic document analysis remains available.`);
          }
          return this.fallback.generateStructured(prompt, schema, options);
        }

        const json = await res.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const parsed = this.cleanAndParseJSON<T>(text);

        if (!parsed || !this.validateAgainstSchema(parsed, schema.example)) {
          Logger.warn('Gemini structured response failed schema validation or JSON parsing', {
            rawLength: text.length,
            isFallback: !isProd
          });
          if (isProd) {
            throw new Error('AI service returned invalid structured format. The deterministic document analysis remains available.');
          }
          return this.fallback.generateStructured(prompt, schema, options);
        }

        // Defensible confidence score: 0.85 when structured parse & schema validation succeeded
        return {
          content: parsed,
          rawText: text,
          model: 'gemini-2.5-flash',
          provider: 'gemini_production',
          isFallback: false,
          confidenceScore: 0.85
        };
      } catch (err) {
        clearTimeout(timeoutId);
        if (attempt === maxRetries) {
          Logger.warn('Gemini structured request failed or timed out', {
            error: err instanceof Error ? err.message : 'timeout',
            isFallback: !isProd
          });
          if (isProd) {
            throw new Error('AI service temporarily unavailable or timed out. The deterministic document analysis remains available.');
          }
          return this.fallback.generateStructured(prompt, schema, options);
        }
        await new Promise(r => setTimeout(r, 400));
      }
    }

    if (isProd) {
      throw new Error('AI service temporarily unavailable. The deterministic document analysis remains available.');
    }
    return this.fallback.generateStructured(prompt, schema, options);
  }

  /**
   * Validate parsed JSON against schema structure to ensure integrity
   */
  private validateAgainstSchema<T>(parsed: unknown, example: T): boolean {
    if (!parsed || typeof parsed !== 'object') return false;
    const record = parsed as Record<string, unknown>;
    if (example && typeof example === 'object') {
      const requiredKeys = Object.keys(example as object);
      for (const key of requiredKeys) {
        if (!(key in record)) {
          return false;
        }
      }
    }
    return true;
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

/**
 * Production Gemini Embedding Provider (text-embedding-004 - 768 dimensions)
 */
export class GeminiEmbeddingProvider implements EmbeddingProvider {
  public name = 'Google-Gemini-text-embedding-004';
  public dimensions = 768;
  public dimension = 768;
  private apiKey?: string;
  private fallback: LocalEmbeddingProvider;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY;
    this.fallback = new LocalEmbeddingProvider();
  }

  public async embedText(text: string): Promise<number[]> {
    if (!this.apiKey) {
      return this.fallback.embedText(text);
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${this.apiKey}`;
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'models/text-embedding-004',
          content: { parts: [{ text }] }
        })
      });

      if (!res.ok) {
        Logger.warn(`Gemini text-embedding-004 returned status ${res.status}, falling back to local`, {
          httpStatus: res.status
        });
        return this.fallback.embedText(text);
      }

      const data = await res.json();
      const values = data.embedding?.values;
      if (Array.isArray(values) && values.length === 768) {
        return values;
      }
      return this.fallback.embedText(text);
    } catch (err) {
      Logger.warn('Gemini embedding failed, falling back to local embedding', { error: String(err) });
      return this.fallback.embedText(text);
    }
  }

  public async embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map(t => this.embedText(t)));
  }

  public cosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) return 0;
    let dot = 0;
    let magA = 0;
    let magB = 0;
    for (let i = 0; i < vectorA.length; i++) {
      dot += vectorA[i] * vectorB[i];
      magA += vectorA[i] * vectorA[i];
      magB += vectorB[i] * vectorB[i];
    }
    const denom = Math.sqrt(magA) * Math.sqrt(magB);
    return denom === 0 ? 0 : dot / denom;
  }
}
