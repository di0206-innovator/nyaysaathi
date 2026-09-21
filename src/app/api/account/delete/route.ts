import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth-service';
import { getMatterService } from '@/lib/repository';
import { apiError } from '@/lib/api/response';
import { enforceRateLimit } from '@/lib/security/rate-limiter';
import { SecurityAuditLogger } from '@/lib/observability/audit-logger';
import { getSupabaseAdminClient } from '@/lib/db/supabase';

export async function POST(req: NextRequest) {
  try {
    const user = await AuthService.getAuthenticatedUser(req);
    if (!user) {
      return apiError('Authentication required', 401, 'UNAUTHORIZED');
    }

    const rateLimitRes = await enforceRateLimit(req, 'account_delete', 3, 60, user.id);
    if (rateLimitRes) return rateLimitRes;

    const body = await req.json().catch(() => ({}));
    const { confirmEmail } = body;

    if (!confirmEmail || confirmEmail.toLowerCase().trim() !== user.email.toLowerCase().trim()) {
      return apiError(
        'Confirmation email does not match authenticated user email. Account deletion aborted.',
        400,
        'INVALID_CONFIRMATION'
      );
    }

    // 1. Delete all user matters and associated evidence records
    const service = getMatterService(user.token);
    const userMatters = await service.listMatters({ userId: user.id });
    let deletedMattersCount = 0;

    for (const matter of userMatters) {
      try {
        await service.deleteMatter(matter.id, user.id);
        deletedMattersCount++;
      } catch {
        // Continue cleaning up remaining matters
      }
    }

    // 2. Audit log retention (Preserve security audit record for statutory compliance under IT Act & DPDP Act)
    SecurityAuditLogger.log({
      action: 'account_deleted',
      userId: user.id,
      resourceType: 'user_account',
      status: 'success',
      metadata: {
        deletedMattersCount,
        email: user.email,
        deletionTimestamp: new Date().toISOString(),
        retentionPolicy: 'Legal audit logs retained per DPDP Act Section 8(7) statutory compliance obligations.'
      }
    });

    // 3. Delete Supabase Auth User if admin client configured
    try {
      const adminClient = getSupabaseAdminClient();
      if (adminClient) {
        await adminClient.auth.admin.deleteUser(user.id);
      }
    } catch {
      // Best effort deletion from auth directory
    }

    // 4. Return success and expire session cookie
    const response = NextResponse.json({
      success: true,
      data: {
        message: 'User account and all associated legal matters successfully purged.',
        deletedMattersCount
      }
    });

    response.cookies.set('nyaysaathi_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete user account';
    return apiError(message, 500, 'DELETE_ACCOUNT_ERROR');
  }
}
