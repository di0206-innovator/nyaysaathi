/**
 * NyaySaathi Production OCR Provider Architecture Types
 * Defines interfaces, contracts, provenance structures and health monitoring
 * for provider-backed document extraction under Indian legal requirements.
 */

export interface OCRMetadata {
  filename: string;
  mimeType: string;
  matterId?: string;
  documentId?: string;
  documentType?: 'rental_agreement' | 'notice_copy' | 'bank_statement' | 'cheque_copy' | 'photo_proof' | 'other';
}

export interface OCRBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OCRWord {
  text: string;
  confidence: number;
  boundingBox?: OCRBoundingBox;
}

export interface OCRPage {
  pageNumber: number;
  text: string;
  confidence?: number;
  words?: OCRWord[];
}

export interface OCRExtractionResult {
  success: boolean;
  text: string;
  pages: OCRPage[];
  provider: string;
  processingTimeMs: number;
  confidence?: number;
  warnings?: string[];
  failureReason?: string;
}

export interface ProviderHealth {
  healthy: boolean;
  provider: string;
  latencyMs?: number;
  message?: string;
  configured?: boolean;
}

export interface OCRProvenanceRecord {
  documentId: string;
  pageNumber: number;
  provider: string;
  extractionTimestamp: string;
  extractedText: string;
  confidence?: number;
  boundingBoxes?: OCRBoundingBox[];
}

export interface OCRProvider {
  readonly providerName: string;
  healthCheck(): Promise<ProviderHealth>;
  extractText(
    document: Buffer,
    metadata: OCRMetadata
  ): Promise<OCRExtractionResult>;
}
