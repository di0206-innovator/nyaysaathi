import { AgentInput, LegalRetrievalAgentResult, AgentMemoryEnvelope, SourceReference, SafetyFlag } from './types';
import { StatuteMatcher } from '@/lib/legal/statute-matcher';
import { getLegalRAGService, LegalRAGService } from '@/lib/rag/rag-service';

export class LegalRetrievalAgent {
  private ragService: LegalRAGService;

  constructor(ragService?: LegalRAGService) {
    this.ragService = ragService || getLegalRAGService();
  }

  public async execute(input: AgentInput): Promise<AgentMemoryEnvelope<LegalRetrievalAgentResult>> {
    const sourceReferences: SourceReference[] = [];
    const assumptions: string[] = [];
    const unresolvedQuestions: string[] = [];
    const safetyFlags: SafetyFlag[] = [];

    // 1. Multi-factor RAG retrieval
    const ragResults = await this.ragService.retrieveForMatter(input, 5);

    // 2. Deterministic rule-based matching
    const matchedRules = StatuteMatcher.match({
      category: input.category,
      state: input.locationState,
      claimAmount: input.claimAmount,
      hasRegisteredAgreement: input.documents.some(d => d.type === 'rental_agreement' || d.title.toLowerCase().includes('agreement'))
    });

    // Check retrieval strength
    const tierEvaluation = this.ragService.evaluateRetrievalTier(ragResults);
    if (tierEvaluation.tier === 'counsel_required' || tierEvaluation.tier === 'possibility') {
      safetyFlags.push({
        severity: tierEvaluation.tier === 'counsel_required' ? 'warning' : 'info',
        code: 'WEAK_STATUTE_GROUNDING',
        message: tierEvaluation.recommendation
      });
      unresolvedQuestions.push(
        'Does the opposing party have a documented contractual counter-defense or statutory exemption?'
      );
    }

    // Merge RAG results and rule matches
    const map = new Map<string, {
      statute: string;
      section: string;
      title: string;
      applicabilityNote: string;
      limitationMonths?: number;
      forum: string;
      matchScore?: number;
      matchReason?: string;
    }>();

    for (const r of ragResults) {
      const key = `${r.chunk.statute}-${r.chunk.section}`;
      map.set(key, {
        statute: r.chunk.statute,
        section: r.chunk.section,
        title: r.chunk.title,
        applicabilityNote: r.chunk.plainSummary,
        limitationMonths: r.chunk.limitationMonths,
        forum: r.chunk.forumOrAuthority,
        matchScore: r.relevanceScore,
        matchReason: r.matchReasons.join(' | ')
      });
    }

    for (const s of matchedRules) {
      const key = `${s.statute}-${s.section}`;
      if (!map.has(key)) {
        map.set(key, {
          statute: s.statute,
          section: s.section,
          title: s.title,
          applicabilityNote: s.plainSummary,
          limitationMonths: s.limitationMonths,
          forum: s.forumOrAuthority,
          matchScore: s.matchScore,
          matchReason: s.matchReason
        });
      }
    }

    const applicableStatutes = Array.from(map.values()).map((s, idx) => {
      const statuteId = `statute-${idx + 1}`;
      sourceReferences.push({
        id: statuteId,
        type: 'statute',
        label: `${s.statute} (${s.section})`,
        excerpt: s.applicabilityNote
      });

      return s;
    });

    const totalStatutes = applicableStatutes.length;
    const topScore = ragResults.length > 0 ? (ragResults[0].relevanceScore || 0.75) : (totalStatutes > 0 ? 0.70 : 0.1);
    const confidenceScore = totalStatutes === 0
      ? 0.1
      : Math.min(0.95, Math.max(0.2, Math.round(topScore * 100) / 100));

    const evidenceState = totalStatutes === 0
      ? 'unsupported'
      : (tierEvaluation.tier === 'counsel_required'
          ? 'counsel_required'
          : (ragResults.length > 0 && ragResults[0].isStrongMatch ? 'verified' : 'supported'));

    return {
      result: {
        applicableStatutes
      },
      confidenceScore,
      evidenceState,
      sourceReferences,
      assumptions,
      unresolvedQuestions,
      safetyFlags
    };
  }
}
