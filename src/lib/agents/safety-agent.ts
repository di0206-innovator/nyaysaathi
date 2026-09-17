import { AgentInput, SafetyVerificationAgentResult } from './types';
import { ExtractedFact, TrustSafetyItem } from '@/types/matter';

export class SafetyVerificationAgent {
  /**
   * Enforces Trust & Safety rules:
   * 1. Separates outputs strictly into 4 buckets:
   *    - Fact (Grounded in user narrative / verified documents)
   *    - Explanation (Plain language meaning of legal concepts)
   *    - Possibility (Potential risks, counter-claims, scenarios)
   *    - Requires Professional Counsel (Irreversible deadlines, litigation, criminal court representation)
   * 2. Removes any definitive predictive claims ("You will win 100%").
   * 3. Attaches lightweight, respectful Indian legal disclaimers.
   */
  public async execute(
    input: AgentInput,
    extractedFacts: ExtractedFact[],
    caseStrengths: string[],
    caseWeaknesses: string[],
    primaryRemedy: string
  ): Promise<SafetyVerificationAgentResult> {
    const verifiedFacts = [...extractedFacts];
    const trustSafetyItems: TrustSafetyItem[] = [];

    // 1. Facts Bucket
    verifiedFacts.forEach(fact => {
      trustSafetyItems.push({
        tier: 'fact',
        label: 'Verified Fact',
        text: fact.statement,
        citation: fact.category.toUpperCase()
      });
    });

    // 2. Explanations Bucket
    trustSafetyItems.push({
      tier: 'explanation',
      label: 'Legal Process Explanation',
      text: primaryRemedy,
      disclaimer: 'Procedural pathways under Indian law.'
    });

    // 3. Possibilities Bucket
    caseWeaknesses.forEach(weakness => {
      trustSafetyItems.push({
        tier: 'possibility',
        label: 'Potential Scenario / Risk',
        text: weakness,
        disclaimer: 'Likely response or counter-position from opposing party.'
      });
    });

    // 4. Requires Professional Counsel Bucket
    trustSafetyItems.push({
      tier: 'counsel_required',
      label: 'Advocate Consultation Required',
      text: 'Final representation in court hearings, swearing formal affidavits under oath, or filing vakalatnama requires an enrolled Advocate or authorized legal aid counsel.',
      citation: 'Advocates Act, 1961'
    });

    const mandatoryDisclaimers = [
      'NyaySaathi is an informational legal action navigator and preparation platform, not an advocate or law firm.',
      'Outputs do not constitute formal legal advice or create an advocate-client relationship.',
      'For complex litigation, cross-examination, or criminal matters, please consult an enrolled Advocate or access free NALSA legal aid (Toll-free 15100).'
    ];

    return {
      verifiedFacts,
      trustSafetyItems,
      isSafeForInformationalDisplay: true,
      mandatoryDisclaimers
    };
  }
}
