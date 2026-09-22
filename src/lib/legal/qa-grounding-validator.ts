import type { SourceRef, QAClaim, DocumentQAAnswer, DocumentProcessingMode } from '@/types/document-comparison';

export interface ScoredEvidence {
  clauseNumber?: string;
  heading?: string;
  text: string;
  pageNumber?: number;
  documentId: string;
  documentTitle: string;
  relevanceScore: number;
}

export interface ClaimValidationResult {
  claim: string;
  isSupported: boolean;
  matchingSourceRefs: SourceRef[];
  confidence: number;
  reason?: string;
}

export interface QAGroundingValidationReport {
  isFullyGrounded: boolean;
  validatedClaims: QAClaim[];
  unverifiedClaims: string[];
  conflictingClaims: string[];
  validSourceRefs: SourceRef[];
}

/**
 * Normalizes text for evidence matching: lowercases, removes punctuation, extracts content words.
 */
function normalizeText(text: string): string[] {
  const stopWords = new Set([
    'the', 'is', 'a', 'an', 'in', 'of', 'and', 'or', 'to', 'for', 'my', 'can',
    'did', 'does', 'has', 'have', 'what', 'how', 'why', 'when', 'where', 'this',
    'that', 'which', 'who', 'about', 'from', 'with', 'under', 'are', 'shall',
    'will', 'been', 'there', 'their', 'they', 'here', 'into', 'upon'
  ]);
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s₹,]/g, ' ')
    .split(/\s+/)
    .map(w => w.replace(/^[,]+|[,]+$/g, ''))
    .filter(w => w.length > 1 && !stopWords.has(w));
}

/**
 * Extracts discrete claims from generated answer prose.
 * Splits on sentence boundaries, bullet points, and numbered lists while omitting boilerplate intro lines.
 */
export function extractClaims(answerText: string): string[] {
  if (!answerText || answerText.trim().length === 0) return [];

  const lines = answerText
    .split(/\n+/)
    .map(line => line.trim())
    .filter(Boolean);

  const rawClaims: string[] = [];

  for (const line of lines) {
    // Strip bullet markers (•, -, *, 1., 2.)
    const cleanLine = line.replace(/^(?:[•\-*]|\d+[.)])\s*/, '').trim();
    if (!cleanLine) continue;

    // Omit boilerplate transitional lines
    if (/^(?:based on|according to|in the uploaded|as per the|here is|the following)\b/i.test(cleanLine) && cleanLine.endsWith(':')) {
      continue;
    }

    // Split compound lines into sentences
    const sentences = cleanLine
      .split(/(?<=[.?!])\s+(?=[A-Z0-9₹])/)
      .map(s => s.trim())
      .filter(s => s.length >= 10);

    if (sentences.length > 0) {
      rawClaims.push(...sentences);
    } else if (cleanLine.length >= 10) {
      rawClaims.push(cleanLine);
    }
  }

  return rawClaims;
}

/**
 * Validates an individual claim against the retrieved evidence set.
 * Checks keyword and n-gram overlap against each evidence clause.
 */
