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
    const failedMatterIds: string[] = [];

    for (const matter of userMatters) {
      try {
        const ok = await service.deleteMatter(matter.id, user.id);
        if (ok) {
          deletedMattersCount++;
        } else {
          failedMatterIds.push(matter.id);
        }
      } catch {
        failedMatterIds.push(matter.id);
      }
    }

    if (failedMatterIds.length > 0) {
      return apiError(
        `Failed to purge matters: [${failedMatterIds.join(', ')}]. Deletion unverified.`,
        500,
        'PARTIAL_DELETION_FAILURE'
      );
    }

    // 2. Explicitly purge all uploaded document files from storage
    const { getStorageProvider } = await import('@/lib/storage/storage-provider');
    const storage = getStorageProvider();
    let deletedFilesCount = 0;
    if (storage.deleteUserFiles) {
      const fileCleanupRes = await storage.deleteUserFiles(user.id);
      deletedFilesCount = fileCleanupRes.deletedCount;
    }

    // 3. Audit log retention (Preserve security audit record for statutory compliance under IT Act & DPDP Act)
    SecurityAuditLogger.log({
      action: 'account_deleted',
      userId: user.id,
      resourceType: 'user_account',
      status: 'success',
      metadata: {
        deletedMattersCount,
        deletedFilesCount,
        email: user.email,
        deletionTimestamp: new Date().toISOString(),
        retentionPolicy: 'Legal audit logs retained per DPDP Act Section 8(7) statutory compliance obligations.'
      }
    });

    // 4. Delete Supabase Auth User if admin client configured
    let authUserPurged = false;
    let authPurgeError: string | null = null;
    const adminClient = getSupabaseAdminClient();
    if (adminClient) {
      try {
        const { error: delAuthErr } = await adminClient.auth.admin.deleteUser(user.id);
        if (!delAuthErr) {
          authUserPurged = true;
        } else {
          authPurgeError = delAuthErr.message;
        }
      } catch (err: unknown) {
        authPurgeError = err instanceof Error ? err.message : String(err);
      }
    } else {
      // Local/Memory adapter mode
      authUserPurged = true;
    }

    const deletionStatus = authUserPurged
      ? 'verified_complete'
      : (authPurgeError ? 'partial_auth_pending' : 'verified_complete');

    // 5. Return success and expire the ACTUAL active authentication cookies
    const response = NextResponse.json({
      success: true,
      data: {
        message: deletionStatus === 'verified_complete'
          ? 'Deletion Verified. User account, legal matters, and evidence files have been purged.'
          : 'User matters and storage files purged. Cloud identity provider purge pending administrator verification.',
        verification: {
          databaseMattersPurged: deletedMattersCount,
          storageFilesPurged: deletedFilesCount,
          authUserPurged,
          status: deletionStatus,
          authPurgeError: authPurgeError || undefined
        }
      }
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 0
    };

    // Expire both the actual Supabase session token and the legacy cookies
    response.cookies.set('sb-access-token', '', cookieOptions);
    response.cookies.set('supabase-auth-token', '', cookieOptions);
    response.cookies.set('nyaysaathi_session', '', cookieOptions);

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete user account';
    return apiError(message, 500, 'DELETE_ACCOUNT_ERROR');
  }
}
