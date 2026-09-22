import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiSuccess, apiError, getOrGenerateRequestId } from '@/lib/api/response';
import { understandDocument } from '@/lib/legal/document-understanding-engine';

const UnderstandRequestSchema = z.object({
  documentId: z.string().min(1, 'documentId is required'),
  documentText: z.string().min(1, 'documentText is required'),
  documentTitle: z.string().optional(),
  isDemo: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const requestId = getOrGenerateRequestId(req);

  try {
    const body = await req.json();
    const parsed = UnderstandRequestSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; '),
        400,
        'VALIDATION_ERROR',
        parsed.error.issues,
        requestId
      );
    }

    const { documentId, documentText, documentTitle, isDemo } = parsed.data;

    const result = understandDocument(
      documentId,
      documentTitle || 'Uploaded Document',
      documentText,
      { isDemo: isDemo ?? false }
    );

    return apiSuccess(result, 200, undefined, requestId);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal understanding error';
    return apiError(message, 500, 'INTERNAL_ERROR', undefined, requestId);
  }
}
