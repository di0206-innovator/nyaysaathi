// =============================================================================
// Synthetic Demo Documents for Zero-Friction Evaluation
// =============================================================================
// These documents are entirely fictional. No real person or legal matter.
// They exist so an evaluator can immediately see the comparison engine in action.
// =============================================================================

export interface DemoDocument {
  id: string;
  title: string;
  text: string;
  category: 'rental' | 'employment';
}

export interface DemoDocumentSet {
  id: string;
  label: string;
  description: string;
  category: 'rental' | 'employment';
  documentA: DemoDocument;
  documentB: DemoDocument;
}

// ---------------------------------------------------------------------------
// Set 1: Rental Agreement v1 → v2
// ---------------------------------------------------------------------------

const RENTAL_V1_TEXT = `RESIDENTIAL RENTAL AGREEMENT

This Rental Agreement is executed on 01 July 2025 between:

Landlord: Mr. Amit Sharma, residing at 42, Park Lane, Koregaon Park, Pune, Maharashtra (hereinafter referred to as "Landlord")

Tenant: Mr. Rahul Mehta, residing at Flat 301, Sai Residency, Hinjewadi Phase 2, Pune, Maharashtra (hereinafter referred to as "Tenant")

Page 1

1. Property
The Landlord hereby grants to the Tenant a license to occupy the residential premises at Flat 301, Sai Residency, Hinjewadi Phase 2, Pune, Maharashtra 411057 for residential purposes only.

2. Term and Duration
The term of this agreement shall be 11 months commencing from 01 July 2025 and ending on 31 May 2026.

3. Rent
The monthly rent shall be Rs. 25,000 (Rupees Twenty-Five Thousand Only) payable on or before the 5th day of each calendar month via bank transfer or UPI.

Page 2

4. Security Deposit
The Tenant has paid a security deposit of Rs. 50,000 (Rupees Fifty Thousand Only) to the Landlord. This deposit is refundable in full upon termination of this agreement, subject to the condition that the premises are returned in the same condition as at the time of possession, reasonable wear and tear excepted.

5. Notice Period
Either party may terminate this agreement by providing 30 days written notice to the other party.

6. Maintenance and Repairs
The Landlord shall be responsible for all structural repairs and maintenance of the property. The Tenant shall maintain the premises in clean and habitable condition.

Page 3

7. Utilities
The Tenant shall bear the cost of electricity, water, gas, internet, and other utility charges.

8. Restrictions
The Tenant shall not sublet or assign the premises. The Tenant shall not use the premises for commercial purposes.

9. Jurisdiction
Any disputes arising out of this agreement shall be subject to the exclusive jurisdiction of courts in Pune, Maharashtra.

10. General Terms
This agreement represents the entire understanding between the parties. Any modifications must be in writing and signed by both parties.`;

