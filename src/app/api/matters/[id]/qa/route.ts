import { NextRequest } from 'next/server';
import { getMatterService } from '@/lib/repository';
import { getMatterQAService } from '@/lib/qa/qa-service';
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

    const matterService = getMatterService();
    const matter = await matterService.getMatterById(id, userId);

    if (!matter) {
      return apiError(`Matter not found: ${id}`, 404, 'NOT_FOUND');
    }

    const qaService = getMatterQAService();
    const result = await qaService.answerQuestion(matter, query, language);

    return apiSuccess(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to process matter question';
    return apiError(message, 500, 'QA_PROCESSING_ERROR');
  }
}
