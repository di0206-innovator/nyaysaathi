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
      const response = apiSuccess({ message: 'Logged out successfully' });
      response.cookies.delete('sb-access-token');
      response.cookies.delete('supabase-auth-token');
      return response;
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
        const response = apiSuccess({
          user: data.user ? { id: data.user.id, email: data.user.email, name: fullName } : null
        }, 201);
        if (data.session?.access_token) {
          response.cookies.set('sb-access-token', data.session.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7
          });
        }
        return response;
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
        const response = apiSuccess({
          user: data.user ? { id: data.user.id, email: data.user.email } : null
        });
        if (data.session?.access_token) {
          response.cookies.set('sb-access-token', data.session.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7
          });
        }
        return response;
      }
    }

    // In production, NEVER synthesize mock identities
    if (process.env.NODE_ENV === 'production') {
      return apiError('Authentication service unavailable', 503, 'AUTH_SERVICE_UNAVAILABLE');
    }

    // Local / Demo Mock Auth Fallback (development and test only)
    const mockId = `user_${Buffer.from(email).toString('hex').slice(0, 8)}`;
    const mockToken = `mock-user-${mockId}`;
    const response = apiSuccess({
      user: {
        id: mockId,
        email,
        name: fullName || email.split('@')[0],
        role: 'authenticated'
      },
      token: mockToken,
      isDemo: true
    });
    response.cookies.set('sb-access-token', mockToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    });
    return response;
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
