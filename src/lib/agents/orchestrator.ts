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
import { Matter, EscalationRoute } from '@/types/matter';
import { LEGAL_AID_DIRECTORY } from '@/lib/legal/indian-jurisdictions';

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
   * Executes the full NyaySaathi loop:
   * CAPTURE -> UNDERSTAND -> ASSESS -> ACT -> ESCALATE
   */
  public async processMatter(input: AgentInput): Promise<PipelineExecutionResult> {
    const logs: PipelineExecutionResult['logs'] = [];

    // Step 1: Intake & Entity Normalization
    const t0 = performance.now();
    const intakeResult = await this.intakeAgent.execute(input);
    logs.push({
      agentName: 'Intake Agent',
      status: 'completed',
      executionTimeMs: Math.round(performance.now() - t0),
      summary: `Extracted ${intakeResult.extractedParties.length} parties, category: ${intakeResult.detectedCategory}`
    });

    // Step 2: Document Intelligence
    const t1 = performance.now();
    const docResult = await this.docIntelAgent.execute(input);
    logs.push({
      agentName: 'Document Intelligence Agent',
      status: 'completed',
      executionTimeMs: Math.round(performance.now() - t1),
      summary: `Classified ${docResult.processedDocuments.length} evidence items and extracted ${docResult.extractedFacts.length} core facts`
    });

    // Step 3: Chronology & Timeline
    const t2 = performance.now();
    const timelineResult = await this.timelineAgent.execute(input, docResult);
    logs.push({
      agentName: 'Context & Timeline Agent',
      status: 'completed',
      executionTimeMs: Math.round(performance.now() - t2),
      summary: `Constructed ${timelineResult.timelineEvents.length} chronological milestones, identified ${timelineResult.identifiedGaps.length} gaps`
    });

    // Step 4: Statutory Retrieval
    const t3 = performance.now();
    const retrievalResult = await this.retrievalAgent.execute(input);
    logs.push({
      agentName: 'Legal Retrieval Agent',
      status: 'completed',
      executionTimeMs: Math.round(performance.now() - t3),
      summary: `Retrieved ${retrievalResult.applicableStatutes.length} statutory provisions under Indian law`
    });

    // Step 5: Reasoning & Merits Evaluation
    const t4 = performance.now();
    const reasoningResult = await this.reasoningAgent.execute(input);
    logs.push({
      agentName: 'Reasoning Agent',
      status: 'completed',
      executionTimeMs: Math.round(performance.now() - t4),
      summary: `Identified ${reasoningResult.caseStrengths.length} strengths and ${reasoningResult.caseWeaknesses.length} potential counter-arguments`
    });

    // Step 6: Risk Assessment
    const t5 = performance.now();
    const riskResult = await this.riskAgent.execute(input);
    logs.push({
      agentName: 'Risk Assessment Agent',
      status: 'completed',
      executionTimeMs: Math.round(performance.now() - t5),
      summary: `Calculated ${riskResult.risks.length} risk vectors and ${riskResult.missingInformation.length} missing evidence items`
    });

    // Step 7: Action Planning
    const t6 = performance.now();
    const actionResult = await this.actionPlannerAgent.execute(input);
    logs.push({
      agentName: 'Action Planner Agent',
      status: 'completed',
      executionTimeMs: Math.round(performance.now() - t6),
      summary: `Formulated ${actionResult.actionPlan.length} phased action steps (0-48h, 14d, Escalation)`
    });

    // Step 8: Drafting & Advocate Briefing
    const t7 = performance.now();
    const draftResult = await this.draftingAgent.execute(
      input,
      intakeResult.extractedParties,
      timelineResult.timelineEvents
    );
    logs.push({
      agentName: 'Drafting Agent',
      status: 'completed',
      executionTimeMs: Math.round(performance.now() - t7),
      summary: `Generated ${draftResult.drafts.length} formal legal notice/complaint drafts and 1-page advocate brief`
    });

    // Step 9: Trust & Safety Verification
    const t8 = performance.now();
    const safetyResult = await this.safetyAgent.execute(
      input,
      docResult.extractedFacts,
      reasoningResult.caseStrengths,
      reasoningResult.caseWeaknesses,
      reasoningResult.primaryLegalRemedy
    );
    logs.push({
      agentName: 'Safety Verification Agent',
      status: 'completed',
      executionTimeMs: Math.round(performance.now() - t8),
      summary: `Enforced 4-tier separation: ${safetyResult.trustSafetyItems.length} items categorized`
    });

    // Step 10: Compile Escalation Routes based on Indian Directory
    const escalationRoutes: EscalationRoute[] = LEGAL_AID_DIRECTORY.map((dir, idx) => ({
      id: `esc-${idx + 1}`,
      name: dir.name,
      type: idx === 0 ? 'nalsa_dlsa' : idx === 1 ? 'consumer_forum_edaakhil' : idx === 2 ? 'cybercell_1930' : idx === 3 ? 'rera' : 'labour_commissioner',
      description: dir.description,
      criteriaMet: true,
      eligibilityDescription: dir.eligibility,
      officialPortalUrl: dir.portalUrl,
      tollFreeNumber: dir.tollFree,
      stepsToApply: [
        'Organize your NyaySaathi Lawyer Brief & Evidence Locker',
        `Visit ${dir.portalUrl} or dial toll-free ${dir.tollFree}`,
        'Submit the generated complaint/grievance draft with supporting documents'
      ],
      costEstimate: 'Free of Cost / Nominal Government Stamp'
    }));

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
      missingInformation: riskResult.missingInformation,
      actionPlan: actionResult.actionPlan,
      drafts: draftResult.drafts,
      escalationRoutes,
      lawyerBrief: draftResult.lawyerBrief,
      trustSafetyItems: safetyResult.trustSafetyItems
    };

    return {
      matter: updatedMatter,
      logs
    };
  }
}
