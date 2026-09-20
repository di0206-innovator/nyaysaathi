import {
  AgentInput,
  PipelineExecutionResult,
  ReanalysisTrigger,
  IntakeAgentResult,
  SafetyVerificationAgentResult
} from './types';
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
import { Metrics } from '@/lib/observability/metrics';
import { matterBudget } from './cost-budget';

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
   * Executes the NyaySaathi pipeline as an explicit Directed Acyclic Graph (DAG):
   *
   * LEVEL 1 (Independent Ingestion):
   *   IntakeAgent || DocIntelAgent
   *
   * LEVEL 2 (Context & Law):
   *   TimelineAgent (needs DocIntel) || LegalRetrievalAgent (needs Input)
   *
   * LEVEL 3 (Merits & Risk):
   *   ReasoningAgent (needs Facts + Law) || RiskAgent (needs Facts)
   *
   * LEVEL 4 (Strategy):
   *   ActionPlannerAgent (needs Risks)
   *
   * LEVEL 5 (Resolution Generation):
   *   DraftingAgent (needs Parties + Timeline) || EscalationMatcher (needs Category + Claim)
   *
   * LEVEL 6 (Verification & Guardrails - ALWAYS RUNS LAST):
   *   SafetyVerificationAgent (audits all outputs)
   */
  public async processMatter(input: AgentInput): Promise<PipelineExecutionResult> {
    const matterId = input.matterId || input.existingMatter?.id || 'ephemeral-matter';
    const budgetCheck = matterBudget.checkBudget(matterId, 'requests', 1);
    if (!budgetCheck.allowed) {
      throw new Error(`BudgetExceeded: ${budgetCheck.reason}`);
    }
    matterBudget.recordUsage(matterId, 'requests', 1);

    const logs: PipelineExecutionResult['logs'] = [];
    let revisionCyclesRun = 0;
    const trigger = input.trigger || 'full';

    // Execution flags based on selective trigger
    const shouldRunDocIntel = trigger === 'full' || trigger === 'doc_uploaded';
    const shouldRunTimeline = trigger === 'full' || trigger === 'doc_uploaded' || trigger === 'communication_recorded' || trigger === 'action_completed';
    const shouldRunRetrieval = trigger === 'full' || trigger === 'external_response_recorded';
    const shouldRunReasoning = trigger === 'full' || trigger === 'doc_uploaded' || trigger === 'external_response_recorded';
    const shouldRunRisk =
      trigger === 'full' ||
      trigger === 'doc_uploaded' ||
      trigger === 'missing_info_answered' ||
      trigger === 'action_completed' ||
      trigger === 'communication_recorded' ||
      trigger === 'external_response_recorded' ||
      trigger === 'payment_recorded' ||
      trigger === 'deadline_changed';
    const shouldRunAction =
      trigger === 'full' ||
      trigger === 'doc_uploaded' ||
      trigger === 'missing_info_answered' ||
      trigger === 'action_completed' ||
      trigger === 'communication_recorded' ||
      trigger === 'external_response_recorded' ||
      trigger === 'payment_recorded' ||
      trigger === 'resolution_recorded' ||
      trigger === 'deadline_changed';
    const shouldRunDrafting =
      trigger === 'full' ||
      trigger === 'doc_uploaded' ||
      trigger === 'missing_info_answered' ||
      trigger === 'party_updated' ||
      trigger === 'amount_updated' ||
      trigger === 'external_response_recorded';
    const shouldRunEscalation =
      trigger === 'full' ||
      trigger === 'party_updated' ||
      trigger === 'amount_updated' ||
      trigger === 'action_completed' ||
      trigger === 'external_response_recorded';

    // -------------------------------------------------------------
    // DAG LEVEL 1: Independent Ingestion (Intake || DocIntel)
    // -------------------------------------------------------------
    let intakeResult: IntakeAgentResult;
    let docResult = {
      processedDocuments: input.documents,
      extractedFacts: input.existingFacts || []
    };

    const intakePromise = (async () => {
      const t0 = performance.now();
      try {
        const intakeEnvelope = await this.intakeAgent.execute(input);
        return {
          ok: true as const,
          data: intakeEnvelope.result,
          timeMs: Math.round(performance.now() - t0),
          summary: `Normalized ${intakeEnvelope.result.extractedParties.length} parties, category: ${intakeEnvelope.result.detectedCategory} (Confidence: ${intakeEnvelope.confidenceScore}, Trigger: ${trigger})`
        };
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        return {
          ok: false as const,
          error: errMsg,
          timeMs: Math.round(performance.now() - t0),
          fallback: {
            refinedTitle: input.title,
            detectedCategory: input.category,
            detectedSubCategory: 'General Legal Dispute',
            extractedParties: input.parties,
            claimAmount: input.claimAmount,
            plainLanguageSummary: (input.userStory || input.title || '').slice(0, 200),
            keyConflict: 'Dispute identified from initial story narrative',
            legalNature: 'Civil / Statutory grievance under evaluation'
          }
        };
      }
    })();

    const docIntelPromise = (async () => {
      if (!shouldRunDocIntel) {
        return { skipped: true as const, timeMs: 0 };
      }
      const t1 = performance.now();
      try {
        const docEnvelope = await this.docIntelAgent.execute(input);
        return {
          skipped: false as const,
          ok: true as const,
          data: docEnvelope.result,
          timeMs: Math.round(performance.now() - t1),
          summary: `Processed ${docEnvelope.result.processedDocuments.length} evidence items and extracted ${docEnvelope.result.extractedFacts.length} grounded facts`
        };
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        return {
          skipped: false as const,
          ok: false as const,
          error: errMsg,
          timeMs: Math.round(performance.now() - t1)
        };
      }
    })();

    const [intakeExec, docExec] = await Promise.all([intakePromise, docIntelPromise]);

    if (intakeExec.ok) {
      intakeResult = intakeExec.data;
      logs.push({
        agentName: 'Intake Agent',
        status: 'completed',
        executionTimeMs: intakeExec.timeMs,
        summary: intakeExec.summary
      });
    } else {
      intakeResult = intakeExec.fallback;
      logs.push({
        agentName: 'Intake Agent',
        status: 'failed',
        executionTimeMs: intakeExec.timeMs,
        summary: `Intake Agent failed: ${intakeExec.error}. Retained raw narrative.`
      });
    }

    if (docExec.skipped) {
      logs.push({
        agentName: 'Document Intelligence Agent',
        status: 'skipped',
        executionTimeMs: 0,
        summary: `Skipped re-parsing ${docResult.processedDocuments.length} documents (Trigger: ${trigger})`
      });
    } else if (docExec.ok) {
      docResult = docExec.data;
      logs.push({
        agentName: 'Document Intelligence Agent',
        status: 'completed',
        executionTimeMs: docExec.timeMs,
        summary: docExec.summary
      });
    } else {
      logs.push({
        agentName: 'Document Intelligence Agent',
        status: 'failed',
        executionTimeMs: docExec.timeMs,
        summary: `Document Intelligence error: ${docExec.error}. Retained ${docResult.extractedFacts.length} existing facts.`
      });
    }

    // -------------------------------------------------------------
    // DAG LEVEL 2: Context & Law (Timeline || Retrieval)
    // -------------------------------------------------------------
    let timelineResult = {
      timelineEvents: input.existingTimelineEvents || [],
      identifiedGaps: [] as string[]
    };
    let retrievalResult = {
      applicableStatutes: input.existingStatutes || []
    };

    const timelinePromise = (async () => {
      if (!shouldRunTimeline) {
        return { skipped: true as const, timeMs: 0 };
      }
      const t2 = performance.now();
      try {
        const timelineEnvelope = await this.timelineAgent.execute(input, docResult);
        return {
          skipped: false as const,
          ok: true as const,
          data: timelineEnvelope.result,
          timeMs: Math.round(performance.now() - t2),
          summary: `Constructed ${timelineEnvelope.result.timelineEvents.length} chronological milestones, identified ${timelineEnvelope.result.identifiedGaps.length} gaps`
        };
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        return {
          skipped: false as const,
          ok: false as const,
          error: errMsg,
          timeMs: Math.round(performance.now() - t2)
        };
      }
    })();

    const retrievalPromise = (async () => {
      if (!shouldRunRetrieval) {
        return { skipped: true as const, timeMs: 0 };
      }
      const t3 = performance.now();
      try {
        const retrievalEnvelope = await this.retrievalAgent.execute(input);
        return {
          skipped: false as const,
          ok: true as const,
          data: retrievalEnvelope.result,
          timeMs: Math.round(performance.now() - t3),
          summary: `Matched ${retrievalEnvelope.result.applicableStatutes.length} statutory provisions under Indian law`
        };
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        return {
          skipped: false as const,
          ok: false as const,
          error: errMsg,
          timeMs: Math.round(performance.now() - t3)
        };
      }
    })();

    const [timelineExec, retrievalExec] = await Promise.all([timelinePromise, retrievalPromise]);

    if (timelineExec.skipped) {
      logs.push({
        agentName: 'Context & Timeline Agent',
        status: 'skipped',
        executionTimeMs: 0,
        summary: `Preserved existing ${timelineResult.timelineEvents.length} milestones (Trigger: ${trigger})`
      });
    } else if (timelineExec.ok) {
      timelineResult = timelineExec.data;
      logs.push({
        agentName: 'Context & Timeline Agent',
        status: 'completed',
        executionTimeMs: timelineExec.timeMs,
        summary: timelineExec.summary
      });
    } else {
      logs.push({
        agentName: 'Context & Timeline Agent',
        status: 'failed',
        executionTimeMs: timelineExec.timeMs,
        summary: `Timeline reconstruction error: ${timelineExec.error}. Retained existing timeline events.`
      });
    }

    if (retrievalExec.skipped) {
      logs.push({
        agentName: 'Legal Retrieval Agent',
        status: 'skipped',
        executionTimeMs: 0,
        summary: `Cached ${retrievalResult.applicableStatutes.length} statutes (Trigger: ${trigger})`
      });
    } else if (retrievalExec.ok) {
      retrievalResult = retrievalExec.data;
      logs.push({
        agentName: 'Legal Retrieval Agent',
        status: 'completed',
        executionTimeMs: retrievalExec.timeMs,
        summary: retrievalExec.summary
      });
    } else {
      logs.push({
        agentName: 'Legal Retrieval Agent',
        status: 'failed',
        executionTimeMs: retrievalExec.timeMs,
        summary: `Statutory retrieval error: ${retrievalExec.error}. Retained cached statutory provisions.`
      });
    }

    // -------------------------------------------------------------
    // DAG LEVEL 3: Merits & Risk (Reasoning || Risk Assessment)
    // -------------------------------------------------------------
    let reasoningResult = {
      caseStrengths: [] as string[],
      caseWeaknesses: [] as string[],
      primaryLegalRemedy: 'Seek formal settlement followed by appropriate statutory forum filing.',
      counterPartyProbableDefense: 'Opposing party may contest liability or assert lack of documentation.'
    };
    let riskResult = {
      risks: input.existingRisks || [],
      missingInformation: input.existingMissingInformation || []
    };

    const reasoningPromise = (async () => {
      if (!shouldRunReasoning && reasoningResult.caseStrengths.length > 0) {
        return { skipped: true as const, timeMs: 0 };
      }
      const t4 = performance.now();
      try {
        const reasoningEnvelope = await this.reasoningAgent.execute(
          input,
          docResult.extractedFacts,
          retrievalResult.applicableStatutes
        );
        return {
          skipped: false as const,
          ok: true as const,
          data: reasoningEnvelope.result,
          timeMs: Math.round(performance.now() - t4),
          summary: `Identified ${reasoningEnvelope.result.caseStrengths.length} strengths and ${reasoningEnvelope.result.caseWeaknesses.length} potential counter-arguments`
        };
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        return {
          skipped: false as const,
          ok: false as const,
          error: errMsg,
          timeMs: Math.round(performance.now() - t4)
        };
      }
    })();

    const riskPromise = (async () => {
      if (!shouldRunRisk && riskResult.risks.length > 0) {
        return { skipped: true as const, timeMs: 0 };
      }
      const t5 = performance.now();
      try {
        const riskEnvelope = await this.riskAgent.execute(input, docResult.extractedFacts);
        return {
          skipped: false as const,
          ok: true as const,
          data: riskEnvelope.result,
          timeMs: Math.round(performance.now() - t5),
          summary: `Calculated ${riskEnvelope.result.risks.length} risk vectors and ${riskEnvelope.result.missingInformation.length} missing evidence items`
        };
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        return {
          skipped: false as const,
          ok: false as const,
          error: errMsg,
          timeMs: Math.round(performance.now() - t5)
        };
      }
    })();

    const [reasoningExec, riskExec] = await Promise.all([reasoningPromise, riskPromise]);

    if (reasoningExec.skipped) {
      logs.push({
        agentName: 'Reasoning Agent',
        status: 'skipped',
        executionTimeMs: 0,
        summary: `Preserved merits evaluation (Trigger: ${trigger})`
      });
    } else if (reasoningExec.ok) {
      reasoningResult = reasoningExec.data;
      logs.push({
        agentName: 'Reasoning Agent',
        status: 'completed',
        executionTimeMs: reasoningExec.timeMs,
        summary: reasoningExec.summary
      });
    } else {
      logs.push({
        agentName: 'Reasoning Agent',
        status: 'failed',
        executionTimeMs: reasoningExec.timeMs,
        summary: `Reasoning agent error: ${reasoningExec.error}. Defaulted to cautious evaluation.`
      });
    }

    if (riskExec.skipped) {
      logs.push({
        agentName: 'Risk Assessment Agent',
        status: 'skipped',
        executionTimeMs: 0,
        summary: `Preserved existing risk matrix (Trigger: ${trigger})`
      });
    } else if (riskExec.ok) {
      riskResult = riskExec.data;
      logs.push({
        agentName: 'Risk Assessment Agent',
        status: 'completed',
        executionTimeMs: riskExec.timeMs,
        summary: riskExec.summary
      });
    } else {
      logs.push({
        agentName: 'Risk Assessment Agent',
        status: 'failed',
        executionTimeMs: riskExec.timeMs,
        summary: `Risk assessment error: ${riskExec.error}. Preserved existing risks and questionnaire.`
      });
    }

    // -------------------------------------------------------------
    // DAG LEVEL 4: Action Planning (ActionPlannerAgent)
    // -------------------------------------------------------------
    let actionResult = {
      actionPlan: input.existingActionPlan || []
    };
    if (shouldRunAction || actionResult.actionPlan.length === 0) {
      const t6 = performance.now();
      try {
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
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        logs.push({
          agentName: 'Action Planner Agent',
          status: 'failed',
          executionTimeMs: Math.round(performance.now() - t6),
          summary: `Action planner error: ${errMsg}. Preserved prior action plan.`
        });
      }
    } else {
      logs.push({
        agentName: 'Action Planner Agent',
        status: 'skipped',
        executionTimeMs: 0,
        summary: `Preserved action plan (Trigger: ${trigger})`
      });
    }

    // -------------------------------------------------------------
    // DAG LEVEL 5: Drafting & Advocate Briefing (DraftingAgent)
    // -------------------------------------------------------------
    let draftResult = {
      drafts: input.existingDrafts || [],
      lawyerBrief: undefined as Matter['lawyerBrief']
    };
    if (shouldRunDrafting || draftResult.drafts.length === 0) {
      const t7 = performance.now();
      try {
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
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        logs.push({
          agentName: 'Drafting Agent',
          status: 'failed',
          executionTimeMs: Math.round(performance.now() - t7),
          summary: `Drafting agent error: ${errMsg}. Preserved prior drafts.`
        });
      }
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
    let safetyResult: SafetyVerificationAgentResult;
    try {
      const safetyEnvelope = await this.safetyAgent.execute(
        input,
        docResult.extractedFacts,
        reasoningResult.caseStrengths,
        reasoningResult.caseWeaknesses,
        reasoningResult.primaryLegalRemedy,
        docResult.processedDocuments.map(d => d.id)
      );
      safetyResult = safetyEnvelope.result;
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
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      safetyResult = {
        verifiedFacts: docResult.extractedFacts,
        trustSafetyItems: [],
        isSafeForInformationalDisplay: true,
        mandatoryDisclaimers: ['Legal Action Navigator guidance is informational only and does not constitute formal legal representation.'],
        auditLog: []
      };
      logs.push({
        agentName: 'Safety Verification Agent',
        status: 'failed',
        executionTimeMs: Math.round(performance.now() - t8),
        summary: `Safety verification error: ${errMsg}. Applied baseline legal safety disclaimers.`
      });
    }

    // Step 10: Compile Normalized Evidence Graph
    const graph = new EvidenceGraph(input.existingEvidenceGraph);

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
        confidence: doc.confidenceScore ?? (doc.extractionStatus === 'verified_extraction' ? 0.95 : 0.35)
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
        confidence: fact.confidence ?? (fact.verified ? 0.9 : 0.5)
      });
      if (fact.sourceDocId) {
        graph.addEdge(fact.id, fact.sourceDocId, 'evidenced_by');
      }
    });

    // Add Statute nodes
    retrievalResult.applicableStatutes.forEach((stat, idx) => {
      const sId = `statute-node-${idx + 1}`;
      const rawScore = (stat as { matchScore?: number }).matchScore;
      const statScore = typeof rawScore === 'number' ? Math.min(0.95, rawScore) : 0.8;
      graph.addNode({
        id: sId,
        type: 'statute',
        label: `${stat.statute} (${stat.section})`,
        content: stat.applicabilityNote,
        confidence: statScore
      });
    });

    // Add Risk nodes & edges
    riskResult.risks.forEach(risk => {
      const riskConf = risk.severity === 'critical' ? 0.9 : (risk.severity === 'high' ? 0.8 : 0.65);
      graph.addNode({
        id: risk.id,
        type: 'risk',
        label: risk.title,
        content: risk.description,
        confidence: riskConf
      });
      graph.addEdge(risk.id, 'claim-user-narrative', 'derives_from');
      if (docResult.processedDocuments.length > 0) {
        graph.addEdge(docResult.processedDocuments[0].id, risk.id, 'supports');
      }
    });

    // Add Action nodes & edges
    actionResult.actionPlan.forEach(act => {
      const actConf = act.priority === 'must_do' ? 0.9 : 0.75;
      graph.addNode({
        id: act.id,
        type: 'action',
        label: act.title,
        content: act.description,
        confidence: actConf
      });
      if (riskResult.risks.length > 0) {
        graph.addEdge(act.id, riskResult.risks[0].id, 'mitigates');
      }
    });

    // Add Draft nodes & edges
    draftResult.drafts.forEach(draft => {
      const draftConf = draft.groundingStatus === 'grounded' ? 0.9 : 0.65;
      graph.addNode({
        id: draft.id,
        type: 'draft',
        label: `${draft.title} (${draft.communicationTier})`,
        content: draft.subject,
        confidence: draftConf
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

    // Assemble final updated Matter state with strict boundary:
    // Recomputed Analytical State + Preserved Workflow State
    const baseMatter = input.existingMatter;

    // Merge recommended action plan while preserving user execution states
    const existingActionMap = new Map((input.existingActionPlan || baseMatter?.actionPlan || []).map(a => [a.id, a]));
    const mergedActionPlan = enforcedActionPlan.map(newStep => {
      const prev = existingActionMap.get(newStep.id) || (input.existingActionPlan || baseMatter?.actionPlan || []).find(a => a.title === newStep.title);
      if (prev) {
        return {
          ...newStep,
          status: prev.status || newStep.status,
          completedAt: prev.completedAt,
          completionProof: prev.completionProof,
          notes: prev.notes || newStep.notes,
          blockingReason: prev.blockingReason,
          result: prev.result || newStep.result,
          dueDate: prev.dueDate || newStep.dueDate
        };
      }
      return newStep;
    });

    const updatedMatter: Matter = {
      // 1. Immutable Identity & Workflow State (Preserved)
      id: baseMatter?.id || input.matterId || '',
      userId: baseMatter?.userId,
      createdAt: baseMatter?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: baseMatter?.status || 'action_ready',
      language: baseMatter?.language || 'en',

      // 2. Analytical State (Recomputed by Specialized Agents)
      title: intakeResult.refinedTitle || input.title,
      category: intakeResult.detectedCategory || input.category,
      subCategory: intakeResult.detectedSubCategory,
      locationCity: input.locationCity,
      locationState: input.locationState,
      claimAmount: intakeResult.claimAmount !== undefined ? intakeResult.claimAmount : input.claimAmount,
      userStory: input.userStory,
      parties: intakeResult.extractedParties && intakeResult.extractedParties.length > 0 ? intakeResult.extractedParties : input.parties,
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
      actionPlan: mergedActionPlan,
      drafts: enforcedDrafts,
      escalationRoutes: enforcedEscalations,
      lawyerBrief: draftResult.lawyerBrief,
      applicableStatutes: retrievalResult.applicableStatutes,
      trustSafetyItems: safetyResult.trustSafetyItems,
      evidenceGraph: graph.toJSON(),
      auditLog: consolidatedAuditLog,

      // 3. Persistent Workflow Collections (Never Overwritten by Analytical Loop)
      activityEvents: baseMatter?.activityEvents || [],
      communications: baseMatter?.communications || [],
      deadlines: baseMatter?.deadlines || [],
      escalationWorkflows: baseMatter?.escalationWorkflows || [],
      resolution: baseMatter?.resolution,
      notifications: baseMatter?.notifications || []
    };

    // Telemetry & Observability: Record duration and outcome for executed agents
    for (const log of logs) {
      if (log.status !== 'skipped') {
        Metrics.recordAgentLatency(log.agentName, log.executionTimeMs, log.status === 'completed');
      }
    }

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
  ): Promise<{
    matter: Matter;
    agentResults: Array<{ agentName: string; status: 'completed' | 'skipped' | 'fallback' | 'failed'; executionTimeMs: number; summary: string }>;
    logs: Array<{ agentName: string; status: 'completed' | 'skipped' | 'fallback' | 'failed'; executionTimeMs: number; summary: string }>;
  }> {
    const input: AgentInput = {
      matterId: matter.id,
      title: matter.title,
      category: matter.category,
      userStory: matter.userStory || (Array.isArray(matter.facts) ? matter.facts.map(f => f.statement).join('. ') : '') || '',
      parties: matter.parties,
      documents: matter.documents,
      locationCity: matter.locationCity,
      locationState: matter.locationState,
      claimAmount: matter.claimAmount,
      existingFacts: matter.facts,
      existingTimelineEvents: matter.timelineEvents,
      existingRisks: matter.risks,
      existingMissingInformation: matter.missingInformation,
      existingActionPlan: matter.actionPlan,
      existingDrafts: matter.drafts,
      existingStatutes: matter.applicableStatutes || matter.lawyerBrief?.statutoryReferences?.map(s => ({
        statute: s.statute,
        section: s.section || '',
        title: s.statute,
        applicabilityNote: s.applicability
      })),
      existingEvidenceGraph: matter.evidenceGraph,
      existingMatter: matter,
      trigger: options?.trigger || 'full'
    };

    const res = await this.processMatter(input);
    return {
      matter: res.matter,
      agentResults: res.logs,
      logs: res.logs
    };
  }
}

export const Orchestrator = MatterOrchestrator;

export async function executePipeline(input: AgentInput): Promise<Matter> {
  const orchestrator = new MatterOrchestrator();
  const res = await orchestrator.processMatter(input);
  return res.matter;
}

