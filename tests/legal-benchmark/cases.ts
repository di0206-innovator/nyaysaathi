export interface LegalBenchmarkCase {
  id: string;
  title: string;
  category: string;
  state: string;
  userStory: string;
  claimAmount?: number;
  expected: {
    category: string;
    statutes: string[];
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    limitationMonths: number;
    requiredEvidence: string[];
    escalationForum: string;
    statutoryNoticeRequired?: boolean;
    noticePeriodDays?: number;
  };
}

export const LEGAL_BENCHMARK_100_CASES: LegalBenchmarkCase[] = [
  // =========================================================================
  // 1. TENANCY & HOUSING (20 CASES)
  // =========================================================================
  {
    id: 'CASE-TEN-01',
    title: 'Bengaluru 2BHK Security Deposit Withholding',
    category: 'tenancy_housing',
    state: 'Karnataka',
    userStory: 'Vacated apartment in Koramangala, Bengaluru with 30-day email notice. Owner inspected and confirmed zero damage, but is withholding ₹75,000 deposit citing painting and new tenant search.',
    claimAmount: 75000,
    expected: {
      category: 'tenancy_housing',
      statutes: ['Indian Contract Act, 1872', 'Karnataka Rent Act', 'Model Tenancy Act'],
      riskLevel: 'MEDIUM',
      limitationMonths: 36,
      requiredEvidence: ['Rental Agreement', 'Move-out Handover Acknowledgment', 'Bank Statement / NEFT Proof'],
      escalationForum: 'Civil Court (Summary Suit) / Rent Authority'
    }
  },
  {
    id: 'CASE-TEN-02',
    title: 'Mumbai Leave and License Painting Forfeiture',
    category: 'tenancy_housing',
    state: 'Maharashtra',
    userStory: 'Completed 22-month leave and license in Bandra, Mumbai. Licensor deducted ₹60,000 for full house repainting despite clause stating normal wear and tear excluded.',
    claimAmount: 60000,
    expected: {
      category: 'tenancy_housing',
      statutes: ['Maharashtra Rent Control Act', 'Indian Contract Act, 1872'],
      riskLevel: 'MEDIUM',
      limitationMonths: 36,
      requiredEvidence: ['Registered Leave & License Agreement', 'Move-out Inspection Report'],
      escalationForum: 'Small Causes Court / Civil Court'
    }
  },
  {
    id: 'CASE-TEN-03',
    title: 'Delhi Unlawful Eviction and Lockout',
    category: 'tenancy_housing',
    state: 'Delhi',
    userStory: 'Landlord in Lajpat Nagar locked tenant out and disconnected electricity while tenant was away at work because tenant refused a mid-lease 30% rent hike.',
    expected: {
      category: 'tenancy_housing',
      statutes: ['Delhi Rent Control Act', 'Transfer of Property Act, 1882'],
      riskLevel: 'HIGH',
      limitationMonths: 36,
      requiredEvidence: ['Lease Deed', 'Police Complaint Copy', 'Proof of Disconnection'],
      escalationForum: 'Rent Controller / Civil Court'
    }
  },
  {
    id: 'CASE-TEN-04',
    title: 'Pune Unverified Society Maintenance Deduction',
    category: 'tenancy_housing',
    state: 'Maharashtra',
    userStory: 'Landlord deducted ₹40,000 from deposit claiming past pending society maintenance charges that the landlord was obligated to pay under agreement.',
    claimAmount: 40000,
    expected: {
      category: 'tenancy_housing',
      statutes: ['Indian Contract Act, 1872', 'Maharashtra Rent Control Act'],
      riskLevel: 'LOW',
      limitationMonths: 36,
      requiredEvidence: ['Rental Agreement', 'Society Maintenance Receipts'],
      escalationForum: 'Small Causes Court'
    }
  },
  {
    id: 'CASE-TEN-05',
    title: 'Hyderabad Unilateral Rent Hike Dispute',
    category: 'tenancy_housing',
    state: 'Telangana',
    userStory: 'Landlord in Hitec City demanding 25% escalation at month 6 of 11-month fixed agreement with threat of eviction within 7 days.',
    expected: {
      category: 'tenancy_housing',
      statutes: ['Transfer of Property Act, 1882', 'Indian Contract Act, 1872'],
      riskLevel: 'HIGH',
      limitationMonths: 36,
      requiredEvidence: ['Signed Tenancy Agreement', 'WhatsApp/Email Demands'],
      escalationForum: 'Rent Controller / Civil Court'
    }
  },
  {
    id: 'CASE-TEN-06',
    title: 'Chennai Failure to Return Advance Post Handover',
    category: 'tenancy_housing',
    state: 'Tamil Nadu',
    userStory: 'Handed over keys of Anna Nagar flat 45 days ago. Landlord acknowledged handover on WhatsApp but stops taking calls for ₹1,20,000 advance refund.',
    claimAmount: 120000,
    expected: {
      category: 'tenancy_housing',
      statutes: ['Tamil Nadu Buildings (Lease and Rent Control) Act', 'Indian Contract Act, 1872'],
      riskLevel: 'MEDIUM',
      limitationMonths: 36,
      requiredEvidence: ['Tenancy Agreement', 'Handover Chat', 'Bank Account Statement'],
      escalationForum: 'Rent Court / Civil Court'
    }
  },
  {
    id: 'CASE-TEN-07',
    title: 'Noida Penalty Deduction Despite 30-Day Notice',
    category: 'tenancy_housing',
    state: 'Uttar Pradesh',
    userStory: 'Served 30 days notice by registered email. Landlord deducted 1 month rent as penalty asserting notice must be given on the 1st of the calendar month.',
    claimAmount: 28000,
    expected: {
      category: 'tenancy_housing',
      statutes: ['Indian Contract Act, 1872', 'Transfer of Property Act, 1882'],
      riskLevel: 'LOW',
      limitationMonths: 36,
      requiredEvidence: ['Lease Contract', 'Timestamped Notice Email'],
      escalationForum: 'Civil Court'
    }
  },
  {
    id: 'CASE-TEN-08',
    title: 'Gurugram Seepage Damage Deduction',
    category: 'tenancy_housing',
    state: 'Haryana',
    userStory: 'Landlord in Sector 57 Gurugram withheld ₹85,000 deposit for wall dampness caused by external rainwater terrace leakage.',
    claimAmount: 85000,
    expected: {
      category: 'tenancy_housing',
      statutes: ['Indian Contract Act, 1872', 'Transfer of Property Act, 1882'],
      riskLevel: 'MEDIUM',
      limitationMonths: 36,
      requiredEvidence: ['Rental Agreement', 'Structural Seepage Photographs'],
      escalationForum: 'Civil Court'
    }
  },
  {
    id: 'CASE-TEN-09',
    title: 'Kolkata Illegal Eviction Threat During Term',
    category: 'tenancy_housing',
    state: 'West Bengal',
    userStory: 'Landlord sent goons to force tenant to vacate Kolkata residential premises without any notice or judicial process.',
    expected: {
      category: 'tenancy_housing',
      statutes: ['West Bengal Premises Tenancy Act', 'Bharatiya Nyaya Sanhita, 2023'],
      riskLevel: 'HIGH',
      limitationMonths: 36,
      requiredEvidence: ['Tenancy Agreement', 'Police Complaint (e-FIR)'],
      escalationForum: 'Civil Court / Police Station'
    }
  },
  {
    id: 'CASE-TEN-10',
    title: 'Ahmedabad Refusal to Provide Rent Receipts',
    category: 'tenancy_housing',
    state: 'Gujarat',
    userStory: 'Landlord in Navrangpura received rent via cash/bank for 2 years but consistently refuses to sign rent receipts needed for HRA tax exemption.',
    expected: {
      category: 'tenancy_housing',
      statutes: ['Model Tenancy Act', 'Transfer of Property Act, 1882'],
      riskLevel: 'LOW',
      limitationMonths: 36,
      requiredEvidence: ['Bank Transfer Slips', 'Communication Demanding Receipts'],
      escalationForum: 'Rent Authority'
    }
  },
  {
    id: 'CASE-TEN-11',
    title: 'Bengaluru Model Tenancy Act Excessive Deposit',
    category: 'tenancy_housing',
    state: 'Karnataka',
    userStory: 'New lease in Whitefield demanding 10 months security deposit (₹4,50,000) contrary to Model Tenancy framework advisory limits.',
    claimAmount: 450000,
    expected: {
      category: 'tenancy_housing',
      statutes: ['Model Tenancy Act', 'Karnataka Rent Act'],
      riskLevel: 'LOW',
      limitationMonths: 36,
      requiredEvidence: ['Draft Tenancy Agreement'],
      escalationForum: 'Rent Authority'
    }
  },
  {
    id: 'CASE-TEN-12',
    title: 'Mumbai Delay in Refunding Deposit After Society Clearance',
    category: 'tenancy_housing',
    state: 'Maharashtra',
    userStory: 'Society issued move-out clearance certificate in Andheri West, but landlord delaying ₹1,00,000 refund claiming funds invested in fixed deposit.',
    claimAmount: 100000,
    expected: {
      category: 'tenancy_housing',
      statutes: ['Maharashtra Rent Control Act', 'Indian Contract Act, 1872'],
      riskLevel: 'MEDIUM',
      limitationMonths: 36,
      requiredEvidence: ['Society Move-out NOC', 'Registered License Agreement'],
      escalationForum: 'Small Causes Court'
    }
  },
  {
    id: 'CASE-TEN-13',
    title: 'Jaipur Sudden Eviction Notice Without Cause',
    category: 'tenancy_housing',
    state: 'Rajasthan',
    userStory: 'Landlord issued 3-day notice to vacate Jaipur flat without specifying breach of lease covenants.',
    expected: {
      category: 'tenancy_housing',
      statutes: ['Rajasthan Rent Control Act', 'Transfer of Property Act, 1882'],
      riskLevel: 'HIGH',
      limitationMonths: 36,
      requiredEvidence: ['Rental Agreement', '3-Day Eviction Notice'],
      escalationForum: 'Rent Tribunal'
    }
  },
  {
    id: 'CASE-TEN-14',
    title: 'Kochi Commercial Tenancy Advance Withholding',
    category: 'tenancy_housing',
    state: 'Kerala',
    userStory: 'Commercial retail tenant vacated showroom after lease expiry; landlord withholding ₹3,00,000 commercial advance without justification.',
    claimAmount: 300000,
    expected: {
      category: 'tenancy_housing',
      statutes: ['Indian Contract Act, 1872', 'Transfer of Property Act, 1882'],
      riskLevel: 'MEDIUM',
      limitationMonths: 36,
      requiredEvidence: ['Commercial Lease Deed', 'Vacant Possession Handover Note'],
      escalationForum: 'Commercial Court / Civil Court'
    }
  },
  {
    id: 'CASE-TEN-15',
    title: 'Chandigarh Co-tenant Deposit Misappropriation',
    category: 'tenancy_housing',
    state: 'Punjab',
    userStory: 'Lead tenant received full security deposit from landlord upon lease surrender but refused to transfer ₹35,000 share to departing flatmate.',
    claimAmount: 35000,
    expected: {
      category: 'tenancy_housing',
      statutes: ['Indian Contract Act, 1872', 'Bharatiya Nyaya Sanhita, 2023'],
      riskLevel: 'LOW',
      limitationMonths: 36,
      requiredEvidence: ['Internal Agreement / Chat', 'Bank Transfer Proof'],
      escalationForum: 'Civil Court'
    }
  },
  {
    id: 'CASE-TEN-16',
    title: 'Bengaluru Non-Functional Lift Amenity Abatement',
    category: 'tenancy_housing',
    state: 'Karnataka',
    userStory: '4th floor apartment elevator non-functional for 4 months; elderly tenant seeking rent abatement under contractual amenity promises.',
    expected: {
      category: 'tenancy_housing',
      statutes: ['Karnataka Rent Act', 'Indian Contract Act, 1872'],
      riskLevel: 'LOW',
      limitationMonths: 36,
      requiredEvidence: ['Rental Agreement specifying lift amenity', 'Service Complaints'],
      escalationForum: 'Rent Court'
    }
  },
  {
    id: 'CASE-TEN-17',
    title: 'Lucknow Disconnection of Water Supply',
    category: 'tenancy_housing',
    state: 'Uttar Pradesh',
    userStory: 'Landlord in Lucknow disconnected municipal water connection to coerce tenant into accepting unfair terms.',
    expected: {
      category: 'tenancy_housing',
      statutes: ['UP Urban Buildings Act', 'Transfer of Property Act, 1882'],
      riskLevel: 'HIGH',
      limitationMonths: 36,
      requiredEvidence: ['Tenancy Agreement', 'Proof of Disconnection'],
      escalationForum: 'Civil Court / Rent Authority'
    }
  },
  {
    id: 'CASE-TEN-18',
    title: 'Indore Pre-existing Paint Damage Withholding',
    category: 'tenancy_housing',
    state: 'Madhya Pradesh',
    userStory: 'Landlord deducted ₹25,000 for paint peeling documented in move-in video recording 11 months prior.',
    claimAmount: 25000,
    expected: {
      category: 'tenancy_housing',
      statutes: ['Indian Contract Act, 1872'],
      riskLevel: 'LOW',
      limitationMonths: 36,
      requiredEvidence: ['Move-in Video/Photos', 'Agreement'],
      escalationForum: 'Small Causes / Civil Court'
    }
  },
  {
    id: 'CASE-TEN-19',
    title: 'Patna Unlawful Detention of Personal Effects',
    category: 'tenancy_housing',
    state: 'Bihar',
    userStory: 'Landlord padlocked tenant room containing laptop, certificates, and books over disputed ₹2,000 electricity surcharge.',
    expected: {
      category: 'tenancy_housing',
      statutes: ['Bharatiya Nyaya Sanhita, 2023', 'Bihar Buildings Lease Control Act'],
      riskLevel: 'HIGH',
      limitationMonths: 36,
      requiredEvidence: ['Tenancy Receipt', 'Police Complaint'],
      escalationForum: 'Police Station / Civil Court'
    }
  },
  {
    id: 'CASE-TEN-20',
    title: 'Goa Long Stay Deposit Forfeiture Dispute',
    category: 'tenancy_housing',
    state: 'Goa',
    userStory: '6-month villa lease in Candolim concluded; owner deducted ₹50,000 caution deposit claiming AC servicing costs.',
    claimAmount: 50000,
    expected: {
      category: 'tenancy_housing',
      statutes: ['Indian Contract Act, 1872', 'Transfer of Property Act, 1882'],
      riskLevel: 'LOW',
      limitationMonths: 36,
      requiredEvidence: ['Villa Rental Contract', 'AC Servicing Clause'],
      escalationForum: 'Civil Court'
    }
  },

  // =========================================================================
  // 2. CONSUMER DISPUTES (15 CASES)
  // =========================================================================
  {
    id: 'CASE-CON-01',
    title: 'Defective LED TV Display Replacement Refusal',
    category: 'consumer_dispute',
    state: 'Karnataka',
    userStory: 'Purchased 55-inch smart TV for ₹52,000. Screen developed vertical green lines within 30 days. Service center refused warranty claim alleging customer physical pressure without inspection proof.',
    claimAmount: 52000,
    expected: {
      category: 'consumer_dispute',
      statutes: ['Consumer Protection Act, 2019'],
      riskLevel: 'MEDIUM',
      limitationMonths: 24,
      requiredEvidence: ['Tax Invoice', 'Job Sheet / Denial Email', 'Warranty Card'],
      escalationForum: 'District Consumer Disputes Redressal Commission (e-Daakhil)',
      statutoryNoticeRequired: false,
      noticePeriodDays: 15
    }
  },
  {
    id: 'CASE-CON-02',
    title: 'Smartphone Repeated Motherboard Failure Under Warranty',
    category: 'consumer_dispute',
    state: 'Delhi',
    userStory: 'Flagship phone worth ₹84,000 failed 3 times within 6 months. Authorized center kept phone for 75 cumulative days without replacement.',
    claimAmount: 84000,
    expected: {
      category: 'consumer_dispute',
      statutes: ['Consumer Protection Act, 2019'],
      riskLevel: 'MEDIUM',
      limitationMonths: 24,
      requiredEvidence: ['Invoice', 'Service Center Receipts'],
      escalationForum: 'District Consumer Commission'
    }
  },
  {
    id: 'CASE-CON-03',
    title: 'E-commerce Delivered Counterfeit Watch',
    category: 'consumer_dispute',
    state: 'Maharashtra',
    userStory: 'Ordered branded watch for ₹18,500 on major e-commerce marketplace. Certified fake by authorized brand boutique; seller and platform reject refund.',
    claimAmount: 18500,
    expected: {
      category: 'consumer_dispute',
      statutes: ['Consumer Protection Act, 2019'],
      riskLevel: 'HIGH',
      limitationMonths: 24,
      requiredEvidence: ['Tax Invoice', 'Brand Authenticity Certificate', 'Packaging Photos'],
      escalationForum: 'District Consumer Commission / National Consumer Helpline'
    }
  },
  {
    id: 'CASE-CON-04',
    title: 'Airline Cancellation Denial of Mandatory DGCA Refund',
    category: 'consumer_dispute',
    state: 'Tamil Nadu',
    userStory: 'Airline cancelled domestic flight Chennai-Delhi without operational reason; issued unusable travel credit shell instead of full bank refund mandated by DGCA CAR.',
    claimAmount: 14000,
    expected: {
      category: 'consumer_dispute',
      statutes: ['Consumer Protection Act, 2019'],
      riskLevel: 'LOW',
      limitationMonths: 24,
      requiredEvidence: ['Flight Ticket', 'Cancellation Notice', 'DGCA Complaint Copy'],
      escalationForum: 'District Consumer Commission'
    }
  },
  {
    id: 'CASE-CON-05',
    title: 'Hospital Inflated Pharmacy Billing & Consumer Harassment',
    category: 'consumer_dispute',
    state: 'Uttar Pradesh',
    userStory: 'Private hospital charged ₹1,15,000 above approved package estimate for unprescribed consumable kits and refused discharge until paid in cash.',
    claimAmount: 115000,
    expected: {
      category: 'consumer_dispute',
      statutes: ['Consumer Protection Act, 2019'],
      riskLevel: 'HIGH',
      limitationMonths: 24,
      requiredEvidence: ['Hospital Bill Breakdown', 'Insurance Pre-authorization'],
      escalationForum: 'District Consumer Commission'
    }
  },
  {
    id: 'CASE-CON-06',
    title: 'Electric Scooter Battery Degradation Under 3-Year Warranty',
    category: 'consumer_dispute',
    state: 'Telangana',
    userStory: 'Electric two-wheeler battery capacity degraded to 30% range within 14 months of purchase; manufacturer refuses replacement citing vague riding habit exception.',
    claimAmount: 135000,
    expected: {
      category: 'consumer_dispute',
      statutes: ['Consumer Protection Act, 2019'],
      riskLevel: 'MEDIUM',
      limitationMonths: 24,
      requiredEvidence: ['Sales Invoice', 'Battery Warranty Card', 'Diagnostics Report'],
      escalationForum: 'District Consumer Commission'
    }
  },
  {
    id: 'CASE-CON-07',
    title: 'Coaching Institute Refusal of Pro-Rata Refund on Early Exit',
    category: 'consumer_dispute',
    state: 'Rajasthan',
    userStory: 'Kota coaching institute collected ₹1,80,000 2-year advance fee; student exited after 1 month due to health. Institute refused refund violating CCPA coaching guidelines.',
    claimAmount: 150000,
    expected: {
      category: 'consumer_dispute',
      statutes: ['Consumer Protection Act, 2019'],
      riskLevel: 'MEDIUM',
      limitationMonths: 24,
      requiredEvidence: ['Fee Receipt', 'Exit Application', 'Medical Records'],
      escalationForum: 'District Consumer Commission'
    }
  },
  {
    id: 'CASE-CON-08',
    title: 'Air Conditioner Defective Compressor at Installation',
    category: 'consumer_dispute',
    state: 'Gujarat',
    userStory: 'Brand new 1.5-ton split AC failed to cool on day 1. Technician marked compressor dead-on-arrival (DOA) but dealer refuses to dispatch replacement unit.',
    claimAmount: 38000,
    expected: {
      category: 'consumer_dispute',
      statutes: ['Consumer Protection Act, 2019'],
      riskLevel: 'LOW',
      limitationMonths: 24,
      requiredEvidence: ['Invoice', 'Installation Job Sheet marking DOA'],
      escalationForum: 'District Consumer Commission'
    }
  },
  {
    id: 'CASE-CON-09',
    title: 'Packaged Food Item Delivered Beyond Expiry Date',
    category: 'consumer_dispute',
    state: 'West Bengal',
    userStory: 'Quick commerce delivery delivered infant formula 2 months past expiration, leading to acute child illness and emergency medical expenses.',
    claimAmount: 25000,
    expected: {
      category: 'consumer_dispute',
      statutes: ['Consumer Protection Act, 2019'],
      riskLevel: 'HIGH',
      limitationMonths: 24,
      requiredEvidence: ['Order Details', 'Packaging Batch / Expiry Photo', 'Hospital Prescription'],
      escalationForum: 'District Consumer Commission'
    }
  },
  {
    id: 'CASE-CON-10',
    title: 'Courier Lost Critical University Degree Transcript',
    category: 'consumer_dispute',
    state: 'Punjab',
    userStory: 'Courier service lost original degree certificate dispatched to foreign credential evaluator; offering only ₹100 liability cap under unfair contract clause.',
    claimAmount: 50000,
    expected: {
      category: 'consumer_dispute',
      statutes: ['Consumer Protection Act, 2019'],
      riskLevel: 'MEDIUM',
      limitationMonths: 24,
      requiredEvidence: ['Consignment Booking Receipt', 'Non-delivery Confirmation'],
      escalationForum: 'District Consumer Commission'
    }
  },
  {
    id: 'CASE-CON-11',
    title: 'Health Insurance Claim Rejected for Frivolous Non-Disclosure',
    category: 'consumer_dispute',
    state: 'Maharashtra',
    userStory: 'Cashless medical claim of ₹2,80,000 for emergency appendectomy repudiated by insurer claiming non-disclosure of mild myopia.',
    claimAmount: 280000,
    expected: {
      category: 'consumer_dispute',
      statutes: ['Consumer Protection Act, 2019'],
      riskLevel: 'HIGH',
      limitationMonths: 24,
      requiredEvidence: ['Insurance Policy Schedule', 'Repudiation Letter', 'Discharge Summary'],
      escalationForum: 'District Consumer Commission / Insurance Ombudsman'
    }
  },
  {
    id: 'CASE-CON-12',
    title: 'Automobile Dealership Unreasonable Delivery Delay',
    category: 'consumer_dispute',
    state: 'Haryana',
    userStory: 'Booked car paying full on-road price of ₹12,50,000 with promised 14-day delivery; 7 months passed without vehicle allocation.',
    claimAmount: 1250000,
    expected: {
      category: 'consumer_dispute',
      statutes: ['Consumer Protection Act, 2019'],
      riskLevel: 'MEDIUM',
      limitationMonths: 24,
      requiredEvidence: ['Booking Order', 'Full Payment Bank Acknowledgment'],
      escalationForum: 'District Consumer Commission'
    }
  },
  {
    id: 'CASE-CON-13',
    title: 'Online Hotel Booking Cancelled at Check-in Desk',
    category: 'consumer_dispute',
    state: 'Goa',
    userStory: 'Prepaid 4-night stay worth ₹32,000 turned away at 11 PM by hotel stating OTA overbooked property; forced to pay ₹75,000 for emergency alternate lodging.',
    claimAmount: 75000,
    expected: {
      category: 'consumer_dispute',
      statutes: ['Consumer Protection Act, 2019'],
      riskLevel: 'MEDIUM',
      limitationMonths: 24,
      requiredEvidence: ['Prepaid Hotel Voucher', 'Emergency Hotel Receipt'],
      escalationForum: 'District Consumer Commission'
    }
  },
  {
    id: 'CASE-CON-14',
    title: 'Laptop Unauthorized Service Center Component Damage',
    category: 'consumer_dispute',
    state: 'Karnataka',
    userStory: 'Sent laptop for screen hinge repair; service center damaged motherboard traces and demanded ₹24,000 extra for replacement motherboard.',
    claimAmount: 65000,
    expected: {
      category: 'consumer_dispute',
      statutes: ['Consumer Protection Act, 2019'],
      riskLevel: 'LOW',
      limitationMonths: 24,
      requiredEvidence: ['Initial Job Sheet with Condition Check', 'Damage Photographs'],
      escalationForum: 'District Consumer Commission'
    }
  },
  {
    id: 'CASE-CON-15',
    title: 'Water Purifier Annual Maintenance Contract Default',
    category: 'consumer_dispute',
    state: 'Kerala',
    userStory: 'Paid ₹4,500 for 1-year comprehensive maintenance contract including 3 mandatory filter replacements; zero visits conducted in 10 months.',
    claimAmount: 45000,
    expected: {
      category: 'consumer_dispute',
      statutes: ['Consumer Protection Act, 2019'],
      riskLevel: 'LOW',
      limitationMonths: 24,
      requiredEvidence: ['AMC Agreement / Receipt', 'Unanswered Service Requests'],
      escalationForum: 'District Consumer Commission'
    }
  },

  // =========================================================================
  // 3. RERA & REAL ESTATE (15 CASES)
  // =========================================================================
  {
    id: 'CASE-RER-01',
    title: 'Bengaluru Apartment Handover Delayed by 3 Years',
    category: 'property_rera',
    state: 'Karnataka',
    userStory: 'Builder in Sarjapur, Bengaluru promised flat handover by December 2021 as per agreement for sale. As of 2025, building incomplete; developer refuses delay interest under Section 18.',
    claimAmount: 3500000,
    expected: {
      category: 'property_rera',
      statutes: ['Real Estate (Regulation and Development) Act, 2016 (RERA)'],
      riskLevel: 'HIGH',
      limitationMonths: 36,
      requiredEvidence: ['Agreement for Sale', 'Payment Receipts', 'RERA Registration Certificate'],
      escalationForum: 'Karnataka RERA Authority (Form M / Form N)'
    }
  },
  {
    id: 'CASE-RER-02',
    title: 'Mumbai Alteration of Sanctioned Building Plan',
    category: 'property_rera',
    state: 'Maharashtra',
    userStory: 'Promoter altered layout to add 4 additional floors and convert promised ground floor open garden into commercial shops without 2/3rd allottee consent.',
    expected: {
      category: 'property_rera',
      statutes: ['Real Estate (Regulation and Development) Act, 2016 (RERA)'],
      riskLevel: 'HIGH',
      limitationMonths: 36,
      requiredEvidence: ['Original Registered Agreement', 'Original Sanctioned Plan', 'Revised Plan'],
      escalationForum: 'MahaRERA Authority'
    }
  },
  {
    id: 'CASE-RER-03',
    title: 'Noida Escrow Account Fund Diversion by Builder',
    category: 'property_rera',
    state: 'Uttar Pradesh',
    userStory: 'Builder collected 90% funds from buyers into corporate general account rather than mandatory 70% project escrow account, resulting in project insolvency.',
    expected: {
      category: 'property_rera',
      statutes: ['Real Estate (Regulation and Development) Act, 2016 (RERA)'],
      riskLevel: 'HIGH',
      limitationMonths: 36,
      requiredEvidence: ['Bank Payment Receipts', 'UP RERA Project Financial Filing'],
      escalationForum: 'UP RERA Authority'
    }
  },
  {
    id: 'CASE-RER-04',
    title: 'Gurugram Unilateral Super Area Demands Before Key Handover',
    category: 'property_rera',
    state: 'Haryana',
    userStory: 'Developer demanding ₹8,50,000 for unexpected 12% increase in super area before granting possession key without any increase in carpet area.',
    claimAmount: 850000,
    expected: {
      category: 'property_rera',
      statutes: ['Real Estate (Regulation and Development) Act, 2016 (RERA)'],
      riskLevel: 'MEDIUM',
      limitationMonths: 36,
      requiredEvidence: ['Builder-Buyer Agreement with Carpet Area Clause', 'Possession Demand Letter'],
      escalationForum: 'Haryana RERA (HRERA)'
    }
  },
  {
    id: 'CASE-RER-05',
    title: 'Pune Refusal of Monthly Delay Compensation under Section 18',
    category: 'property_rera',
    state: 'Maharashtra',
    userStory: 'Possession delayed by 18 months; buyer opted to stay in project but builder refuses to credit monthly SBI MCLR+2% delay interest against balance installment.',
    claimAmount: 420000,
    expected: {
      category: 'property_rera',
      statutes: ['Real Estate (Regulation and Development) Act, 2016 (RERA)'],
      riskLevel: 'MEDIUM',
      limitationMonths: 36,
      requiredEvidence: ['Allotment Agreement', 'SBI MCLR Interest Calculation Sheet'],
      escalationForum: 'MahaRERA Authority'
    }
  },
  {
    id: 'CASE-RER-06',
    title: 'Hyderabad Unapproved Layout Plot Sale Violation',
    category: 'property_rera',
    state: 'Telangana',
    userStory: 'Developer marketed and collected ₹15,00,000 token advance for farmland villa plots without obtaining HMDA layout sanction or TG-RERA registration.',
    claimAmount: 1500000,
    expected: {
      category: 'property_rera',
      statutes: ['Real Estate (Regulation and Development) Act, 2016 (RERA)'],
      riskLevel: 'HIGH',
      limitationMonths: 36,
      requiredEvidence: ['Booking Advance Receipt', 'Marketing Brochure'],
      escalationForum: 'Telangana RERA Authority'
    }
  },
  {
    id: 'CASE-RER-07',
    title: 'Chennai Possession Offered Without Occupancy Certificate (OC)',
    category: 'property_rera',
    state: 'Tamil Nadu',
    userStory: 'Promoter forcing buyers to take fit-out possession and pay maintenance without obtaining statutory Occupancy Certificate from CMDA.',
    expected: {
      category: 'property_rera',
      statutes: ['Real Estate (Regulation and Development) Act, 2016 (RERA)'],
      riskLevel: 'HIGH',
      limitationMonths: 36,
      requiredEvidence: ['Construction Agreement', 'Notice Demanding Possession without OC'],
      escalationForum: 'TNRERA Authority'
    }
  },
  {
    id: 'CASE-RER-08',
    title: 'Kolkata Carpet Area Deficit of 14%',
    category: 'property_rera',
    state: 'West Bengal',
    userStory: 'Physical architectural measurement reveals actual net usable carpet area is 860 sq ft against 1000 sq ft contracted in registered agreement.',
    claimAmount: 980000,
    expected: {
      category: 'property_rera',
      statutes: ['Real Estate (Regulation and Development) Act, 2016 (RERA)'],
      riskLevel: 'MEDIUM',
      limitationMonths: 36,
      requiredEvidence: ['Registered Agreement for Sale', 'Architect Carpet Area Measurement Report'],
      escalationForum: 'WB RERA Authority'
    }
  },
  {
    id: 'CASE-RER-09',
    title: 'Ahmedabad Developer Failure to Form Society Post Possession',
    category: 'property_rera',
    state: 'Gujarat',
    userStory: 'Promoter handed over flats 2 years ago but refuses to form cooperative housing society and continues extracting exorbitant maintenance for personal profit.',
    expected: {
      category: 'property_rera',
      statutes: ['Real Estate (Regulation and Development) Act, 2016 (RERA)'],
      riskLevel: 'MEDIUM',
      limitationMonths: 36,
      requiredEvidence: ['Handover Documents', 'Allottee List and Petition'],
      escalationForum: 'Gujarat RERA (GujRERA)'
    }
  },
  {
    id: 'CASE-RER-10',
    title: 'Bengaluru Retrospective GST Demand on Completed Units',
    category: 'property_rera',
    state: 'Karnataka',
    userStory: 'Developer demanding 12% GST on completed apartment that had received Completion Certificate prior to purchase agreement.',
    claimAmount: 720000,
    expected: {
      category: 'property_rera',
      statutes: ['Real Estate (Regulation and Development) Act, 2016 (RERA)'],
      riskLevel: 'LOW',
      limitationMonths: 36,
      requiredEvidence: ['Completion Certificate Date Proof', 'GST Demand Notice'],
      escalationForum: 'K-RERA Authority'
    }
  },
  {
    id: 'CASE-RER-11',
    title: 'Thane Structural Defects Within 5 Years Defect Liability',
    category: 'property_rera',
    state: 'Maharashtra',
    userStory: 'Severe RCC structural cracks and foundation water seepage emerged in 3rd year of possession; builder refuses rectification under Section 14(3).',
    expected: {
      category: 'property_rera',
      statutes: ['Real Estate (Regulation and Development) Act, 2016 (RERA)'],
      riskLevel: 'HIGH',
      limitationMonths: 36,
      requiredEvidence: ['Possession Handover Date Proof', 'Structural Audit Report'],
      escalationForum: 'MahaRERA Authority'
    }
  },
  {
    id: 'CASE-RER-12',
    title: 'Ghaziabad Arbitrary Allotment Cancellation Without Notice',
    category: 'property_rera',
    state: 'Uttar Pradesh',
    userStory: 'Buyer paid 75% installments; developer cancelled unit allotment without 30 days statutory notice when buyer questioned construction delay.',
    claimAmount: 2200000,
    expected: {
      category: 'property_rera',
      statutes: ['Real Estate (Regulation and Development) Act, 2016 (RERA)'],
      riskLevel: 'HIGH',
      limitationMonths: 36,
      requiredEvidence: ['Allotment Letter', 'Bank Payment Receipts', 'Unilateral Cancellation Letter'],
      escalationForum: 'UP RERA Authority'
    }
  },
  {
    id: 'CASE-RER-13',
    title: 'Jaipur Villa Project Promised Amenities Omitted',
    category: 'property_rera',
    state: 'Rajasthan',
    userStory: 'Promoter completed villas but failed to construct promised central clubhouse, sewage treatment plant, and solar lighting.',
    expected: {
      category: 'property_rera',
      statutes: ['Real Estate (Regulation and Development) Act, 2016 (RERA)'],
      riskLevel: 'MEDIUM',
      limitationMonths: 36,
      requiredEvidence: ['Registered Project Specifications', 'Current Site Photographs'],
      escalationForum: 'Rajasthan RERA'
    }
  },
  {
    id: 'CASE-RER-14',
    title: 'Bhubaneswar Failure to Execute Conveyance Deed',
    category: 'property_rera',
    state: 'Odisha',
    userStory: 'Full payment made 18 months ago, possession taken, but developer delaying execution and registration of sale deed citing municipal title issues.',
    expected: {
      category: 'property_rera',
      statutes: ['Real Estate (Regulation and Development) Act, 2016 (RERA)'],
      riskLevel: 'HIGH',
      limitationMonths: 36,
      requiredEvidence: ['Agreement for Sale', 'Full Payment Acknowledgment'],
      escalationForum: 'Odisha RERA Authority'
    }
  },
  {
    id: 'CASE-RER-15',
    title: 'Lucknow Commercial Retail Delivery Delayed Indefinitely',
    category: 'property_rera',
    state: 'Uttar Pradesh',
    userStory: 'Retail mall commercial space delayed by 4 years with no construction progress on site for 18 months; buyer demands full refund with interest.',
    claimAmount: 1800000,
    expected: {
      category: 'property_rera',
      statutes: ['Real Estate (Regulation and Development) Act, 2016 (RERA)'],
      riskLevel: 'HIGH',
      limitationMonths: 36,
      requiredEvidence: ['Commercial Builder Buyer Agreement', 'Payment Receipts'],
      escalationForum: 'UP RERA Authority'
    }
  },

  // =========================================================================
  // 4. EMPLOYMENT & WORKPLACE (15 CASES)
  // =========================================================================
  {
    id: 'CASE-EMP-01',
    title: 'IT Company Withholding Earned Salary and F&F Settlement',
    category: 'workplace_employment',
    state: 'Karnataka',
    userStory: 'Software developer in Bengaluru served full 60-day notice period; company withheld last 2 months salary (₹2,20,000) and gratuity due to arbitrary non-compete allegation.',
    claimAmount: 220000,
    expected: {
      category: 'workplace_employment',
      statutes: ['Payment of Wages Act, 1936', 'Karnataka Shops and Commercial Establishments Act'],
      riskLevel: 'MEDIUM',
      limitationMonths: 12,
      requiredEvidence: ['Employment Offer Letter', 'Resignation Acceptance Email', 'Relieving Letter / Notice Record'],
      escalationForum: 'Labour Commissioner / Authority under Payment of Wages Act'
    }
  },
  {
    id: 'CASE-EMP-02',
    title: 'Startup Summary Termination Without Notice Pay',
    category: 'workplace_employment',
    state: 'Delhi',
    userStory: 'Product manager terminated on the spot without 3 months notice or severance pay mandated in employment contract.',
    claimAmount: 450000,
    expected: {
      category: 'workplace_employment',
      statutes: ['Indian Contract Act, 1872', 'Delhi Shops and Establishments Act'],
      riskLevel: 'MEDIUM',
      limitationMonths: 12,
      requiredEvidence: ['Employment Contract', 'Immediate Termination Email'],
      escalationForum: 'Labour Court / Civil Court'
    }
  },
  {
    id: 'CASE-EMP-03',
    title: 'Employer PF Deduction Without EPFO Deposit',
    category: 'workplace_employment',
    state: 'Maharashtra',
    userStory: 'Company deducted 12% employee provident fund contribution every month for 18 months as per pay slips, but passbook shows zero remittance to EPFO.',
    claimAmount: 108000,
    expected: {
      category: 'workplace_employment',
      statutes: ['Employees Provident Funds and Miscellaneous Provisions Act, 1952', 'Bharatiya Nyaya Sanhita, 2023'],
      riskLevel: 'HIGH',
      limitationMonths: 36,
      requiredEvidence: ['Salary Slips showing PF Deductions', 'EPFO Passbook Statement'],
      escalationForum: 'Regional PF Commissioner / Cyber Crime / Police'
    }
  },
  {
    id: 'CASE-EMP-04',
    title: 'Denial of Statutory Maternity Benefits and Unlawful Termination',
    category: 'workplace_employment',
    state: 'Tamil Nadu',
    userStory: 'Employee applied for 26 weeks statutory maternity leave; management terminated her services citing organizational restructuring.',
    expected: {
      category: 'workplace_employment',
      statutes: ['Maternity Benefit Act, 1961'],
      riskLevel: 'HIGH',
      limitationMonths: 12,
      requiredEvidence: ['Maternity Leave Application', 'Medical Certificate', 'Termination Letter'],
      escalationForum: 'Inspector under Maternity Benefit Act / Labour Court'
    }
  },
  {
    id: 'CASE-EMP-05',
    title: 'Enforcement of Illegal Training Bond Recovery',
    category: 'workplace_employment',
    state: 'Telangana',
    userStory: 'Fresher engineer served 14 months; company withholding original academic marksheets and demanding ₹2,00,000 for leaving before 24-month unconscionable bond.',
    claimAmount: 200000,
    expected: {
      category: 'workplace_employment',
      statutes: ['Indian Contract Act, 1872'],
      riskLevel: 'HIGH',
      limitationMonths: 36,
      requiredEvidence: ['Bond Agreement Copy', 'Original Certificates Retention Letter'],
      escalationForum: 'Civil Court / Police Station'
    }
  },
  {
    id: 'CASE-EMP-06',
    title: 'Denial of Statutory Gratuity After 7 Years Service',
    category: 'workplace_employment',
    state: 'Gujarat',
    userStory: 'Manufacturing plant manager resigned after 7 years continuous service; management refuses to disburse statutory gratuity claiming minor accounting discrepancy.',
    claimAmount: 380000,
    expected: {
      category: 'workplace_employment',
      statutes: ['Payment of Gratuity Act, 1972'],
      riskLevel: 'MEDIUM',
      limitationMonths: 12,
      requiredEvidence: ['Service Certificate', 'Form I Application for Gratuity'],
      escalationForum: 'Controlling Authority under Payment of Gratuity Act'
    }
  },
  {
    id: 'CASE-EMP-07',
    title: 'Retaliatory Termination for POSH Complaint Filing',
    category: 'workplace_employment',
    state: 'Karnataka',
    userStory: 'Female associate terminated within 10 days of submitting formal sexual harassment complaint to Internal Complaints Committee.',
    expected: {
      category: 'workplace_employment',
      statutes: ['Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013'],
      riskLevel: 'HIGH',
      limitationMonths: 3,
      requiredEvidence: ['ICC Complaint Copy', 'Termination Notice'],
      escalationForum: 'Local Complaints Committee / High Court'
    }
  },
  {
    id: 'CASE-EMP-08',
    title: 'Post-Employment Non-Compete Coercion and Blacklisting',
    category: 'workplace_employment',
    state: 'Delhi',
    userStory: 'Former employer issued legal notice threatening criminal prosecution for joining a competitor in violation of post-service non-compete void under Section 27.',
    expected: {
      category: 'workplace_employment',
      statutes: ['Indian Contract Act, 1872'],
      riskLevel: 'MEDIUM',
      limitationMonths: 36,
      requiredEvidence: ['Employment Contract Clause', 'Legal Threat Notice'],
      escalationForum: 'Civil Court'
    }
  },
  {
    id: 'CASE-EMP-09',
    title: 'Unpaid Overtime Wages Exceeding Statutory Shifts',
    category: 'workplace_employment',
    state: 'Haryana',
    userStory: 'Warehouse supervisor worked 65 hours weekly for 10 months; management refused double-rate overtime compensation mandated under Factories Act.',
    claimAmount: 145000,
    expected: {
      category: 'workplace_employment',
      statutes: ['Factories Act, 1948', 'Payment of Wages Act, 1936'],
      riskLevel: 'MEDIUM',
      limitationMonths: 12,
      requiredEvidence: ['Biometric Attendance Logs', 'Salary Slips'],
      escalationForum: 'Labour Court'
    }
  },
  {
    id: 'CASE-EMP-10',
    title: 'Sudden Indefinite Layoff Without Retrenchment Compensation',
    category: 'workplace_employment',
    state: 'West Bengal',
    userStory: 'Jute mill management suspended operations indefinitely without prior notice or retrenchment compensation under Industrial Disputes Act.',
    expected: {
      category: 'workplace_employment',
      statutes: ['Industrial Disputes Act, 1947'],
      riskLevel: 'HIGH',
      limitationMonths: 12,
      requiredEvidence: ['Gate Closure Notice', 'Employment Identity Card'],
      escalationForum: 'Labour Commissioner / Industrial Tribunal'
    }
  },
  {
    id: 'CASE-EMP-11',
    title: 'Denial of Earned Leave Encashment on Superannuation',
    category: 'workplace_employment',
    state: 'Kerala',
    userStory: 'Senior accountant retired with 120 days accumulated privilege leave; company refused leave encashment in final dues.',
    claimAmount: 160000,
    expected: {
      category: 'workplace_employment',
      statutes: ['Payment of Wages Act, 1936'],
      riskLevel: 'LOW',
      limitationMonths: 12,
      requiredEvidence: ['Leave Ledger Account', 'Final Settlement Sheet'],
      escalationForum: 'Labour Authority'
    }
  },
  {
    id: 'CASE-EMP-12',
    title: 'Sales Commission Withheld Post Achieving Targets',
    category: 'workplace_employment',
    state: 'Uttar Pradesh',
    userStory: 'Medical representative achieved ₹40 Lakhs quarterly sales target; management refused contractual 5% incentive payment (₹2,00,000).',
    claimAmount: 200000,
    expected: {
      category: 'workplace_employment',
      statutes: ['Indian Contract Act, 1872'],
      riskLevel: 'LOW',
      limitationMonths: 36,
      requiredEvidence: ['Incentive Scheme Circular', 'Verified Sales Orders'],
      escalationForum: 'Civil Court'
    }
  },
  {
    id: 'CASE-EMP-13',
    title: 'Employer Refusal to Issue Relieving Letter and Experience Certificate',
    category: 'workplace_employment',
    state: 'Rajasthan',
    userStory: 'Employee resigned serving full contractual notice; employer refuses to release service certificate preventing joining new firm.',
    expected: {
      category: 'workplace_employment',
      statutes: ['Shops and Commercial Establishments Act', 'Indian Contract Act, 1872'],
      riskLevel: 'HIGH',
      limitationMonths: 12,
      requiredEvidence: ['Resignation Notice Email', 'Full Handover Acknowledgment'],
      escalationForum: 'Labour Officer / High Court'
    }
  },
  {
    id: 'CASE-EMP-14',
    title: 'Arbitrary 40% Salary Cut Imposed Without Consent',
    category: 'workplace_employment',
    state: 'Punjab',
    userStory: 'Architecture firm unilaterally slashed monthly remuneration from ₹80,000 to ₹48,000 citing general economic conditions without amended contract.',
    claimAmount: 192000,
    expected: {
      category: 'workplace_employment',
      statutes: ['Payment of Wages Act, 1936', 'Indian Contract Act, 1872'],
      riskLevel: 'MEDIUM',
      limitationMonths: 12,
      requiredEvidence: ['Employment Contract', 'Prior vs Reduced Bank Credits'],
      escalationForum: 'Labour Commissioner'
    }
  },
  {
    id: 'CASE-EMP-15',
    title: 'Freelance Software Consultant Unpaid Invoices',
    category: 'workplace_employment',
    state: 'Karnataka',
    userStory: 'Freelance backend engineer delivered complete API module; client deployed code to production but refuses to clear 3 milestone invoices worth ₹1,80,000.',
    claimAmount: 180000,
    expected: {
      category: 'workplace_employment',
      statutes: ['Indian Contract Act, 1872', 'MSMED Act, 2006'],
      riskLevel: 'MEDIUM',
      limitationMonths: 36,
      requiredEvidence: ['Consultancy Master Agreement', 'GitHub PR Approvals', 'Invoices'],
      escalationForum: 'MSEFC / Civil Court'
    }
  },

  // =========================================================================
  // 5. CHEQUE DISHONOUR / SECTION 138 NI ACT (10 CASES)
  // =========================================================================
  {
    id: 'CASE-CHQ-01',
    title: 'Business Supplier Cheque Bounced for Insufficiency',
    category: 'financial_cheque_bounce',
    state: 'Maharashtra',
    userStory: 'Retailer issued cheque for ₹3,50,000 towards hardware supplies. Cheque deposited and returned with bank memo "Funds Insufficient" dated 10 days ago.',
    claimAmount: 350000,
    expected: {
      category: 'financial_cheque_bounce',
      statutes: ['Negotiable Instruments Act, 1881'],
      riskLevel: 'HIGH',
      limitationMonths: 1,
      requiredEvidence: ['Original Dishonoured Cheque', 'Bank Return Memo', 'Invoice / Delivery Challan'],
      escalationForum: 'Metropolitan Magistrate Court',
      statutoryNoticeRequired: true,
      noticePeriodDays: 15
    }
  },
  {
    id: 'CASE-CHQ-02',
    title: 'Friendly Personal Loan Repayment Cheque Dishonoured',
    category: 'financial_cheque_bounce',
    state: 'Karnataka',
    userStory: 'Friend borrowed ₹2,00,000 via bank transfer and issued promissory note and repayment cheque. Cheque returned with memo "Account Closed".',
    claimAmount: 200000,
    expected: {
      category: 'financial_cheque_bounce',
      statutes: ['Negotiable Instruments Act, 1881'],
      riskLevel: 'HIGH',
      limitationMonths: 1,
      requiredEvidence: ['Cheque', 'Return Memo with Reason Account Closed', 'Bank Account Statement'],
      escalationForum: 'Judicial Magistrate First Class (JMFC) Court',
      statutoryNoticeRequired: true,
      noticePeriodDays: 15
    }
  },
  {
    id: 'CASE-CHQ-03',
    title: 'Commercial Rent Cheque Returned Unpaid',
    category: 'financial_cheque_bounce',
    state: 'Delhi',
    userStory: 'Commercial tenant issued monthly rent cheque of ₹95,000; bank memo received stating "Exceeds Arrangement".',
    claimAmount: 95000,
    expected: {
      category: 'financial_cheque_bounce',
      statutes: ['Negotiable Instruments Act, 1881'],
      riskLevel: 'HIGH',
      limitationMonths: 1,
      requiredEvidence: ['Original Cheque', 'Bank Memo', 'Lease Agreement'],
      escalationForum: 'Metropolitan Magistrate Court',
      statutoryNoticeRequired: true,
      noticePeriodDays: 15
    }
  },
  {
    id: 'CASE-CHQ-04',
    title: 'Contractor Material Supply Cheque Stop Payment',
    category: 'financial_cheque_bounce',
    state: 'Gujarat',
    userStory: 'Issued cheque of ₹4,20,000 for cement consignment returned with memo "Payment Stopped by Drawer" after goods were accepted.',
    claimAmount: 420000,
    expected: {
      category: 'financial_cheque_bounce',
      statutes: ['Negotiable Instruments Act, 1881'],
      riskLevel: 'HIGH',
      limitationMonths: 1,
      requiredEvidence: ['Cheque', 'Return Memo', 'Signed Delivery Note'],
      escalationForum: 'JMFC Court',
      statutoryNoticeRequired: true,
      noticePeriodDays: 15
    }
  },
  {
    id: 'CASE-CHQ-05',
    title: 'Property Token Advance Cheque Dishonoured',
    category: 'financial_cheque_bounce',
    state: 'Tamil Nadu',
    userStory: 'Buyer issued ₹5,00,000 token cheque against agreement to sell flat; cheque bounced for insufficiency of funds.',
    claimAmount: 500000,
    expected: {
      category: 'financial_cheque_bounce',
      statutes: ['Negotiable Instruments Act, 1881'],
      riskLevel: 'HIGH',
      limitationMonths: 1,
      requiredEvidence: ['Cheque', 'Bank Memo', 'Agreement of Sale'],
      escalationForum: 'Metropolitan Magistrate Court',
      statutoryNoticeRequired: true,
      noticePeriodDays: 15
    }
  },
  {
    id: 'CASE-CHQ-06',
    title: 'Wholesale Textile Consignment Cheque Bounced',
    category: 'financial_cheque_bounce',
    state: 'Rajasthan',
    userStory: 'Surat textile order paid via post-dated cheque of ₹1,75,000; presented on due date and returned unpaid with bank memo.',
    claimAmount: 175000,
    expected: {
      category: 'financial_cheque_bounce',
      statutes: ['Negotiable Instruments Act, 1881'],
      riskLevel: 'HIGH',
      limitationMonths: 1,
      requiredEvidence: ['Original Cheque', 'Bank Return Memo', 'Invoice Copies'],
      escalationForum: 'JMFC Court',
      statutoryNoticeRequired: true,
      noticePeriodDays: 15
    }
  },
  {
    id: 'CASE-CHQ-07',
    title: 'Security Deposit Refund Cheque Bounced by Landlord',
    category: 'financial_cheque_bounce',
    state: 'West Bengal',
    userStory: 'Vacating landlord issued post-dated cheque of ₹80,000 for deposit refund; cheque dishonoured with memo "Refer to Drawer".',
    claimAmount: 80000,
    expected: {
      category: 'financial_cheque_bounce',
      statutes: ['Negotiable Instruments Act, 1881', 'Indian Contract Act, 1872'],
      riskLevel: 'HIGH',
      limitationMonths: 1,
      requiredEvidence: ['Cheque', 'Return Memo', 'Rental Agreement'],
      escalationForum: 'Metropolitan Magistrate Court',
      statutoryNoticeRequired: true,
      noticePeriodDays: 15
    }
  },
  {
    id: 'CASE-CHQ-08',
    title: 'Consultancy Retainer Cheque Signature Mismatch',
    category: 'financial_cheque_bounce',
    state: 'Uttar Pradesh',
    userStory: 'Corporate client issued quarterly retainer cheque of ₹1,50,000; bank returned memo "Drawer Signature Differs". Client refuses reissue.',
    claimAmount: 150000,
    expected: {
      category: 'financial_cheque_bounce',
      statutes: ['Negotiable Instruments Act, 1881', 'Indian Contract Act, 1872'],
      riskLevel: 'HIGH',
      limitationMonths: 1,
      requiredEvidence: ['Original Cheque', 'Bank Memo with Signature Remark', 'Retainer Agreement'],
      escalationForum: 'JMFC Court',
      statutoryNoticeRequired: true,
      noticePeriodDays: 15
    }
  },
  {
    id: 'CASE-CHQ-09',
    title: 'Partnership Exit Settlement Cheque Bounced',
    category: 'financial_cheque_bounce',
    state: 'Telangana',
    userStory: 'Retiring partner received settlement cheque of ₹6,00,000 from managing partner; cheque dishonoured for insufficient funds.',
    claimAmount: 600000,
    expected: {
      category: 'financial_cheque_bounce',
      statutes: ['Negotiable Instruments Act, 1881'],
      riskLevel: 'HIGH',
      limitationMonths: 1,
      requiredEvidence: ['Original Cheque', 'Bank Return Memo', 'Dissolution / Retirement Deed'],
      escalationForum: 'Metropolitan Magistrate Court',
      statutoryNoticeRequired: true,
      noticePeriodDays: 15
    }
  },
  {
    id: 'CASE-CHQ-10',
    title: 'Vehicle Purchase Refund Cheque Bounced',
    category: 'financial_cheque_bounce',
    state: 'Haryana',
    userStory: 'Dealership issued cancellation refund cheque of ₹2,50,000 after vehicle booking cancelled; cheque returned unpaid with memo "Funds Insufficient".',
    claimAmount: 250000,
    expected: {
      category: 'financial_cheque_bounce',
      statutes: ['Negotiable Instruments Act, 1881'],
      riskLevel: 'HIGH',
      limitationMonths: 1,
      requiredEvidence: ['Cheque', 'Return Memo', 'Booking Cancellation Letter'],
      escalationForum: 'JMFC Court',
      statutoryNoticeRequired: true,
      noticePeriodDays: 15
    }
  },

  // =========================================================================
  // 6. CYBERCRIME & ONLINE FINANCIAL FRAUD (10 CASES)
  // =========================================================================
  {
    id: 'CASE-CYB-01',
    title: 'UPI Screen-Sharing Phishing Scam',
    category: 'police_criminal_grievance',
    state: 'Karnataka',
    userStory: 'Scammer pretending to be electricity board executive asked citizen to install screen-sharing app to pay ₹10 bill, immediately draining ₹1,45,000 across 3 UPI transfers.',
    claimAmount: 145000,
    expected: {
      category: 'police_criminal_grievance',
      statutes: ['Bharatiya Nyaya Sanhita, 2023', 'Information Technology Act, 2000'],
      riskLevel: 'HIGH',
      limitationMonths: 36,
      requiredEvidence: ['UPI Transaction Reference Numbers', 'Bank Statement', 'Fraudster Phone Number'],
      escalationForum: 'National Cyber Crime Reporting Portal (1930 / cybercrime.gov.in)'
    }
  },
  {
    id: 'CASE-CYB-02',
    title: 'Unauthorized Credit Card International Transactions Without OTP',
    category: 'police_criminal_grievance',
    state: 'Maharashtra',
    userStory: 'Citizen credit card charged 4 international e-commerce transactions worth ₹88,000 at 3 AM while card in physical possession; zero OTP received.',
    claimAmount: 88000,
    expected: {
      category: 'police_criminal_grievance',
      statutes: ['Information Technology Act, 2000', 'RBI Zero Liability Guidelines'],
      riskLevel: 'HIGH',
      limitationMonths: 36,
      requiredEvidence: ['Credit Card Statement', 'Immediate Bank Block SMS Record'],
      escalationForum: 'Bank Grievance Cell / RBI Banking Ombudsman'
    }
  },
  {
    id: 'CASE-CYB-03',
    title: 'Telegram Part-time Job Rating Task Fraud',
    category: 'police_criminal_grievance',
    state: 'Delhi',
    userStory: 'Victim lured into YouTube video like/rating tasks; initially paid ₹500, then coerced into investing ₹3,20,000 into fake crypto dashboard that blocked withdrawals.',
    claimAmount: 320000,
    expected: {
      category: 'police_criminal_grievance',
      statutes: ['Bharatiya Nyaya Sanhita, 2023', 'Information Technology Act, 2000'],
      riskLevel: 'HIGH',
      limitationMonths: 36,
      requiredEvidence: ['Telegram Chat Exports', 'Bank Transfer UTR Numbers', 'Fake Portal URLs'],
      escalationForum: 'Cyber Crime Police Station (1930)'
    }
  },
  {
    id: 'CASE-CYB-04',
    title: 'SIM Swap Fraud Resulting in Netbanking Account Draining',
    category: 'police_criminal_grievance',
    state: 'Tamil Nadu',
    userStory: 'Mobile network provider issued unauthorized duplicate SIM in another city without biometric check; attackers accessed OTPs and transferred ₹5,50,000.',
    claimAmount: 550000,
    expected: {
      category: 'police_criminal_grievance',
      statutes: ['Information Technology Act, 2000', 'Bharatiya Nyaya Sanhita, 2023'],
      riskLevel: 'HIGH',
      limitationMonths: 36,
      requiredEvidence: ['Telecom Store Complaint Copy', 'Bank Netbanking Audit Trail'],
      escalationForum: 'Cyber Police / DOT Telecom Ombudsman'
    }
  },
  {
    id: 'CASE-CYB-05',
    title: 'Vishing Call Impersonating Bank Manager for KYC Update',
    category: 'police_criminal_grievance',
    state: 'Uttar Pradesh',
    userStory: 'Caller claimed senior citizen bank account will freeze unless biometric KYC updated; extracted debit card details and debited ₹62,000.',
    claimAmount: 62000,
    expected: {
      category: 'police_criminal_grievance',
      statutes: ['Bharatiya Nyaya Sanhita, 2023', 'Information Technology Act, 2000'],
      riskLevel: 'HIGH',
      limitationMonths: 36,
      requiredEvidence: ['Call Log', 'SMS Transaction Records', 'Police Diary Entry'],
      escalationForum: 'Cyber Crime Portal (1930)'
    }
  },
  {
    id: 'CASE-CYB-06',
    title: 'Fake Stock Trading WhatsApp Group Scam',
    category: 'police_criminal_grievance',
    state: 'Gujarat',
    userStory: 'Fraudsters running fake institutional trading app showing 400% profits; victim deposited ₹12,00,000 via NEFT to mule accounts; withdrawals refused.',
    claimAmount: 1200000,
    expected: {
      category: 'police_criminal_grievance',
      statutes: ['Bharatiya Nyaya Sanhita, 2023', 'Information Technology Act, 2000'],
      riskLevel: 'HIGH',
      limitationMonths: 36,
      requiredEvidence: ['NEFT Transfer Proofs', 'WhatsApp Group Chat Screenshots'],
      escalationForum: 'State Cyber Crime Wing / SEBI Complaints Redress System'
    }
  },
  {
    id: 'CASE-CYB-07',
    title: 'Ransomware Extortion on Small Clinic Diagnostic Records',
    category: 'police_criminal_grievance',
    state: 'Kerala',
    userStory: 'Diagnostic lab computer systems encrypted with LockBit variant demanding $5,000 in cryptocurrency to decrypt patient ultrasound files.',
    expected: {
      category: 'police_criminal_grievance',
      statutes: ['Information Technology Act, 2000'],
      riskLevel: 'HIGH',
      limitationMonths: 36,
      requiredEvidence: ['Ransom Note File', 'System Log Files'],
      escalationForum: 'CERT-In / Cyber Crime Police'
    }
  },
  {
    id: 'CASE-CYB-08',
    title: 'Identity Theft Using Forged Aadhaar for Instant Loan App',
    category: 'police_criminal_grievance',
    state: 'Telangana',
    userStory: 'Unregistered predatory Chinese loan app disbursed loan to impostor using morphed Aadhaar; recovery agents harassing innocent citizen with abusive calls.',
    expected: {
      category: 'police_criminal_grievance',
      statutes: ['Information Technology Act, 2000', 'Bharatiya Nyaya Sanhita, 2023'],
      riskLevel: 'HIGH',
      limitationMonths: 36,
      requiredEvidence: ['Harassment Call Recordings', 'CIBIL Dispute Credit Report'],
      escalationForum: 'Cyber Crime Police / RBI Sachet Portal'
    }
  },
  {
    id: 'CASE-CYB-09',
    title: 'Instagram Account Hacking and Extortion of Friends',
    category: 'police_criminal_grievance',
    state: 'West Bengal',
    userStory: 'Account compromised via 2FA bypass; attacker sending emergency financial distress messages soliciting ₹10,000 GPay transfers from follower list.',
    expected: {
      category: 'police_criminal_grievance',
      statutes: ['Information Technology Act, 2000', 'Bharatiya Nyaya Sanhita, 2023'],
      riskLevel: 'HIGH',
      limitationMonths: 36,
      requiredEvidence: ['Account Impersonation Screenshots', 'Phishing URL'],
      escalationForum: 'Cyber Police / Platform Grievance Officer'
    }
  },
  {
    id: 'CASE-CYB-10',
    title: 'Cloned Payment Gateway Stealing Credit Card Credentials',
    category: 'police_criminal_grievance',
    state: 'Rajasthan',
    userStory: 'Fake electricity bill payment website cloned genuine state portal; captured card numbers and CVVs to drain ₹45,000.',
    claimAmount: 45000,
    expected: {
      category: 'police_criminal_grievance',
      statutes: ['Information Technology Act, 2000', 'Bharatiya Nyaya Sanhita, 2023'],
      riskLevel: 'HIGH',
      limitationMonths: 36,
      requiredEvidence: ['Browser History URL', 'Card Transaction SMS'],
      escalationForum: 'National Cyber Crime Portal (1930)'
    }
  },

  // =========================================================================
  // 7. PROPERTY & BOUNDARY (10 CASES)
  // =========================================================================
  {
    id: 'CASE-PRP-01',
    title: 'Ancestral Agricultural Land Partition Denied by Co-Heirs',
    category: 'property_rera',
    state: 'Karnataka',
    userStory: 'Father died intestate leaving 8 acres ancestral farmland in Mandya. Elder brother took possession of entire land and refuses to execute registered partition deed or share crop profits.',
    expected: {
      category: 'property_rera',
      statutes: ['Hindu Succession Act, 1956', 'Code of Civil Procedure, 1908'],
      riskLevel: 'MEDIUM',
      limitationMonths: 144, // 12 years for partition of joint family property
      requiredEvidence: ['Genealogical Tree', 'RTC / Pahani Records', 'Death Certificate'],
      escalationForum: 'Senior Civil Judge Court'
    }
  },
  {
    id: 'CASE-PRP-02',
    title: 'Neighbor Encroachment and Illegal Boundary Wall Construction',
    category: 'property_rera',
    state: 'Tamil Nadu',
    userStory: 'Adjacent property owner constructed boundary wall encroaching 3 feet into registered residential plot in Coimbatore while owner was abroad.',
    expected: {
      category: 'property_rera',
      statutes: ['Specific Relief Act, 1963', 'Transfer of Property Act, 1882'],
      riskLevel: 'HIGH',
      limitationMonths: 36,
      requiredEvidence: ['Registered Sale Deed', 'Government Revenue Survey Sketch'],
      escalationForum: 'Civil Court (Suit for Mandatory Injunction and Possession)'
    }
  },
  {
    id: 'CASE-PRP-03',
    title: 'Adverse Possession Claim by Caretaker Refusing to Vacate',
    category: 'property_rera',
    state: 'Delhi',
    userStory: 'Caretaker engaged to guard vacant farm plot in Mehrauli now claiming ownership by adverse possession and threatening owner with physical violence.',
    expected: {
      category: 'property_rera',
      statutes: ['Specific Relief Act, 1963', 'Bharatiya Nyaya Sanhita, 2023'],
      riskLevel: 'HIGH',
      limitationMonths: 36,
      requiredEvidence: ['Original Title Deeds', 'Caretaker Employment / Remittance Receipts'],
      escalationForum: 'Civil Court / Police Station'
    }
  },
  {
    id: 'CASE-PRP-04',
    title: 'Forged Power of Attorney Used to Sell NRI Plot',
    category: 'property_rera',
    state: 'Punjab',
    userStory: 'NRI plot in Jalandhar sold to third party using counterfeit General Power of Attorney notarized abroad without Indian embassy consular stamping.',
    claimAmount: 6500000,
    expected: {
      category: 'property_rera',
      statutes: ['Specific Relief Act, 1963', 'Registration Act, 1908', 'Bharatiya Nyaya Sanhita, 2023'],
      riskLevel: 'HIGH',
      limitationMonths: 36,
      requiredEvidence: ['Original Title Deed', 'Certified Copy of Fraudulent Sale Deed', 'Passport Entry/Exit Proof'],
      escalationForum: 'Civil Court (Suit for Cancellation of Sale Deed) / Crime Branch'
    }
  },
  {
    id: 'CASE-PRP-05',
    title: 'Co-Owner Selling Undivided Coparcenary Share Without Consent',
    category: 'property_rera',
    state: 'Maharashtra',
    userStory: 'Cousin executed sale agreement with commercial builder for undivided family ancestral house in Pune without consulting other coparceners.',
    expected: {
      category: 'property_rera',
      statutes: ['Transfer of Property Act, 1882', 'Specific Relief Act, 1963'],
      riskLevel: 'HIGH',
      limitationMonths: 36,
      requiredEvidence: ['Property 7/12 Extract', 'Family Tree', 'Registered Notice'],
      escalationForum: 'Civil Court (Suit for Partition and Injunction)'
    }
  },
  {
    id: 'CASE-PRP-06',
    title: 'Revenue Survey Demarcation Boundary Dispute',
    category: 'property_rera',
    state: 'Kerala',
    userStory: 'Tahsildar resurvey overlapping boundaries of ancestral homestead with neighboring rubber plantation in Kottayam; neighbor cutting trees.',
    expected: {
      category: 'property_rera',
      statutes: ['Kerala Survey and Boundaries Act', 'Specific Relief Act, 1963'],
      riskLevel: 'MEDIUM',
      limitationMonths: 36,
      requiredEvidence: ['Original Title Deed', 'Old Survey Sketch', 'Survey Appeal Receipt'],
      escalationForum: 'Revenue Divisional Officer (RDO) / Civil Court'
    }
  },
  {
    id: 'CASE-PRP-07',
    title: 'Obstruction of Easement of Necessity Access Pathway',
    category: 'property_rera',
    state: 'Andhra Pradesh',
    userStory: 'Neighbor blocked sole traditional pathway providing ingress and egress to landlocked agricultural field by dumping construction boulders.',
    expected: {
      category: 'property_rera',
      statutes: ['Indian Easements Act, 1882', 'Specific Relief Act, 1963'],
      riskLevel: 'HIGH',
      limitationMonths: 36,
      requiredEvidence: ['Sale Deed mentioning access pathway', 'Site Photographs', 'Revenue Village Map'],
      escalationForum: 'Civil Court (Suit for Permanent Injunction)'
    }
  },
  {
    id: 'CASE-PRP-08',
    title: 'Seller Refusal to Execute Registered Sale Deed After Advance',
    category: 'property_rera',
    state: 'Uttar Pradesh',
    userStory: 'Paid ₹10,00,000 advance under registered agreement to sell; buyer ready with balance funds but seller refusing to appear at Sub-Registrar office.',
    claimAmount: 1000000,
    expected: {
      category: 'property_rera',
      statutes: ['Specific Relief Act, 1963', 'Indian Contract Act, 1872'],
      riskLevel: 'HIGH',
      limitationMonths: 36,
      requiredEvidence: ['Registered Agreement to Sell', 'Bank Balance Proof showing readiness', 'Notice to Execute'],
      escalationForum: 'Civil Court (Suit for Specific Performance of Contract)'
    }
  },
  {
    id: 'CASE-PRP-09',
    title: 'Gram Panchayat Encroaching Private Patta Land for Waste Dump',
    category: 'property_rera',
    state: 'Haryana',
    userStory: 'Local Gram Panchayat dumping village garbage on private registered freehold farmland without acquisition or compensation.',
    expected: {
      category: 'property_rera',
      statutes: ['Right to Fair Compensation in Land Acquisition Act', 'Specific Relief Act, 1963'],
      riskLevel: 'HIGH',
      limitationMonths: 36,
      requiredEvidence: ['Jamabandi Patta', 'Site Photographs'],
      escalationForum: 'Civil Court / High Court (Writ Petition)'
    }
  },
  {
    id: 'CASE-PRP-10',
    title: 'Undisclosed Prior Bank Mortgage on Purchased Land',
    category: 'property_rera',
    state: 'Rajasthan',
    userStory: 'Purchased residential plot in Jaipur; 6 months later bank pasted notice of SARFAESI auction due to seller undisclosed prior housing loan default.',
    claimAmount: 2500000,
    expected: {
      category: 'property_rera',
      statutes: ['Transfer of Property Act, 1882', 'SARFAESI Act, 2002', 'Bharatiya Nyaya Sanhita, 2023'],
      riskLevel: 'HIGH',
      limitationMonths: 36,
      requiredEvidence: ['Registered Sale Deed', 'Bank Possession Notice', 'Encumbrance Certificate'],
      escalationForum: 'Debts Recovery Tribunal (DRT) / Civil Court'
    }
  },

  // =========================================================================
  // 8. GENERAL CIVIL CONTRACTS & DEBT RECOVERY (5 CASES)
  // =========================================================================
  {
    id: 'CASE-GEN-01',
    title: 'Unpaid Commercial Promissory Note Past Maturity',
    category: 'other',
    state: 'Maharashtra',
    userStory: 'Borrower executed on-demand promissory note of ₹4,00,000 with 12% interest for business expansion; failed to repay principal past 1-year maturity.',
    claimAmount: 400000,
    expected: {
      category: 'other',
      statutes: ['Negotiable Instruments Act, 1881', 'Indian Contract Act, 1872'],
      riskLevel: 'MEDIUM',
      limitationMonths: 36,
      requiredEvidence: ['Original Promissory Note with Revenue Stamp', 'Bank Transfer Proof'],
      escalationForum: 'Civil Court (Summary Suit Order XXXVII CPC)'
    }
  },
  {
    id: 'CASE-GEN-02',
    title: 'Commercial Vendor Substandard Raw Material Delivery Loss',
    category: 'other',
    state: 'Gujarat',
    userStory: 'Textile manufacturer supplied chemically degraded cotton yarn failing tensile specifications; caused ₹6,50,000 manufacturing batch rejection.',
    claimAmount: 650000,
    expected: {
      category: 'other',
      statutes: ['Sale of Goods Act, 1930', 'Indian Contract Act, 1872'],
      riskLevel: 'MEDIUM',
      limitationMonths: 36,
      requiredEvidence: ['Purchase Order', 'Laboratory Quality Test Certificate', 'Rejection Memo'],
      escalationForum: 'Commercial Court'
    }
  },
  {
    id: 'CASE-GEN-03',
    title: 'Software Development Agency Milestone Abandonment',
    category: 'other',
    state: 'Karnataka',
    userStory: 'Hired software agency for mobile app paying ₹3,50,000 for milestone 1 & 2; agency disappeared after 4 months without handing over source code repository.',
    claimAmount: 350000,
    expected: {
      category: 'other',
      statutes: ['Indian Contract Act, 1872', 'Specific Relief Act, 1963'],
      riskLevel: 'HIGH',
      limitationMonths: 36,
      requiredEvidence: ['Master Services Agreement', 'Bank Wire Invoices', 'Written Email Reminders'],
      escalationForum: 'Civil Court / Commercial Court'
    }
  },
  {
    id: 'CASE-GEN-04',
    title: 'Event Management Agency Conference Cancellation Non-Refund',
    category: 'other',
    state: 'Delhi',
    userStory: 'Association booked hotel convention center via event agency paying ₹5,00,000 advance; agency cancelled event unilaterally but refuses to return advance.',
    claimAmount: 500000,
    expected: {
      category: 'other',
      statutes: ['Indian Contract Act, 1872'],
      riskLevel: 'MEDIUM',
      limitationMonths: 36,
      requiredEvidence: ['Event Booking Contract', 'Advance Payment Receipt'],
      escalationForum: 'Civil Court (Summary Suit)'
    }
  },
  {
    id: 'CASE-GEN-05',
    title: 'Breach of Exclusive Regional Distributorship Covenant',
    category: 'other',
    state: 'Tamil Nadu',
    userStory: 'Manufacturer granted exclusive distribution rights for FMCG brand in Chennai; subsequently appointed second distributor in violation of contract.',
    expected: {
      category: 'other',
      statutes: ['Indian Contract Act, 1872', 'Specific Relief Act, 1963'],
      riskLevel: 'HIGH',
      limitationMonths: 36,
      requiredEvidence: ['Exclusive Distributorship Agreement', 'Invoices of Third Party Sales'],
      escalationForum: 'Commercial Court'
    }
  }
];
