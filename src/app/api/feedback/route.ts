import { NextRequest, NextResponse } from 'next/server';
import { SecurityAuditLogger } from '@/lib/observability/audit-logger';
import { enforceRateLimit } from '@/lib/security/rate-limiter';
import { Logger } from '@/lib/observability/logger';

export interface PilotFeedbackPayload {
  matterId?: string;
  rating: number; // 1 to 5
  category: 'draft_quality' | 'statute_accuracy' | 'timeline_accuracy' | 'action_utility' | 'general';
  feedbackText: string;
  suggestedCorrection?: string;
  advocateConsulted?: boolean;
}

// In-memory persistent pilot feedback collection for development/analytics
const pilotFeedbackStore: Array<PilotFeedbackPayload & { id: string; timestamp: string; ip: string }> = [];

export async function POST(req: NextRequest) {
  const rateLimitResponse = await enforceRateLimit(req, 'pilot_feedback', 25, 60);
  if (rateLimitResponse) return rateLimitResponse;

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

  try {
    const body = (await req.json()) as PilotFeedbackPayload;

    if (!body || typeof body.rating !== 'number' || body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { error: 'Valid rating between 1 and 5 is required.' },
        { status: 400 }
      );
    }

    if (!body.category || !body.feedbackText) {
      return NextResponse.json(
        { error: 'Category and feedback text are required.' },
        { status: 400 }
      );
    }

    const feedbackEntry = {
      id: `fb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      matterId: body.matterId,
      rating: body.rating,
      category: body.category,
      feedbackText: body.feedbackText.slice(0, 2000), // Enforce length limits
      suggestedCorrection: body.suggestedCorrection?.slice(0, 2000),
      advocateConsulted: Boolean(body.advocateConsulted),
      timestamp: new Date().toISOString(),
      ip
    };

    pilotFeedbackStore.push(feedbackEntry);

    // Audit log feedback receipt without leaking PII
    SecurityAuditLogger.log({
      action: 'matter_analyzed',
      userId: 'pilot_user',
      matterId: body.matterId,
      resource: `feedback:${feedbackEntry.id}`,
      status: 'success',
      ipAddress: ip
    });

    Logger.info('Pilot user feedback recorded', {
      category: body.category,
      rating: body.rating,
      advocateConsulted: body.advocateConsulted
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you. Your feedback helps calibrate NyaySaathi legal precision.',
      feedbackId: feedbackEntry.id
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Invalid feedback payload';
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}

export async function GET() {
  // Aggregate feedback summary for pilot analytics (sanitized, no PII)
  const total = pilotFeedbackStore.length;
  const avgRating = total > 0
    ? Math.round((pilotFeedbackStore.reduce((acc, f) => acc + f.rating, 0) / total) * 10) / 10
    : 5.0;

  const categoriesCount: Record<string, number> = {};
  for (const f of pilotFeedbackStore) {
    categoriesCount[f.category] = (categoriesCount[f.category] || 0) + 1;
  }

  return NextResponse.json({
    totalSubmissions: total,
    averageRating: avgRating,
    categoryBreakdown: categoriesCount,
    recentEntries: pilotFeedbackStore.slice(-10).map(f => ({
      id: f.id,
      category: f.category,
      rating: f.rating,
      feedbackText: f.feedbackText,
      timestamp: f.timestamp
    }))
  });
}
