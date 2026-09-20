import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth-service';
import { getMatterService } from '@/lib/repository';
import { enforceRateLimit } from '@/lib/security/rate-limiter';
import { Logger } from '@/lib/observability/logger';
import { SecurityAuditLogger } from '@/lib/observability/audit-logger';
import { EscalationWorkflowStatus } from '@/types/matter';

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
    escalationWorkflows: matter.escalationWorkflows || []
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await AuthService.getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rateLimitResponse = await enforceRateLimit(req, 'escalations', 30, 60, user.id);
  if (rateLimitResponse) return rateLimitResponse;

  const { id } = await params;

  let body: {
    routeId: string;
    authorityName?: string;
    status: EscalationWorkflowStatus;
    referenceNumber?: string;
    nextStep?: string;
    notes?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  if (!body.routeId || !body.status) {
    return NextResponse.json(
      { error: 'Missing required fields: routeId, status' },
      { status: 400 }
    );
  }

  const matterService = getMatterService(user.token);
  const matter = await matterService.getMatterById(id, user.id);
  if (!matter) {
    return NextResponse.json({ error: 'Matter not found or access denied' }, { status: 404 });
  }

  try {
    const updatedMatter = await matterService.updateEscalation(
      id,
      {
        routeId: body.routeId,
        authorityName: body.authorityName,
        status: body.status,
        referenceNumber: body.referenceNumber,
        nextStep: body.nextStep,
        notes: body.notes
      },
      user.id
    );

    await SecurityAuditLogger.log({
      action: 'escalation_updated',
      userId: user.id,
      matterId: id,
      resource: `escalation:${body.routeId}`,
      status: 'SUCCESS',
      metadata: { status: body.status, authorityName: body.authorityName }
    });

    Logger.info('Escalation workflow updated', {
      matterId: id,
      routeId: body.routeId,
      escalationStatus: body.status
    });

    return NextResponse.json({
      success: true,
      escalationWorkflows: updatedMatter.escalationWorkflows,
      matterStatus: updatedMatter.status
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    Logger.error('Failed to update escalation', err, { matterId: id });
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
