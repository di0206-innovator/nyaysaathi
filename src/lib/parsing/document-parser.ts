import { DocumentParserProvider } from '@/types/matter';

export interface ExtractedFactProvenance {
  factId: string;
  sourceDocumentName: string;
  pageNumber: number;
  sourceTextSnippet: string;
  entityType: 'FINANCIAL_SUM' | 'DATE' | 'PARTY_NAME' | 'LEGAL_CLAUSE';
  extractedValue: string;
  confidence: number;
}

export interface ParsedDocumentResult {
  extractedText: string;
  confidence: number;
  detectedPages?: number;
  clauses?: Array<{ title: string; text: string; pageNumber: number }>;
  entities?: Array<{ name: string; type: string; pageNumber?: number }>;
  provenanceRecords?: ExtractedFactProvenance[];
  classification?: string;
  relevanceSummary?: string;
  extractionStatus: 'verified_extraction' | 'partial_extraction' | 'needs_review' | 'needs_ocr' | 'extraction_failed';
  sanitizedForPromptInjection?: boolean;
}

/**
 * Pluggable OCR interface for vision/document AI backends (e.g. Google Cloud Document AI, Tesseract, AWS Textract)
 */
export interface IOcrEngine {
  name: string;
  isAvailable(): boolean;
  recognize(buffer: ArrayBuffer, mimeType?: string, filename?: string): Promise<{
    text: string;
    confidence: number;
    pages?: Array<{ pageNumber: number; text: string }>;
  } | null>;
}

/**
 * Environment-configured OCR provider.
 * When no external OCR credentials are set in environment, safely reports unavailable
 * and preserves truthful 'needs_ocr' extractionStatus.
 */
export class ConfiguredOcrProvider implements IOcrEngine {
  public name = 'ConfiguredOcrProvider';

  public isAvailable(): boolean {
    const hasKey = Boolean(
      process.env.OCR_API_KEY ||
      process.env.DOCUMENT_AI_KEY ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS ||
      process.env.ENABLE_LOCAL_OCR === 'true'
    );
    return hasKey;
  }

  public async recognize(buffer: ArrayBuffer): Promise<{
    text: string;
    confidence: number;
    pages?: Array<{ pageNumber: number; text: string }>;
  } | null> {
    if (!this.isAvailable()) {
      return null;
    }

    // If local test OCR runner is enabled
    if (process.env.ENABLE_LOCAL_OCR === 'true') {
      const nodeBuf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
      const str = nodeBuf.toString('utf-8');
      if (str.length > 0) {
        return {
          text: str,
          confidence: 0.92,
          pages: [{ pageNumber: 1, text: str }]
        };
      }
    }

    return null;
  }
}

/**
 * Prompt injection defense: detects and sanitizes adversarial command instructions
 * hidden inside legal attachments (e.g., "Ignore previous instructions", "SYSTEM PROMPT OVERRIDE").
 */
export function sanitizeAdversarialText(rawText: string): { cleanedText: string; injectionDetected: boolean } {
  const injectionPatterns = [
    /ignore\s+(all\s+)?previous\s+instructions/gi,
    /system\s+prompt\s+override/gi,
    /you\s+are\s+now\s+in\s+developer\s+mode/gi,
    /disregard\s+all\s+prior\s+rules/gi,
    /output\s+only\s+the\s+following/gi,
    /<\|im_start\|>|<\|im_end\|>/gi
  ];

  let cleaned = rawText;
  let injectionDetected = false;

  for (const pattern of injectionPatterns) {
    if (pattern.test(cleaned)) {
      injectionDetected = true;
      cleaned = cleaned.replace(pattern, '[REDACTED_POTENTIAL_INJECTION]');
    }
  }

  return { cleanedText: cleaned, injectionDetected };
}

/**
 * Universal Document Extraction Provider
 * Handles plain text, text PDFs, scanned documents, and images with rigorous provenance.
 */
export class ProductionDocumentParser implements DocumentParserProvider {
  private ocrEngine: IOcrEngine;

  constructor(ocrEngine?: IOcrEngine) {
    this.ocrEngine = ocrEngine || new ConfiguredOcrProvider();
  }

  public setOcrEngine(engine: IOcrEngine): void {
    this.ocrEngine = engine;
  }

  public async parseDocument(file: {
    buffer?: ArrayBuffer;
    text?: string;
    mimeType: string;
    filename: string;
  }): Promise<ParsedDocumentResult> {
    const mime = file.mimeType.toLowerCase();
    const filename = file.filename.toLowerCase();

    // 1. Text or Plaintext file (.txt, .md, .csv)
    if (file.text || mime === 'text/plain' || filename.endsWith('.txt') || filename.endsWith('.md')) {
      const content = file.text || (file.buffer ? Buffer.from(file.buffer).toString('utf-8') : '');
      return this.parseTextContent(content, file.filename);
    }

    // 2. PDF Document
    if (mime === 'application/pdf' || filename.endsWith('.pdf')) {
      return this.parsePdfContent(file.buffer, file.filename);
    }

    // 3. Image / Screenshot (OCR processing adapter)
    if (mime.startsWith('image/')) {
      return this.parseImageOcrContent(file.buffer, file.filename, mime);
    }

    // Fallback parser for other files - never synthesize legal facts
    const rawText = file.text || '';
    if (rawText.trim()) {
      return this.parseTextContent(rawText, file.filename);
    }

    return {
      extractedText: '',
      confidence: 0.1,
      detectedPages: 1,
      classification: 'General Attachment',
      extractionStatus: 'needs_review',
      clauses: [],
      entities: [],
      provenanceRecords: [],
      relevanceSummary: `Document ${file.filename} ingested without automatic text extraction. No facts were inferred.`
    };
  }

