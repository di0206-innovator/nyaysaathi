import { TrustSafetyTier, DraftParagraph, DraftAuditEntry } from '@/types/matter';

export interface StatementAuditResult {
  originalText: string;
  revisedText: string;
  tier: TrustSafetyTier;
  confidenceScore: number;
  groundingRefIds: string[];
  reasons: string[];
  wasRewritten: boolean;
  requiresClarificationPrompt?: boolean;
}

export interface DraftAuditResult {
  sanitizedContent: string;
  paragraphs: DraftParagraph[];
  auditEntries: DraftAuditEntry[];
  aggressivePhrasesNeutralizedCount: number;
  requiresAdvocateReview: boolean;
}

export class ClaimSupportChecker {
  /**
   * Overconfident or aggressive legal phrases that must be rewritten into neutral,
   * non-definitive informational language.
   */
  private static OVERCONFIDENT_PATTERNS: Array<{
    pattern: RegExp;
    replacement: string;
    reason: string;
  }> = [
    {
      pattern: /you (will|shall) (definitely|certainly|100%) win/gi,
      replacement: 'you have a statutory ground under Indian law to claim',
      reason: 'Neutralized guaranteed outcome claim into grounded statutory basis.'
    },
    {
      pattern: /\b(is|are\s+)?(completely\s+|wholly\s+|strictly\s+|blatantly\s+)?(illegally|illegal)\b/gi,
      replacement: 'appears inconsistent with contractual terms and statutory guidelines',
      reason: 'Softened aggressive "illegal" assertion to factual non-compliance.'
    },
    {
      pattern: /\b(is|are\s+)?(completely\s+|wholly\s+|strictly\s+|blatantly\s+)?(unlawfully|unlawful)\b/gi,
      replacement: 'is untenable under applicable legal provisions',
      reason: 'Replaced conclusive "unlawful" statement with neutral legal evaluation.'
    },
    {
      pattern: /\b(you are|the applicant is) (strictly\s+|fully\s+|definitely\s+)?entitled to\b/gi,
      replacement: 'you have a documented basis to seek',
      reason: 'Replaced entitlement certainty with verifiable claim phrasing.'
    },
    {
      pattern: /\b(must pay|shall be forced to pay)\b/gi,
      replacement: 'is formally requested to remit / refund',
      reason: 'Tempered coercive "must pay" demand into formal request.'
    },
    {
      pattern: /\b(\d{1,2}%)\s*(penal\s+interest|punitive\s+interest)\b/gi,
      replacement: 'statutory interest as may be determined by the competent forum',
      reason: 'Replaced arbitrary fixed penal interest rate with forum-determined statutory interest.'
    },
    {
      pattern: /the (landlord|merchant|employer|builder) (is\s+definitely|definitely\s+committed|is\s+guilty\s+of|is\s+proven\s+to\s+be|committed)\s+(a\s+)?(criminal\s+fraud|criminal|fraudulent|fraud|guilty)/gi,
      replacement: 'the conduct appears inconsistent with contractual or statutory duties',
      reason: 'Replaced defamatory criminal characterization with conduct-based description.'
    },
    {
      pattern: /the court (will|must) rule in your favor/gi,
      replacement: 'the relevant adjudicating forum evaluates these documented facts',
      reason: 'Removed judicial verdict prediction.'
    },
    {
      pattern: /there is zero risk/gi,
      replacement: 'the procedural position appears supported by provided documentation',
      reason: 'Replaced "zero risk" claim with accurate procedural statement.'
    },
    {
      pattern: /you do not need any lawyer whatsoever/gi,
      replacement: 'you can initiate pre-litigation conciliation or e-Daakhil without counsel, while formal litigation may benefit from an advocate',
      reason: 'Qualified lawyer requirement statement.'
    },
    {
      pattern: /\b(we guarantee|guaranteed outcome|assured recovery|guarantee\s+full\s+recovery(\s+in\s+court)?)\b/gi,
      replacement: 'subject to evidentiary adjudication by the competent forum',
      reason: 'Removed guarantee promise.'
    }
  ];

