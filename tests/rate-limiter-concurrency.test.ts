import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { RateLimiter } from '../src/lib/security/rate-limiter';

describe('ATOMIC RATE LIMITING CONCURRENCY SUITE', () => {
  beforeEach(() => {
    RateLimiter.clear();
  });

  it('correctly admits exactly <= 10 out of 100 simultaneous requests with limit = 10', async () => {
    const key = 'test-concurrent-client-ip:analyze_endpoint';
    const limit = 10;
    const windowSeconds = 60;

    // Launch 100 simultaneous concurrent requests
    const promises = Array.from({ length: 100 }, () =>
      RateLimiter.checkAsync(key, limit, windowSeconds)
    );

    const results = await Promise.all(promises);

    const allowedRequests = results.filter(r => r.allowed);
    const deniedRequests = results.filter(r => !r.allowed);

    // Verify exactly 10 requests allowed, 90 denied
    assert.equal(
      allowedRequests.length,
      limit,
      `Expected exactly ${limit} allowed requests under 100 simultaneous calls, got ${allowedRequests.length}`
    );
    assert.equal(
      deniedRequests.length,
      100 - limit,
      `Expected ${100 - limit} denied requests, got ${deniedRequests.length}`
    );

    // Verify all denied requests returned remaining = 0 and positive resetSeconds
    for (const denied of deniedRequests) {
      assert.equal(denied.remaining, 0);
      assert.ok(denied.resetSeconds > 0);
    }
  });

  it('isolates concurrent requests across distinct keys', async () => {
    const limit = 5;
    const key1 = 'client-alpha';
    const key2 = 'client-beta';

    const p1 = Array.from({ length: 10 }, () => RateLimiter.checkAsync(key1, limit, 60));
    const p2 = Array.from({ length: 10 }, () => RateLimiter.checkAsync(key2, limit, 60));

    const [res1, res2] = await Promise.all([Promise.all(p1), Promise.all(p2)]);

    const allowed1 = res1.filter(r => r.allowed).length;
    const allowed2 = res2.filter(r => r.allowed).length;

    assert.equal(allowed1, 5, 'Client Alpha should have exactly 5 allowed requests');
    assert.equal(allowed2, 5, 'Client Beta should have exactly 5 allowed requests');
  });
});
