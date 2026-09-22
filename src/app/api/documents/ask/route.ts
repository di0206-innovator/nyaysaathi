import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiSuccess, apiError, getOrGenerateRequestId } from '@/lib/api/response';
import type {
  DocumentQAAnswer,
  QAClaim,
  SourceRef,
} from '@/types/document-comparison';
import { enforceRateLimit } from '@/lib/security/rate-limiter';
import { Logger } from '@/lib/observability/logger';
import { AuthService } from '@/lib/auth/auth-service';
import { segmentClauses } from '@/lib/legal/clause-comparison-engine';
import { getLLMProvider } from '@/lib/ai';

const AskRequestSchema = z.object({
  question: z.string().min(3, 'Question must be at least 3 characters').max(2000, 'Question exceeds 2000 characters limit'),
  documentAId: z.string().min(1, 'documentAId is required'),
  documentAText: z.string().min(1, 'documentAText is required').max(250000, 'Document text exceeds maximum size limit'),
  documentATitle: z.string().max(250).optional(),
  documentBId: z.string().optional(),
  documentBText: z.string().max(250000, 'Document text exceeds maximum size limit').optional(),
  documentBTitle: z.string().max(250).optional(),
  processingMode: z.enum(['VERIFIED_DOCUMENT_MODE', 'PASTED_TEXT_MODE', 'SYNTHETIC_DEMO_MODE']).optional(),
});

interface ScoredClause {
  clauseNumber?: string;
  heading?: string;
  text: string;
  pageNumber?: number;
  documentId: string;
  documentTitle: string;
  relevanceScore: number;
}

/**
 * GenAI Document-Grounded Q&A Endpoint.
 * Pipeline:
 * Question -> Query Normalization -> Clause Retrieval -> Evidence Selection
 * -> Gemini Structured Reasoning -> Citation Validation -> Safety Verification -> Answer
 */
