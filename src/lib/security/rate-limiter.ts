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

  /**
   * Resets the limiter store (useful for testing).
   */
  public static reset(): void {
    this.store.clear();
  }
}
