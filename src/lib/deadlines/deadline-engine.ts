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

    // 1. Notice Cure Period Deadlines (15-Day / 30-Day standard windows)
    const hasNoticeDraft = matter.drafts.some(d => d.type === 'formal_demand' || d.type === 'legal_notice');
    if (hasNoticeDraft) {
      const noticeDue = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
      deadlines.push({
        id: 'deadline-notice-cure-15d',
        title: '15-Day Notice Cure Window',
        category: 'notice_cure',
        dueDate: noticeDue.toISOString().split('T')[0],
        daysRemaining: 15,
        urgency: 'warning',
        statuteBasis: 'Section 138 NI Act / CPC Section 80 Notice Practice',
        consequenceIfMissed: 'Opposing party may claim notice was premature if filed in forum without 15 days cure.',
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
