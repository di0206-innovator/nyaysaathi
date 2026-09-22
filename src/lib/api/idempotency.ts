import crypto from 'crypto';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/db/supabase';

export interface IdempotencyRecord {
  id: string; // The idempotency key
  userId: string;
  endpoint: string;
  requestHash?: string;
  responseStatus: number;
  responseBody: unknown;
  createdAt: string;
  expiresAt: string;
}

/**
 * Calculate SHA-256 cryptographic hash of a buffer or string.
 */
export function calculateSha256(data: Buffer | ArrayBuffer | Uint8Array | string): string {
  const hash = crypto.createHash('sha256');
  if (typeof data === 'string') {
    hash.update(data, 'utf-8');
  } else if (Buffer.isBuffer(data)) {
    hash.update(data);
  } else if (data instanceof ArrayBuffer) {
    hash.update(Buffer.from(data));
  } else {
    hash.update(Buffer.from(data.buffer, data.byteOffset, data.byteLength));
  }
  return hash.digest('hex');
}

/**
 * In-memory store for local testing/dev fallback.
 */
const inMemoryStore = new Map<string, IdempotencyRecord>();

function buildCompositeKey(key: string, userId: string, endpoint: string): string {
  return `${userId}:${endpoint}:${key}`;
}

export class IdempotencyManager {
  /**
   * Check if a request with this key has already been processed.
   */
  public static async getRecord(
    key: string,
    userId: string,
    endpoint: string
  ): Promise<IdempotencyRecord | null> {
    if (!key || !userId || !endpoint) return null;

    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          const { data, error } = await client
            .from('idempotency_keys')
            .select('*')
            .eq('id', key)
            .eq('user_id', userId)
            .eq('endpoint', endpoint)
            .single();

          if (!error && data) {
            // Check if expired
            if (new Date(data.expires_at).getTime() > Date.now()) {
              return {
                id: data.id,
                userId: data.user_id,
                endpoint: data.endpoint,
                requestHash: data.request_hash,
                responseStatus: data.response_status,
                responseBody: data.response_body,
                createdAt: data.created_at,
                expiresAt: data.expires_at
              };
            }
          }
        } catch {
          // Fall back to memory on failure
        }
      }
    }

    const cached = inMemoryStore.get(buildCompositeKey(key, userId, endpoint));
    if (cached) {
      if (new Date(cached.expiresAt).getTime() > Date.now()) {
        return cached;
      }
      inMemoryStore.delete(buildCompositeKey(key, userId, endpoint));
    }

    return null;
  }

  /**
   * Persist a successful response keyed by the Idempotency-Key.
   */
  public static async saveRecord(
    key: string,
    userId: string,
    endpoint: string,
    responseStatus: number,
    responseBody: unknown,
    requestHash?: string,
    ttlSeconds: number = 86400 // Default 24 hours
  ): Promise<void> {
    if (!key || !userId || !endpoint) return;

    const createdAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();

    const record: IdempotencyRecord = {
      id: key,
      userId,
      endpoint,
      requestHash,
      responseStatus,
      responseBody,
      createdAt,
      expiresAt
    };

    // Store in memory
    inMemoryStore.set(buildCompositeKey(key, userId, endpoint), record);

    // Store in Supabase if configured
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          await client.from('idempotency_keys').upsert({
            id: key,
            user_id: userId,
            endpoint,
            request_hash: requestHash || null,
            response_status: responseStatus,
            response_body: responseBody,
            created_at: createdAt,
            expires_at: expiresAt
          });
        } catch {
          // Logged or handled gracefully
        }
      }
    }
  }

  public static clearMemory(): void {
    inMemoryStore.clear();
  }
}
