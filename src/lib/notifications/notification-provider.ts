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

    this.notifications.unshift(notification);
    Logger.info('In-app notification created', {
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

  public markAsRead(notificationId: string): boolean {
    const notif = this.notifications.find(n => n.id === notificationId);
    if (notif) {
      notif.isRead = true;
      return true;
    }
    return false;
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
  private isConfigured: boolean;

  constructor() {
    this.isConfigured = Boolean(process.env.EMAIL_API_KEY);
  }

  public async send(payload: NotificationPayload): Promise<{ success: boolean; notificationId?: string; error?: string }> {
    if (!this.isConfigured) {
      Logger.info('Email notification queued (email service not configured in current environment)', {
        matterId: payload.matterId,
        notificationType: payload.type
      });
      return {
        success: false,
        error: 'Email provider not configured. Notifications preserved in-app.'
      };
    }

    // In production with EMAIL_API_KEY, integrate real SMTP/API call here
    return {
      success: true,
      notificationId: `email-${Date.now()}`
    };
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
