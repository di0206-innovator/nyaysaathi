import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth-service';
import { getMatterService } from '@/lib/repository';
import { RateLimiter } from '@/lib/security/rate-limiter';
import { Logger } from '@/lib/observability/logger';
import { DeadlineType, TrustSafetyTier } from '@/types/matter';

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
    deadlines: matter.deadlines || []
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

  const { id } = await params;

  // Rate limiting: 30 requests / min
  const rateLimit = RateLimiter.check(`deadlines:${user.id}`, 30, 60);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded for setting deadlines. Please wait.' },
      { status: 429 }
    );
  }

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
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  if (!body.title || !body.dueDate) {
    return NextResponse.json(
      { error: 'Missing required fields: title, dueDate' },
      { status: 400 }
    );
  }

  const matterService = getMatterService();
  const matter = await matterService.getMatterById(id, user.id);
  if (!matter) {
    return NextResponse.json({ error: 'Matter not found or access denied' }, { status: 404 });
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

    Logger.info('User deadline scheduled', {
      matterId: id,
      title: body.title,
      dueDate: body.dueDate
    });

    return NextResponse.json({
      success: true,
      deadlines: updatedMatter.deadlines
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    Logger.error('Failed to schedule deadline', err, { matterId: id });
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
