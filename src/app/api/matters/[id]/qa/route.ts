import { NextRequest } from 'next/server';
import { getMatterService } from '@/lib/repository';
import { getMatterQAService } from '@/lib/qa/qa-service';
import { apiSuccess, apiError } from '@/lib/api/response';
import { SupportedLanguage } from '@/lib/ai';
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
      return apiError('Authentication required to ask matter questions', 401, 'UNAUTHORIZED');
    }

    const rateLimitResponse = await enforceRateLimit(req, 'legal_qa', 25, 60, user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const { id } = await params;

    const body = await req.json();

    if (!body || typeof body !== 'object' || !body.query || typeof body.query !== 'string') {
      return apiError('Question query must be a non-empty string.', 400, 'INVALID_QUERY');
    }

    const query = body.query.trim();
    if (!query) {
      return apiError('Question query cannot be empty.', 400, 'EMPTY_QUERY');
    }

    const language: SupportedLanguage = ['en', 'hi', 'hinglish', 'mr'].includes(body.language)
      ? body.language
      : 'en';

    const matterService = getMatterService(user.token);
    const matter = await matterService.getMatterById(id, user.id);

    if (!matter) {
      return apiError(`Matter not found or access denied: ${id}`, 404, 'NOT_FOUND');
    }

    if (matter.userId && matter.userId !== user.id) {
      return apiError('Access denied: You cannot query another user\'s legal matter', 403, 'FORBIDDEN');
    }

    const qaService = getMatterQAService();
    const result = await qaService.answerQuestion(matter, query, language);

    await SecurityAuditLogger.log({
      action: 'legal_qa_asked',
      userId: user.id,
      matterId: id,
      resource: `matter:${id}:qa`,
      status: 'SUCCESS',
      metadata: { isFullyGrounded: result.isFullyGrounded, citationsCount: result.citations.length }
    });

    Logger.info('Matter question answered with evidence grounding', {
      userId: user.id,
      matterId: id,
      isFullyGrounded: result.isFullyGrounded,
      citationsCount: result.citations.length,
      operation: 'matter_qa'
    });

    return apiSuccess(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to process matter question';
    Logger.error('Failed to process matter question', error, { operation: 'matter_qa' });
    return apiError(message, 500, 'QA_PROCESSING_ERROR');
  }
}
