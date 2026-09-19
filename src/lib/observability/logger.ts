import { Redactor } from '@/lib/security/redactor';

export interface StructuredLogContext {
  requestId?: string;
  matterId?: string;
  userId?: string;
  operation?: string;
  agentName?: string;
  durationMs?: number;
  provider?: string;
  isFallback?: boolean;
  status?: 'success' | 'warning' | 'error' | 'fallback' | 'failed';
  errorCategory?: string;
  [key: string]: unknown;
}

/**
 * Structured server-side logger with mandatory PII and credential redaction.
 */
export class Logger {
  public static info(message: string, context?: StructuredLogContext): void {
    const payload = this.formatLog('INFO', message, context);
    console.log(JSON.stringify(payload));
  }

  public static warn(message: string, context?: StructuredLogContext): void {
    const payload = this.formatLog('WARN', message, context);
    console.warn(JSON.stringify(payload));
  }

  public static error(message: string, error?: unknown, context?: StructuredLogContext): void {
    const errorMessage = error instanceof Error ? error.message : String(error || '');
    const stack = error instanceof Error ? error.stack : undefined;

    const payload = this.formatLog('ERROR', message, {
      ...context,
      errorMessage: Redactor.redact(errorMessage),
      stack: stack ? Redactor.redact(stack) : undefined
    });

    console.error(JSON.stringify(payload));
  }

  private static formatLog(
    level: string,
    message: string,
    context?: StructuredLogContext
  ): Record<string, unknown> {
    const safeContext: Record<string, unknown> = {};

    if (context) {
      for (const [key, val] of Object.entries(context)) {
        if (key === 'userId' && typeof val === 'string') {
          safeContext[key] = Redactor.maskUserId(val);
        } else if (typeof val === 'string') {
          safeContext[key] = Redactor.redact(val);
        } else {
          safeContext[key] = val;
        }
      }
    }

    return {
      timestamp: new Date().toISOString(),
      level,
      message: Redactor.redact(message),
      ...safeContext
    };
  }
}
