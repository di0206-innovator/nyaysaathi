import { MatterCategory, SourceReference, TrustSafetyTier } from '@/types/matter';

export type SupportedLanguage = 'en' | 'hi' | 'hinglish' | 'mr';

export interface LLMGenerationOptions {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  responseFormat?: 'text' | 'json';
}

export interface StructuredGenerationSchema<T> {
  name: string;
  description: string;
  example: T;
}

export interface LLMResponse<T = string> {
  content: T;
  rawText: string;
  model: string;
  promptTokens?: number;
  completionTokens?: number;
  confidenceScore: number;
}

export interface LLMProvider {
  name: string;
  generateText(prompt: string, options?: LLMGenerationOptions): Promise<LLMResponse<string>>;
  generateStructured<T>(
    prompt: string,
    schema: StructuredGenerationSchema<T>,
    options?: LLMGenerationOptions
  ): Promise<LLMResponse<T>>;
}

export interface EmbeddingProvider {
  name: string;
  dimensions: number;
  embedText(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
  cosineSimilarity(vectorA: number[], vectorB: number[]): number;
}

export interface LegalChunk {
  id: string;
  statute: string;
  section: string;
  title: string;
  plainSummary: string;
  remedy: string;
  forumOrAuthority: string;
  category: MatterCategory;
  limitationMonths?: number;
  jurisdiction: string; // 'Central / All India' or state specific
  sourceUrl?: string;
  keywords: string[];
  embedding?: number[];
}

export interface LegalRetrievalCriteria {
  category: MatterCategory;
  state?: string;
  claimAmount?: number;
  narrativeText?: string;
  extractedKeywords?: string[];
  limit?: number;
}

export interface LegalRetrievalResult {
  chunk: LegalChunk;
  relevanceScore: number;
  isStrongMatch: boolean;
  matchReasons: string[];
  suggestedTier: TrustSafetyTier;
}

export interface LegalRAGProvider {
  name: string;
  searchStatutes(query: string, criteria: LegalRetrievalCriteria): Promise<LegalRetrievalResult[]>;
  getStatuteBySection(statute: string, section: string): Promise<LegalChunk | null>;
  listAllChunks(): Promise<LegalChunk[]>;
}

export interface TranslatedExplanationResult {
  translatedText: string;
  language: SupportedLanguage;
  glossaryTerms: Record<string, string>;
  preservedCitations: string[];
}

export interface TranslationProvider {
  name: string;
  translateExplanation(
    text: string,
    targetLanguage: SupportedLanguage
  ): Promise<TranslatedExplanationResult>;
  getLegalGlossary(targetLanguage: SupportedLanguage): Record<string, string>;
}

export interface QAContext {
  matterId: string;
  category: MatterCategory;
  userStory: string;
  facts: Array<{ statement: string; category: string; verified: boolean }>;
  timeline: Array<{ date: string; title: string; description: string }>;
  evidenceDocs: Array<{ title: string; type: string; extractedText?: string }>;
  activeRisks: Array<{ title: string; description: string; severity: string }>;
  actionSteps: Array<{ title: string; phase: string }>;
  retrievedStatutes: Array<{ statute: string; section: string; title: string }>;
}

export interface QAResponse {
  answer: string;
  tier: TrustSafetyTier;
  citations: SourceReference[];
  isFullyGrounded: boolean;
  missingInfoPrompt?: string;
  suggestedQuestions?: string[];
}
