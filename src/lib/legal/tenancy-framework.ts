/**
 * Jurisdiction-Aware Urban Tenancy Legal Framework for India
 *
 * Distinguishes:
 * 1. Model Tenancy Act (MTA 2021): Advisory central model requiring state legislative adoption.
 * 2. State-Specific Rent Acts: E.g., Karnataka Rent Act 1999, Maharashtra Rent Control Act 1999, Delhi Rent Control Act 1958.
 * 3. Contractual & Civil Remedies: Indian Contract Act 1872 (§73, §74), Transfer of Property Act 1882, Specific Relief Act 1963.
 * 4. Consumer Protection Act 2019: Applicable where institutional / co-living housing service deficiency occurs.
 */

export interface TenancyAssessmentInput {
  state: string;
  city: string;
  agreementType: 'registered_lease' | 'leave_and_license' | 'unregistered_written' | 'verbal_agreement';
  monthlyRentINR: number;
  securityDepositINR: number;
  disputeType:
    | 'deposit_withholding'
    | 'arbitrary_deductions_painting'
    | 'arbitrary_deductions_repairs'
    | 'delayed_refund'
    | 'handover_dispute';
  handoverDate?: string;
  depositRefundDaysElapsed?: number;
}

export interface TenancyApplicabilityResult {
  jurisdiction: string;
  primaryLegalBasis: string;
  statutoryHierarchy: 'State Enactment' | 'Central Code' | 'Contractual Common Law' | 'Advisory Model';
  applicableActs: Array<{
    actName: string;
    section: string;
    description: string;
    status: 'binding_statute' | 'governing_contract' | 'advisory_guideline';
  }>;
  legalNuance: string;
  recommendedLegalGrounding: string[];
  evidentiaryRequirements: string[];
  speedPostNoticePeriodDays: number;
  cautionaryNotice: string;
}

