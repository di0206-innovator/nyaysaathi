import { MatterNotification, NotificationType } from '@/types/matter';
import { Logger } from '@/lib/observability/logger';
import { isSupabaseConfigured } from '@/lib/db/supabase';

export type NotificationStatus = 'queued' | 'processing' | 'sent' | 'read' | 'failed' | 'retrying';

export interface NotificationPayload {
  matterId: string;
  userId?: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface INotificationProvider {
  name: string;
  channel: 'in_app' | 'email';
  send(payload: NotificationPayload): Promise<{ success: boolean; notificationId?: string; error?: string; status?: NotificationStatus }>;
}

/**
 * In-App Notification Store & Provider
 * Authoritatively persists to the database when Supabase is configured,
 * preventing silent failures. Memory is used as an optional read-through cache or local fallback.
 */
export class InAppNotificationProvider implements INotificationProvider {
  public name = 'InAppNotificationService';
  public channel = 'in_app' as const;
  private notifications: MatterNotification[] = [];
  private userToken?: string;

  constructor(userToken?: string) {
    this.userToken = userToken;
  }

  public async send(payload: NotificationPayload): Promise<{
    success: boolean;
    notificationId: string;
    error?: string;
    status: NotificationStatus;
  }> {
    const notification: MatterNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      matterId: payload.matterId,
      userId: payload.userId,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      channel: 'in_app',
      isRead: false,
      createdAt: new Date().toISOString(),
      metadata: payload.metadata
    };

    // Authoritative persistence via request-scoped storage adapter
    try {
      const { getStorageAdapter } = await import('@/lib/repository');
      const adapter = getStorageAdapter(this.userToken);
      if (adapter.notifications) {
        await adapter.notifications.create(notification);
      }
    } catch (err: unknown) {
      if (isSupabaseConfigured()) {
        Logger.error('Durable in-app notification persistence failed', err, {
          matterId: payload.matterId,
          notificationType: payload.type
        });
        return {
          success: false,
          notificationId: notification.id,
          error: 'Authoritative database persistence failed for notification.',
          status: 'failed'
        };
      }
      // Local development or memory adapter fallback
    }

    this.notifications.unshift(notification);
    Logger.info('In-app notification created and persisted', {
      matterId: payload.matterId,
      notificationType: payload.type
    });

    return { success: true, notificationId: notification.id, status: 'sent' };
  }

  public getNotificationsForMatter(matterId: string): MatterNotification[] {
    return this.notifications.filter(n => n.matterId === matterId);
  }

  public getNotificationsForUser(userId: string): MatterNotification[] {
    return this.notifications.filter(n => n.userId === userId);
  }

  public async markAsRead(notificationId: string, userId?: string): Promise<boolean> {
    const notif = this.notifications.find(n => n.id === notificationId);
    if (notif) {
      notif.isRead = true;
    }

    try {
      const { getStorageAdapter } = await import('@/lib/repository');
      const adapter = getStorageAdapter(this.userToken);
      if (adapter.notifications) {
        return await adapter.notifications.markRead(notificationId, userId);
      }
    } catch (err) {
      Logger.error('Failed to persist notification read state to database', err, {
        notificationId,
        userId
      });
      if (isSupabaseConfigured()) {
        return false;
      }
    }

    return !!notif;
  }
}

/**
 * Factory creating request-scoped notification provider with authenticated caller token
 */
export function getNotificationProvider(userToken?: string): InAppNotificationProvider {
  return new InAppNotificationProvider(userToken);
}

/**
 * Email Notification Provider Abstraction
 * Configurable with Resend / SES in production.
 * In development / offline mode, truth-tracks queuing without fake delivery claims.
 */
export class EmailNotificationProvider implements INotificationProvider {
  public name = 'EmailNotificationService';
  public channel = 'email' as const;
  private apiKey?: string;

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY;
  }

  public async send(payload: NotificationPayload): Promise<{
    success: boolean;
    notificationId?: string;
    error?: string;
    status?: NotificationStatus;
  }> {
    if (!this.apiKey) {
      Logger.info('Email notification queued (email service not configured in current environment)', {
        matterId: payload.matterId,
        notificationType: payload.type
      });
      return {
        success: false,
        error: 'Email provider not configured. In-app notifications preserved.',
        status: 'queued'
      };
    }

    const recipient = (payload.metadata?.recipientEmail as string);
    if (!recipient) {
      return {
        success: false,
        error: 'Recipient email address is required for dispatch.',
        status: 'failed'
      };
    }

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'NyaySaathi <notifications@nyaysaathi.in>',
          to: [recipient],
          subject: `NyaySaathi Update: ${payload.title}`,
          text: payload.message
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        return {
          success: false,
          error: `Email provider rejected send: ${res.status} ${errText}`,
          status: 'failed'
        };
      }

      const data = await res.json();
      return {
        success: true,
        notificationId: data.id || `email-${Date.now()}`,
        status: 'sent'
      };
    } catch (err: unknown) {
      Logger.error('Email dispatch failed', err, {
        matterId: payload.matterId,
        recipient
      });
      return {
        success: false,
        error: 'Email delivery failed due to transport error.',
        status: 'failed'
      };
    }
  }
}

/**
 * Factory creating request-scoped in-app notification provider.
 * Eliminates global mutable singleton and strictly binds to caller token.
 */
export function getInAppNotificationProvider(userToken?: string): InAppNotificationProvider {
  return new InAppNotificationProvider(userToken);
}
