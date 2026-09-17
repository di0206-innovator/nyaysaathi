import { AgentInput, PipelineExecutionResult } from './types';
import { IntakeAgent } from './intake-agent';
import { DocIntelAgent } from './doc-intel-agent';
import { TimelineAgent } from './timeline-agent';
import { LegalRetrievalAgent } from './retrieval-agent';
import { ReasoningAgent } from './reasoning-agent';
import { RiskAgent } from './risk-agent';
import { ActionPlannerAgent } from './action-planner-agent';
import { DraftingAgent } from './drafting-agent';
import { SafetyVerificationAgent } from './safety-agent';
import { Matter } from '@/types/matter';
import { EvidenceGraph } from '@/lib/graph/evidence-graph';
import { EscalationMatcher } from '@/lib/legal/escalation-matcher';

export class MatterOrchestrator {
  private intakeAgent = new IntakeAgent();
  private docIntelAgent = new DocIntelAgent();
  private timelineAgent = new TimelineAgent();
  private retrievalAgent = new LegalRetrievalAgent();
  private reasoningAgent = new ReasoningAgent();
  private riskAgent = new RiskAgent();
  private actionPlannerAgent = new ActionPlannerAgent();
  private draftingAgent = new DraftingAgent();
  private safetyAgent = new SafetyVerificationAgent();

