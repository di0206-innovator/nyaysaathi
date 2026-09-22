import { NextRequest } from 'next/server';
import { AuthService } from '@/lib/auth/auth-service';
import { getMatterService } from '@/lib/repository';
import { enforceRateLimit } from '@/lib/security/rate-limiter';
import { Logger } from '@/lib/observability/logger';
import { CommunicationType, CommunicationDirection } from '@/types/matter';
import { SecurityAuditLogger } from '@/lib/observability/audit-logger';
import { apiSuccess, apiError } from '@/lib/api/response';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await AuthService.getAuthenticatedUser(req);
  if (!user) {
    return apiError('Authentication required', 401, 'UNAUTHORIZED');
  }

  const { id } = await params;
  const matterService = getMatterService(user.token);
  const matter = await matterService.getMatterById(id, user.id);

  if (!matter) {
    return apiError('Matter not found or access denied', 404, 'NOT_FOUND');
  }

  return apiSuccess({
    matterId: matter.id,
    communications: matter.communications || []
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await AuthService.getAuthenticatedUser(req);
  if (!user) {
    return apiError('Authentication required', 401, 'UNAUTHORIZED');
  }

  const rateLimitRes = await enforceRateLimit(req, 'record_communication', 30, 60, user.id);
  if (rateLimitRes) return rateLimitRes;

  const { id } = await params;

  let body: {
    type: CommunicationType;
    direction: CommunicationDirection;
    date: string;
    counterparty: string;
    summary: string;
    referenceNumber?: string;
    documentIds?: string[];
    responseExpectedBy?: string;
    status?: 'sent' | 'delivered' | 'awaiting_response' | 'responded' | 'overdue' | 'resolved';
    outcomeNotes?: string;
  };

  try {
    body = await req.json();
  } catch {
    return apiError('Invalid JSON payload', 400, 'INVALID_PAYLOAD');
  }

  if (!body.type || !body.direction || !body.date || !body.counterparty || !body.summary) {
    return apiError(
      'Missing required fields: type, direction, date, counterparty, summary',
      400,
      'MISSING_FIELDS'
    );
  }

  const matterService = getMatterService(user.token);
  const matter = await matterService.getMatterById(id, user.id);
  if (!matter) {
    return apiError('Matter not found or access denied', 404, 'NOT_FOUND');
  }

  try {
    const updatedMatter = await matterService.recordCommunication(
      id,
      {
        matterId: id,
        type: body.type,
        direction: body.direction,
        date: body.date,
        counterparty: body.counterparty,
        summary: body.summary,
        referenceNumber: body.referenceNumber,
        documentIds: body.documentIds,
        responseExpectedBy: body.responseExpectedBy,
        status: body.status || (body.direction === 'outgoing' ? 'sent' : 'responded'),
        outcomeNotes: body.outcomeNotes
      },
      user.id
    );

    SecurityAuditLogger.log({
      action: 'communication_recorded',
      userId: user.id,
      matterId: id,
      resourceType: 'communication',
      status: 'success',
      metadata: { type: body.type, direction: body.direction }
    });

    Logger.info('Communication recorded', {
      matterId: id,
      commType: body.type,
      direction: body.direction
    });

    return apiSuccess({
      communications: updatedMatter.communications,
      matterStatus: updatedMatter.status,
      deadlines: updatedMatter.deadlines
    }, 201);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    Logger.error('Failed to record communication', err, { matterId: id });
    return apiError(errMsg, 500, 'RECORD_COMMUNICATION_ERROR');
  }
}
