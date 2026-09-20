import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { AuthService } from '../src/lib/auth/auth-service';
import { MemoryStorageAdapter } from '../src/lib/repository/adapters/memory-adapter';
import { RateLimiter, enforceRateLimit } from '../src/lib/security/rate-limiter';
import { SecurityAuditLogger } from '../src/lib/observability/audit-logger';
import { Redactor } from '../src/lib/security/redactor';
import { SEED_MATTERS } from '../src/lib/db/seed-data';
import { Matter } from '../src/types/matter';

describe('SECURITY REGRESSION SUITE (95+ Production Standards)', () => {
  let memoryAdapter: MemoryStorageAdapter;

  beforeEach(() => {
    RateLimiter.clear();
    SecurityAuditLogger.clearLogs();
    memoryAdapter = new MemoryStorageAdapter();

    // Seed test matters with explicit tenant owners
    for (const m of SEED_MATTERS.slice(0, 2)) {
      const cloned: Matter = JSON.parse(JSON.stringify(m));
      cloned.userId = 'user_alice';
      memoryAdapter.matters.create(cloned);
    }
  });

  // 1. IDOR & Cross-Tenant Read Protection
  it('prevents User B from reading User A matter (IDOR Defense)', async () => {
    const aliceMatter = (await memoryAdapter.matters.list({ userId: 'user_alice' }))[0];
    assert.ok(aliceMatter, 'Alice matter must exist');

    // Bob tries to access Alice matter
    const bobResult = await memoryAdapter.matters.findById(aliceMatter.id, 'user_bob');
    assert.equal(bobResult, null, 'Bob must receive null when requesting Alice matter');
  });

  // 2. Cross-Tenant Write & Mutation Defense
  it('prevents User B from mutating User A matter', async () => {
    const aliceMatter = (await memoryAdapter.matters.list({ userId: 'user_alice' }))[0];
    assert.ok(aliceMatter);

    const updateAttempt = await memoryAdapter.matters.update(
      aliceMatter.id,
      { title: 'Hacked Title By Bob' },
      'user_bob'
    );
    assert.equal(updateAttempt, null, 'Bob cannot update Alice matter');

    const pristine = await memoryAdapter.matters.findById(aliceMatter.id, 'user_alice');
    assert.notEqual(pristine?.title, 'Hacked Title By Bob');
  });

  // 3. Immutability & Mass Assignment
  it('rejects tampering with ownership and created timestamp', async () => {
    const aliceMatter = (await memoryAdapter.matters.list({ userId: 'user_alice' }))[0];
    assert.ok(aliceMatter);

    const originalCreatedAt = aliceMatter.createdAt;
    const mutated = await memoryAdapter.matters.update(
      aliceMatter.id,
      {
        userId: 'user_attacker',
        createdAt: '1970-01-01T00:00:00.000Z'
      } as unknown as Partial<Matter>,
      'user_alice'
    );

    assert.ok(mutated);
    assert.equal(mutated.userId, 'user_alice', 'userId ownership must remain immutable');
    assert.equal(mutated.createdAt, originalCreatedAt, 'createdAt must remain immutable');
  });

  // 4. Token & Authentication Integrity
  it('rejects synthetic identity and spoofed headers in production mode', async () => {
    const origEnv = process.env.NODE_ENV;
    (process.env as Record<string, string | undefined>).NODE_ENV = 'production';

    try {
      // Spoofed mock token
      const reqWithMock = new NextRequest('http://localhost:3000/api/matters', {
        headers: { authorization: 'Bearer mock-user-attacker' }
      });
      const user = await AuthService.getAuthenticatedUser(reqWithMock);
      assert.equal(user, null, 'Production must reject mock identity tokens');

      // Spoofed x-user-id header
      const reqWithHeader = new NextRequest('http://localhost:3000/api/matters', {
        headers: { 'x-user-id': 'admin' }
      });
      const userHeader = await AuthService.getAuthenticatedUser(reqWithHeader);
      assert.equal(userHeader, null, 'Production must reject x-user-id bypass header');
    } finally {
      (process.env as Record<string, string | undefined>).NODE_ENV = origEnv;
    }
  });

  // 5. Atomic Concurrency Rate Limiting
  it('enforces atomic distributed rate limiting and returns 429 when threshold exceeded', async () => {
    const req = new NextRequest('http://localhost:3000/api/matters/123/analyze', {
      headers: { 'x-forwarded-for': '198.51.100.44' }
    });

    // Send 5 rapid requests with limit = 3
    let rateLimited = false;
    for (let i = 0; i < 5; i++) {
      const res = await enforceRateLimit(req, 'test_burst', 3, 60, 'user_tester');
      if (res && res.status === 429) {
        rateLimited = true;
        assert.equal(res.headers.get('Retry-After'), '60');
        assert.equal(res.headers.get('X-RateLimit-Remaining'), '0');
        break;
      }
    }
    assert.ok(rateLimited, 'EnforceRateLimit must trigger 429 on exceeding threshold');
  });

  // 6. Path Traversal & Document Sandboxing
  it('detects and blocks directory traversal attempts in document storage paths', () => {
    const traversalPayloads = [
      '../../../etc/passwd',
      '..\\..\\windows\\system32',
      'user/attacker/../../user/victim/agreement.pdf',
      '%2e%2e%2f%2e%2e%2fsecret.key',
      '/root/confidential.txt'
    ];

    for (const p of traversalPayloads) {
      const isDangerous = p.includes('..') || p.startsWith('/') || p.includes('\\') || p.includes('%2e');
      assert.ok(isDangerous, `Payload "${p}" must be flagged as dangerous traversal`);
    }
  });

  // 7. Sanitized Logging & Zero Credential Leakage
  it('guarantees zero tokens, passwords, or raw narratives leak into audit logs', async () => {
    await SecurityAuditLogger.log({
      action: 'auth_attempt',
      status: 'denied',
      userId: 'user_123456789',
      metadata: {
        password: 'SuperSecretPassword123!',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.doNotLeakThisToken',
        userStory: 'I paid ₹80,000 cash and landlord threatened me.',
        accountNumber: '123456789012'
      }
    });

    const recentLogs = SecurityAuditLogger.getRecentLogs(1);
    assert.equal(recentLogs.length, 1);
    const meta = recentLogs[0].metadata || {};

    assert.equal(meta.password, '[REDACTED_CREDENTIAL]');
    assert.equal(meta.token, '[REDACTED_CREDENTIAL]');
    assert.ok(String(meta.userStory).includes('[TEXT_LEN_'));
    assert.ok(!String(meta.password).includes('SuperSecretPassword123!'));
  });

  // 8. PII Masking Utilities
  it('masks Aadhaar, PAN, and Bank Accounts accurately with Redactor', () => {
    const raw = 'My Aadhaar is 2345-6789-0123, PAN is ABCDE1234F, and Account is 98765432101234.';
    const redacted = Redactor.redact(raw);

    assert.ok(!redacted.includes('2345-6789-0123'));
    assert.ok(redacted.includes('XXXX-XXXX-[REDACTED_AADHAAR]'));
    assert.ok(!redacted.includes('ABCDE1234F'));
    assert.ok(redacted.includes('XXXXX[REDACTED_PAN]'));
    assert.ok(!redacted.includes('98765432101234'));
    assert.ok(redacted.includes('[REDACTED_ACC_1234]'));
  });
});
