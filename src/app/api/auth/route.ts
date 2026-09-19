import { NextRequest } from 'next/server';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/db/supabase';
import { AuthService } from '@/lib/auth/auth-service';
import { apiSuccess, apiError } from '@/lib/api/response';

export async function POST(req: NextRequest) {
  try {
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
          return apiError(error.message, 400, 'AUTH_SIGNUP_ERROR');
        }
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
          return apiError(error.message, 401, 'AUTH_LOGIN_ERROR');
        }
        return apiSuccess({
          user: data.user ? { id: data.user.id, email: data.user.email } : null,
          session: data.session
        });
      }
    }

    // Local / Demo Mock Auth Fallback
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
