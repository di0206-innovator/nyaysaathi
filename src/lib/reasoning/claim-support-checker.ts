import { TrustSafetyTier } from '@/types/matter';

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

export class ClaimSupportChecker {
  /**
   * Overconfident or aggressive legal phrases that must be rewritten into neutral,
   * non-definitive informational language.
   */
  private static OVERCONFIDENT_PATTERNS = [
    { pattern: /you (will|shall) (definitely|certainly|100%) win/gi, replacement: 'you have a statutory ground under Indian law to claim' },
    { pattern: /the (landlord|merchant|employer|builder) is (definitely|guilty of|proven to be) (a criminal|fraudulent|guilty)/gi, replacement: 'the conduct appears inconsistent with contractual or statutory duties' },
    { pattern: /the court (will|must) rule in your favor/gi, replacement: 'the relevant forum typically evaluates these documented facts' },
    { pattern: /there is zero risk/gi, replacement: 'the procedural position appears supported by provided documentation' },
    { pattern: /you do not need any lawyer whatsoever/gi, replacement: 'you can initiate pre-litigation conciliation or e-Daakhil without counsel, while formal litigation may benefit from an advocate' }
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
    for (const { pattern, replacement } of this.OVERCONFIDENT_PATTERNS) {
      if (pattern.test(revised)) {
        revised = revised.replace(pattern, replacement);
        wasRewritten = true;
        reasons.push('Rewrote definitive legal guarantee into informational procedural language.');
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
      } else if (lower.includes('unsupported') || lower.includes('speculative')) {
        tier = 'unsupported';
        confidence = 0.3;
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
}
