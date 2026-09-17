import { AgentInput, LegalRetrievalAgentResult } from './types';
import { INDIAN_STATUTES } from '@/lib/legal/statutes';

export class LegalRetrievalAgent {
  /**
   * Identifies applicable Indian statutory frameworks, relevant sections,
   * jurisdictional forums, and limitation periods for the matter.
   */
  public async execute(input: AgentInput): Promise<LegalRetrievalAgentResult> {
    const matchingStatutes = INDIAN_STATUTES.filter(
      s => s.category === input.category || s.category === 'other'
    );

    const applicableStatutes = matchingStatutes.map(s => ({
      statute: s.statute,
      section: s.section,
      title: s.title,
      applicabilityNote: s.plainSummary,
      limitationMonths: s.limitationMonths,
      forum: s.forumOrAuthority
    }));

    // If no exact match, fallback to general civil remedy
    if (applicableStatutes.length === 0) {
      applicableStatutes.push({
        statute: 'Code of Civil Procedure, 1908 & Indian Contract Act, 1872',
        section: 'Section 73 (Compensation for breach of contract)',
        title: 'Damages for Breach of Legal Duty or Contract',
        applicabilityNote: 'Provides right to seek restitution and monetary compensation for direct losses sustained.',
        limitationMonths: 36,
        forum: 'Civil Court of Competent Jurisdiction'
      });
    }

    return {
      applicableStatutes
    };
  }
}
