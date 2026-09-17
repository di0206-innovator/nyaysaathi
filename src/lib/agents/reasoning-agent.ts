import { AgentInput, ReasoningAgentResult } from './types';

export class ReasoningAgent {
  /**
   * Synthesizes the legal position, evaluating the strongest points in favor of the user,
   * procedural vulnerabilities, and anticipated defense arguments of the opposing party.
   */
  public async execute(input: AgentInput): Promise<ReasoningAgentResult> {
    const caseStrengths: string[] = [];
    const caseWeaknesses: string[] = [];
    let primaryLegalRemedy = '';
    let counterPartyProbableDefense = '';

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
        primaryLegalRemedy = 'Issue statutory Demand Notice under Contract Law / Rent Control seeking deposit return with 12% interest within 15 days, followed by Small Causes Court or Rent Court filing.';
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
        primaryLegalRemedy = 'File direct e-Daakhil consumer complaint before District Commission seeking full refund, replacement, plus compensation for mental agony under CPA 2019 Section 35.';
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
        primaryLegalRemedy = 'Formal Legal Demand Notice giving 15-day cure window prior to initiating civil recovery proceedings.';
        counterPartyProbableDefense = 'Denial of liability or attribution of delay to external factors.';
        break;
    }

    return {
      caseStrengths,
      caseWeaknesses,
      primaryLegalRemedy,
      counterPartyProbableDefense
    };
  }
}
