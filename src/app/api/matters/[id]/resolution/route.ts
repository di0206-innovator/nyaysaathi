import { NextRequest } from 'next/server';
import { AuthService } from '@/lib/auth/auth-service';
import { getMatterService } from '@/lib/repository';
import { enforceRateLimit } from '@/lib/security/rate-limiter';
import { Logger } from '@/lib/observability/logger';
import { SecurityAuditLogger } from '@/lib/observability/audit-logger';
import { ResolutionType } from '@/types/matter';
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
    return apiError('Authentication required', 401, 'UNAUTHORIZED');
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
    return apiError('Invalid JSON payload', 400, 'INVALID_PAYLOAD');
  }

  if (!body.resolutionType || !body.outcome) {
    return apiError('Missing required fields: resolutionType, outcome', 400, 'MISSING_FIELDS');
  }

  const matterService = getMatterService(user.token);
  const matter = await matterService.getMatterById(id, user.id);
  if (!matter) {
    return apiError('Matter not found or access denied', 404, 'NOT_FOUND');
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

    return apiSuccess({
      matterStatus: updatedMatter.status,
      resolution: updatedMatter.resolution
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    Logger.error('Failed to resolve matter', err, { matterId: id });
    return apiError(errMsg, 500, 'RESOLVE_MATTER_ERROR');
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await AuthService.getAuthenticatedUser(req);
  if (!user) {
    return apiError('Authentication required', 401, 'UNAUTHORIZED');
  }

  const rateLimitResponse = await enforceRateLimit(req, 'resolution_reopen', 10, 60, user.id);
  if (rateLimitResponse) return rateLimitResponse;

  const { id } = await params;

  let body: { reason?: string };
  try {
    body = await req.json();
  } catch {
    body = { reason: 'User requested matter reopening' };
  }

  const matterService = getMatterService(user.token);
  const matter = await matterService.getMatterById(id, user.id);
  if (!matter) {
    return apiError('Matter not found or access denied', 404, 'NOT_FOUND');
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

    return apiSuccess({
      matterStatus: updatedMatter.status,
      resolution: updatedMatter.resolution
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    Logger.error('Failed to reopen matter', err, { matterId: id });
    return apiError(errMsg, 500, 'REOPEN_MATTER_ERROR');
  }
}
