import { Matter, Party, DocumentEvidence, ExtractedFact, TimelineEvent, RiskItem, MissingInformation, ActionStep, LegalDraft, LawyerBrief, TrustSafetyItem, MatterCategory } from '@/types/matter';

export interface AgentInput {
  matterId: string;
  title: string;
  category: MatterCategory;
  userStory: string;
  parties: Party[];
  documents: DocumentEvidence[];
  locationCity?: string;
  locationState?: string;
  claimAmount?: number;
}

export interface IntakeAgentResult {
  refinedTitle: string;
  detectedCategory: MatterCategory;
  detectedSubCategory: string;
  extractedParties: Party[];
  claimAmount?: number;
  plainLanguageSummary: string;
  keyConflict: string;
  legalNature: string;
}

export interface DocIntelAgentResult {
  processedDocuments: DocumentEvidence[];
  extractedFacts: ExtractedFact[];
}

export interface TimelineAgentResult {
  timelineEvents: TimelineEvent[];
  identifiedGaps: string[];
}

export interface LegalRetrievalAgentResult {
  applicableStatutes: Array<{
    statute: string;
    section: string;
    title: string;
    applicabilityNote: string;
    limitationMonths?: number;
    forum: string;
  }>;
}

export interface ReasoningAgentResult {
  caseStrengths: string[];
  caseWeaknesses: string[];
  primaryLegalRemedy: string;
  counterPartyProbableDefense: string;
}

export interface RiskAgentResult {
  risks: RiskItem[];
  missingInformation: MissingInformation[];
}

export interface ActionPlannerAgentResult {
  actionPlan: ActionStep[];
}

export interface DraftingAgentResult {
  drafts: LegalDraft[];
  lawyerBrief: LawyerBrief;
}

export interface SafetyVerificationAgentResult {
  verifiedFacts: ExtractedFact[];
  trustSafetyItems: TrustSafetyItem[];
  isSafeForInformationalDisplay: boolean;
  mandatoryDisclaimers: string[];
}

export interface PipelineExecutionResult {
  matter: Matter;
  logs: Array<{
    agentName: string;
    status: 'completed' | 'skipped' | 'fallback';
    executionTimeMs: number;
    summary: string;
  }>;
}