const RENTAL_V2_TEXT = `RESIDENTIAL RENTAL AGREEMENT (REVISED)

This Rental Agreement is executed on 01 July 2026 between:

Landlord: Mr. Amit Sharma, residing at 42, Park Lane, Koregaon Park, Pune, Maharashtra (hereinafter referred to as "Landlord")

Tenant: Mr. Rahul Mehta, residing at Flat 301, Sai Residency, Hinjewadi Phase 2, Pune, Maharashtra (hereinafter referred to as "Tenant")

Page 1

1. Property
The Landlord hereby grants to the Tenant a license to occupy the residential premises at Flat 301, Sai Residency, Hinjewadi Phase 2, Pune, Maharashtra 411057 for residential purposes only.

2. Term and Duration
The term of this agreement shall be 11 months commencing from 01 July 2026 and ending on 31 May 2027.

3. Rent
The monthly rent shall be Rs. 28,000 (Rupees Twenty-Eight Thousand Only) payable on or before the 5th day of each calendar month via bank transfer or UPI. A late payment fee of Rs. 500 per day shall apply for payments received after the 10th of each month.

Page 2

4. Security Deposit
The Tenant has paid a security deposit of Rs. 75,000 (Rupees Seventy-Five Thousand Only) to the Landlord. This deposit is refundable upon termination of this agreement, subject to deductions for painting, deep cleaning, and any damages to the premises as assessed by the Landlord.

5. Notice Period
Either party may terminate this agreement by providing 60 days written notice to the other party.

6. Maintenance and Repairs
The Tenant shall be responsible for all maintenance of the property including minor repairs, painting, pest control, and general upkeep. The Landlord shall only be responsible for structural defects.

Page 3

7. Utilities
The Tenant shall bear the cost of electricity, water, gas, internet, and other utility charges.

8. Restrictions
The Tenant shall not sublet or assign the premises. The Tenant shall not use the premises for commercial purposes. The Tenant shall not host overnight guests for more than 3 consecutive days without prior written approval from the Landlord.

9. Guest Policy
All visitors must vacate the premises by 10 PM. The Tenant shall maintain a visitor log and provide access to the Landlord or property manager upon request.

Page 4

10. Penalty for Early Termination
In the event the Tenant terminates this agreement before the expiry of the term, the Tenant shall forfeit the entire security deposit as liquidated damages.

11. Jurisdiction
Any disputes arising out of this agreement shall be subject to the exclusive jurisdiction of courts in Mumbai, Maharashtra.

12. General Terms
This agreement represents the entire understanding between the parties. Any modifications must be in writing and signed by both parties.`;

// ---------------------------------------------------------------------------
// Set 2: Employment Contract v1 → v2
// ---------------------------------------------------------------------------

const EMPLOYMENT_V1_TEXT = `EMPLOYMENT CONTRACT

This Employment Contract is executed on 15 March 2025 between:

Employer: TechServe Solutions Pvt. Ltd., registered at 12th Floor, Prestige Tower, MG Road, Bengaluru, Karnataka 560001 (hereinafter referred to as "Company")

Employee: Ms. Priya Krishnan, residing at 204, Lakshmi Apartments, HSR Layout, Bengaluru, Karnataka (hereinafter referred to as "Employee")

Page 1

1. Position and Duties
The Employee is appointed as Senior Software Engineer and shall perform duties as assigned by the reporting manager.

2. Compensation
The annual compensation (CTC) shall be Rs. 18,00,000 (Rupees Eighteen Lakhs Only) payable monthly in arrears after applicable tax deductions.

3. Probation Period
The Employee shall serve a probation period of 3 months from the date of joining.

Page 2

4. Working Hours
The standard working hours are 9:00 AM to 6:00 PM, Monday through Friday. Reasonable overtime may be required during project deadlines.

5. Notice Period
Either party may terminate this employment by providing 30 days written notice or payment of salary in lieu of notice.

6. Leave Policy
The Employee is entitled to 24 days of paid leave per calendar year, inclusive of 12 casual leaves and 12 earned leaves.

Page 3

7. Confidentiality
The Employee agrees to maintain strict confidentiality of all proprietary information, trade secrets, and business processes of the Company during and after employment.

8. Intellectual Property
All work product, inventions, and intellectual property created during the course of employment shall be the exclusive property of the Company.

9. Performance Review
Annual performance reviews shall be conducted in March of each year. Compensation revision, if any, shall be effective from April.

Page 4

10. Dispute Resolution
Any disputes arising from this contract shall be resolved through mutual discussion. If unresolved, the matter shall be referred to arbitration in Bengaluru under the Arbitration and Conciliation Act, 1996.

11. Governing Law
This contract shall be governed by and construed in accordance with the laws of India and subject to the jurisdiction of courts in Bengaluru, Karnataka.`;

