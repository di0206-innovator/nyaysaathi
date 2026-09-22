import { NextRequest } from 'next/server';
import { apiSuccess, apiError, getOrGenerateRequestId } from '@/lib/api/response';
import { validateUploadedFile } from '@/lib/security/file-validator';
import { getDocumentParser } from '@/lib/parsing/document-parser';
import { getStorageProvider } from '@/lib/storage/storage-provider';
import { AuthService } from '@/lib/auth/auth-service';
import { enforceRateLimit } from '@/lib/security/rate-limiter';
import { Logger } from '@/lib/observability/logger';
import { DocumentProcessingMode } from '@/types/document-comparison';

/**
 * Direct Document Upload & Ingestion API
 * Accepts authentic files (PDF, PNG, JPEG, WebP), verifies file signatures / magic bytes,
 * executes text extraction with extraction-status tracking, calculates SHA-256 digest,
 * and creates a verified document identity for understanding, comparison, and Q&A.
 */
export async function POST(req: NextRequest) {
  const requestId = getOrGenerateRequestId(req);

  try {
    // 1. Enforce authentication immediately at server boundary before expensive processing
    const user = await AuthService.getAuthenticatedUser(req);
    if (!user) {
      return apiError(
        'Authentication required to upload documents.',
        401,
        'UNAUTHORIZED',
        undefined,
        requestId
      );
    }

    const rateLimitRes = await enforceRateLimit(req, 'upload_document', 20, 60, user.id, true);
    if (rateLimitRes) return rateLimitRes;

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const customTitle = (formData.get('title') as string | null) || undefined;

    if (!file) {
      return apiError(
        'No file uploaded. Please supply a file in form data field "file".',
        400,
        'MISSING_FILE',
        undefined,
        requestId
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Validate file (magic bytes, MIME consistency, size <= 10MB, SHA-256)
    const validation = validateUploadedFile(buffer, file.name, file.type);
    if (!validation.valid) {
      return apiError(
        validation.error || 'File validation failed.',
        400,
        'INVALID_FILE',
        undefined,
        requestId
      );
    }

    const docId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const effectiveTitle = customTitle?.trim() || file.name.replace(/\.[^/.]+$/, '').replace(/[_.-]+/g, ' ');

    // 3. Extract text & provenance records
    const parser = getDocumentParser();
    const parsed = await parser.parseDocument({
      buffer: arrayBuffer,
      filename: file.name,
      mimeType: validation.detectedMimeType || file.type || 'application/pdf'
    });

    // 4. Secure storage persistence bound to authenticated user
    const userId = user.id;
    const storage = getStorageProvider(user.token);
    let stored;
    try {
      stored = await storage.uploadFile({
        buffer,
        filename: file.name,
        mimeType: validation.detectedMimeType || file.type || 'application/pdf',
        userId,
        matterId: 'direct_upload',
        documentId: docId
      });
    } catch (storageErr) {
      Logger.warn('Storage persistence skipped or failed, proceeding with in-memory session', {
        docId,
        error: storageErr instanceof Error ? storageErr.message : 'Storage error'
      });
    }

    // Map extraction status to domain model
    let extractionStatus: 'complete' | 'partial' | 'needs_review' | 'needs_ocr' = 'complete';
    if (parsed.extractionStatus === 'needs_ocr') extractionStatus = 'needs_ocr';
    else if (parsed.extractionStatus === 'partial_extraction') extractionStatus = 'partial';
    else if (parsed.extractionStatus === 'needs_review' || parsed.extractionStatus === 'extraction_failed') extractionStatus = 'needs_review';

    const processingMode: DocumentProcessingMode = 'VERIFIED_DOCUMENT_MODE';

    Logger.info('Document uploaded and extracted successfully', {
      documentId: docId,
      filename: file.name,
      contentHash: validation.contentHash,
      charactersExtracted: parsed.extractedText.length,
      extractionStatus
    });

    return apiSuccess(
      {
        documentId: docId,
        documentTitle: effectiveTitle,
        filename: file.name,
        extractedText: parsed.extractedText,
        pageCount: parsed.detectedPages || 1,
        mimeType: validation.detectedMimeType || file.type,
        fileSizeBytes: buffer.byteLength,
        contentHash: validation.contentHash,
        extractionStatus,
        extractionConfidence: parsed.confidence,
        provenanceRecords: parsed.provenanceRecords || [],
        processingMode,
        fileUrl: stored?.fileUrl,
        storagePath: stored?.storagePath
      },
      201,
      undefined,
      requestId
    );
  } catch (err: unknown) {
    Logger.error('Document upload endpoint error', err, { requestId });
    return apiError(
      'Failed to upload and process document.',
      500,
      'INTERNAL_SERVER_ERROR',
      undefined,
      requestId
    );
  }
}
