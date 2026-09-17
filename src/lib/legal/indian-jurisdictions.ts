export interface LegalAidCenter {
  name: string;
  type: string;
  tollFree: string;
  portalUrl: string;
  description: string;
  eligibility: string;
}

export const LEGAL_AID_DIRECTORY: LegalAidCenter[] = [
  {
    name: 'National Legal Services Authority (NALSA) / DLSA',
    type: 'Free Legal Aid & Lok Adalat',
    tollFree: '15100',
    portalUrl: 'https://nalsa.gov.in',
    description: 'Provides free advocate allocation and court fee waiver to women, children, SC/ST, custody undertrials, persons with annual income under ₹3 Lakh (state dependent), and industrial workmen.',
    eligibility: 'All women, children, senior citizens (in certain states), and individuals with annual household income below statutory thresholds.'
  },
  {
    name: 'National Consumer Helpline (NCH) & e-Daakhil',
    type: 'Consumer Grievance & Online Filing',
    tollFree: '1915 / SMS to 8800001915',
    portalUrl: 'https://edaakhil.nic.in',
    description: 'Direct digital filing of consumer complaints across all District, State, and National Consumer Disputes Redressal Commissions without requiring physical court presence or lawyer mandate.',
    eligibility: 'Any consumer aggrieved by defective goods, deficiency in services, or misleading advertisements.'
  },
  {
    name: 'National Cyber Crime Reporting Portal & Helpline',
    type: 'Cyber Crime & Financial Fraud Prevention',
    tollFree: '1930 (Immediate 24x7 helpline)',
    portalUrl: 'https://cybercrime.gov.in',
    description: 'Facilitates immediate bank account lien freezing within golden hours of online UPI/banking fraud and e-complaint lodging for cyber harassment.',
    eligibility: 'Any victim of online financial fraud, identity theft, unauthorized account debit, or cyber harassment.'
  },
  {
    name: 'State Real Estate Regulatory Authority (RERA) Conciliation Forum',
    type: 'Property Buyer Dispute Resolution',
    tollFree: 'State specific',
    portalUrl: 'https://rera.nic.in',
    description: 'Fast-track conciliation between allottees and real estate developers for delayed handover, layout alterations, or refund disputes.',
    eligibility: 'Any flat/plot buyer who has executed a registered Agreement for Sale with a RERA-registered project.'
  },
  {
    name: 'Ministry of Labour & Employment SAMADHAN Portal',
    type: 'Industrial & Wage Dispute Conciliation',
    tollFree: '1800-11-4000',
    portalUrl: 'https://samadhan.labour.gov.in',
    description: 'Online conciliation and dispute escalation mechanism for non-payment of wages, unlawful termination, and full & final settlement disputes.',
    eligibility: 'Employees, contract workers, and gig workers facing wage withholding or statutory gratuity non-payment.'
  }
];

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Delhi NCR', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
  'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha',
  'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];
