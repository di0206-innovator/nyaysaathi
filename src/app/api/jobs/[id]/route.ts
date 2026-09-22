import { NextRequest } from 'next/server';
import { AuthService } from '@/lib/auth/auth-service';
import { DurableJobQueue } from '@/lib/jobs/durable-job-queue';
import { apiSuccess, apiError } from '@/lib/api/response';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await AuthService.getAuthenticatedUser(req);
    const { id } = await params;

    const job = await DurableJobQueue.getJob(id, user?.id);
    if (!job) {
      return apiError('Job not found or access denied', 404, 'NOT_FOUND');
    }

    return apiSuccess({
      id: job.id,
      type: job.type,
      matterId: job.matterId,
      status: job.status,
      progressPercent: job.progressPercent,
      attempts: job.attempts,
      result: job.result,
      errorCode: job.errorCode,
      createdAt: job.createdAt,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      updatedAt: job.updatedAt
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve background job';
    return apiError(message, 500, 'GET_JOB_ERROR');
  }
}
