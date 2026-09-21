import { DocumentProcessorServiceClient } from '@google-cloud/documentai';
import { OCRProvider, OCRMetadata, OCRExtractionResult, ProviderHealth, OCRPage } from './types';

/**
 * Google Document AI Production Provider
 * Uses Google Cloud Document AI OCR / Document OCR processor to process scanned PDFs,
 * legal notices, agreements, photos, screenshots, and receipts.
 */
export class GoogleDocumentAIProvider implements OCRProvider {
  public readonly providerName = 'google-document-ai';

  private projectId: string | undefined;
  private location: string;
  private processorId: string | undefined;
  private client: DocumentProcessorServiceClient | null = null;
  private initializationError: string | null = null;

  constructor() {
    this.projectId = process.env.GOOGLE_PROJECT_ID;
    this.location = process.env.GOOGLE_LOCATION || 'us';
    this.processorId = process.env.GOOGLE_PROCESSOR_ID;

    this.initClient();
  }

  private initClient(): void {
    try {
      if (this.isConfigured()) {
        const clientOptions: { apiEndpoint?: string; keyFilename?: string } = {};
        if (this.location && this.location !== 'us') {
          clientOptions.apiEndpoint = `${this.location}-documentai.googleapis.com`;
        }
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
          clientOptions.keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
        }
        this.client = new DocumentProcessorServiceClient(clientOptions);
      }
    } catch (err) {
      this.initializationError = err instanceof Error ? err.message : String(err);
      this.client = null;
    }
  }

  public isConfigured(): boolean {
    return Boolean(this.projectId && this.processorId);
  }

  public async healthCheck(): Promise<ProviderHealth> {
    if (!this.isConfigured()) {
      return {
        healthy: false,
        provider: this.providerName,
        configured: false,
        message: 'Google Document AI unconfigured. Requires GOOGLE_PROJECT_ID and GOOGLE_PROCESSOR_ID.'
      };
    }

    if (this.initializationError || !this.client) {
      return {
        healthy: false,
        provider: this.providerName,
        configured: true,
        message: `Initialization failed: ${this.initializationError || 'Client unavailable'}`
      };
    }

    const t0 = performance.now();
    try {
      const name = this.client.processorPath(this.projectId!, this.location, this.processorId!);
      const [processor] = await this.client.getProcessor({ name });
      const latencyMs = Math.round(performance.now() - t0);

      if (processor && processor.state === 'ENABLED') {
        return {
          healthy: true,
          provider: this.providerName,
          latencyMs,
          configured: true,
          message: `Processor ${this.processorId} is online and operational.`
        };
      }

      return {
        healthy: false,
        provider: this.providerName,
        latencyMs,
        configured: true,
        message: `Processor in non-active state: ${processor?.state || 'UNKNOWN'}`
      };
    } catch (err) {
      const latencyMs = Math.round(performance.now() - t0);
      const errMsg = err instanceof Error ? err.message : String(err);
      return {
        healthy: false,
        provider: this.providerName,
        latencyMs,
        configured: true,
        message: `Health check failed: ${errMsg}`
      };
    }
  }

  public async extractText(
    document: Buffer,
    metadata: OCRMetadata
  ): Promise<OCRExtractionResult> {
    const t0 = performance.now();

    if (!this.isConfigured() || !this.client) {
      return {
        success: false,
        text: '',
        pages: [],
        provider: this.providerName,
        processingTimeMs: 0,
        failureReason: 'OCR_PROVIDER_UNCONFIGURED',
        warnings: ['Google Document AI credentials or processor not configured.']
      };
    }

    try {
      const name = this.client.processorPath(this.projectId!, this.location, this.processorId!);
      const rawDocument = {
        content: document.toString('base64'),
        mimeType: metadata.mimeType
      };

      const request = {
        name,
        rawDocument
      };

      const [result] = await this.client.processDocument(request);
      const elapsedMs = Math.round(performance.now() - t0);

      const doc = result.document;
      if (!doc || !doc.text) {
        return {
          success: true,
          text: '',
          pages: [],
          provider: this.providerName,
          processingTimeMs: elapsedMs,
          confidence: 0,
          warnings: ['Document AI processed document successfully but returned no text content.']
        };
      }

      const fullText = doc.text;
      const pages: OCRPage[] = [];

      if (doc.pages && doc.pages.length > 0) {
        doc.pages.forEach((p, idx) => {
          let pageText = '';
          if (p.paragraphs) {
            pageText = p.paragraphs
              .map(para => {
                if (!para.layout?.textAnchor?.textSegments) return '';
                return para.layout.textAnchor.textSegments
                  .map(seg => {
                    const start = Number(seg.startIndex || 0);
                    const end = Number(seg.endIndex || 0);
                    return fullText.slice(start, end);
                  })
                  .join('');
              })
              .join('\n');
          }

          const pageConfidence = p.layout?.confidence || 0.95;
          pages.push({
            pageNumber: p.pageNumber || idx + 1,
            text: pageText.trim() || fullText.trim(),
            confidence: pageConfidence
          });
        });
      } else {
        pages.push({
          pageNumber: 1,
          text: fullText.trim(),
          confidence: 0.95
        });
      }

      return {
        success: true,
        text: fullText.trim(),
        pages,
        provider: this.providerName,
        processingTimeMs: elapsedMs,
        confidence: pages.reduce((acc, p) => acc + (p.confidence || 0.9), 0) / (pages.length || 1)
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
        failureReason: errMsg.includes('DEADLINE_EXCEEDED')
          ? 'OCR_PROVIDER_TIMEOUT'
          : errMsg.includes('RESOURCE_EXHAUSTED')
            ? 'OCR_QUOTA_EXCEEDED'
            : 'OCR_PROVIDER_ERROR',
        warnings: [errMsg]
      };
    }
  }
}
