import { DocumentEvidence } from '@/types/matter';
import {
  DocumentComparison,
  ClauseComparison
} from '@/types/document-comparison';
import { compareDocuments } from './clause-comparison-engine';

export interface ClauseComparisonResult {
  clauseTitle: string;
  baseClauseText: string;
  targetClauseText?: string;
  comparisonStatus: 'aligned' | 'conflicting' | 'missing_in_target' | 'unilateral_variation';
  riskLevel: 'low' | 'medium' | 'high';
  plainLanguageExplanation: string;
  statutoryAnchor?: string;
  actionableGuidance: string;
}

export interface DocumentComparisonSummary {
  matterId: string;
  baseDocumentTitle: string;
  targetDocumentTitle: string;
  comparisonType: 'agreement_vs_notice' | 'clause_vs_statute' | 'general_diff';
  overallAlignmentScore: number; // 0 to 100
  totalClausesCompared: number;
  conflictingClausesCount: number;
  unilateralVariationsCount: number;
  executiveSummary: string;
  clauseComparisons: ClauseComparisonResult[];
  recommendedStrategy: string;
  statutoryProtectionsApplied: string[];
  canonicalComparison?: DocumentComparison;
}

/**
 * DocumentComparator — Unified Document Comparison Adapter
 * Serves matter-specific workflows while aligning with the canonical comparison domain model.
 */
