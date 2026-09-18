import { NextRequest } from 'next/server';
import { getMatterService } from '@/lib/repository';
import { getLanguageService } from '@/lib/multilingual/language-service';
import { apiSuccess, apiError } from '@/lib/api/response';
import { SupportedLanguage } from '@/lib/ai';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = req.headers.get('x-user-id') || undefined;
    const body = await req.json();

    const targetLanguage: SupportedLanguage = ['en', 'hi', 'hinglish', 'mr'].includes(body?.language)
      ? body.language
      : 'en';

    const matterService = getMatterService();
    const matter = await matterService.getMatterById(id, userId);

    if (!matter) {
      return apiError(`Matter not found: ${id}`, 404, 'NOT_FOUND');
    }

    const langService = getLanguageService();
    const localized = await langService.localizeMatter(matter, targetLanguage);

    return apiSuccess(localized);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to localize matter';
    return apiError(message, 500, 'TRANSLATION_ERROR');
  }
}
