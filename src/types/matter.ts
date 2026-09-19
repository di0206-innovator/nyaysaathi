export type MatterCategory =
  | 'tenancy_housing'
  | 'consumer_dispute'
  | 'workplace_employment'
  | 'financial_cheque_bounce'
  | 'property_rera'
  | 'family_matrimonial'
  | 'cyber_fraud'
  | 'police_criminal_grievance'
  | 'other';

export type MatterStatus =
  | 'intake_draft'
  | 'analyzing'
  | 'action_ready'
  | 'open'
  | 'awaiting_user_action'
  | 'awaiting_other_party'
  | 'awaiting_authority'
  | 'in_mediation'
  | 'in_progress'
  | 'escalated'
  | 'resolved'
  | 'closed';

export type TrustSafetyTier =
  | 'fact'
  | 'explanation'
  | 'possibility'
  | 'counsel_required'
  | 'unsupported';

export interface Party {
  id: string;
  name: string;
  role:
    | 'Aggrieved (You)'
    | 'Opposing Party'
    | 'Landlord'
    | 'Tenant'
    | 'Builder / Developer'
    | 'Employer'
    | 'Seller / Merchant'
    | 'Bank / Institution'
    | 'Witness'
    | 'Authority / Police';
  contactInfo?: string;
  address?: string;
  city?: string;
  state?: string;
}

export interface DocumentEvidence {
  id: string;
  title: string;
  type:
    | 'rental_agreement'
    | 'invoice_bill'
    | 'whatsapp_chat'
    | 'email_thread'
    | 'bank_statement'
    | 'cheque_copy'
    | 'police_complaint_fir'
    | 'employment_contract'
    | 'notice_copy'
    | 'photo_proof'
    | 'other';
  fileUrl?: string;
  fileSize?: string;
  uploadedAt: string;
  extractedText?: string;
  classification?: string;
  confidenceScore?: number;
  relevanceSummary?: string;
  keyQuotes?: string[];
  status: 'processing' | 'verified' | 'unverified';
  storagePath?: string;
  extractionStatus?: 'verified_extraction' | 'partial_extraction' | 'needs_review' | 'needs_ocr' | 'extraction_failed';
}

export interface ExtractedFact {
  id: string;
  statement: string;
  category: 'chronology' | 'financial' | 'contractual' | 'conduct' | 'statutory';
  sourceDocId?: string;
  verified: boolean;
  tier: TrustSafetyTier;
  confidence: number;
  groundingRefIds?: string[];
}

export type GroundingStatus = 'grounded' | 'partially_grounded' | 'unsupported';

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  evidenceDocId?: string;
  evidenceTitle?: string;
  isKeyMilestone?: boolean;
  status: 'verified' | 'user_reported' | 'estimated';
  groundingRefIds?: string[];
  groundingStatus?: GroundingStatus;
}

export interface RiskItem {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  limitationPeriodInfo?: {
    statute: string;
    deadlineMonths: number;
    estimatedExpiryDate?: string;
    daysRemaining?: number;
  };
  mitigatingAction: string;
  legalContext: string;
  groundingRefIds?: string[];
  groundingStatus?: GroundingStatus;
}

export interface MissingInformation {
  id: string;
  question: string;
  whyItMatters: string;
  impactOnOutcome: 'critical' | 'moderate' | 'minor';
  suggestedSource: string;
  isAnswered: boolean;
  answer?: string;
  groundingRefIds?: string[];
}

export type ActionStatus = 'pending' | 'in_progress' | 'blocked' | 'completed' | 'skipped' | 'expired';

export type ActionResult = 'completed' | 'rejected' | 'no_response' | 'partially_completed' | 'awaiting_response';

