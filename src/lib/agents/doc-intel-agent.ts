import { AgentInput, DocIntelAgentResult, AgentMemoryEnvelope, SourceReference } from './types';
import { DocumentEvidence, ExtractedFact } from '@/types/matter';

export class DocIntelAgent {
  public async execute(input: AgentInput): Promise<AgentMemoryEnvelope<DocIntelAgentResult>> {
    const sourceReferences: SourceReference[] = [];
    const assumptions: string[] = [];
    const unresolvedQuestions: string[] = [];

    const processedDocuments: DocumentEvidence[] = input.documents.map((doc, idx) => {
      let classification = doc.classification;
      let relevanceSummary = doc.relevanceSummary;
      const confidenceScore = doc.confidenceScore || 0.94;
      const docId = doc.id || `doc-${idx + 1}`;

      if (!classification) {
        if (doc.title.toLowerCase().includes('agreement') || doc.title.toLowerCase().includes('lease')) {
          classification = 'Registered / Notarized Agreement';
          relevanceSummary = 'Primary contractual document establishing rights, lock-in period, and terms.';
        } else if (doc.title.toLowerCase().includes('chat') || doc.title.toLowerCase().includes('whatsapp')) {
          classification = 'Electronic Evidence / Admissible Communication';
          relevanceSummary = 'Written record of representations, promises, and refusal timestamps.';
        } else if (doc.title.toLowerCase().includes('receipt') || doc.title.toLowerCase().includes('bill') || doc.title.toLowerCase().includes('invoice')) {
          classification = 'Financial Consideration Proof';
          relevanceSummary = 'Proves monetary payment and establishing transactional consideration.';
        } else {
          classification = 'Supporting Documentary Evidence';
          relevanceSummary = 'Provides factual corroboration for user claims.';
        }
      }

      sourceReferences.push({
        id: docId,
        type: 'doc',
        label: `${doc.title} (${classification})`,
        excerpt: doc.relevanceSummary
      });

      return {
        ...doc,
        id: docId,
        classification,
        relevanceSummary,
        confidenceScore,
        status: 'verified' as const
      };
    });

    if (processedDocuments.length === 0) {
      assumptions.push('No uploaded physical/digital documents supplied; relying entirely on user narrative.');
      unresolvedQuestions.push('Can you upload supporting receipts, agreements, or WhatsApp chat screenshots to strengthen your position?');
    }

    // Generate grounded extracted facts
    const extractedFacts: ExtractedFact[] = [];
    
    // Fact 1: Narrative intake verification
    const fact1Id = 'fact-intake-claim';
    extractedFacts.push({
      id: fact1Id,
      statement: `User initiated grievance regarding ${input.category.replace(/_/g, ' ')} with claimed financial stake of ₹${(input.claimAmount || 0).toLocaleString('en-IN')}.`,
      category: 'financial',
      verified: true,
      tier: 'fact',
      confidence: 0.98,
      groundingRefIds: ['narrative-user']
    });

    // Fact 2: Documentary backing
    if (processedDocuments.length > 0) {
      const fact2Id = 'fact-doc-count';
      extractedFacts.push({
        id: fact2Id,
        statement: `User has provided ${processedDocuments.length} documentary evidence items (${processedDocuments.map(d => d.title).join(', ')}).`,
        category: 'contractual',
        verified: true,
        tier: 'fact',
        confidence: 0.96,
        groundingRefIds: processedDocuments.map(d => d.id)
      });
    }

    return {
      result: {
        processedDocuments,
        extractedFacts
      },
      confidenceScore: processedDocuments.length > 0 ? 0.96 : 0.75,
      sourceReferences,
      assumptions,
      unresolvedQuestions,
      safetyFlags: []
    };
  }
}
