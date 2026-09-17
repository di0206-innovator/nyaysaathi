import { EscalationRoute, MatterCategory } from '@/types/matter';

export class EscalationMatcher {
  public static matchRoutes(
    category: MatterCategory,
    state?: string,
    claimAmount?: number
  ): EscalationRoute[] {
    const matched: EscalationRoute[] = [];
    const stateLabel = state || 'Your State';
    const amountStr = claimAmount ? `₹${claimAmount.toLocaleString('en-IN')}` : 'your claim amount';

    switch (category) {
      case 'consumer_dispute':
        matched.push(
          {
            id: 'esc-cpa-1',
            name: 'National Consumer Helpline (NCH) Pre-Litigation Docket',
            type: 'consumer_forum_edaakhil',
            description: 'Direct government conciliation portal where grievances against brands/merchants are forwarded for rapid resolution before court filing.',
            criteriaMet: true,
            eligibilityDescription: 'Any consumer with a valid tax invoice or purchase proof facing product/warranty defects.',
            matchingReason: 'Highest speed resolution for commercial/e-commerce warranty disputes.',
            officialPortalUrl: 'https://consumerhelpline.gov.in',
            tollFreeNumber: '1915 / SMS to 8800001915',
            stepsToApply: [
              'Register on consumerhelpline.gov.in or dial 1915',
              'Upload Purchase Invoice and Service Center Job Sheet',
              'Track docket status online (typically 15-30 days turnaround)'
            ],
            costEstimate: '₹0 (Free of Cost)'
          },
          {
            id: 'esc-cpa-2',
            name: `e-Daakhil District Consumer Commission (${stateLabel})`,
            type: 'consumer_forum_edaakhil',
            description: 'Direct digital filing of formal Section 35 consumer complaint before the District Consumer Disputes Redressal Commission.',
            criteriaMet: true,
            eligibilityDescription: `Applicable for claims up to ₹50 Lakhs (your stake: ${amountStr}). You can file and argue as Complainant in Person without hiring a lawyer.`,
            matchingReason: `Official statutory forum for ${stateLabel} consumer dispute adjudication.`,
            officialPortalUrl: 'https://edaakhil.nic.in',
            tollFreeNumber: '1915',
            stepsToApply: [
              'Login with Aadhaar / Mobile OTP on edaakhil.nic.in',
              'Fill complainant & respondent details using NyaySaathi Party list',
              'Upload the generated e-Daakhil Complaint Plaint and supporting invoice/job sheet',
              'Pay online court fee (₹0 for claims up to ₹5 Lakh)'
            ],
            costEstimate: '₹0 for claims up to ₹5 Lakhs (Nominal ₹200-₹500 above ₹5 Lakhs)'
          }
        );
        break;

      case 'tenancy_housing':
        matched.push(
          {
            id: 'esc-rent-1',
            name: `District Legal Services Authority (DLSA) Pre-Litigation Mediation (${stateLabel})`,
            type: 'nalsa_dlsa',
            description: 'Free, fast-track pre-litigation conciliation conducted by judicial officers and empanelled mediators at the District Court complex.',
            criteriaMet: true,
            eligibilityDescription: 'Open to all citizens seeking fast settlement of residential tenancy, security deposit, and contract withholding disputes without litigation fees.',
            matchingReason: 'Amicable settlement route avoiding years of formal civil litigation.',
            officialPortalUrl: 'https://nalsa.gov.in',
            tollFreeNumber: '15100',
            physicalAuthority: `DLSA Front Office, District Court Complex, ${stateLabel}`,
            stepsToApply: [
              'Print the 1-Page NyaySaathi Lawyer Brief and Demand Notice copy',
              'Submit a pre-litigation application at the nearest DLSA front office or online',
              'DLSA mediator summons landlord for joint conciliation sitting within 14 days'
            ],
            costEstimate: '₹0 (Completely Free under Legal Services Authorities Act, 1987)'
          },
          {
            id: 'esc-rent-2',
            name: `Court of Small Causes / Rent Tribunal (${stateLabel})`,
            type: 'private_advocate',
            description: 'Formal judicial civil court for summary debt recovery under Order 37 CPC and Rent Control Acts.',
            criteriaMet: true,
            eligibilityDescription: 'Applicable where landlord refuses mediation and debt is acknowledged in written agreement.',
            matchingReason: `Jurisdiction over liquidated monetary recovery suits in ${stateLabel}.`,
            officialPortalUrl: 'https://ecourts.gov.in',
            stepsToApply: [
              'Engage an enrolled Advocate using your NyaySaathi Case Brief',
              'Dispatch formal 15-day Speed Post Legal Notice with tracking',
              'File summary recovery plaint before Court of Small Causes'
            ],
            costEstimate: 'Court fee (approx 2.5% of claim) + advocate professional fee'
          }
        );
        break;

      case 'cyber_fraud':
        matched.push(
          {
            id: 'esc-cyber-1',
            name: 'National Cyber Crime Reporting Portal & Helpline (1930)',
            type: 'cybercell_1930',
            description: 'Immediate 24x7 financial fraud lien-marking helpline coordinated with Indian banking nodes to freeze fraudulent beneficiary accounts within golden hours.',
            criteriaMet: true,
            eligibilityDescription: 'Any victim of UPI, net banking, OTP phishing, or online financial deception.',
            matchingReason: 'Critical for immediate fund freezing before fraudulent funds are withdrawn.',
            officialPortalUrl: 'https://cybercrime.gov.in',
            tollFreeNumber: '1930 (24x7 National Cyber Crime Helpline)',
            stepsToApply: [
              'Call 1930 immediately with bank transaction reference numbers (UTR / UPI Ref)',
              'File formal complaint online at cybercrime.gov.in with bank debit SMS screenshot',
              'Liaise with bank nodal officer to initiate chargeback'
            ],
            costEstimate: '₹0 (Free Government Portal)'
          }
        );
        break;

      case 'property_rera':
        matched.push(
          {
            id: 'esc-rera-1',
            name: `State Real Estate Regulatory Authority (RERA) (${stateLabel})`,
            type: 'rera',
            description: 'Fast-track adjudication and conciliation bench for home buyers against delayed possession, layout changes, or refund with interest.',
            criteriaMet: true,
            eligibilityDescription: 'All flat/plot allottees in RERA-registered real estate projects.',
            matchingReason: `Exclusive statutory jurisdiction under Section 18 / 31 of RERA Act 2016 for ${stateLabel}.`,
            officialPortalUrl: 'https://rera.nic.in',
            stepsToApply: [
              'Register on the State RERA portal with project registration number',
              'File Form M (Complaint to Authority) or Form N (Adjudicating Officer for Compensation)',
              'Attach Builder-Buyer Agreement, payment receipts, and delay interest calculation'
            ],
            costEstimate: '₹1,000 online statutory filing fee'
          }
        );
        break;

      case 'workplace_employment':
        matched.push(
          {
            id: 'esc-work-1',
            name: 'Ministry of Labour & Employment SAMADHAN Portal',
            type: 'labour_commissioner',
            description: 'Official online conciliation portal for non-payment of salary, full and final settlement delays, and gratuity non-compliance.',
            criteriaMet: true,
            eligibilityDescription: 'Employees and workmen aggrieved by unlawful wage withholding or termination.',
            matchingReason: 'Statutory dispute escalation mechanism under Payment of Wages Act.',
            officialPortalUrl: 'https://samadhan.labour.gov.in',
            tollFreeNumber: '1800-11-4000',
            stepsToApply: [
              'Register grievance on samadhan.labour.gov.in',
              'Upload Offer Letter, Resignation Email, and Bank salary slips',
              'Conciliation Officer issues notice to employer for hearing'
            ],
            costEstimate: '₹0 (Free of Cost)'
          }
        );
        break;

      default:
        matched.push(
          {
            id: 'esc-gen-1',
            name: `District Legal Services Authority (DLSA) (${stateLabel})`,
            type: 'nalsa_dlsa',
            description: 'Free legal aid and pre-litigation dispute resolution for general civil grievances.',
            criteriaMet: true,
            eligibilityDescription: 'Available across all Indian districts under the Legal Services Authorities Act.',
            matchingReason: 'Universal Indian legal aid and mediation infrastructure.',
            officialPortalUrl: 'https://nalsa.gov.in',
            tollFreeNumber: '15100',
            stepsToApply: [
              'Visit nearest DLSA front office with NyaySaathi Lawyer Brief',
              'Apply for free legal consultation or mediation notice'
            ],
            costEstimate: '₹0 (Free of Cost)'
          }
        );
        break;
    }

    return matched;
  }
}