export interface ActionStep {
  id: string;
  matterId?: string;
  title: string;
  phase: 'immediate_48h' | 'short_term_14d' | 'formal_escalation';
  description: string;
  estimatedTurnaround: string;
  status: ActionStatus;
  priority: 'must_do' | 'recommended' | 'optional';
  associatedDraftType?: LegalDraftType;
  dueDate?: string;
  completedAt?: string;
  evidenceRequired?: boolean;
  evidenceDocumentIds?: string[];
  notes?: string;
  blockingReason?: string;
  steps?: Array<{ id: string; title: string; isCompleted: boolean }>;
  completionProof?: {
    type: 'document' | 'receipt' | 'screenshot' | 'reference_number' | 'note';
    reference?: string;
    notes?: string;
    documentId?: string;
    recordedAt: string;
  };
  result?: ActionResult;
  groundingRefIds?: string[];
  groundingStatus?: GroundingStatus;
}

export type LegalDraftType =
  | 'soft_request'
  | 'formal_demand'
  | 'legal_notice'
  | 'consumer_complaint'
  | 'rti_application'
  | 'landlord_demand_letter'
  | 'police_grievance'
  | 'employer_representation';

export type CommunicationTier = 'soft' | 'formal' | 'lawyer_ready';

export interface DraftParagraph {
  id: string;
  text: string;
  groundingRefIds?: string[];
  safetyStatus: 'safe' | 'rewritten' | 'counsel_review';
  originalText?: string;
  rewriteReason?: string;
}

export interface DraftAuditEntry {
  original: string;
  rewritten: string;
  reason: string;
  timestamp: string;
}

export interface LegalDraft {
  id: string;
  matterId: string;
  type: LegalDraftType;
  communicationTier: CommunicationTier;
  title: string;
  recipientName: string;
  recipientAddress?: string;
  subject: string;
  content: string;
  paragraphs?: DraftParagraph[];
  statutoryReference?: string;
  disclaimer: string;
  createdAt: string;
  status: 'draft' | 'customized' | 'ready_to_send';
  groundingRefIds?: string[];
  groundingStatus?: GroundingStatus;
  auditLog?: DraftAuditEntry[];
  requiresAdvocateReview?: boolean;
}

export interface EscalationRoute {
  id: string;
  name: string;
  type:
    | 'nalsa_dlsa'
    | 'consumer_forum_edaakhil'
    | 'rera'
    | 'cybercell_1930'
    | 'labour_commissioner'
    | 'lok_adalat'
    | 'private_advocate';
  description: string;
  criteriaMet: boolean;
  eligibilityDescription: string;
  matchingReason?: string;
  officialPortalUrl?: string;
  tollFreeNumber?: string;
  physicalAuthority?: string;
  stepsToApply: string[];
  costEstimate: string;
  stateApplicable?: string;
  groundingRefIds?: string[];
  groundingStatus?: GroundingStatus;
}

export interface LawyerBrief {
  id: string;
  matterId: string;
  executiveSummary: string;
  keyChronology: Array<{ date: string; event: string; docRefId?: string }>;
  legalIssuesIdentified: string[];
  statutoryReferences: Array<{ statute: string; section?: string; applicability: string }>;
  reliefSought: string[];
  evidentiaryReadiness: {
    strongProof: string[];
    gapsOrMissingProof: string[];
  };
  estimatedClaimAmount?: string;
  jurisdictionState?: string;
  generatedAt: string;
  groundingRefIds?: string[];
  groundingStatus?: GroundingStatus;
}

export interface TrustSafetyItem {
  tier: TrustSafetyTier;
  label: string;
  text: string;
  citation?: string;
  disclaimer?: string;
  confidenceScore?: number;
  groundingRefIds?: string[];
  groundingStatus?: GroundingStatus;
}

// Evidence Graph Structure
export type EvidenceNodeType =
  | 'claim'
  | 'doc'
  | 'fact'
  | 'timeline'
  | 'statute'
  | 'risk'
  | 'missing_info'
  | 'action'
  | 'draft';

export type EvidenceEdgeRelation =
  | 'supports'
  | 'derives_from'
  | 'contradicts'
  | 'mitigates'
  | 'requires'
  | 'evidenced_by'
  | 'governed_by';

export interface EvidenceGraphNode {
  id: string;
  type: EvidenceNodeType;
  label: string;
  content: string;
  confidence: number;
  metadata?: Record<string, unknown>;
}

