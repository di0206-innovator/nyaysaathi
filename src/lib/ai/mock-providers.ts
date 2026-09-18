import {
  LLMProvider,
  LLMGenerationOptions,
  LLMResponse,
  StructuredGenerationSchema,
  EmbeddingProvider,
  LegalRAGProvider,
  LegalChunk,
  LegalRetrievalCriteria,
  LegalRetrievalResult,
  TranslationProvider,
  SupportedLanguage,
  TranslatedExplanationResult
} from './types';
import { INDIAN_STATUTES } from '@/lib/legal/statutes';
import { MatterCategory } from '@/types/matter';

/**
 * 1. Deterministic LLM Provider
 * High-fidelity, deterministic legal language generation for tests and local dev.
 */
export class DeterministicLLMProvider implements LLMProvider {
  public name = 'Deterministic-Legal-LLM (v2026.09)';

  public async generateText(prompt: string, _options?: LLMGenerationOptions): Promise<LLMResponse<string>> {
    void _options;
    const isHindi = prompt.includes('Hindi') || prompt.includes('हिंदी');
    const isMarathi = prompt.includes('Marathi') || prompt.includes('मराठी');

    let output = '';
    if (isHindi) {
      output = `[AI विश्लेषण] प्रस्तुत मामले में दस्तावेजी साक्ष्य एवं वैधानिक उपबंधों के आधार पर अग्रिम कानूनी कार्यवाही का सुझाव दिया जाता है।`;
    } else if (isMarathi) {
      output = `[AI विश्लेषण] सादर प्रकरणातील कागदपत्री पुरावे व वैधानिक तरतुदींनुसार पुढील कायदेशीर कारवाईची शिफारस करण्यात येत आहे।`;
    } else {
      output = `Based on Indian jurisprudence, the provided facts indicate a dispute with actionable civil and statutory remedies. Relevant notices should be issued prior to formal forum escalation.`;
    }

    return {
      content: output,
      rawText: output,
      model: this.name,
      promptTokens: Math.ceil(prompt.length / 4),
      completionTokens: Math.ceil(output.length / 4),
      confidenceScore: 0.94
    };
  }

  public async generateStructured<T>(
    prompt: string,
    schema: StructuredGenerationSchema<T>,
    _options?: LLMGenerationOptions
  ): Promise<LLMResponse<T>> {
    void _options;
    // Return deep clone of schema example for deterministic contract adherence
    const content = JSON.parse(JSON.stringify(schema.example)) as T;

    return {
      content,
      rawText: JSON.stringify(content),
      model: this.name,
      promptTokens: Math.ceil(prompt.length / 4),
      completionTokens: 120,
      confidenceScore: 0.95
    };
  }
}

/**
 * 2. Local Embedding Provider
 * Fast hash-based n-gram embedding vectorizer for local semantic ranking.
 */
export class LocalEmbeddingProvider implements EmbeddingProvider {
  public name = 'Local-Ngram-Embeddings-64d';
  public dimensions = 64;

  public async embedText(text: string): Promise<number[]> {
    const vector = new Array(this.dimensions).fill(0);
    const cleaned = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    const tokens = cleaned.split(/\s+/).filter(t => t.length > 2);

    if (tokens.length === 0) return vector;

    for (const token of tokens) {
      let hash = 0;
      for (let i = 0; i < token.length; i++) {
        hash = (hash << 5) - hash + token.charCodeAt(i);
        hash |= 0;
      }
      const index = Math.abs(hash) % this.dimensions;
      vector[index] += 1;
    }

    // Normalize vector (L2 norm)
    const norm = Math.sqrt(vector.reduce((acc, v) => acc + v * v, 0));
    if (norm > 0) {
      for (let i = 0; i < this.dimensions; i++) {
        vector[i] /= norm;
      }
    }

    return vector;
  }

  public async embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map(t => this.embedText(t)));
  }

  public cosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) return 0;
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vectorA.length; i++) {
      dot += vectorA[i] * vectorB[i];
      normA += vectorA[i] * vectorA[i];
      normB += vectorB[i] * vectorB[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
  }
}

/**
 * 3. Statute RAG Provider
 * Multi-factor retrieval combining category matching, pecuniary jurisdiction, and semantic ranking.
 */