export class TenancyFramework {
  public static assessApplicability(input: TenancyAssessmentInput): TenancyApplicabilityResult {
    const normalizedState = input.state.trim().toLowerCase();
    const normalizedCity = input.city.trim().toLowerCase();

    // 1. Maharashtra (Mumbai, Pune, etc.) - Leave & License Dominant
    if (normalizedState.includes('maharashtra') || normalizedCity.includes('mumbai') || normalizedCity.includes('pune')) {
      return {
        jurisdiction: 'Maharashtra (Mumbai / Pune Metropolitan)',
        primaryLegalBasis: 'Maharashtra Rent Control Act 1999 & Indian Contract Act 1872',
        statutoryHierarchy: 'State Enactment',
        applicableActs: [
          {
            actName: 'Maharashtra Rent Control Act 1999',
            section: 'Section 24 & Section 55',
            description: 'Section 55 mandates registration of tenancy / leave and license agreements. Non-registration creates an evidentiary burden on the licensor.',
            status: 'binding_statute'
          },
          {
            actName: 'Indian Contract Act 1872',
            section: 'Section 73 & Section 74',
            description: 'Governs breach of contract and recovery of security deposit unlawfully detained contrary to agreement clauses.',
            status: 'binding_statute'
          },
          {
            actName: 'Model Tenancy Act 2021',
            section: 'Reference Standard',
            description: 'Advisory framework; Maharashtra has not replaced the Maharashtra Rent Control Act 1999 with the MTA.',
            status: 'advisory_guideline'
          }
        ],
        legalNuance:
          'In Maharashtra, most residential lettings operate under 11-month Leave and License agreements. Unilateral deductions for ordinary repainting without express contract authorization violate wear-and-tear covenants under common law.',
        recommendedLegalGrounding: [
          'Clause-by-clause comparison of Move-In vs Move-Out condition',
          'Notice under Section 106 Transfer of Property Act / Contractual refund covenant',
          'Legal notice demanding refund with 15-day rectification window before Summary Civil Suit / Commercial Court action'
        ],
        evidentiaryRequirements: [
          'Registered Leave & License agreement (or stamped counterpart)',
          'Proof of initial deposit transfer (bank statement / UPI reference)',
          'Move-in condition inspection notes / dated photos',
          'Move-out handover confirmation / key return acknowledgment',
          'Itemized dispute of arbitrary deductions'
        ],
        speedPostNoticePeriodDays: 15,
        cautionaryNotice:
          'Do not cite the Model Tenancy Act as binding statutory law in Maharashtra courts; cite the Maharashtra Rent Control Act 1999 and the terms of your Leave & License agreement.'
      };
    }

    // 2. Karnataka (Bengaluru, etc.)
    if (normalizedState.includes('karnataka') || normalizedCity.includes('bengaluru') || normalizedCity.includes('bangalore')) {
      return {
        jurisdiction: 'Karnataka (Bengaluru Urban)',
        primaryLegalBasis: 'Karnataka Rent Control Act 1999, Indian Contract Act 1872 & Draft Tenancy Rules',
        statutoryHierarchy: 'State Enactment',
        applicableActs: [
          {
            actName: 'Indian Contract Act 1872',
            section: 'Section 73',
            description: 'Direct compensation for loss or damage caused by breach of contractual obligation to refund deposit upon peaceful surrender.',
            status: 'binding_statute'
          },
          {
            actName: 'Transfer of Property Act 1882',
            section: 'Section 108(m)',
            description: 'Tenant is bound to keep the property in as good condition as it was when put in possession, subject only to fair wear and tear.',
            status: 'binding_statute'
          },
          {
            actName: 'Karnataka Rent Act 1999',
            section: 'Section 2 & Schedule',
            description: 'Premises with standard rent thresholds or commercial scale may fall outside small-cause rent courts, relying on civil / summary recovery.',
            status: 'binding_statute'
          }
        ],
        legalNuance:
          'Bengaluru tenancy custom of demanding 5–10 months deposit is historically common but has no mandatory statutory shield allowing landlords to forfeit 1 month rent for painting without express bilateral agreement and invoice proof.',
        recommendedLegalGrounding: [
          'Ordinary wear and tear defense under TPA §108(m)',
          'Strict requirement for itemized GST contractor invoices for any alleged repair deductions',
          '15-day formal demand notice prior to filing recovery suit or consumer complaint'
        ],
        evidentiaryRequirements: [
          'Signed rental agreement with deposit clause',
          'Handover video / WhatsApp timestamped check-out chat',
          'Demand for GST invoices for painting or repair deductions'
        ],
        speedPostNoticePeriodDays: 15,
        cautionaryNotice:
          'While Karnataka announced intent to adopt MTA principles, recovery of security deposits in Bengaluru currently proceeds under contract law and civil remedies.'
      };
    }

    // 3. Delhi / NCR (New Delhi, Noida, Gurugram)
    if (
      normalizedState.includes('delhi') ||
      normalizedCity.includes('delhi') ||
      normalizedCity.includes('noida') ||
      normalizedCity.includes('gurugram') ||
      normalizedCity.includes('gurgaon')
    ) {
      return {
        jurisdiction: 'Delhi-NCR (NCT of Delhi / Haryana / Uttar Pradesh)',
        primaryLegalBasis: 'Delhi Rent Control Act 1958 (where applicable) & Indian Contract Act 1872',
        statutoryHierarchy: 'State Enactment',
        applicableActs: [
          {
            actName: 'Delhi Rent Control Act 1958',
            section: 'Section 3(c)',
            description: 'Exempts premises whose monthly rent exceeds ₹3,500/month from rent control protection, placing modern residential leases under general contract & civil law.',
            status: 'binding_statute'
          },
          {
            actName: 'Indian Contract Act 1872',
            section: 'Section 73 & Section 74',
            description: 'Principal governing statute for recovery of security deposit in tenancies exceeding ₹3,500/month.',
            status: 'binding_statute'
          }
        ],
        legalNuance:
          'Because virtually all urban Delhi rentals exceed ₹3,500/month, the Delhi Rent Control Act rarely governs security deposit recovery. The tenancy agreement operates as an enforceable commercial contract under the Indian Contract Act.',
        recommendedLegalGrounding: [
          'Contractual breach for non-refund within agreement timeline',
          'Proof of vacant peaceful possession handed over on record',
          '15-day legal notice by Speed Post establishing cause of action'
        ],
        evidentiaryRequirements: [
          'Lease deed / rent agreement',
          'Clearance receipts for electricity, water, maintenance dues',
          'Written surrender notice and key handover receipt'
        ],
        speedPostNoticePeriodDays: 15,
        cautionaryNotice:
          'Do not cite the Delhi Rent Control Act 1958 for high-rent urban apartments; enforce the contract under the Indian Contract Act 1872.'
      };
    }

    // 4. Default / General Indian Urban Tenancy Framework
    return {
      jurisdiction: `${input.city || 'Urban'}, ${input.state || 'India'}`,
      primaryLegalBasis: 'Indian Contract Act 1872 & Transfer of Property Act 1882',
      statutoryHierarchy: 'Central Code',
      applicableActs: [
        {
          actName: 'Indian Contract Act 1872',
          section: 'Section 73',
          description: 'Right of party suffering from breach of agreement to receive compensation for naturally arising loss.',
          status: 'binding_statute'
        },
        {
          actName: 'Transfer of Property Act 1882',
          section: 'Section 108(m)',
          description: 'Protects tenants against charges for reasonable wear and tear or irresistible force.',
          status: 'binding_statute'
        },
        {
          actName: 'Model Tenancy Act 2021',
          section: 'Section 11 (Model Provision - Security Deposit)',
          description: 'Advisory model provision recommending security deposit return upon vacation and 2-month residential cap, subject to state enactment.',
          status: 'advisory_guideline'
        }
      ],
      legalNuance:
        'Applicability depends on state-specific tenancy legislation, registration status of the deed, and specific agreement clauses. Security deposits are trust monies held for performance, not landlord revenue.',
      recommendedLegalGrounding: [
        'Establish date of peaceful handover and termination of occupancy',
        'Demonstrate clearance of all utility charges and rent arrears',
        'Issue formal demand notice giving 15 days to refund before pursuing civil or summary recovery'
      ],
      evidentiaryRequirements: [
        'Written agreement or receipt establishing deposit payment',
        'Proof of key handover and utility clearance',
        'Written demand for refund and refusal or non-response'
      ],
      speedPostNoticePeriodDays: 15,
      cautionaryNotice:
        'Statutory tenancy protection varies across states. Applicability depends on your specific state enactment, lease registration, and contractual clauses.'
    };
  }
}
