import { NextRequest } from 'next/server';
import { getMatterService } from '@/lib/repository';
import { AuthService } from '@/lib/auth/auth-service';
import { apiSuccess, apiError } from '@/lib/api/response';
import { enforceRateLimit } from '@/lib/security/rate-limiter';
import { SecurityAuditLogger } from '@/lib/observability/audit-logger';

// Allowed client telemetry events
const ALLOWED_TELEMETRY_EVENTS = new Set([
  'page_view',
  'action_started',
  'action_completed',
  'notice_drafted',
  'notice_dispatched',
  'feedback_opened',
  'advocate_pack_opened'
]);

export async function GET(req: NextRequest) {
  try {
    const rateLimitRes = await enforceRateLimit(req, 'analytics_view', 30, 60);
    if (rateLimitRes) return rateLimitRes;

    const user = await AuthService.getAuthenticatedUser(req);
    if (!user) {
      return apiError('Authentication required to access analytics telemetry.', 401, 'UNAUTHORIZED');
    }

    const searchParams = req.nextUrl.searchParams;
    const scope = searchParams.get('scope') || 'auto';

    const isInternalAdmin = Boolean(
      user.role === 'admin' || user.role === 'pilot_operator' || user.role === 'advocate'
    );

    // If a non-operator asks for pilot/aggregate scope, deny with 403 Forbidden
    if (scope === 'pilot' && !isInternalAdmin) {
      return apiError('Forbidden: Global pilot analytics requires administrator or operator role.', 403, 'FORBIDDEN');
    }

    // Determine target scope
    const isGlobal = isInternalAdmin && (scope === 'pilot' || (scope === 'auto' && !searchParams.has('scope')));
    const filterUserId = isGlobal ? undefined : user.id;

    const matterService = getMatterService(user.token);
    const [funnel, feedbackMetrics, mattersList] = await Promise.all([
      matterService.calculateFunnelMetrics(filterUserId),
      matterService.getPilotFeedbackMetrics(filterUserId),
      filterUserId ? matterService.listMatters({ userId: filterUserId }) : matterService.getAdapter().matters.list()
    ]);

    // Calculate acquisition source breakdown
    const sourceBreakdown: Record<string, number> = {};
    for (const m of mattersList) {
      const src = m.acquisitionSource || 'direct';
      sourceBreakdown[src] = (sourceBreakdown[src] || 0) + 1;
    }

    // Financial totals
    const totalDisputed = mattersList.reduce((acc, m) => acc + (m.claimAmount || 0), 0);
    const resolvedMatters = mattersList.filter(m => m.resolution && !m.resolution.isReopened);
    const totalRecovered = resolvedMatters.reduce((acc, m) => acc + (m.resolution?.amountRecovered || 0), 0);

    const { Metrics } = await import('@/lib/observability/metrics');
    const operational = Metrics.getProductionTelemetry();

    return apiSuccess({
      scope: isGlobal ? 'pilot_aggregate' : 'user',
      funnel,
      feedback: feedbackMetrics,
      acquisition: sourceBreakdown,
      financial: {
        totalDisputed,
        totalRecovered,
        resolvedCount: resolvedMatters.length,
        sampleSize: mattersList.length
      },
      operational: isInternalAdmin ? operational : undefined
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to generate analytics';
    return apiError(msg, 500, 'ANALYTICS_ERROR');
  }
}

export async function POST(req: NextRequest) {
  try {
    const rateLimitRes = await enforceRateLimit(req, 'analytics_ingest', 60, 60);
    if (rateLimitRes) return rateLimitRes;

    const body = await req.json();
    if (!body || typeof body !== 'object' || !body.event) {
      return apiError('Invalid telemetry event: event name required', 400, 'INVALID_EVENT');
    }

    const eventName = String(body.event).trim();
    if (!ALLOWED_TELEMETRY_EVENTS.has(eventName)) {
      return apiError(`Unrecognized telemetry event: ${eventName}`, 400, 'DISALLOWED_EVENT');
    }

    // Sanitize metadata to guarantee NO raw PII (names, numbers, stories) is ingested
    const sanitizedMetadata: Record<string, unknown> = {};
    if (body.metadata && typeof body.metadata === 'object') {
      for (const [key, val] of Object.entries(body.metadata)) {
        // Only permit non-sensitive primitive indicators
        if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
          if (!['name', 'email', 'phone', 'story', 'text', 'address'].some(forbidden => key.toLowerCase().includes(forbidden))) {
            sanitizedMetadata[key] = val;
          }
        }
      }
    }

    SecurityAuditLogger.log({
      action: 'telemetry_event',
      resourceType: 'telemetry',
      status: 'success',
      metadata: { event: eventName, ...sanitizedMetadata }
    });

    return apiSuccess({ recorded: true, event: eventName });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to record telemetry';
    return apiError(msg, 400, 'INGEST_ERROR');
  }
}
