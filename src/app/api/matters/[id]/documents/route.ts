import { NextRequest } from 'next/server';
import { getMatterService } from '@/lib/repository';
import { validateDocumentFile } from '@/lib/api/validation';
import { apiSuccess, apiError } from '@/lib/api/response';
import { DocumentEvidence } from '@/types/matter';
import { AuthService } from '@/lib/auth/auth-service';
import { RateLimiter } from '@/lib/security/rate-limiter';
import { Logger } from '@/lib/observability/logger';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await AuthService.getAuthenticatedUser(req);
    if (!user) {
      return apiError('Authentication required', 401, 'UNAUTHORIZED');
    }

    const { id } = await params;
    const service = getMatterService();
    const matter = await service.getMatterById(id, user.id);

    if (!matter) {
      return apiError('Matter not found or access denied', 404, 'NOT_FOUND');
    }

    if (matter.userId && matter.userId !== user.id) {
      return apiError('Access denied', 403, 'FORBIDDEN');
    }

    const docs = await service.getAdapter().documents.listByMatter(id);
    return apiSuccess(docs);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch documents';
    Logger.error('Failed to fetch documents', error, { operation: 'list_documents' });
    return apiError(message, 500, 'FETCH_DOCS_ERROR');
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await AuthService.getAuthenticatedUser(req);
    if (!user) {
      return apiError('Authentication required to upload evidence', 401, 'UNAUTHORIZED');
    }

    const { id: matterId } = await params;
    const service = getMatterService();

    // Check rate limit: 15 uploads per minute
    const rateCheck = RateLimiter.check(`upload-${user.id}`, 15, 60);
    if (!rateCheck.allowed) {
      return apiError(
        `Upload rate limit exceeded. Please wait ${rateCheck.resetSeconds} seconds before uploading more documents.`,
        429,
        'RATE_LIMIT_EXCEEDED'
      );
    }

    const existing = await service.getMatterById(matterId, user.id);
    if (!existing) {
      return apiError('Matter not found or access denied', 404, 'NOT_FOUND');
    }

    if (existing.userId && existing.userId !== user.id) {
      return apiError('Access denied: You cannot upload evidence to this matter', 403, 'FORBIDDEN');
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const title = (formData.get('title') as string | null) || undefined;
    const docType = (formData.get('type') as DocumentEvidence['type'] | null) || 'other';

    if (!file) {
      return apiError('No file provided in form data field "file".', 400, 'MISSING_FILE');
    }

    // Validate file (10MB limit and format restrictions)
    const validation = validateDocumentFile({
      filename: file.name,
      mimeType: file.type || 'application/octet-stream',
      sizeBytes: file.size
    });

    if (!validation.isValid) {
      return apiError(validation.error || 'Invalid file', 400, 'INVALID_FILE');
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await service.uploadDocumentAndReanalyze(
      matterId,
      {
        buffer,
        filename: file.name,
        mimeType: file.type,
        title: title || file.name,
        type: docType
      },
      user.id
    );

    Logger.info('Document uploaded and analyzed successfully', {
      userId: user.id,
      matterId,
      documentId: result.document.id,
      title: result.document.title,
      operation: 'upload_document'
    });

    return apiSuccess(result, 201, {
      message: `Document "${result.document.title}" uploaded and processed successfully. Matter re-analyzed with doc_uploaded.`
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to upload document';
    Logger.error('Failed to upload document', error, { operation: 'upload_document' });
    return apiError(message, 500, 'DOCUMENT_UPLOAD_ERROR');
  }
}
