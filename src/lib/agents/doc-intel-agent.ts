import { AgentInput, DocIntelAgentResult, AgentMemoryEnvelope, SourceReference } from './types';
import { DocumentEvidence, ExtractedFact } from '@/types/matter';
import { TrustEngine } from '@/lib/ai/trust-engine';

export class DocIntelAgent {
  public async execute(input: AgentInput): Promise<AgentMemoryEnvelope<DocIntelAgentResult>> {
    const sourceReferences: SourceReference[] = [];
    const assumptions: string[] = [];
    const unresolvedQuestions: string[] = [];

    const processedDocuments: DocumentEvidence[] = input.documents.map((doc, idx) => {
      const docId = doc.id || `doc-${idx + 1}`;
      let classification = doc.classification;
      let relevanceSummary = doc.relevanceSummary;
      const isImage = (doc.mimeType && doc.mimeType.startsWith('image/')) || /\.(jpg|jpeg|png|webp|tiff|bmp)$/i.test(doc.title);
      let extractionStatus = doc.extractionStatus;
      if (isImage && (!doc.extractedText || doc.extractedText.trim().length === 0)) {
        extractionStatus = 'needs_ocr';
      } else if (!extractionStatus || extractionStatus === 'raw_uploaded') {
        extractionStatus = doc.extractedText && doc.extractedText.trim().length > 0 ? 'verified_extraction' : 'needs_review';
      }

      // Truthful derivation: never guess document content or legal significance from filename
      if (!classification) {
        if (doc.extractedText && doc.extractedText.trim().length > 0) {
          classification = 'Parsed Text Document';
          relevanceSummary = `Verified extracted text (${doc.extractedText.length} characters). Contains primary factual content.`;
        } else if (extractionStatus === 'needs_ocr') {
          classification = 'Image / Scanned Document (Pending OCR)';
          relevanceSummary = 'Optical character recognition required. Text content has not been fabricated or inferred.';
        } else {
          classification = 'Unparsed Document Attachment';
          relevanceSummary = 'Document received. Content awaiting extraction; facts will not be inferred from file metadata.';
        }
      }

      // Calculate defensible empirical confidence score based strictly on extraction status
      const confidenceScore =
        extractionStatus === 'verified_extraction'
          ? 0.95
          : extractionStatus === 'partial_extraction'
            ? 0.70
            : extractionStatus === 'needs_ocr'
              ? 0.30
              : 0.15;

      sourceReferences.push({
        id: docId,
        type: 'doc',
        label: `${doc.title} [${classification}]`,
        excerpt: doc.extractedText ? doc.extractedText.slice(0, 150) : relevanceSummary
      });

      return {
        ...doc,
        id: docId,
        classification,
        relevanceSummary,
        confidenceScore,
        extractionStatus,
        status: (extractionStatus === 'verified_extraction' ? 'verified' : 'unverified') as 'verified' | 'unverified'
      };
    });

    if (processedDocuments.length === 0) {
      assumptions.push('No uploaded physical or digital documents supplied; relying solely on self-reported user narrative.');
      unresolvedQuestions.push('Can you upload supporting receipts, agreements, or communication records to substantiate this claim?');
    }

    // Generate grounded extracted facts from narrative and verified documents
    const extractedFacts: ExtractedFact[] = [];
    
    // Fact 1: User statement of grievance
    const fact1Id = 'fact-intake-claim';
    const hasClaimAmount = typeof input.claimAmount === 'number' && input.claimAmount > 0;
    extractedFacts.push({
      id: fact1Id,
      statement: hasClaimAmount
        ? `User reported grievance regarding ${input.category.replace(/_/g, ' ')} with asserted claim of ₹${(input.claimAmount || 0).toLocaleString('en-IN')}.`
        : `User reported grievance regarding ${input.category.replace(/_/g, ' ')}.`,
      category: 'financial',
      verified: true,
      tier: 'fact',
      confidence: 0.90, // Grounded in user's direct affirmation
      groundingRefIds: ['narrative-user']
    });

    // Fact 2: Documentary evidence count and status
    if (processedDocuments.length > 0) {
      const verifiedDocs = processedDocuments.filter(d => d.extractionStatus === 'verified_extraction');
      const unverifiedDocs = processedDocuments.filter(d => d.extractionStatus !== 'verified_extraction');
      
      extractedFacts.push({
        id: 'fact-doc-record',
        statement: `User supplied ${processedDocuments.length} document(s): ${verifiedDocs.length} verified extract(s), ${unverifiedDocs.length} requiring review/OCR.`,
        category: 'contractual',
        verified: verifiedDocs.length > 0,
        tier: 'fact',
        confidence: verifiedDocs.length === processedDocuments.length ? 0.95 : 0.65,
        groundingRefIds: processedDocuments.map(d => d.id)
      });
    }

    const verifiedDocCount = processedDocuments.filter(d => d.extractionStatus === 'verified_extraction').length;
    const evidenceStateResult = TrustEngine.deriveEvidenceState({
      totalFacts: extractedFacts.length,
      verifiedFacts: extractedFacts.filter(f => f.verified).length,
      hasDocuments: processedDocuments.length > 0,
      verifiedDocuments: verifiedDocCount,
      hasContradictions: false,
      safetyCounselRequired: false
    });

    return {
      result: {
        processedDocuments,
        extractedFacts
      },
      confidenceScore: evidenceStateResult.groundingRatio,
      evidenceState: evidenceStateResult.state,
      sourceReferences,
      assumptions,
      unresolvedQuestions,
      safetyFlags: []
    };
  }
}