  private parseTextContent(rawText: string, filename: string): ParsedDocumentResult {
    const text = rawText.trim();
    if (!text) {
      return {
        extractedText: '',
        confidence: 0.0,
        detectedPages: 1,
        clauses: [],
        entities: [],
        provenanceRecords: [],
        classification: 'Empty Text Document',
        extractionStatus: 'extraction_failed',
        relevanceSummary: `File ${filename} contains no extractable text content.`
      };
    }

    const { cleanedText, injectionDetected } = sanitizeAdversarialText(text);
    const entities = this.extractEntities(cleanedText, 1);
    const clauses = this.extractClauses(cleanedText, 1);
    const provenanceRecords = this.buildProvenance(entities, clauses, filename);

    return {
      extractedText: cleanedText,
      confidence: 0.98,
      detectedPages: Math.max(1, Math.ceil(cleanedText.length / 2000)),
      clauses,
      entities,
      provenanceRecords,
      classification: 'Text Narrative / Written Document',
      extractionStatus: 'verified_extraction',
      sanitizedForPromptInjection: injectionDetected,
      relevanceSummary: `Extracted ${cleanedText.length} characters with ${entities.length} identified dates/sums and ${clauses.length} identified clauses.`
    };
  }

  private parsePdfContent(buffer: ArrayBuffer | undefined, filename: string): ParsedDocumentResult {
    let extractedText = '';
    let pageCount = 1;

    if (buffer) {
      const nodeBuf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
      const str = nodeBuf.toString('binary');
      
      // Count pages in PDF structure
      const pageMatches = str.match(/\/Type\s*\/Page\b/g);
      if (pageMatches) {
        pageCount = pageMatches.length;
      }

      // Extract text segments from PDF streams
      const textMatches = str.match(/\(([^()]{2,})\)Tj/g) || str.match(/\[([^\]]+)\]TJ/g);
      if (textMatches && textMatches.length > 0) {
        extractedText = textMatches
          .map(m => m.replace(/[()[\]TjTJ]/g, ''))
          .join(' ')
          .trim();
      }

      // Also attempt stream text extraction if standard text operators are absent
      if (!extractedText) {
        const streamMatches = str.match(/stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g);
        if (streamMatches) {
          const printableChunks: string[] = [];
          for (const s of streamMatches.slice(0, 5)) {
            const words = s.match(/[A-Za-z0-9,.\s₹-]{4,}/g);
            if (words && words.length > 3) {
              printableChunks.push(words.join(' ').trim());
            }
          }
          if (printableChunks.length > 0) {
            extractedText = printableChunks.join('\n').trim();
          }
        }
      }
    }

    // NEVER fabricate evidence or transactions from filename!
    if (!extractedText || extractedText.length < 10) {
      return {
        extractedText: '',
        confidence: 0.2,
        detectedPages: pageCount,
        clauses: [],
        entities: [],
        provenanceRecords: [],
        classification: 'Unprocessed PDF Document',
        extractionStatus: 'needs_review',
        relevanceSummary: `Text could not be reliably extracted from this PDF stream (${filename}). No legal facts were inferred from the filename or metadata.`
      };
    }

    const { cleanedText, injectionDetected } = sanitizeAdversarialText(extractedText);
    const entities = this.extractEntities(cleanedText, 1);
    const clauses = this.extractClauses(cleanedText, 1);
    const provenanceRecords = this.buildProvenance(entities, clauses, filename);

