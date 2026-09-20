import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth-service';
import { getMatterService } from '@/lib/repository';
import { enforceRateLimit } from '@/lib/security/rate-limiter';
import { Logger } from '@/lib/observability/logger';
import { CommunicationType, CommunicationDirection } from '@/types/matter';
import { SecurityAuditLogger } from '@/lib/observability/audit-logger';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await AuthService.getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const matterService = getMatterService(user.token);
  const matter = await matterService.getMatterById(id, user.id);

  if (!matter) {
    return NextResponse.json({ error: 'Matter not found' }, { status: 404 });
  }

  return NextResponse.json({
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
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  if (!body.type || !body.direction || !body.date || !body.counterparty || !body.summary) {
    return NextResponse.json(
      { error: 'Missing required fields: type, direction, date, counterparty, summary' },
      { status: 400 }
    );
  }

  const matterService = getMatterService(user.token);
  const matter = await matterService.getMatterById(id, user.id);
  if (!matter) {
    return NextResponse.json({ error: 'Matter not found or access denied' }, { status: 404 });
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

    return NextResponse.json({
      success: true,
      communications: updatedMatter.communications,
      matterStatus: updatedMatter.status,
      deadlines: updatedMatter.deadlines
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    Logger.error('Failed to record communication', err, { matterId: id });
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
