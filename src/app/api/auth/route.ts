import { NextRequest } from 'next/server';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/db/supabase';
import { AuthService } from '@/lib/auth/auth-service';
import { apiSuccess, apiError } from '@/lib/api/response';
import { enforceRateLimit } from '@/lib/security/rate-limiter';
import { SecurityAuditLogger } from '@/lib/observability/audit-logger';

export async function POST(req: NextRequest) {
  try {
    const rateLimitRes = await enforceRateLimit(req, 'auth_attempt', 15, 60);
    if (rateLimitRes) return rateLimitRes;

    const body = await req.json();
    const action = body.action; // 'login' | 'signup' | 'logout'

    if (!action) {
      return apiError('Missing action parameter (login | signup | logout)', 400, 'INVALID_ACTION');
    }

    if (action === 'logout') {
      return apiSuccess({ message: 'Logged out successfully' });
    }

    const { email, password, fullName } = body;
    if (!email || !password) {
      return apiError('Email and password are required', 400, 'MISSING_CREDENTIALS');
    }

    // If Supabase is configured, delegate to Supabase Auth
    if (isSupabaseConfigured()) {
      const client = getSupabaseBrowserClient();
      if (!client) {
        return apiError('Supabase client unavailable', 500, 'AUTH_CLIENT_ERROR');
      }

      if (action === 'signup') {
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName || email.split('@')[0] }
          }
        });
        if (error) {
          SecurityAuditLogger.log({
            action: 'auth_failure',
            resourceType: 'auth',
            status: 'denied',
            metadata: { email, error: error.message }
          });
          return apiError(error.message, 400, 'AUTH_SIGNUP_ERROR');
        }
        SecurityAuditLogger.log({
          action: 'auth_success',
          userId: data.user?.id,
          resourceType: 'auth',
          status: 'success',
          metadata: { email, action: 'signup' }
        });
        return apiSuccess({
          user: data.user ? { id: data.user.id, email: data.user.email, name: fullName } : null,
          session: data.session
        }, 201);
      }

      if (action === 'login') {
        const { data, error } = await client.auth.signInWithPassword({
          email,
          password
        });
        if (error) {
          SecurityAuditLogger.log({
            action: 'auth_failure',
            resourceType: 'auth',
            status: 'denied',
            metadata: { email, error: error.message }
          });
          return apiError(error.message, 401, 'AUTH_LOGIN_ERROR');
        }
        SecurityAuditLogger.log({
          action: 'auth_success',
          userId: data.user?.id,
          resourceType: 'auth',
          status: 'success',
          metadata: { email, action: 'login' }
        });
        return apiSuccess({
          user: data.user ? { id: data.user.id, email: data.user.email } : null,
          session: data.session
        });
      }
    }

    // In production, NEVER synthesize mock identities
    if (process.env.NODE_ENV === 'production') {
      return apiError('Authentication service unavailable', 503, 'AUTH_SERVICE_UNAVAILABLE');
    }

    // Local / Demo Mock Auth Fallback (development and test only)
    const mockId = `user_${Buffer.from(email).toString('hex').slice(0, 8)}`;
    return apiSuccess({
      user: {
        id: mockId,
        email,
        name: fullName || email.split('@')[0],
        role: 'authenticated'
      },
      token: `mock-user-${mockId}`,
      isDemo: true
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Authentication operation failed';
    return apiError(message, 500, 'AUTH_ERROR');
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await AuthService.getAuthenticatedUser(req);
    if (!user) {
      return apiError('Not authenticated', 401, 'UNAUTHORIZED');
    }
    return apiSuccess({ user });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve session';
    return apiError(message, 500, 'SESSION_ERROR');
  }
}