  /**
   * Evaluates a statement against available evidence IDs, statutory references,
   * and language patterns.
   */
  public static auditStatement(
    statement: string,
    evidenceDocIds: string[] = [],
    verifiedFactIds: string[] = [],
    statutoryRefIds: string[] = []
  ): StatementAuditResult {
    let revised = statement;
    let wasRewritten = false;
    const reasons: string[] = [];
    const groundingRefIds: string[] = [];

    // 1. Check and rewrite overconfident / unsafe assertions
    for (const { pattern, replacement, reason } of this.OVERCONFIDENT_PATTERNS) {
      if (pattern.test(revised)) {
        revised = revised.replace(pattern, replacement);
        wasRewritten = true;
        reasons.push(reason);
      }
    }

    // 2. Classify Tier based on grounding support
    const hasDocSupport = evidenceDocIds.length > 0;
    const hasFactSupport = verifiedFactIds.length > 0;
    const hasStatuteSupport = statutoryRefIds.length > 0;

    let tier: TrustSafetyTier = 'unsupported';
    let confidence = 0.5;

    if (hasDocSupport && hasFactSupport) {
      tier = 'fact';
      confidence = 0.95;
      groundingRefIds.push(...evidenceDocIds, ...verifiedFactIds);
      reasons.push('Supported by verified documentary evidence and corroborated user statement.');
    } else if (hasStatuteSupport) {
      tier = 'explanation';
      confidence = 0.90;
      groundingRefIds.push(...statutoryRefIds);
      reasons.push('Supported by codified Indian statutory provision / procedural rules.');
    } else if (hasFactSupport || hasDocSupport) {
      tier = 'fact';
      confidence = 0.85;
      groundingRefIds.push(...evidenceDocIds, ...verifiedFactIds);
      reasons.push('Supported by single evidence/statement point.');
    } else {
      // Check if this requires court/advocate
      const lower = statement.toLowerCase();
      if (
        lower.includes('vakalatnama') ||
        lower.includes('affidavit') ||
        lower.includes('court of small causes') ||
        lower.includes('cross-examination') ||
        lower.includes('magistrate')
      ) {
        tier = 'counsel_required';
        confidence = 0.92;
        reasons.push('Involves formal judicial litigation or advocate-exclusive mandate under Advocates Act 1961.');
      } else if (lower.includes('unsupported') || lower.includes('speculative') || (!hasDocSupport && !hasFactSupport && !hasStatuteSupport)) {
        tier = 'unsupported';
        confidence = 0.35;
        reasons.push('Unsupported statement without factual, documentary, or statutory grounding.');
      } else {
        tier = 'possibility';
        confidence = 0.65;
        reasons.push('Evaluated as a potential legal scenario or counter-argument without direct document proof.');
      }
    }

    // Flag for clarification if completely ungrounded or speculative
    const requiresClarificationPrompt = (tier as TrustSafetyTier) === 'unsupported' || (tier === 'possibility' && confidence < 0.6);

    return {
      originalText: statement,
      revisedText: revised,
      tier,
      confidenceScore: confidence,
      groundingRefIds,
      reasons,
      wasRewritten,
      requiresClarificationPrompt
    };
  }

  /**
   * Audits full legal draft content paragraph-by-paragraph.
   * Rewrites aggressive phrases, tracks modifications, and flags lawyer-review needs.
   */
  public static auditDraftContent(
    content: string,
    options: {
      isLawyerReady?: boolean;
      groundingRefIds?: string[];
    } = {}
  ): DraftAuditResult {
    const rawParagraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const auditedParagraphs: DraftParagraph[] = [];
    const auditEntries: DraftAuditEntry[] = [];
    let aggressivePhrasesNeutralizedCount = 0;

    const sanitizedParagraphTexts: string[] = [];

    rawParagraphs.forEach((para, idx) => {
      let currentParaText = para;
      let paraModified = false;
      const reasons: string[] = [];

      for (const { pattern, replacement, reason } of this.OVERCONFIDENT_PATTERNS) {
        if (pattern.test(currentParaText)) {
          const originalSnippet = currentParaText;
          currentParaText = currentParaText.replace(pattern, replacement);
          paraModified = true;
          aggressivePhrasesNeutralizedCount++;
          reasons.push(reason);
          auditEntries.push({
            original: originalSnippet.trim(),
            rewritten: currentParaText.trim(),
            reason,
            timestamp: new Date().toISOString()
          });
        }
      }

      sanitizedParagraphTexts.push(currentParaText);

      auditedParagraphs.push({
        id: `para-${idx + 1}`,
        text: currentParaText,
        originalText: paraModified ? para : undefined,
        groundingRefIds: options.groundingRefIds,
        safetyStatus: paraModified ? 'rewritten' : options.isLawyerReady ? 'counsel_review' : 'safe',
        rewriteReason: reasons.length > 0 ? reasons.join(' ') : undefined
      });
    });

    const sanitizedContent = sanitizedParagraphTexts.join('\n\n');

    return {
      sanitizedContent,
      paragraphs: auditedParagraphs,
      auditEntries,
      aggressivePhrasesNeutralizedCount,
      requiresAdvocateReview: !!options.isLawyerReady
    };
  }
}
