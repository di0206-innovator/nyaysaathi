import { NextRequest } from 'next/server';
import { getMatterService } from '@/lib/repository';
import { apiSuccess, apiError } from '@/lib/api/response';
import { AuthService } from '@/lib/auth/auth-service';
import { Logger } from '@/lib/observability/logger';
import { Matter } from '@/types/matter';
import { enforceRateLimit } from '@/lib/security/rate-limiter';
import { SecurityAuditLogger } from '@/lib/observability/audit-logger';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await AuthService.getAuthenticatedUser(req);
    if (!user) {
      return apiError('Authentication required', 401, 'UNAUTHORIZED');
    }

    const { id } = await params;
    const service = getMatterService(user.token);
    const matter = await service.getMatterById(id, user.id);

    if (!matter) {
      return apiError('Matter not found or access denied', 404, 'NOT_FOUND');
    }

    // Strict IDOR ownership check
    if (matter.userId && matter.userId !== user.id) {
      SecurityAuditLogger.log({
        action: 'unauthorized_access_blocked',
        userId: user.id,
        matterId: id,
        resourceType: 'matter',
        status: 'denied'
      });
      Logger.warn('Unauthorized matter access attempt prevented', {
        userId: user.id,
        matterId: id,
        operation: 'get_matter'
      });
      return apiError('Access denied: You do not have permission to view this matter', 403, 'FORBIDDEN');
    }

    SecurityAuditLogger.log({
      action: 'matter_read',
      userId: user.id,
      matterId: id,
      resourceType: 'matter',
      status: 'success'
    });

    return apiSuccess(matter);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch matter';
    Logger.error('Failed to fetch matter', error, { operation: 'get_matter' });
    return apiError(message, 500, 'FETCH_MATTER_ERROR');
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await AuthService.getAuthenticatedUser(req);
    if (!user) {
      return apiError('Authentication required', 401, 'UNAUTHORIZED');
    }

    const rateLimitRes = await enforceRateLimit(req, 'modify_matter', 30, 60, user.id);
    if (rateLimitRes) return rateLimitRes;

    const { id } = await params;
    const updates = await req.json();

    if (!updates || typeof updates !== 'object') {
      return apiError('Updates must be a valid JSON object', 400, 'INVALID_PAYLOAD');
    }

    const service = getMatterService(user.token);
    const existing = await service.getMatterById(id, user.id);
    if (!existing) {
      return apiError('Matter not found or access denied', 404, 'NOT_FOUND');
    }

    if (existing.userId && existing.userId !== user.id) {
      return apiError('Access denied: You cannot modify this matter', 403, 'FORBIDDEN');
    }

    // Lock resolved/closed matters against destructive modifications
    if (existing.status === 'resolved' || existing.status === 'closed') {
      return apiError('Matter is resolved/closed. Reopen the matter to make updates.', 403, 'MATTER_LOCKED');
    }

    // Protected fields that MUST NOT be modified via general PATCH
    const PROTECTED_FIELDS = [
      'id',
      'userId',
      'createdAt',
      'auditLog',
      'trustSafetyItems',
      'evidenceGraph',
      'lawyerBrief',
      'applicableStatutes',
      'status',
      'actionPlan',
      'activityEvents',
      'communications',
      'deadlines',
      'escalationWorkflows',
      'resolution',
      'notifications'
    ];

    for (const field of PROTECTED_FIELDS) {
      if (field in updates) {
        return apiError(
          `Direct modification of protected field '${field}' is not permitted. Use designated workflow APIs.`,
          400,
          'PROTECTED_FIELD_MODIFICATION'
        );
      }
    }

    // Allowlisted editable fields
    const ALLOWED_FIELDS = [
      'title',
      'userStory',
      'claimAmount',
      'locationCity',
      'locationState',
      'parties',
      'language',
      'missingInformation'
    ];

    const sanitizedUpdates: Partial<Matter> = {};
    for (const key of ALLOWED_FIELDS) {
      if (key in updates) {
        sanitizedUpdates[key as keyof Matter] = updates[key];
      }
    }

    // Input validations
    if (sanitizedUpdates.title !== undefined && (typeof sanitizedUpdates.title !== 'string' || sanitizedUpdates.title.trim().length === 0)) {
      return apiError('Title must be a non-empty string', 400, 'INVALID_TITLE');
    }
    if (sanitizedUpdates.claimAmount !== undefined && (typeof sanitizedUpdates.claimAmount !== 'number' || sanitizedUpdates.claimAmount < 0)) {
      return apiError('Claim amount must be a non-negative number', 400, 'INVALID_CLAIM_AMOUNT');
    }

    const updated = await service.updateMatter(id, sanitizedUpdates, user.id);
    if (!updated) {
      return apiError('Failed to update matter', 500, 'UPDATE_FAILED');
    }

    SecurityAuditLogger.log({
      action: 'matter_updated',
      userId: user.id,
      matterId: id,
      resourceType: 'matter',
      status: 'success',
      metadata: { updatedFields: Object.keys(sanitizedUpdates) }
    });

    Logger.info('Updated legal matter', {
      userId: user.id,
      matterId: id,
      operation: 'update_matter'
    });

    return apiSuccess(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update matter';
    Logger.error('Failed to update matter', error, { operation: 'update_matter' });
    return apiError(message, 500, 'UPDATE_MATTER_ERROR');
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await AuthService.getAuthenticatedUser(req);
    if (!user) {
      return apiError('Authentication required', 401, 'UNAUTHORIZED');
    }

    const rateLimitRes = await enforceRateLimit(req, 'delete_matter', 10, 60, user.id);
    if (rateLimitRes) return rateLimitRes;

    const { id } = await params;
    const service = getMatterService(user.token);
    const existing = await service.getMatterById(id, user.id);

    if (!existing) {
      return apiError('Matter not found or access denied', 404, 'NOT_FOUND');
    }

    if (existing.userId && existing.userId !== user.id) {
      SecurityAuditLogger.log({
        action: 'unauthorized_access_blocked',
        userId: user.id,
        matterId: id,
        resourceType: 'matter',
        status: 'denied',
        metadata: { operation: 'delete_matter' }
      });
      return apiError('Access denied: You cannot delete this matter', 403, 'FORBIDDEN');
    }

    const deleted = await service.deleteMatter(id, user.id);
    if (!deleted) {
      return apiError('Failed to delete matter', 500, 'DELETE_FAILED');
    }

    SecurityAuditLogger.log({
      action: 'matter_deleted',
      userId: user.id,
      matterId: id,
      resourceType: 'matter',
      status: 'success'
    });

    Logger.info('Deleted legal matter', {
      userId: user.id,
      matterId: id,
      operation: 'delete_matter'
    });

    return apiSuccess({ id, deleted: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete matter';
    Logger.error('Failed to delete matter', error, { operation: 'delete_matter' });
    return apiError(message, 500, 'DELETE_MATTER_ERROR');
  }
}
