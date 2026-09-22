import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiSuccess, apiError, getOrGenerateRequestId } from '@/lib/api/response';
import type { DocumentQAAnswer, SourceRef } from '@/types/document-comparison';

const AskRequestSchema = z.object({
  question: z.string().min(3, 'Question must be at least 3 characters'),
  documentAId: z.string().min(1),
  documentAText: z.string().min(1),
  documentATitle: z.string().optional(),
  documentBId: z.string().optional(),
  documentBText: z.string().optional(),
  documentBTitle: z.string().optional(),
});

/**
 * Document-grounded Q&A.
 * Searches the provided document text for relevant clauses/facts,
 * and refuses to answer if the information is not found in the documents.
 */
export async function POST(req: NextRequest) {
  const requestId = getOrGenerateRequestId(req);

  try {
    const body = await req.json();
    const parsed = AskRequestSchema.safeParse(body);

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
      question,
      documentAId,
      documentAText,
      documentATitle,
      documentBId,
      documentBText,
      documentBTitle,
    } = parsed.data;

    // Search documents for relevant information
    const questionLower = question.toLowerCase();
    const sourceRefs: SourceRef[] = [];
    const answerParts: string[] = [];

    const docATitle = documentATitle || 'Document A';
    const docBTitle = documentBTitle || 'Document B';

    // Extract relevant lines from Document A
    const relevantFromA = findRelevantLines(documentAText, questionLower);
    if (relevantFromA.length > 0) {
      answerParts.push(`Based on ${docATitle}:`);
      for (const line of relevantFromA) {
        answerParts.push(`• ${line.text}`);
        sourceRefs.push({
          documentId: documentAId,
          documentTitle: docATitle,
          pageNumber: line.pageNumber,
          snippet: line.text.slice(0, 120),
        });
      }
    }

    // Extract relevant lines from Document B (if provided)
    if (documentBText && documentBId) {
      const relevantFromB = findRelevantLines(documentBText, questionLower);
      if (relevantFromB.length > 0) {
        answerParts.push('');
        answerParts.push(`Based on ${docBTitle}:`);
        for (const line of relevantFromB) {
          answerParts.push(`• ${line.text}`);
          sourceRefs.push({
            documentId: documentBId,
            documentTitle: docBTitle,
            pageNumber: line.pageNumber,
            snippet: line.text.slice(0, 120),
          });
        }
      }
    }

    // If we couldn't find anything relevant
    if (sourceRefs.length === 0) {
      const result: DocumentQAAnswer = {
        answer: 'I could not verify this from the uploaded documents. The question may relate to information not contained in the provided documents.',
        isGrounded: false,
        sourceRefs: [],
        counselRequired: false,
        cannotVerifyDisclaimer: 'This answer is limited to the content of the uploaded documents. For questions about legal rights or obligations not covered in these documents, professional legal counsel is recommended.',
      };
      return apiSuccess(result, 200, undefined, requestId);
    }

    // Build grounded answer
    const hasComparison = documentBText && documentBId;
    let whyThisMatters: string | undefined;
    let whatToVerify: string[] | undefined;

    if (hasComparison && sourceRefs.some(r => r.documentId === documentAId) && sourceRefs.some(r => r.documentId === documentBId)) {
      whyThisMatters = 'The documents contain different provisions regarding this topic. The applicable terms depend on which version is currently in effect.';
      whatToVerify = [
        'Which version of the document is the currently binding agreement.',
        'Whether any amendments or addendums supersede these provisions.',
      ];
    }

    // Determine if counsel is needed
    const counselKeywords = /criminal|fraud|arrest|custody|domestic violence|harassment|assault|fir|bail/i;
    const counselRequired = counselKeywords.test(question);

    const result: DocumentQAAnswer = {
      answer: answerParts.join('\n'),
      isGrounded: true,
      sourceRefs,
      whyThisMatters,
      whatToVerify,
      counselRequired,
    };

    if (counselRequired) {
      result.cannotVerifyDisclaimer = 'This matter may involve issues that require professional legal advice. The information provided is based solely on the uploaded documents and does not constitute legal counsel.';
    }

    return apiSuccess(result, 200, undefined, requestId);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal Q&A error';
    return apiError(message, 500, 'INTERNAL_ERROR', undefined, requestId);
  }
}

// ---------------------------------------------------------------------------
// Document Search Utilities
// ---------------------------------------------------------------------------

interface RelevantLine {
  text: string;
  pageNumber?: number;
  score: number;
}

function findRelevantLines(documentText: string, questionLower: string): RelevantLine[] {
  // Extract keywords from question
  const stopWords = new Set(['the', 'is', 'a', 'an', 'in', 'of', 'and', 'or', 'to', 'for', 'my', 'can', 'did', 'does', 'has', 'have', 'what', 'how', 'why', 'when', 'where', 'this', 'that', 'which', 'who']);
  const keywords = questionLower
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));

  if (keywords.length === 0) return [];

  const lines = documentText.split('\n').map(l => l.trim()).filter(l => l.length > 15);
  let currentPage = 1;

  const scored: RelevantLine[] = [];

  for (const line of lines) {
    const pageMatch = line.match(/^(?:page|pg\.?)\s*(\d+)/i);
    if (pageMatch) {
      currentPage = parseInt(pageMatch[1], 10);
      continue;
    }

    const lineLower = line.toLowerCase();
    let score = 0;
    for (const kw of keywords) {
      if (lineLower.includes(kw)) score++;
    }

    if (score >= Math.max(1, Math.floor(keywords.length * 0.3))) {
      scored.push({ text: line, pageNumber: currentPage, score });
    }
  }

  // Return top 3 most relevant
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}
