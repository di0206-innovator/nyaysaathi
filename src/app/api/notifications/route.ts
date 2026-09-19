import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/auth-service';
import { getMatterService, getStorageAdapter } from '@/lib/repository';
import { MatterNotification, NotificationType } from '@/types/matter';

const VALID_TYPES: NotificationType[] = [
  'deadline_due',
  'deadline_approaching',
  'response_expected',
  'action_blocked',
  'analysis_completed',
  'evidence_required',
  'authority_update'
];

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adapter = getStorageAdapter();

  if (!adapter.notifications) {
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }

  const { searchParams } = new URL(req.url);
  const countOnly = searchParams.get('countOnly') === 'true';
  const matterId = searchParams.get('matterId');

  const unreadCount = await adapter.notifications.getUnreadCount(user.id);
  if (countOnly) {
    return NextResponse.json({ unreadCount });
  }

  const notifications = matterId
    ? await adapter.notifications.listByMatter(matterId)
    : await adapter.notifications.listByUser(user.id);

  return NextResponse.json({
    notifications,
    unreadCount
  });
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { matterId, type, title, message, channel = 'in_app', metadata } = body;

    if (!matterId || typeof matterId !== 'string') {
      return NextResponse.json({ error: 'matterId is required' }, { status: 400 });
    }

    if (!title || typeof title !== 'string' || title.length > 200) {
      return NextResponse.json({ error: 'Valid title is required (max 200 chars)' }, { status: 400 });
    }

    if (!message || typeof message !== 'string' || message.length > 2000) {
      return NextResponse.json({ error: 'Valid message is required (max 2000 chars)' }, { status: 400 });
    }

    if (!VALID_TYPES.includes(type as NotificationType)) {
      return NextResponse.json({ error: `Invalid notification type. Must be one of: ${VALID_TYPES.join(', ')}` }, { status: 400 });
    }

    const matterService = getMatterService();
    // Authorize that matter belongs to user
    const matter = await matterService.getMatterById(matterId, user.id);
    if (!matter) {
      return NextResponse.json({ error: 'Matter not found or access denied' }, { status: 404 });
    }

    const adapter = getStorageAdapter();
    if (!adapter.notifications) {
      return NextResponse.json({ error: 'Notifications not supported by adapter' }, { status: 500 });
    }

    const notification: MatterNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      matterId,
      userId: user.id,
      type: type as NotificationType,
      title: title.trim(),
      message: message.trim(),
      channel: channel === 'email' ? 'email' : 'in_app',
      isRead: false,
      createdAt: new Date().toISOString(),
      metadata: metadata && typeof metadata === 'object' ? metadata : undefined
    };

    const saved = await adapter.notifications.create(notification);
    return NextResponse.json({ notification: saved }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create notification', details: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const adapter = getStorageAdapter();

    if (!adapter.notifications) {
      return NextResponse.json({ success: true });
    }

    if (body.markAllRead === true) {
      const success = await adapter.notifications.markAllRead(user.id);
      return NextResponse.json({ success, message: 'All notifications marked as read' });
    }

    if (body.notificationId && typeof body.notificationId === 'string') {
      const success = await adapter.notifications.markRead(body.notificationId, user.id);
      return NextResponse.json({ success });
    }

    return NextResponse.json({ error: 'Must provide notificationId or markAllRead: true' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update notification', details: String(err) }, { status: 500 });
  }
}
