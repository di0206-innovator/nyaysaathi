import type {
  LegalRAGProvider,
  LegalRetrievalCriteria,
  LegalRetrievalResult,
  LegalChunk,
  EmbeddingProvider,
  RAGRetrievalMode
} from '@/lib/ai/types';
import { StatuteRAGProvider } from '@/lib/ai/mock-providers';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/db/supabase';
import { Logger } from '@/lib/observability/logger';
import { MatterCategory } from '@/types/matter';

/**
 * Production-ready pgvector-backed Legal RAG Provider.
 * Queries Supabase `statutory_provisions` via pgvector similarity search with metadata filtering.
 * Explicitly tracks retrievalMode ('LIVE_RAG' | 'DEGRADED_RAG' | 'LOCAL_FALLBACK' | 'NO_RETRIEVAL').
 */
export class PgVectorLegalRAGProvider implements LegalRAGProvider {
  public name = 'Supabase-pgvector-Statute-RAG';
  private embeddingProvider: EmbeddingProvider;
  private fallbackProvider: StatuteRAGProvider;

  constructor(embeddingProvider: EmbeddingProvider) {
    this.embeddingProvider = embeddingProvider;
    this.fallbackProvider = new StatuteRAGProvider(embeddingProvider);
  }

  public async getStatuteBySection(statute: string, section: string): Promise<LegalChunk | null> {
    return this.fallbackProvider.getStatuteBySection(statute, section);
  }

  public async listAllChunks(): Promise<LegalChunk[]> {
    return this.fallbackProvider.listAllChunks();
  }

  public async searchStatutes(
    query: string,
    criteria: LegalRetrievalCriteria
  ): Promise<LegalRetrievalResult[]> {
    if (!isSupabaseConfigured()) {
      const fallbackResults = await this.fallbackProvider.searchStatutes(query, criteria);
      return fallbackResults.map(r => ({
        ...r,
        retrievalMode: 'LOCAL_FALLBACK' as RAGRetrievalMode
      }));
    }

    try {
      const client = getSupabaseClient();
      if (!client) {
        const fallbackResults = await this.fallbackProvider.searchStatutes(query, criteria);
        return fallbackResults.map(r => ({
          ...r,
          retrievalMode: 'LOCAL_FALLBACK' as RAGRetrievalMode
        }));
      }

      // Generate query embedding vector
      const queryVector = await this.embeddingProvider.embedText(
        `${criteria.category} ${criteria.state || ''} ${query}`
      );

      // Invoke Supabase RPC according to embedding dimension (768 for text-embedding-004, 64 for local dev)
      const rpcName = queryVector.length === 768 ? 'match_statutory_provisions_768' : 'match_statutory_provisions';
      const { data, error } = await client.rpc(rpcName, {
        query_embedding: queryVector,
        filter_category: criteria.category !== 'other' ? criteria.category : null,
        filter_state: criteria.state || null,
        match_threshold: 0.20,
        match_count: criteria.limit || 5
      });

      if (error || !data || data.length === 0) {
        Logger.warn('pgvector search returned empty or error, falling back to local corpus in DEGRADED_RAG mode', {
          error: error?.message,
          category: criteria.category,
          operation: 'pgvector_search'
        });
        const fallbackResults = await this.fallbackProvider.searchStatutes(query, criteria);
        return fallbackResults.map(r => ({
          ...r,
          retrievalMode: 'DEGRADED_RAG' as RAGRetrievalMode
        }));
      }

      // Map database records to standardized LegalRetrievalResult with LIVE_RAG mode
      interface PgStatuteRecord {
        id: string;
        statute_name: string;
        section_number: string;
        title: string;
        content: string;
        plain_summary: string;
        category: string;
        jurisdiction_state: string | null;
        forum_authority: string | null;
        remedy_type: string | null;
        source_url: string | null;
        similarity: number;
      }

      const results: LegalRetrievalResult[] = (data as PgStatuteRecord[]).map(row => {
        const score = Math.round((row.similarity || 0.5) * 100) / 100;
        const isStrong = score >= 0.65;
        const reasons: string[] = [
          `Semantic cosine similarity: ${(score * 100).toFixed(0)}% (LIVE_RAG)`,
          row.category === criteria.category ? `Direct category match: ${row.category}` : 'General legal statute',
          row.jurisdiction_state ? `Jurisdiction: ${row.jurisdiction_state}` : 'Central / All India statute'
        ];

        return {
          chunk: {
            id: row.id,
            statute: row.statute_name,
            section: row.section_number,
            title: row.title,
            plainSummary: row.plain_summary,
            category: row.category as MatterCategory,
            forumOrAuthority: row.forum_authority || 'Competent Court / Tribunal',
            remedy: row.remedy_type || 'Civil / Statutory Remedy',
            sourceUrl: row.source_url || undefined,
            jurisdiction: row.jurisdiction_state || 'Central / All India',
            keywords: [
              row.statute_name.toLowerCase(),
              row.section_number.toLowerCase(),
              row.title.toLowerCase()
            ]
          },
          relevanceScore: score,
          isStrongMatch: isStrong,
          matchReasons: reasons,
          suggestedTier: isStrong ? 'explanation' : 'possibility',
          retrievalMode: 'LIVE_RAG' as RAGRetrievalMode
        };
      });

      return results;
    } catch (err) {
      Logger.error('pgvector retrieval threw exception, falling back gracefully to DEGRADED_RAG', err, {
        operation: 'pgvector_search'
      });
      const fallbackResults = await this.fallbackProvider.searchStatutes(query, criteria);
      return fallbackResults.map(r => ({
        ...r,
        retrievalMode: 'DEGRADED_RAG' as RAGRetrievalMode
      }));
    }
  }
}
