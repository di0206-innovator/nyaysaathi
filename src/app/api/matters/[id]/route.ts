import { NextRequest } from 'next/server';
import { getMatterService } from '@/lib/repository';
import { apiSuccess, apiError } from '@/lib/api/response';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = req.headers.get('x-user-id') || undefined;
    const service = getMatterService();
    const matter = await service.getMatterById(id, userId);

    if (!matter) {
      return apiError('Matter not found', 404, 'NOT_FOUND');
    }

    return apiSuccess(matter);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch matter';
    return apiError(message, 500, 'FETCH_MATTER_ERROR');
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = req.headers.get('x-user-id') || undefined;
    const updates = await req.json();

    if (!updates || typeof updates !== 'object') {
      return apiError('Updates must be a valid JSON object', 400, 'INVALID_PAYLOAD');
    }

    const service = getMatterService();
    const updated = await service.updateMatter(id, updates, userId);

    if (!updated) {
      return apiError('Matter not found or unauthorized to update', 404, 'NOT_FOUND');
    }

    return apiSuccess(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update matter';
    return apiError(message, 500, 'UPDATE_MATTER_ERROR');
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = req.headers.get('x-user-id') || undefined;
    const service = getMatterService();
    const deleted = await service.deleteMatter(id, userId);

    if (!deleted) {
      return apiError('Matter not found or unauthorized to delete', 404, 'NOT_FOUND');
    }

    return apiSuccess({ id, deleted: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete matter';
    return apiError(message, 500, 'DELETE_MATTER_ERROR');
  }
}
