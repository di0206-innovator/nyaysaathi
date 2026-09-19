import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { MatterService, MemoryStorageAdapter } from '../src/lib/repository';
import { DeadlineEngine } from '../src/lib/deadlines/deadline-engine';
import { getInAppNotificationProvider } from '../src/lib/notifications/notification-provider';

describe('Phase 7: Action Execution, Legal Workflow Tracking & Matter Lifecycle', () => {
  let memoryAdapter: MemoryStorageAdapter;
  let matterService: MatterService;

  beforeEach(() => {
    memoryAdapter = new MemoryStorageAdapter();
    matterService = new MatterService(memoryAdapter);
  });

  // 1. Action Lifecycle Workspace & Proof Tracking
  describe('1. Action Execution Workspace', () => {
    it('updates action status from pending to completed with proof of dispatch', async () => {
      const matter = await matterService.createMatter({
        title: 'Tenancy Deposit Non-Refund',
        category: 'tenancy_housing',
        userStory: 'Landlord Ramesh Kumar refused to refund deposit of Rs 75,000 despite 30 days notice.',
        claimAmount: 75000,
        locationCity: 'Bengaluru',
        locationState: 'Karnataka'
      });

      assert.ok(matter.actionPlan.length > 0);
      const targetAction = matter.actionPlan.find(a => a.status === 'pending') || matter.actionPlan[0];

      // Update action to completed with proof
      const updatedMatter = await matterService.updateActionStep(matter.id, targetAction.id, {
        status: 'completed',
        completionProof: {
          type: 'receipt',
          reference: 'EK123456789IN',
          notes: 'Speed Post dispatched from Indiranagar PO',
          recordedAt: new Date().toISOString()
        },
        result: 'awaiting_response',
        notes: 'Notice delivered, awaiting reply within 15 days.'
      });

      const updatedAction = updatedMatter.actionPlan.find(a => a.id === targetAction.id);
      assert.equal(updatedAction?.status, 'completed');
      assert.ok(updatedAction?.completedAt);
      assert.equal(updatedAction?.completionProof?.type, 'receipt');
      assert.equal(updatedAction?.completionProof?.reference, 'EK123456789IN');

      // Activity event should be logged
      const completedEvent = updatedMatter.activityEvents?.find(e => e.type === 'action_completed');
      assert.ok(completedEvent);
      assert.match(completedEvent.title, /Action Completed/);
    });

    it('marks an action as blocked with a blocking dependency reason', async () => {
      const matter = await matterService.createMatter({
        title: 'Defective Laptop Dispute',
        category: 'consumer_dispute',
        userStory: 'Purchased laptop with dead motherboard, seller refused replacement.',
        claimAmount: 65000
      });

      const targetAction = matter.actionPlan[0];
      const updatedMatter = await matterService.updateActionStep(matter.id, targetAction.id, {
        status: 'blocked',
        blockingReason: 'Awaiting formal diagnostic report from authorized service center.'
      });

      const action = updatedMatter.actionPlan.find(a => a.id === targetAction.id);
      assert.equal(action?.status, 'blocked');
      assert.equal(action?.blockingReason, 'Awaiting formal diagnostic report from authorized service center.');
    });
  });

  // 2. Communication Log & Expected Response Tracking
  describe('2. Communication Log', () => {
    it('records an outgoing legal notice with expected response date and schedules response deadline', async () => {
      const matter = await matterService.createMatter({
        title: 'Salary Withholding Matter',
        category: 'workplace_employment',
        userStory: 'Employer failed to disburse 2 months salary after resignation.',
        claimAmount: 120000
      });

      const noticeDate = '2026-09-20';
      const expectedResponseDate = '2026-10-05';

      const updatedMatter = await matterService.recordCommunication(matter.id, {
        matterId: matter.id,
        type: 'legal_notice',
        direction: 'outgoing',
        date: noticeDate,
        counterparty: 'TechCorp Pvt Ltd',
        summary: 'Statutory demand notice under Payment of Wages Act served via Speed Post.',
        referenceNumber: 'SP99887766IN',
        responseExpectedBy: expectedResponseDate,
        status: 'sent'
      });

      assert.equal(updatedMatter.communications?.length, 1);
      const comm = updatedMatter.communications[0];
      assert.equal(comm.type, 'legal_notice');
      assert.equal(comm.direction, 'outgoing');
      assert.equal(comm.referenceNumber, 'SP99887766IN');

      // Status should become awaiting_other_party
      assert.equal(updatedMatter.status, 'awaiting_other_party');

      // Deadlines should include response expected
      const responseDeadline = updatedMatter.deadlines?.find(d => d.type === 'response_expected');
      assert.ok(responseDeadline);
      assert.equal(responseDeadline.dueDate, expectedResponseDate);
    });
  });

  // 3. Deadline Engine 2.0
  describe('3. Deadline Engine 2.0', () => {
    it('generates statutory deadlines with trust & safety verification tiers', async () => {
      const matter = await matterService.createMatter({
        title: 'Cheque Bounce Matter',
        category: 'financial_cheque_bounce',
        userStory: 'Cheque of Rs 50,000 dishonoured with remarks funds insufficient on 01 Sep 2026.',
        claimAmount: 50000
      });

      const deadlines = DeadlineEngine.generateMatterDeadlines(matter);
      assert.ok(deadlines.length > 0);

      // Must have action step deadlines
      const actionDeadlines = deadlines.filter(d => d.type === 'action_step');
      assert.ok(actionDeadlines.length > 0);

      // Statutory deadlines must have trust tier
      const statutoryDeadlines = deadlines.filter(d => d.isStatutory);
      for (const sd of statutoryDeadlines) {
        assert.ok(sd.trustTier);
        assert.ok(['fact', 'explanation', 'possibility', 'counsel_required'].includes(sd.trustTier));
      }
    });

    it('allows scheduling user-defined custom reminders', async () => {
      const matter = await matterService.createMatter({
        title: 'Consumer Dispute',
        category: 'consumer_dispute',
        userStory: 'Ordered AC which was delivered with broken compressor.',
        claimAmount: 42000
      });

      const updatedMatter = await matterService.manageDeadline(matter.id, {
        matterId: matter.id,
        title: 'Upload Police NCR acknowledgment',
        dueDate: '2026-09-28',
        description: 'Collect written acknowledgment copy from Indiranagar police station.',
        type: 'user_defined',
        isStatutory: false,
        isUserDefined: true,
        confidence: 1.0,
        trustTier: 'fact',
        status: 'active'
      });

      const userDeadline = updatedMatter.deadlines?.find(d => d.title === 'Upload Police NCR acknowledgment');
      assert.ok(userDeadline);
      assert.equal(userDeadline.isUserDefined, true);
      assert.equal(userDeadline.dueDate, '2026-09-28');
    });
  });

  // 4. Dynamic Matter Health Status Derivation
  describe('4. Dynamic Matter Health Status', () => {
    it('derives awaiting_other_party when notice is sent and pending response', async () => {
      const matter = await matterService.createMatter({
        title: 'Builder Delay Matter',
        category: 'property_rera',
        userStory: 'Apartment possession delayed by 18 months without explanation.',
        claimAmount: 4500000
      });

      // Initially awaiting_user_action
      assert.equal(matterService.deriveMatterHealthStatus(matter), 'awaiting_user_action');

      // Record notice sent
      const withComm = await matterService.recordCommunication(matter.id, {
        matterId: matter.id,
        type: 'legal_notice',
        direction: 'outgoing',
        date: '2026-09-20',
        counterparty: 'Apex Developers',
        summary: 'Sent demand for interest on delayed possession under RERA Sec 18.',
        responseExpectedBy: '2026-10-10',
        status: 'awaiting_response'
      });

      assert.equal(matterService.deriveMatterHealthStatus(withComm), 'awaiting_other_party');
    });

    it('derives awaiting_authority when escalation is submitted', async () => {
      const matter = await matterService.createMatter({
        title: 'Consumer Complaint Matter',
        category: 'consumer_dispute',
        userStory: 'Defective phone not replaced under warranty.',
        claimAmount: 35000
      });

      const withEscalation = await matterService.updateEscalation(matter.id, {
        routeId: 'consumer_forum_edaakhil',
        authorityName: 'District Consumer Disputes Redressal Commission',
        status: 'submitted',
        referenceNumber: 'CC/2026/88991'
      });

      assert.equal(matterService.deriveMatterHealthStatus(withEscalation), 'awaiting_authority');
    });
  });

  // 5. Formal Resolution Workflow & Reopening
  describe('5. Formal Resolution Workflow & Reopening', () => {
    it('records resolution, preserves history, and supports audited reopening', async () => {
      const matter = await matterService.createMatter({
        title: 'Tenancy Deposit Refund',
        category: 'tenancy_housing',
        userStory: 'Landlord refused deposit refund.',
        claimAmount: 75000
      });

      // Formally resolve
      const resolvedMatter = await matterService.resolveMatter(matter.id, {
        resolvedAt: '2026-09-22',
        resolutionType: 'full_settlement',
        outcome: 'Landlord transferred complete security deposit of Rs 75,000 via NEFT.',
        amountRecovered: 75000,
        amountDisputed: 0,
        notes: 'Keys handed over and mutual release deed executed.'
      });

      assert.equal(resolvedMatter.status, 'resolved');
      assert.ok(resolvedMatter.resolution);
      assert.equal(resolvedMatter.resolution.amountRecovered, 75000);
      assert.equal(resolvedMatter.resolution.isReopened, false);

      // Reopen matter
      const reopenedMatter = await matterService.reopenMatter(
        matter.id,
        'Post-dated cheque dishonoured upon deposit in bank',
        'tenant@example.com'
      );

      assert.notEqual(reopenedMatter.status, 'resolved');
      assert.equal(reopenedMatter.resolution?.isReopened, true);
      assert.equal(reopenedMatter.resolution?.reopenedReason, 'Post-dated cheque dishonoured upon deposit in bank');

      // Verify audit event
      const reopenEvent = reopenedMatter.activityEvents?.find(e => e.type === 'matter_reopened');
      assert.ok(reopenEvent);
    });
  });

  // 6. Advocate Case Pack Generation Completeness
  describe('6. Advocate Case Pack Generation', () => {
    it('generates a 10-section case preparation brief with source metadata and disclaimers', async () => {
      const matter = await matterService.createMatter({
        title: 'Tenancy Deposit Dispute',
        category: 'tenancy_housing',
        userStory: 'Landlord in Bengaluru refused to return deposit of Rs 75,000.',
        claimAmount: 75000,
        locationCity: 'Bengaluru',
        locationState: 'Karnataka'
      });

      const pack = await matterService.generateAdvocateCasePack(matter.id);

      assert.equal(pack.matterId, matter.id);
      assert.ok(pack.title);
      assert.ok(pack.category);
      assert.ok(pack.disclaimer);

      // 10 sections check
      assert.ok(pack.executiveSummary); // 1. Executive summary
      assert.ok(Array.isArray(pack.parties)); // 2. Parties
      assert.ok(Array.isArray(pack.chronology)); // 3. Chronology
      assert.ok(Array.isArray(pack.evidenceIndex)); // 4. Evidence index
      assert.ok(Array.isArray(pack.legalIssues)); // 5. Legal issues & statutes
      assert.ok(Array.isArray(pack.risksAndUncertainties)); // 6. Risks
      assert.ok(Array.isArray(pack.actionsTaken)); // 7. Actions taken
      assert.ok(Array.isArray(pack.outstandingActions)); // 8. Outstanding actions
      assert.ok(Array.isArray(pack.drafts)); // 9. Drafts
      assert.ok(Array.isArray(pack.escalationHistory)); // 10. Escalation history
    });
  });

  // 7. Notification Abstraction
  describe('7. Notification Abstraction', () => {
    it('creates in-app notifications and retrieves by matter', async () => {
      const notifProvider = getInAppNotificationProvider();
      const res = await notifProvider.send({
        matterId: 'test-matter-notif',
        type: 'deadline_approaching',
        title: 'Notice cure deadline expiring in 2 days',
        message: 'Review Speed Post delivery acknowledgment.'
      });

      assert.equal(res.success, true);
      assert.ok(res.notificationId);

      const notifs = notifProvider.getNotificationsForMatter('test-matter-notif');
      assert.ok(notifs.length > 0);
      assert.equal(notifs[0].type, 'deadline_approaching');
    });
  });
});
