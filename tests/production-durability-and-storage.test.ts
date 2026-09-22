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
});
