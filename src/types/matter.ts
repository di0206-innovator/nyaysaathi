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
  | 'in_progress'
  | 'escalated'
  | 'resolved';

export type TrustSafetyTier =
  | 'fact'
  | 'explanation'
  | 'possibility'
  | 'counsel_required';

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
}

export interface ExtractedFact {
  id: string;
  statement: string;
  category: 'chronology' | 'financial' | 'contractual' | 'conduct' | 'statutory';
  sourceDocId?: string;
  verified: boolean;
  tier: TrustSafetyTier;
  confidence: number;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  evidenceDocId?: string;
  evidenceTitle?: string;
  isKeyMilestone?: boolean;
  status: 'verified' | 'user_reported' | 'estimated';
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
}

export interface MissingInformation {
  id: string;
  question: string;
  whyItMatters: string;
  impactOnOutcome: 'critical' | 'moderate' | 'minor';
  suggestedSource: string;
  isAnswered: boolean;
  answer?: string;
}

export interface ActionStep {
  id: string;
  title: string;
  phase: 'immediate_48h' | 'short_term_14d' | 'formal_escalation';
  description: string;
  estimatedTurnaround: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'must_do' | 'recommended' | 'optional';
  associatedDraftType?: LegalDraftType;
}

export type LegalDraftType =
  | 'legal_notice'
  | 'consumer_complaint'
  | 'rti_application'
  | 'landlord_demand_letter'
  | 'police_grievance'
  | 'employer_representation';

export interface LegalDraft {
  id: string;
  matterId: string;
  type: LegalDraftType;
  title: string;
  recipientName: string;
  recipientAddress?: string;
  subject: string;
  content: string;
  statutoryReference?: string;
  disclaimer: string;
  createdAt: string;
  status: 'draft' | 'customized' | 'ready_to_send';
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
  officialPortalUrl?: string;
  tollFreeNumber?: string;
  physicalAuthority?: string;
  stepsToApply: string[];
  costEstimate: string;
}

export interface LawyerBrief {
  id: string;
  matterId: string;
  executiveSummary: string;
  keyChronology: Array<{ date: string; event: string }>;
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
}

export interface TrustSafetyItem {
  tier: TrustSafetyTier;
  label: string;
  text: string;
  citation?: string;
  disclaimer?: string;
}

export interface Matter {
  id: string;
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
  
  // 10. Lawyer Brief
  lawyerBrief?: LawyerBrief;
  
  // 11. Trust & Safety Breakdown
  trustSafetyItems: TrustSafetyItem[];
}
