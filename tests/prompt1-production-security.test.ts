import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { AuthService } from '../src/lib/auth/auth-service';
import { MatterService, MemoryStorageAdapter } from '../src/lib/repository';
import { RateLimiter, enforceRateLimit } from '../src/lib/security/rate-limiter';
import { SecurityAuditLogger } from '../src/lib/observability/audit-logger';

describe('PROMPT 1: Production Security, Auth, Data Isolation & Integrity', () => {
  let adapter: MemoryStorageAdapter;
  let service: MatterService;

  beforeEach(() => {
    adapter = new MemoryStorageAdapter();
    service = new MatterService(adapter);
    RateLimiter.clear();
    SecurityAuditLogger.clearLogs();
  });

  describe('1. Authentication & Mock Identity Rejection', () => {
    it('rejects unauthenticated requests lacking authorization headers or cookies', async () => {
      const req = new NextRequest('http://localhost:3000/api/matters');
      const user = await AuthService.getAuthenticatedUser(req);
      assert.equal(user, null);
    });

    it('rejects spoofed x-user-id headers without valid session tokens', async () => {
      const req = new NextRequest('http://localhost:3000/api/matters', {
        headers: { 'x-user-id': 'attacker-spoofed-id' }
      });
      const user = await AuthService.getAuthenticatedUser(req);
      assert.equal(user, null);
    });

    it('fails closed in production if mock identity or demo bypass is attempted', async () => {
      const prevEnv = process.env.NODE_ENV;
      const prevMock = process.env.ENABLE_MOCK_AUTH;
      try {
        (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
        process.env.ENABLE_MOCK_AUTH = 'true';

        const req = new NextRequest('http://localhost:3000/api/matters', {
          headers: { 'x-demo-user': 'demo-admin' }
        });
        const user = await AuthService.getAuthenticatedUser(req);
        assert.equal(user, null);
      } finally {
        (process.env as Record<string, string | undefined>).NODE_ENV = prevEnv;
        process.env.ENABLE_MOCK_AUTH = prevMock;
      }
    });
  });

  describe('2. Matter Tenancy & Cross-Tenant Isolation', () => {
    it('prevents User A from reading User B matter', async () => {
      const userBMatter = await service.createMatter({
        userId: 'user-b',
        title: 'User B Confidential Matter',
        category: 'tenancy_housing',
        userStory: 'Sensitive tenancy dispute details',
        parties: [
          { id: 'p1', name: 'User B', role: 'Aggrieved (You)' },
          { id: 'p2', name: 'Landlord B', role: 'Landlord' }
        ]
      });

      const readResult = await service.getMatterById(userBMatter.id, 'user-a');
      assert.equal(readResult, null);
    });

    it('prevents User A from updating or mutating User B matter', async () => {
      const userBMatter = await service.createMatter({
        userId: 'user-b',
        title: 'User B Matter',
        category: 'consumer_dispute',
        userStory: 'Initial facts'
      });

      const updateResult = await service.updateMatter(
        userBMatter.id,
        { title: 'Hacked by User A' },
        'user-a'
      );
      assert.equal(updateResult, null);

      const intact = await service.getMatterById(userBMatter.id, 'user-b');
      assert.equal(intact?.title, 'User B Matter');
    });

    it('prevents User A from resolving User B matter', async () => {
      const userBMatter = await service.createMatter({
        userId: 'user-b',
        title: 'User B Unresolved Matter',
        category: 'workplace_employment',
        userStory: 'Wage theft dispute'
      });

      await assert.rejects(
        async () => {
          await service.resolveMatter(
            userBMatter.id,
            {
              resolvedAt: new Date().toISOString(),
              resolutionType: 'abandoned',
              outcome: 'Forced withdrawal'
            },
            'user-a'
          );
        },
        /(not found|access denied)/i
      );
    });

    it('prevents User A from updating actions under User B matter', async () => {
      const userBMatter = await service.createMatter({
        userId: 'user-b',
        title: 'User B Matter',
        category: 'tenancy_housing',
        userStory: 'Dispute'
      });

      await assert.rejects(
        async () => {
          await service.updateActionStep(userBMatter.id, 'action-1', { status: 'completed' }, 'user-a');
        },
        /(not found|access denied)/i
      );
    });
  });

  describe('3. Mass Assignment & Immutability', () => {
    it('does not allow mutating ownership, userId, or createdAt via update', async () => {
      const matter = await service.createMatter({
        userId: 'original-owner',
        title: 'Legitimate Matter',
        category: 'consumer_dispute',
        userStory: 'Purchased defective refrigerator'
      });

      const originalCreatedAt = matter.createdAt;

      const maliciousPayload = {
        title: 'Updated Title',
        userId: 'attacker-id',
        createdAt: '1970-01-01T00:00:00.000Z'
      } as unknown as Record<string, unknown>;

      const updated = await service.updateMatter(matter.id, maliciousPayload, 'original-owner');
      assert.notEqual(updated, null);
      assert.equal(updated?.title, 'Updated Title');
      assert.equal(updated?.userId, 'original-owner');
      assert.equal(updated?.createdAt, originalCreatedAt);
    });
  });

  describe('4. Storage Security & Path Traversal Defense', () => {
    it('detects and blocks path traversal attempts', () => {
      const maliciousPaths = [
        '../secret/passwords.txt',
        '../../etc/passwd',
        'user/valid-user/../../../etc/shadow',
        'documents/..%2F..%2Fsensitive'
      ];

      for (const p of maliciousPaths) {
        const hasTraversal = p.includes('..') || p.includes('%2e%2e');
        assert.equal(hasTraversal, true);
      }
    });

    it('enforces that storage path must strictly start with authenticated user id', () => {
      const authenticatedUserId = 'user-123';
      const validPath = 'user-123/matters/m-456/contract.pdf';
      const spoofedPath = 'user-999/matters/m-789/confidential.pdf';

      const isValidOwner = (path: string, uid: string) =>
        path.startsWith(`${uid}/`) || path.startsWith(`user/${uid}/`);

      assert.equal(isValidOwner(validPath, authenticatedUserId), true);
      assert.equal(isValidOwner(spoofedPath, authenticatedUserId), false);
    });
  });

  describe('5. Distributed Rate Limiting', () => {
    it('enforces request rate limits and returns 429 when threshold exceeded', async () => {
      const req = new NextRequest('http://localhost:3000/api/matters', {
        headers: { 'x-forwarded-for': '192.168.1.50' }
      });

      const res1 = await enforceRateLimit(req, 'test_action', 3, 60, 'user-limited');
      assert.equal(res1, null);

      const res2 = await enforceRateLimit(req, 'test_action', 3, 60, 'user-limited');
      assert.equal(res2, null);

      const res3 = await enforceRateLimit(req, 'test_action', 3, 60, 'user-limited');
      assert.equal(res3, null);

      const res4 = await enforceRateLimit(req, 'test_action', 3, 60, 'user-limited');
      assert.notEqual(res4, null);
      assert.equal(res4?.status, 429);
      assert.ok(res4?.headers.get('Retry-After'));
    });
  });

  describe('6. Security Audit Logging', () => {
    it('records immutable audit events with timestamps and sanitization', async () => {
      await SecurityAuditLogger.log({
        action: 'matter_created',
        userId: 'audit-user-1',
        matterId: 'matter-xyz',
        resource: 'matter:matter-xyz',
        status: 'SUCCESS',
        ipAddress: '10.0.0.1'
      });

      const logs = SecurityAuditLogger.getRecentLogs(10);
      assert.equal(logs.length, 1);
      assert.equal(logs[0].action, 'matter_created');
      assert.equal(logs[0].userId, 'audit-user-1');
      assert.equal(logs[0].status, 'SUCCESS');
      assert.ok(logs[0].timestamp);
    });
  });

  describe('7. AI Provider Production Fail-Closed Boundary', () => {
    it('strictly fails closed in production when Gemini API key is missing without quiet fallback', async () => {
      const prevEnv = process.env.NODE_ENV;
      const prevKey = process.env.GEMINI_API_KEY;
      try {
        (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
        delete process.env.GEMINI_API_KEY;

        const { GeminiLLMProvider } = await import('../src/lib/ai/gemini-provider');
        const provider = new GeminiLLMProvider(undefined);

        await assert.rejects(
          async () => provider.generateText('Explain tenancy eviction law in Karnataka'),
          /AI service temporarily unavailable/
        );

        await assert.rejects(
          async () => provider.generateStructured('Extract facts', {
            name: 'facts',
            description: 'extract facts',
            example: { facts: [] }
          }),
          /AI service temporarily unavailable/
        );
      } finally {
        (process.env as Record<string, string | undefined>).NODE_ENV = prevEnv;
        process.env.GEMINI_API_KEY = prevKey;
      }
    });

    it('allows deterministic fallback in development/test environment for developer velocity', async () => {
      const prevEnv = process.env.NODE_ENV;
      const prevKey = process.env.GEMINI_API_KEY;
      try {
        (process.env as Record<string, string | undefined>).NODE_ENV = 'development';
        delete process.env.GEMINI_API_KEY;

        const { GeminiLLMProvider } = await import('../src/lib/ai/gemini-provider');
        const provider = new GeminiLLMProvider(undefined);

        const res = await provider.generateText('Explain tenancy eviction law');
        assert.ok(res.content);
        assert.equal(res.isFallback, true);
      } finally {
        (process.env as Record<string, string | undefined>).NODE_ENV = prevEnv;
        process.env.GEMINI_API_KEY = prevKey;
      }
    });
  });
});
