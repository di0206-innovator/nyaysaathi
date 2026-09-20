/**
 * Clean Asynchronous Job Tracking Abstraction
 * 
 * Provides truthful status tracking (queued -> processing -> completed | failed)
 * for long-running analytical operations without synthetic timers or fake steppers.
 */

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';
export type JobType = 'deep_analysis' | 'ocr_processing' | 'advocate_pack_export' | 'rag_indexing';

export interface BackgroundJob<T = unknown> {
  id: string;
  type: JobType;
  matterId: string;
  userId?: string;
  status: JobStatus;
  progressPercent: number;
  result?: T;
  error?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  metadata?: Record<string, unknown>;
}

export class JobTracker {
  private static jobs: Map<string, BackgroundJob> = new Map();

  public static createJob<T = unknown>(
    type: JobType,
    matterId: string,
    userId?: string,
    metadata?: Record<string, unknown>
  ): BackgroundJob<T> {
    const id = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const job: BackgroundJob<T> = {
      id,
      type,
      matterId,
      userId,
      status: 'queued',
      progressPercent: 0,
      createdAt: new Date().toISOString(),
      metadata
    };
    this.jobs.set(id, job as BackgroundJob);
    return job;
  }

  public static updateStatus(
    id: string,
    status: JobStatus,
    progressPercent?: number,
    error?: string
  ): BackgroundJob | null {
    const job = this.jobs.get(id);
    if (!job) return null;

    job.status = status;
    if (progressPercent !== undefined) {
      job.progressPercent = Math.min(100, Math.max(0, progressPercent));
    }
    if (error) {
      job.error = error;
    }
    if (status === 'processing' && !job.startedAt) {
      job.startedAt = new Date().toISOString();
    }
    if (status === 'completed' || status === 'failed') {
      job.completedAt = new Date().toISOString();
    }

    return job;
  }

  public static completeJob<T = unknown>(id: string, result: T): BackgroundJob<T> | null {
    const job = this.jobs.get(id);
    if (!job) return null;

    job.status = 'completed';
    job.progressPercent = 100;
    job.result = result;
    job.completedAt = new Date().toISOString();

    return job as BackgroundJob<T>;
  }

  public static getJob(id: string): BackgroundJob | null {
    return this.jobs.get(id) || null;
  }

  public static listByMatter(matterId: string): BackgroundJob[] {
    return Array.from(this.jobs.values()).filter(j => j.matterId === matterId);
  }

  public static clear(): void {
    this.jobs.clear();
  }
}