const EMPLOYMENT_V2_TEXT = `EMPLOYMENT CONTRACT (REVISED)

This Employment Contract is executed on 15 March 2026 between:

Employer: TechServe Solutions Pvt. Ltd., registered at 12th Floor, Prestige Tower, MG Road, Bengaluru, Karnataka 560001 (hereinafter referred to as "Company")

Employee: Ms. Priya Krishnan, residing at 204, Lakshmi Apartments, HSR Layout, Bengaluru, Karnataka (hereinafter referred to as "Employee")

Page 1

1. Position and Duties
The Employee is appointed as Senior Software Engineer and shall perform duties as assigned by the reporting manager.

2. Compensation
The annual compensation (CTC) shall be Rs. 22,00,000 (Rupees Twenty-Two Lakhs Only) payable monthly in arrears after applicable tax deductions. A performance bonus of up to 15% of CTC may be awarded at the Company's discretion based on annual performance metrics.

3. Probation Period
The Employee shall serve a probation period of 6 months from the date of joining. During probation, either party may terminate with 7 days notice.

Page 2

4. Working Hours
The standard working hours are 9:00 AM to 6:00 PM, Monday through Friday. The Company reserves the right to require weekend work during critical project phases with compensatory time off.

5. Notice Period
Either party may terminate this employment by providing 90 days written notice. Payment of salary in lieu of notice is at the sole discretion of the Company.

6. Leave Policy
The Employee is entitled to 18 days of paid leave per calendar year, inclusive of 8 casual leaves and 10 earned leaves.

Page 3

7. Confidentiality
The Employee agrees to maintain strict confidentiality of all proprietary information, trade secrets, and business processes of the Company during and for a period of 24 months after employment.

8. Intellectual Property
All work product, inventions, and intellectual property created during the course of employment or using Company resources shall be the exclusive property of the Company.

9. Non-Compete Clause
The Employee agrees that for a period of 12 months after termination of employment, the Employee shall not directly or indirectly engage in, be employed by, or provide services to any competing business within India.

Page 4

10. Performance Review
Annual performance reviews shall be conducted in March of each year. Compensation revision, if any, shall be effective from April and is contingent upon meeting performance targets.

11. Dispute Resolution
Any disputes arising from this contract shall be resolved through mutual discussion. If unresolved, the matter shall be referred to arbitration in Bengaluru under the Arbitration and Conciliation Act, 1996.

12. Governing Law
This contract shall be governed by and construed in accordance with the laws of India and subject to the jurisdiction of courts in Bengaluru, Karnataka.

13. Termination for Cause
The Company reserves the right to terminate employment without notice in cases of gross misconduct, breach of confidentiality, fraud, or any criminal activity.`;

// ---------------------------------------------------------------------------
// Exported Demo Document Sets
// ---------------------------------------------------------------------------

export const DEMO_DOCUMENT_SETS: DemoDocumentSet[] = [
  {
    id: 'demo-rental',
    label: 'Rental Agreement',
    description: 'Compare two versions of a residential rental agreement with changes to deposit, notice period, maintenance, and guest restrictions.',
    category: 'rental',
    documentA: {
      id: 'demo-rental-v1',
      title: 'Rental Agreement v1 (Original)',
      text: RENTAL_V1_TEXT,
      category: 'rental',
    },
    documentB: {
      id: 'demo-rental-v2',
      title: 'Rental Agreement v2 (Revised)',
      text: RENTAL_V2_TEXT,
      category: 'rental',
    },
  },
  {
    id: 'demo-employment',
    label: 'Employment Contract',
    description: 'Compare two versions of an employment contract with changes to compensation, notice period, non-compete, and leave policy.',
    category: 'employment',
    documentA: {
      id: 'demo-employment-v1',
      title: 'Employment Contract v1 (Original)',
      text: EMPLOYMENT_V1_TEXT,
      category: 'employment',
    },
    documentB: {
      id: 'demo-employment-v2',
      title: 'Employment Contract v2 (Revised)',
      text: EMPLOYMENT_V2_TEXT,
      category: 'employment',
    },
  },
];

export function getDemoDocumentSet(id: string): DemoDocumentSet | undefined {
  return DEMO_DOCUMENT_SETS.find(s => s.id === id);
}
