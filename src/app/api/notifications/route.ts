import { NextRequest } from 'next/server';
import { AuthService } from '@/lib/auth/auth-service';
import { getMatterService, getStorageAdapter } from '@/lib/repository';
import { enforceRateLimit } from '@/lib/security/rate-limiter';
import { apiSuccess, apiError, getOrGenerateRequestId } from '@/lib/api/response';
import { parseRequestBody, NotificationSchema, NotificationPatchSchema } from '@/lib/api/schemas';
import { Logger } from '@/lib/observability/logger';
import { MatterNotification } from '@/types/matter';

export async function GET(req: NextRequest) {
  const requestId = getOrGenerateRequestId(req);
  const user = await AuthService.getAuthenticatedUser(req);
  if (!user) {
    return apiError('Authentication required to retrieve notifications', 401, 'UNAUTHORIZED', undefined, requestId);
  }

  const adapter = getStorageAdapter(user.token);
  if (!adapter.notifications) {
    return apiSuccess({ notifications: [], unreadCount: 0 }, 200, undefined, requestId);
  }

  const { searchParams } = new URL(req.url);
  const countOnly = searchParams.get('countOnly') === 'true';
  const matterId = searchParams.get('matterId');

  // If matterId is requested, enforce tenant ownership
  if (matterId) {
    const matterService = getMatterService(user.token);
    const matter = await matterService.getMatterById(matterId, user.id);
    if (!matter) {
      return apiError('Matter not found or access denied', 404, 'NOT_FOUND', undefined, requestId);
    }
  }

  try {
    const unreadCount = await adapter.notifications.getUnreadCount(user.id);
    if (countOnly) {
      return apiSuccess({ unreadCount }, 200, undefined, requestId);
    }

    const notifications = matterId
      ? await adapter.notifications.listByMatter(matterId)
      : await adapter.notifications.listByUser(user.id);

    return apiSuccess({
      notifications,
      unreadCount
    }, 200, undefined, requestId);
  } catch (err) {
    Logger.error('Failed to list notifications', err, { userId: user.id });
    return apiError('Failed to list notifications', 500, 'FETCH_NOTIFICATIONS_FAILED', undefined, requestId);
  }
}

export async function POST(req: NextRequest) {
  const requestId = getOrGenerateRequestId(req);
  const user = await AuthService.getAuthenticatedUser(req);
  if (!user) {
    return apiError('Authentication required to create notification', 401, 'UNAUTHORIZED', undefined, requestId);
  }

  const rateLimitResponse = await enforceRateLimit(req, 'notifications_post', 60, 60, user.id);
  if (rateLimitResponse) return rateLimitResponse;

  const parsed = await parseRequestBody(req, NotificationSchema);
  if (!parsed.success) {
    return apiError(parsed.error, 400, 'INVALID_PAYLOAD', undefined, requestId);
  }

  const { matterId, type, title, message, metadata } = parsed.data;

  // Authorize that matter belongs strictly to user
  const matterService = getMatterService(user.token);
  const matter = await matterService.getMatterById(matterId, user.id);
  if (!matter) {
    return apiError('Matter not found or access denied', 404, 'NOT_FOUND', undefined, requestId);
  }

  const adapter = getStorageAdapter(user.token);
  if (!adapter.notifications) {
    return apiError('Notifications not supported by storage adapter', 500, 'STORAGE_UNAVAILABLE', undefined, requestId);
  }

  try {
    const notification: MatterNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      matterId,
      userId: user.id, // Never trust body userId
      type,
      title: title.trim(),
      message: message.trim(),
      channel: 'in_app',
      isRead: false,
      createdAt: new Date().toISOString(),
      metadata: metadata && typeof metadata === 'object' ? metadata : undefined
    };

    const saved = await adapter.notifications.create(notification);
    return apiSuccess({ notification: saved }, 201, undefined, requestId);
  } catch (err) {
    Logger.error('Failed to persist notification', err, { userId: user.id, matterId });
    return apiError('Failed to create notification', 500, 'CREATE_NOTIFICATION_FAILED', undefined, requestId);
  }
}

export async function PATCH(req: NextRequest) {
  const requestId = getOrGenerateRequestId(req);
  const user = await AuthService.getAuthenticatedUser(req);
  if (!user) {
    return apiError('Authentication required to update notifications', 401, 'UNAUTHORIZED', undefined, requestId);
  }

  const rateLimitResponse = await enforceRateLimit(req, 'notifications_patch', 60, 60, user.id);
  if (rateLimitResponse) return rateLimitResponse;

  const parsed = await parseRequestBody(req, NotificationPatchSchema);
  if (!parsed.success) {
    return apiError(parsed.error, 400, 'INVALID_PAYLOAD', undefined, requestId);
  }

  const adapter = getStorageAdapter(user.token);
  if (!adapter.notifications) {
    return apiSuccess({ success: true }, 200, undefined, requestId);
  }

  try {
    if (parsed.data.markAllRead === true) {
      const success = await adapter.notifications.markAllRead(user.id);
      return apiSuccess({ success, message: 'All notifications marked as read' }, 200, undefined, requestId);
    }

    if (parsed.data.notificationId) {
      const success = await adapter.notifications.markRead(parsed.data.notificationId, user.id);
      return apiSuccess({ success }, 200, undefined, requestId);
    }

    return apiError('Must provide notificationId or markAllRead: true', 400, 'BAD_REQUEST', undefined, requestId);
  } catch (err) {
    Logger.error('Failed to update notification status', err, { userId: user.id });
    return apiError('Failed to update notification', 500, 'UPDATE_NOTIFICATION_FAILED', undefined, requestId);
  }
}
