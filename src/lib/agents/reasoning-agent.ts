import { AgentInput, ReasoningAgentResult, AgentMemoryEnvelope, SourceReference } from './types';

export class ReasoningAgent {
  public async execute(
    input: AgentInput,
    extractedFacts: Array<{ id: string; statement: string }>,
    statutes: Array<{ statute: string; section: string }>
  ): Promise<AgentMemoryEnvelope<ReasoningAgentResult>> {
    const sourceReferences: SourceReference[] = [];
    const assumptions: string[] = [];
    const unresolvedQuestions: string[] = [];
    const caseStrengths: string[] = [];
    const caseWeaknesses: string[] = [];
    let primaryLegalRemedy = '';
    let counterPartyProbableDefense = '';

    extractedFacts.forEach(f => {
      sourceReferences.push({
        id: f.id,
        type: 'fact',
        label: f.statement
      });
    });

    statutes.forEach((s, idx) => {
      sourceReferences.push({
        id: `statute-ref-${idx + 1}`,
        type: 'statute',
        label: `${s.statute} (${s.section})`
      });
    });

    switch (input.category) {
      case 'tenancy_housing':
        caseStrengths.push(
          'Written agreement stipulates security deposit terms and return conditions.',
          'Bank transaction records confirm full payment of initial deposit amount.',
          'Vacant peaceful possession was handed over with written/chat notice.'
        );
        caseWeaknesses.push(
          'Absence of joint move-out inspection protocol signed at key handover.',
          'Possible dispute over reasonable wear and tear vs actual damage deductions.'
        );
        primaryLegalRemedy = 'Issue a polite request followed by a formal 15-day Demand Notice seeking deposit return with 12% interest, followed by DLSA pre-litigation mediation or Small Causes Court filing.';
        counterPartyProbableDefense = 'Opposing party may claim undocumented property damage, repainting overheads, or forfeiture due to notice period dispute.';
        break;

      case 'consumer_dispute':
        caseStrengths.push(
          'Valid tax invoice proves consumer status under Section 2(7) of Consumer Protection Act 2019.',
          'Issue occurred within manufacturer warranty period.',
          'Written service rejection emails establish deficiency in service.'
        );
        caseWeaknesses.push(
          'Manufacturer may argue physical/liquid damage or unapproved third-party tampering.'
        );
        primaryLegalRemedy = 'Lodge National Consumer Helpline (1915) docket, followed by an online e-Daakhil consumer complaint before the District Commission under Section 35 CPA 2019.';
        counterPartyProbableDefense = 'Merchant / OEM may contend user induced defect or breach of warranty clause.';
        break;

      case 'property_rera':
        caseStrengths.push(
          'Allotment agreement contains definitive completion & handover date.',
          'Payment milestones fully honored by allottee with receipt records.'
        );
        caseWeaknesses.push(
          'Builder may plead Force Majeure (pandemic/labor shortage) or NGT construction bans.'
        );
        primaryLegalRemedy = 'File Form M complaint before State RERA under Section 18 for monthly delay interest at SBI MCLR+2% or full refund of paid capital with interest.';
        counterPartyProbableDefense = 'Builder will invoke Force Majeure and regulatory approval delays beyond their reasonable control.';
        break;

      default:
        caseStrengths.push(
          'Clear factual chain of events supported by contemporaneously recorded messages and receipts.',
          'Clear proof of unilateral failure by the opposing party.'
        );
        caseWeaknesses.push(
          'Need to establish strict documentary proof of financial loss incurred.'
        );
        primaryLegalRemedy = 'Formal written demand giving 15-day cure window prior to initiating DLSA mediation or civil recovery proceedings.';
        counterPartyProbableDefense = 'Denial of liability or attribution of delay to external factors.';
        break;
    }

    const netStrength = caseStrengths.length / (caseStrengths.length + caseWeaknesses.length || 1);
    const confidenceScore = Math.min(0.95, Math.max(0.2, Math.round((0.4 + netStrength * 0.5) * 100) / 100));
    const evidenceState = caseWeaknesses.length > caseStrengths.length ? 'partially_supported' : 'supported';

    return {
      result: {
        caseStrengths,
        caseWeaknesses,
        primaryLegalRemedy,
        counterPartyProbableDefense
      },
      confidenceScore,
      evidenceState,
      sourceReferences,
      assumptions,
      unresolvedQuestions,
      safetyFlags: []
    };
  }
}
