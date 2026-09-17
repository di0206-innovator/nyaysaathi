import { AgentInput, LegalRetrievalAgentResult, AgentMemoryEnvelope, SourceReference } from './types';
import { StatuteMatcher } from '@/lib/legal/statute-matcher';

export class LegalRetrievalAgent {
  public async execute(input: AgentInput): Promise<AgentMemoryEnvelope<LegalRetrievalAgentResult>> {
    const sourceReferences: SourceReference[] = [];
    const assumptions: string[] = [];
    const unresolvedQuestions: string[] = [];

    const matched = StatuteMatcher.match({
      category: input.category,
      state: input.locationState,
      claimAmount: input.claimAmount,
      hasRegisteredAgreement: input.documents.some(d => d.type === 'rental_agreement' || d.title.toLowerCase().includes('agreement'))
    });

    const applicableStatutes = matched.map((s, idx) => {
      const statuteId = `statute-${idx + 1}`;
      sourceReferences.push({
        id: statuteId,
        type: 'statute',
        label: `${s.statute} (${s.section})`,
        excerpt: s.plainSummary
      });

      return {
        statute: s.statute,
        section: s.section,
        title: s.title,
        applicabilityNote: s.plainSummary,
        limitationMonths: s.limitationMonths,
        forum: s.forumOrAuthority,
        matchScore: s.matchScore,
        matchReason: s.matchReason
      };
    });

    return {
      result: {
        applicableStatutes
      },
      confidenceScore: 0.95,
      sourceReferences,
      assumptions,
      unresolvedQuestions,
      safetyFlags: []
    };
  }
}
