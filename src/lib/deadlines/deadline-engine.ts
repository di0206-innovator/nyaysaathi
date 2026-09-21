import { Matter } from '@/types/matter';

export interface CalculatedDeadline {
  id: string;
  title: string;
  category: 'notice_cure' | 'statutory_limitation' | 'action_step' | 'procedural_filing';
  dueDate: string;
  daysRemaining: number;
  urgency: 'critical' | 'warning' | 'normal';
  statuteBasis: string;
  consequenceIfMissed: string;
  recommendedAction: string;
}

export interface IReminderSubscription {
  matterId: string;
  deadlineId: string;
  channel: 'email' | 'sms' | 'whatsapp';
  destination: string;
  leadDays: number;
}

export interface IReminderService {
  scheduleReminder(sub: IReminderSubscription): Promise<boolean>;
  listReminders(matterId: string): Promise<IReminderSubscription[]>;
}

export class DeadlineEngine {
  /**
   * Computes time-sensitive deadlines, notice periods, and statutory limitation countdowns.
   */
  public static calculateDeadlines(matter: Matter): CalculatedDeadline[] {
    const deadlines: CalculatedDeadline[] = [];
    const now = new Date();

    // 1. Notice Cure Period Deadlines
    const dispatchedNotice = (matter.communications || []).find(
      c => c.type === 'legal_notice' &&
           c.direction === 'outgoing' &&
           (c.status === 'sent' || c.status === 'awaiting_response')
    );
    const hasNoticeDraft = (matter.drafts || []).some(
      d => d.type === 'formal_demand' || d.type === 'legal_notice'
    );

    if (dispatchedNotice) {
      const sentDate = dispatchedNotice.createdAt ? new Date(dispatchedNotice.createdAt) : now;
      const cureDue = dispatchedNotice.responseExpectedBy
        ? new Date(dispatchedNotice.responseExpectedBy)
        : new Date(sentDate.getTime() + 15 * 24 * 60 * 60 * 1000);
      const diffTime = cureDue.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      deadlines.push({
        id: `deadline-notice-cure-${dispatchedNotice.id}`,
        title: matter.category === 'financial_cheque_bounce'
          ? 'Mandatory 15-Day Statutory Notice Cure Window (Sec 138 NI Act)'
          : '15-Day Formal Notice Response & Cure Window',
        category: 'notice_cure',
        dueDate: cureDue.toISOString().split('T')[0],
        daysRemaining: Math.max(0, daysRemaining),
        urgency: daysRemaining <= 3 ? 'critical' : 'warning',
        statuteBasis: matter.category === 'financial_cheque_bounce'
          ? 'Section 138(c) Negotiable Instruments Act 1881'
          : 'Indian Contract Act 1872 / Legal Notice Practice',
        consequenceIfMissed: 'Opposing party may claim formal demand period has not elapsed before complaint or suit.',
        recommendedAction: 'Verify postal delivery slip or tracking report via registered post (RPAD).'
      });
    } else if (hasNoticeDraft) {
      const noticeDue = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
      deadlines.push({
        id: 'deadline-notice-cure-15d',
        title: matter.category === 'financial_cheque_bounce'
          ? '15-Day Statutory Demand Window (Sec 138 NI Act)'
          : '15-Day Formal Notice Response Window (Estimated)',
        category: 'notice_cure',
        dueDate: noticeDue.toISOString().split('T')[0],
        daysRemaining: 15,
        urgency: 'warning',
        statuteBasis: matter.category === 'financial_cheque_bounce'
          ? 'Section 138(c) Negotiable Instruments Act 1881'
          : 'Indian Contract Act 1872 / Notice Practice',
        consequenceIfMissed: 'Opposing party may claim formal demand period has not elapsed before complaint or suit.',
        recommendedAction: 'Verify postal delivery slip or tracking report via registered post (RPAD).'
      });
    }

    // 2. Statutory Limitation Deadlines (from Matter Risks)
    for (const risk of matter.risks) {
      if (risk.limitationPeriodInfo) {
        const lim = risk.limitationPeriodInfo;
        const months = lim.deadlineMonths;

        // Estimate based on earliest or latest timeline event
        const baseDate = matter.timelineEvents.length > 0
          ? new Date(matter.timelineEvents[0].date)
          : now;

        const expiryDate = new Date(baseDate);
        expiryDate.setMonth(expiryDate.getMonth() + months);

        const diffTime = expiryDate.getTime() - now.getTime();
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let urgency: 'critical' | 'warning' | 'normal' = 'normal';
        if (daysRemaining <= 30) urgency = 'critical';
        else if (daysRemaining <= 90) urgency = 'warning';

        deadlines.push({
          id: `deadline-limitation-${risk.id}`,
          title: `${risk.title} (Statutory Limitation)`,
          category: 'statutory_limitation',
          dueDate: expiryDate.toISOString().split('T')[0],
          daysRemaining: Math.max(0, daysRemaining),
          urgency,
          statuteBasis: lim.statute,
          consequenceIfMissed: 'Extinguishes right to approach court / forum (Section 3 Indian Limitation Act, 1963).',
          recommendedAction: risk.mitigatingAction || 'File online petition or approach DLSA for pre-institution mediation.'
        });
      }
    }

    // 3. Action Plan Target Dates
    for (const step of matter.actionPlan) {
      let days = 14;
      if (step.phase === 'immediate_48h') days = 2;
      else if (step.phase === 'formal_escalation') days = 30;

      const stepDue = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      deadlines.push({
        id: `deadline-action-${step.id}`,
        title: step.title,
        category: 'action_step',
        dueDate: stepDue.toISOString().split('T')[0],
        daysRemaining: days,
        urgency: days <= 2 ? 'critical' : days <= 14 ? 'warning' : 'normal',
        statuteBasis: 'Procedural Roadmap Milestone',
        consequenceIfMissed: 'Prolongs grievance redressal and delays potential settlement negotiations.',
        recommendedAction: step.description
      });
    }

    // Sort by daysRemaining ascending (most urgent first)
    deadlines.sort((a, b) => a.daysRemaining - b.daysRemaining);
    return deadlines;
  }

