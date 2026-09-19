import { NextRequest } from 'next/server';
import { getMatterService } from '@/lib/repository';
import { apiSuccess, apiError } from '@/lib/api/response';
import { AuthService } from '@/lib/auth/auth-service';
import { Logger } from '@/lib/observability/logger';

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
    const service = getMatterService();
    const matter = await service.getMatterById(id, user.id);

    if (!matter) {
      return apiError('Matter not found or access denied', 404, 'NOT_FOUND');
    }

    // Strict IDOR ownership check
    if (matter.userId && matter.userId !== user.id) {
      Logger.warn('Unauthorized matter access attempt prevented', {
        userId: user.id,
        matterId: id,
        operation: 'get_matter'
      });
      return apiError('Access denied: You do not have permission to view this matter', 403, 'FORBIDDEN');
    }

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

    const { id } = await params;
    const updates = await req.json();

    if (!updates || typeof updates !== 'object') {
      return apiError('Updates must be a valid JSON object', 400, 'INVALID_PAYLOAD');
    }

    const service = getMatterService();
    const existing = await service.getMatterById(id, user.id);
    if (!existing) {
      return apiError('Matter not found or access denied', 404, 'NOT_FOUND');
    }

    if (existing.userId && existing.userId !== user.id) {
      return apiError('Access denied: You cannot modify this matter', 403, 'FORBIDDEN');
    }

    const updated = await service.updateMatter(id, updates, user.id);
    if (!updated) {
      return apiError('Failed to update matter', 500, 'UPDATE_FAILED');
    }

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

    const { id } = await params;
    const service = getMatterService();
    const existing = await service.getMatterById(id, user.id);

    if (!existing) {
      return apiError('Matter not found or access denied', 404, 'NOT_FOUND');
    }

    if (existing.userId && existing.userId !== user.id) {
      return apiError('Access denied: You cannot delete this matter', 403, 'FORBIDDEN');
    }

    const deleted = await service.deleteMatter(id, user.id);
    if (!deleted) {
      return apiError('Failed to delete matter', 500, 'DELETE_FAILED');
    }

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