export class StatuteRAGProvider implements LegalRAGProvider {
  public name = 'Indian-Statute-RAG-Engine';
  private chunks: LegalChunk[] = [];
  private embeddingProvider: EmbeddingProvider;

  constructor(embeddingProvider: EmbeddingProvider = new LocalEmbeddingProvider()) {
    this.embeddingProvider = embeddingProvider;
    this.initializeChunks();
  }

  private initializeChunks() {
    this.chunks = INDIAN_STATUTES.map((s, idx) => ({
      id: `chunk-statute-${idx + 1}`,
      statute: s.statute,
      section: s.section,
      title: s.title,
      plainSummary: s.plainSummary,
      remedy: s.standardRemedy,
      forumOrAuthority: s.forumOrAuthority,
      category: s.category as MatterCategory,
      limitationMonths: s.limitationMonths,
      jurisdiction: 'Central / All India',
      sourceUrl: 'https://www.indiacode.nic.in',
      keywords: [
        s.statute.toLowerCase(),
        s.section.toLowerCase(),
        s.title.toLowerCase(),
        s.category.toLowerCase()
      ]
    }));
  }

  public async listAllChunks(): Promise<LegalChunk[]> {
    return this.chunks;
  }

  public async getStatuteBySection(statute: string, section: string): Promise<LegalChunk | null> {
    const sNorm = statute.toLowerCase();
    const secNorm = section.toLowerCase();
    return this.chunks.find(c =>
      c.statute.toLowerCase().includes(sNorm) && c.section.toLowerCase().includes(secNorm)
    ) || null;
  }

  public async searchStatutes(
    query: string,
    criteria: LegalRetrievalCriteria
  ): Promise<LegalRetrievalResult[]> {
    const queryVector = await this.embeddingProvider.embedText(query + ' ' + (criteria.narrativeText || ''));
    const results: LegalRetrievalResult[] = [];

    for (const chunk of this.chunks) {
      const matchReasons: string[] = [];
      let score = 0;

      // 1. Matter Category Alignment (40% weight)
      if (chunk.category === criteria.category) {
        score += 0.40;
        matchReasons.push(`Direct category match: ${chunk.category.replace(/_/g, ' ')}`);
      }

      // 2. Keyword & Text Similarity (30% weight)
      const chunkText = `${chunk.statute} ${chunk.section} ${chunk.title} ${chunk.plainSummary} ${chunk.remedy}`;
      const chunkVector = await this.embeddingProvider.embedText(chunkText);
      const similarity = this.embeddingProvider.cosineSimilarity(queryVector, chunkVector);
      score += similarity * 0.30;
      if (similarity > 0.3) {
        matchReasons.push(`Semantic text correlation: ${(similarity * 100).toFixed(0)}%`);
      }

      // 3. Pecuniary/Claim Amount Suitability (15% weight)
      if (criteria.claimAmount !== undefined) {
        if (chunk.category === 'consumer_dispute') {
          if (criteria.claimAmount <= 5000000) { // Up to 50 Lakhs = District Commission
            score += 0.15;
            matchReasons.push('Claim falls within District Consumer Commission pecuniary limit (₹50 Lakhs)');
          } else {
            score += 0.08;
            matchReasons.push('Claim requires State/National Commission jurisdiction');
          }
        } else {
          score += 0.10;
        }
      } else {
        score += 0.10;
      }

      // 4. Jurisdiction & State Suitability (15% weight)
      if (criteria.state && chunk.jurisdiction.toLowerCase().includes(criteria.state.toLowerCase())) {
        score += 0.15;
        matchReasons.push(`State-specific jurisdiction match: ${criteria.state}`);
      } else {
        score += 0.10; // Central acts apply across all states
      }

      // Final score normalization
      const finalScore = Math.min(0.99, Math.max(0.1, Number(score.toFixed(3))));
      const isStrongMatch = finalScore >= 0.65;

      results.push({
        chunk,
        relevanceScore: finalScore,
        isStrongMatch,
        matchReasons,
        suggestedTier: isStrongMatch ? 'explanation' : 'possibility'
      });
    }

    results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    const limit = criteria.limit || 5;
    return results.slice(0, limit);
  }
}

/**
 * 4. Indic Translation Provider
 * Translates explanations into Hindi (हिंदी), Hinglish, and Marathi (मराठी)
 * while preserving statutory names, section numbers, and legal citations.
 */