  /**
   * Deadline Engine 2.0: Generates comprehensive matter-aware deadlines covering:
   * 1. Statutory limitation deadlines (with Trust & Safety verification tiers)
   * 2. Action step execution deadlines
   * 3. Communication response deadlines (e.g. 15-day notice cure window)
   * 4. Retains any user-defined reminders
   */
  public static generateMatterDeadlines(matter: Matter): import('@/types/matter').MatterDeadline[] {
    const deadlines: import('@/types/matter').MatterDeadline[] = [];
    const now = new Date();
    const matterId = matter.id;

    // 1. Existing user-defined or manual deadlines
    if (matter.deadlines) {
      for (const d of matter.deadlines) {
        if (d.isUserDefined) {
          deadlines.push({
            ...d,
            source: d.source || 'USER_ENTERED',
            isEstimated: d.isEstimated || false
          });
        }
      }
    }

    // 2. Communication Response Deadlines (e.g., legal notices awaiting reply)
    if (matter.communications) {
      for (const comm of matter.communications) {
        if (comm.responseExpectedBy && comm.status !== 'responded' && comm.status !== 'resolved') {
          const isOverdue = new Date(comm.responseExpectedBy).getTime() < now.getTime();
          const isStatutory138 = comm.type === 'legal_notice' && matter.category === 'financial_cheque_bounce';
          deadlines.push({
            id: `deadline-resp-${comm.id}`,
            matterId,
            title: `Response Expected: ${comm.type.replace(/_/g, ' ')} (${comm.counterparty})`,
            description: `Expected formal response to ${comm.summary}`,
            dueDate: comm.responseExpectedBy,
            type: 'response_expected',
            source: isStatutory138 ? 'STATUTE' : 'NOTICE',
            isStatutory: isStatutory138,
            isUserDefined: false,
            isEstimated: false,
            requiresLegalVerification: !isStatutory138,
            confidence: 0.90,
            trustTier: 'explanation',
            status: isOverdue ? 'overdue' : 'active',
            relatedEventId: comm.id
          });
        }
      }
    }

    // 3. Action Step Deadlines
    for (const step of matter.actionPlan) {
      if (step.status === 'completed' || step.status === 'skipped') continue;

      let isEstimated = false;
      let dueDateStr = step.dueDate;
      if (!dueDateStr) {
        isEstimated = true;
        let days = 14;
        if (step.phase === 'immediate_48h') days = 2;
        else if (step.phase === 'formal_escalation') days = 30;
        const calcDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        dueDateStr = calcDate.toISOString().split('T')[0];
      }

      const isOverdue = new Date(dueDateStr).getTime() < now.getTime();

      deadlines.push({
        id: `deadline-step-${step.id}`,
        matterId,
        title: step.title,
        description: step.description,
        dueDate: dueDateStr,
        type: 'action_step',
        source: isEstimated ? 'ESTIMATE' : 'AGREEMENT',
        isStatutory: false,
        isUserDefined: false,
        isEstimated,
        confidence: 0.95,
        trustTier: 'explanation',
        relatedActionId: step.id,
        status: isOverdue ? 'overdue' : 'active'
      });
    }

    // 4. Statutory Deadlines (from Limitation Periods & Applicable Statutes)
    for (const risk of matter.risks) {
      if (risk.limitationPeriodInfo) {
        const lim = risk.limitationPeriodInfo;
        const months = lim.deadlineMonths;

        const baseDate = matter.timelineEvents.length > 0
          ? new Date(matter.timelineEvents[0].date)
          : now;

        const expiryDate = new Date(baseDate);
        expiryDate.setMonth(expiryDate.getMonth() + months);
        const expiryStr = expiryDate.toISOString().split('T')[0];
        const isOverdue = expiryDate.getTime() < now.getTime();

        const hasVerifiedEvent = matter.timelineEvents.some(e => e.status === 'verified');
        const trustTier = hasVerifiedEvent
          ? (risk.severity === 'critical' ? 'counsel_required' : 'fact')
          : 'explanation';

        deadlines.push({
          id: `deadline-statute-${risk.id}`,
          matterId,
          title: `Statutory Limitation: ${lim.statute}`,
          description: `Statutory limitation expiry computed under ${lim.statute}. ${risk.mitigatingAction}`,
          dueDate: expiryStr,
          type: 'statutory',
          source: 'STATUTE',
          isStatutory: true,
          isUserDefined: false,
          isEstimated: !hasVerifiedEvent,
          requiresLegalVerification: trustTier === 'counsel_required',
          confidence: hasVerifiedEvent ? 0.92 : 0.70,
          trustTier,
          statuteReference: lim.statute,
          status: isOverdue ? 'overdue' : 'active'
        });
      }
    }

    // Sort deadlines by dueDate ascending
    deadlines.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    return deadlines;
  }
}

/**
 * In-memory Mock Reminder Service implementation ready for future notification integrations.
 */
export class MockReminderService implements IReminderService {
  private subscriptions: IReminderSubscription[] = [];

  public async scheduleReminder(sub: IReminderSubscription): Promise<boolean> {
    this.subscriptions.push(sub);
    return true;
  }

  public async listReminders(matterId: string): Promise<IReminderSubscription[]> {
    return this.subscriptions.filter(s => s.matterId === matterId);
  }
}