export interface EvidenceGraphEdge {
  id: string;
  source: string;
  target: string;
  relation: EvidenceEdgeRelation;
  weight?: number;
}

export interface EvidenceGraphData {
  nodes: EvidenceGraphNode[];
  edges: EvidenceGraphEdge[];
  updatedAt: string;
}

export interface Matter {
  id: string;
  userId?: string;
  title: string;
  category: MatterCategory;
  subCategory: string;
  status: MatterStatus;
  createdAt: string;
  updatedAt: string;
  locationCity?: string;
  locationState?: string;
  claimAmount?: number;
  
  // 1. User Story & Core Narrative
  userStory: string;
  
  // 2. Parties Involved
  parties: Party[];
  
  // 3. Evidence & Docs
  documents: DocumentEvidence[];
  
  // 4. Extracted Facts & Summary
  summary: {
    plainLanguage: string;
    keyConflict: string;
    legalNature: string;
  };
  facts: ExtractedFact[];
  
  // 5. Timeline
  timelineEvents: TimelineEvent[];
  
  // 6. Risks & Missing Info
  risks: RiskItem[];
  missingInformation: MissingInformation[];
  
  // 7. Action Plan
  actionPlan: ActionStep[];
  
  // 8. Drafts
  drafts: LegalDraft[];
  
  // 9. Escalation Routes
  escalationRoutes: EscalationRoute[];
  
  // 10. Lawyer Brief & Statutory References
  lawyerBrief?: LawyerBrief;
  applicableStatutes?: Array<{
    statute: string;
    section: string;
    title: string;
    applicabilityNote: string;
  }>;
  
  // 11. Trust & Safety Breakdown
  trustSafetyItems: TrustSafetyItem[];

  // 12. Normalized Evidence Graph Layer
  evidenceGraph?: EvidenceGraphData;

  // 13. Safety & Rewriting Audit Trail
  auditLog?: Array<{
    original: string;
    rewritten: string;
    reason: string;
    timestamp: string;
    component: string;
  }>;

  // 14. Multilingual & Localization Support (Ready for Indic Languages)
  language?: 'en' | 'hi' | 'hinglish' | 'mr';

  // 15. Phase 7 Action Execution & Lifecycle Workspace
  activityEvents?: MatterActivityEvent[];
  communications?: CommunicationRecord[];
  deadlines?: MatterDeadline[];
  escalationWorkflows?: EscalationWorkflowItem[];
  resolution?: MatterResolutionRecord;
  notifications?: MatterNotification[];
}

// -------------------------------------------------------------
// Phase 7: Action Execution & Workflow Tracking Interfaces
// -------------------------------------------------------------

export type CommunicationType =
  | 'legal_notice'
  | 'email'
  | 'whatsapp'
  | 'phone_call'
  | 'service_request'
  | 'complaint_filed'
  | 'authority_response'
  | 'mediation_session'
  | 'payment_received'
  | 'document_received'
  | 'other';

export type CommunicationDirection = 'outgoing' | 'incoming';

export interface CommunicationRecord {
  id: string;
  matterId: string;
  type: CommunicationType;
  direction: CommunicationDirection;
  date: string;
  counterparty: string;
  summary: string;
  referenceNumber?: string;
  documentIds?: string[];
  responseExpectedBy?: string;
  status: 'sent' | 'delivered' | 'awaiting_response' | 'responded' | 'overdue' | 'resolved';
  outcomeNotes?: string;
  createdAt: string;
}

export type ActivityEventType =
  | 'matter_created'
  | 'document_uploaded'
  | 'analysis_completed'
  | 'action_started'
  | 'action_completed'
  | 'communication_recorded'
  | 'draft_finalized'
  | 'draft_downloaded'
  | 'escalation_submitted'
  | 'deadline_created'
  | 'deadline_changed'
  | 'matter_resolved'
  | 'matter_reopened';

export interface MatterActivityEvent {
  id: string;
  matterId: string;
  type: ActivityEventType;
  source: 'evidence_derived' | 'user_recorded';
  title: string;
  date: string;
  description: string;
  referenceId?: string;
  metadata?: Record<string, unknown>;
}

