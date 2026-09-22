import { isSupabaseConfigured } from '@/lib/db/supabase';
import { OCRFactory } from '@/lib/ocr/ocr-factory';
import { apiSuccess } from '@/lib/api/response';

export type ReadinessState = 'healthy' | 'degraded' | 'unavailable';

export async function GET() {
  const dbConfigured = isSupabaseConfigured();
  const ocrHealth = await OCRFactory.getAggregatedHealth().catch(() => null);

  let overallStatus: ReadinessState = 'healthy';
  const checks: Record<string, { status: ReadinessState; message: string }> = {};

  // Database check
  if (dbConfigured) {
    checks.database = {
      status: 'healthy',
      message: 'PostgreSQL / Supabase client configured and active.'
    };
  } else {
    overallStatus = 'degraded';
    checks.database = {
      status: 'degraded',
      message: 'Running in local memory adapter mode (Supabase credentials not configured in current environment).'
    };
  }

  // Storage check
  checks.storage = {
    status: dbConfigured ? 'healthy' : 'degraded',
    message: dbConfigured
      ? 'Supabase private evidence bucket configured.'
      : 'Local memory storage provider active.'
  };

  // OCR readiness
  if (ocrHealth) {
    if (ocrHealth.primary.healthy) {
      checks.ocr = {
        status: 'healthy',
        message: 'Primary cloud OCR engine operational.'
      };
    } else if (ocrHealth.fallback.healthy) {
      overallStatus = overallStatus === 'healthy' ? 'degraded' : overallStatus;
      checks.ocr = {
        status: 'degraded',
        message: 'Primary OCR offline. Tesseract fallback operational.'
      };
    } else {
      overallStatus = overallStatus === 'healthy' ? 'degraded' : overallStatus;
      checks.ocr = {
        status: 'degraded',
        message: 'No OCR engine configured. Plaintext and digital PDF parsing available.'
      };
    }
  }

  return apiSuccess({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    checks
  });
}