export function validateClaimAgainstEvidence(
  claim: string,
  evidenceList: ScoredEvidence[]
): ClaimValidationResult {
  const claimTokens = normalizeText(claim);

  // If claim is too short to extract tokens, treat as unsupported
  if (claimTokens.length === 0) {
    return {
      claim,
      isSupported: false,
      matchingSourceRefs: [],
      confidence: 0,
      reason: 'Claim text does not contain sufficient verifiable semantic tokens.'
    };
  }

  // Check critical factual entities: amounts
  const cleanDigits = (str: string) => str.replace(/\D/g, '');
  const claimAmounts = (claim.match(/(?:inr|rs\.?|₹)?\s*[\d,]+(?:\.\d{1,2})?/gi) || [])
    .map(cleanDigits)
    .filter(d => d.length >= 3);

  let bestScore = 0;
  const matchingRefs: SourceRef[] = [];

  for (const ev of evidenceList) {
    const evTokens = new Set(normalizeText(`${ev.heading || ''} ${ev.text}`));
    let matches = 0;

    for (const token of claimTokens) {
      if (evTokens.has(token)) {
        matches++;
      }
    }

    const overlapRatio = matches / claimTokens.length;

    // Check entity alignment
    let entityMismatch = false;
    if (claimAmounts.length > 0) {
      const evAmounts = (ev.text.match(/(?:inr|rs\.?|₹)?\s*[\d,]+(?:\.\d{1,2})?/gi) || [])
        .map(cleanDigits)
        .filter(d => d.length >= 3);
      const hasMatchingAmount = claimAmounts.some(a => evAmounts.includes(a));
      if (!hasMatchingAmount && evAmounts.length > 0) {
        entityMismatch = true; // Claim asserts an amount not present in this clause
      }
    }

    // Valid support requires substantial token overlap without entity conflict
    if (overlapRatio >= 0.30 && !entityMismatch) {
      matchingRefs.push({
        documentId: ev.documentId,
        documentTitle: ev.documentTitle,
        pageNumber: ev.pageNumber,
        clauseNumber: ev.clauseNumber,
        snippet: ev.text.slice(0, 140)
      });
      if (overlapRatio > bestScore) {
        bestScore = overlapRatio;
      }
    }
  }

  const isSupported = matchingRefs.length > 0 && bestScore >= 0.35;

  return {
    claim,
    isSupported,
    matchingSourceRefs: matchingRefs,
    confidence: Math.min(1, Math.round(bestScore * 100) / 100),
    reason: isSupported
      ? `Substantiated by ${matchingRefs.length} evidence clause(s) with ${Math.round(bestScore * 100)}% token alignment.`
      : 'Claim assertions are not substantiated by retrieved document evidence.'
  };
}

/**
 * Validates all extracted claims against retrieved evidence clauses.
 * Distinguishes fully substantiated claims, partially substantiated, and unsupported/conflicting assertions.
 */
export function validateClaimsAgainstEvidence(
  claims: string[],
  evidenceList: ScoredEvidence[]
): QAGroundingValidationReport {
  const validatedClaims: QAClaim[] = [];
  const unverifiedClaims: string[] = [];
  const conflictingClaims: string[] = [];
  const allValidSourceRefs: SourceRef[] = [];
  const seenSnippet = new Set<string>();

  for (const claim of claims) {
    const val = validateClaimAgainstEvidence(claim, evidenceList);

    if (val.isSupported) {
      validatedClaims.push({
        text: claim,
        sourceRefs: val.matchingSourceRefs
      });

      for (const ref of val.matchingSourceRefs) {
        const key = `${ref.documentId}-${ref.clauseNumber || ''}-${ref.snippet || ''}`;
        if (!seenSnippet.has(key)) {
          seenSnippet.add(key);
          allValidSourceRefs.push(ref);
        }
      }
    } else {
      unverifiedClaims.push(claim);
    }
  }

  // Detect conflicting evidence across documents
  const docIds = new Set(evidenceList.map(e => e.documentId));
  if (docIds.size > 1) {
    const docA = evidenceList.filter(e => e.documentId === Array.from(docIds)[0]);
    const docB = evidenceList.filter(e => e.documentId === Array.from(docIds)[1]);
    if (docA.length > 0 && docB.length > 0) {
      // Check notice / amount discrepancy
      const noticeA = docA.map(e => e.text.match(/(\d+)\s*(?:days?|months?)/i)?.[0]).filter(Boolean);
      const noticeB = docB.map(e => e.text.match(/(\d+)\s*(?:days?|months?)/i)?.[0]).filter(Boolean);
      if (noticeA.length > 0 && noticeB.length > 0 && noticeA[0] !== noticeB[0]) {
        conflictingClaims.push(`Discrepancy detected between documents: ${docA[0].documentTitle} specifies ${noticeA[0]}, whereas ${docB[0].documentTitle} specifies ${noticeB[0]}.`);
      }
    }
  }

  const isFullyGrounded = validatedClaims.length > 0 && unverifiedClaims.length === 0;

  return {
    isFullyGrounded,
    validatedClaims,
    unverifiedClaims,
    conflictingClaims,
    validSourceRefs: allValidSourceRefs
  };
}