  /**
   * Executes the full NyaySaathi loop with Evidence Graph and Review/Revision checks:
   * CAPTURE -> UNDERSTAND -> ASSESS -> ACT -> ESCALATE -> VERIFY
   */
  public async processMatter(input: AgentInput): Promise<PipelineExecutionResult> {
    const logs: PipelineExecutionResult['logs'] = [];
    let revisionCyclesRun = 0;
    const trigger = input.trigger || 'full';

    // Step 1: Intake & Entity Normalization
    const t0 = performance.now();
    const intakeEnvelope = await this.intakeAgent.execute(input);
    const intakeResult = intakeEnvelope.result;
    logs.push({
      agentName: 'Intake Agent',
      status: 'completed',
      executionTimeMs: Math.round(performance.now() - t0),
      summary: `Normalized ${intakeResult.extractedParties.length} parties, category: ${intakeResult.detectedCategory} (Confidence: ${intakeEnvelope.confidenceScore}, Trigger: ${trigger})`
    });

    // Step 2: Document Intelligence
    const t1 = performance.now();
    const docEnvelope = await this.docIntelAgent.execute(input);
    const docResult = docEnvelope.result;
    logs.push({
      agentName: 'Document Intelligence Agent',
      status: 'completed',
      executionTimeMs: Math.round(performance.now() - t1),
      summary: `Processed ${docResult.processedDocuments.length} evidence items and extracted ${docResult.extractedFacts.length} grounded facts`
    });

    // Step 3: Chronology & Timeline
    const t2 = performance.now();
    const timelineEnvelope = await this.timelineAgent.execute(input, docResult);
    const timelineResult = timelineEnvelope.result;
    logs.push({
      agentName: 'Context & Timeline Agent',
      status: 'completed',
      executionTimeMs: Math.round(performance.now() - t2),
      summary: `Constructed ${timelineResult.timelineEvents.length} chronological milestones, identified ${timelineResult.identifiedGaps.length} gaps`
    });

    // Step 4: Statutory Retrieval (Multi-factor)
    const t3 = performance.now();
    const retrievalEnvelope = await this.retrievalAgent.execute(input);
    const retrievalResult = retrievalEnvelope.result;
    logs.push({
      agentName: 'Legal Retrieval Agent',
      status: 'completed',
      executionTimeMs: Math.round(performance.now() - t3),
      summary: `Matched ${retrievalResult.applicableStatutes.length} statutory provisions under Indian law`
    });

    // Step 5: Reasoning & Merits Evaluation
    const t4 = performance.now();
    const reasoningEnvelope = await this.reasoningAgent.execute(
      input,
      docResult.extractedFacts,
      retrievalResult.applicableStatutes
    );
    const reasoningResult = reasoningEnvelope.result;
    logs.push({
      agentName: 'Reasoning Agent',
      status: 'completed',
      executionTimeMs: Math.round(performance.now() - t4),
      summary: `Identified ${reasoningResult.caseStrengths.length} strengths and ${reasoningResult.caseWeaknesses.length} potential counter-arguments`
    });

    // Step 6: Risk Assessment
    const t5 = performance.now();
    const riskEnvelope = await this.riskAgent.execute(input, docResult.extractedFacts);
    const riskResult = riskEnvelope.result;
    logs.push({
      agentName: 'Risk Assessment Agent',
      status: 'completed',
      executionTimeMs: Math.round(performance.now() - t5),
      summary: `Calculated ${riskResult.risks.length} risk vectors and ${riskResult.missingInformation.length} missing evidence items`
    });

    // Step 7: Action Planning
    const t6 = performance.now();
    const actionEnvelope = await this.actionPlannerAgent.execute(
      input,
      riskResult.risks.map(r => r.id)
    );
    const actionResult = actionEnvelope.result;
    logs.push({
      agentName: 'Action Planner Agent',
      status: 'completed',
      executionTimeMs: Math.round(performance.now() - t6),
      summary: `Formulated ${actionResult.actionPlan.length} phased action steps (0-48h, 14d, Escalation)`
    });

    // Step 8: Drafting & Advocate Briefing (3-tier drafting)
    const t7 = performance.now();
    const draftEnvelope = await this.draftingAgent.execute(
      input,
      intakeResult.extractedParties,
      timelineResult.timelineEvents
    );
    const draftResult = draftEnvelope.result;
    logs.push({
      agentName: 'Drafting Agent',
      status: 'completed',
      executionTimeMs: Math.round(performance.now() - t7),
      summary: `Generated ${draftResult.drafts.length} drafts (Soft, Formal, Notice) and 1-page advocate brief`
    });

    // Step 9: Trust & Safety Verification + Revision Review Loop
    const t8 = performance.now();
    const safetyEnvelope = await this.safetyAgent.execute(
      input,
      docResult.extractedFacts,
      reasoningResult.caseStrengths,
      reasoningResult.caseWeaknesses,
      reasoningResult.primaryLegalRemedy,
      docResult.processedDocuments.map(d => d.id)
    );
    const safetyResult = safetyEnvelope.result;
    const rewrittenCount = safetyResult.auditLog.filter(a => a.wasRewritten).length;
    if (rewrittenCount > 0) {
      revisionCyclesRun += 1;
    }

    logs.push({
      agentName: 'Safety Verification Agent',
      status: 'completed',
      executionTimeMs: Math.round(performance.now() - t8),
      summary: `Audited ${safetyResult.auditLog.length} statements (${rewrittenCount} rewritten for non-definitive informational tone)`
    });

    // Step 10: Compile Evidence Graph
    const graph = new EvidenceGraph();

    // Add Claim node
    graph.addNode({
      id: 'claim-user-narrative',
      type: 'claim',
      label: 'User Initial Narrative',
      content: input.userStory,
      confidence: 1.0
    });

    // Add Document nodes & edges
    docResult.processedDocuments.forEach(doc => {
      graph.addNode({
        id: doc.id,
        type: 'doc',
        label: doc.title,
        content: doc.relevanceSummary || doc.title,
        confidence: doc.confidenceScore || 0.95
      });
      graph.addEdge(doc.id, 'claim-user-narrative', 'supports');
    });

    // Add Fact nodes & edges
    safetyResult.verifiedFacts.forEach(fact => {
      graph.addNode({
        id: fact.id,
        type: 'fact',
        label: fact.category.toUpperCase(),
        content: fact.statement,
        confidence: fact.confidence
      });
      if (fact.sourceDocId) {
        graph.addEdge(fact.id, fact.sourceDocId, 'evidenced_by');
      }
    });

    // Add Statute nodes
    retrievalResult.applicableStatutes.forEach((stat, idx) => {
      const sId = `statute-node-${idx + 1}`;
      graph.addNode({
        id: sId,
        type: 'statute',
        label: `${stat.statute} (${stat.section})`,
        content: stat.applicabilityNote,
        confidence: 0.98
      });
    });

    // Add Risk nodes & edges
    riskResult.risks.forEach(risk => {
      graph.addNode({
        id: risk.id,
        type: 'risk',
        label: risk.title,
        content: risk.description,
        confidence: 0.9
      });
      graph.addEdge(risk.id, 'claim-user-narrative', 'derives_from');
    });

    // Add Action nodes & edges
    actionResult.actionPlan.forEach(act => {
      graph.addNode({
        id: act.id,
        type: 'action',
        label: act.title,
        content: act.description,
        confidence: 0.92
      });
    });

    // Add Draft nodes & edges
    draftResult.drafts.forEach(draft => {
      graph.addNode({
        id: draft.id,
        type: 'draft',
        label: `${draft.title} (${draft.communicationTier})`,
        content: draft.subject,
        confidence: 0.95
      });
    });

    // Step 11: Dynamic Escalation Matching
    const escalationRoutes = EscalationMatcher.matchRoutes(
      intakeResult.detectedCategory,
      input.locationState,
      intakeResult.claimAmount
    );

    // Merge existing answers if re-analyzed
    let finalMissingInfo = riskResult.missingInformation;
    if (input.existingMissingInformation) {
      finalMissingInfo = finalMissingInfo.map(m => {
        const existing = input.existingMissingInformation?.find(ex => ex.id === m.id);
        return existing && existing.isAnswered ? { ...m, isAnswered: true, answer: existing.answer } : m;
      });
    }

    // Assemble final updated Matter state
    const updatedMatter: Matter = {
      id: input.matterId,
      title: intakeResult.refinedTitle,
      category: intakeResult.detectedCategory,
      subCategory: intakeResult.detectedSubCategory,
      status: 'action_ready',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      locationCity: input.locationCity,
      locationState: input.locationState,
      claimAmount: intakeResult.claimAmount,
      userStory: input.userStory,
      parties: intakeResult.extractedParties,
      documents: docResult.processedDocuments,
      summary: {
        plainLanguage: intakeResult.plainLanguageSummary,
        keyConflict: intakeResult.keyConflict,
        legalNature: intakeResult.legalNature
      },
      facts: safetyResult.verifiedFacts,
      timelineEvents: timelineResult.timelineEvents,
      risks: riskResult.risks,
      missingInformation: finalMissingInfo,
      actionPlan: actionResult.actionPlan,
      drafts: draftResult.drafts,
      escalationRoutes,
      lawyerBrief: draftResult.lawyerBrief,
      trustSafetyItems: safetyResult.trustSafetyItems,
      evidenceGraph: graph.toJSON()
    };

    return {
      matter: updatedMatter,
      logs,
      revisionCyclesRun
    };
  }
}
