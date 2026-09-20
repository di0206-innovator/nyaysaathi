import { Logger } from './logger';

export interface SecurityAuditEvent {
  action:
    | 'auth_attempt'
    | 'auth_success'
    | 'auth_failure'
    | 'matter_created'
    | 'matter_read'
    | 'matter_updated'
    | 'matter_deleted'
    | 'document_uploaded'
    | 'document_accessed'
    | 'document_deleted'
    | 'action_created'
    | 'action_updated'
    | 'communication_recorded'
    | 'deadline_created'
    | 'deadline_updated'
    | 'escalation_updated'
    | 'legal_qa_asked'
    | 'advocate_pack_generated'
    | 'matter_resolved'
    | 'matter_reopened'
    | 'admin_access_attempt'
    | 'rate_limit_tripped'
    | 'unauthorized_access_blocked'
    | string;
  userId?: string;
  matterId?: string;
  resourceType?: string;
  resource?: string;
  resourceId?: string;
  status: 'success' | 'denied' | 'error' | 'SUCCESS' | 'DENIED' | 'ERROR';
  ip?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  timestamp?: string;
}

/**
 * Immutable security audit logger.
 * Emits strictly structured audit entries that cannot be altered via normal client operations.
 */
export class SecurityAuditLogger {
  private static inMemoryLogs: (SecurityAuditEvent & { timestamp: string })[] = [];

  public static async log(event: SecurityAuditEvent): Promise<void> {
    const timestamp = event.timestamp || new Date().toISOString();
    const entry = {
      ...event,
      timestamp
    };

    this.inMemoryLogs.push(entry);
    if (this.inMemoryLogs.length > 1000) {
      this.inMemoryLogs.shift();
    }

    const normalizedStatus = String(event.status).toLowerCase();
    const logContext = {
      ...entry,
      status: (normalizedStatus === 'error' ? 'error' : (normalizedStatus === 'denied' ? 'warning' : 'success')) as 'error' | 'warning' | 'success'
    };
    if (normalizedStatus === 'denied' || event.action === 'unauthorized_access_blocked') {
      Logger.warn(`[SECURITY AUDIT] ${event.action} - ${event.status}`, logContext);
    } else {
      Logger.info(`[SECURITY AUDIT] ${event.action} - ${event.status}`, logContext);
    }
  }

  public static getRecentLogs(limit: number = 50): (SecurityAuditEvent & { timestamp: string })[] {
    return this.inMemoryLogs.slice(-limit);
  }

  public static clearLogs(): void {
    this.inMemoryLogs = [];
  }
}
