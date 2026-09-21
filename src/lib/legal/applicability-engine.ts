/**
 * Legal Source Applicability & Freshness Engine
 * 
 * Verifies jurisdiction, temporal validity, statutory hierarchy, and applicability
 * for Indian legal provisions before they are cited or recommend action.
 */

export type LegalSourceStatus = 'active' | 'amended' | 'superseded' | 'repealed' | 'unverified';

export type LegalHierarchy = 
  | 'Constitution' 
  | 'Central Enactment' 
  | 'State Enactment' 
  | 'Municipal/Subordinate Rule' 
  | 'Contractual Common Law' 
  | 'Advisory Model';

export interface LegalSource {
  id: string;
  authority: string;
  jurisdiction: string;
  documentType: 'Act' | 'Model Law' | 'Code' | 'Regulation' | 'Precedent' | 'Agreement Term';
  hierarchy: LegalHierarchy;
  effectiveFrom: string; // ISO Date YYYY-MM-DD
  effectiveTo?: string;   // ISO Date YYYY-MM-DD
  status: LegalSourceStatus;
  sourceURL?: string;
  actName: string;
  section: string;
  version: string;
  description: string;
  plainSummary: string;
  isBinding: boolean;
  applicabilityCriteria: {
    categories: string[];
    states?: string[];
    requiresAgreementType?: string[];
    disputeKeywords?: string[];
  };
}

export interface LegalApplicabilityInput {
  matterDate?: string;
  location?: string;
  state?: string;
  category: string;
  agreementType?: string;
  disputeType?: string;
  facts?: string[];
}

export type LegalBindingClassification =
  | 'binding'
  | 'advisory'
  | 'contractual'
  | 'inapplicable'
  | 'superseded'
  | 'unresolved';

export type LegalApplicabilityReasonCode =
  | 'ACTIVE_GOVERNING_STATUTE'
  | 'ADVISORY_MODEL_FRAMEWORK'
  | 'CONTRACTUAL_COMMON_LAW_REMEDY'
  | 'STATE_JURISDICTION_MISMATCH'
  | 'TEMPORAL_PRE_ENACTMENT'
  | 'SUPERSEDED_BY_NEWER_CODE'
  | 'OUT_OF_SCOPE_CATEGORY'
  | 'REQUIRES_LEGAL_COUNSEL_VERIFICATION';

export interface ApplicabilityEvaluation {
  source: LegalSource;
  isApplicable: boolean;
  bindingNature: 'binding' | 'advisory' | 'contractual' | 'inapplicable' | 'superseded_or_repealed';
  legalClassification: LegalBindingClassification;
  reasonCode: LegalApplicabilityReasonCode;
  confidenceScore: number;
  rationale: string;
  status: LegalSourceStatus;
  resolutionStatus: 'applicable' | 'advisory_only' | 'unresolved' | 'counsel_required' | 'inapplicable';
}

/**
 * Standard registry of curated Indian legal provisions with status, hierarchy and temporal validity
 */