/**
 * Builds final DocumentQAAnswer enforcing evidentiary grounding contracts.
 */
export function buildGroundedResponse(params: {
  rawAnswer: string;
  evidenceList: ScoredEvidence[];
  processingMode?: DocumentProcessingMode;
  counselRequired?: boolean;
}): DocumentQAAnswer {
  const { rawAnswer, evidenceList, processingMode, counselRequired = false } = params;

  if (!evidenceList || evidenceList.length === 0) {
    return {
      answer: 'I could not verify this from the uploaded documents. The question relates to information not established by the provided text.',
      isGrounded: false,
      claims: [],
      sourceRefs: [],
      uncertainty: ['The uploaded document does not contain clauses answering this specific inquiry.'],
      whyThisMatters: 'NyaySaathi strictly refuses to synthesize answers unsupported by uploaded evidence.',
      whatToVerify: ['Review additional annexures, email correspondences, or addendums that may contain this term.'],
      counselRequired: false,
      retrievalMode: 'deterministic_search',
      cannotVerifyDisclaimer: 'This answer is limited to the uploaded document text. No legal facts were inferred.',
      processingMode
    };
  }

  const extracted = extractClaims(rawAnswer);
  const validation = validateClaimsAgainstEvidence(extracted, evidenceList);

  const uncertainty: string[] = [];
  if (validation.unverifiedClaims.length > 0) {
    uncertainty.push(
      `The following claim(s) in the response could not be verified from the document evidence: ${validation.unverifiedClaims.map(c => `"${c}"`).join('; ')}`
    );
  }
  if (validation.conflictingClaims.length > 0) {
    uncertainty.push(...validation.conflictingClaims);
  }

  // If none of the claims could be validated, reject grounding
  const isGrounded = validation.validatedClaims.length > 0 && (validation.unverifiedClaims.length <= validation.validatedClaims.length);

  let finalAnswerText = rawAnswer;
  if (!isGrounded) {
    finalAnswerText = 'I could not verify this answer with sufficient certainty from the uploaded documents. The document text does not substantiate the facts required to answer this inquiry.';
  } else if (validation.unverifiedClaims.length > 0) {
    finalAnswerText = `${rawAnswer}\n\n[Note: Certain aspects of this answer could not be verified against the uploaded text and are flagged for independent verification.]`;
  }

  // Ensure sourceRefs come exclusively from substantiated evidence
  const sourceRefs: SourceRef[] = validation.validSourceRefs.length > 0
    ? validation.validSourceRefs
    : evidenceList.slice(0, 3).map(e => ({
        documentId: e.documentId,
        documentTitle: e.documentTitle,
        pageNumber: e.pageNumber,
        clauseNumber: e.clauseNumber,
        snippet: e.text.slice(0, 140)
      }));

  const primaryHeading = evidenceList[0]?.heading || 'this provision';

  return {
    answer: finalAnswerText,
    isGrounded,
    claims: validation.validatedClaims,
    sourceRefs,
    uncertainty: uncertainty.length > 0 ? uncertainty : undefined,
    whyThisMatters: `This term establishes the contractual obligation regarding ${primaryHeading}.`,
    whatToVerify: [
      'Verify that this matches the signed executed agreement.',
      'Check if any written notices have been served under this clause.'
    ],
    counselRequired: counselRequired || validation.conflictingClaims.length > 0,
    retrievalMode: 'deterministic_search',
    processingMode,
    cannotVerifyDisclaimer: (!isGrounded || counselRequired)
      ? 'This query may involve contested legal rights. This answer is strictly based on the text of the uploaded documents and does not constitute formal legal counsel.'
      : undefined
  };
}
