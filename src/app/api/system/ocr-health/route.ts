import { OCRFactory } from '@/lib/ocr/ocr-factory';
import { Metrics } from '@/lib/observability/metrics';
import { apiSuccess, apiError } from '@/lib/api/response';

/**
 * GET /api/system/ocr-health
 * Provides real-time health telemetry and provider status for OCR document processing.
 *
 * Example Success Response:
 * {
 *   "success": true,
 *   "data": {
 *     "provider": "google-document-ai",
 *     "healthy": true,
 *     "latencyMs": 140,
 *     "successRate": 0.98,
 *     "message": "Processor online and operational."
 *   }
 * }
 *
 * Example Degraded Response:
 * {
 *   "success": true,
 *   "data": {
 *     "provider": "google-document-ai",
 *     "healthy": false,
 *     "message": "Google Document AI unconfigured. Requires GOOGLE_PROJECT_ID and GOOGLE_PROCESSOR_ID.",
 *     "fallback": {
 *       "provider": "tesseract",
 *       "healthy": true
 *     }
 *   }
 * }
 */
export async function GET() {
  try {
    const health = await OCRFactory.getAggregatedHealth();
    const telemetry = Metrics.getProductionTelemetry();

    const activeProvider = OCRFactory.getActiveProvider();
    const providerName = activeProvider ? activeProvider.providerName : 'none';

    const activeHealth = providerName === 'google-document-ai'
      ? health.primary
      : (providerName === 'tesseract' ? health.fallback : { healthy: false, message: 'No OCR provider active', latencyMs: undefined });

    const activeLatencyMs = 'latencyMs' in activeHealth && typeof activeHealth.latencyMs === 'number'
      ? activeHealth.latencyMs
      : (telemetry.ocr.avgProcessingTimeMs > 0 ? telemetry.ocr.avgProcessingTimeMs : undefined);

    const responsePayload = {
      provider: providerName,
      healthy: activeHealth.healthy,
      latencyMs: activeLatencyMs,
      successRate: telemetry.ocr.successRate,
      totalProcessed: telemetry.ocr.total,
      message: activeHealth.message || (activeHealth.healthy ? 'OCR provider operational.' : 'OCR provider unavailable.'),
      details: {
        googleDocumentAI: {
          configured: health.primary.configured,
          healthy: health.primary.healthy,
          message: health.primary.message,
          latencyMs: health.primary.latencyMs
        },
        tesseractFallback: {
          configured: health.fallback.configured,
          healthy: health.fallback.healthy,
          message: health.fallback.message,
          latencyMs: health.fallback.latencyMs
        }
      }
    };

    return apiSuccess(responsePayload);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to query OCR health status';
    return apiError(message, 500, 'OCR_HEALTH_CHECK_ERROR');
  }
}
