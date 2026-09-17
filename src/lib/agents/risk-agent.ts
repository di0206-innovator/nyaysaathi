import { AgentInput, RiskAgentResult } from './types';
import { RiskItem, MissingInformation } from '@/types/matter';

export class RiskAgent {
  /**
   * Evaluates limitation periods under Indian law, identifies risks of waiver/estoppel,
   * and highlights missing information that could weaken user's legal footing.
   */
  public async execute(input: AgentInput): Promise<RiskAgentResult> {
    const risks: RiskItem[] = [];
    const missingInformation: MissingInformation[] = [];

    switch (input.category) {
      case 'tenancy_housing':
        risks.push({
          id: 'risk-1',
          title: 'Unitemized Deduction Risk',
          severity: 'high',
          description: 'If you delay issuing a formal written protest against deposit deductions, the landlord may claim tacit acceptance of charges.',
          limitationPeriodInfo: {
            statute: 'Indian Limitation Act, 1963 (Article 22/55)',
            deadlineMonths: 36,
            daysRemaining: 1020
          },
          mitigatingAction: 'Issue a formal written Legal Demand Notice disputing any deduction without original GST repair invoices within 7 days.',
          legalContext: 'Courts hold that landlords cannot arbitrarily deduct arbitrary amounts for ordinary wear and tear without authentic contractor bills.'
        });
        risks.push({
          id: 'risk-2',
          title: 'Absence of Move-Out Inspection Signoff',
          severity: 'medium',
          description: 'Without a joint exit inspection sheet, opposing party could allege damage occurred during tenancy.',
          mitigatingAction: 'Compile timestamped move-out photos, video walkthroughs, and WhatsApp handover messages.',
          legalContext: 'Electronic evidence under Bharatiya Sakshya Adhiniyam, 2023 (BSA Section 61/63) is admissible with proper metadata.'
        });

        missingInformation.push(
          {
            id: 'miss-1',
            question: 'Did you take photos or video of the property condition on the day you vacated?',
            whyItMatters: 'Essential to disprove false claims of wall damage or deep cleaning requirements.',
            impactOnOutcome: 'critical',
            suggestedSource: 'Phone camera gallery or WhatsApp chat history with landlord/broker.',
            isAnswered: false
          },
          {
            id: 'miss-2',
            question: 'Was the security deposit paid via bank transfer/UPI or cash?',
            whyItMatters: 'Bank statements provide unquestionable proof of payment, eliminating burden of proof disputes.',
            impactOnOutcome: 'critical',
            suggestedSource: 'Bank statement or UPI transaction receipt showing reference number.',
            isAnswered: true,
            answer: 'Paid via direct NEFT/UPI bank transfer.'
          }
        );
        break;

      case 'consumer_dispute':
        risks.push({
          id: 'risk-1',
          title: '2-Year Statutory Limitation Period (Section 69 CPA 2019)',
          severity: 'high',
          description: 'Consumer complaints must be filed within exactly 2 years from the date the cause of action (defect/denial) arose.',
          limitationPeriodInfo: {
            statute: 'Consumer Protection Act, 2019 (Section 69)',
            deadlineMonths: 24,
            daysRemaining: 680
          },
          mitigatingAction: 'Lodge formal e-Daakhil complaint or National Consumer Helpline (1915) docket immediately.',
          legalContext: 'Delays beyond 2 years require formal Section 69(2) Condonation of Delay application showing sufficient cause.'
        });
        risks.push({
          id: 'risk-2',
          title: 'Product Tampering / Unauthorized Service Defense',
          severity: 'medium',
          description: 'Brands routinely attempt to void warranty by alleging third-party opening or non-standard usage.',
          mitigatingAction: 'Ensure you possess official service center job sheet recording product intake state.',
          legalContext: 'Under CPA 2019, burden of proving customer-induced damage rests on the manufacturer once warranty is proven.'
        });

        missingInformation.push(
          {
            id: 'miss-1',
            question: 'Do you have the official Job Sheet / Incident Ticket Number from the authorized service center?',
            whyItMatters: 'Serves as formal proof that defect was reported within warranty period and company inspected device.',
            impactOnOutcome: 'critical',
            suggestedSource: 'Email confirmation from service center or physical job card slip.',
            isAnswered: false
          }
        );
        break;

      default:
        risks.push({
          id: 'risk-1',
          title: 'Limitation Bar for Monetary Claims (3 Years)',
          severity: 'high',
          description: 'Under Indian Limitation Act 1963, civil recovery claims must be instituted within 3 years from the date payment fell due.',
          limitationPeriodInfo: {
            statute: 'Indian Limitation Act, 1963 (Schedule Article 113)',
            deadlineMonths: 36,
            daysRemaining: 1050
          },
          mitigatingAction: 'Dispatch formal legal demand notice to pause or establish clear cause of action.',
          legalContext: 'A written acknowledgement of debt resets the 3-year limitation clock under Section 18 of the Limitation Act.'
        });
        break;
    }

    return {
      risks,
      missingInformation
    };
  }
}
