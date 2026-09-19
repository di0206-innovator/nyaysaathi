import { DocumentParserProvider } from '@/types/matter';

export interface ParsedDocumentResult {
  extractedText: string;
  confidence: number;
  detectedPages?: number;
  clauses?: Array<{ title: string; text: string; pageNumber?: number }>;
  entities?: Array<{ name: string; type: string }>;
  classification?: string;
  relevanceSummary?: string;
  extractionStatus: 'verified_extraction' | 'partial_extraction' | 'needs_review' | 'needs_ocr' | 'extraction_failed';
}

export class ProductionDocumentParser implements DocumentParserProvider {
  public async parseDocument(file: {
    buffer?: ArrayBuffer;
    text?: string;
    mimeType: string;
    filename: string;
  }): Promise<ParsedDocumentResult> {
    const mime = file.mimeType.toLowerCase();
    const filename = file.filename.toLowerCase();

    // 1. Text or Plaintext file
    if (file.text || mime === 'text/plain' || filename.endsWith('.txt') || filename.endsWith('.md')) {
      return this.parseTextContent(file.text || (file.buffer ? Buffer.from(file.buffer).toString('utf-8') : ''), file.filename);
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
        classification: 'Empty Text Document',
        extractionStatus: 'extraction_failed',
        relevanceSummary: `File ${filename} contains no extractable text content.`
      };
    }

    const entities = this.extractEntities(text);
    const clauses = this.extractClauses(text);

    return {
      extractedText: text,
      confidence: 0.98,
      detectedPages: Math.max(1, Math.ceil(text.length / 2000)),
      clauses,
      entities,
      classification: 'Text Narrative / Written Document',
      extractionStatus: 'verified_extraction',
      relevanceSummary: `Extracted ${text.length} characters with ${entities.length} identified dates/sums and ${clauses.length} identified clauses.`
    };
  }

  private parsePdfContent(buffer: ArrayBuffer | undefined, filename: string): ParsedDocumentResult {
    let extractedText = '';
    let pageCount = 1;

    if (buffer) {
      const nodeBuf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
      const str = nodeBuf.toString('binary');
      // Count pages in PDF structure if available
      const pageMatches = str.match(/\/Type\s*\/Page\b/g);
      if (pageMatches) {
        pageCount = pageMatches.length;
      }

      // Extract ASCII text segments from PDF streams
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
            // Find printable ASCII sequences >= 4 chars
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
        classification: 'Unprocessed PDF Document',
        extractionStatus: 'needs_review',
        relevanceSummary: `Text could not be reliably extracted from this PDF stream (${filename}). No legal facts were inferred from the filename or metadata.`
      };
    }

    const entities = this.extractEntities(extractedText);
    const clauses = this.extractClauses(extractedText);

    return {
      extractedText,
      confidence: 0.88,
      detectedPages: pageCount,
      clauses,
      entities,
      classification: 'PDF Legal Evidence',
      extractionStatus: 'verified_extraction',
      relevanceSummary: `PDF parsed (${pageCount} page(s)) with ${clauses.length} extracted clauses and ${entities.length} detected entities.`
    };
  }

  private parseImageOcrContent(_buffer: ArrayBuffer | undefined, filename: string, mimeType: string): ParsedDocumentResult {
    // In a production setup without OCR credentials, we FAIL TRUTHFULLY.
    // We NEVER synthesize a ₹75,000 transaction or WhatsApp notice because of the filename!
    return {
      extractedText: '',
      confidence: 0.0,
      detectedPages: 1,
      clauses: [],
      entities: [],
      classification: `Image / Photographic Proof (${mimeType})`,
      extractionStatus: 'needs_ocr',
      relevanceSummary: `Text could not be reliably extracted from image "${filename}" without an OCR provider. No legal fact was inferred from the filename or image metadata.`
    };
  }

  private extractEntities(text: string): Array<{ name: string; type: string }> {
    const entities: Array<{ name: string; type: string }> = [];

    // Currency values
    const currencyMatches = text.match(/₹\s*[\d,]+|Rs\.?\s*[\d,]+/gi);
    if (currencyMatches) {
      currencyMatches.forEach(c => entities.push({ name: c.trim(), type: 'FINANCIAL_SUM' }));
    }

    // Dates
    const dateMatches = text.match(/\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b|\b\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4}\b/gi);
    if (dateMatches) {
      dateMatches.forEach(d => entities.push({ name: d.trim(), type: 'DATE' }));
    }

    return entities;
  }

  private extractClauses(text: string): Array<{ title: string; text: string; pageNumber?: number }> {
    const clauses: Array<{ title: string; text: string; pageNumber?: number }> = [];
    const sentences = text.split(/[.\n\r;]+/).map(s => s.trim()).filter(s => s.length > 15);

    for (const sentence of sentences) {
      const lower = sentence.toLowerCase();
      if ((lower.includes('deposit') || lower.includes('refund')) && !clauses.some(c => c.title.includes('Deposit'))) {
        clauses.push({
          title: 'Deposit / Refund Clause',
          text: sentence,
          pageNumber: 1
        });
      } else if ((lower.includes('notice') || lower.includes('eviction') || lower.includes('termination')) && !clauses.some(c => c.title.includes('Notice'))) {
        clauses.push({
          title: 'Notice / Termination Clause',
          text: sentence,
          pageNumber: 1
        });
      } else if ((lower.includes('warranty') || lower.includes('defect') || lower.includes('guarantee')) && !clauses.some(c => c.title.includes('Warranty'))) {
        clauses.push({
          title: 'Warranty / Defect Clause',
          text: sentence,
          pageNumber: 1
        });
      }
    }

    return clauses;
  }
}

let activeParser: DocumentParserProvider | null = null;

export function getDocumentParser(): DocumentParserProvider {
  if (!activeParser) {
    activeParser = new ProductionDocumentParser();
  }
  return activeParser;
}

export function setDocumentParser(parser: DocumentParserProvider) {
  activeParser = parser;
}
