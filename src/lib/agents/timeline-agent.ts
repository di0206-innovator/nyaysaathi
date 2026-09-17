import { AgentInput, TimelineAgentResult, AgentMemoryEnvelope, SourceReference } from './types';
import { TimelineEvent } from '@/types/matter';

export class TimelineAgent {
  public async execute(
    input: AgentInput,
    docResult?: { processedDocuments: Array<{ id: string; title: string }> }
  ): Promise<AgentMemoryEnvelope<TimelineAgentResult>> {
    const sourceReferences: SourceReference[] = [];
    const assumptions: string[] = [];
    const unresolvedQuestions: string[] = [];
    const identifiedGaps: string[] = [];
    const timelineEvents: TimelineEvent[] = [];

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const prevMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const prevYear = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const firstDoc = docResult?.processedDocuments[0];

    switch (input.category) {
      case 'tenancy_housing': {
        const ev1Id = 'ev-tenancy-commence';
        const ev2Id = 'ev-tenancy-vacate';
        const ev3Id = 'ev-tenancy-overdue';

        timelineEvents.push(
          {
            id: ev1Id,
            date: prevYear,
            title: 'Tenancy Commencement & Security Deposit Handover',
            description: 'Executed rental agreement and transferred deposit through banking channel.',
            evidenceDocId: firstDoc?.id,
            evidenceTitle: firstDoc?.title || 'Rental Agreement',
            isKeyMilestone: true,
            status: 'verified',
            groundingRefIds: firstDoc ? [firstDoc.id] : ['narrative-user']
          },
          {
            id: ev2Id,
            date: prevMonth,
            title: 'Premises Vacated & Keys Handed Over',
            description: 'Applicant vacated the flat after 1 month notice period; physical keys handed over.',
            isKeyMilestone: true,
            status: 'verified',
            groundingRefIds: ['narrative-user']
          },
          {
            id: ev3Id,
            date: todayStr,
            title: 'Security Deposit Refund Overdue',
            description: 'Landlord refused/delayed refunding the balance deposit despite peaceful possession handover.',
            isKeyMilestone: true,
            status: 'user_reported',
            groundingRefIds: ['narrative-user']
          }
        );

        identifiedGaps.push('Formal written handover inspection sheet signed by both parties at move-out.');
        unresolvedQuestions.push('Do you have timestamped photos or videos from the move-out date?');
        break;
      }

      case 'consumer_dispute': {
        const ev1Id = 'ev-cpa-purchase';
        const ev2Id = 'ev-cpa-defect';
        const ev3Id = 'ev-cpa-denial';

        timelineEvents.push(
          {
            id: ev1Id,
            date: prevMonth,
            title: 'Product / Service Purchase',
            description: 'Purchased goods/service with valid tax invoice and manufacturer warranty.',
            evidenceDocId: firstDoc?.id,
            evidenceTitle: firstDoc?.title || 'Tax Invoice',
            isKeyMilestone: true,
            status: 'verified',
            groundingRefIds: firstDoc ? [firstDoc.id] : ['narrative-user']
          },
          {
            id: ev2Id,
            date: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            title: 'Defect Noticed & Grievance Lodged',
            description: 'Registered formal complaint with customer support / authorized service center.',
            isKeyMilestone: true,
            status: 'verified',
            groundingRefIds: ['narrative-user']
          },
          {
            id: ev3Id,
            date: todayStr,
            title: 'Claim Denied / Inadequate Redressal',
            description: 'Company denied warranty repair/refund without justifiable technical grounds.',
            isKeyMilestone: true,
            status: 'user_reported',
            groundingRefIds: ['narrative-user']
          }
        );

        identifiedGaps.push('Official job sheet / diagnostic report from the authorized service center.');
        break;
      }

      default: {
        timelineEvents.push(
          {
            id: 'ev-gen-start',
            date: prevMonth,
            title: 'Initial Agreement / Transaction',
            description: 'Parties entered into arrangement or statutory obligation arose.',
            isKeyMilestone: true,
            status: 'verified',
            groundingRefIds: firstDoc ? [firstDoc.id] : ['narrative-user']
          },
          {
            id: 'ev-gen-dispute',
            date: todayStr,
            title: 'Breach of Agreement / Dispute Arising',
            description: 'Failure to perform agreed obligations or unlawful withholding.',
            isKeyMilestone: true,
            status: 'user_reported',
            groundingRefIds: ['narrative-user']
          }
        );
        identifiedGaps.push('Proof of formal written demand / notice served on the opposing party.');
        break;
      }
    }

    timelineEvents.forEach(ev => {
      sourceReferences.push({
        id: ev.id,
        type: 'event',
        label: `${ev.title} (${ev.date})`
      });
    });

    return {
      result: {
        timelineEvents,
        identifiedGaps
      },
      confidenceScore: 0.92,
      sourceReferences,
      assumptions,
      unresolvedQuestions,
      safetyFlags: []
    };
  }
}
