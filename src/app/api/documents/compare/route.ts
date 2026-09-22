import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiSuccess, apiError, getOrGenerateRequestId } from '@/lib/api/response';
import { compareDocuments } from '@/lib/legal/clause-comparison-engine';
import { getDemoDocumentSet } from '@/lib/demo/demo-documents';
import { AuthService } from '@/lib/auth/auth-service';
import { getMatterService } from '@/lib/repository';
import { enforceRateLimit } from '@/lib/security/rate-limiter';
import { Logger } from '@/lib/observability/logger';
import { DocumentEvidence } from '@/types/matter';

const CompareRequestSchema = z.object({
  documentAId: z.string().min(1, 'documentAId is required'),
  documentBId: z.string().min(1, 'documentBId is required'),
  documentAText: z.string().optional(),
  documentBText: z.string().optional(),
  documentATitle: z.string().optional(),
  documentBTitle: z.string().optional(),
  matterId: z.string().optional(),
  matterIdA: z.string().optional(),
  matterIdB: z.string().optional(),
  demoSetId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const requestId = getOrGenerateRequestId(req);

  try {
    const user = await AuthService.getAuthenticatedUser(req);

    // Enforce rate limiting (expensive operation)
    const rateLimitRes = await enforceRateLimit(req, 'compare_docs', 20, 60, user?.id, true);
    if (rateLimitRes) return rateLimitRes;

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

    const {
      documentAId,
      documentBId,
      documentAText,
      documentBText,
      documentATitle,
      documentBTitle,
      matterId,
      matterIdA,
      matterIdB,
      demoSetId,
    } = parsed.data;

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

    // Matter-backed document comparison: verify ownership and prevent cross-user comparison
    const targetMatterAId = matterIdA || matterId;
    const targetMatterBId = matterIdB || matterId;

    let textA = documentAText;
    let textB = documentBText;
    let titleA = documentATitle;
    let titleB = documentBTitle;

    if (targetMatterAId || targetMatterBId) {
      if (!user) {
        return apiError(
          'Authentication required to compare documents from stored matters.',
          401,
          'UNAUTHORIZED',
          undefined,
          requestId
        );
      }

      const matterService = getMatterService(user.token);

      // Verify Matter A ownership
      if (targetMatterAId) {
        const matterA = await matterService.getMatterById(targetMatterAId, user.id);
        if (!matterA) {
          return apiError('Matter A not found or access denied.', 404, 'MATTER_NOT_FOUND', undefined, requestId);
        }
        if (matterA.userId && matterA.userId !== user.id) {
          return apiError(
            'Cross-user document comparison is forbidden. You do not have access to Document A.',
            403,
            'FORBIDDEN',
            undefined,
            requestId
          );
        }
        const docA = (matterA.documents || []).find((d: DocumentEvidence) => d.id === documentAId);
        if (docA) {
          textA = textA || docA.extractedText || '';
          titleA = titleA || docA.title;
        }
      }

      // Verify Matter B ownership
      if (targetMatterBId) {
        const matterB = await matterService.getMatterById(targetMatterBId, user.id);
        if (!matterB) {
          return apiError('Matter B not found or access denied.', 404, 'MATTER_NOT_FOUND', undefined, requestId);
        }
        if (matterB.userId && matterB.userId !== user.id) {
          return apiError(
            'Cross-user document comparison is forbidden. You do not have access to Document B.',
            403,
            'FORBIDDEN',
            undefined,
            requestId
          );
        }
        const docB = (matterB.documents || []).find((d: DocumentEvidence) => d.id === documentBId);
        if (docB) {
          textB = textB || docB.extractedText || '';
          titleB = titleB || docB.title;
        }
      }
    }

    // Direct text comparison (for uploaded/pasted or loaded documents)
    if (textA && textB) {
      const result = compareDocuments(
        documentAId,
        titleA || 'Document A',
        textA,
        documentBId,
        titleB || 'Document B',
        textB,
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
    Logger.error('Document comparison error', {
      error: err instanceof Error ? err.message : 'Unknown error',
      requestId
    });
    return apiError(
      'An unexpected error occurred during document comparison.',
      500,
      'INTERNAL_ERROR',
      undefined,
      requestId
    );
  }
}
