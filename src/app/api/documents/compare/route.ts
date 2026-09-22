import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiSuccess, apiError, getOrGenerateRequestId } from '@/lib/api/response';
import { compareDocuments } from '@/lib/legal/clause-comparison-engine';
import { getDemoDocumentSet } from '@/lib/demo/demo-documents';

const CompareRequestSchema = z.object({
  documentAId: z.string().min(1, 'documentAId is required'),
  documentBId: z.string().min(1, 'documentBId is required'),
  documentAText: z.string().optional(),
  documentBText: z.string().optional(),
  documentATitle: z.string().optional(),
  documentBTitle: z.string().optional(),
  demoSetId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const requestId = getOrGenerateRequestId(req);

  try {
    const body = await req.json();
    const parsed = CompareRequestSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; '),
        400,
        'VALIDATION_ERROR',
        parsed.error.issues,
        requestId
      );
    }

    const { documentAId, documentBId, documentAText, documentBText, documentATitle, documentBTitle, demoSetId } = parsed.data;

    // Demo flow: load synthetic documents
    if (demoSetId) {
      const demoSet = getDemoDocumentSet(demoSetId);
      if (!demoSet) {
        return apiError('Demo document set not found.', 404, 'NOT_FOUND', undefined, requestId);
      }
      const result = compareDocuments(
        demoSet.documentA.id,
        demoSet.documentA.title,
        demoSet.documentA.text,
        demoSet.documentB.id,
        demoSet.documentB.title,
        demoSet.documentB.text,
        { isDemo: true }
      );
      return apiSuccess(result, 200, undefined, requestId);
    }

    // Direct text comparison (for uploaded/pasted documents)
    if (documentAText && documentBText) {
      const result = compareDocuments(
        documentAId,
        documentATitle || 'Document A',
        documentAText,
        documentBId,
        documentBTitle || 'Document B',
        documentBText,
        { isDemo: false }
      );
      return apiSuccess(result, 200, undefined, requestId);
    }

    // If no text provided and no demo — require text
    return apiError(
      'Document text content is required. Provide documentAText and documentBText, or use a demoSetId.',
      400,
      'MISSING_CONTENT',
      undefined,
      requestId
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal comparison error';
    return apiError(message, 500, 'INTERNAL_ERROR', undefined, requestId);
  }
}
