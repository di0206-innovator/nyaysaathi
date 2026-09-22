import { NextResponse } from 'next/server';

export interface ApiErrorDetails {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * Extract or generate a valid sanitized request ID.
 */
export function getOrGenerateRequestId(req?: Request | Headers | null): string {
  if (req) {
    const headers = 'headers' in req ? req.headers : req;
    const headerId = headers.get('x-request-id');
    if (headerId && /^[a-zA-Z0-9._-]{8,64}$/.test(headerId)) {
      return headerId;
    }
  }
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Sanitize error messages to ensure internal database details, stack traces,
 * SQL keywords, or filesystem paths never leak to external clients.
 */
export function sanitizeErrorMessage(message: string): string {
  if (!message) return 'An unexpected error occurred.';

  const lower = message.toLowerCase();

  // Database / SQL / PostgREST leaks
  if (
    lower.includes('syntax error at or near') ||
    lower.includes('relation') && lower.includes('does not exist') ||
    lower.includes('violates foreign key') ||
    lower.includes('pg_') ||
    lower.includes('postgres') ||
    lower.includes('pgrst') ||
    lower.includes('supabase insert') ||
    lower.includes('column') && lower.includes('does not exist')
  ) {
    return 'A database operation failed while processing the request. Our engineers have been alerted.';
  }

  // Filesystem or internal path leaks
  if (message.includes('/Users/') || message.includes('/home/') || message.includes('node_modules')) {
    return 'An internal execution error occurred.';
  }

  // Credential leaks
  if (lower.includes('bearer') || lower.includes('service_role') || lower.includes('jwt expired')) {
    return 'Authentication token is invalid or has expired.';
  }

  return message;
}

export function apiSuccess<T>(
  data: T,
  status: number = 200,
  meta?: Record<string, unknown>,
  requestId?: string
) {
  const reqId = requestId || getOrGenerateRequestId();
  return NextResponse.json(
    {
      success: true,
      data,
      requestId: reqId,
      ...(meta ? { meta } : {})
    },
    {
      status,
      headers: {
        'X-Request-ID': reqId
      }
    }
  );
}

export function apiError(
  message: string,
  status: number = 400,
  code: string = 'BAD_REQUEST',
  details?: unknown,
  requestId?: string
) {
  const reqId = requestId || getOrGenerateRequestId();
  const safeMessage = sanitizeErrorMessage(message);

  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message: safeMessage,
        ...(details !== undefined ? { details } : {})
      },
      requestId: reqId
    },
    {
      status,
      headers: {
        'X-Request-ID': reqId
      }
    }
  );
}
