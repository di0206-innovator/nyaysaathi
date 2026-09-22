// =============================================================================
// Document Comparison & Understanding Domain Types
// =============================================================================

export type ClauseCategory =
  | 'payment'
  | 'rent'
  | 'security_deposit'
  | 'duration'
  | 'renewal'
  | 'termination'
  | 'notice'
  | 'maintenance'
  | 'repairs'
  | 'penalties'
  | 'liability'
  | 'insurance'
  | 'restrictions'
  | 'subletting'
  | 'jurisdiction'
  | 'dispute_resolution'
  | 'confidentiality'
  | 'definitions'
  | 'compensation'
  | 'non_compete'
  | 'intellectual_property'
  | 'indemnity'
  | 'other';

export type ClauseChangeStatus = 'added' | 'removed' | 'modified' | 'unchanged';

export type DocumentProcessingMode =
  | 'VERIFIED_DOCUMENT_MODE'
  | 'PASTED_TEXT_MODE'
  | 'SYNTHETIC_DEMO_MODE';

export type LegalBindingClassification =
  | 'statutory'
  | 'contractual'
  | 'advisory'
  | 'user_provided'
  | 'recommended'
  | 'unresolved';

export interface SourceRef {
  documentId: string;
  documentTitle: string;
  pageNumber?: number;
  clauseNumber?: string;
  snippet?: string;
}

export interface DocumentClause {
  id: string;
  documentId: string;
  clauseNumber?: string;
  heading?: string;
  text: string;
  pageNumber?: number;
  category: ClauseCategory;
  sourceRefs: SourceRef[];
  processingMode?: DocumentProcessingMode;
}

export interface ClauseComparison {
  id: string;
  category: ClauseCategory;
  status: ClauseChangeStatus;

  oldClause?: DocumentClause;
  newClause?: DocumentClause;

  changeSummary: string;
  plainLanguageExplanation: string;
  whyItMayMatter?: string;

  sourceRefs: SourceRef[];

  legalContext?: {
    sourceId: string;
    actName: string;
    section?: string;
    bindingNature: LegalBindingClassification;
    sourceURL?: string;
  };

  requiresCounselReview: boolean;
  semanticAnalysis?: {
    isEquivalent?: boolean;
    isConflict?: boolean;
    matchType?: 'semantic_equivalent' | 'conflict' | 'nuance' | 'none';
    confidence: number;
    explanation?: string;
    reasoning?: string;
  };
}

export interface DocumentComparisonSummary {
  totalClauses: number;
  added: number;
  removed: number;
  modified: number;
  unchanged: number;
}

export interface DocumentComparison {
  id: string;
  documentAId: string;
  documentBId: string;
  documentATitle: string;
  documentBTitle: string;
  comparedAt: string;

  summary: DocumentComparisonSummary;
  clauses: ClauseComparison[];
  unresolvedQuestions: string[];

  processingMode: DocumentProcessingMode;
  contentHashA?: string;
  contentHashB?: string;

  isDemo: boolean;
  demoDisclaimer?: string;
}

/** Canonical alias for DocumentComparison */
export type ComparisonResult = DocumentComparison;

// =============================================================================
// Document Understanding Types
// =============================================================================

export interface DocumentOverview {
  documentTitle: string;
  documentType?: string;
  parties: Array<{ name: string; role: string }>;
  dates: Array<{ label: string; value: string }>;
  term?: string;
  monetaryObligations: Array<{ label: string; amount: string; source?: SourceRef }>;
  noticePeriod?: string;
  jurisdiction?: string;
  terminationClause?: string;
  penalties?: string[];
  importantObligations: string[];
}

export interface ExtractedClause {
  id: string;
  heading: string;
  text: string;
  category: ClauseCategory;
  pageNumber?: number;
  clauseNumber?: string;
  sourceRef: SourceRef;
}

export interface DocumentUnderstanding {
  id: string;
  documentId: string;
  documentTitle: string;
  analyzedAt: string;

  overview: DocumentOverview;
  keyClauses: ExtractedClause[];

  extractionConfidence: number;
  extractionStatus: 'complete' | 'partial' | 'needs_review' | 'needs_ocr';
  warnings: string[];

  processingMode: DocumentProcessingMode;
  contentHash?: string;

  isDemo: boolean;
  demoDisclaimer?: string;
}

// =============================================================================
// Document Q&A Types
// =============================================================================

export interface DocumentQARequest {
  question: string;
  documentAId: string;
  documentBId?: string;
  documentAText?: string;
  documentBText?: string;
  documentATitle?: string;
  documentBTitle?: string;
  processingMode?: DocumentProcessingMode;
}

export interface QAClaim {
  text: string;
  sourceRefs: SourceRef[];
}

export interface DocumentQAAnswer {
  answer: string;
  isGrounded: boolean;
  claims: QAClaim[];
  sourceRefs: SourceRef[];
  uncertainty?: string[];
  whyThisMatters?: string;
  whatToVerify?: string[];
  counselRequired: boolean;
  retrievalMode?: 'semantic_rag' | 'deterministic_search';
  cannotVerifyDisclaimer?: string;
  processingMode?: DocumentProcessingMode;
}
