import { NextRequest } from 'next/server';
import { getMatterService } from '@/lib/repository';
import { validateCreateMatter } from '@/lib/api/validation';
import { apiSuccess, apiError } from '@/lib/api/response';
import { MatterCategory, MatterStatus } from '@/types/matter';
import { AuthService } from '@/lib/auth/auth-service';
import { Logger } from '@/lib/observability/logger';

export async function GET(req: NextRequest) {
  try {
    const user = await AuthService.getAuthenticatedUser(req);
    if (!user) {
      return apiError('Authentication required to access matters', 401, 'UNAUTHORIZED');
    }

    const service = getMatterService();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    const matters = await service.listMatters({
      userId: user.id,
      category: category as MatterCategory | undefined,
      status: status as MatterStatus | undefined,
      search
    });

    Logger.info('Listed user matters successfully', {
      userId: user.id,
      count: matters.length,
      operation: 'list_matters'
    });

    return apiSuccess(matters, 200, { count: matters.length });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch matters';
    Logger.error('Failed to fetch matters', error, { operation: 'list_matters' });
    return apiError(message, 500, 'FETCH_MATTERS_ERROR');
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await AuthService.getAuthenticatedUser(req);
    if (!user) {
      return apiError('Authentication required to create a matter', 401, 'UNAUTHORIZED');
    }

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
    const created = await service.createMatter({
      ...validation.data,
      userId: user.id
    });

    Logger.info('Created new legal matter', {
      userId: user.id,
      matterId: created.id,
      category: created.category,
      operation: 'create_matter'
    });

    return apiSuccess(created, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create matter';
    Logger.error('Failed to create matter', error, { operation: 'create_matter' });
    return apiError(message, 500, 'CREATE_MATTER_ERROR');
  }
}
