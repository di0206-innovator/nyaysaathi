import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  buildDocumentStoragePath,
  parseAndValidateStoragePath,
  isStoragePathOwnedByUser
} from '../src/lib/storage/canonical-path';
import {
  LocalStorageProvider,
  getStorageProvider
} from '../src/lib/storage/storage-provider';
import {
  validateDocumentFile,
  detectFileSignature
} from '../src/lib/api/validation';
import {
  IdempotencyManager,
  calculateSha256
} from '../src/lib/api/idempotency';
import {
  DurableJobQueue
} from '../src/lib/jobs/durable-job-queue';
import { InAppNotificationProvider } from '../src/lib/notifications/notification-provider';
import { sanitizeErrorMessage, getOrGenerateRequestId } from '../src/lib/api/response';
import { Matter } from '../src/types/matter';

describe('PROMPT 6: Production Durability, Storage RLS, Idempotency & Job Queue', () => {
  beforeEach(() => {
    IdempotencyManager.clearMemory();
    DurableJobQueue.clearMemory();
  });

  describe('1. Canonical Storage Path & Path Traversal Security', () => {
    it('constructs deterministic canonical storage path', () => {
      const path = buildDocumentStoragePath('user_123', 'matter_456', 'doc_789', 'rent_agreement.pdf');
      assert.strictEqual(path, 'user/user_123/matters/matter_456/documents/doc_789/rent_agreement.pdf');
    });

    it('parses and validates canonical storage path', () => {
      const path = 'user/u1/matters/m1/documents/d1/file.pdf';
      const parsed = parseAndValidateStoragePath(path);
      assert.strictEqual(parsed.userId, 'u1');
      assert.strictEqual(parsed.matterId, 'm1');
      assert.strictEqual(parsed.documentId, 'd1');
    });

    it('instantiates request-scoped storage provider with user token', () => {
      const provider = getStorageProvider('mock-jwt-token');
      assert.ok(provider);
      assert.strictEqual(typeof provider.uploadFile, 'function');
    });

    it('rejects directory traversal in path components', () => {
      assert.throws(() => {
        buildDocumentStoragePath('../user_123', 'matter_456', 'doc_789', 'notice.pdf');
      }, /Storage Path Violation/);

      assert.throws(() => {
        buildDocumentStoragePath('user_123', '../../matters', 'doc_789', 'notice.pdf');
      }, /Storage Path Violation/);

      assert.throws(() => {
        buildDocumentStoragePath('user_123', 'matter_456', '..\\traversal', 'notice.pdf');
      }, /Storage Path Violation/);
    });

    it('validates user ownership of storage path strictly', () => {
      const pathA = 'user/alice_id/matters/m1/documents/d1/file.pdf';
      assert.strictEqual(isStoragePathOwnedByUser(pathA, 'alice_id'), true);
      assert.strictEqual(isStoragePathOwnedByUser(pathA, 'bob_id'), false);
      assert.strictEqual(isStoragePathOwnedByUser('user/alice_id/../bob_id/file.pdf', 'alice_id'), false);
    });
  });

  describe('2. Recursive Storage Discovery & Purge', () => {
    it('discovers and deletes all nested matter and document files on user account purge', async () => {
      const storage = new LocalStorageProvider();
      
      // Upload multiple files across multiple matters
      await storage.uploadFile({
        buffer: Buffer.from('%PDF-1.4 test 1'),
        filename: 'lease.pdf',
        mimeType: 'application/pdf',
        matterId: 'matter_a',
        userId: 'user_target',
        documentId: 'doc_1'
      });

      await storage.uploadFile({
        buffer: Buffer.from('%PDF-1.4 test 2'),
        filename: 'notice.pdf',
        mimeType: 'application/pdf',
        matterId: 'matter_a',
        userId: 'user_target',
        documentId: 'doc_2'
      });

      await storage.uploadFile({
        buffer: Buffer.from('%PDF-1.4 test 3'),
        filename: 'receipt.pdf',
        mimeType: 'application/pdf',
        matterId: 'matter_b',
        userId: 'user_target',
        documentId: 'doc_3'
      });

      // Another user's file that must NOT be deleted
      await storage.uploadFile({
        buffer: Buffer.from('%PDF-1.4 other user file'),
        filename: 'safe.pdf',
        mimeType: 'application/pdf',
        matterId: 'matter_c',
        userId: 'user_retained',
        documentId: 'doc_other'
      });

      const purgeRes = await storage.deleteUserFiles('user_target');
      assert.strictEqual(purgeRes.discovered, 3);
      assert.strictEqual(purgeRes.deleted, 3);
      assert.strictEqual(purgeRes.failed, 0);
      assert.strictEqual(purgeRes.success, true);

      // Verify retained user file still exists
      const retainedPurge = await storage.deleteUserFiles('user_retained');
      assert.strictEqual(retainedPurge.discovered, 1);
    });
  });

  describe('3. Document Magic-Byte & Signature Validation', () => {
    it('detects genuine PDF magic bytes', () => {
      const pdfBuf = Buffer.from('%PDF-1.7 actual pdf stream');
      assert.strictEqual(detectFileSignature(pdfBuf), 'application/pdf');
    });

    it('detects HTML disguised as PDF and rejects it', () => {
      const htmlRenamedToPdf = Buffer.from('<!DOCTYPE html><html><body>malicious payload</body></html>');
      const detected = detectFileSignature(htmlRenamedToPdf);
      assert.strictEqual(detected, 'text/html');

      const val = validateDocumentFile({
        filename: 'agreement.pdf',
        mimeType: 'application/pdf',
        sizeBytes: htmlRenamedToPdf.length,
        buffer: htmlRenamedToPdf
      });

      assert.strictEqual(val.isValid, false);
      assert.ok(val.error?.includes('Arbitrary HTML bytes detected'));
    });

    it('rejects Word documents (.doc, .docx) with honest conversion instruction', () => {
      const valDoc = validateDocumentFile({
        filename: 'contract.docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        sizeBytes: 4096
      });

      assert.strictEqual(valDoc.isValid, false);
      assert.ok(valDoc.error?.includes('Word documents (.doc, .docx) are not supported'));
      assert.ok(valDoc.error?.includes('convert the agreement or notice to PDF'));
    });
  });

  describe('4. Idempotency Key Manager & SHA-256 Hashing', () => {
    it('calculates deterministic SHA-256 hash for document buffers', () => {
      const bufA = Buffer.from('Legal Rental Agreement Clause 15');
      const hashA1 = calculateSha256(bufA);
      const hashA2 = calculateSha256(bufA);
      assert.strictEqual(hashA1, hashA2);
      assert.strictEqual(hashA1.length, 64);
    });

    it('returns cached idempotent response on replay without side effects', async () => {
      const key = 'idem_test_key_123';
      const userId = 'user_99';
      const endpoint = '/api/matters';
      const originalResponse = { id: 'matter_created_1', title: 'Security Deposit Dispute' };

      // First call saves
      await IdempotencyManager.saveRecord(key, userId, endpoint, 201, originalResponse, 'req_hash_xyz');

      // Second call receives identical response
      const cached = await IdempotencyManager.getRecord(key, userId, endpoint);
      assert.ok(cached);
      assert.strictEqual(cached.responseStatus, 201);
      assert.deepStrictEqual(cached.responseBody, originalResponse);
    });
  });

  describe('5. Durable Background Job Queue & Concurrency-Safe Claiming', () => {
    it('enqueues job, claims atomically, updates progress and completes', async () => {
      const job = await DurableJobQueue.createJob(
        'deep_analysis',
        'matter_test_1',
        'user_test_1',
        { trigger: 'full' }
      );

      assert.strictEqual(job.status, 'queued');
      assert.strictEqual(job.progressPercent, 0);

      // Worker 1 claims job
      const claimed = await DurableJobQueue.claimJob('worker_alpha', ['deep_analysis']);
      assert.ok(claimed);
      assert.strictEqual(claimed.id, job.id);
      assert.strictEqual(claimed.status, 'processing');
      assert.strictEqual(claimed.attempts, 1);

      // Worker 2 attempts to claim - no available jobs
      const claimedSecond = await DurableJobQueue.claimJob('worker_beta', ['deep_analysis']);
      assert.strictEqual(claimedSecond, null);

      // Worker 1 updates progress
      await DurableJobQueue.updateProgress(job.id, 50, 'processing');
      const inFlight = await DurableJobQueue.getJob(job.id);
      assert.strictEqual(inFlight?.progressPercent, 50);

      // Worker 1 completes job
      await DurableJobQueue.completeJob(job.id, { outcome: 'ANALYSIS_COMPLETE', trustScore: 98 });
      const completed = await DurableJobQueue.getJob(job.id);
      assert.strictEqual(completed?.status, 'completed');
      assert.strictEqual(completed?.progressPercent, 100);
      assert.deepStrictEqual(completed?.result, { outcome: 'ANALYSIS_COMPLETE', trustScore: 98 });
    });
  });

  describe('6. Durable Notification State Machine & Delivery Truth', () => {
    it('persists in-app notification with explicit status sent', async () => {
      const provider = new InAppNotificationProvider();
      const res = await provider.send({
        matterId: 'matter_notif_1',
        userId: 'user_notif_1',
        type: 'deadline_approaching',
        title: 'Statutory Notice Due',
        message: 'Landlord response deadline expires in 3 days.'
      });

      assert.strictEqual(res.success, true);
      assert.strictEqual(res.status, 'sent');
      assert.ok(res.notificationId);

      const notifs = provider.getNotificationsForMatter('matter_notif_1');
      assert.strictEqual(notifs.length, 1);
      assert.strictEqual(notifs[0].title, 'Statutory Notice Due');
    });
  });

  describe('7. Standardized API Error Sanitization & Request ID', () => {
    it('generates valid request IDs and sanitizes internal SQL / PostgREST leaks', () => {
      const reqId = getOrGenerateRequestId();
      assert.ok(reqId.startsWith('req_'));

      // Raw Postgres syntax error leaked from driver
      const rawPgError = 'syntax error at or near "SELECT" relation "matters" does not exist';
      const sanitized = sanitizeErrorMessage(rawPgError);
      assert.ok(!sanitized.includes('syntax error'));
      assert.ok(!sanitized.includes('relation'));
      assert.ok(sanitized.includes('database operation failed'));

      // Filesystem path leak
      const rawPathError = 'Error: Cannot find module /Users/divyanshusinha/nyaysaathi/src/lib/private.ts';
      const sanitizedPath = sanitizeErrorMessage(rawPathError);
      assert.ok(!sanitizedPath.includes('/Users/'));
    });
  });

  describe('8. Scalable Storage Discovery & Purge (>100 files)', () => {
    it('discovers and deletes more than 100 files across multiple matters with pagination', async () => {
      const storage = new LocalStorageProvider();
      const targetUserId = 'user_bulk_delete';

      // Seed 110 files to exceed default page size
      const uploadPromises: Promise<unknown>[] = [];
      for (let i = 0; i < 110; i++) {
        uploadPromises.push(
          storage.uploadFile({
            buffer: Buffer.from(`%PDF-1.4 file content ${i}`),
            filename: `document_${i}.pdf`,
            mimeType: 'application/pdf',
            matterId: `matter_${Math.floor(i / 20)}`,
            userId: targetUserId,
            documentId: `doc_${i}`
          })
        );
      }
      await Promise.all(uploadPromises);

      const purgeRes = await storage.deleteUserFiles(targetUserId);
      assert.strictEqual(purgeRes.discovered, 110);
      assert.strictEqual(purgeRes.deleted, 110);
      assert.strictEqual(purgeRes.failed, 0);
      assert.strictEqual(purgeRes.success, true);

      // Verify idempotent second call finds 0 files
      const secondPurge = await storage.deleteUserFiles(targetUserId);
      assert.strictEqual(secondPurge.discovered, 0);
      assert.strictEqual(secondPurge.deleted, 0);
    });
  });

  describe('9. Concurrent Job Claiming & Stale Job Recovery', () => {
    it('guarantees only one worker can claim a job when two workers race concurrently', async () => {
      const job = await DurableJobQueue.createJob(
        'deep_analysis',
        'matter_race_1',
        'user_race_1',
        { prompt: 'test' }
      );

      // Two workers attempt to claim the job simultaneously
      const [claim1, claim2] = await Promise.all([
        DurableJobQueue.claimJob('worker_1', ['deep_analysis']),
        DurableJobQueue.claimJob('worker_2', ['deep_analysis'])
      ]);

      const claimedCount = [claim1, claim2].filter(c => c !== null).length;
      assert.strictEqual(claimedCount, 1, 'Only one worker must win the claim');

      const winningWorker = claim1 ? 'worker_1' : 'worker_2';
      const claimedJob = claim1 || claim2;
      assert.strictEqual(claimedJob?.id, job.id);
      assert.strictEqual(claimedJob?.lockedBy, winningWorker);
    });

    it('recovers stale processing jobs when lease expires', async () => {
      const job = await DurableJobQueue.createJob(
        'deep_analysis',
        'matter_stale_1',
        'user_stale_1',
        { prompt: 'stale test' }
      );

      // Worker 1 claims job
      const claimed = await DurableJobQueue.claimJob('worker_crash', ['deep_analysis']);
      assert.ok(claimed);
      assert.strictEqual(claimed.status, 'processing');

      // Fast forward time by recovering stale jobs with timeout 0
      const recovered = await DurableJobQueue.recoverStaleJobs(0);
      assert.ok(recovered >= 1);

      // Job should now be back in queued status with released lock
      const recoveredJob = await DurableJobQueue.getJob(job.id);
      assert.strictEqual(recoveredJob?.status, 'queued');
      assert.strictEqual(recoveredJob?.lockedBy, undefined);

      // Another worker can now claim it
      const secondClaim = await DurableJobQueue.claimJob('worker_survivor', ['deep_analysis']);
      assert.ok(secondClaim);
      assert.strictEqual(secondClaim.id, job.id);
      assert.strictEqual(secondClaim.lockedBy, 'worker_survivor');
    });
  });

  describe('10. Matter Service Multi-Tenant Isolation Security', () => {
    it('strictly isolates matters by userId without leak', async () => {
      const { getMatterService } = await import('../src/lib/repository');
      const matterService = getMatterService();

      const aliceMatter = await matterService.createMatter({
        userId: 'alice',
        title: 'Alice Security Deposit',
        category: 'tenancy_housing',
        userStory: 'Tenancy deposit dispute details'
      });

      const bobMatter = await matterService.createMatter({
        userId: 'bob',
        title: 'Bob Consumer Dispute',
        category: 'consumer_dispute',
        userStory: 'E-commerce dispute details'
      });

      // When listing matters for Alice, Bob's matter MUST NOT be returned
      const aliceMatters = await matterService.listMatters({ userId: 'alice' });
      assert.ok(aliceMatters.some(m => m.id === aliceMatter.id));
      assert.ok(!aliceMatters.some(m => m.id === bobMatter.id));

      // When listing matters for Bob, Alice's matter MUST NOT be returned
      const bobMatters = await matterService.listMatters({ userId: 'bob' });
      assert.ok(bobMatters.some(m => m.id === bobMatter.id));
      assert.ok(!bobMatters.some(m => m.id === aliceMatter.id));
    });
  });

  describe('11. GenAI Document & Clause Comparator (Problem Statement Alignment)', () => {
    it('compares agreement against notice and flags unilateral wear-and-tear deductions and forfeiture', async () => {
      const { DocumentComparator } = await import('../src/lib/legal/document-comparator');

      const agreementDoc = {
        id: 'doc_agree_1',
        title: 'Residential Tenancy Agreement',
        type: 'rental_agreement' as const,
        extractedText: 'Tenancy Deposit ₹50,000 paid. Normal wear and tear excepted. Landlord shall refund deposit within 15 days of peaceful handover of premises. 30 days notice required.',
        mimeType: 'application/pdf',
        sizeBytes: 1024,
        uploadedAt: new Date().toISOString(),
        status: 'verified' as const
      };

      const disputeNoticeDoc = {
        id: 'doc_notice_1',
        title: 'Landlord Deduction & Forfeiture Notice',
        type: 'notice_copy' as const,
        extractedText: 'We are withholding ₹45,000 for full house repainting, repair, and deep cleaning. Entire caution deposit is forfeited if tenant disputes. Required notice was 60 days.',
        mimeType: 'application/pdf',
        sizeBytes: 1024,
        uploadedAt: new Date().toISOString(),
        status: 'verified' as const
      };

      const comparison = DocumentComparator.compare(
        'matter_comp_1',
        agreementDoc,
        disputeNoticeDoc,
        'agreement_vs_notice'
      );

      assert.strictEqual(comparison.matterId, 'matter_comp_1');
      assert.ok(comparison.conflictingClausesCount >= 1, 'Must detect conflicting clauses');
      assert.ok(comparison.unilateralVariationsCount >= 1, 'Must detect unilateral forfeiture');
      assert.ok(comparison.overallAlignmentScore < 60, 'Discrepancy must reduce alignment score');
      assert.ok(comparison.statutoryProtectionsApplied.length >= 1);
      assert.ok(comparison.statutoryProtectionsApplied.some(s => s.includes('TPA') || s.includes('Wear and Tear')));

      // Verify plain language explanation is present
      const depositClause = comparison.clauseComparisons.find(c => c.clauseTitle.includes('Deposit'));
      assert.ok(depositClause);
      assert.strictEqual(depositClause.comparisonStatus, 'conflicting');
      assert.ok(depositClause.plainLanguageExplanation.length > 20);
      assert.ok(depositClause.actionableGuidance.includes('GST invoices'));
    });
  });

  describe('12. Legal Statutory vs Formal Notice Timelines', () => {
    it('preserves Section 138 NI Act mandatory 15-day statutory cure window', async () => {
      const { DeadlineEngine } = await import('../src/lib/deadlines/deadline-engine');

      const chequeMatter = {
        id: 'matter_cheque_1',
        title: 'Bounced Cheque Recovery',
        category: 'financial_cheque_bounce' as const,
        description: 'Cheque bounced for insufficient funds',
        status: 'open' as const,
        timeline: [],
        deadlines: [],
        communications: [
          {
            id: 'comm_1',
            type: 'legal_notice' as const,
            direction: 'outgoing' as const,
            status: 'sent' as const,
            title: 'Statutory Notice under Sec 138',
            createdAt: new Date().toISOString(),
            date: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const deadlines = DeadlineEngine.calculateDeadlines(chequeMatter as unknown as Matter);
      const noticeDeadline = deadlines.find(d => d.title.includes('15-Day'));
      assert.ok(noticeDeadline);
      assert.ok(noticeDeadline.title.includes('Sec 138 NI Act'));
      assert.ok(noticeDeadline.statuteBasis.includes('138(c)'));
    });

    it('labels tenancy deposit notice response window as formal demand, not unconditional statute', async () => {
      const { DeadlineEngine } = await import('../src/lib/deadlines/deadline-engine');

      const tenancyMatter = {
        id: 'matter_tenancy_1',
        title: 'Security Deposit Recovery',
        category: 'tenancy_security_deposit' as const,
        description: 'Unlawful withholding of security deposit',
        status: 'open' as const,
        timeline: [],
        deadlines: [],
        communications: [
          {
            id: 'comm_2',
            type: 'legal_notice' as const,
            direction: 'outgoing' as const,
            status: 'sent' as const,
            title: 'Formal Demand Notice',
            createdAt: new Date().toISOString(),
            date: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const deadlines = DeadlineEngine.calculateDeadlines(tenancyMatter as unknown as Matter);
      const noticeDeadline = deadlines.find(d => d.title.includes('15-Day'));
      assert.ok(noticeDeadline);
      assert.ok(!noticeDeadline.title.includes('Statutory'));
      assert.strictEqual(noticeDeadline.title, '15-Day Formal Notice Response & Cure Window');
    });
  });
});

