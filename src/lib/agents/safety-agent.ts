import { AgentInput, SafetyVerificationAgentResult, AgentMemoryEnvelope, SourceReference } from './types';
import { ExtractedFact, TrustSafetyItem } from '@/types/matter';
import { ClaimSupportChecker } from '@/lib/reasoning/claim-support-checker';

export class SafetyVerificationAgent {
  public async execute(
    input: AgentInput,
    extractedFacts: ExtractedFact[],
    caseStrengths: string[],
    caseWeaknesses: string[],
    primaryRemedy: string,
    evidenceDocIds: string[] = []
  ): Promise<AgentMemoryEnvelope<SafetyVerificationAgentResult>> {
    const sourceReferences: SourceReference[] = [];
    const assumptions: string[] = [];
    const unresolvedQuestions: string[] = [];
    const auditLog: SafetyVerificationAgentResult['auditLog'] = [];

    const verifiedFacts = [...extractedFacts];
    const trustSafetyItems: TrustSafetyItem[] = [];

    // 1. Audit and classify Facts
    verifiedFacts.forEach(fact => {
      const audit = ClaimSupportChecker.auditStatement(
        fact.statement,
        fact.sourceDocId ? [fact.sourceDocId] : evidenceDocIds,
        [fact.id]
      );

      auditLog.push({
        statement: fact.statement,
        revisedText: audit.revisedText,
        tier: audit.tier,
        wasRewritten: audit.wasRewritten
      });

      trustSafetyItems.push({
        tier: audit.tier,
        label: audit.tier === 'fact' ? 'Verified Fact' : 'Reported Fact',
        text: audit.revisedText,
        citation: fact.category.toUpperCase(),
        confidenceScore: audit.confidenceScore,
        groundingRefIds: audit.groundingRefIds
      });
    });

    // 2. Audit and classify Explanations
    const remedyAudit = ClaimSupportChecker.auditStatement(
      primaryRemedy,
      evidenceDocIds,
      verifiedFacts.map(f => f.id),
      ['statute-applicable']
    );

    auditLog.push({
      statement: primaryRemedy,
      revisedText: remedyAudit.revisedText,
      tier: 'explanation',
      wasRewritten: remedyAudit.wasRewritten
    });

    trustSafetyItems.push({
      tier: 'explanation',
      label: 'Legal Process Explanation',
      text: remedyAudit.revisedText,
      disclaimer: 'Procedural pathways under Indian law.',
      confidenceScore: remedyAudit.confidenceScore,
      groundingRefIds: remedyAudit.groundingRefIds
    });

    // 3. Audit and classify Possibilities / Counter-Arguments
    caseWeaknesses.forEach(weakness => {
      const weakAudit = ClaimSupportChecker.auditStatement(weakness, [], verifiedFacts.map(f => f.id));

      auditLog.push({
        statement: weakness,
        revisedText: weakAudit.revisedText,
        tier: 'possibility',
        wasRewritten: weakAudit.wasRewritten
      });

      trustSafetyItems.push({
        tier: 'possibility',
        label: 'Potential Scenario / Risk',
        text: weakAudit.revisedText,
        disclaimer: 'Likely response or counter-position from opposing party.',
        confidenceScore: 0.65,
        groundingRefIds: ['narrative-user']
      });
    });

    // 4. Counsel Required Item
    trustSafetyItems.push({
      tier: 'counsel_required',
      label: 'Advocate Consultation Required',
      text: 'Final representation in court hearings, swearing formal affidavits under oath, or filing vakalatnama requires an enrolled Advocate or authorized legal aid counsel.',
      citation: 'Advocates Act, 1961',
      confidenceScore: 0.98,
      groundingRefIds: ['statute-advocates-act']
    });

    const mandatoryDisclaimers = [
      'NyaySaathi is an informational legal action navigator and preparation platform, not an advocate or law firm.',
      'Outputs do not constitute formal legal advice or create an advocate-client relationship.',
      'For complex litigation, cross-examination, or criminal matters, please consult an enrolled Advocate or access free NALSA legal aid (Toll-free 15100).'
    ];

    const result: SafetyVerificationAgentResult = {
      verifiedFacts,
      trustSafetyItems,
      isSafeForInformationalDisplay: true,
      mandatoryDisclaimers,
      auditLog
    };

    return {
      result,
      confidenceScore: 0.98,
      sourceReferences,
      assumptions,
      unresolvedQuestions,
      safetyFlags: []
    };
  }
}
