import {
  LLMProvider,
  EmbeddingProvider,
  LegalRAGProvider,
  TranslationProvider
} from './types';
import {
  DeterministicLLMProvider,
  LocalEmbeddingProvider,
  IndicTranslationProvider
} from './mock-providers';
import { GeminiLLMProvider, GeminiEmbeddingProvider } from './gemini-provider';

import { PgVectorLegalRAGProvider } from '@/lib/rag/pgvector-provider';

export * from './types';
export * from './mock-providers';
export * from './gemini-provider';
export { PgVectorLegalRAGProvider } from '@/lib/rag/pgvector-provider';

let globalLLMProvider: LLMProvider | null = null;
let globalEmbeddingProvider: EmbeddingProvider | null = null;
let globalLegalRAGProvider: LegalRAGProvider | null = null;
let globalTranslationProvider: TranslationProvider | null = null;

export function getLLMProvider(): LLMProvider {
  if (!globalLLMProvider) {
    if (process.env.GEMINI_API_KEY) {
      globalLLMProvider = new GeminiLLMProvider(process.env.GEMINI_API_KEY);
    } else {
      globalLLMProvider = new DeterministicLLMProvider();
    }
  }
  return globalLLMProvider;
}

export function setLLMProvider(provider: LLMProvider) {
  globalLLMProvider = provider;
}

export function getEmbeddingProvider(): EmbeddingProvider {
  if (!globalEmbeddingProvider) {
    if (process.env.GEMINI_API_KEY) {
      globalEmbeddingProvider = new GeminiEmbeddingProvider(process.env.GEMINI_API_KEY);
    } else {
      globalEmbeddingProvider = new LocalEmbeddingProvider();
    }
  }
  return globalEmbeddingProvider!;
}

export function getLegalRAGProvider(): LegalRAGProvider {
  if (!globalLegalRAGProvider) {
    globalLegalRAGProvider = new PgVectorLegalRAGProvider(getEmbeddingProvider());
  }
  return globalLegalRAGProvider!;
}

export function setLegalRAGProvider(provider: LegalRAGProvider) {
  globalLegalRAGProvider = provider;
}

export function getTranslationProvider(): TranslationProvider {
  if (!globalTranslationProvider) {
    globalTranslationProvider = new IndicTranslationProvider();
  }
  return globalTranslationProvider;
}