export class IndicTranslationProvider implements TranslationProvider {
  public name = 'Indic-Legal-Translator-Bhashini-Ready';

  private static GLOSSARIES: Record<SupportedLanguage, Record<string, string>> = {
    en: {},
    hi: {
      'Security Deposit': 'सुरक्षा जमा राशि (Security Deposit)',
      'Notice Period': 'नोटिस अवधि',
      'Legal Notice': 'कानूनी नोटिस (विधिक सूचना)',
      'Deficiency in Service': 'सेवा में कमी (Deficiency in Service)',
      'Limitation Period': 'परिसीमा काल (कानूनी मियाद)',
      'District Consumer Commission': 'जिला उपभोक्ता विवाद निवारण आयोग',
      'Refund': 'धनवापसी / प्रतिदाय',
      'Cause of Action': 'वाद का कारण (विवाद की तिथि)',
      'RERA': 'रेरा (स्थावर संपदा विनियामक प्राधिकरण)'
    },
    hinglish: {
      'Security Deposit': 'Security Deposit (Suraksha Rashi)',
      'Notice Period': 'Notice Period (Soochana ki muddat)',
      'Legal Notice': 'Legal Notice (Kanooni Patra)',
      'Deficiency in Service': 'Service mein kami (Deficiency)',
      'Limitation Period': 'Limitation Period (Case file karne ka time)',
      'District Consumer Commission': 'District Consumer Commission',
      'Refund': 'Refund / Money Return',
      'Cause of Action': 'Cause of Action (Dispute date)',
      'RERA': 'RERA Authority'
    },
    mr: {
      'Security Deposit': 'सुरक्षा अनामत रक्कम (Security Deposit)',
      'Notice Period': 'नोटीस कालावधी',
      'Legal Notice': 'कायदेशीर नोटीस (Legal Notice)',
      'Deficiency in Service': 'सेवेतील त्रुटी (Deficiency in Service)',
      'Limitation Period': 'मुदत कायदा मर्यादा (Limitation Period)',
      'District Consumer Commission': 'जिल्हा ग्राहक तक्रार निवारण आयोग',
      'Refund': 'रक्कम परतावा (Refund)',
      'Cause of Action': 'तक्रारीचे कारण (Cause of Action)',
      'RERA': 'महारेरा / रेरा प्राधिकरण'
    }
  };

  public getLegalGlossary(targetLanguage: SupportedLanguage): Record<string, string> {
    return IndicTranslationProvider.GLOSSARIES[targetLanguage] || {};
  }

  public async translateExplanation(
    text: string,
    targetLanguage: SupportedLanguage
  ): Promise<TranslatedExplanationResult> {
    if (targetLanguage === 'en') {
      return {
        translatedText: text,
        language: 'en',
        glossaryTerms: {},
        preservedCitations: []
      };
    }

    const glossary = this.getLegalGlossary(targetLanguage);
    const preservedCitations: string[] = [];

    // Detect citations to preserve (e.g. Section 138, Consumer Protection Act, 2019)
    const citationMatches = text.match(/Section\s+\d+(\(\w+\))?|Act,\s*\d{4}|RERA|BNS/gi);
    if (citationMatches) {
      citationMatches.forEach(c => preservedCitations.push(c));
    }

    let translated = text;

    // Replace known glossary terms
    for (const [enTerm, localizedTerm] of Object.entries(glossary)) {
      const regex = new RegExp(`\\b${enTerm}\\b`, 'gi');
      translated = translated.replace(regex, localizedTerm);
    }

    // Add localized executive banner
    let prefix = '';
    if (targetLanguage === 'hi') {
      prefix = `[हिंदी अनुवाद - न्यायसाथी विधिक मार्गदर्शन]\n\n`;
    } else if (targetLanguage === 'hinglish') {
      prefix = `[Hinglish Guidance - NyaySaathi Legal Roadmap]\n\n`;
    } else if (targetLanguage === 'mr') {
      prefix = `[मराठी भाषांतर - न्यायसाथी कायदेशीर सहाय्य]\n\n`;
    }

    return {
      translatedText: prefix + translated,
      language: targetLanguage,
      glossaryTerms: glossary,
      preservedCitations: Array.from(new Set(preservedCitations))
    };
  }
}
