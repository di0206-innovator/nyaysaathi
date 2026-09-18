import { NextRequest } from 'next/server';
import { getMatterService } from '@/lib/repository';
import { validateAnalyzeTrigger } from '@/lib/api/validation';
import { apiSuccess, apiError } from '@/lib/api/response';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = req.headers.get('x-user-id') || undefined;

    let body: unknown = {};
    try {
      body = await req.json();
    } catch {
      // Body may be empty, defaults to full
      body = {};
    }

    const validation = validateAnalyzeTrigger(body);
    if (!validation.isValid) {
      return apiError(
        validation.error || 'Invalid analysis trigger',
        400,
        'INVALID_TRIGGER'
      );
    }

    const service = getMatterService();
    const reanalyzed = await service.reanalyzeMatter(id, validation.trigger, userId);

    if (!reanalyzed) {
      return apiError('Matter not found', 404, 'NOT_FOUND');
    }

    return apiSuccess(reanalyzed, 200, {
      trigger: validation.trigger,
      message: `Matter re-analyzed successfully (Trigger: ${validation.trigger})`
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to analyze matter';
    return apiError(message, 500, 'ANALYZE_MATTER_ERROR');
  }
}
