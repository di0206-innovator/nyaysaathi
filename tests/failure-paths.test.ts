import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { AuthService } from '../src/lib/auth/auth-service';
import { TrustEngine } from '../src/lib/ai/trust-engine';
import { DocIntelAgent } from '../src/lib/agents/doc-intel-agent';
import { RateLimiter } from '../src/lib/security/rate-limiter';
import { validateCreateMatter } from '../src/lib/api/validation';

describe('FAILURE PATHS & RESILIENCE SUITE (95+ Production Standards)', () => {
  // 1. Missing Authentication
  it('fails closed with UNAUTHORIZED when no token or cookie provided', async () => {
    const unauthenticatedReq = new NextRequest('http://localhost:3000/api/matters', {
      headers: {}
    });
    const user = await AuthService.getAuthenticatedUser(unauthenticatedReq);
    assert.equal(user, null, 'Unauthenticated requests must resolve to null user');
  });

  // 2. Malformed AI Output Schema Rejection
  it('fails closed on corrupt, truncated, or non-object AI responses', () => {
    // Non-object
    const nullCheck = TrustEngine.validateStructuredLegalOutput(null, ['title', 'summary']);
    assert.equal(nullCheck.isValid, false);
    assert.ok(nullCheck.errors.length > 0);

    // Array instead of object
    const arrayCheck = TrustEngine.validateStructuredLegalOutput(['title', 'summary'], ['title']);
    assert.equal(arrayCheck.isValid, false);

    // Missing required fields
    const partialObj = { title: 'Some Title' };
    const missingCheck = TrustEngine.validateStructuredLegalOutput(partialObj, ['title', 'claimAmount', 'legalNature']);
    assert.equal(missingCheck.isValid, false);
    assert.ok(missingCheck.errors.some(e => e.includes('claimAmount')));
    assert.ok(missingCheck.errors.some(e => e.includes('legalNature')));

    // Empty string in required field
    const emptyStringObj = { title: '   ', category: 'tenancy_housing' };
    const emptyCheck = TrustEngine.validateStructuredLegalOutput(emptyStringObj, ['title', 'category']);
    assert.equal(emptyCheck.isValid, false);
    assert.ok(emptyCheck.errors.some(e => e.includes('cannot be empty')));
  });

  // 3. Stale-Law Defense
  it('flags repealed or obsolete statutes like IPC or CrPC', () => {
    const ipcCheck = TrustEngine.checkStaleLaw('Indian Penal Code, 1860', 'Section 420');
    assert.equal(ipcCheck.isStale, true);
    assert.ok(ipcCheck.recommendedStatute?.includes('Bharatiya Nyaya Sanhita'));

    const crpcCheck = TrustEngine.checkStaleLaw('Code of Criminal Procedure 1973', 'Section 154');
    assert.equal(crpcCheck.isStale, true);
    assert.ok(crpcCheck.recommendedStatute?.includes('Bharatiya Nagarik Suraksha Sanhita'));

    const copraCheck = TrustEngine.checkStaleLaw('Consumer Protection Act 1986', 'Section 12');
    assert.equal(copraCheck.isStale, true);
    assert.ok(copraCheck.recommendedStatute?.includes('Consumer Protection Act, 2019'));

    const validCheck = TrustEngine.checkStaleLaw('Consumer Protection Act, 2019', 'Section 35');
    assert.equal(validCheck.isStale, false);
  });

  // 4. OCR Fails Closed Without Inventing Fake Text
  it('marks image without configured OCR as needs_ocr rather than synthesizing data', async () => {
    const docIntel = new DocIntelAgent();
    const result = await docIntel.execute({
      matterId: 'fail-ocr-1',
      title: 'Move-Out Handover Receipt',
      category: 'tenancy_housing',
      userStory: 'Landlord refused to sign physical paper on move-out day.',
      parties: [],
      documents: [
        {
          id: 'doc-img-1',
          title: 'handover_photo.jpg',
          type: 'other',
          mimeType: 'image/jpeg',
          storagePath: 'user/test/handover_photo.jpg',
          extractionStatus: 'raw_uploaded',
          uploadedAt: new Date().toISOString(),
          status: 'unverified'
        }
      ]
    });

    const doc = result.result.processedDocuments[0];
    assert.ok(doc);
    assert.equal(doc.extractionStatus, 'needs_ocr', 'Images must fail safely to needs_ocr when OCR engine unconfigured');
    assert.equal(doc.extractedText, undefined, 'Must not invent fake text for image without OCR');
  });

  // 5. Malformed Request Validation Rejections
  it('rejects malformed matter creation payloads with actionable validation errors', () => {
    // Missing all fields
    const emptyRes = validateCreateMatter({});
    assert.equal(emptyRes.isValid, false);
    assert.ok(emptyRes.errors.length >= 3);

    // Short user story
    const shortStoryRes = validateCreateMatter({
      title: 'Valid Title Here',
      category: 'tenancy_housing',
      userStory: 'Too short.'
    });
    assert.equal(shortStoryRes.isValid, false);
    assert.ok(shortStoryRes.errors.some(e => e.includes('15 characters')));

    // Invalid category
    const invalidCatRes = validateCreateMatter({
      title: 'Valid Title Here',
      category: 'space_alien_dispute',
      userStory: 'Valid detailed user story description for the matter.'
    });
    assert.equal(invalidCatRes.isValid, false);
    assert.ok(invalidCatRes.errors.some(e => e.includes('Invalid category')));
  });

  // 6. Sliding Window Rate Limiter Reset Window
  it('correctly calculates resetSeconds when client hits max requests', () => {
    RateLimiter.clear();
    const key = 'test-client-exhaustion';

    // Send 3 requests with max = 3, window = 30 seconds
    RateLimiter.check(key, 3, 30);
    RateLimiter.check(key, 3, 30);
    const lastAllowed = RateLimiter.check(key, 3, 30);
    assert.equal(lastAllowed.allowed, true);
    assert.equal(lastAllowed.remaining, 0);

    // 4th request must be rejected
    const blocked = RateLimiter.check(key, 3, 30);
    assert.equal(blocked.allowed, false);
    assert.equal(blocked.remaining, 0);
    assert.ok(blocked.resetSeconds > 0 && blocked.resetSeconds <= 30);
  });
});
