import { NextRequest } from 'next/server';
import { AuthService } from '@/lib/auth/auth-service';
import { getMatterService } from '@/lib/repository';
import { DocumentComparator } from '@/lib/legal/document-comparator';
import { DocumentCompareSchema, parseRequestBody } from '@/lib/api/schemas';
import { apiSuccess, apiError, getOrGenerateRequestId } from '@/lib/api/response';
import { enforceRateLimit } from '@/lib/security/rate-limiter';
import { Logger } from '@/lib/observability/logger';
import { DocumentEvidence } from '@/types/matter';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = getOrGenerateRequestId(req);
  try {
    const user = await AuthService.getAuthenticatedUser(req);

    if (!user) {
      return apiError(
        'Authentication required to compare documents for this matter.',
        401,
        'UNAUTHORIZED',
        undefined,
        requestId
      );
    }

    const rateLimitResponse = await enforceRateLimit(req, 'compare_docs', 20, 60, user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const parseResult = await parseRequestBody(req, DocumentCompareSchema);
    if (!parseResult.success) {
      return apiError(
        parseResult.error,
        400,
        'VALIDATION_FAILED',
        undefined,
        requestId
      );
    }

    const { id: matterId } = await params;
    const { sourceDocumentId, baseDocumentId, targetDocumentId, comparisonType } = parseResult.data;
    const baseDocId = sourceDocumentId || baseDocumentId || '';

    const matterService = getMatterService(user.token);
    const matter = await matterService.getMatterById(matterId, user.id);

    if (!matter) {
      return apiError(
        'Matter not found.',
        404,
        'MATTER_NOT_FOUND',
        undefined,
        requestId
      );
    }

    if (matter.userId && matter.userId !== user.id) {
      return apiError(
        'Access denied to this matter.',
        403,
        'FORBIDDEN',
        undefined,
        requestId
      );
    }

    const documents: DocumentEvidence[] = matter.documents || [];
    const baseDoc = documents.find((d: DocumentEvidence) => d.id === baseDocId);
    const targetDoc = documents.find((d: DocumentEvidence) => d.id === targetDocumentId);

    if (!baseDoc || !targetDoc) {
      return apiError(
        'One or both specified documents were not found in this matter.',
        404,
        'DOCUMENT_NOT_FOUND',
        undefined,
        requestId
      );
    }

    const comparison = DocumentComparator.compare(
      matterId,
      baseDoc,
      targetDoc,
      comparisonType
    );

    return apiSuccess(comparison, 200, undefined, requestId);
  } catch (err: unknown) {
    Logger.error('API /matters/[id]/compare error', err, { requestId });
    return apiError(
      'Failed to execute document comparison.',
      500,
      'INTERNAL_SERVER_ERROR',
      undefined,
      requestId
    );
  }
}
