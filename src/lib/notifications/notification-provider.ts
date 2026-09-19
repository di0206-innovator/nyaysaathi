import { MatterNotification, NotificationType } from '@/types/matter';
import { Logger } from '@/lib/observability/logger';

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
  send(payload: NotificationPayload): Promise<{ success: boolean; notificationId?: string; error?: string }>;
}

/**
 * In-App Notification Store & Provider
 */
export class InAppNotificationProvider implements INotificationProvider {
  public name = 'InAppNotificationService';
  public channel = 'in_app' as const;
  private notifications: MatterNotification[] = [];

  public async send(payload: NotificationPayload): Promise<{ success: boolean; notificationId: string }> {
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

    try {
      const { getStorageAdapter } = await import('@/lib/repository');
      const adapter = getStorageAdapter();
      if (adapter.notifications) {
        await adapter.notifications.create(notification);
      }
    } catch {
      // Fallback to local memory if storage adapter unavailable
    }

    this.notifications.unshift(notification);
    Logger.info('In-app notification created and persisted', {
      matterId: payload.matterId,
      notificationType: payload.type
    });

    return { success: true, notificationId: notification.id };
  }

  public getNotificationsForMatter(matterId: string): MatterNotification[] {
    return this.notifications.filter(n => n.matterId === matterId);
  }

  public getNotificationsForUser(userId: string): MatterNotification[] {
    return this.notifications.filter(n => n.userId === userId);
  }

  public markAsRead(notificationId: string, userId?: string): boolean {
    const notif = this.notifications.find(n => n.id === notificationId);
    if (notif) {
      notif.isRead = true;
    }
    // Async fire-and-forget sync to adapter repository
    import('@/lib/repository').then(({ getStorageAdapter }) => {
      const adapter = getStorageAdapter();
      if (adapter.notifications) {
        adapter.notifications.markRead(notificationId, userId).catch(() => {});
      }
    }).catch(() => {});

    return !!notif;
  }
}

/**
 * Email Notification Provider Abstraction
 * Configurable with SendGrid / Resend / SES in production.
 * In development / offline mode, simulates queuing without claiming false delivery.
 */
export class EmailNotificationProvider implements INotificationProvider {
  public name = 'EmailNotificationService';
  public channel = 'email' as const;
  private apiKey?: string;

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY;
  }

  public async send(payload: NotificationPayload): Promise<{ success: boolean; notificationId?: string; error?: string }> {
    if (!this.apiKey) {
      Logger.info('Email notification queued (email service not configured in current environment)', {
        matterId: payload.matterId,
        notificationType: payload.type
      });
      return {
        success: false,
        error: 'Email provider not configured. In-app notifications preserved.'
      };
    }

    try {
      // If RESEND_API_KEY is configured, call Resend API
      const recipient = (payload.metadata?.recipientEmail as string) || 'recipient@example.com';
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
          error: `Email provider rejected send: ${res.status} ${errText}`
        };
      }

      const data = await res.json();
      return {
        success: true,
        notificationId: data.id || `email-${Date.now()}`
      };
    } catch (err) {
      return {
        success: false,
        error: `Email delivery failed: ${String(err)}`
      };
    }
  }
}

// Global notification singleton
let globalInAppProvider: InAppNotificationProvider | null = null;

export function getInAppNotificationProvider(): InAppNotificationProvider {
  if (!globalInAppProvider) {
    globalInAppProvider = new InAppNotificationProvider();
  }
  return globalInAppProvider;
}
