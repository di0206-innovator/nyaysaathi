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

    if (!body.category || !body.feedbackText) {
      return NextResponse.json(
        { error: 'Category and feedback text are required.' },
        { status: 400 }
      );
    }

    const matterService = getMatterService();
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

export async function GET() {
  const matterService = getMatterService();
  const metrics = await matterService.getPilotFeedbackMetrics();

  return NextResponse.json(metrics);
}