export const LEGAL_SOURCE_REGISTRY: LegalSource[] = [
  // 1. Central Contract Law
  {
    id: 'ica-1872-sec73',
    authority: 'Parliament of India',
    jurisdiction: 'India (Pan-India)',
    documentType: 'Act',
    hierarchy: 'Central Enactment',
    effectiveFrom: '1872-09-01',
    status: 'active',
    actName: 'Indian Contract Act, 1872',
    section: 'Section 73',
    version: '1872.1',
    sourceURL: 'https://www.indiacode.nic.in/handle/123456789/2187',
    description: 'Compensation for loss or damage caused by breach of contract.',
    plainSummary: 'When a contract is broken, the party who suffers by the breach is entitled to receive compensation for any loss naturally arising.',
    isBinding: true,
    applicabilityCriteria: {
      categories: ['tenancy_housing', 'consumer_dispute', 'workplace_employment', 'other'],
      disputeKeywords: ['deposit', 'breach', 'refund', 'contract', 'agreement', 'withheld']
    }
  },
  // 2. Transfer of Property Act
  {
    id: 'tpa-1882-sec108m',
    authority: 'Parliament of India',
    jurisdiction: 'India (Pan-India)',
    documentType: 'Act',
    hierarchy: 'Central Enactment',
    effectiveFrom: '1882-07-01',
    status: 'active',
    actName: 'Transfer of Property Act, 1882',
    section: 'Section 108(m)',
    version: '1882.1',
    sourceURL: 'https://www.indiacode.nic.in/handle/123456789/2338',
    description: 'Lessee obligation to maintain property, subject only to reasonable wear and tear.',
    plainSummary: 'The lessee is bound to keep and restore the property in as good condition as it was when put in possession, subject only to fair wear and tear.',
    isBinding: true,
    applicabilityCriteria: {
      categories: ['tenancy_housing'],
      disputeKeywords: ['painting', 'wear and tear', 'damage', 'repair', 'deposit', 'handover']
    }
  },
  // 3. Consumer Protection Act 2019
  {
    id: 'copra-2019-sec35',
    authority: 'Parliament of India',
    jurisdiction: 'India (Pan-India)',
    documentType: 'Act',
    hierarchy: 'Central Enactment',
    effectiveFrom: '2020-07-20',
    status: 'active',
    actName: 'Consumer Protection Act, 2019',
    section: 'Section 35 & Section 2(11)',
    version: '2019.1',
    sourceURL: 'https://www.indiacode.nic.in/handle/123456789/15256',
    description: 'Jurisdiction and procedure for consumer complaint regarding deficiency in goods/services.',
    plainSummary: 'Enables consumer to seek compensation and refunds for deficiency in services before the District Consumer Commission.',
    isBinding: true,
    applicabilityCriteria: {
      categories: ['consumer_dispute', 'tenancy_housing'],
      disputeKeywords: ['deficiency', 'service', 'refund', 'ecommerce', 'co-living', 'brokerage']
    }
  },
  // 4. Negotiable Instruments Act 1881
  {
    id: 'ni-1881-sec138',
    authority: 'Parliament of India',
    jurisdiction: 'India (Pan-India)',
    documentType: 'Act',
    hierarchy: 'Central Enactment',
    effectiveFrom: '1882-03-01',
    status: 'active',
    actName: 'Negotiable Instruments Act, 1881',
    section: 'Section 138',
    version: '1881.1',
    sourceURL: 'https://www.indiacode.nic.in/handle/123456789/2189',
    description: 'Dishonour of cheque for insufficiency of funds in the bank account.',
    plainSummary: 'Criminal offense when a cheque is dishonoured, requiring statutory notice within 30 days and payment within 15 days.',
    isBinding: true,
    applicabilityCriteria: {
      categories: ['financial_cheque_bounce'],
      disputeKeywords: ['cheque', 'dishonour', 'bounce', 'bank memo', 'insufficiency']
    }
  },
  // 5. RERA 2016
  {
    id: 'rera-2016-sec18',
    authority: 'Parliament of India',
    jurisdiction: 'India (Pan-India)',
    documentType: 'Act',
    hierarchy: 'Central Enactment',
    effectiveFrom: '2016-05-01',
    status: 'active',
    actName: 'Real Estate (Regulation and Development) Act, 2016',
    section: 'Section 18',
    version: '2016.1',
    sourceURL: 'https://www.indiacode.nic.in/handle/123456789/2158',
    description: 'Return of amount and compensation for delayed builder possession.',
    plainSummary: 'Builder must refund total paid amount with interest or pay monthly delay interest if possession is not handed over on scheduled date.',
    isBinding: true,
    applicabilityCriteria: {
      categories: ['property_rera'],
      disputeKeywords: ['builder', 'flat', 'delay', 'possession', 'allottee', 'handover']
    }
  },
  // 6. Maharashtra Rent Control Act 1999 (State Enactment)
  {
    id: 'mrca-1999-sec55',
    authority: 'Maharashtra Legislative Assembly',
    jurisdiction: 'Maharashtra',
    documentType: 'Act',
    hierarchy: 'State Enactment',
    effectiveFrom: '2000-03-31',
    status: 'active',
    actName: 'Maharashtra Rent Control Act, 1999',
    section: 'Section 55 & Section 24',
    version: '1999.1',
    description: 'Mandatory written and registered tenancy/license agreements in Maharashtra.',
    plainSummary: 'Requires tenancy agreements to be in writing and registered; non-registration places evidentiary onus on licensor.',
    isBinding: true,
    applicabilityCriteria: {
      categories: ['tenancy_housing'],
      states: ['maharashtra', 'mumbai', 'pune', 'nagpur', 'thane'],
      disputeKeywords: ['leave and license', 'deposit', 'tenancy', 'rent', 'flat']
    }
  },
  // 7. Karnataka Rent Act 1999 (State Enactment)
  {
    id: 'kra-1999-sec2',
    authority: 'Karnataka Legislative Assembly',
    jurisdiction: 'Karnataka',
    documentType: 'Act',
    hierarchy: 'State Enactment',
    effectiveFrom: '2001-12-31',
    status: 'active',
    actName: 'Karnataka Rent Act, 1999',
    section: 'Section 2 & Schedule',
    version: '1999.1',
    description: 'Regulates tenancy in Karnataka urban areas with specified premises rent ceilings.',
    plainSummary: 'Applies to residential tenancies within specified rent limits; disputes outside limits proceed under civil contract remedies.',
    isBinding: true,
    applicabilityCriteria: {
      categories: ['tenancy_housing'],
      states: ['karnataka', 'bengaluru', 'bangalore', 'mysuru'],
      disputeKeywords: ['rent', 'tenancy', 'bengaluru', 'deposit', 'landlord']
    }
  },
  // 8. Model Tenancy Act 2021 (Advisory Model - NOT Pan-India Automatic Statute)
  {
    id: 'mta-2021-advisory',
    authority: 'Union Ministry of Housing and Urban Affairs (MoHUA)',
    jurisdiction: 'India (Model Legislation)',
    documentType: 'Model Law',
    hierarchy: 'Advisory Model',
    effectiveFrom: '2021-06-02',
    status: 'active',
    actName: 'Model Tenancy Act, 2021',
    section: 'Model Reference / Section 13 (Advisory Only)',
    version: '2021.1',
    sourceURL: 'https://mohua.gov.in/upload/uploadfiles/files/Model_Tenancy_Act_English.pdf',
    description: 'Central advisory guideline suggesting 2-month deposit caps and tenancy authorities.',
    plainSummary: 'Advisory model law published by the Central Government. It does NOT automatically govern tenancies unless formally enacted by the relevant State legislature.',
    isBinding: false,
    applicabilityCriteria: {
      categories: ['tenancy_housing'],
      disputeKeywords: ['model tenancy', 'deposit cap', 'mta', 'guideline']
    }
  },
  // 9. Repealed / Superseded example for freshness validation
  {
    id: 'ipc-1860-sec420',
    authority: 'Parliament of India',
    jurisdiction: 'India (Pan-India)',
    documentType: 'Code',
    hierarchy: 'Central Enactment',
    effectiveFrom: '1862-01-01',
    effectiveTo: '2024-06-30',
    status: 'superseded',
    actName: 'Indian Penal Code, 1860',
    section: 'Section 420',
    version: '1860.1',
    description: 'Cheating and dishonestly inducing delivery of property (superseded by BNS 2023 §318(4)).',
    plainSummary: 'Superseded on July 1, 2024 by Bharatiya Nyaya Sanhita, 2023 (Section 318(4)). Old cases before July 1, 2024 retain IPC applicability.',
    isBinding: false,
    applicabilityCriteria: {
      categories: ['police_criminal_grievance'],
      disputeKeywords: ['cheating', 'fraud']
    }
  },
  // 10. Bharatiya Nyaya Sanhita 2023 (Current Active Criminal Code)
  {
    id: 'bns-2023-sec318',
    authority: 'Parliament of India',
    jurisdiction: 'India (Pan-India)',
    documentType: 'Code',
    hierarchy: 'Central Enactment',
    effectiveFrom: '2024-07-01',
    status: 'active',
    actName: 'Bharatiya Nyaya Sanhita, 2023',
    section: 'Section 318(4)',
    version: '2023.1',
    sourceURL: 'https://www.indiacode.nic.in/handle/123456789/20062',
    description: 'Cheating and dishonestly inducing delivery of property.',
    plainSummary: 'Current governing penal section for fraudulent cheating and dishonest inducement, replacing IPC Section 420 as of July 1, 2024.',
    isBinding: true,
    applicabilityCriteria: {
      categories: ['police_criminal_grievance'],
      disputeKeywords: ['cheating', 'fraud', 'fir', 'scam', 'dishonest']
    }
  }
];

