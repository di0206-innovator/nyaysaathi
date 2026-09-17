import { AgentInput, PipelineExecutionResult, ReanalysisTrigger } from './types';
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
   * Executes the NyaySaathi loop with selective layer re-analysis and Evidence Graph Enforcement:
   * - doc_uploaded: Rerun DocIntel -> Timeline -> Risk -> Action -> Drafting -> Safety
   * - missing_info_answered: Rerun Risk -> Action -> Drafting -> Safety
   * - party_updated / amount_updated: Rerun Drafting -> Escalation -> Safety
   * - full: Rerun all layers
   * Safety ALWAYS runs last.
   */
  public async processMatter(input: AgentInput): Promise<PipelineExecutionResult> {
    const logs: PipelineExecutionResult['logs'] = [];
    let revisionCyclesRun = 0;
    const trigger = input.trigger || 'full';

    // Execution flags based on selective trigger
    const shouldRunDocIntel = trigger === 'full' || trigger === 'doc_uploaded';
    const shouldRunTimeline = trigger === 'full' || trigger === 'doc_uploaded';
    const shouldRunRetrieval = trigger === 'full';
    const shouldRunReasoning = trigger === 'full' || trigger === 'doc_uploaded';
    const shouldRunRisk = trigger === 'full' || trigger === 'doc_uploaded' || trigger === 'missing_info_answered';
    const shouldRunAction = trigger === 'full' || trigger === 'doc_uploaded' || trigger === 'missing_info_answered';
    const shouldRunDrafting = trigger === 'full' || trigger === 'doc_uploaded' || trigger === 'missing_info_answered' || trigger === 'party_updated' || trigger === 'amount_updated';
    const shouldRunEscalation = trigger === 'full' || trigger === 'party_updated' || trigger === 'amount_updated';

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
    let docResult = {
      processedDocuments: input.documents,
      extractedFacts: input.existingFacts || []
    };
    if (shouldRunDocIntel) {
      const t1 = performance.now();
      const docEnvelope = await this.docIntelAgent.execute(input);
      docResult = docEnvelope.result;
      logs.push({
        agentName: 'Document Intelligence Agent',
        status: 'completed',
        executionTimeMs: Math.round(performance.now() - t1),
        summary: `Processed ${docResult.processedDocuments.length} evidence items and extracted ${docResult.extractedFacts.length} grounded facts`
      });
    } else {
      logs.push({
        agentName: 'Document Intelligence Agent',
        status: 'skipped',
        executionTimeMs: 0,
        summary: `Skipped re-parsing ${docResult.processedDocuments.length} documents (Trigger: ${trigger})`
      });
    }

    // Step 3: Chronology & Timeline
    let timelineResult = {
      timelineEvents: input.existingTimelineEvents || [],
      identifiedGaps: [] as string[]
    };
    if (shouldRunTimeline) {
      const t2 = performance.now();
      const timelineEnvelope = await this.timelineAgent.execute(input, docResult);
      timelineResult = timelineEnvelope.result;
      logs.push({
        agentName: 'Context & Timeline Agent',
        status: 'completed',
        executionTimeMs: Math.round(performance.now() - t2),
        summary: `Constructed ${timelineResult.timelineEvents.length} chronological milestones, identified ${timelineResult.identifiedGaps.length} gaps`
      });
    } else {
      logs.push({
        agentName: 'Context & Timeline Agent',
        status: 'skipped',
        executionTimeMs: 0,
        summary: `Preserved existing ${timelineResult.timelineEvents.length} milestones (Trigger: ${trigger})`
      });
    }

    // Step 4: Statutory Retrieval (Multi-factor)
    let retrievalResult = {
      applicableStatutes: input.existingStatutes || []
    };
    if (shouldRunRetrieval) {
      const t3 = performance.now();
      const retrievalEnvelope = await this.retrievalAgent.execute(input);
      retrievalResult = retrievalEnvelope.result;
      logs.push({
        agentName: 'Legal Retrieval Agent',
        status: 'completed',
        executionTimeMs: Math.round(performance.now() - t3),
        summary: `Matched ${retrievalResult.applicableStatutes.length} statutory provisions under Indian law`
      });
    } else {
      logs.push({
        agentName: 'Legal Retrieval Agent',
        status: 'skipped',
        executionTimeMs: 0,
        summary: `Cached ${retrievalResult.applicableStatutes.length} statutes (Trigger: ${trigger})`
      });
    }

    // Step 5: Reasoning & Merits Evaluation
    let reasoningResult = {
      caseStrengths: [] as string[],
      caseWeaknesses: [] as string[],
      primaryLegalRemedy: 'Seek formal settlement followed by appropriate statutory forum filing.',
      counterPartyProbableDefense: 'Opposing party may contest liability or assert lack of documentation.'
    };
    if (shouldRunReasoning || reasoningResult.caseStrengths.length === 0) {
      const t4 = performance.now();
      const reasoningEnvelope = await this.reasoningAgent.execute(
        input,
        docResult.extractedFacts,
        retrievalResult.applicableStatutes
      );
      reasoningResult = reasoningEnvelope.result;
      logs.push({
        agentName: 'Reasoning Agent',
        status: 'completed',
        executionTimeMs: Math.round(performance.now() - t4),
        summary: `Identified ${reasoningResult.caseStrengths.length} strengths and ${reasoningResult.caseWeaknesses.length} potential counter-arguments`
      });
    } else {
      logs.push({
        agentName: 'Reasoning Agent',
        status: 'skipped',
        executionTimeMs: 0,
        summary: `Preserved merits evaluation (Trigger: ${trigger})`
      });
    }

    // Step 6: Risk Assessment
    let riskResult = {
      risks: input.existingRisks || [],
      missingInformation: input.existingMissingInformation || []
    };
    if (shouldRunRisk || riskResult.risks.length === 0) {
      const t5 = performance.now();
      const riskEnvelope = await this.riskAgent.execute(input, docResult.extractedFacts);
      riskResult = riskEnvelope.result;
      logs.push({
        agentName: 'Risk Assessment Agent',
        status: 'completed',
        executionTimeMs: Math.round(performance.now() - t5),
        summary: `Calculated ${riskResult.risks.length} risk vectors and ${riskResult.missingInformation.length} missing evidence items`
      });
    } else {
      logs.push({
        agentName: 'Risk Assessment Agent',
        status: 'skipped',
        executionTimeMs: 0,
        summary: `Preserved existing risk matrix (Trigger: ${trigger})`
      });
    }

    // Step 7: Action Planning
    let actionResult = {
      actionPlan: input.existingActionPlan || []
    };
    if (shouldRunAction || actionResult.actionPlan.length === 0) {
      const t6 = performance.now();
      const actionEnvelope = await this.actionPlannerAgent.execute(
        input,
        riskResult.risks.map(r => r.id)
      );
      actionResult = actionEnvelope.result;
      logs.push({
        agentName: 'Action Planner Agent',
        status: 'completed',
        executionTimeMs: Math.round(performance.now() - t6),
        summary: `Formulated ${actionResult.actionPlan.length} phased action steps (0-48h, 14d, Escalation)`
      });
    } else {
      logs.push({
        agentName: 'Action Planner Agent',
        status: 'skipped',
        executionTimeMs: 0,
        summary: `Preserved action plan (Trigger: ${trigger})`
      });
    }

    // Step 8: Drafting & Advocate Briefing (3-tier drafting)
    let draftResult = {
      drafts: input.existingDrafts || [],
      lawyerBrief: undefined as Matter['lawyerBrief']
    };
    if (shouldRunDrafting || draftResult.drafts.length === 0) {
      const t7 = performance.now();
      const draftEnvelope = await this.draftingAgent.execute(
        input,
        intakeResult.extractedParties,
        timelineResult.timelineEvents
      );
      draftResult = draftEnvelope.result;
      logs.push({
        agentName: 'Drafting Agent',
        status: 'completed',
        executionTimeMs: Math.round(performance.now() - t7),
        summary: `Generated ${draftResult.drafts.length} drafts (Soft, Formal, Notice) and 1-page advocate brief`
      });
    } else {
      logs.push({
        agentName: 'Drafting Agent',
        status: 'skipped',
        executionTimeMs: 0,
        summary: `Preserved existing drafts (Trigger: ${trigger})`
      });
    }

    // Step 9: Trust & Safety Verification + Revision Review Loop (ALWAYS RUNS LAST)
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

    // Step 10: Compile Normalized Evidence Graph
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
      if (docResult.processedDocuments.length > 0) {
        graph.addEdge(docResult.processedDocuments[0].id, risk.id, 'supports');
      }
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
      if (riskResult.risks.length > 0) {
        graph.addEdge(act.id, riskResult.risks[0].id, 'mitigates');
      }
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
    let escalationRoutes = input.parties ? EscalationMatcher.matchRoutes(
      intakeResult.detectedCategory,
      input.locationState,
      intakeResult.claimAmount
    ) : [];

    if (shouldRunEscalation || escalationRoutes.length === 0) {
      escalationRoutes = EscalationMatcher.matchRoutes(
        intakeResult.detectedCategory,
        input.locationState,
        intakeResult.claimAmount
      );
    }

    // Step 12: Active Evidence Enforcement Across All Output Entities
    // Enforce grounding status and downgrade ungrounded certainty
    const enforcedRisks = riskResult.risks.map(risk => {
      const status = graph.getNodeGroundingStatus(risk.id);
      return {
        ...risk,
        groundingStatus: status,
        // Downgrade critical severity if unsupported
        severity: status === 'unsupported' && risk.severity === 'critical' ? 'medium' : risk.severity
      };
    });

    const enforcedActionPlan = actionResult.actionPlan.map(act => {
      const status = graph.getNodeGroundingStatus(act.id);
      return {
        ...act,
        groundingStatus: status,
        priority: status === 'unsupported' && act.priority === 'must_do' ? 'recommended' : act.priority
      };
    });

    const enforcedDrafts = draftResult.drafts.map(draft => {
      const status = graph.getNodeGroundingStatus(draft.id);
      return {
        ...draft,
        groundingStatus: status
      };
    });

    const enforcedEscalations = escalationRoutes.map(esc => ({
      ...esc,
      groundingStatus: 'grounded' as const,
      groundingRefIds: [`cat-${intakeResult.detectedCategory}`]
    }));

    // Step 13: Aggregate System-Wide Safety Audit Trail
    const consolidatedAuditLog: Matter['auditLog'] = [];

    // From Safety Verification
    safetyResult.auditLog.forEach(entry => {
      if (entry.wasRewritten) {
        consolidatedAuditLog.push({
          original: entry.statement,
          rewritten: entry.revisedText || entry.statement,
          reason: `Safety Agent classified as ${entry.tier}; softened to informational legal language.`,
          timestamp: new Date().toISOString(),
          component: 'TrustSafety'
        });
      }
    });

    // From Draft Audits
    enforcedDrafts.forEach(draft => {
      if (draft.auditLog) {
        draft.auditLog.forEach(entry => {
          consolidatedAuditLog.push({
            original: entry.original,
            rewritten: entry.rewritten,
            reason: `${draft.title}: ${entry.reason}`,
            timestamp: entry.timestamp,
            component: 'DraftStudio'
          });
        });
      }
    });

    // Step 14: Merge existing answers and missing evidence prompts
    let finalMissingInfo = [...riskResult.missingInformation];
    if (input.existingMissingInformation) {
      finalMissingInfo = finalMissingInfo.map(m => {
        const existing = input.existingMissingInformation?.find(ex => ex.id === m.id);
        return existing && existing.isAnswered ? { ...m, isAnswered: true, answer: existing.answer } : m;
      });
    }

    // Auto-generate missing evidence prompts from graph if gaps are found
    const missingPrompts = graph.getMissingEvidencePrompts();
    missingPrompts.forEach((prompt, idx) => {
      const exists = finalMissingInfo.some(m => m.question.includes(prompt.label));
      if (!exists && finalMissingInfo.length < 5) {
        finalMissingInfo.push({
          id: `missing-gap-${idx + 1}`,
          question: prompt.missingPrompt,
          whyItMatters: `Required to convert "${prompt.label}" from an unverified possibility into an enforceable legal right.`,
          impactOnOutcome: 'critical',
          suggestedSource: prompt.recommendedDocumentType,
          isAnswered: false,
          groundingRefIds: [prompt.nodeId]
        });
      }
    });

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
      risks: enforcedRisks,
      missingInformation: finalMissingInfo,
      actionPlan: enforcedActionPlan,
      drafts: enforcedDrafts,
      escalationRoutes: enforcedEscalations,
      lawyerBrief: draftResult.lawyerBrief,
      trustSafetyItems: safetyResult.trustSafetyItems,
      evidenceGraph: graph.toJSON(),
      auditLog: consolidatedAuditLog,
      language: 'en'
    };

    return {
      matter: updatedMatter,
      logs,
      revisionCyclesRun
    };
  }

  /**
   * Helper method to execute pipeline with a Matter object and trigger.
   */
  public async executePipeline(
    matter: Matter,
    options?: { trigger?: ReanalysisTrigger }
  ): Promise<{ matter: Matter; agentResults: Array<{ agentName: string; status: 'completed' | 'skipped' | 'fallback'; executionTimeMs: number; summary: string }> }> {
    const input: AgentInput = {
      matterId: matter.id,
      title: matter.title,
      category: matter.category,
      userStory: matter.userStory,
      parties: matter.parties,
      documents: matter.documents,
      locationCity: matter.locationCity,
      locationState: matter.locationState,
      claimAmount: matter.claimAmount,
      existingFacts: matter.facts,
      existingTimelineEvents: matter.timelineEvents,
      trigger: options?.trigger || 'full'
    };

    const res = await this.processMatter(input);
    return {
      matter: res.matter,
      agentResults: res.logs
    };
  }
}

export const Orchestrator = MatterOrchestrator;

