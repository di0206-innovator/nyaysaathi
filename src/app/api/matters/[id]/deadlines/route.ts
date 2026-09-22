import { NextRequest } from 'next/server';
import { AuthService } from '@/lib/auth/auth-service';
import { getMatterService } from '@/lib/repository';
import { enforceRateLimit } from '@/lib/security/rate-limiter';
import { Logger } from '@/lib/observability/logger';
import { DeadlineType, TrustSafetyTier } from '@/types/matter';
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
    deadlines: matter.deadlines || []
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

  const rateLimitRes = await enforceRateLimit(req, 'manage_deadline', 30, 60, user.id);
  if (rateLimitRes) return rateLimitRes;

  const { id } = await params;

  let body: {
    title: string;
    dueDate: string;
    description?: string;
    type?: DeadlineType;
    isStatutory?: boolean;
    statuteReference?: string;
    trustTier?: TrustSafetyTier;
  };

  try {
    body = await req.json();
  } catch {
    return apiError('Invalid JSON payload', 400, 'INVALID_PAYLOAD');
  }

  if (!body.title || !body.dueDate) {
    return apiError('Missing required fields: title, dueDate', 400, 'MISSING_FIELDS');
  }

  const matterService = getMatterService(user.token);
  const matter = await matterService.getMatterById(id, user.id);
  if (!matter) {
    return apiError('Matter not found or access denied', 404, 'NOT_FOUND');
  }

  try {
    const updatedMatter = await matterService.manageDeadline(
      id,
      {
        matterId: id,
        title: body.title,
        dueDate: body.dueDate,
        description: body.description,
        type: body.type || 'user_defined',
        isStatutory: Boolean(body.isStatutory),
        isUserDefined: true,
        confidence: 1.0,
        trustTier: body.trustTier || 'fact',
        status: 'active',
        statuteReference: body.statuteReference
      },
      user.id
    );

    SecurityAuditLogger.log({
      action: 'action_updated',
      userId: user.id,
      matterId: id,
      resourceType: 'deadline',
      status: 'success',
      metadata: { title: body.title, dueDate: body.dueDate }
    });

    Logger.info('User deadline scheduled', {
      matterId: id,
      title: body.title,
      dueDate: body.dueDate
    });

    return apiSuccess({
      deadlines: updatedMatter.deadlines
    }, 201);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    Logger.error('Failed to schedule deadline', err, { matterId: id });
    return apiError(errMsg, 500, 'SCHEDULE_DEADLINE_ERROR');
  }
}