export class DocumentComparator {
  /**
   * Compares two legal documents clause by clause.
   * If comparisonType === 'general_diff', uses the generalized clause segmentation pipeline.
   * If comparisonType === 'agreement_vs_notice', applies high-precision legal conflict detection
   * (ICA §74 forfeiture, TPA §108(m) wear-and-tear, ICA §37 notice covenants).
   */
  public static compare(
    matterId: string,
    baseDoc: DocumentEvidence,
    targetDoc: DocumentEvidence,
    comparisonType: 'agreement_vs_notice' | 'clause_vs_statute' | 'general_diff' = 'agreement_vs_notice'
  ): DocumentComparisonSummary {
    const baseText = baseDoc.extractedText || '';
    const targetText = targetDoc.extractedText || '';

    const comparisons: ClauseComparisonResult[] = [];
    const statutoryProtections: string[] = [];

    // 1. Security Deposit / Deductions Clause
    const baseHasDeposit = /deposit|security|caution money/i.test(baseText);
    const targetHasDeposit = /deposit|security|deduct|withhold|painting|damage/i.test(targetText);

    if (baseHasDeposit || targetHasDeposit) {
      const targetHasDeductions = /deduct|painting|damage|repair|wear/i.test(targetText);
      const baseHasWearProtection = /wear and tear|reasonable wear|ordinary wear/i.test(baseText);

      if (targetHasDeductions && !baseText.includes('painting deduction')) {
        comparisons.push({
          clauseTitle: 'Security Deposit & Wear-and-Tear Deductions',
          baseClauseText: baseHasWearProtection
            ? 'Agreement protects tenant against normal wear and tear deductions.'
            : (baseText.slice(0, 160) || 'Agreement mandates refund of security deposit upon peaceful vacation.'),
          targetClauseText: 'Notice/Communication asserts unilateral deductions for repairs, painting, or alleged damages.',
          comparisonStatus: 'conflicting',
          riskLevel: 'high',
          plainLanguageExplanation:
            'The landlord or counterparty is attempting to deduct charges not expressly authorized in the original agreement or prohibited by statutory wear-and-tear covenants.',
          statutoryAnchor: 'Transfer of Property Act 1882 §108(m) & Indian Contract Act 1872 §73',
          actionableGuidance:
            'Demand original GST invoices, contractor receipts, and move-in inspection proof before accepting any unilateral deductions.',
        });
        statutoryProtections.push('TPA §108(m) (Normal Wear and Tear Protection)');
      } else {
        comparisons.push({
          clauseTitle: 'Security Deposit Refund Timeline',
          baseClauseText: 'Stipulates full refund upon handover of keys and vacant possession.',
          targetClauseText: 'Acknowledges receipt of keys or discusses return terms.',
          comparisonStatus: 'aligned',
          riskLevel: 'low',
          plainLanguageExplanation: 'Both documents recognize that the security deposit is refundable on vacant handover.',
          statutoryAnchor: 'Indian Contract Act 1872 §73',
          actionableGuidance: 'Hold counterparty to the agreed refund window established in the base agreement.',
        });
      }
    }

    // 2. Notice Period & Vacate Covenant
    const baseNoticeMatch = baseText.match(/(\d{1,2})\s*(?:days?|months?)\s*notice/i);
    const targetNoticeMatch = targetText.match(/(\d{1,2})\s*(?:days?|months?)\s*notice/i);

    if (baseNoticeMatch || targetNoticeMatch) {
      const baseNotice = baseNoticeMatch ? baseNoticeMatch[0] : 'Standard 30 days';
      const targetNotice = targetNoticeMatch ? targetNoticeMatch[0] : 'Unspecified notice';

      if (baseNoticeMatch && targetNoticeMatch && baseNoticeMatch[1] !== targetNoticeMatch[1]) {
        comparisons.push({
          clauseTitle: 'Notice Period Duration',
          baseClauseText: `Original agreement specified: ${baseNotice}`,
          targetClauseText: `Counterparty claims notice required was: ${targetNotice}`,
          comparisonStatus: 'conflicting',
          riskLevel: 'high',
          plainLanguageExplanation: `There is a direct contradiction between the agreed notice period (${baseNotice}) and what is claimed in the subsequent communication (${targetNotice}).`,
          statutoryAnchor: 'Indian Contract Act 1872 §37 (Obligation of Parties to Contract)',
          actionableGuidance: 'Submit written proof of notice tendered according to the base agreement terms.',
        });
      } else {
        comparisons.push({
          clauseTitle: 'Notice Period Compliance',
          baseClauseText: `Agreed notice terms: ${baseNotice}`,
          targetClauseText: `Notice referenced: ${targetNotice}`,
          comparisonStatus: 'aligned',
          riskLevel: 'low',
          plainLanguageExplanation: 'Notice timeline in the communication conforms to the underlying contractual agreement.',
          statutoryAnchor: 'Indian Contract Act 1872 §37',
          actionableGuidance: 'Keep postal speed-post receipts or email timestamps on record to prove timely dispatch.',
        });
      }
    }

    // 3. Forfeiture vs Proportional Rent (ICA §74)
    if (/forfeit|forfeiture/i.test(targetText)) {
      comparisons.push({
        clauseTitle: 'Deposit Forfeiture Clause',
        baseClauseText: 'Security deposit held as performance guarantee, not liquidated penalty.',
        targetClauseText: 'Counterparty asserts right of complete or excessive deposit forfeiture.',
        comparisonStatus: 'unilateral_variation',
        riskLevel: 'high',
        plainLanguageExplanation:
          'Under Indian law, forfeiture clauses that act as in terrorem penalties without actual proven financial damages are void under Section 74 of the Indian Contract Act.',
        statutoryAnchor: 'Indian Contract Act 1872 §74 (Kailash Nath Associates v. DDA)',
        actionableGuidance:
          'Clarify in your formal demand that penalty-like forfeiture without documented actual damages violates Indian contract law.',
      });
      statutoryProtections.push('ICA §74 (Prohibition of Unreasonable Penalties / Forfeiture)');
    }

    // 4. Dispute Resolution / Jurisdiction Clause
    const baseCourtMatch = baseText.match(/jurisdiction\s+of\s+courts?\s+in\s+([a-zA-Z\s]+)/i);
    const targetCourtMatch = targetText.match(/courts?\s+in\s+([a-zA-Z\s]+)/i);

    if (baseCourtMatch && targetCourtMatch) {
      const baseCity = baseCourtMatch[1].trim();
      const targetCity = targetCourtMatch[1].trim();
      if (!baseCity.toLowerCase().includes(targetCity.toLowerCase()) && !targetCity.toLowerCase().includes(baseCity.toLowerCase())) {
        comparisons.push({
          clauseTitle: 'Territorial Jurisdiction',
          baseClauseText: `Agreement designates jurisdiction: Courts of ${baseCity}`,
          targetClauseText: `Notice claims dispute forum: Courts of ${targetCity}`,
          comparisonStatus: 'conflicting',
          riskLevel: 'medium',
          plainLanguageExplanation: `Dispute forum in the notice (${targetCity}) does not match the territorial jurisdiction agreed in the contract (${baseCity}).`,
          statutoryAnchor: 'Code of Civil Procedure 1908 §20',
          actionableGuidance: 'File complaints or pre-litigation mediation petitions strictly in the contractually agreed jurisdiction.',
        });
      }
    }

    // If general_diff requested or no specialized clauses found, run canonical engine
    if (comparisonType === 'general_diff' || comparisons.length === 0) {
      const canonical = compareDocuments(
        baseDoc.id,
        baseDoc.title || 'Base Document',
        baseText,
        targetDoc.id,
        targetDoc.title || 'Target Document',
        targetText
      );

      for (const c of canonical.clauses) {
        if (c.status !== 'unchanged' || comparisons.length === 0) {
          comparisons.push({
            clauseTitle: c.newClause?.heading || c.oldClause?.heading || c.category,
            baseClauseText: c.oldClause?.text || 'Clause not present in original document.',
            targetClauseText: c.newClause?.text || 'Clause removed in target document.',
            comparisonStatus: c.status === 'unchanged' ? 'aligned' : (c.status === 'added' ? 'unilateral_variation' : (c.status === 'removed' ? 'missing_in_target' : 'conflicting')),
            riskLevel: c.requiresCounselReview ? 'high' : (c.status === 'modified' ? 'medium' : 'low'),
            plainLanguageExplanation: c.plainLanguageExplanation,
            statutoryAnchor: c.legalContext ? `${c.legalContext.actName} ${c.legalContext.section || ''}`.trim() : undefined,
            actionableGuidance: c.whyItMayMatter || 'Review contractual terms.'
          });
          if (c.legalContext) {
            statutoryProtections.push(`${c.legalContext.actName} ${c.legalContext.section || ''}`.trim());
          }
        }
      }
    }

    const total = comparisons.length;
    const conflicting = comparisons.filter(c => c.comparisonStatus === 'conflicting').length;
    const variations = comparisons.filter(c => c.comparisonStatus === 'unilateral_variation' || c.comparisonStatus === 'missing_in_target').length;
    const overallScore = Math.max(10, Math.round(100 - (conflicting * 35 + variations * 25)));

    let executiveSummary = '';
    if (conflicting > 0 || variations > 0) {
      executiveSummary = `Comparison revealed ${conflicting} direct contradiction(s) and ${variations} unilateral variation(s) between "${baseDoc.title}" and "${targetDoc.title}". The counterparty has introduced claims or deductions that are unsupported by the underlying agreement or restricted by statutory protection.`;
    } else {
      executiveSummary = `The clauses in "${targetDoc.title}" substantially conform to the terms agreed in "${baseDoc.title}". No critical contractual contradictions were discovered.`;
    }

    // Build canonical DocumentComparison representation
    const canonicalClauses: ClauseComparison[] = comparisons.map((c, idx) => ({
      id: `clause-comp-${idx + 1}`,
      category: 'other',
      status: c.comparisonStatus === 'aligned' ? 'unchanged' : (c.comparisonStatus === 'unilateral_variation' ? 'added' : (c.comparisonStatus === 'missing_in_target' ? 'removed' : 'modified')),
      oldClause: {
        id: `${baseDoc.id}-clause-${idx + 1}`,
        documentId: baseDoc.id,
        heading: c.clauseTitle,
        text: c.baseClauseText,
        category: 'other',
        sourceRefs: [{ documentId: baseDoc.id, documentTitle: baseDoc.title || 'Base Document', snippet: c.baseClauseText.slice(0, 100) }]
      },
      newClause: c.targetClauseText ? {
        id: `${targetDoc.id}-clause-${idx + 1}`,
        documentId: targetDoc.id,
        heading: c.clauseTitle,
        text: c.targetClauseText,
        category: 'other',
        sourceRefs: [{ documentId: targetDoc.id, documentTitle: targetDoc.title || 'Target Document', snippet: c.targetClauseText.slice(0, 100) }]
      } : undefined,
      changeSummary: c.plainLanguageExplanation,
      plainLanguageExplanation: c.plainLanguageExplanation,
      whyItMayMatter: c.actionableGuidance,
      sourceRefs: [{ documentId: baseDoc.id, documentTitle: baseDoc.title || 'Base Document', snippet: c.baseClauseText.slice(0, 100) }],
      legalContext: c.statutoryAnchor ? {
        sourceId: 'statute-anchor',
        actName: c.statutoryAnchor,
        bindingNature: 'statutory'
      } : undefined,
      requiresCounselReview: c.riskLevel === 'high'
    }));

    const canonicalComparison: DocumentComparison = {
      id: `comp-${matterId}-${Date.now()}`,
      documentAId: baseDoc.id,
      documentBId: targetDoc.id,
      documentATitle: baseDoc.title || 'Base Document',
      documentBTitle: targetDoc.title || 'Target Document',
      comparedAt: new Date().toISOString(),
      summary: {
        totalClauses: total,
        added: canonicalClauses.filter(c => c.status === 'added').length,
        removed: canonicalClauses.filter(c => c.status === 'removed').length,
        modified: canonicalClauses.filter(c => c.status === 'modified').length,
        unchanged: canonicalClauses.filter(c => c.status === 'unchanged').length,
      },
      clauses: canonicalClauses,
      unresolvedQuestions: conflicting > 0 ? ['Whether counterparty provided statutory justification for deductions.'] : [],
      processingMode: (baseDoc.status === 'verified' && targetDoc.status === 'verified') ? 'VERIFIED_DOCUMENT_MODE' : 'PASTED_TEXT_MODE',
      isDemo: false
    };

    return {
      matterId,
      baseDocumentTitle: baseDoc.title,
      targetDocumentTitle: targetDoc.title,
      comparisonType,
      overallAlignmentScore: overallScore,
      totalClausesCompared: total,
      conflictingClausesCount: conflicting,
      unilateralVariationsCount: variations,
      executiveSummary,
      clauseComparisons: comparisons,
      recommendedStrategy:
        conflicting > 0
          ? 'Dispatch formal demand letter citing exact base agreement clauses to refute unilateral variations before counterparty claims solidify.'
          : 'Proceed with structured resolution roadmap based on agreed contractual timelines.',
      statutoryProtectionsApplied: Array.from(new Set(statutoryProtections)),
      canonicalComparison
    };
  }
}
