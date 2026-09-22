import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiSuccess, apiError, getOrGenerateRequestId } from '@/lib/api/response';
import { understandDocument } from '@/lib/legal/document-understanding-engine';
import { enforceRateLimit } from '@/lib/security/rate-limiter';
import { Logger } from '@/lib/observability/logger';
import { AuthService } from '@/lib/auth/auth-service';

const UnderstandRequestSchema = z.object({
  documentId: z.string().min(1, 'documentId is required'),
  documentText: z.string().min(1, 'documentText is required').max(250000, 'Document text exceeds maximum size limit'),
  documentTitle: z.string().max(250).optional(),
  isDemo: z.boolean().optional(),
  processingMode: z.enum(['VERIFIED_DOCUMENT_MODE', 'PASTED_TEXT_MODE', 'SYNTHETIC_DEMO_MODE']).optional(),
  contentHash: z.string().optional(),
  extractionStatus: z.enum(['complete', 'partial', 'needs_review', 'needs_ocr']).optional(),
});

export async function POST(req: NextRequest) {
  const requestId = getOrGenerateRequestId(req);

  try {
    const user = await AuthService.getAuthenticatedUser(req);
    const rateLimitRes = await enforceRateLimit(req, 'document_extraction', 25, 60, user?.id, true);
    if (rateLimitRes) return rateLimitRes;

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

    const {
      documentId,
      documentText,
      documentTitle,
      isDemo,
      processingMode,
      contentHash,
      extractionStatus
    } = parsed.data;

    const result = understandDocument(
      documentId,
      documentTitle || 'Uploaded Document',
      documentText,
      {
        isDemo: isDemo ?? false,
        processingMode,
        contentHash,
        extractionStatus
      }
    );

    return apiSuccess(result, 200, undefined, requestId);
  } catch (err) {
    Logger.error('Document understanding failed', {
      error: err instanceof Error ? err.message : 'Unknown error',
      requestId
    });
    return apiError('An unexpected error occurred while analyzing the document.', 500, 'INTERNAL_ERROR', undefined, requestId);
  }
}
