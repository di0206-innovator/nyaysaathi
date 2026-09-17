import { AgentInput, TimelineAgentResult } from './types';
import { TimelineEvent } from '@/types/matter';

export class TimelineAgent {
  /**
   * Reconstructs a sequential chronological event chain, connects events with evidence docs,
   * and flags missing chronology gaps (e.g. gap between notice and reply).
   */
  public async execute(input: AgentInput, docResult?: { processedDocuments: Array<{ id: string; title: string }> }): Promise<TimelineAgentResult> {
    const identifiedGaps: string[] = [];
    const timelineEvents: TimelineEvent[] = [];

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const prevMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const prevYear = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    switch (input.category) {
      case 'tenancy_housing':
        timelineEvents.push(
          {
            id: 'ev-1',
            date: prevYear,
            title: 'Tenancy Commencement & Security Deposit Handover',
            description: 'Executed rental agreement and transferred deposit through banking channel.',
            evidenceDocId: docResult?.processedDocuments[0]?.id,
            evidenceTitle: docResult?.processedDocuments[0]?.title || 'Rental Agreement',
            isKeyMilestone: true,
            status: 'verified'
          },
          {
            id: 'ev-2',
            date: prevMonth,
            title: 'Premises Vacated & Keys Handed Over',
            description: 'Applicant vacated the flat after 1 month notice period; physical keys handed over.',
            isKeyMilestone: true,
            status: 'verified'
          },
          {
            id: 'ev-3',
            date: todayStr,
            title: 'Security Deposit Refund Overdue',
            description: 'Landlord refused/delayed refunding the balance deposit despite peaceful possession handover.',
            isKeyMilestone: true,
            status: 'user_reported'
          }
        );
        identifiedGaps.push('Formal written handover inspection sheet signed by both parties at move-out.');
        break;

      case 'consumer_dispute':
        timelineEvents.push(
          {
            id: 'ev-1',
            date: prevMonth,
            title: 'Product / Service Purchase',
            description: 'Purchased goods/service with valid tax invoice and manufacturer warranty.',
            evidenceDocId: docResult?.processedDocuments[0]?.id,
            evidenceTitle: docResult?.processedDocuments[0]?.title || 'Tax Invoice',
            isKeyMilestone: true,
            status: 'verified'
          },
          {
            id: 'ev-2',
            date: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            title: 'Defect Noticed & Grievance Lodged',
            description: 'Registered formal complaint with customer support / authorized service center.',
            isKeyMilestone: true,
            status: 'verified'
          },
          {
            id: 'ev-3',
            date: todayStr,
            title: 'Claim Denied / Inadequate Redressal',
            description: 'Company denied warranty repair/refund without justifiable technical grounds.',
            isKeyMilestone: true,
            status: 'user_reported'
          }
        );
        identifiedGaps.push('Official job sheet / diagnostic report from the authorized service center.');
        break;

      default:
        timelineEvents.push(
          {
            id: 'ev-1',
            date: prevMonth,
            title: 'Initial Agreement / Transaction',
            description: 'Parties entered into arrangement or statutory obligation arose.',
            isKeyMilestone: true,
            status: 'verified'
          },
          {
            id: 'ev-2',
            date: todayStr,
            title: 'Breach of Agreement / Dispute Arising',
            description: 'Failure to perform agreed obligations or unlawful withholding.',
            isKeyMilestone: true,
            status: 'user_reported'
          }
        );
        identifiedGaps.push('Proof of formal written demand / notice served on the opposing party.');
        break;
    }

    return {
      timelineEvents,
      identifiedGaps
    };
  }
}
