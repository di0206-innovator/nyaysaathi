import { NextRequest } from 'next/server';
import { getMatterService } from '@/lib/repository';
import { validateCreateMatter } from '@/lib/api/validation';
import { apiSuccess, apiError } from '@/lib/api/response';
import { MatterCategory, MatterStatus } from '@/types/matter';

export async function GET(req: NextRequest) {
  try {
    const service = getMatterService();
    const userId = req.headers.get('x-user-id') || undefined;
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    const matters = await service.listMatters({
      userId,
      category: category as MatterCategory | undefined,
      status: status as MatterStatus | undefined,
      search
    });

    return apiSuccess(matters, 200, { count: matters.length });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch matters';
    return apiError(message, 500, 'FETCH_MATTERS_ERROR');
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = validateCreateMatter(body);

    if (!validation.isValid || !validation.data) {
      return apiError(
        'Validation failed for matter creation.',
        400,
        'VALIDATION_ERROR',
        validation.errors
      );
    }

    const service = getMatterService();
    const userId = req.headers.get('x-user-id') || validation.data.userId || undefined;

    const created = await service.createMatter({
      ...validation.data,
      userId
    });

    return apiSuccess(created, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create matter';
    return apiError(message, 500, 'CREATE_MATTER_ERROR');
  }
}
