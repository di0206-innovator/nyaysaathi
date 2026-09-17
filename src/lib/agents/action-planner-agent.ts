import { AgentInput, ActionPlannerAgentResult } from './types';
import { ActionStep } from '@/types/matter';

export class ActionPlannerAgent {
  /**
   * Generates prioritized, time-phased actionable roadmap:
   * Phase 1: Immediate (0-48 Hours) - Documentation & Preserving Proof
   * Phase 2: Short Term (1-14 Days) - Formal Written Demand / Notice
   * Phase 3: Formal Escalation - Government Portals / Legal Aid / Consumer Forum / Court
   */
  public async execute(input: AgentInput): Promise<ActionPlannerAgentResult> {
    const actionPlan: ActionStep[] = [];

    switch (input.category) {
      case 'tenancy_housing':
        actionPlan.push(
          {
            id: 'act-1',
            title: 'Export & Backup All Communications',
            phase: 'immediate_48h',
            description: 'Export complete WhatsApp chat backup (.txt + media) with landlord/broker and preserve all UPI/bank debit statements.',
            estimatedTurnaround: '30 mins',
            status: 'completed',
            priority: 'must_do'
          },
          {
            id: 'act-2',
            title: 'Generate & Send Formal Deposit Demand Letter',
            phase: 'immediate_48h',
            description: 'Issue structured demand letter giving 7-10 days to refund security deposit or provide GST invoices for itemized deductions.',
            estimatedTurnaround: '1 hour',
            status: 'pending',
            priority: 'must_do',
            associatedDraftType: 'landlord_demand_letter'
          },
          {
            id: 'act-3',
            title: 'Serve Formal Advocate Legal Notice',
            phase: 'short_term_14d',
            description: 'If response is unsatisfactory, send registered Speed Post Legal Notice with acknowledgment due (RPAD).',
            estimatedTurnaround: '2-3 days',
            status: 'pending',
            priority: 'must_do',
            associatedDraftType: 'legal_notice'
          },
          {
            id: 'act-4',
            title: 'Escalate to Rent Court / DLSA Legal Aid Lok Adalat',
            phase: 'formal_escalation',
            description: 'File recovery petition before Rent Tribunal / Small Causes Court or apply for free DLSA pre-litigation mediation.',
            estimatedTurnaround: '2-4 weeks',
            status: 'pending',
            priority: 'recommended'
          }
        );
        break;

      case 'consumer_dispute':
        actionPlan.push(
          {
            id: 'act-1',
            title: 'Preserve Invoice, Warranty Card & Service Job Sheet',
            phase: 'immediate_48h',
            description: 'Collate digital and physical copies of purchase invoice, warranty certificate, and service denial emails.',
            estimatedTurnaround: '20 mins',
            status: 'completed',
            priority: 'must_do'
          },
          {
            id: 'act-2',
            title: 'Register Docket on National Consumer Helpline (NCH - 1915)',
            phase: 'immediate_48h',
            description: 'Lodge free grievance on consumerhelpline.gov.in or via WhatsApp/Call to 1915 for conciliation.',
            estimatedTurnaround: '15 mins',
            status: 'in_progress',
            priority: 'must_do'
          },
          {
            id: 'act-3',
            title: 'Issue Formal Legal Notice to Brand & Retailer',
            phase: 'short_term_14d',
            description: 'Serve formal notice calling upon the company to replace product or refund consideration with damages within 15 days.',
            estimatedTurnaround: '1 hour',
            status: 'pending',
            priority: 'must_do',
            associatedDraftType: 'legal_notice'
          },
          {
            id: 'act-4',
            title: 'File e-Daakhil Online Consumer Complaint',
            phase: 'formal_escalation',
            description: 'File Section 35 consumer complaint online at edaakhil.nic.in without physical court attendance or advocate mandate.',
            estimatedTurnaround: '1-2 days',
            status: 'pending',
            priority: 'recommended',
            associatedDraftType: 'consumer_complaint'
          }
        );
        break;

      default:
        actionPlan.push(
          {
            id: 'act-1',
            title: 'Audit & Secure Documentary Proof',
            phase: 'immediate_48h',
            description: 'Collect all relevant agreements, payment slips, emails, and phone logs into a secure digital dossier.',
            estimatedTurnaround: '45 mins',
            status: 'completed',
            priority: 'must_do'
          },
          {
            id: 'act-2',
            title: 'Send Formal Written Notice of Dispute',
            phase: 'short_term_14d',
            description: 'Serve structured demand specifying the exact relief sought and a clear 15-day cure timeline.',
            estimatedTurnaround: '1 hour',
            status: 'pending',
            priority: 'must_do',
            associatedDraftType: 'legal_notice'
          },
          {
            id: 'act-3',
            title: 'Consult DLSA Legal Aid or Legal Counsel',
            phase: 'formal_escalation',
            description: 'Schedule consultation with an advocate or access free NALSA/DLSA legal aid services.',
            estimatedTurnaround: '3-5 days',
            status: 'pending',
            priority: 'recommended'
          }
        );
        break;
    }

    return {
      actionPlan
    };
  }
}
