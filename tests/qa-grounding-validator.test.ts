import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  extractClaims,
  validateClaimAgainstEvidence,
  validateClaimsAgainstEvidence,
  buildGroundedResponse,
  type ScoredEvidence
} from '@/lib/legal/qa-grounding-validator';

describe('Document-Grounded Q&A Claim-to-Evidence Validation Layer', () => {
  const mockEvidence: ScoredEvidence[] = [
    {
      documentId: 'doc-rental-v1',
      documentTitle: 'Rental Agreement',
      clauseNumber: '2',
      heading: 'Security Deposit',
      text: 'The Tenant has deposited an interest-free refundable security deposit of INR 1,00,000 with the Landlord. The deposit shall be refunded within thirty days of handing over vacant peaceful possession.',
      pageNumber: 1,
      relevanceScore: 5
    },
    {
      documentId: 'doc-rental-v1',
      documentTitle: 'Rental Agreement',
      clauseNumber: '3',
      heading: 'Notice Period',
      text: 'Either party may terminate this agreement by providing thirty days prior written notice.',
      pageNumber: 1,
      relevanceScore: 4
    }
  ];

  it('1. Extracts discrete claims from multi-sentence answer prose', () => {
    const rawAnswer = `Based on the extracted clauses:
• The security deposit is INR 1,00,000.
• Either party may terminate with thirty days notice.
The deposit must be returned upon peaceful possession.`;

    const claims = extractClaims(rawAnswer);
    assert.ok(claims.length >= 3, `Expected at least 3 claims, got ${claims.length}`);
    assert.ok(claims.some(c => c.includes('1,00,000')));
    assert.ok(claims.some(c => c.includes('thirty days notice')));
  });

  it('2. Fully supported answer: all claims map to evidence and mark response as grounded', () => {
    const rawAnswer = 'The security deposit amount is INR 1,00,000. It must be refunded within thirty days of handing over possession.';
    const response = buildGroundedResponse({
      rawAnswer,
      evidenceList: mockEvidence
    });

    assert.strictEqual(response.isGrounded, true);
    assert.strictEqual(response.claims.length, 2);
    assert.ok(response.claims.every(c => c.sourceRefs.length > 0));
    assert.strictEqual(response.uncertainty, undefined);
    assert.strictEqual(response.retrievalMode, 'deterministic_search');
  });

  it('3. Partially supported answer: unsupported claims are flagged and added to uncertainty', () => {
    const rawAnswer = 'The security deposit amount is INR 1,00,000. The landlord must also pay 18% annual interest on delayed return.';
    const response = buildGroundedResponse({
      rawAnswer,
      evidenceList: mockEvidence
    });

    // The deposit is supported, but 18% annual interest is NOT in evidence
    assert.ok(response.uncertainty && response.uncertainty.length > 0);
    assert.ok(response.uncertainty[0].includes('18%'));
    assert.ok(response.answer.includes('[Note: Certain aspects of this answer could not be verified'));
  });

  it('4. Unsupported answer: fabricated claims reject grounding and return refusal', () => {
    const rawAnswer = 'The tenant is entitled to a full refund within 7 days under Section 420 of the Indian Penal Code with triple damages.';
    const response = buildGroundedResponse({
      rawAnswer,
      evidenceList: mockEvidence
    });

    assert.strictEqual(response.isGrounded, false);
    assert.strictEqual(response.claims.length, 0);
    assert.ok(response.answer.includes('could not verify this answer with sufficient certainty'));
    assert.ok(response.cannotVerifyDisclaimer);
  });

  it('5. Conflicting evidence: detects discrepancy between multiple documents and flags counsel review', () => {
    const conflictingEvidence: ScoredEvidence[] = [
      {
        documentId: 'doc-a',
        documentTitle: 'Agreement v1',
        clauseNumber: '3',
        heading: 'Notice',
        text: 'Tenant must give 30 days notice prior to vacating.',
        relevanceScore: 5
      },
      {
        documentId: 'doc-b',
        documentTitle: 'Agreement v2',
        clauseNumber: '3',
        heading: 'Notice',
        text: 'Tenant must give 60 days notice prior to vacating.',
        relevanceScore: 5
      }
    ];

    const response = buildGroundedResponse({
      rawAnswer: 'Agreement v1 specifies 30 days notice while Agreement v2 specifies 60 days notice.',
      evidenceList: conflictingEvidence
    });

    assert.strictEqual(response.counselRequired, true);
    assert.ok(response.uncertainty && response.uncertainty.some(u => u.includes('Discrepancy detected')));
  });

  it('6. Empty evidence: returns immediate truthful refusal without synthesis', () => {
    const response = buildGroundedResponse({
      rawAnswer: 'Any ungrounded text',
      evidenceList: []
    });

    assert.strictEqual(response.isGrounded, false);
    assert.strictEqual(response.claims.length, 0);
    assert.strictEqual(response.sourceRefs.length, 0);
    assert.ok(response.answer.includes('could not verify this from the uploaded documents'));
  });

  it('7. Citation mismatch prevention: sourceRefs strictly match actual retrieved evidence clauses', () => {
    const claim = 'The security deposit amount is INR 1,00,000.';
    const val = validateClaimAgainstEvidence(claim, mockEvidence);

    assert.strictEqual(val.isSupported, true);
    assert.ok(val.matchingSourceRefs.length > 0);
    const ref = val.matchingSourceRefs[0];
    assert.strictEqual(ref.documentId, 'doc-rental-v1');
    assert.strictEqual(ref.clauseNumber, '2');
    assert.ok(ref.snippet?.includes('1,00,000'));
  });

  it('8. validateClaimsAgainstEvidence reports fully grounded status when all claims are valid', () => {
    const claims = [
      'The security deposit amount is INR 1,00,000.',
      'Either party may terminate this agreement by providing thirty days prior written notice.'
    ];
    const report = validateClaimsAgainstEvidence(claims, mockEvidence);
    assert.strictEqual(report.isFullyGrounded, true);
    assert.strictEqual(report.validatedClaims.length, 2);
    assert.strictEqual(report.unverifiedClaims.length, 0);
  });
});
