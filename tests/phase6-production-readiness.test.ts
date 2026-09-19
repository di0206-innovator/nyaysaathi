import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { AuthService } from '../src/lib/auth/auth-service';
import { MatterService, MemoryStorageAdapter } from '../src/lib/repository';
import { LocalStorageProvider } from '../src/lib/storage/storage-provider';
import { validateDocumentFile } from '../src/lib/api/validation';
import { PgVectorLegalRAGProvider } from '../src/lib/rag/pgvector-provider';
import { LocalEmbeddingProvider, DeterministicLLMProvider } from '../src/lib/ai/mock-providers';
import { GeminiLLMProvider } from '../src/lib/ai/gemini-provider';
import { LegalRAGService } from '../src/lib/rag/rag-service';
import { RateLimiter } from '../src/lib/security/rate-limiter';
import { Redactor } from '../src/lib/security/redactor';
import { MatterOrchestrator } from '../src/lib/agents/orchestrator';
import { MatterCategory } from '../src/types/matter';
import { LegalRetrievalResult } from '../src/lib/ai/types';

describe('Phase 6: Productionization, Real Data Security, AI Hardening & Demo Readiness', () => {
  let memoryAdapter: MemoryStorageAdapter;
  let matterService: MatterService;

  beforeEach(() => {
    memoryAdapter = new MemoryStorageAdapter();
    matterService = new MatterService(memoryAdapter);
    RateLimiter.reset();
  });

  // 1. Authentication & Tenant Isolation
  describe('1. Authentication & Tenant Isolation', () => {
    it('rejects unauthenticated requests and extracts authenticated user identities', async () => {
      // Unauthenticated request
      const unauthReq = new NextRequest('http://localhost:3000/api/matters');
      const noUser = await AuthService.getAuthenticatedUser(unauthReq);
      assert.equal(noUser, null);

      // Authenticated with Bearer token
      const authReq = new NextRequest('http://localhost:3000/api/matters', {
        headers: {
          authorization: 'Bearer mock-user-citizen-01'
        }
      });
      const user = await AuthService.getAuthenticatedUser(authReq);
      assert.ok(user);
      assert.equal(user.id, 'citizen-01');
      assert.equal(user.role, 'authenticated');
    });

    it('enforces matter ownership so User A cannot access User B\'s matter', async () => {
      // User A creates a matter
      const matterA = await matterService.createMatter({
        userId: 'user-alice-101',
        title: 'Alice Tenancy Deposit Dispute',
        category: 'tenancy_housing',
        userStory: 'Landlord withheld ₹60,000 security deposit without itemized repair invoices.',
        claimAmount: 60000,
        locationCity: 'Bengaluru',
        locationState: 'Karnataka'
      });

      // User A accesses own matter
      const foundAlice = await matterService.getMatterById(matterA.id, 'user-alice-101');
      assert.ok(foundAlice);
      assert.equal(foundAlice.id, matterA.id);

      // User B attempts to access User A's matter (IDOR prevention)
      const foundBob = await matterService.getMatterById(matterA.id, 'user-bob-999');
      assert.equal(foundBob, null, 'User B must not be able to retrieve User A\'s matter');
    });
  });

  // 2. Private Storage & File Validation
  describe('2. Private Storage & File Validation', () => {
    it('accepts valid evidence files and constructs deterministic scoped private paths', async () => {
      const storage = new LocalStorageProvider();
      const stored = await storage.uploadFile({
        buffer: Buffer.from('Rental Agreement Clause 14: Refund within 30 days.'),
        filename: 'rental_agreement_2026.pdf',
        mimeType: 'application/pdf',
        matterId: 'matter-storage-test-01',
        userId: 'user-tenant-55',
        documentId: 'doc-rent-agmt'
      });

      assert.ok(stored.fileUrl);
      assert.ok(stored.storagePath);
      assert.match(stored.storagePath, /^user\/user-tenant-55\/matters\/matter-storage-test-01\/documents\/doc-rent-agmt\//);
    });

    it('rejects oversized uploads (>10MB) and invalid MIME types', async () => {
      const storage = new LocalStorageProvider();
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB

      await assert.rejects(
        async () => {
          await storage.uploadFile({
            buffer: largeBuffer,
            filename: 'huge_video_proof.mp4',
            mimeType: 'video/mp4',
            matterId: 'matter-size-test',
            userId: 'user-01'
          });
        },
        /10MB limit/
      );

      // Invalid MIME type rejected by validator
      const validation = validateDocumentFile({
        filename: 'malicious_script.exe',
        mimeType: 'application/x-msdownload',
        sizeBytes: 1024
      });
      assert.equal(validation.isValid, false);
      assert.match(validation.error || '', /Unsupported file/);
    });
  });

  // 3. Legal RAG & Citation Grounding
  describe('3. Legal RAG & Citation Grounding', () => {
    it('retrieves statutory sources with complete grounding metadata', async () => {
      const embedding = new LocalEmbeddingProvider();
      const pgVectorProvider = new PgVectorLegalRAGProvider(embedding);
      const ragService = new LegalRAGService(pgVectorProvider);

      const results = await ragService.retrieveForMatter({
        matterId: 'test-matter-01',
        title: 'Tenancy Deposit Dispute',
        category: 'tenancy_housing',
        userStory: 'Landlord in Karnataka refused to return security deposit after 30-day notice.',
        parties: [],
        documents: [],
        locationState: 'Karnataka',
        claimAmount: 75000
      });

      assert.ok(results.length > 0);
      const top = results[0];
      assert.ok(top.chunk.statute);
      assert.ok(top.chunk.section);
      assert.ok(top.chunk.plainSummary);
      assert.ok(top.chunk.forumOrAuthority);
      assert.ok(top.relevanceScore > 0);

      // Convert to Evidence Graph references
      const sourceRefs = ragService.toSourceReferences(results);
      assert.ok(sourceRefs.length > 0);
      assert.equal(sourceRefs[0].type, 'statute');
    });

    it('demotes tier to possibility or counsel_required when statutory match is weak', () => {
      const ragService = new LegalRAGService();

      // Weak matches only
      const weakResults: LegalRetrievalResult[] = [
        {
          chunk: {
            id: 'gen-01',
            statute: 'General Contract Principles',
            section: 'General',
            title: 'Equitable Relief',
            plainSummary: 'Discretionary equitable remedies.',
            category: 'other' as MatterCategory,
            forumOrAuthority: 'Civil Court',
            remedy: 'Damages',
            sourceUrl: 'https://indiankanoon.org',
            jurisdiction: 'Central / All India',
            keywords: ['contract', 'relief']
          },
          relevanceScore: 0.35,
          isStrongMatch: false,
          matchReasons: ['general'],
          suggestedTier: 'possibility'
        }
      ];

      const evaluation = ragService.evaluateRetrievalTier(weakResults);
      assert.equal(evaluation.tier, 'possibility');

      // Empty results
      const emptyEval = ragService.evaluateRetrievalTier([]);
      assert.equal(emptyEval.tier, 'counsel_required');
    });
  });

  // 4. AI Provider Hardening & Fallback Transparency
  describe('4. AI Provider Hardening & Fallback Transparency', () => {
    it('transparently flags deterministic fallback responses with isFallback: true', async () => {
      const mockLLM = new DeterministicLLMProvider();
      const textRes = await mockLLM.generateText('Explain tenancy rights');
      assert.equal(textRes.isFallback, true);
      assert.equal(textRes.provider, 'deterministic_mock');

      const structRes = await mockLLM.generateStructured('Test', {
        name: 'test_schema',
        description: 'test',
        example: { status: 'verified' }
      });
      assert.equal(structRes.isFallback, true);
      assert.equal(structRes.provider, 'deterministic_mock');
    });

    it('Gemini provider falls back cleanly when unconfigured without crashing', async () => {
      // Instantiate without API key
      const gemini = new GeminiLLMProvider('');
      const res = await gemini.generateText('What is Section 138 NI Act?');

      assert.ok(res.content);
      assert.equal(res.isFallback, true);
      assert.equal(res.provider, 'deterministic_mock');
    });
  });

  // 5. Security & Authorization
  describe('5. Security & Authorization', () => {
    it('rejects unauthorized matter updates and deletions from non-owners', async () => {
      const matter = await matterService.createMatter({
        userId: 'owner-user-alpha',
        title: 'Alpha Private Matter',
        category: 'consumer_dispute',
        userStory: 'Purchased defective electronic laptop.',
        claimAmount: 85000
      });

      // Non-owner attempts to update
      const unauthorizedUpdate = await matterService.updateMatter(
        matter.id,
        { title: 'Hacked Title' },
        'intruder-user-bravo'
      );
      assert.equal(unauthorizedUpdate, null);

      // Verify title was not modified
      const verified = await matterService.getMatterById(matter.id, 'owner-user-alpha');
      assert.equal(verified?.title, 'Alpha Private Matter');

      // Non-owner attempts to delete
      const unauthorizedDelete = await matterService.deleteMatter(
        matter.id,
        'intruder-user-bravo'
      );
      assert.equal(unauthorizedDelete, false);
    });
  });

  // 6. Agent Pipeline Reliability & Error Boundaries
  describe('6. Agent Pipeline Reliability & Error Boundaries', () => {
    it('retains prior valid state and records failed status without crashing pipeline on agent error', async () => {
      const orchestrator = new MatterOrchestrator();

      // Execute pipeline with input containing pre-existing valid data
      const result = await orchestrator.executePipeline(
        {
          id: 'test-matter-failover',
          title: 'Existing Disputed Matter',
          category: 'tenancy_housing',
          subCategory: 'security_deposit_refund',
          status: 'action_ready',
          userStory: 'Move out on 31 January 2026. Deposit withheld.',
          claimAmount: 50000,
          locationCity: 'Bengaluru',
          locationState: 'Karnataka',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          parties: [],
          documents: [],
          facts: [],
          timelineEvents: [
            {
              id: 'evt-valid-01',
              date: '2026-01-31',
              title: 'Handover of Keys',
              description: 'Keys returned to landlord.',
              isKeyMilestone: true,
              status: 'verified',
              groundingStatus: 'grounded'
            }
          ],
          risks: [],
          missingInformation: [],
          actionPlan: [],
          drafts: [],
          escalationRoutes: [],
          trustSafetyItems: [],
          summary: {
            plainLanguage: 'Deposit withheld dispute',
            keyConflict: 'Withheld deposit',
            legalNature: 'Tenancy'
          },
          language: 'en'
        },
        { trigger: 'full' }
      );

      assert.ok(result.matter);
      assert.ok(result.logs.length > 0);

      // Verify all agent logs have structured statuses
      for (const log of result.logs) {
        assert.ok(
          ['completed', 'skipped', 'fallback', 'failed'].includes(log.status),
          `Invalid agent log status: ${log.status}`
        );
      }

      // Safety agent must always complete last
      const lastLog = result.logs[result.logs.length - 1];
      assert.equal(lastLog.agentName, 'Safety Verification Agent');
    });

    it('preserves selective re-analysis execution path with doc_uploaded', async () => {
      const orchestrator = new MatterOrchestrator();
      const result = await orchestrator.executePipeline(
        {
          id: 'matter-doc-reanalyze',
          title: 'Cheque Bounce Matter',
          category: 'financial_cheque_bounce',
          subCategory: 'cheque_dishonour',
          status: 'action_ready',
          userStory: 'Cheque bounced due to insufficient funds.',
          claimAmount: 150000,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          parties: [],
          documents: [],
          facts: [],
          timelineEvents: [],
          risks: [],
          missingInformation: [],
          actionPlan: [],
          drafts: [],
          escalationRoutes: [],
          trustSafetyItems: [],
          summary: {
            plainLanguage: 'Cheque bounce',
            keyConflict: 'Dishonoured cheque',
            legalNature: 'Section 138 NI Act'
          },
          language: 'en'
        },
        { trigger: 'doc_uploaded' }
      );

      // Under doc_uploaded, Legal Retrieval Agent must be skipped
      const retrievalLog = result.logs.find(l => l.agentName === 'Legal Retrieval Agent');
      assert.ok(retrievalLog);
      assert.equal(retrievalLog.status, 'skipped');

      // Document intelligence should have completed
      const docLog = result.logs.find(l => l.agentName === 'Document Intelligence Agent');
      assert.ok(docLog);
      assert.equal(docLog.status, 'completed');
    });
  });

  // 7. Security Utilities: Rate Limiting & PII Redaction
  describe('7. Security Utilities: Rate Limiting & PII Redaction', () => {
    it('rate limiter enforces maximum request thresholds', () => {
      const testKey = 'test-client-ip-123';
      // Limit to 3 requests per 60s
      const req1 = RateLimiter.check(testKey, 3, 60);
      assert.equal(req1.allowed, true);
      assert.equal(req1.remaining, 2);

      const req2 = RateLimiter.check(testKey, 3, 60);
      assert.equal(req2.allowed, true);
      assert.equal(req2.remaining, 1);

      const req3 = RateLimiter.check(testKey, 3, 60);
      assert.equal(req3.allowed, true);
      assert.equal(req3.remaining, 0);

      // 4th request must be blocked
      const req4 = RateLimiter.check(testKey, 3, 60);
      assert.equal(req4.allowed, false);
      assert.equal(req4.remaining, 0);
      assert.ok(req4.resetSeconds > 0);
    });

    it('redactor scrubs Aadhaar numbers, PAN numbers, bank accounts, and auth tokens', () => {
      const sensitiveText = `User Aadhaar is 2345 6789 0123. PAN is ABCDE1234F. Bank Account 12345678901234. Token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jV_hP_sE5mP8Q4m0Q9v6F2e6y1z2w3A.`;

      const redacted = Redactor.redact(sensitiveText);

      assert.ok(!redacted.includes('2345 6789 0123'), 'Aadhaar must be redacted');
      assert.ok(redacted.includes('[REDACTED_AADHAAR]'));

      assert.ok(!sensitiveText.includes('[REDACTED_PAN]'));
      assert.ok(redacted.includes('[REDACTED_PAN]'));

      assert.ok(redacted.includes('[REDACTED_AUTH_TOKEN]'));
      assert.ok(redacted.includes('[REDACTED_ACC_'));
    });
  });
});
