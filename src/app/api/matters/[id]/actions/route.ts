import { NextRequest } from 'next/server';
import { AuthService } from '@/lib/auth/auth-service';
import { getMatterService } from '@/lib/repository';
import { enforceRateLimit } from '@/lib/security/rate-limiter';
import { Logger } from '@/lib/observability/logger';
import { ActionStep, ActionStatus, ActionResult } from '@/types/matter';
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
    actions: matter.actionPlan || []
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await AuthService.getAuthenticatedUser(req);
  if (!user) {
    return apiError('Authentication required', 401, 'UNAUTHORIZED');
  }

  const rateLimitRes = await enforceRateLimit(req, 'update_action', 45, 60, user.id);
  if (rateLimitRes) return rateLimitRes;

  const { id } = await params;

  let body: {
    actionId: string;
    status?: ActionStatus;
    notes?: string;
    dueDate?: string;
    completionProof?: ActionStep['completionProof'];
    result?: ActionResult;
    blockingReason?: string;
  };

  try {
    body = await req.json();
  } catch {
    return apiError('Invalid JSON payload in request body', 400, 'INVALID_PAYLOAD');
  }

  if (!body.actionId) {
    return apiError('actionId is required in request body', 400, 'MISSING_ACTION_ID');
  }

  try {
    const matterService = getMatterService(user.token);
    const updatedMatter = await matterService.updateActionStep(
      id,
      body.actionId,
      {
        status: body.status,
        notes: body.notes,
        dueDate: body.dueDate,
        completionProof: body.completionProof,
        result: body.result,
        blockingReason: body.blockingReason
      },
      user.id
    );

    const updatedAction = updatedMatter.actionPlan.find((a: ActionStep) => a.id === body.actionId);

    SecurityAuditLogger.log({
      action: 'action_updated',
      userId: user.id,
      matterId: id,
      resourceType: 'action',
      resourceId: body.actionId,
      status: 'success',
      metadata: { status: body.status }
    });

    Logger.info('Action step updated', {
      matterId: id,
      actionId: body.actionId,
      actionStatus: body.status
    });

    return apiSuccess({
      action: updatedAction,
      matterStatus: updatedMatter.status
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Failed to update action step';
    Logger.error('Failed to update action step', err, { matterId: id, actionId: body.actionId });
    return apiError(errMsg, 500, 'UPDATE_ACTION_ERROR');
  }
}
