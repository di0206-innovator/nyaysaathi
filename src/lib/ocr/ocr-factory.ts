import { OCRProvider, OCRMetadata, OCRExtractionResult, ProviderHealth } from './types';
import { GoogleDocumentAIProvider } from './google-document-ai';
import { TesseractOCRProvider } from './tesseract-provider';
import { Metrics } from '@/lib/observability/metrics';

/**
 * OCR Factory
 * Orchestrates multi-tier OCR provider resolution:
 * 1. Google Document AI (Primary for PDFs, Notices, Agreements, Receipts, Photos)
 * 2. Tesseract OCR (Local Fallback for Images, Screenshots, PNG, JPG)
 * 3. Unavailable / Truthful Fallback (Fails closed without fabricating text)
 */
export class OCRFactory {
  private static googleProvider: GoogleDocumentAIProvider | null = null;
  private static tesseractProvider: TesseractOCRProvider | null = null;

  public static getGoogleProvider(): GoogleDocumentAIProvider {
    if (!this.googleProvider) {
      this.googleProvider = new GoogleDocumentAIProvider();
    }
    return this.googleProvider;
  }

  public static getTesseractProvider(): TesseractOCRProvider {
    if (!this.tesseractProvider) {
      this.tesseractProvider = new TesseractOCRProvider();
    }
    return this.tesseractProvider;
  }

  /**
   * Determine the most suitable active OCR provider.
   */
  public static getActiveProvider(): OCRProvider | null {
    const google = this.getGoogleProvider();
    if (google.isConfigured()) {
      return google;
    }

    // If local OCR / Tesseract fallback is enabled or no cloud provider is configured
    if (process.env.ENABLE_LOCAL_OCR !== 'false') {
      return this.getTesseractProvider();
    }

    return null;
  }

  /**
   * Health check across all registered OCR providers.
   */
  public static async getAggregatedHealth(): Promise<{
    primary: ProviderHealth;
    fallback: ProviderHealth;
    activeProviderName: string;
    overallHealthy: boolean;
  }> {
    const google = this.getGoogleProvider();
    const tesseract = this.getTesseractProvider();

    const [googleHealth, tesseractHealth] = await Promise.all([
      google.healthCheck(),
      tesseract.healthCheck()
    ]);

    const active = this.getActiveProvider();

    return {
      primary: googleHealth,
      fallback: tesseractHealth,
      activeProviderName: active ? active.providerName : 'none',
      overallHealthy: googleHealth.healthy || tesseractHealth.healthy
    };
  }

  /**
   * Execute OCR with automatic fallback resolution.
   */
  public static async processDocument(
    document: Buffer,
    metadata: OCRMetadata
  ): Promise<OCRExtractionResult> {
    const t0 = performance.now();
    const isPdf = metadata.mimeType === 'application/pdf' || metadata.filename.toLowerCase().endsWith('.pdf');

    // 1. Try Google Document AI if configured
    const google = this.getGoogleProvider();
    if (google.isConfigured()) {
      try {
        const res = await google.extractText(document, metadata);
        if (res.success) {
          Metrics.recordOcrProcessing(res.processingTimeMs, true);
          return res;
        }

        // If Google failed and document is an image, attempt local fallback
        if (!isPdf) {
          const tesseract = this.getTesseractProvider();
          const fallbackRes = await tesseract.extractText(document, metadata);
          if (fallbackRes.success) {
            Metrics.recordOcrProcessing(fallbackRes.processingTimeMs, true);
            fallbackRes.warnings = [
              ...(fallbackRes.warnings || []),
              `Primary OCR (Google Document AI) failed: ${res.failureReason}. Resolved via local Tesseract fallback.`
            ];
            return fallbackRes;
          }
        }

        Metrics.recordOcrProcessing(res.processingTimeMs, false);
        return res;
      } catch {
        // Fallback below
      }
    }

    // 2. If Google is unconfigured or failed, and document is an image/screenshot, use Tesseract
    if (!isPdf && process.env.ENABLE_LOCAL_OCR !== 'false') {
      try {
        const tesseract = this.getTesseractProvider();
        const res = await tesseract.extractText(document, metadata);
        Metrics.recordOcrProcessing(res.processingTimeMs, res.success);
        return res;
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        Metrics.recordOcrProcessing(Math.round(performance.now() - t0), false);
        return {
          success: false,
          text: '',
          pages: [],
          provider: 'tesseract',
          processingTimeMs: Math.round(performance.now() - t0),
          failureReason: 'TESSERACT_EXECUTION_FAILED',
          warnings: [errMsg]
        };
      }
    }

    // 3. Neither provider could run
    const totalTimeMs = Math.round(performance.now() - t0);
    Metrics.recordOcrProcessing(totalTimeMs, false);

    return {
      success: false,
      text: '',
      pages: [],
      provider: 'none',
      processingTimeMs: totalTimeMs,
      failureReason: 'OCR_PROVIDER_UNAVAILABLE',
      warnings: [
        isPdf
          ? 'Scanned PDF requires Google Document AI processor configuration.'
          : 'OCR provider unavailable and local OCR is disabled.'
      ]
    };
  }
}
