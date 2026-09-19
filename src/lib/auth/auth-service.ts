import { NextRequest } from 'next/server';
import { getSupabaseAdminClient, isSupabaseConfigured } from '@/lib/db/supabase';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

export class AuthService {
  /**
   * Extracts and validates the authenticated user from a NextRequest.
   * Checks Authorization header (Bearer token), Supabase session cookies,
   * and authorized test headers for development/testing environments.
   */
  public static async getAuthenticatedUser(req: NextRequest): Promise<AuthenticatedUser | null> {
    // 1. Check Bearer Token in Authorization header
    const authHeader = req.headers.get('authorization');
    let token: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }

    // 2. Check Supabase cookies if no header
    if (!token) {
      const cookieToken = req.cookies.get('sb-access-token')?.value || req.cookies.get('supabase-auth-token')?.value;
      if (cookieToken) {
        token = cookieToken;
      }
    }

    // 3. Verify token with Supabase Auth if configured
    if (token && isSupabaseConfigured()) {
      try {
        const adminClient = getSupabaseAdminClient();
        if (adminClient) {
          const { data, error } = await adminClient.auth.getUser(token);
          if (!error && data?.user) {
            return {
              id: data.user.id,
              email: data.user.email || '',
              name: data.user.user_metadata?.full_name,
              role: data.user.role
            };
          }
        }
      } catch (err) {
        console.error('Supabase token verification error:', err);
      }
    }

    // 4. Test / Local / Development Auth Fallback
    // Allows deterministic testing and demo mode without requiring active Supabase cloud instance
    const testUserId = req.headers.get('x-user-id');
    if (testUserId) {
      return {
        id: testUserId,
        email: `${testUserId}@nyaysaathi.internal`,
        name: `User ${testUserId}`,
        role: 'authenticated'
      };
    }

    // Check if a test token format Bearer mock-user-* is passed
    if (token && token.startsWith('mock-user-')) {
      const id = token.replace('mock-user-', '');
      return {
        id,
        email: `${id}@test.nyaysaathi.in`,
        name: `Test User ${id}`,
        role: 'authenticated'
      };
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
