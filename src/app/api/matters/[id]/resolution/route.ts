import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth-service';
import { getMatterService } from '@/lib/repository';
import { enforceRateLimit } from '@/lib/security/rate-limiter';
import { Logger } from '@/lib/observability/logger';
import { SecurityAuditLogger } from '@/lib/observability/audit-logger';
import { ResolutionType } from '@/types/matter';

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
    status: matter.status,
    resolution: matter.resolution || null
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

  const rateLimitResponse = await enforceRateLimit(req, 'resolution', 15, 60, user.id);
  if (rateLimitResponse) return rateLimitResponse;

  const { id } = await params;

  let body: {
    resolutionType: ResolutionType;
    outcome: string;
    amountRecovered?: number;
    amountDisputed?: number;
    settlementDocumentId?: string;
    notes?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  if (!body.resolutionType || !body.outcome) {
    return NextResponse.json(
      { error: 'Missing required fields: resolutionType, outcome' },
      { status: 400 }
    );
  }

  const matterService = getMatterService(user.token);
  const matter = await matterService.getMatterById(id, user.id);
  if (!matter) {
    return NextResponse.json({ error: 'Matter not found or access denied' }, { status: 404 });
  }

  try {
    const updatedMatter = await matterService.resolveMatter(
      id,
      {
        resolvedAt: new Date().toISOString(),
        resolutionType: body.resolutionType,
        outcome: body.outcome,
        amountRecovered: body.amountRecovered,
        amountDisputed: body.amountDisputed,
        settlementDocumentId: body.settlementDocumentId,
        notes: body.notes
      },
      user.id
    );

    await SecurityAuditLogger.log({
      action: 'matter_resolved',
      userId: user.id,
      matterId: id,
      resource: `matter:${id}:resolution`,
      status: 'SUCCESS',
      metadata: { resolutionType: body.resolutionType, amountRecovered: body.amountRecovered }
    });

    Logger.info('Matter formally resolved', {
      matterId: id,
      resolutionType: body.resolutionType,
      amountRecovered: body.amountRecovered
    });

    return NextResponse.json({
      success: true,
      matterStatus: updatedMatter.status,
      resolution: updatedMatter.resolution
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    Logger.error('Failed to resolve matter', err, { matterId: id });
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await AuthService.getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rateLimitResponse = await enforceRateLimit(req, 'resolution_reopen', 10, 60, user.id);
  if (rateLimitResponse) return rateLimitResponse;

  const { id } = await params;

  let body: { reason: string };
  try {
    body = await req.json();
  } catch {
    body = { reason: 'User requested matter reopening' };
  }

  const matterService = getMatterService(user.token);
  const matter = await matterService.getMatterById(id, user.id);
  if (!matter) {
    return NextResponse.json({ error: 'Matter not found or access denied' }, { status: 404 });
  }

  try {
    const updatedMatter = await matterService.reopenMatter(
      id,
      body.reason || 'Reopened for additional action',
      user.email || user.id,
      user.id
    );

    await SecurityAuditLogger.log({
      action: 'matter_reopened',
      userId: user.id,
      matterId: id,
      resource: `matter:${id}:reopen`,
      status: 'SUCCESS',
      metadata: { reason: body.reason }
    });

    Logger.info('Matter reopened', {
      matterId: id,
      reason: body.reason
    });

    return NextResponse.json({
      success: true,
      matterStatus: updatedMatter.status,
      resolution: updatedMatter.resolution
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    Logger.error('Failed to reopen matter', err, { matterId: id });
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
