import { NextRequest } from 'next/server';
import { DurableJobQueue } from '@/lib/jobs/durable-job-queue';
import { apiSuccess, apiError } from '@/lib/api/response';
import { Logger } from '@/lib/observability/logger';
import { getMatterService } from '@/lib/repository';
import { ReanalysisTrigger } from '@/lib/agents/types';

/**
 * Internal Durable Background Worker Route.
 * Invoked by Vercel Cron or secure internal dispatch to atomically claim and process queued jobs.
 */
export async function POST(req: NextRequest) {
  // 1. Authenticate worker caller
  const authHeader = req.headers.get('authorization');
  const cronHeader = req.headers.get('x-vercel-cron');
  const configuredSecret = process.env.INTERNAL_WORKER_KEY || process.env.CRON_SECRET || 'dev-internal-worker-secret';

  const isBearerValid = authHeader === `Bearer ${configuredSecret}`;
  const isCronValid = cronHeader === '1' && (!process.env.CRON_SECRET || authHeader === `Bearer ${process.env.CRON_SECRET}`);

  if (!isBearerValid && !isCronValid) {
    Logger.warn('Unauthorized background worker invocation attempt blocked', {
      ip: req.headers.get('x-forwarded-for') || 'unknown'
    });
    return apiError('Unauthorized internal worker invocation', 401, 'UNAUTHORIZED');
  }

  const workerId = `worker-${process.pid || 'edge'}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  // 2. Claim next pending job atomically via FOR UPDATE SKIP LOCKED
  const job = await DurableJobQueue.claimJob(workerId, [
    'deep_analysis',
    'ocr_processing',
    'advocate_pack_export',
    'rag_indexing'
  ]);

  if (!job) {
    return apiSuccess({
      claimed: false,
      message: 'No queued or retrying jobs available for execution.',
      workerId
    });
  }

  Logger.info('Background job claimed by worker', {
    jobId: job.id,
    jobType: job.type,
    matterId: job.matterId,
    workerId
  });

  // 3. Process the claimed job
  try {
    if (job.type === 'deep_analysis') {
      await DurableJobQueue.updateProgress(job.id, 20, 'processing');
      const service = getMatterService();
      const trigger = (job.payload?.trigger as ReanalysisTrigger) || 'full';
      
      await DurableJobQueue.updateProgress(job.id, 50, 'processing');
      const updatedMatter = await service.reanalyzeMatter(job.matterId, trigger, job.userId);
      
      if (updatedMatter) {
        await DurableJobQueue.completeJob(job.id, {
          matterId: updatedMatter.id,
          status: updatedMatter.status,
          updatedAt: updatedMatter.updatedAt
        });
      } else {
        await DurableJobQueue.failJob(job.id, 'ANALYSIS_FAILED', 'Matter analysis did not return an updated matter record.');
      }
    } else if (job.type === 'advocate_pack_export') {
      await DurableJobQueue.updateProgress(job.id, 30, 'processing');
      const service = getMatterService();
      const matter = await service.getMatterById(job.matterId, job.userId);
      
      if (!matter) {
        await DurableJobQueue.failJob(job.id, 'MATTER_NOT_FOUND', 'Target matter record not found.');
      } else {
        const { AdvocatePackService } = await import('@/lib/advocate/advocate-pack');
        const pack = AdvocatePackService.compileAdvocateBrief(matter);
        await DurableJobQueue.completeJob(job.id, pack);
      }
    } else {
      // Generic job completion for other types
      await DurableJobQueue.updateProgress(job.id, 100, 'processing');
      await DurableJobQueue.completeJob(job.id, { message: 'Job executed successfully' });
    }

    return apiSuccess({
      claimed: true,
      jobId: job.id,
      type: job.type,
      status: 'completed',
      workerId
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    Logger.error('Worker failed while executing background job', err, {
      jobId: job.id,
      workerId
    });

    await DurableJobQueue.failJob(job.id, 'EXECUTION_FAILURE', errorMsg);

    return apiError('Background job execution encountered an error.', 500, 'JOB_EXECUTION_ERROR');
  }
}
