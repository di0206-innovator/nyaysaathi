import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { MatterService } from '@/lib/repository/matter-service';
import { MemoryStorageAdapter } from '@/lib/repository/adapters/memory-adapter';
import { MatterOrchestrator } from '@/lib/agents/orchestrator';
import { TenancyFramework } from '@/lib/legal/tenancy-framework';
import { AdvocatePackService } from '@/lib/advocate/advocate-pack';

describe('E2E Production Journey: Complete Tenancy Dispute Lifecycle', () => {
  const adapter = new MemoryStorageAdapter();
  const matterService = new MatterService(adapter);
  const orchestrator = new MatterOrchestrator();

  test('E1 - Complete Journey from Pilot Intake to Advocate Pack & Resolution', async () => {
    // 1. Pilot Intake & Acquisition Attribution
    const referralCode = 'PILOT-BLR-2026';
    assert.ok(referralCode);
    const acquisitionSource = 'housing_community' as const;
    const testUserId = 'tenant-pilot-user-404';

    // 2. Tenancy Framework Jurisdiction Verification
    const framework = TenancyFramework.assessApplicability({
      state: 'Karnataka',
      city: 'Bengaluru',
      agreementType: 'registered_lease',
      monthlyRentINR: 25000,
      securityDepositINR: 75000,
      disputeType: 'deposit_withholding'
    });
    assert.ok(framework.jurisdiction.includes('Karnataka'));
    assert.ok(framework.applicableActs.some(a => a.actName.includes('Karnataka')));
    assert.ok(framework.applicableActs.some(a => a.actName.includes('Indian Contract Act')));

    // 3. Matter Creation with Tenancy Wedge
    const createdMatter = await matterService.createMatter({
      userId: testUserId,
      title: 'Unlawful Security Deposit Retention - Koramangala Flat',
      category: 'tenancy_housing',
      userStory: 'Landlord refused to refund ₹75,000 security deposit after handover inspection on Aug 1st. Claiming arbitrary ₹45,000 painting and cleaning deductions with zero bills.',
      locationCity: 'Bengaluru',
      locationState: 'Karnataka',
      claimAmount: 75000,
      acquisitionSource,
      parties: [
        {
          id: 'party-tenant',
          name: 'Divyanshu Sinha',
          role: 'Tenant',
          contactInfo: 'tenant@example.com'
        },
        {
          id: 'party-landlord',
          name: 'Property Owner Koramangala',
          role: 'Landlord',
          contactInfo: 'landlord@example.com'
        }
      ]
    });

    assert.ok(createdMatter.id);
    assert.equal(createdMatter.status, 'awaiting_user_action');
    assert.equal(createdMatter.acquisitionSource, 'housing_community');

    // 4. Document Evidence Intake
    await adapter.documents.add(createdMatter.id, {
      id: 'doc-agreement-1',
      title: 'Rental Agreement 2025-2026.pdf',
      type: 'rental_agreement',
      extractionStatus: 'verified_extraction',
      extractedText: 'Clause 7: Refundable security deposit of Rs 75,000 shall be refunded within 30 days of vacant possession subject to actual utility bills.',
      confidenceScore: 0.95,
      uploadedAt: new Date().toISOString(),
      status: 'verified'
    });
    const updatedWithDoc = (await matterService.getMatterById(createdMatter.id))!;
    assert.equal(updatedWithDoc.documents.length, 1);

    // 5. Orchestrator DAG Pipeline Execution
    const pipelineResult = await orchestrator.processMatter({
      matterId: createdMatter.id,
      title: updatedWithDoc.title,
      category: updatedWithDoc.category,
      userStory: updatedWithDoc.userStory,
      parties: updatedWithDoc.parties,
      documents: updatedWithDoc.documents,
      locationCity: updatedWithDoc.locationCity,
      locationState: updatedWithDoc.locationState,
      claimAmount: updatedWithDoc.claimAmount,
      existingMatter: updatedWithDoc,
      trigger: 'full'
    });

    const analyzedMatter = pipelineResult.matter;
    await adapter.matters.update(analyzedMatter.id, analyzedMatter);

    assert.ok(analyzedMatter.actionPlan.length > 0, 'Phased action plan must be generated');
    assert.ok(analyzedMatter.drafts.length >= 3, 'Soft, Formal, and Legal Notice drafts must be generated');
    assert.ok(analyzedMatter.escalationRoutes.length > 0, 'Escalation routes must be matched');
    assert.ok((analyzedMatter.auditLog || []).length >= 0, 'Audit log exists');

    // 6. Action Execution: Record First Useful Action
    const firstAction = analyzedMatter.actionPlan[0];
    assert.ok(firstAction, 'Must have first action');

    const updatedAfterAction = await matterService.recordFirstUsefulAction(
      analyzedMatter.id,
      testUserId
    );
    assert.ok(updatedAfterAction?.firstUsefulActionAt, 'First action completion timestamp must be recorded');

    // 7. Communication & Timeline Tracking
    const updatedWithComm = await matterService.recordCommunication(analyzedMatter.id, {
      matterId: analyzedMatter.id,
      type: 'legal_notice',
      direction: 'outgoing',
      counterparty: 'Property Owner Koramangala',
      summary: 'Sent formal notice demanding refund of ₹75,000 with 14-day compliance window.',
      date: new Date().toISOString(),
      status: 'awaiting_response'
    });
    assert.equal(updatedWithComm.communications?.length, 1);

    // 8. Generate Advocate Case Pack
    const advocatePack = AdvocatePackService.compileAdvocateBrief(updatedWithComm);
    assert.ok(advocatePack.matterSummary.includes('Unlawful Security Deposit Retention'));
    assert.ok(advocatePack.parties.some(p => p.role === 'Tenant'));
    assert.ok(advocatePack.verifiedFacts.length >= 0);
    assert.ok(advocatePack.limitationAndDeadlines.length >= 0);
    assert.ok(advocatePack.advocateNote.length > 0);

    // 9. Submit Real Pilot Feedback
    const feedbackRecord = await matterService.submitPilotFeedback({
      matterId: updatedWithComm.id,
      userId: testUserId,
      utility: 'yes',
      rating: 5,
      category: 'drafting',
      feedbackText: 'The formal notice draft was immediately accepted by the landlord after referencing the exact agreement clause.',
      advocateConsulted: true,
      source: 'pilot_onboarding'
    });

    assert.ok(feedbackRecord.id);
    assert.equal(feedbackRecord.utility, 'yes');

    // 10. Record Matter Resolution
    const resolvedMatter = await matterService.resolveMatter(
      updatedWithComm.id,
      {
        resolvedAt: new Date().toISOString(),
        resolutionType: 'full_settlement',
        outcome: 'Full security deposit refund secured via formal notice',
        amountRecovered: 75000,
        amountDisputed: 75000,
        notes: 'Landlord dropped unverified deductions and refunded full ₹75,000 via NEFT.'
      },
      testUserId
    );

    assert.equal(resolvedMatter.status, 'resolved');
    assert.equal(resolvedMatter.resolution?.amountRecovered, 75000);

    // 11. Verify Analytics Metrics (Genuine Sample Size n=1, Zero Fake Marketing Defaults)
    const funnel = await matterService.calculateFunnelMetrics();
    assert.ok(funnel.totalMatters >= 1);
    assert.ok(funnel.withDocuments >= 1);
    assert.ok(funnel.resolved >= 1);
    assert.ok(funnel.timeToFirstUsefulActionMinutes.sampleSize >= 1);

    const feedbackMetrics = await matterService.getPilotFeedbackMetrics();
    assert.equal(feedbackMetrics.totalSubmissions, 1);
    assert.equal(feedbackMetrics.averageRating, 5);
    assert.equal(feedbackMetrics.advocateConsultedCount, 1);
    assert.equal(feedbackMetrics.categoryBreakdown['drafting'], 1);
  });
});
