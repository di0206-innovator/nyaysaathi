import { NextRequest } from 'next/server';
import { getSupabaseAdminClient, isSupabaseConfigured } from '@/lib/db/supabase';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
  token?: string;
}

export class AuthService {
  /**
   * Extracts and validates the authenticated user from a NextRequest.
   * Checks Authorization header (Bearer token) or Supabase session cookies.
   */
  public static async getAuthenticatedUser(req: NextRequest): Promise<AuthenticatedUser | null> {
    // 1. Check Bearer Token in Authorization header
    const authHeader = req.headers.get('authorization');
    let token: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }

    // 2. Check Supabase cookies if no header
    if (!token && 'cookies' in req && req.cookies) {
      const cookieToken = req.cookies.get?.('sb-access-token')?.value || req.cookies.get?.('supabase-auth-token')?.value;
      if (cookieToken) {
        token = cookieToken;
      }
    }

    // 3. Strict Production Gate
    // In production environments, NEVER accept synthetic identity tokens or x-user-id
    if (process.env.NODE_ENV === 'production') {
      if (token && token.startsWith('mock-user-')) {
        return null;
      }
      if (req.headers.get('x-user-id')) {
        return null;
      }
    }

    // 4. Test / Explicit Demo Auth Fallback
    // Permitted ONLY in local unit tests or explicit demo mode via Bearer mock-user-*
    const isExplicitDemoOrTest =
      process.env.NODE_ENV === 'test' ||
      !process.env.NODE_ENV ||
      process.env.NODE_ENV === 'development' ||
      process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

    if (isExplicitDemoOrTest && token && token.startsWith('mock-user-')) {
      const id = token.replace('mock-user-', '');
      return {
        id,
        email: `${id}@test.nyaysaathi.in`,
        name: `Test User ${id}`,
        role: id.includes('advocate') ? 'advocate' : 'authenticated',
        token
      };
    }

    // 5. Verify token with Supabase Auth if configured
    if (isSupabaseConfigured()) {
      if (!token) {
        return null;
      }
      try {
        const adminClient = getSupabaseAdminClient();
        if (adminClient) {
          const { data, error } = await adminClient.auth.getUser(token);
          if (!error && data?.user) {
            return {
              id: data.user.id,
              email: data.user.email || '',
              name: data.user.user_metadata?.full_name,
              role: data.user.role,
              token
            };
          }
        }
      } catch (err) {
        console.error('Supabase token verification error:', err);
      }
      // When Supabase is configured, NEVER fall back to unverified mock identities
      return null;
    }

    return null;
  }

  /**
   * Helper that throws or returns 401 if user is not authenticated.
   */
  public static async requireAuth(req: NextRequest): Promise<AuthenticatedUser> {
    const user = await this.getAuthenticatedUser(req);
    if (!user) {
      throw new Error('UNAUTHORIZED');
    }
    return user;
  }
}

export const getAuthenticatedUser = (req: NextRequest | Request) => AuthService.getAuthenticatedUser(req as NextRequest);