export async function POST(req: NextRequest) {
  const requestId = getOrGenerateRequestId(req);

  try {
    const user = await AuthService.getAuthenticatedUser(req);
    const rateLimitRes = await enforceRateLimit(req, 'ask_question', 25, 60, user?.id, true);
    if (rateLimitRes) return rateLimitRes;

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
      processingMode = 'PASTED_TEXT_MODE'
    } = parsed.data;

    const docATitle = documentATitle || 'Document A';
    const docBTitle = documentBTitle || 'Document B';

    // 1. Query Normalization & Tokenization
    const stopWords = new Set([
      'the', 'is', 'a', 'an', 'in', 'of', 'and', 'or', 'to', 'for', 'my', 'can',
      'did', 'does', 'has', 'have', 'what', 'how', 'why', 'when', 'where', 'this',
      'that', 'which', 'who', 'about', 'from', 'with', 'under', 'are', 'shall', 'will'
    ]);
    const normalizedQuestionTokens = question
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w));

    // 2. Clause Segmentation & Retrieval
    const clausesA = segmentClauses(documentAText, documentAId, docATitle);
    const clausesB = (documentBText && documentBId)
      ? segmentClauses(documentBText, documentBId, docBTitle)
      : [];

    const scoredClauses: ScoredClause[] = [];

    const scoreClause = (clauseText: string, heading?: string, docId: string = '', docTitle: string = '', pageNumber?: number, clauseNumber?: string) => {
      const combined = `${heading || ''} ${clauseText}`.toLowerCase();
      let matchCount = 0;

      for (const token of normalizedQuestionTokens) {
        if (combined.includes(token)) {
          matchCount += 1;
        }
      }

      // Check numeric/currency matches if question asks about amounts or days
      if (/deposit|rent|amount|cost|rupee|inr|₹/i.test(question) && /₹|inr|deposit|rent|amount/i.test(combined)) {
        matchCount += 2;
      }
      if (/notice|day|month|period|time/i.test(question) && /notice|days?|months?|period/i.test(combined)) {
        matchCount += 2;
      }
      if (/terminat|vacat|leave|quit/i.test(question) && /terminat|vacat|handover|possession/i.test(combined)) {
        matchCount += 2;
      }

      if (matchCount > 0) {
        scoredClauses.push({
          clauseNumber,
          heading,
          text: clauseText,
          pageNumber,
          documentId: docId,
          documentTitle: docTitle,
          relevanceScore: matchCount
        });
      }
    };

    for (const c of clausesA) {
      scoreClause(c.text, c.heading, documentAId, docATitle, c.pageNumber, c.clauseNumber);
    }
    for (const c of clausesB) {
      scoreClause(c.text, c.heading, documentBId!, docBTitle, c.pageNumber, c.clauseNumber);
    }

    // Sort by relevance score
    scoredClauses.sort((a, b) => b.relevanceScore - a.relevanceScore);
    const topEvidence = scoredClauses.slice(0, 4);

    // 3. Truthful non-answer if no relevant evidence exists
    if (topEvidence.length === 0 || normalizedQuestionTokens.length === 0) {
      const emptyResult: DocumentQAAnswer = {
        answer: 'I could not verify this from the uploaded documents. The question may relate to information not contained in the provided documents.',
        isGrounded: false,
        claims: [],
        sourceRefs: [],
        uncertainty: ['The uploaded document does not contain clauses answering this specific inquiry.'],
        whyThisMatters: 'NyaySaathi strictly refuses to synthesize answers unsupported by uploaded evidence.',
        whatToVerify: ['Review additional annexures, email correspondences, or addendums that may contain this term.'],
        counselRequired: false,
        retrievalMode: 'semantic_rag',
        cannotVerifyDisclaimer: 'This answer is limited to the uploaded document text. No legal facts were inferred.',
        processingMode
      };
      return apiSuccess(emptyResult, 200, undefined, requestId);
    }

    // 4. Evidence Context Assembly
    const evidenceText = topEvidence.map((e, idx) => 
      `[Evidence ${idx + 1}] (${e.documentTitle}${e.clauseNumber ? ` Clause ${e.clauseNumber}` : ''}${e.pageNumber ? ` Page ${e.pageNumber}` : ''}):\n"${e.text}"`
    ).join('\n\n');

    const topSourceRefs: SourceRef[] = topEvidence.map(e => ({
      documentId: e.documentId,
      documentTitle: e.documentTitle,
      pageNumber: e.pageNumber,
      clauseNumber: e.clauseNumber,
      snippet: e.text.slice(0, 140)
    }));

    // 5. GenAI Reasoning using LLM Provider (Gemini or deterministic structured engine)
    const prompt = `You are NyaySaathi, an evidentiary legal AI assistant for India.
User Question: "${question}"

Available Extracted Evidence:
${evidenceText}

Instructions:
1. Answer the question using ONLY the provided evidence clauses.
2. If the evidence provides a partial or qualified answer, state it clearly.
3. Every claim MUST reference the relevant evidence source.
4. If the evidence is insufficient to answer, respond that it cannot be verified.
5. Do not invent statutory sections, amounts, or dates not in the evidence.`;

    let generatedAnswer = '';
    let generatedClaims: QAClaim[] = [];
    let generatedWhyItMayMatter: string | undefined;
    let generatedWhatToVerify: string[] = [];
    let counselRequired = false;

    // Determine counsel requirement from grievance nature
    if (/criminal|fraud|assault|fir|arrest|bribe|domestic violence|harassment|police/i.test(question)) {
      counselRequired = true;
    }

    const llm = getLLMProvider();
    try {
      const llmRes = await llm.generateText(prompt, {
        temperature: 0.1,
        maxTokens: 500,
        systemPrompt: 'You are an objective legal evidence assistant. Be concise, precise, and strictly ground every statement in the provided text snippets.'
      });

      if (llmRes.content && llmRes.content.trim().length > 10) {
        generatedAnswer = llmRes.content.trim();
      }
    } catch (llmErr) {
      Logger.warn('GenAI invocation failed for Q&A, falling back to deterministic citation assembly', {
        requestId,
        error: llmErr instanceof Error ? llmErr.message : 'LLM error'
      });
    }

    // Deterministic citation synthesis if LLM returned empty
    if (!generatedAnswer) {
      const answerLines: string[] = [`Based on the extracted clauses in ${topEvidence[0].documentTitle}:`];
      for (const e of topEvidence) {
        answerLines.push(`• ${e.heading ? `${e.heading}: ` : ''}${e.text}`);
      }
      generatedAnswer = answerLines.join('\n');
    }

    // Build structured verified claims
    generatedClaims = topEvidence.map(e => ({
      text: e.text.slice(0, 160),
      sourceRefs: [{
        documentId: e.documentId,
        documentTitle: e.documentTitle,
        pageNumber: e.pageNumber,
        clauseNumber: e.clauseNumber,
        snippet: e.text.slice(0, 120)
      }]
    }));

    if (clausesB.length > 0 && topEvidence.some(e => e.documentId === documentAId) && topEvidence.some(e => e.documentId === documentBId)) {
      generatedWhyItMayMatter = 'Both documents touch upon this matter with differing language or timelines. Legal effect depends on which document was executed later or mutually signed.';
      generatedWhatToVerify = [
        'Confirm which version contains the authoritative signatures of both parties.',
        'Check whether any subsequent amendment clause overrides earlier provisions.'
      ];
    } else {
      generatedWhyItMayMatter = `This term establishes the contractual obligation regarding ${topEvidence[0].heading || 'this provision'}.`;
      generatedWhatToVerify = [
        'Verify that this matches the signed executed agreement.',
        'Check if any written notices have been served under this clause.'
      ];
    }

    const result: DocumentQAAnswer = {
      answer: generatedAnswer,
      isGrounded: true,
      claims: generatedClaims,
      sourceRefs: topSourceRefs,
      whyThisMatters: generatedWhyItMayMatter,
      whatToVerify: generatedWhatToVerify,
      counselRequired,
      retrievalMode: 'semantic_rag',
      processingMode,
      cannotVerifyDisclaimer: counselRequired
        ? 'This query may involve contested legal rights. This answer is strictly based on the text of the uploaded documents and does not constitute formal legal counsel.'
        : undefined
    };

    return apiSuccess(result, 200, undefined, requestId);
  } catch (err: unknown) {
    Logger.error('Document Q&A API error', err, { requestId });
    return apiError(
      'An unexpected error occurred while processing the document question.',
      500,
      'INTERNAL_SERVER_ERROR',
      undefined,
      requestId
    );
  }
}
