import { AgentInput, ActionPlannerAgentResult, AgentMemoryEnvelope, SourceReference } from './types';
import { ActionStep } from '@/types/matter';

export class ActionPlannerAgent {
  public async execute(
    input: AgentInput,
    riskIds: string[] = []
  ): Promise<AgentMemoryEnvelope<ActionPlannerAgentResult>> {
    const sourceReferences: SourceReference[] = [];
    const assumptions: string[] = [];
    const unresolvedQuestions: string[] = [];
    const actionPlan: ActionStep[] = [];

    switch (input.category) {
      case 'tenancy_housing':
        actionPlan.push(
          {
            id: 'act-tenancy-evidence',
            title: 'Export & Backup All Communications',
            phase: 'immediate_48h',
            description: 'Export complete WhatsApp chat backup (.txt + media) with landlord/broker and preserve all UPI/bank debit statements.',
            estimatedTurnaround: '30 mins',
            status: 'pending',
            priority: 'must_do',
            groundingRefIds: riskIds
          },
          {
            id: 'act-tenancy-soft-request',
            title: 'Send Soft Settlement Request via WhatsApp / Email',
            phase: 'immediate_48h',
            description: 'Send a polite, structured settlement reminder giving 5-7 days for mutual deposit reconciliation.',
            estimatedTurnaround: '15 mins',
            status: 'pending',
            priority: 'must_do',
            associatedDraftType: 'soft_request',
            groundingRefIds: riskIds
          },
          {
            id: 'act-tenancy-formal-demand',
            title: 'Issue Formal Deposit Demand Letter with Account Details',
            phase: 'short_term_14d',
            description: 'If soft request is unacknowledged, send structured formal demand giving 10 days before initiating legal proceedings.',
            estimatedTurnaround: '1 hour',
            status: 'pending',
            priority: 'must_do',
            associatedDraftType: 'formal_demand',
            groundingRefIds: riskIds
          },
          {
            id: 'act-tenancy-legal-notice',
            title: 'Serve Registered Speed Post Legal Notice (RPAD)',
            phase: 'short_term_14d',
            description: 'Serve statutory legal notice calling upon landlord to refund deposit with 12% interest within 15 days.',
            estimatedTurnaround: '2-3 days',
            status: 'pending',
            priority: 'recommended',
            associatedDraftType: 'legal_notice',
            groundingRefIds: riskIds
          },
          {
            id: 'act-tenancy-dlsa-mediation',
            title: 'Escalate to DLSA Free Pre-Litigation Mediation',
            phase: 'formal_escalation',
            description: 'File free mediation application before the District Legal Services Authority at the District Court Complex.',
            estimatedTurnaround: '2-3 weeks',
            status: 'pending',
            priority: 'recommended',
            groundingRefIds: riskIds
          }
        );
        break;

      case 'consumer_dispute':
        actionPlan.push(
          {
            id: 'act-cpa-docs',
            title: 'Preserve Invoice, Warranty Card & Service Job Sheet',
            phase: 'immediate_48h',
            description: 'Collate digital and physical copies of purchase invoice, warranty certificate, and service denial emails.',
            estimatedTurnaround: '20 mins',
            status: 'pending',
            priority: 'must_do',
            groundingRefIds: riskIds
          },
          {
            id: 'act-cpa-soft-request',
            title: 'Send Polite Brand Escalation Email / WhatsApp',
            phase: 'immediate_48h',
            description: 'Submit structured escalation to brand customer care nodal officer citing job sheet number.',
            estimatedTurnaround: '20 mins',
            status: 'pending',
            priority: 'must_do',
            associatedDraftType: 'soft_request',
            groundingRefIds: riskIds
          },
          {
            id: 'act-cpa-nch-docket',
            title: 'Register Docket on National Consumer Helpline (NCH - 1915)',
            phase: 'immediate_48h',
            description: 'Lodge free grievance on consumerhelpline.gov.in or via WhatsApp/Call to 1915 for conciliation.',
            estimatedTurnaround: '15 mins',
            status: 'pending',
            priority: 'must_do',
            groundingRefIds: riskIds
          },
          {
            id: 'act-cpa-formal-demand',
            title: 'Serve Formal Demand & Notice of Deficiency',
            phase: 'short_term_14d',
            description: 'Serve 15-day notice under CPA 2019 demanding replacement or refund with damages.',
            estimatedTurnaround: '1 hour',
            status: 'pending',
            priority: 'must_do',
            associatedDraftType: 'formal_demand',
            groundingRefIds: riskIds
          },
          {
            id: 'act-cpa-edaakhil-complaint',
            title: 'File e-Daakhil Online Consumer Complaint',
            phase: 'formal_escalation',
            description: 'File Section 35 consumer complaint online at edaakhil.nic.in without physical court attendance or advocate mandate.',
            estimatedTurnaround: '1-2 days',
            status: 'pending',
            priority: 'recommended',
            associatedDraftType: 'consumer_complaint',
            groundingRefIds: riskIds
          }
        );
        break;

      default:
        actionPlan.push(
          {
            id: 'act-gen-audit',
            title: 'Audit & Secure Documentary Proof',
            phase: 'immediate_48h',
            description: 'Collect all relevant agreements, payment slips, emails, and phone logs into a secure digital dossier.',
            estimatedTurnaround: '45 mins',
            status: 'pending',
            priority: 'must_do',
            groundingRefIds: riskIds
          },
          {
            id: 'act-gen-soft',
            title: 'Send Amicable Settlement Communication',
            phase: 'immediate_48h',
            description: 'Reach out in writing stating factual position and inviting prompt amicable resolution.',
            estimatedTurnaround: '30 mins',
            status: 'pending',
            priority: 'must_do',
            associatedDraftType: 'soft_request',
            groundingRefIds: riskIds
          },
          {
            id: 'act-gen-formal',
            title: 'Serve Formal Written Demand',
            phase: 'short_term_14d',
            description: 'Serve structured demand specifying the exact relief sought and a clear 15-day cure timeline.',
            estimatedTurnaround: '1 hour',
            status: 'pending',
            priority: 'must_do',
            associatedDraftType: 'formal_demand',
            groundingRefIds: riskIds
          },
          {
            id: 'act-gen-dlsa',
            title: 'Consult DLSA Legal Aid or Legal Counsel',
            phase: 'formal_escalation',
            description: 'Schedule consultation with an advocate or access free NALSA/DLSA legal aid services.',
            estimatedTurnaround: '3-5 days',
            status: 'pending',
            priority: 'recommended',
            groundingRefIds: riskIds
          }
        );
        break;
    }

    actionPlan.forEach(act => {
      sourceReferences.push({
        id: act.id,
        type: 'claim',
        label: `${act.title} (${act.phase})`
      });
    });

    return {
      result: {
        actionPlan
      },
      confidenceScore: 0.94,
      sourceReferences,
      assumptions,
      unresolvedQuestions,
      safetyFlags: []
    };
  }
}
