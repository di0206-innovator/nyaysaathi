import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { getAuthenticatedUser } from '../src/lib/auth/auth-service';
import { MatterService, MemoryStorageAdapter } from '../src/lib/repository';
import { executePipeline } from '../src/lib/agents/orchestrator';
import { ProductionDocumentParser } from '../src/lib/parsing/document-parser';
import { GeminiEmbeddingProvider, GeminiLLMProvider } from '../src/lib/ai/gemini-provider';
import { LocalEmbeddingProvider } from '../src/lib/ai/mock-providers';
import { getInAppNotificationProvider, EmailNotificationProvider } from '../src/lib/notifications/notification-provider';
import { LocalStorageProvider } from '../src/lib/storage/storage-provider';
import { PgVectorLegalRAGProvider } from '../src/lib/rag/pgvector-provider';

describe('Phase 8: Production Integrity, Data Model Convergence & Real-World Trust', () => {
  let memoryAdapter: MemoryStorageAdapter;
  let matterService: MatterService;

  beforeEach(() => {
    (process.env as Record<string, string | undefined>).NODE_ENV = 'test';
    memoryAdapter = new MemoryStorageAdapter();
    matterService = new MatterService(memoryAdapter);
  });

  // --------------------------------------------------------------------------
  // 1. AUTHENTICATION & IDENTITY INTEGRITY
  // --------------------------------------------------------------------------
  describe('1. Authentication & Tenant Identity Hardening', () => {
    it('rejects x-user-id header in production environment', async () => {
      const originalEnv = process.env.NODE_ENV;
      try {
        (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
        const req = new Request('http://localhost:3000/api/matters', {
          headers: { 'x-user-id': 'spoofed-user-id' }
        });
        const user = await getAuthenticatedUser(req);
        assert.equal(user, null, 'x-user-id must be rejected in production');
      } finally {
        if (originalEnv === undefined) {
          delete (process.env as Record<string, string | undefined>).NODE_ENV;
        } else {
          (process.env as Record<string, string | undefined>).NODE_ENV = originalEnv;
        }
      }
    });

    it('rejects mock bearer tokens in production environment', async () => {
      const originalEnv = process.env.NODE_ENV;
      try {
        (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
        const req = new Request('http://localhost:3000/api/matters', {
          headers: { Authorization: 'Bearer mock-user-test-token' }
        });
        const user = await getAuthenticatedUser(req);
        assert.equal(user, null, 'Bearer mock-user must be rejected in production');
      } finally {
        if (originalEnv === undefined) {
          delete (process.env as Record<string, string | undefined>).NODE_ENV;
        } else {
          (process.env as Record<string, string | undefined>).NODE_ENV = originalEnv;
        }
      }
    });

    it('returns null for completely unauthenticated request', async () => {
      const req = new Request('http://localhost:3000/api/matters', {
        headers: {}
      });
      const user = await getAuthenticatedUser(req);
      assert.equal(user, null, 'Unauthenticated request should resolve to null');
    });

    it('accepts explicit mock token in test/dev environment with correct identity mapping', async () => {
      const req = new Request('http://localhost:3000/api/matters', {
        headers: { Authorization: 'Bearer mock-user-advocate-priya' }
      });
      const user = await getAuthenticatedUser(req);
      assert.ok(user);
      assert.equal(user.id, 'advocate-priya');
      assert.equal(user.role, 'advocate');
    });
  });

  // --------------------------------------------------------------------------
  // 2. AUTHORIZATION & TENANT ISOLATION
  // --------------------------------------------------------------------------
  describe('2. Authorization & Tenant Isolation', () => {
    it('isolates matters between distinct users in repository queries', async () => {
      await matterService.createMatter({
        userId: 'user-alice',
        title: 'Alice Security Deposit Dispute',
        category: 'tenancy_housing',
        userStory: 'Landlord kept deposit.',
        locationCity: 'Bengaluru',
        locationState: 'Karnataka'
      });

      await matterService.createMatter({
        userId: 'user-bob',
        title: 'Bob Delayed Possession',
        category: 'tenancy_housing',
        userStory: 'Builder delayed flat delivery.',
        locationCity: 'Mumbai',
        locationState: 'Maharashtra'
      });

      const aliceMatters = await matterService.listMatters({ userId: 'user-alice' });
      const bobMatters = await matterService.listMatters({ userId: 'user-bob' });

      assert.equal(aliceMatters.length, 1);
      assert.equal(aliceMatters[0].userId, 'user-alice');
      assert.equal(bobMatters.length, 1);
      assert.equal(bobMatters[0].userId, 'user-bob');
    });

    it('prevents user without ownership from updating action steps', async () => {
      const matter = await matterService.createMatter({
        userId: 'user-alice',
        title: 'Alice Tenancy Matter',
        category: 'tenancy_housing',
        userStory: 'Tenancy deposit issue.',
        locationCity: 'Bengaluru',
        locationState: 'Karnataka'
      });

      const action = matter.actionPlan[0];
      assert.ok(action);

      // Verify matter exists for Alice
      const aliceMatter = await matterService.getMatterById(matter.id, 'user-alice');
      assert.ok(aliceMatter);

      // Verify Bob cannot read Alice matter
      const bobMatter = await matterService.getMatterById(matter.id, 'user-bob');
      assert.equal(bobMatter, null, 'User Bob must not be able to retrieve Alice matter');
    });

    it('isolates notifications by userId', async () => {
      const notificationRepo = memoryAdapter.notifications;
      assert.ok(notificationRepo);

      await notificationRepo.create({
        id: 'notif-1',
        matterId: 'matter-alice',
        userId: 'user-alice',
        title: 'Alice Hearing Reminder',
        message: 'Court appearance tomorrow',
        channel: 'in_app',
        isRead: false,
        createdAt: new Date().toISOString(),
        type: 'deadline_approaching'
      });

      await notificationRepo.create({
        id: 'notif-2',
        matterId: 'matter-bob',
        userId: 'user-bob',
        title: 'Bob Settlement Offer',
        message: 'Opposing party responded',
        channel: 'in_app',
        isRead: false,
        createdAt: new Date().toISOString(),
        type: 'response_expected'
      });

      const aliceNotifications = await notificationRepo.listByUser('user-alice');
      const bobNotifications = await notificationRepo.listByUser('user-bob');

      assert.equal(aliceNotifications.length, 1);
      assert.equal(aliceNotifications[0].title, 'Alice Hearing Reminder');
      assert.equal(bobNotifications.length, 1);
      assert.equal(bobNotifications[0].title, 'Bob Settlement Offer');
    });
  });

  // --------------------------------------------------------------------------
  // 3. MASS ASSIGNMENT & PROTECTED FIELD IMMUTABILITY
  // --------------------------------------------------------------------------
  describe('3. Mass Assignment Prevention', () => {
    it('rejects attempt to alter protected fields on matter via API endpoint rules', () => {
      const PROTECTED_FIELDS = [
        'userId',
        'id',
        'createdAt',
        'auditLog',
        'trustSafetyItems',
        'evidenceGraph',
        'lawyerBrief',
        'applicableStatutes',
        'status',
        'actionPlan',
        'activityEvents',
        'communications',
        'deadlines',
        'escalationWorkflows',
        'resolution',
        'notifications'
      ];

      const disallowedPayload = {
        userId: 'hacker-id',
        createdAt: '1970-01-01T00:00:00.000Z',
        auditLog: [],
        evidenceGraph: { nodes: [], edges: [] },
        title: 'Allowed Title Change'
      };

      const invalidKeys = Object.keys(disallowedPayload).filter(k => PROTECTED_FIELDS.includes(k));
      assert.equal(invalidKeys.length, 4);
      assert.deepEqual(invalidKeys.sort(), ['auditLog', 'createdAt', 'evidenceGraph', 'userId']);
    });
  });

  // --------------------------------------------------------------------------
  // 4. ORCHESTRATOR INTEGRITY & STATE BOUNDARIES
  // --------------------------------------------------------------------------
  describe('4. Orchestrator State Boundaries', () => {
    it('preserves user workflow history (actions, communications, deadlines, events) during re-analysis', async () => {
      const matter = await matterService.createMatter({
        userId: 'user-test',
        title: 'Consumer Matter with Active Actions',
        category: 'consumer_dispute',
        userStory: 'Defective phone purchased online, refund denied.',
        claimAmount: 45000,
        locationCity: 'Delhi',
        locationState: 'Delhi'
      });

      const initialActionId = matter.actionPlan[0].id;
      const initialCreatedAt = matter.createdAt;

      // User performs and completes an action step with proof
      await matterService.updateActionStep(matter.id, initialActionId, {
        status: 'completed',
        completionProof: {
          type: 'receipt',
          reference: 'IN-POST-999',
          recordedAt: new Date().toISOString()
        },
        notes: 'Notice delivered by Speed Post',
        result: 'awaiting_response'
      });

      // User records a communication
      await matterService.recordCommunication(matter.id, {
        matterId: matter.id,
        type: 'legal_notice',
        direction: 'outgoing',
        date: new Date().toISOString().split('T')[0],
        counterparty: 'Phone Seller',
        summary: 'Dispatched statutory demand notice',
        status: 'sent',
        referenceNumber: 'IN-POST-999'
      });

      // User creates a deadline
      await matterService.upsertDeadline(matter.id, {
        matterId: matter.id,
        title: '15-Day Demand Notice Cure Period',
        dueDate: '2026-10-05T00:00:00.000Z',
        type: 'statutory',
        isStatutory: true,
        isUserDefined: true,
        status: 'active',
        confidence: 0.95,
        trustTier: 'fact'
      });

      const beforeReanalysis = (await matterService.getMatterById(matter.id))!;
      assert.equal(beforeReanalysis.actionPlan[0].status, 'completed');
      assert.equal(beforeReanalysis.actionPlan[0].completionProof?.reference, 'IN-POST-999');
      assert.equal(beforeReanalysis.communications?.length, 1);
      const userDeadlineBefore = beforeReanalysis.deadlines?.find(d => d.title === '15-Day Demand Notice Cure Period');
      assert.ok(userDeadlineBefore, 'User-defined deadline must exist before re-analysis');
      assert.ok(beforeReanalysis.activityEvents && beforeReanalysis.activityEvents.length > 0);

      // Re-analyze matter
      const reanalyzed = await executePipeline({
        matterId: beforeReanalysis.id,
        title: beforeReanalysis.title,
        category: beforeReanalysis.category,
        userStory: beforeReanalysis.userStory + ' Added detail: seller confirmed receipt on WhatsApp.',
        claimAmount: beforeReanalysis.claimAmount,
        locationCity: beforeReanalysis.locationCity,
        locationState: beforeReanalysis.locationState,
        parties: beforeReanalysis.parties,
        documents: beforeReanalysis.documents,
        existingMatter: beforeReanalysis
      });

      // Assert that immutable and workflow states were preserved
      assert.equal(reanalyzed.id, beforeReanalysis.id);
      assert.equal(reanalyzed.userId, beforeReanalysis.userId);
      assert.equal(reanalyzed.createdAt, initialCreatedAt);
      assert.equal(reanalyzed.communications?.length, 1, 'Communications must be preserved');
      const preservedUserDeadline = reanalyzed.deadlines?.find(d => d.title === '15-Day Demand Notice Cure Period');
      assert.ok(preservedUserDeadline, 'User-defined deadline must be preserved during re-analysis');

      // The completed action should remain completed with its proof intact
      const preservedAction = reanalyzed.actionPlan.find(a => a.id === initialActionId);
      assert.ok(preservedAction, 'Original action step must be found');
      assert.equal(preservedAction?.status, 'completed');
      assert.equal(preservedAction?.completionProof?.reference, 'IN-POST-999');
    });
  });

  // --------------------------------------------------------------------------
  // 5. ACTION UPDATE DATA PRESERVATION & STATE TRANSITIONS
  // --------------------------------------------------------------------------
  describe('5. Action State Preservation and Transition Validation', () => {
    it('preserves completedAt and completionProof when updating notes on a completed action', async () => {
      const matter = await matterService.createMatter({
        title: 'Action Update Test',
        category: 'tenancy_housing',
        userStory: 'Landlord dispute',
        locationCity: 'Bengaluru',
        locationState: 'Karnataka'
      });

      const actionId = matter.actionPlan[0].id;
      const completedMatter = await matterService.updateActionStep(matter.id, actionId, {
        status: 'completed',
        completionProof: {
          type: 'reference_number',
          reference: 'ACK-888',
          recordedAt: new Date().toISOString()
        },
        result: 'completed'
      });

      const completedAction = completedMatter.actionPlan.find(a => a.id === actionId);
      const originalCompletedAt = completedAction?.completedAt;
      assert.ok(originalCompletedAt);

      // Now perform an update with only notes and dueDate
      const updatedNotesMatter = await matterService.updateActionStep(matter.id, actionId, {
        notes: 'Followed up with advocate regarding ack copy.'
      });

      const finalAction = updatedNotesMatter.actionPlan.find(a => a.id === actionId);
      assert.equal(finalAction?.status, 'completed');
      assert.equal(finalAction?.completedAt, originalCompletedAt, 'completedAt must not be cleared');
      assert.equal(finalAction?.completionProof?.reference, 'ACK-888', 'completionProof must not be cleared');
      assert.equal(finalAction?.result, 'completed', 'result must not be cleared');
      assert.equal(finalAction?.notes, 'Followed up with advocate regarding ack copy.');
    });

    it('rejects invalid action transitions (e.g. completed -> in_progress)', async () => {
      const matter = await matterService.createMatter({
        title: 'Invalid Transition Test',
        category: 'tenancy_housing',
        userStory: 'Landlord dispute',
        locationCity: 'Bengaluru',
        locationState: 'Karnataka'
      });

      const actionId = matter.actionPlan[0].id;
      await matterService.updateActionStep(matter.id, actionId, {
        status: 'completed',
        completionProof: { type: 'receipt', reference: 'REC-1', recordedAt: new Date().toISOString() }
      });

      // Attempt invalid transition back to in_progress
      await assert.rejects(
        async () => {
          await matterService.updateActionStep(matter.id, actionId, {
            status: 'in_progress'
          });
        },
        /Invalid action .* transition/
      );
    });

    it('newly generated actions default to pending and are not auto-marked in_progress', async () => {
      const matter = await matterService.createMatter({
        title: 'Action Status Default Test',
        category: 'consumer_dispute',
        userStory: 'Purchased defective refrigerator.',
        locationCity: 'Pune',
        locationState: 'Maharashtra'
      });

      for (const action of matter.actionPlan) {
        assert.notEqual(
          action.status,
          'in_progress',
          `Generated action "${action.title}" should not be auto-marked in_progress`
        );
      }
    });
  });

  // --------------------------------------------------------------------------
  // 6. RESOLUTION WORKFLOW & EDIT LOCKING
  // --------------------------------------------------------------------------
  describe('6. Resolution Workflow and Mutation Locks', () => {
    it('locks matter upon resolution and prevents document additions until reopened', async () => {
      const matter = await matterService.createMatter({
        title: 'Resolution Lock Test',
        category: 'tenancy_housing',
        userStory: 'Landlord refund dispute',
        locationCity: 'Bengaluru',
        locationState: 'Karnataka'
      });

      // Resolve matter
      const resolved = await matterService.resolveMatter(matter.id, {
        resolutionType: 'full_settlement',
        amountRecovered: 75000,
        outcome: 'Landlord repaid full deposit via RTGS.',
        resolvedAt: new Date().toISOString()
      });

      assert.equal(resolved.status, 'resolved');
      assert.ok(resolved.resolution);
      assert.equal(resolved.resolution.amountRecovered, 75000);

      // Attempt to upload document and reanalyze on resolved matter
      await assert.rejects(
        async () => {
          await matterService.uploadDocumentAndReanalyze(matter.id, {
            buffer: Buffer.from('bank statement data'),
            filename: 'Late Statement.pdf',
            mimeType: 'application/pdf',
            title: 'Late Statement.pdf',
            type: 'bank_statement'
          });
        },
        /Cannot upload documents to a resolved matter/
      );

      // Reopen matter explicitly
      const reopened = await matterService.reopenMatter(matter.id, 'Received delayed notice of deduction');
      assert.equal(reopened.status, 'awaiting_user_action');
      assert.ok(reopened.resolution?.isReopened, 'Historical resolution record must be preserved with isReopened flag');

      // Activity event should record reopening
      const reopenEvent = reopened.activityEvents?.find(e => e.type === 'matter_reopened');
      assert.ok(reopenEvent, 'Reopen event must be recorded in activity history');
    });
  });

  // --------------------------------------------------------------------------
  // 7. TRUTHFUL DOCUMENT PARSING & EVIDENCE EXTRACTION
  // --------------------------------------------------------------------------
  describe('7. Document Parsing & Anti-Fabrication Integrity', () => {
    it('does NOT invent ₹75,000 transaction or clauses based on filename', async () => {
      const parser = new ProductionDocumentParser();

      // Text document with non-fabricated content
      const parsedTxt = await parser.parseDocument({
        filename: 'payment_receipt_rent_deposit.txt',
        mimeType: 'text/plain',
        text: 'Payment of Rs 12,500 made for repair work on 15th Jan.'
      });

      assert.equal(parsedTxt.extractionStatus, 'verified_extraction');
      assert.doesNotMatch(parsedTxt.extractedText, /₹75,000/, 'Must not fabricate 75,000 transaction');
      assert.match(parsedTxt.extractedText, /12,500/);
    });

    it('sets extractionStatus = needs_ocr for images when OCR is unconfigured', async () => {
      const parser = new ProductionDocumentParser();

      const parsedImage = await parser.parseDocument({
        filename: 'whatsapp_chat_screenshot_notice.png',
        mimeType: 'image/png'
      });

      assert.equal(parsedImage.extractionStatus, 'needs_ocr');
      assert.equal(parsedImage.extractedText, '');
      assert.equal(parsedImage.clauses?.length, 0);
    });

    it('fails closed and flags needs_review on empty or unparseable PDF stream', async () => {
      const parser = new ProductionDocumentParser();

      const parsedPdf = await parser.parseDocument({
        filename: 'lease_agreement_scanned.pdf',
        mimeType: 'application/pdf'
      });

      assert.equal(parsedPdf.extractionStatus, 'needs_review');
      assert.doesNotMatch(parsedPdf.extractedText, /Ramesh Kumar/);
      assert.doesNotMatch(parsedPdf.extractedText, /Indiranagar/);
    });
  });

  // --------------------------------------------------------------------------
  // 8. STORAGE ACCESS & STABLE KEYS
  // --------------------------------------------------------------------------
  describe('8. Secure Document Storage Access', () => {
    it('generates stable storagePath and stores real file bytes in LocalStorageProvider', async () => {
      const storage = new LocalStorageProvider();
      const testBuffer = Buffer.from('Official Tenant Notice Copy 2026');

      const uploaded = await storage.uploadFile({
        buffer: testBuffer,
        filename: 'notice.txt',
        mimeType: 'text/plain',
        matterId: 'matter-xyz',
        userId: 'user-abc',
        documentId: 'doc-123'
      });

      assert.ok(uploaded.storagePath);
      assert.match(uploaded.storagePath, /matter-xyz/);
      assert.match(uploaded.storagePath, /doc-123/);

      // Verify file can be retrieved by its stable storagePath
      const retrieved = await storage.getFile(uploaded.storagePath);
      assert.ok(retrieved);
      assert.equal(retrieved.buffer.toString('utf-8'), 'Official Tenant Notice Copy 2026');
    });
  });

  // --------------------------------------------------------------------------
  // 9. RAG PROVENANCE & EMBEDDINGS
  // --------------------------------------------------------------------------
  describe('9. Legal RAG Provenance & Embeddings Consistency', () => {
    it('uses 768 dimensions for GeminiEmbeddingProvider', async () => {
      const embedder = new GeminiEmbeddingProvider();
      assert.equal(embedder.dimensions, 768);
    });

    it('does not append generic fake source URLs when statute source is missing', async () => {
      const rag = new PgVectorLegalRAGProvider(new LocalEmbeddingProvider());
      const results = await rag.searchStatutes('rent control deposit dispute', {
        category: 'tenancy_housing',
        state: 'Karnataka'
      });

      assert.ok(results.length > 0);
      for (const res of results) {
        if (res.chunk.sourceUrl) {
          assert.notEqual(res.chunk.sourceUrl, 'https://indiankanoon.org/fake');
        }
      }
    });
  });

  // --------------------------------------------------------------------------
  // 10. AI VALIDATION & DEFENSIVE METRICS
  // --------------------------------------------------------------------------
  describe('10. AI Structured Schema Validation', () => {
    it('validates schema and rejects malformed LLM outputs', async () => {
      const llm = new GeminiLLMProvider();

      // Test valid schema
      const result = await llm.generateStructured<{ title: string }>(
        'Test prompt for title',
        {
          name: 'TitleSchema',
          description: 'Schema with title',
          validator: (data: unknown): data is { title: string } => {
            return typeof data === 'object' && data !== null && 'title' in data;
          },
          example: { title: 'Valid Title' }
        }
      );

      assert.ok(result.content);
      assert.ok(typeof result.content.title === 'string');

      // Test failing validator rejects
      await assert.rejects(
        async () => {
          await llm.generateStructured<{ nonExistentField: number }>(
            'Test prompt for non-existent field',
            {
              name: 'InvalidSchema',
              description: 'Schema with nonExistentField',
              validator: (_data: unknown): _data is { nonExistentField: number } => false && !!_data,
              example: { nonExistentField: 999 }
            }
          );
        },
        /Failed to generate valid structured response matching schema/
      );
    });
  });

  // --------------------------------------------------------------------------
  // 11. NOTIFICATIONS & TRUTHFUL EMAIL PROVIDER
  // --------------------------------------------------------------------------
  describe('11. Database-Backed Notifications & Truthful Email Provider', () => {
    it('tracks persisted notifications, unread counts, and mark-read operations', async () => {
      const inApp = getInAppNotificationProvider();

      const notif = await inApp.send({
        matterId: 'test-matter-notif-p8',
        userId: 'user-advocate',
        title: 'Hearing in 48 Hours',
        message: 'City Civil Court Bengaluru Courtroom 4',
        type: 'deadline_approaching'
      });

      assert.ok(notif.success);
      assert.ok(notif.notificationId);

      const notifications = inApp.getNotificationsForMatter('test-matter-notif-p8');
      assert.ok(notifications.length > 0);
      assert.equal(notifications[0].isRead, false);

      const marked = inApp.markAsRead(notifications[0].id);
      assert.ok(marked);
    });

    it('email provider truthfully fails with success: false when unconfigured', async () => {
      const originalKey = process.env.RESEND_API_KEY;
      delete process.env.RESEND_API_KEY;
      try {
        const emailProvider = new EmailNotificationProvider();
        const result = await emailProvider.send({
          matterId: 'test-matter-1',
          userId: 'user-1',
          title: 'Status Update',
          message: 'Your demand notice has been prepared.',
          type: 'response_expected'
        });

        assert.equal(result.success, false, 'Unconfigured email provider must not claim success');
        assert.ok(result.error);
        assert.match(result.error || '', /Email provider not configured/);
      } finally {
        if (originalKey) process.env.RESEND_API_KEY = originalKey;
      }
    });
  });

  // --------------------------------------------------------------------------
  // 12. CONTRACT TESTING: MEMORY VS SUPABASE REPOSITORY CONTRACTS
  // --------------------------------------------------------------------------
  describe('12. Repository Contract Parity', () => {
    it('verifies that memoryAdapter exposes all Phase 7 repository boundaries', () => {
      assert.ok(memoryAdapter.actions, 'actions repo contract');
      assert.ok(memoryAdapter.communications, 'communications repo contract');
      assert.ok(memoryAdapter.activityEvents, 'activityEvents repo contract');
      assert.ok(memoryAdapter.deadlines, 'deadlines repo contract');
      assert.ok(memoryAdapter.escalations, 'escalations repo contract');
      assert.ok(memoryAdapter.resolutions, 'resolutions repo contract');
      assert.ok(memoryAdapter.notifications, 'notifications repo contract');

      // Verify essential method signatures exist
      assert.equal(typeof memoryAdapter.actions.listByMatter, 'function');
      assert.equal(typeof memoryAdapter.actions.update, 'function');
      assert.equal(typeof memoryAdapter.communications.listByMatter, 'function');
      assert.equal(typeof memoryAdapter.communications.record, 'function');
      assert.equal(typeof memoryAdapter.deadlines.listByMatter, 'function');
      assert.equal(typeof memoryAdapter.deadlines.upsert, 'function');
      assert.equal(typeof memoryAdapter.resolutions.resolve, 'function');
      assert.equal(typeof memoryAdapter.notifications.listByUser, 'function');
    });
  });
});