export class LegalApplicabilityEngine {
  /**
   * Evaluates legal source applicability against matter parameters, dates, jurisdiction, and facts.
   */
  public static evaluateSource(
    source: LegalSource,
    input: LegalApplicabilityInput
  ): ApplicabilityEvaluation {
    const matterDateStr = input.matterDate || new Date().toISOString().split('T')[0];
    const normalizedCategory = (input.category || '').toLowerCase();
    const normalizedState = (input.state || input.location || '').toLowerCase();

    // 1. Check Category Match
    const categoryMatches = source.applicabilityCriteria.categories.includes(normalizedCategory);
    if (!categoryMatches) {
      return {
        source,
        isApplicable: false,
        bindingNature: 'inapplicable',
        legalClassification: 'inapplicable',
        reasonCode: 'OUT_OF_SCOPE_CATEGORY',
        confidenceScore: 0.1,
        rationale: `Source category (${source.applicabilityCriteria.categories.join(', ')}) does not match matter category (${normalizedCategory}).`,
        status: source.status,
        resolutionStatus: 'inapplicable'
      };
    }

    // 2. Check Freshness & Temporal Validity
    if (source.status === 'repealed') {
      return {
        source,
        isApplicable: false,
        bindingNature: 'superseded_or_repealed',
        legalClassification: 'superseded',
        reasonCode: 'SUPERSEDED_BY_NEWER_CODE',
        confidenceScore: 0,
        rationale: `Source is repealed and cannot drive action recommendations.`,
        status: source.status,
        resolutionStatus: 'counsel_required'
      };
    }

    if (source.status === 'superseded') {
      // Check if matter occurred before sunset date
      if (source.effectiveTo && matterDateStr < source.effectiveTo) {
        return {
          source,
          isApplicable: true,
          bindingNature: 'binding',
          legalClassification: 'binding',
          reasonCode: 'ACTIVE_GOVERNING_STATUTE',
          confidenceScore: 0.85,
          rationale: `Source was active at the date of cause of action (${matterDateStr}) prior to sunset (${source.effectiveTo}).`,
          status: source.status,
          resolutionStatus: 'applicable'
        };
      }
      return {
        source,
        isApplicable: false,
        bindingNature: 'superseded_or_repealed',
        legalClassification: 'superseded',
        reasonCode: 'SUPERSEDED_BY_NEWER_CODE',
        confidenceScore: 0.1,
        rationale: `Source was superseded on ${source.effectiveTo}. Governing law for current matters is the successor enactment.`,
        status: source.status,
        resolutionStatus: 'unresolved'
      };
    }

    // 3. Check Temporal Inception (Matter date prior to law taking effect)
    if (source.effectiveFrom && matterDateStr < source.effectiveFrom) {
      return {
        source,
        isApplicable: false,
        bindingNature: 'inapplicable',
        legalClassification: 'inapplicable',
        reasonCode: 'TEMPORAL_PRE_ENACTMENT',
        confidenceScore: 0.2,
        rationale: `Matter date (${matterDateStr}) precedes the effective date (${source.effectiveFrom}) of this enactment.`,
        status: source.status,
        resolutionStatus: 'inapplicable'
      };
    }

    // 4. Check Jurisdiction Specificity (e.g. Maharashtra vs Karnataka vs Central)
    if (source.applicabilityCriteria.states && source.applicabilityCriteria.states.length > 0) {
      const stateMatches = source.applicabilityCriteria.states.some(s => 
        normalizedState.includes(s.toLowerCase())
      );
      if (!stateMatches) {
        return {
          source,
          isApplicable: false,
          bindingNature: 'inapplicable',
          legalClassification: 'inapplicable',
          reasonCode: 'STATE_JURISDICTION_MISMATCH',
          confidenceScore: 0.2,
          rationale: `State-specific enactment for ${source.jurisdiction} does not apply to jurisdiction: ${normalizedState || 'unspecified'}.`,
          status: source.status,
          resolutionStatus: 'inapplicable'
        };
      }
    }

    // 5. Special Nuance: Model Legislation (Model Tenancy Act 2021)
    if (source.hierarchy === 'Advisory Model') {
      return {
        source,
        isApplicable: true,
        bindingNature: 'advisory',
        legalClassification: 'advisory',
        reasonCode: 'ADVISORY_MODEL_FRAMEWORK',
        confidenceScore: 0.75,
        rationale: 'Applicability depends on the relevant state/territorial tenancy framework, agreement terms, dates and facts. MTA 2021 is advisory reference unless adopted by state enactment.',
        status: source.status,
        resolutionStatus: 'advisory_only'
      };
    }

    // 6. Active Binding Statute or Contractual Common Law
    const isContractual = source.hierarchy === 'Contractual Common Law' || !source.isBinding;
    return {
      source,
      isApplicable: true,
      bindingNature: source.isBinding ? 'binding' : 'contractual',
      legalClassification: isContractual ? 'contractual' : 'binding',
      reasonCode: isContractual ? 'CONTRACTUAL_COMMON_LAW_REMEDY' : 'ACTIVE_GOVERNING_STATUTE',
      confidenceScore: 0.95,
      rationale: `Active governing statutory provision under ${source.hierarchy} in ${source.jurisdiction}.`,
      status: source.status,
      resolutionStatus: 'applicable'
    };
  }

  /**
   * Evaluates all known legal sources against matter input and returns prioritized, verified provisions.
   */
  public static evaluateAll(input: LegalApplicabilityInput): ApplicabilityEvaluation[] {
    return LEGAL_SOURCE_REGISTRY
      .map(src => this.evaluateSource(src, input))
      .filter(evalResult => evalResult.isApplicable)
      .sort((a, b) => {
        // Prioritize binding over advisory, then higher confidence
        if (a.bindingNature === 'binding' && b.bindingNature !== 'binding') return -1;
        if (b.bindingNature === 'binding' && a.bindingNature !== 'binding') return 1;
        return b.confidenceScore - a.confidenceScore;
      });
  }
}
