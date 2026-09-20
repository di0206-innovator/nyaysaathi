import { NextRequest } from 'next/server';
import { getMatterService } from '@/lib/repository';
import { validateAnalyzeTrigger } from '@/lib/api/validation';
import { apiSuccess, apiError } from '@/lib/api/response';
import { AuthService } from '@/lib/auth/auth-service';
import { enforceRateLimit } from '@/lib/security/rate-limiter';
import { Logger } from '@/lib/observability/logger';
import { SecurityAuditLogger } from '@/lib/observability/audit-logger';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await AuthService.getAuthenticatedUser(req);
    if (!user) {
      return apiError('Authentication required to run matter analysis', 401, 'UNAUTHORIZED');
    }

    const rateLimitRes = await enforceRateLimit(req, 'analyze_matter', 15, 60, user.id);
    if (rateLimitRes) return rateLimitRes;

    const { id } = await params;
    const service = getMatterService(user.token);
    const existing = await service.getMatterById(id, user.id);
    if (!existing) {
      return apiError('Matter not found or access denied', 404, 'NOT_FOUND');
    }

    if (existing.userId && existing.userId !== user.id) {
      return apiError('Access denied: You cannot analyze another user\'s matter', 403, 'FORBIDDEN');
    }

    let body: unknown = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const validation = validateAnalyzeTrigger(body);
    if (!validation.isValid) {
      return apiError(
        validation.error || 'Invalid analysis trigger',
        400,
        'INVALID_TRIGGER'
      );
    }

    const reanalyzed = await service.reanalyzeMatter(id, validation.trigger, user.id);
    if (!reanalyzed) {
      return apiError('Failed to re-analyze matter', 500, 'REANALYZE_FAILED');
    }

    SecurityAuditLogger.log({
      action: 'matter_updated',
      userId: user.id,
      matterId: id,
      resourceType: 'analysis',
      status: 'success',
      metadata: { trigger: validation.trigger }
    });

    Logger.info('Matter re-analyzed successfully', {
      userId: user.id,
      matterId: id,
      trigger: validation.trigger,
      operation: 'reanalyze_matter'
    });

    return apiSuccess(reanalyzed, 200, {
      trigger: validation.trigger,
      message: `Matter re-analyzed successfully (Trigger: ${validation.trigger})`
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to analyze matter';
    Logger.error('Failed to analyze matter', error, { operation: 'reanalyze_matter' });
    return apiError(message, 500, 'ANALYZE_MATTER_ERROR');
  }
}
