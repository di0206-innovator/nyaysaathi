export interface StatutoryReference {
  statute: string;
  section: string;
  title: string;
  category: string;
  plainSummary: string;
  limitationMonths?: number;
  forumOrAuthority: string;
  standardRemedy: string;
}

export const INDIAN_STATUTES: StatutoryReference[] = [
  {
    statute: 'Consumer Protection Act, 2019',
    section: 'Section 2(11) & Section 35',
    title: 'Deficiency in Service & District Commission Complaint',
    category: 'consumer_dispute',
    plainSummary: 'Protects buyers from defective goods, deficient customer service, or unfulfilled warranties. Consumer can claim replacement, full refund with interest, and mental agony compensation.',
    limitationMonths: 24, // 2 years from cause of action
    forumOrAuthority: 'District Consumer Disputes Redressal Commission (or e-Daakhil online)',
    standardRemedy: 'Full refund + Compensation for harassment and litigation costs'
  },
  {
    statute: 'Indian Contract Act, 1872 & State Tenancy Laws',
    section: 'Section 73 (Breach of Contract) & Transfer of Property Act §108(m)',
    title: 'Recovery of Withheld Security Deposit & Wear-and-Tear Covenants',
    category: 'tenancy_housing',
    plainSummary: 'Landlords are contractually and legally bound to refund the security deposit upon peaceful surrender of premises, subject only to verified contractual terms. Unilateral deductions for ordinary wear and tear or painting without itemized invoices violate contract law and property jurisprudence.',
    limitationMonths: 36, // 3 years under Indian Limitation Act (Article 113) for contractual money recovery
    forumOrAuthority: 'Civil Court (Summary Suit under Order XXXVII CPC) / Small Causes Court / State Rent Authority (where enacted)',
    standardRemedy: 'Full refund of wrongfully withheld deposit plus interest for unlawful detention'
  },
  {
    statute: 'Real Estate (Regulation and Development) Act, 2016 (RERA)',
    section: 'Section 18',
    title: 'Return of Amount and Compensation for Delayed Handover',
    category: 'property_rera',
    plainSummary: 'If a promoter/builder fails to give possession of the flat as per the agreement date, the allottee has an absolute right to demand full refund with SBI MCLR+2% interest, or monthly delay interest until possession.',
    limitationMonths: 36,
    forumOrAuthority: 'State RERA Authority / Adjudicating Officer (Form M / Form N)',
    standardRemedy: 'Prescribed interest on all paid installments until actual possession or full refund'
  },
  {
    statute: 'Negotiable Instruments Act, 1881',
    section: 'Section 138',
    title: 'Dishonour of Cheque for Insufficiency of Funds',
    category: 'financial_cheque_bounce',
    plainSummary: 'Cheque bounce is a criminal offense if a formal legal demand notice is sent within 30 days of the bank memo and the drawer fails to pay within 15 days of notice receipt.',
    limitationMonths: 1, // 30 days to send notice, then 30 days from 15-day expiry to file case
    forumOrAuthority: 'Judicial Magistrate First Class / Metropolitan Magistrate Court',
    standardRemedy: 'Recovery of double the cheque amount and/or imprisonment up to 2 years'
  },
  {
    statute: 'Payment of Wages Act, 1936 & State Shops and Commercial Establishments Acts',
    section: 'Section 15 & Notice Pay Provisions',
    title: 'Withholding of Earned Salary and Full & Final Settlement',
    category: 'workplace_employment',
    plainSummary: 'Employers cannot withhold earned wages, leave encashment, or statutory bonus beyond the 7th/10th day of the succeeding wage month, or beyond 30 days post resignation.',
    limitationMonths: 12,
    forumOrAuthority: 'Authority under Payment of Wages Act / Labour Commissioner / Civil Court',
    standardRemedy: 'Recovery of unpaid dues with up to 10x penalty or statutory interest'
  },
  {
    statute: 'Right to Information Act, 2005',
    section: 'Section 6(1) & Section 7(1)',
    title: 'Request for Information from Public Authorities',
    category: 'other',
    plainSummary: 'Any citizen can seek public records, file inspection, or status of government applications. Public Information Officer (PIO) must respond within 30 days (48 hours for life/liberty).',
    limitationMonths: 1,
    forumOrAuthority: 'Central / State Information Commission (First Appellate Authority within 30 days)',
    standardRemedy: 'Supply of requested government records + ₹250/day penalty on defaulting PIO'
  },
  {
    statute: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    section: 'Section 318(4) & BNSS Section 173',
    title: 'Cheating and Dishonestly Inducing Delivery of Property (e-FIR)',
    category: 'police_criminal_grievance',
    plainSummary: 'Criminal remedy for deliberate fraudulent misrepresentation, identity fraud, online scams, or financial deception where dishonest intention existed from the inception.',
    limitationMonths: 36,
    forumOrAuthority: 'Police Station / National Cyber Crime Reporting Portal (1930 / cybercrime.gov.in)',
    standardRemedy: 'Registration of FIR / Investigation / Freezing of fraudulent beneficiary accounts'
  }
];
