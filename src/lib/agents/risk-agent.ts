import { AgentInput, RiskAgentResult, AgentMemoryEnvelope, SourceReference } from './types';
import { RiskItem, MissingInformation } from '@/types/matter';

export class RiskAgent {
  public async execute(
    input: AgentInput,
    extractedFacts: Array<{ id: string; statement: string }>
  ): Promise<AgentMemoryEnvelope<RiskAgentResult>> {
    const sourceReferences: SourceReference[] = [];
    const assumptions: string[] = [];
    const unresolvedQuestions: string[] = [];
    const risks: RiskItem[] = [];
    const missingInformation: MissingInformation[] = [];

    const factIds = extractedFacts.map(f => f.id);

    switch (input.category) {
      case 'tenancy_housing':
        risks.push({
          id: 'risk-tenancy-deduction',
          title: 'Unitemized Deduction Risk',
          severity: 'high',
          description: 'If you delay issuing a formal written protest against deposit deductions, the landlord may claim tacit acceptance of charges.',
          limitationPeriodInfo: {
            statute: 'Indian Limitation Act, 1963 (Article 22/55)',
            deadlineMonths: 36,
            daysRemaining: 1020
          },
          mitigatingAction: 'Issue a formal written Demand Letter disputing any deduction without original GST repair invoices within 7 days.',
          legalContext: 'Courts hold that landlords cannot arbitrarily deduct arbitrary amounts for ordinary wear and tear without authentic contractor bills.',
          groundingRefIds: factIds.length > 0 ? factIds : ['narrative-user']
        });
        risks.push({
          id: 'risk-tenancy-inspection',
          title: 'Absence of Move-Out Inspection Signoff',
          severity: 'medium',
          description: 'Without a joint exit inspection sheet, opposing party could allege damage occurred during tenancy.',
          mitigatingAction: 'Compile timestamped move-out photos, video walkthroughs, and WhatsApp handover messages.',
          legalContext: 'Electronic evidence under Bharatiya Sakshya Adhiniyam, 2023 (BSA Section 61/63) is admissible with proper metadata.',
          groundingRefIds: factIds.length > 0 ? factIds : ['narrative-user']
        });

        missingInformation.push(
          {
            id: 'miss-moveout-media',
            question: 'Did you take photos or video of the property condition on the day you vacated?',
            whyItMatters: 'Essential to disprove false claims of wall damage or deep cleaning requirements.',
            impactOnOutcome: 'critical',
            suggestedSource: 'Phone camera gallery or WhatsApp chat history with landlord/broker.',
            isAnswered: false,
            groundingRefIds: ['risk-tenancy-inspection']
          },
          {
            id: 'miss-payment-channel',
            question: 'Was the security deposit paid via bank transfer/UPI or cash?',
            whyItMatters: 'Bank statements provide unquestionable proof of payment, eliminating burden of proof disputes.',
            impactOnOutcome: 'critical',
            suggestedSource: 'Bank statement or UPI transaction receipt showing reference number.',
            isAnswered: true,
            answer: 'Paid via direct NEFT/UPI bank transfer.',
            groundingRefIds: factIds
          }
        );
        break;

      case 'consumer_dispute':
        risks.push({
          id: 'risk-cpa-limitation',
          title: '2-Year Statutory Limitation Period (Section 69 CPA 2019)',
          severity: 'high',
          description: 'Consumer complaints must be filed within exactly 2 years from the date the cause of action (defect/denial) arose.',
          limitationPeriodInfo: {
            statute: 'Consumer Protection Act, 2019 (Section 69)',
            deadlineMonths: 24,
            daysRemaining: 680
          },
          mitigatingAction: 'Lodge formal e-Daakhil complaint or National Consumer Helpline (1915) docket immediately.',
          legalContext: 'Delays beyond 2 years require formal Section 69(2) Condonation of Delay application showing sufficient cause.',
          groundingRefIds: factIds.length > 0 ? factIds : ['narrative-user']
        });
        risks.push({
          id: 'risk-cpa-tampering',
          title: 'Product Tampering / Unauthorized Service Defense',
          severity: 'medium',
          description: 'Brands routinely attempt to void warranty by alleging third-party opening or non-standard usage.',
          mitigatingAction: 'Ensure you possess official service center job sheet recording product intake state.',
          legalContext: 'Under CPA 2019, burden of proving customer-induced damage rests on the manufacturer once warranty is proven.',
          groundingRefIds: factIds.length > 0 ? factIds : ['narrative-user']
        });

        missingInformation.push(
          {
            id: 'miss-job-sheet',
            question: 'Do you have the official Job Sheet / Incident Ticket Number from the authorized service center?',
            whyItMatters: 'Serves as formal proof that defect was reported within warranty period and company inspected device.',
            impactOnOutcome: 'critical',
            suggestedSource: 'Email confirmation from service center or physical job card slip.',
            isAnswered: false,
            groundingRefIds: ['risk-cpa-tampering']
          }
        );
        break;

      default:
        risks.push({
          id: 'risk-gen-limitation',
          title: 'Limitation Bar for Monetary Claims (3 Years)',
          severity: 'high',
          description: 'Under Indian Limitation Act 1963, civil recovery claims must be instituted within 3 years from the date payment fell due.',
          limitationPeriodInfo: {
            statute: 'Indian Limitation Act, 1963 (Schedule Article 113)',
            deadlineMonths: 36,
            daysRemaining: 1050
          },
          mitigatingAction: 'Dispatch formal legal demand notice to pause or establish clear cause of action.',
          legalContext: 'A written acknowledgement of debt resets the 3-year limitation clock under Section 18 of the Limitation Act.',
          groundingRefIds: factIds.length > 0 ? factIds : ['narrative-user']
        });
        break;
    }

    risks.forEach(r => {
      sourceReferences.push({
        id: r.id,
        type: 'fact',
        label: `${r.title} (Severity: ${r.severity})`
      });
    });

    const criticalCount = risks.filter(r => r.severity === 'critical').length;
    const highCount = risks.filter(r => r.severity === 'high').length;
    const confidenceScore = Math.max(0.2, Math.min(0.95, Math.round((0.9 - criticalCount * 0.25 - highCount * 0.1) * 100) / 100));
    const evidenceState = criticalCount > 0 ? 'counsel_required' : (missingInformation.length > 2 ? 'partially_supported' : 'supported');

    return {
      result: {
        risks,
        missingInformation
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
