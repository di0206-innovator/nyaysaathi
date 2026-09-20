import { NextRequest } from 'next/server';
import { getMatterService } from '@/lib/repository';
import { getLanguageService } from '@/lib/multilingual/language-service';
import { apiSuccess, apiError } from '@/lib/api/response';
import { SupportedLanguage } from '@/lib/ai';
import { AuthService } from '@/lib/auth/auth-service';
import { enforceRateLimit } from '@/lib/security/rate-limiter';
import { Logger } from '@/lib/observability/logger';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await AuthService.getAuthenticatedUser(req);
    if (!user) {
      return apiError('Authentication required to translate matter', 401, 'UNAUTHORIZED');
    }

    const rateLimitResponse = await enforceRateLimit(req, 'translate', 30, 60, user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const { id } = await params;
    const body = await req.json();

    const targetLanguage: SupportedLanguage = ['en', 'hi', 'hinglish', 'mr'].includes(body?.language)
      ? body.language
      : 'en';

    const matterService = getMatterService(user.token);
    const matter = await matterService.getMatterById(id, user.id);

    if (!matter) {
      return apiError(`Matter not found or access denied: ${id}`, 404, 'NOT_FOUND');
    }

    if (matter.userId && matter.userId !== user.id) {
      return apiError('Access denied: You cannot access this matter', 403, 'FORBIDDEN');
    }

    const langService = getLanguageService();
    const localized = await langService.localizeMatter(matter, targetLanguage);

    Logger.info('Matter localized successfully', {
      userId: user.id,
      matterId: id,
      targetLanguage,
      operation: 'translate_matter'
    });

    return apiSuccess(localized);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to localize matter';
    Logger.error('Failed to localize matter', error, { operation: 'translate_matter' });
    return apiError(message, 500, 'TRANSLATION_ERROR');
  }
}