    return {
      extractedText: cleanedText,
      confidence: 0.88,
      detectedPages: pageCount,
      clauses,
      entities,
      provenanceRecords,
      classification: 'PDF Legal Evidence',
      extractionStatus: 'verified_extraction',
      sanitizedForPromptInjection: injectionDetected,
      relevanceSummary: `PDF parsed (${pageCount} page(s)) with ${clauses.length} extracted clauses and ${entities.length} detected entities.`
    };
  }

  private async parseImageOcrContent(buffer: ArrayBuffer | undefined, filename: string, mimeType: string): Promise<ParsedDocumentResult> {
    if (buffer !== undefined && buffer.byteLength === 0) {
      return {
        extractedText: '',
        confidence: 0.0,
        detectedPages: 1,
        clauses: [],
        entities: [],
        provenanceRecords: [],
        classification: `Empty Image File (${mimeType})`,
        extractionStatus: 'extraction_failed',
        relevanceSummary: `Image file "${filename}" is empty (0 bytes).`
      };
    }

    // If OCR engine is configured and available
    if (buffer && this.ocrEngine.isAvailable()) {
      try {
        const ocrResult = await this.ocrEngine.recognize(buffer);
        if (ocrResult && ocrResult.text.trim().length > 0) {
          const { cleanedText, injectionDetected } = sanitizeAdversarialText(ocrResult.text.trim());
          const entities = this.extractEntities(cleanedText, 1);
          const clauses = this.extractClauses(cleanedText, 1);
          const provenanceRecords = this.buildProvenance(entities, clauses, filename);

          return {
            extractedText: cleanedText,
            confidence: ocrResult.confidence,
            detectedPages: ocrResult.pages?.length || 1,
            clauses,
            entities,
            provenanceRecords,
            classification: `OCR Scanned Evidence (${mimeType})`,
            extractionStatus: 'verified_extraction',
            sanitizedForPromptInjection: injectionDetected,
            relevanceSummary: `OCR extracted ${cleanedText.length} chars via ${this.ocrEngine.name} with ${entities.length} detected entities.`
          };
        }
      } catch {
        // Fall through to truthful needs_ocr
      }
    }

    // Truthful fallback when OCR is unconfigured: NEVER synthesize facts from filename!
    return {
      extractedText: '',
      confidence: 0.0,
      detectedPages: 1,
      clauses: [],
      entities: [],
      provenanceRecords: [],
      classification: `Image / Photographic Proof (${mimeType})`,
      extractionStatus: 'needs_ocr',
      relevanceSummary: `Text could not be reliably extracted from image "${filename}" without an OCR provider. No legal fact was inferred from the filename or image metadata.`
    };
  }

  private extractEntities(text: string, pageNumber: number = 1): Array<{ name: string; type: string; pageNumber?: number }> {
    const entities: Array<{ name: string; type: string; pageNumber?: number }> = [];

    // Currency values
    const currencyMatches = text.match(/₹\s*[\d,]+|Rs\.?\s*[\d,]+/gi);
    if (currencyMatches) {
      currencyMatches.forEach(c => entities.push({ name: c.trim(), type: 'FINANCIAL_SUM', pageNumber }));
    }

    // Dates
    const dateMatches = text.match(/\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b|\b\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4}\b/gi);
    if (dateMatches) {
      dateMatches.forEach(d => entities.push({ name: d.trim(), type: 'DATE', pageNumber }));
    }

    return entities;
  }

  private extractClauses(text: string, pageNumber: number = 1): Array<{ title: string; text: string; pageNumber: number }> {
    const clauses: Array<{ title: string; text: string; pageNumber: number }> = [];
    const sentences = text.split(/[.\n\r;]+/).map(s => s.trim()).filter(s => s.length > 15);

    for (const sentence of sentences) {
      const lower = sentence.toLowerCase();
      if ((lower.includes('deposit') || lower.includes('refund')) && !clauses.some(c => c.title.includes('Deposit'))) {
        clauses.push({
          title: 'Deposit / Refund Clause',
          text: sentence,
          pageNumber
        });
      } else if ((lower.includes('notice') || lower.includes('eviction') || lower.includes('termination')) && !clauses.some(c => c.title.includes('Notice'))) {
        clauses.push({
          title: 'Notice / Termination Clause',
          text: sentence,
          pageNumber
        });
      } else if ((lower.includes('warranty') || lower.includes('defect') || lower.includes('guarantee')) && !clauses.some(c => c.title.includes('Warranty'))) {
        clauses.push({
          title: 'Warranty / Defect Clause',
          text: sentence,
          pageNumber
        });
      }
    }

    return clauses;
  }

  private buildProvenance(
    entities: Array<{ name: string; type: string; pageNumber?: number }>,
    clauses: Array<{ title: string; text: string; pageNumber: number }>,
    filename: string
  ): ExtractedFactProvenance[] {
    const records: ExtractedFactProvenance[] = [];

    entities.forEach((e, idx) => {
      records.push({
        factId: `provenance-entity-${idx + 1}`,
        sourceDocumentName: filename,
        pageNumber: e.pageNumber || 1,
        sourceTextSnippet: e.name,
        entityType: e.type as ExtractedFactProvenance['entityType'],
        extractedValue: e.name,
        confidence: 0.95
      });
    });

    clauses.forEach((c, idx) => {
      records.push({
        factId: `provenance-clause-${idx + 1}`,
        sourceDocumentName: filename,
        pageNumber: c.pageNumber,
        sourceTextSnippet: c.text.substring(0, 100),
        entityType: 'LEGAL_CLAUSE',
        extractedValue: c.title,
        confidence: 0.90
      });
    });

    return records;
  }
}

let activeParser: ProductionDocumentParser | null = null;

export function getDocumentParser(): ProductionDocumentParser {
  if (!activeParser) {
    activeParser = new ProductionDocumentParser();
  }
  return activeParser;
}

export function setDocumentParser(parser: ProductionDocumentParser) {
  activeParser = parser;
}
