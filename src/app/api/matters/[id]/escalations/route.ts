import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth-service';
import { getMatterService } from '@/lib/repository';
import { RateLimiter } from '@/lib/security/rate-limiter';
import { Logger } from '@/lib/observability/logger';
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
  const matterService = getMatterService();
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

  const { id } = await params;

  // Rate limiting: 30 requests / min
  const rateLimit = RateLimiter.check(`escalations:${user.id}`, 30, 60);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded for updating escalations. Please wait.' },
      { status: 429 }
    );
  }

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

  const matterService = getMatterService();
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
