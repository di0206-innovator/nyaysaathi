import { NextRequest, NextResponse } from 'next/server';
import { getMatterService } from '@/lib/repository';
import { validateCreateMatter } from '@/lib/api/validation';
import { apiSuccess, apiError, getOrGenerateRequestId } from '@/lib/api/response';
import { MatterCategory, MatterStatus } from '@/types/matter';
import { AuthService } from '@/lib/auth/auth-service';
import { Logger } from '@/lib/observability/logger';
import { enforceRateLimit } from '@/lib/security/rate-limiter';
import { SecurityAuditLogger } from '@/lib/observability/audit-logger';
import { IdempotencyManager, calculateSha256 } from '@/lib/api/idempotency';

export async function GET(req: NextRequest) {
  try {
    const user = await AuthService.getAuthenticatedUser(req);
    if (!user) {
      return apiError('Authentication required to access matters', 401, 'UNAUTHORIZED');
    }

    const service = getMatterService(user.token);
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));

    const matters = await service.listMatters({
      userId: user.id,
      category: category as MatterCategory | undefined,
      status: status as MatterStatus | undefined,
      search
    });

    const offset = (page - 1) * limit;
    const paginated = matters.slice(offset, offset + limit);

    Logger.info('Listed user matters successfully', {
      userId: user.id,
      count: paginated.length,
      total: matters.length,
      page,
      operation: 'list_matters'
    });

    return apiSuccess(paginated, 200, {
      count: paginated.length,
      total: matters.length,
      page,
      limit,
      hasMore: offset + limit < matters.length
    });
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

    const rateLimitRes = await enforceRateLimit(req, 'create_matter', 20, 60, user.id);
    if (rateLimitRes) return rateLimitRes;

    const body = await req.json();

    // Durable Idempotency Check
    const idempotencyKey = req.headers.get('idempotency-key');
    if (idempotencyKey) {
      const cached = await IdempotencyManager.getRecord(idempotencyKey, user.id, '/api/matters');
      if (cached) {
        return NextResponse.json(cached.responseBody, {
          status: cached.responseStatus,
          headers: {
            'X-Idempotent-Replay': 'true',
            'X-Request-ID': getOrGenerateRequestId(req)
          }
        });
      }
    }

    const validation = validateCreateMatter(body);

    if (!validation.isValid || !validation.data) {
      return apiError(
        'Validation failed for matter creation.',
        400,
        'VALIDATION_ERROR',
        validation.errors
      );
    }

    const service = getMatterService(user.token);
    const created = await service.createMatter({
      ...validation.data,
      userId: user.id
    });

    SecurityAuditLogger.log({
      action: 'matter_created',
      userId: user.id,
      matterId: created.id,
      resourceType: 'matter',
      status: 'success'
    });

    Logger.info('Created new legal matter', {
      userId: user.id,
      matterId: created.id,
      category: created.category,
      operation: 'create_matter'
    });

    const responsePayload = {
      success: true,
      data: created,
      requestId: getOrGenerateRequestId(req)
    };

    if (idempotencyKey) {
      await IdempotencyManager.saveRecord(
        idempotencyKey,
        user.id,
        '/api/matters',
        201,
        responsePayload,
        calculateSha256(JSON.stringify(body))
      );
    }

    return apiSuccess(created, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create matter';
    Logger.error('Failed to create matter', error, { operation: 'create_matter' });
    return apiError(message, 500, 'CREATE_MATTER_ERROR');
  }
}
