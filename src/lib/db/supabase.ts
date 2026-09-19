import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedAdminClient: SupabaseClient | null = null;
let cachedBrowserClient: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY;
  return Boolean(url && key && url.startsWith('http'));
}

/**
 * Privileged server-only Supabase admin client using the service-role key.
 * Bypasses RLS for system operations. NEVER call from client components.
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  if (typeof window !== 'undefined') {
    throw new Error('Security Violation: getSupabaseAdminClient() cannot be invoked in browser runtime.');
  }

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey || !url.startsWith('http')) {
    return null;
  }

  if (!cachedAdminClient) {
    cachedAdminClient = createClient(url, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }

  return cachedAdminClient;
}

/**
 * Safe client for browser or public anonymous usage using NEXT_PUBLIC_SUPABASE_ANON_KEY.
 * RLS policies are strictly enforced.
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey || !url.startsWith('http')) {
    return null;
  }

  if (!cachedBrowserClient) {
    cachedBrowserClient = createClient(url, anonKey, {
      auth: {
        persistSession: typeof window !== 'undefined',
        autoRefreshToken: typeof window !== 'undefined'
      }
    });
  }

  return cachedBrowserClient;
}

/**
 * Creates a user-scoped Supabase client bound to an authenticated user's JWT.
 * Ensures PostgreSQL RLS evaluates auth.uid() matching the user.
 */
export function getSupabaseUserClient(accessToken: string): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey || !url.startsWith('http')) {
    return null;
  }

  return createClient(url, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

/**
 * Primary server-side client accessor for repository adapters.
 * Uses admin client if configured, falling back to anon client.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (typeof window === 'undefined') {
    const admin = getSupabaseAdminClient();
    if (admin) return admin;
  }
  return getSupabaseBrowserClient();
}