export type DeadlineType = 'statutory' | 'action_step' | 'response_expected' | 'user_defined';

export interface MatterDeadline {
  id: string;
  matterId: string;
  title: string;
  description?: string;
  dueDate: string;
  type: DeadlineType;
  isStatutory: boolean;
  isUserDefined: boolean;
  confidence: number;
  trustTier: TrustSafetyTier;
  relatedActionId?: string;
  relatedEventId?: string;
  status: 'active' | 'completed' | 'overdue' | 'cancelled';
  statuteReference?: string;
  reminderSent?: boolean;
}

export type EscalationWorkflowStatus =
  | 'not_started'
  | 'preparing'
  | 'submitted'
  | 'acknowledged'
  | 'under_review'
  | 'hearing_scheduled'
  | 'resolved'
  | 'rejected'
  | 'unknown';

export interface EscalationWorkflowItem {
  id: string;
  matterId: string;
  routeId: string;
  authorityName: string;
  status: EscalationWorkflowStatus;
  requirements: string[];
  documentsRequired: string[];
  optionalDocuments?: string[];
  submissionMethod: 'online_portal' | 'physical_filing' | 'speed_post' | 'email' | 'helpline';
  officialPortal?: string;
  referenceNumber?: string;
  submittedAt?: string;
  acknowledgedAt?: string;
  nextStep?: string;
  notes?: string;
  documentIds?: string[];
}

export type ResolutionType =
  | 'full_settlement'
  | 'partial_settlement'
  | 'court_order'
  | 'mediation_agreement'
  | 'abandoned'
  | 'complaint_dismissed'
  | 'other';

export interface MatterResolutionRecord {
  resolvedAt: string;
  resolutionType: ResolutionType;
  outcome: string;
  amountRecovered?: number;
  amountDisputed?: number;
  settlementDocumentId?: string;
  notes?: string;
  isReopened?: boolean;
  reopenedAt?: string;
  reopenedReason?: string;
  reopenedBy?: string;
}

export type NotificationType =
  | 'deadline_due'
  | 'deadline_approaching'
  | 'response_expected'
  | 'action_blocked'
  | 'analysis_completed'
  | 'evidence_required'
  | 'authority_update';

export interface MatterNotification {
  id: string;
  matterId: string;
  userId?: string;
  type: NotificationType;
  title: string;
  message: string;
  channel: 'in_app' | 'email';
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

// -------------------------------------------------------------
// Future-Ready Foundation Interfaces
// Ready for OCR, pgvector/RAG, Supabase, and Multilingual LLMs
// -------------------------------------------------------------

export interface DocumentParserProvider {
  parseDocument(file: { buffer?: ArrayBuffer; text?: string; mimeType: string; filename: string }): Promise<{
    extractedText: string;
    confidence: number;
    detectedPages?: number;
    clauses?: Array<{ title: string; text: string; pageNumber?: number }>;
    entities?: Array<{ name: string; type: string }>;
    classification?: string;
    relevanceSummary?: string;
    extractionStatus?: 'verified_extraction' | 'partial_extraction' | 'needs_review' | 'needs_ocr' | 'extraction_failed';
  }>;
}

export interface LegalRAGProvider {
  searchStatutes(query: string, criteria: {
    category: MatterCategory;
    state?: string;
    limit?: number;
  }): Promise<Array<{
    statute: string;
    section: string;
    title: string;
    relevanceScore: number;
    snippet: string;
    precedents?: string[];
  }>>;
}

export interface MatterStorageProvider {
  saveMatter(matter: Matter): Promise<Matter>;
  getMatter(id: string): Promise<Matter | null>;
  listMatters(userId?: string): Promise<Matter[]>;
  deleteMatter(id: string): Promise<boolean>;
}

export interface MultilingualExplanationProvider {
  translateExplanation(text: string, targetLanguage: 'en' | 'hi' | 'hinglish' | 'mr'): Promise<{
    translatedText: string;
    language: 'en' | 'hi' | 'hinglish' | 'mr';
    glossaryTerms?: Record<string, string>;
  }>;
}

export type { SourceReference } from '@/lib/agents/types';

