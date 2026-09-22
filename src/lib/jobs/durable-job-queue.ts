import { getSupabaseClient, isSupabaseConfigured } from '@/lib/db/supabase';

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'retrying';
export type JobType = 'deep_analysis' | 'ocr_processing' | 'advocate_pack_export' | 'rag_indexing';

export interface BackgroundJob<T = unknown> {
  id: string;
  type: JobType;
  matterId: string;
  userId?: string;
  status: JobStatus;
  progressPercent: number;
  attempts: number;
  maxAttempts: number;
  lockedBy?: string;
  payload?: Record<string, unknown>;
  result?: T;
  errorCode?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  updatedAt: string;
}

const memoryJobs = new Map<string, BackgroundJob>();

export class DurableJobQueue {
  /**
   * Enqueue a new durable background job.
   */
  public static async createJob<T = unknown>(
    type: JobType,
    matterId: string,
    userId?: string,
    payload?: Record<string, unknown>
  ): Promise<BackgroundJob<T>> {
    const id = `job_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const now = new Date().toISOString();

    const job: BackgroundJob<T> = {
      id,
      type,
      matterId,
      userId,
      status: 'queued',
      progressPercent: 0,
      attempts: 0,
      maxAttempts: 3,
      payload,
      createdAt: now,
      updatedAt: now
    };

    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          const { data, error } = await client
            .from('background_jobs')
            .insert({
              id,
              type,
              matter_id: matterId,
              user_id: userId,
              status: 'queued',
              progress_percent: 0,
              attempts: 0,
              max_attempts: 3,
              payload
            })
            .select()
            .single();

          if (!error && data) {
            return {
              id: data.id,
              type: data.type,
              matterId: data.matter_id,
              userId: data.user_id,
              status: data.status,
              progressPercent: data.progress_percent,
              attempts: data.attempts,
              maxAttempts: data.max_attempts,
              payload: data.payload,
              createdAt: data.created_at,
              updatedAt: data.updated_at
            };
          }
        } catch {
          // Fall back to memory
        }
      }
    }

    memoryJobs.set(id, job as BackgroundJob);
    return job;
  }

  /**
   * Atomically claim a pending job for internal worker execution.
   * Uses FOR UPDATE SKIP LOCKED via RPC in Postgres, or memory queue in local dev.
   */
  public static async claimJob(
    workerId: string,
    jobTypes?: JobType[],
    staleTimeoutSeconds: number = 300
  ): Promise<BackgroundJob | null> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          const { data, error } = await client.rpc('claim_background_job', {
            p_worker_id: workerId,
            p_job_types: jobTypes || null,
            p_stale_timeout_seconds: staleTimeoutSeconds
          });

          if (!error && data && data.length > 0) {
            const row = data[0];
            return {
              id: row.id,
              type: row.type,
              matterId: row.matter_id,
              userId: row.user_id,
              status: row.status,
              progressPercent: row.progress_percent,
              attempts: row.attempts,
              maxAttempts: row.max_attempts,
              lockedBy: workerId,
              payload: row.payload,
              result: row.result,
              errorCode: row.error_code,
              createdAt: row.created_at,
              startedAt: row.started_at,
              completedAt: row.completed_at,
              updatedAt: row.updated_at
            };
          }
        } catch {
          // Fall back to memory claiming
        }
      }
    }

    // In-memory stale recovery before claiming
    this.recoverStaleJobsInMemory(staleTimeoutSeconds);

    // In-memory atomic simulation
    for (const [id, job] of memoryJobs.entries()) {
      if (job.status === 'queued' || (job.status === 'retrying' && job.attempts < job.maxAttempts)) {
        if (!jobTypes || jobTypes.includes(job.type)) {
          job.status = 'processing';
          job.lockedBy = workerId;
          job.attempts += 1;
          job.startedAt = new Date().toISOString();
          job.updatedAt = new Date().toISOString();
          memoryJobs.set(id, job);
          return { ...job };
        }
      }
    }

    return null;
  }

  /**
   * Recovers stale jobs whose execution lease exceeded timeout without completing.
   */
  public static async recoverStaleJobs(staleTimeoutSeconds: number = 300): Promise<number> {
    let recoveredCount = 0;

    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          const cutoff = new Date(Date.now() - staleTimeoutSeconds * 1000).toISOString();
          const { data } = await client
            .from('background_jobs')
            .update({
              status: 'queued',
              locked_by: null,
              locked_until: null,
              updated_at: new Date().toISOString()
            })
            .eq('status', 'processing')
            .lt('started_at', cutoff)
            .select('id');
          recoveredCount = data?.length || 0;
        } catch {
          // Fall back to memory
        }
      }
    }

    recoveredCount += this.recoverStaleJobsInMemory(staleTimeoutSeconds);
    return recoveredCount;
  }

  private static recoverStaleJobsInMemory(staleTimeoutSeconds: number): number {
    let count = 0;
    const now = Date.now();
    for (const [id, job] of memoryJobs.entries()) {
      if (job.status === 'processing' && job.startedAt) {
        const startedTime = new Date(job.startedAt).getTime();
        if (now - startedTime >= staleTimeoutSeconds * 1000) {
          if (job.attempts < job.maxAttempts) {
            job.status = 'queued';
            job.lockedBy = undefined;
            job.updatedAt = new Date().toISOString();
          } else {
            job.status = 'failed';
            job.errorCode = 'STALE_LEASE_TIMEOUT';
            job.lockedBy = undefined;
            job.completedAt = new Date().toISOString();
            job.updatedAt = new Date().toISOString();
          }
          memoryJobs.set(id, job);
          count++;
        }
      }
    }
    return count;
  }

  /**
   * Update progress of a processing job.
   */
  public static async updateProgress(
    jobId: string,
    progressPercent: number,
    status: JobStatus = 'processing'
  ): Promise<void> {
    const clamped = Math.min(100, Math.max(0, Math.round(progressPercent)));
    const now = new Date().toISOString();

    const memJob = memoryJobs.get(jobId);
    if (memJob) {
      memJob.progressPercent = clamped;
      memJob.status = status;
      memJob.updatedAt = now;
    }

    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          await client
            .from('background_jobs')
            .update({
              progress_percent: clamped,
              status,
              updated_at: now
            })
            .eq('id', jobId);
        } catch {
          // Best effort
        }
      }
    }
  }

  /**
   * Mark job as completed with structured result.
   */
  public static async completeJob<T = unknown>(jobId: string, result: T): Promise<void> {
    const now = new Date().toISOString();

    const memJob = memoryJobs.get(jobId);
    if (memJob) {
      memJob.status = 'completed';
      memJob.progressPercent = 100;
      memJob.result = result;
      memJob.completedAt = now;
      memJob.updatedAt = now;
    }

    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          await client
            .from('background_jobs')
            .update({
              status: 'completed',
              progress_percent: 100,
              result: result as unknown as Record<string, unknown>,
              completed_at: now,
              updated_at: now
            })
            .eq('id', jobId);
        } catch {
          // Best effort
        }
      }
    }
  }

  /**
   * Mark job as failed.
   */
  public static async failJob(jobId: string, errorCode: string, errorMessage?: string): Promise<void> {
    const now = new Date().toISOString();

    const memJob = memoryJobs.get(jobId);
    if (memJob) {
      memJob.status = 'failed';
      memJob.errorCode = errorCode;
      if (errorMessage) {
        memJob.payload = { ...(memJob.payload || {}), errorMessage };
      }
      memJob.completedAt = now;
      memJob.updatedAt = now;
    }

    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          await client
            .from('background_jobs')
            .update({
              status: 'failed',
              error_code: errorCode,
              payload: errorMessage ? { errorMessage } : {},
              completed_at: now,
              updated_at: now
            })
            .eq('id', jobId);
        } catch {
          // Best effort
        }
      }
    }
  }

  /**
   * Retrieve a job by ID, verifying user tenancy when userId is supplied.
   */
  public static async getJob(jobId: string, userId?: string): Promise<BackgroundJob | null> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          let query = client.from('background_jobs').select('*').eq('id', jobId);
          if (userId) {
            query = query.eq('user_id', userId);
          }
          const { data, error } = await query.single();
          if (!error && data) {
            return {
              id: data.id,
              type: data.type,
              matterId: data.matter_id,
              userId: data.user_id,
              status: data.status,
              progressPercent: data.progress_percent,
              attempts: data.attempts,
              maxAttempts: data.max_attempts,
              payload: data.payload,
              result: data.result,
              errorCode: data.error_code,
              createdAt: data.created_at,
              startedAt: data.started_at,
              completedAt: data.completed_at,
              updatedAt: data.updated_at
            };
          }
        } catch {
          // Fall back to memory
        }
      }
    }

    const job = memoryJobs.get(jobId);
    if (!job) return null;
    if (userId && job.userId && job.userId !== userId) {
      return null;
    }
    return job;
  }

  public static clearMemory(): void {
    memoryJobs.clear();
  }
}
