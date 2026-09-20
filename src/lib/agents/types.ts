import {
  Matter,
  Party,
  DocumentEvidence,
  ExtractedFact,
  TimelineEvent,
  RiskItem,
  MissingInformation,
  ActionStep,
  LegalDraft,
  LawyerBrief,
  TrustSafetyItem,
  MatterCategory,
  EvidenceGraphData
} from '@/types/matter';

export interface SourceReference {
  id: string;
  type: 'claim' | 'doc' | 'fact' | 'statute' | 'event';
  label: string;
  excerpt?: string;
}

export interface SafetyFlag {
  severity: 'info' | 'warning' | 'critical';
  code: string;
  message: string;
}

export interface AgentMemoryEnvelope<T> {
  result: T;
  confidenceScore: number;
  evidenceState?:
    | 'verified'
    | 'supported'
    | 'partially_supported'
    | 'unresolved'
    | 'conflicting'
    | 'unsupported'
    | 'counsel_required';
  sourceReferences: SourceReference[];
  assumptions: string[];
  unresolvedQuestions: string[];
  safetyFlags: SafetyFlag[];
}

export type ReanalysisTrigger =
  | 'full'
  | 'missing_info_answered'
  | 'doc_uploaded'
  | 'party_updated'
  | 'amount_updated'
  | 'action_completed'
  | 'communication_recorded'
  | 'external_response_recorded'
  | 'deadline_changed'
  | 'payment_recorded'
  | 'resolution_recorded';

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
  existingMissingInformation?: MissingInformation[];
  existingEvidenceGraph?: EvidenceGraphData;
  existingFacts?: ExtractedFact[];
  existingTimelineEvents?: TimelineEvent[];
  existingStatutes?: Array<{ statute: string; section: string; title: string; applicabilityNote: string }>;
  existingRisks?: RiskItem[];
  existingActionPlan?: ActionStep[];
  existingDrafts?: LegalDraft[];
  existingMatter?: Matter;
  trigger?: ReanalysisTrigger;
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
    matchScore?: number;
    matchReason?: string;
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
  auditLog: Array<{
    statement: string;
    revisedText?: string;
    tier: string;
    wasRewritten: boolean;
  }>;
}

export interface PipelineExecutionResult {
  matter: Matter;
  logs: Array<{
    agentName: string;
    status: 'completed' | 'skipped' | 'fallback' | 'failed';
    executionTimeMs: number;
    summary: string;
  }>;
  revisionCyclesRun: number;
}
