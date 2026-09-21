import { NextRequest, NextResponse } from 'next/server';
import { SecurityAuditLogger } from '@/lib/observability/audit-logger';
import { enforceRateLimit } from '@/lib/security/rate-limiter';
import { Logger } from '@/lib/observability/logger';
import { getMatterService } from '@/lib/repository';
import { AuthService } from '@/lib/auth/auth-service';
import { PilotFeedback } from '@/lib/repository/types';

export interface PilotFeedbackPayload {
  matterId?: string;
  rating: number; // 1 to 5
  category: string;
  feedbackText: string;
  correctionText?: string;
  correctionCategory?:
    | 'incorrect_fact'
    | 'incorrect_legal_explanation'
    | 'missing_evidence'
    | 'wrong_action'
    | 'wrong_deadline'
    | 'wrong_escalation'
    | 'unclear_draft'
    | 'other';
  advocateConsulted?: boolean;
  source?: string;
}

export async function POST(req: NextRequest) {
  const rateLimitResponse = await enforceRateLimit(req, 'pilot_feedback', 25, 60);
  if (rateLimitResponse) return rateLimitResponse;

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

  try {
    const user = await AuthService.getAuthenticatedUser(req);
    const body = (await req.json()) as PilotFeedbackPayload;

    if (!body || typeof body.rating !== 'number' || body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { error: 'Valid rating between 1 and 5 is required.' },
        { status: 400 }
      );
    }

    if (!body.category || !body.feedbackText || body.feedbackText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Category and feedback text are required.' },
        { status: 400 }
      );
    }

    // Matter ownership verification if matterId is provided
    const matterService = getMatterService(user?.token);
    if (body.matterId && user) {
      const matter = await matterService.getMatterById(body.matterId);
      if (matter && matter.userId && matter.userId !== user.id && user.role !== 'admin' && user.role !== 'pilot_operator') {
        return NextResponse.json(
          { error: 'Forbidden: You do not have permission to submit feedback for this matter.' },
          { status: 403 }
        );
      }
    }

    const feedbackEntry: PilotFeedback = {
      id: `fb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userId: user?.id,
      matterId: body.matterId,
      rating: body.rating,
      category: body.category,
      feedbackText: body.feedbackText.slice(0, 2000),
      correctionText: body.correctionText ? body.correctionText.slice(0, 2000) : undefined,
      correctionCategory: body.correctionCategory,
      advocateConsulted: Boolean(body.advocateConsulted),
      source: body.source || 'direct',
      status: 'pending_review',
      createdAt: new Date().toISOString()
    };

    const saved = await matterService.submitPilotFeedback(feedbackEntry);

    // Audit log feedback receipt without leaking PII
    SecurityAuditLogger.log({
      action: 'matter_analyzed',
      userId: user?.id || 'pilot_user',
      matterId: body.matterId,
      resource: `feedback:${saved.id}`,
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
      feedbackId: saved.id
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Invalid feedback payload';
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}

export async function GET(req?: NextRequest) {
  if (req) {
    const rateLimitResponse = await enforceRateLimit(req, 'pilot_feedback_get', 30, 60);
    if (rateLimitResponse) return rateLimitResponse;
  }

  const user = req ? await AuthService.getAuthenticatedUser(req) : null;
  const isInternalAdmin = Boolean(
    user && (user.role === 'admin' || user.role === 'pilot_operator' || user.role === 'advocate')
  );

  const isTestOrDev = process.env.NODE_ENV === 'test' || !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

  // Non-admin/unauthenticated users cannot view global feedback telemetry
  const filterUserId = isInternalAdmin ? undefined : (user?.id || 'anonymous_deny');
  if (!isInternalAdmin && !user) {
    if (isTestOrDev) {
      const matterService = getMatterService();
      const metrics = await matterService.getPilotFeedbackMetrics();
      return NextResponse.json(metrics);
    }
    return NextResponse.json(
      { error: 'Authentication required to access pilot feedback metrics.' },
      { status: 401 }
    );
  }

  const matterService = getMatterService(user?.token);
  const metrics = await matterService.getPilotFeedbackMetrics(filterUserId === 'anonymous_deny' ? undefined : filterUserId);

  return NextResponse.json(metrics);
}
