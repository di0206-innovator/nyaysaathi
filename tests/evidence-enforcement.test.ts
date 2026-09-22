import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ClaimSupportChecker } from '../src/lib/reasoning/claim-support-checker';
import { EvidenceGraph } from '../src/lib/graph/evidence-graph';
import { Orchestrator } from '../src/lib/agents/orchestrator';
import { DraftingAgent } from '../src/lib/agents/drafting-agent';
import { EscalationMatcher } from '../src/lib/legal/escalation-matcher';
import { getMatterService } from '../src/lib/repository';
import { SEED_MATTERS } from '../src/lib/db/seed-data';
import type { AgentInput } from '../src/lib/agents/types';
import type { Matter } from '../src/types/matter';

describe('Phase 3: Evidence Enforcement, Safety Hardening & Future Foundations', () => {
  const seedMatter: Matter = SEED_MATTERS.find((m: Matter) => m.id === 'matter-bengaluru-rent')!;

  it('1. Flags unsupported claims and demotes them to unsupported tier', () => {
    const claim = 'The landlord definitely committed a criminal fraud punishable under Section 420 IPC.';
    const audit = ClaimSupportChecker.auditStatement(claim, [], []);

    assert.ok(
      audit.tier === 'unsupported' || audit.tier === 'possibility',
      'Claim with no direct evidence should be ungrounded/possibility'
    );
    assert.strictEqual(audit.wasRewritten, true, 'Defamatory criminal assertion should be rewritten');
    assert.ok(
      audit.revisedText.includes('inconsistent with contractual or statutory duties'),
      'Should rewrite into neutral conduct description'
    );
    assert.strictEqual(audit.requiresClarificationPrompt, true, 'Should prompt for clarification');
  });

  it('2. Rewrites overconfident legal language into neutral/factual terms', () => {
    const aggressiveDraft =
      'Your conduct is illegal and unlawful. You are entitled to immediate refund and must pay 18% penal interest. We will guarantee full recovery in court.';

    const audit = ClaimSupportChecker.auditDraftContent(aggressiveDraft, {
      isLawyerReady: true,
      groundingRefIds: ['doc-1']
    });

    assert.ok(audit.auditEntries.length >= 3, `Expected multiple rewrites, got ${audit.auditEntries.length}`);
    
    // Check aggressive words are neutralized
    assert.ok(!audit.sanitizedContent.toLowerCase().includes('illegal'), 'Should rewrite "illegal"');
    assert.ok(!audit.sanitizedContent.toLowerCase().includes('unlawful'), 'Should rewrite "unlawful"');
    assert.ok(!audit.sanitizedContent.toLowerCase().includes('must pay'), 'Should rewrite "must pay"');
    assert.ok(!audit.sanitizedContent.toLowerCase().includes('guarantee'), 'Should rewrite "guarantee"');
    
    // Check audit entries contain rationales
    for (const entry of audit.auditEntries) {
      assert.ok(entry.original.length > 0);
      assert.ok(entry.rewritten.length > 0);
      assert.ok(entry.reason.length > 0);
    }
  });

  it('3. Audits draft paragraphs and marks lawyer review required', async () => {
    const draftingAgent = new DraftingAgent();
    const input: AgentInput = {
      matterId: seedMatter.id,
      title: seedMatter.title,
      category: seedMatter.category,
      userStory: seedMatter.userStory,
      parties: seedMatter.parties,
      documents: seedMatter.documents,
      claimAmount: seedMatter.claimAmount,
      trigger: 'full'
    };

    const result = await draftingAgent.execute(
      input,
      seedMatter.parties.map(p => ({ name: p.name, role: p.role })),
      seedMatter.timelineEvents.map(t => ({ date: t.date, title: t.title, description: t.description }))
    );

    assert.ok(result.result.drafts.length > 0, 'Should produce drafts');
    const legalNotice = result.result.drafts.find(d => d.type === 'legal_notice');
    assert.ok(legalNotice, 'Should include a legal notice draft');

    // Paragraph breakdown and audit
    assert.ok(legalNotice.paragraphs && legalNotice.paragraphs.length > 0, 'Draft should have structured paragraphs');
    assert.strictEqual(legalNotice.requiresAdvocateReview, true, 'Legal notices must require advocate review');
    assert.ok(Array.isArray(legalNotice.auditLog), 'Draft should contain an audit log');
  });

  it('4. Escalation routes match matter category and jurisdictional limits', () => {
    const routes = EscalationMatcher.matchRoutes(
      seedMatter.category,
      seedMatter.locationState,
      seedMatter.claimAmount
    );

    assert.ok(routes.length > 0, 'Should generate escalation routes');

    // For tenancy dispute in Karnataka:
    const routeTitles = routes.map(r => r.name.toLowerCase());
    const hasAppropriateForum = routeTitles.some(t => 
      t.includes('rent') || t.includes('civil') || t.includes('legal services') || t.includes('dlsa') || t.includes('consumer')
    );
    assert.ok(hasAppropriateForum, 'Escalation routes should match tenancy dispute category');
  });

  it('5. Creates evidence graph nodes and evaluates grounding status correctly', () => {
    const graph = EvidenceGraph.buildFromMatter(seedMatter);

    assert.ok(graph.getAllNodes().length > 0, 'Evidence graph should have nodes');
    assert.ok(graph.getAllEdges().length > 0, 'Evidence graph should have connecting edges');

    // Check node types
    const nodeTypes = new Set(graph.getAllNodes().map(n => n.type));
    assert.ok(nodeTypes.has('claim'), 'Graph should contain claim nodes');
    assert.ok(nodeTypes.has('doc'), 'Graph should contain doc nodes');
    assert.ok(nodeTypes.has('fact'), 'Graph should contain fact nodes');

    // Check grounding calculation on a node
    const firstClaim = graph.getAllNodes().find(n => n.type === 'claim');
    if (firstClaim) {
      const status = graph.getNodeGroundingStatus(firstClaim.id);
      assert.ok(['grounded', 'partially_grounded', 'unsupported'].includes(status));

      const detailed = graph.getDetailedSupportingEvidence(firstClaim.id);
      assert.ok(Array.isArray(detailed));
    }

    // Check missing evidence prompts
    const missingPrompts = graph.getMissingEvidencePrompts();
    assert.ok(Array.isArray(missingPrompts));
  });

  it('6. Selective re-analysis triggers only the specified pipeline layers', async () => {
    const orchestrator = new Orchestrator();

    // Trigger: 'doc_uploaded' -> documents, timeline, risks, actions, drafts, safety (skips retrieval)
    const docUploadResult = await orchestrator.executePipeline(seedMatter, {
      trigger: 'doc_uploaded',
    });
    assert.ok(docUploadResult.matter, 'Pipeline should return updated matter');
    assert.ok(docUploadResult.agentResults.length > 0, 'Should execute layers');

    const completedDocAgents = docUploadResult.agentResults
      .filter(r => r.status === 'completed')
      .map(r => r.agentName);
    const skippedDocAgents = docUploadResult.agentResults
      .filter(r => r.status === 'skipped')
      .map(r => r.agentName);

    assert.ok(completedDocAgents.includes('Document Intelligence Agent'), 'Doc agent should complete');
    assert.ok(completedDocAgents.includes('Context & Timeline Agent'), 'Timeline agent should complete');
    assert.ok(completedDocAgents.includes('Safety Verification Agent'), 'Safety agent should always complete');
    assert.ok(skippedDocAgents.includes('Legal Retrieval Agent'), 'Retrieval agent should be skipped on doc upload');

    // Trigger: 'missing_info_answered' -> risks, actions, drafts, safety (skips doc intel, timeline)
    const missingInfoResult = await orchestrator.executePipeline(seedMatter, {
      trigger: 'missing_info_answered',
    });
    const completedInfoAgents = missingInfoResult.agentResults
      .filter(r => r.status === 'completed')
      .map(r => r.agentName);
    const skippedInfoAgents = missingInfoResult.agentResults
      .filter(r => r.status === 'skipped')
      .map(r => r.agentName);

    assert.ok(completedInfoAgents.includes('Risk Assessment Agent'), 'Risk agent should complete');
    assert.ok(completedInfoAgents.includes('Action Planner Agent'), 'Action agent should complete');
    assert.ok(completedInfoAgents.includes('Drafting Agent'), 'Drafting agent should complete');
    assert.ok(completedInfoAgents.includes('Safety Verification Agent'), 'Safety agent should always complete');
    assert.ok(skippedInfoAgents.includes('Document Intelligence Agent'), 'Doc agent should be skipped when answering info');
    assert.ok(skippedInfoAgents.includes('Context & Timeline Agent'), 'Timeline agent should be skipped when answering info');

    // Safety must always be the last agent in the execution sequence
    const lastAgent = missingInfoResult.agentResults[missingInfoResult.agentResults.length - 1];
    assert.strictEqual(lastAgent.agentName, 'Safety Verification Agent', 'Safety Verification Agent must always execute last');
  });

  it('7. MatterService.reanalyzeMatter passes existing state to orchestrator and preserves evidence graph', async () => {
    const service = getMatterService();
    const initialMatter = await service.getMatterById('matter-bengaluru-rent');
    assert.ok(initialMatter, 'Seed matter should exist in repository');

    // Trigger selective reanalysis via MatterService
    const reanalyzed = await service.reanalyzeMatter('matter-bengaluru-rent', 'missing_info_answered');
    assert.ok(reanalyzed, 'Reanalyzed matter should be returned');
    assert.strictEqual(reanalyzed.id, 'matter-bengaluru-rent');

    // Existing facts and timeline should be preserved
    assert.ok(reanalyzed.facts.length > 0, 'Facts should be preserved and verified');
    assert.ok(reanalyzed.timelineEvents.length > 0, 'Timeline events should be preserved');
    assert.ok(reanalyzed.evidenceGraph, 'Evidence graph should be maintained');
    assert.ok(reanalyzed.evidenceGraph.nodes.length > 0, 'Evidence graph nodes should exist');
    assert.ok(Array.isArray(reanalyzed.auditLog), 'Audit log should be present');
  });
});
