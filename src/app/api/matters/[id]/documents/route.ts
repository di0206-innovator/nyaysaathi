import { NextRequest } from 'next/server';
import { getMatterService } from '@/lib/repository';
import { validateDocumentFile } from '@/lib/api/validation';
import { apiSuccess, apiError } from '@/lib/api/response';
import { DocumentEvidence } from '@/types/matter';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = req.headers.get('x-user-id') || undefined;
    const service = getMatterService();
    const matter = await service.getMatterById(id, userId);

    if (!matter) {
      return apiError('Matter not found', 404, 'NOT_FOUND');
    }

    const docs = await service.getAdapter().documents.listByMatter(id);
    return apiSuccess(docs);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch documents';
    return apiError(message, 500, 'FETCH_DOCS_ERROR');
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matterId } = await params;
    const userId = req.headers.get('x-user-id') || undefined;
    const service = getMatterService();

    const existing = await service.getMatterById(matterId, userId);
    if (!existing) {
      return apiError('Matter not found or unauthorized to upload', 404, 'NOT_FOUND');
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const title = (formData.get('title') as string | null) || undefined;
    const docType = (formData.get('type') as DocumentEvidence['type'] | null) || 'other';

    if (!file) {
      return apiError('No file provided in form data field "file".', 400, 'MISSING_FILE');
    }

    // Validate file
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
      userId
    );

    return apiSuccess(result, 201, {
      message: `Document "${result.document.title}" uploaded and processed successfully. Matter re-analyzed with doc_uploaded.`
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to upload document';
    return apiError(message, 500, 'DOCUMENT_UPLOAD_ERROR');
  }
}
