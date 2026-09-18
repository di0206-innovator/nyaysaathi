import { getLegalRAGProvider, LegalChunk, LegalRAGProvider, LegalRetrievalResult } from '@/lib/ai';
import { AgentInput } from '@/lib/agents/types';
import { Matter, SourceReference, TrustSafetyTier } from '@/types/matter';

export class LegalRAGService {
  private ragProvider: LegalRAGProvider;

  constructor(ragProvider?: LegalRAGProvider) {
    this.ragProvider = ragProvider || getLegalRAGProvider();
  }

  /**
   * Retrieve relevant statutory provisions matching a matter context.
   */
  public async retrieveForMatter(
    matterOrInput: Matter | AgentInput,
    limit: number = 5
  ): Promise<LegalRetrievalResult[]> {
    const category = matterOrInput.category;
    const userStory = matterOrInput.userStory;
    const state = 'locationState' in matterOrInput ? matterOrInput.locationState : undefined;
    const claimAmount = 'claimAmount' in matterOrInput ? matterOrInput.claimAmount : undefined;

    // Extract search keywords from narrative and documents
    const docTitles = matterOrInput.documents?.map(d => d.title).join(' ') || '';
    const keywords = [
      category,
      state || '',
      userStory.slice(0, 100),
      docTitles
    ].filter(Boolean);

    return this.ragProvider.searchStatutes(userStory, {
      category,
      state,
      claimAmount,
      narrativeText: userStory,
      extractedKeywords: keywords,
      limit
    });
  }

  /**
   * Converts retrieval results into standardized SourceReferences for the Evidence Graph.
   */
  public toSourceReferences(results: LegalRetrievalResult[]): SourceReference[] {
    return results.map(r => ({
      id: `statute-${r.chunk.id}`,
      type: 'statute',
      label: `${r.chunk.statute}, ${r.chunk.section}`,
      excerpt: `${r.chunk.title}: ${r.chunk.plainSummary.slice(0, 120)}...`
    }));
  }

  /**
   * Formats a formal legal citation block for inclusion in drafts or notices.
   */
  public formatCitationBlock(chunks: LegalChunk[]): string {
    if (chunks.length === 0) return '';
    return chunks
      .map(
        c =>
          `• ${c.statute} (${c.section}) - "${c.title}"\n  Forum: ${c.forumOrAuthority}\n  Statutory Remedy: ${c.remedy}`
      )
      .join('\n\n');
  }

  /**
   * Determines the trust/safety tier based on retrieval strength.
   * If no high-confidence statutory grounds are retrieved, downgrades to 'possibility' or 'counsel_required'.
   */
  public evaluateRetrievalTier(results: LegalRetrievalResult[]): {
    tier: TrustSafetyTier;
    recommendation: string;
  } {
    if (results.length === 0) {
      return {
        tier: 'counsel_required',
        recommendation:
          'No directly matched statutory provision found for this scenario. An enrolled Advocate must evaluate novel causes of action.'
      };
    }

    const hasStrong = results.some(r => r.isStrongMatch);
    if (!hasStrong) {
      return {
        tier: 'possibility',
        recommendation:
          'Statutory provisions apply by analogy or indirect precedent. Further evidentiary substantiation is recommended before formal notice service.'
      };
    }

    return {
      tier: 'explanation',
      recommendation:
        'Firm statutory footing established under applicable Indian enactments. Pre-litigation notice is substantiated.'
    };
  }
}

let globalRAGService: LegalRAGService | null = null;
export function getLegalRAGService(): LegalRAGService {
  if (!globalRAGService) {
    globalRAGService = new LegalRAGService();
  }
  return globalRAGService;
}
