import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth-service';
import { getMatterService } from '@/lib/repository';
import { enforceRateLimit } from '@/lib/security/rate-limiter';
import { Logger } from '@/lib/observability/logger';
import { SecurityAuditLogger } from '@/lib/observability/audit-logger';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await AuthService.getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rateLimitResponse = await enforceRateLimit(req, 'advocate_pack', 20, 60, user.id);
  if (rateLimitResponse) return rateLimitResponse;

  const { id } = await params;

  const matterService = getMatterService(user.token);
  const matter = await matterService.getMatterById(id, user.id);

  if (!matter) {
    return NextResponse.json({ error: 'Matter not found' }, { status: 404 });
  }

  try {
    const advocatePack = await matterService.generateAdvocateCasePack(id, user.id);

    await SecurityAuditLogger.log({
      action: 'advocate_pack_generated',
      userId: user.id,
      matterId: id,
      resource: `matter:${id}:advocate_pack`,
      status: 'SUCCESS',
      metadata: { sectionsCount: 10 }
    });

    Logger.info('Advocate Case Pack generated', {
      matterId: id,
      sectionsCount: 10
    });

    return NextResponse.json(advocatePack);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    Logger.error('Failed to generate Advocate Case Pack', err, { matterId: id });
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
