/**
 * Lightweight in-memory sliding window rate limiter
 * Protects expensive AI analysis, legal Q&A, and document processing endpoints.
 */

interface RateLimitEntry {
  timestamps: number[];
}

export class RateLimiter {
  private static store: Map<string, RateLimitEntry> = new Map();

  /**
   * Evaluates if a request from a given client key is permitted within the rate limit.
   *
   * @param key Unique identifier for client (e.g. IP, userId + route)
   * @param maxRequests Maximum allowed requests within the window
   * @param windowSeconds Window duration in seconds
   */
  public static check(
    key: string,
    maxRequests: number = 20,
    windowSeconds: number = 60
  ): {
    allowed: boolean;
    remaining: number;
    resetSeconds: number;
  } {
    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    const cutoff = now - windowMs;

    let entry = this.store.get(key);
    if (!entry) {
      entry = { timestamps: [] };
      this.store.set(key, entry);
    }

    // Filter out timestamps older than the sliding window
    entry.timestamps = entry.timestamps.filter(ts => ts > cutoff);

    if (entry.timestamps.length >= maxRequests) {
      const oldest = entry.timestamps[0];
      const resetSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
      return {
        allowed: false,
        remaining: 0,
        resetSeconds
      };
    }

    entry.timestamps.push(now);
    return {
      allowed: true,
      remaining: maxRequests - entry.timestamps.length,
      resetSeconds: windowSeconds
    };
  }

  public static clear(): void {
    this.store.clear();
  }

  /**
   * Distributed rate limit checking using Supabase / Postgres RPC.
   * Seamlessly falls back to local in-memory sliding window when offline or in tests.
   */
  public static async checkAsync(
    key: string,
    maxRequests: number = 20,
    windowSeconds: number = 60
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetSeconds: number;
  }> {
    try {
      const { isSupabaseConfigured, getSupabaseClient } = await import('@/lib/db/supabase');
      if (isSupabaseConfigured()) {
        const client = getSupabaseClient();
        if (client) {
          const { data, error } = await client.rpc('check_rate_limit', {
            p_key: key,
            p_max_requests: maxRequests,
            p_window_seconds: windowSeconds
          });
          if (!error && data && typeof data === 'object') {
            return {
              allowed: Boolean(data.allowed),
              remaining: Number(data.remaining ?? 0),
              resetSeconds: Number(data.resetSeconds ?? windowSeconds)
            };
          }
        }
      }
    } catch {
      // Fallback to in-memory sliding window
    }

    return this.check(key, maxRequests, windowSeconds);
  }

  /**
   * Resets the limiter store (useful for testing).
   */
  public static reset(): void {
    this.store.clear();
  }
}

/**
 * Route-level rate limit enforcer.
 * Returns a 429 NextResponse with Retry-After headers if limit exceeded, or null if allowed.
 */
export async function enforceRateLimit(
  req: Request,
  actionName: string,
  maxRequests: number = 30,
  windowSeconds: number = 60,
  userId?: string
) {
  const { NextResponse } = await import('next/server');
  const clientIp =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';
  const key = userId ? `user:${userId}:${actionName}` : `ip:${clientIp}:${actionName}`;
  const result = await RateLimiter.checkAsync(key, maxRequests, windowSeconds);

  if (!result.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: `Rate limit exceeded for ${actionName}. Please retry after ${result.resetSeconds} seconds.`,
        code: 'RATE_LIMIT_EXCEEDED'
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(result.resetSeconds),
          'X-RateLimit-Remaining': '0'
        }
      }
    );
  }
  return null;
}
