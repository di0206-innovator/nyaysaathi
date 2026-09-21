import { createWorker } from 'tesseract.js';
import { OCRProvider, OCRMetadata, OCRExtractionResult, ProviderHealth, OCRPage, OCRWord } from './types';

/**
 * Tesseract.js OCR Provider
 * Production local fallback for image OCR (PNG, JPG, screenshots, receipts)
 * when cloud OCR (Google Document AI) is unconfigured, timed out, or unavailable.
 * Strictly calculates empirical word-level confidence and never claims certainty.
 */
export class TesseractOCRProvider implements OCRProvider {
  public readonly providerName = 'tesseract';

  public async healthCheck(): Promise<ProviderHealth> {
    const t0 = performance.now();
    try {
      // Light probe: test createWorker instantiation
      const worker = await createWorker('eng');
      await worker.terminate();
      const latencyMs = Math.round(performance.now() - t0);

      return {
        healthy: true,
        provider: this.providerName,
        latencyMs,
        configured: true,
        message: 'Tesseract worker initialized successfully and operational.'
      };
    } catch (err) {
      const latencyMs = Math.round(performance.now() - t0);
      const errMsg = err instanceof Error ? err.message : String(err);
      return {
        healthy: false,
        provider: this.providerName,
        latencyMs,
        configured: false,
        message: `Tesseract health check failed: ${errMsg}`
      };
    }
  }

  public async extractText(
    document: Buffer,
    metadata: OCRMetadata
  ): Promise<OCRExtractionResult> {
    const t0 = performance.now();

    // Tesseract does not natively parse raw multi-page PDF binaries without poppler/pdf2image
    if (metadata.mimeType === 'application/pdf' || metadata.filename.toLowerCase().endsWith('.pdf')) {
      return {
        success: false,
        text: '',
        pages: [],
        provider: this.providerName,
        processingTimeMs: Math.round(performance.now() - t0),
        failureReason: 'UNSUPPORTED_PDF_BY_LOCAL_TESSERACT',
        warnings: ['Tesseract fallback handles images and screenshots (PNG, JPG, WebP). Scanned PDFs require Google Document AI.']
      };
    }

    let worker: Awaited<ReturnType<typeof createWorker>> | null = null;
    try {
      worker = await createWorker('eng');
      const ret = await worker.recognize(document);
      const elapsedMs = Math.round(performance.now() - t0);

      const dataWithWords = ret.data as unknown as { words?: Array<{ text: string; confidence: number; bbox?: { x0: number; y0: number; x1: number; y1: number } }> };
      const words: OCRWord[] = (dataWithWords.words || []).map(w => ({
        text: w.text,
        confidence: Math.round(w.confidence) / 100,
        boundingBox: w.bbox ? {
          x: w.bbox.x0,
          y: w.bbox.y0,
          width: w.bbox.x1 - w.bbox.x0,
          height: w.bbox.y1 - w.bbox.y0
        } : undefined
      }));

      // Empirical confidence from tesseract result (0-100 scale converted to 0.0-1.0)
      const rawConfidence = typeof ret.data.confidence === 'number'
        ? Math.round(ret.data.confidence) / 100
        : (words.length > 0
          ? words.reduce((acc, w) => acc + w.confidence, 0) / words.length
          : 0.5);

      const extractedText = (ret.data.text || '').trim();

      const page: OCRPage = {
        pageNumber: 1,
        text: extractedText,
        confidence: rawConfidence,
        words
      };

      const warnings: string[] = [];
      if (rawConfidence < 0.6) {
        warnings.push('Low confidence OCR extraction detected. Visual artifact or blurry text may degrade reliability.');
      }

      return {
        success: true,
        text: extractedText,
        pages: [page],
        provider: this.providerName,
        processingTimeMs: elapsedMs,
        confidence: rawConfidence,
        warnings: warnings.length > 0 ? warnings : undefined
      };
    } catch (err) {
      const elapsedMs = Math.round(performance.now() - t0);
      const errMsg = err instanceof Error ? err.message : String(err);

      return {
        success: false,
        text: '',
        pages: [],
        provider: this.providerName,
        processingTimeMs: elapsedMs,
        failureReason: 'TESSERACT_EXTRACTION_ERROR',
        warnings: [errMsg]
      };
    } finally {
      if (worker) {
        try {
          await worker.terminate();
        } catch {
          // Worker termination ignore
        }
      }
    }
  }
}
