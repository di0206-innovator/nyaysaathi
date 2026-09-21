import { Matter } from '@/types/matter';

export const SEED_MATTERS: Matter[] = [
  {
    id: 'matter-bengaluru-rent',
    title: 'Withholding of ₹75,000 Security Deposit by Landlord in Koramangala',
    category: 'tenancy_housing',
    subCategory: 'Residential Tenancy Deposit Recovery',
    status: 'action_ready',
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-09-12T14:30:00Z',
    locationCity: 'Bengaluru',
    locationState: 'Karnataka',
    claimAmount: 75000,
    userStory: `I rented a 2BHK in Koramangala 4th Block, Bengaluru for 18 months. I paid a security deposit of ₹75,000 via direct NEFT transfer. My 11-month registered lease agreement was renewed with mutual consent. On June 30th, 2026, I served a 30-day notice via WhatsApp and email as required by clause 9 of our agreement. 
    
    I vacated the flat on July 31st, 2026 and handed over keys to the landlord's representative. The flat was cleaned thoroughly. Now, more than 45 days have passed. The landlord is refusing to refund my deposit, claiming ₹40,000 for full house repainting and ₹25,000 for arbitrary 'deep sanitization', without providing any actual GST bills or contractor invoices. He is ignoring my calls and messages.`,
    
    parties: [
      {
        id: 'p-1',
        name: 'Arjun Verma (Tenant)',
        role: 'Aggrieved (You)',
        contactInfo: '+91 98765 43210',
        address: 'Flat 302, Green Residency, Koramangala 4th Block',
        city: 'Bengaluru',
        state: 'Karnataka'
      },
      {
        id: 'p-2',
        name: 'R. K. Sundaram (Landlord)',
        role: 'Landlord',
        contactInfo: '+91 98450 11223',
        address: 'No. 14, 8th Main, Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka'
      }
    ],

    documents: [
      {
        id: 'doc-1',
        title: 'Registered Rental Agreement (Koramangala 2BHK)',
        type: 'rental_agreement',
        fileSize: '2.4 MB',
        uploadedAt: '2026-08-15',
        classification: 'Registered Contractual Lease',
        confidenceScore: 0.98,
        relevanceSummary: 'Clause 9 stipulates 30-day notice period and mandate to refund deposit within 15 days of vacant possession.',
        keyQuotes: [
          'The Landlord shall refund the Security Deposit of ₹75,000 to the Tenant after deducting unpaid utility bills or actual physical damages, within 15 days of vacant possession.'
        ],
        status: 'verified'
      },
      {
        id: 'doc-2',
        title: 'Bank Statement Showing ₹75,000 Security Deposit Transfer',
        type: 'bank_statement',
        fileSize: '850 KB',
        uploadedAt: '2026-08-15',
        classification: 'Financial Consideration Proof',
        confidenceScore: 0.99,
        relevanceSummary: 'Unquestionable NEFT transaction reference proof to landlord account.',
        status: 'verified'
      },
      {
        id: 'doc-3',
        title: 'WhatsApp Chat History with Landlord (Move-Out & Handover)',
        type: 'whatsapp_chat',
        fileSize: '1.1 MB',
        uploadedAt: '2026-08-16',
        classification: 'Electronic Evidence under BSA 2023',
        confidenceScore: 0.94,
        relevanceSummary: 'Confirms notice served on June 30th and keys received by landlord on July 31st without contemporaneous objection.',
        status: 'verified'
      }
    ],

    summary: {
      plainLanguage: 'You have vacated your rented home in Bengaluru with proper notice. Your landlord has withheld your ₹75,000 deposit for over 45 days and is making unilateral deductions without providing authentic receipts or bills.',
      keyConflict: 'Landlord withholding ₹75,000 refundable security deposit without contractual justification or itemized GST repair bills.',
      legalNature: 'Civil Contractual Breach, Unlawful Enrichment & Tenancy Law Non-Compliance'
    },

    facts: [
      {
        id: 'fact-1',
        statement: 'A valid rental agreement existed with a refundable security deposit of ₹75,000 paid through banking channel.',
        category: 'contractual',
        verified: true,
        tier: 'fact',
        confidence: 0.99
      },
      {
        id: 'fact-2',
        statement: 'Tenant gave 30-day advance notice on June 30, 2026 and vacated the premises on July 31, 2026.',
        category: 'chronology',
        verified: true,
        tier: 'fact',
        confidence: 0.96
      },
      {
        id: 'fact-3',
        statement: 'More than 45 days have elapsed without return of deposit or presentation of verified tax invoices for alleged damage.',
        category: 'conduct',
        verified: true,
        tier: 'fact',
        confidence: 0.95
      }
    ],

    timelineEvents: [
      {
        id: 'ev-1',
        date: '2025-02-01',
        title: 'Tenancy Commenced & Deposit Transferred',
        description: 'Signed rental agreement; transferred ₹75,000 security deposit via NEFT.',
        evidenceTitle: 'Registered Rental Agreement & Bank Statement',
        isKeyMilestone: true,
        status: 'verified'
      },
      {
        id: 'ev-2',
        date: '2026-06-30',
        title: '30-Day Notice Given to Landlord',
        description: 'Informed landlord via email and WhatsApp regarding relocation and lease non-renewal.',
        evidenceTitle: 'WhatsApp Chat Export',
        isKeyMilestone: true,
        status: 'verified'
      },
      {
        id: 'ev-3',
        date: '2026-07-31',
        title: 'Vacated Flat & Handed Over Keys',
        description: 'Physical handover completed to landlord representative; apartment left cleaned.',
        evidenceTitle: 'WhatsApp Handover Confirmation',
        isKeyMilestone: true,
        status: 'verified'
      },
      {
        id: 'ev-4',
        date: '2026-08-15',
        title: 'Deposit Refund Due Date Passed (15 Days)',
        description: 'Contractual deadline under Clause 9 expired; landlord started citing arbitrary repainting expenses.',
        isKeyMilestone: true,
        status: 'verified'
      }
    ],

    risks: [
      {
        id: 'risk-1',
        title: 'Arbitrary Painting Deductions Without GST Bills',
        severity: 'high',
        description: 'Landlords cannot deduct for normal wear-and-tear unless explicitly stated in the agreement and substantiated with authentic contractor tax invoices.',
        limitationPeriodInfo: {
          statute: 'Indian Limitation Act, 1963 (Money Recovery)',
          deadlineMonths: 36,
          daysRemaining: 1040
        },
        mitigatingAction: 'Issue a formal Legal Demand Notice demanding either full deposit or GST-compliant repair bills within 15 days.',
        legalContext: 'Courts hold that landlords cannot profit from deposit deductions without verifiable third-party receipts.'
      },
      {
        id: 'risk-2',
        title: 'Lack of Joint Exit Inspection Protocol Sheet',
        severity: 'medium',
        description: 'Because no formal joint checklist was signed on move-out day, landlord may attempt to produce staged photos.',
        mitigatingAction: 'Preserve move-out video walkthrough and WhatsApp text where landlord acknowledged receiving keys.',
        legalContext: 'Electronic metadata on photos taken on July 31st acts as strong rebuttal under BSA 2023.'
      }
    ],

    missingInformation: [
      {
        id: 'miss-1',
        question: 'Do you have photos/videos of the walls and fixtures taken on the day you moved out?',
        whyItMatters: 'Disproves any fabricated claim of wall damage or unauthorized structural modifications.',
        impactOnOutcome: 'critical',
        suggestedSource: 'Phone camera gallery metadata from July 31, 2026.',
        isAnswered: true,
        answer: 'Yes, full timestamped video walkthrough recorded and backed up in Google Drive.'
      }
    ],

    actionPlan: [
      {
        id: 'act-1',
        title: 'Collate & Secure Bank Statement & Agreement in PDF',
        phase: 'immediate_48h',
        description: 'Ensure you have high-res PDF copies of the lease agreement, bank transfer slip, and chat transcripts.',
        estimatedTurnaround: '15 mins',
        status: 'completed',
        priority: 'must_do'
      },
      {
        id: 'act-2',
        title: 'Send Structured Legal Demand Notice via Speed Post & Email',
        phase: 'immediate_48h',
        description: 'Serve formal 15-day notice with Speed Post tracking number (RPAD) putting landlord on legal notice.',
        estimatedTurnaround: '1 hour',
        status: 'in_progress',
        priority: 'must_do',
        associatedDraftType: 'landlord_demand_letter'
      },
      {
        id: 'act-3',
        title: 'File Pre-Litigation Mediation Request with DLSA Bengaluru Urban',
        phase: 'short_term_14d',
        description: 'If landlord does not refund within 15 days, apply for free District Legal Services Authority mediation at City Civil Court complex.',
        estimatedTurnaround: '2-3 weeks',
        status: 'pending',
        priority: 'recommended'
      },
      {
        id: 'act-4',
        title: 'File Recovery Suit before Small Causes Court / Rent Court',
        phase: 'formal_escalation',
        description: 'Initiate formal summary suit under Order 37 CPC for recovery of debt with 12% interest and advocate costs.',
        estimatedTurnaround: '1 month',
        status: 'pending',
        priority: 'optional'
      }
    ],

    drafts: [
      {
        id: 'draft-1-soft',
        matterId: 'matter-bengaluru-rent',
        type: 'soft_request',
        communicationTier: 'soft',
        title: '🌱 Settlement Request (WhatsApp / Email Friendly)',
        recipientName: 'R. K. Sundaram (Landlord)',
        recipientAddress: 'No. 14, 8th Main, Indiranagar, Bengaluru - 560038',
        subject: 'Friendly Follow-up: Security Deposit Refund for Flat 302, Koramangala',
        content: `Dear Mr. Sundaram,

I hope you are doing well.

I am writing to politely follow up on the refund of my ₹75,000 security deposit for Flat 302, Green Residency, Koramangala 4th Block, which was vacated on 31 July 2026 after serving the required 30-day notice.

As we noted during the key handover, the apartment was left clean and in good condition with all utility bills cleared. Under our rental agreement (Clause 9), the deposit refund was scheduled within 15 days of handover.

Regarding the repainting and sanitization deductions mentioned earlier: normal wear and tear over an 18-month tenancy is typically landlord maintenance under standard tenancy practices. If there were specific third-party repair bills, please share the GST invoices so we can reconcile them transparently.

I would truly appreciate it if we can settle this amicably without unnecessary complications. Could you please confirm when the ₹75,000 transfer can be initiated to my bank account?

Bank Details:
Account Name: Arjun Verma
A/C No: 9190200881234
IFSC: UTIB0002938

Thank you for your cooperation and support during my stay.

Warm regards,
Arjun Verma
+91 98765 43210`,
        statutoryReference: 'Indian Contract Act, 1872 & Karnataka Rent Jurisprudence',
        disclaimer: 'Recommended first-contact communication to resolve disputes amicably without adversarial escalation.',
        groundingRefIds: ['fact-1', 'fact-2', 'fact-3', 'doc-1', 'doc-2', 'doc-3'],
        createdAt: '2026-09-17',
        status: 'ready_to_send'
      },
      {
        id: 'draft-1-formal',
        matterId: 'matter-bengaluru-rent',
        type: 'formal_demand',
        communicationTier: 'formal',
        title: '📄 Formal Demand Letter (Pre-Notice Letter)',
        recipientName: 'R. K. Sundaram (Landlord)',
        recipientAddress: 'No. 14, 8th Main, Indiranagar, Bengaluru - 560038',
        subject: 'FORMAL REQUISITION FOR IMMEDIATE DISBURSEMENT OF ₹75,000 SECURITY DEPOSIT',
        content: `Date: 17 September 2026

To,
Mr. R. K. Sundaram
No. 14, 8th Main, Indiranagar,
Bengaluru, Karnataka - 560038
Email: rksundaram.property@gmail.com

From:
Mr. Arjun Verma
Flat No. 101, Palm Heights, HSR Layout,
Bengaluru, Karnataka - 560102
Mobile: +91 98765 43210

SUBJECT: FORMAL DEMAND FOR REFUND OF ₹75,000 SECURITY DEPOSIT - FLAT 302, GREEN RESIDENCY, KORAMANGALA

Dear Sir,

This is a formal communication regarding the full refund of the interest-free refundable security deposit of ₹75,000/- paid under our Rental Agreement dated 1st February 2025.

1. In compliance with Clause 9 of the agreement, a 30-day notice was served on 30th June 2026. Vacant, peaceful possession of the premises was delivered to your representative on 31st July 2026.
2. Under Clause 9, the refund was due on or before 15th August 2026. More than 45 days have now elapsed.
3. Your proposed deduction of ₹65,000 without contemporaneous joint inspection notes or verified GST repair invoices is unsustainable under law, as ordinary wear and tear cannot be charged to the tenant.

You are formally requested to remit the undisputed amount of ₹75,000/- within SEVEN (7) DAYS of receipt of this letter to avoid formal legal proceedings before the District Legal Services Authority (DLSA) or Small Causes Court.

Yours faithfully,

(Arjun Verma)`,
        statutoryReference: 'Section 73, Indian Contract Act 1872',
        disclaimer: 'Dated formal letter setting a 7-day cure window prior to legal notice dispatch.',
        groundingRefIds: ['fact-1', 'fact-2', 'fact-3', 'doc-1', 'doc-2'],
        createdAt: '2026-09-17',
        status: 'ready_to_send'
      },
      {
        id: 'draft-1-legal',
        matterId: 'matter-bengaluru-rent',
        type: 'landlord_demand_letter',
        communicationTier: 'lawyer_ready',
        title: '⚖️ Statutory Legal Notice (Lawyer-Ready / RPAD)',
        recipientName: 'R. K. Sundaram (Landlord)',
        recipientAddress: 'No. 14, 8th Main, Indiranagar, Bengaluru - 560038',
        subject: 'LEGAL DEMAND NOTICE UNDER INDIAN CONTRACT ACT FOR REFUND OF ₹75,000 DEPOSIT',
        content: `BY REGISTERED POST WITH ACKNOWLEDGEMENT DUE / SPEED POST & EMAIL

Date: 17 September 2026

TO:
Mr. R. K. Sundaram
No. 14, 8th Main, Indiranagar,
Bengaluru, Karnataka - 560038
Email: rksundaram.property@gmail.com

FROM:
Mr. Arjun Verma
Flat No. 101, Palm Heights, HSR Layout,
Bengaluru, Karnataka - 560102
Mobile: +91 98765 43210
Email: arjun.verma@email.com

SUBJECT: DEMAND NOTICE FOR IMMEDIATE REFUND OF SECURITY DEPOSIT AMOUNTING TO ₹75,000/- (RUPEES SEVENTY FIVE THOUSAND ONLY)

Sir,

Under instructions and on my own behalf, I hereby serve upon you this formal Demand Notice:

1. That pursuant to the Rental Agreement dated 1st February 2025, I was the lawful tenant in respect of Flat 302, Green Residency, Koramangala 4th Block, Bengaluru, having paid an interest-free refundable Security Deposit of ₹75,000/- (Rupees Seventy Five Thousand Only) through NEFT on 1st February 2025 (Ref: UTIB00029381203).

2. That in accordance with Clause 9 of the said agreement, I served a formal 30-day notice on 30th June 2026 expressing my intention to vacate the premises on 31st July 2026.

3. That on 31st July 2026, I peacefully vacated the subject premises and handed over vacant possession along with all original keys to your designated representative. The apartment was delivered in tenantable condition with all pending utility dues settled in full.

4. That under Clause 9 of the agreement, you were contractually obligated to refund the entire Security Deposit of ₹75,000/- within 15 days of receiving vacant possession (i.e. on or before 15th August 2026).

5. That despite the lapse of more than 45 days and multiple written reminders, you have failed and neglected to refund the said deposit. Your vague claims of ₹40,000 painting deductions and ₹25,000 deep sanitization are wholly untenable, arbitrary, and unlawful, particularly since no joint inspection signoff or authentic GST-compliant repair invoices have been furnished. Under Indian tenancy jurisprudence, ordinary wear and tear is solely the landlord's responsibility.

THEREFORE, I hereby formally call upon you to refund the full sum of ₹75,000/- (Rupees Seventy Five Thousand Only) into my bank account within FIFTEEN (15) DAYS from the receipt of this notice, failing which I shall be constrained to initiate appropriate legal proceedings against you, including:
a) Filing a petition before the Rent Tribunal / Court of Small Causes, Bengaluru for recovery of debt with 12% penal interest per annum;
b) Lodging a pre-litigation conciliation petition before the District Legal Services Authority (DLSA), Bengaluru Urban;
c) Seeking full recovery of advocate charges and litigation damages incurred.

Please treat this as an urgent statutory communication.

Yours sincerely,

(Arjun Verma)
Encl: Copy of Rental Agreement, NEFT Payment Slip, Move-out Handover Chat Record.`,
        statutoryReference: 'Indian Contract Act 1872 (§73) & Agreement Refund Covenant',
        disclaimer: 'This draft is generated based on your inputs and agreement terms. For maximum evidentiary value, serve via Speed Post with Acknowledgement Due (RPAD).',
        groundingRefIds: ['fact-1', 'fact-2', 'fact-3', 'doc-1', 'doc-2', 'doc-3'],
        createdAt: '2026-09-17',
        status: 'ready_to_send'
      }
    ],

    escalationRoutes: [
      {
        id: 'esc-1',
        name: 'District Legal Services Authority (DLSA) Bengaluru Urban',
        type: 'nalsa_dlsa',
        description: 'Free Pre-Litigation Mediation facility located at City Civil Court Complex, Bengaluru. Resolves tenancy and deposit disputes without heavy court fees.',
        criteriaMet: true,
        eligibilityDescription: 'Open to all citizens seeking fast-track amicable resolution without adversarial litigation.',
        officialPortalUrl: 'https://kslsa.kar.nic.in',
        tollFreeNumber: '15100 / 080-22111725',
        physicalAuthority: 'DLSA Front Office, ADR Centre, Nyaya Degula, H. Siddaiah Road, Bengaluru - 560027',
        stepsToApply: [
          'Download and print the NyaySaathi 1-Page Case Brief',
          'Visit the DLSA Front Office at Nyaya Degula or submit pre-litigation application online',
          'DLSA issues a mediation notice to landlord for joint sitting within 14 days'
        ],
        costEstimate: '₹0 (Completely Free of Cost)'
      },
      {
        id: 'esc-2',
        name: 'Court of Small Causes, Bengaluru (Summary Recovery Suit)',
        type: 'private_advocate',
        description: 'Formal civil court pathway for fast-track summary recovery under Order 37 of Civil Procedure Code.',
        criteriaMet: true,
        eligibilityDescription: 'Claims based on written contract and acknowledged liquidated debt.',
        officialPortalUrl: 'https://bengaluru.dcourts.gov.in',
        stepsToApply: [
          'Engage an advocate using the NyaySaathi Lawyer Brief',
          'Serve Speed Post Legal Notice (RPAD) and wait 15 days',
          'File plaint before Court of Small Causes'
        ],
        costEstimate: 'Court fee approx ₹3,000 (calculated on ₹75k claim) + advocate fee'
      }
    ],

    lawyerBrief: {
      id: 'brief-1',
      matterId: 'matter-bengaluru-rent',
      executiveSummary: 'Mr. Arjun Verma (Applicant/Tenant) seeks recovery of ₹75,000 security deposit unlawfully withheld by landlord Mr. R. K. Sundaram after peaceful vacate of Koramangala 2BHK on 31 July 2026. Landlord has failed to refund within 15-day contractual window and has provided no GST bills for alleged deductions.',
      keyChronology: [
        { date: '2025-02-01', event: 'Tenancy commenced; ₹75,000 deposit paid via NEFT.' },
        { date: '2026-06-30', event: '30-day notice served via email & WhatsApp.' },
        { date: '2026-07-31', event: 'Premises vacated; keys handed over.' },
        { date: '2026-08-15', event: '15-day deposit refund deadline lapsed.' }
      ],
      legalIssuesIdentified: [
        'Unlawful withholding of refundable security deposit contrary to Clause 9 of lease agreement.',
        'Unilateral deduction for ordinary wear and tear without itemized contractor tax invoices.',
        'Liability of Landlord to pay commercial/statutory interest @ 12% p.a. for wrongful retention.'
      ],
      statutoryReferences: [
        {
          statute: 'Indian Contract Act, 1872',
          section: 'Section 73',
          applicability: 'Breach of agreement terms causing direct financial loss.'
        },
        {
          statute: 'State Rent Laws & Indian Contract Act (MTA Reference)',
          section: 'Section 73 & Deposit Covenants',
          applicability: 'Governing contractual breach for deposit refund; applicability depends on relevant state tenancy framework, agreement terms, and facts.'
        }
      ],
      reliefSought: [
        'Immediate refund of ₹75,000 principal deposit.',
        'Interest @ 12% p.a. from 15 August 2026 until date of actual realization.',
        '₹15,000 towards litigation costs and mental harassment.'
      ],
      evidentiaryReadiness: {
        strongProof: [
          'Registered Lease Agreement with explicit 15-day refund clause',
          'Bank statement proving ₹75,000 initial transfer',
          'Contemporaneous WhatsApp chat confirming key receipt on 31 July 2026',
          'Timestamped video walkthrough of vacated flat'
        ],
        gapsOrMissingProof: [
          'Postal delivery tracking slip of formal speed post legal notice'
        ]
      },
      estimatedClaimAmount: '₹75,000 + 12% Interest',
      jurisdictionState: 'Karnataka (Bengaluru Urban)',
      generatedAt: '17 September 2026'
    },

    trustSafetyItems: [
      {
        tier: 'fact',
        label: 'Verified Lease & Payment',
        text: 'You entered into a written agreement on 1 Feb 2025 and transferred ₹75,000 via NEFT to landlord account.',
        citation: 'Doc ID: doc-1 & doc-2'
      },
      {
        tier: 'fact',
        label: 'Timely Notice & Vacate',
        text: 'Notice was served on 30 June 2026 and physical keys were handed over on 31 July 2026.',
        citation: 'Doc ID: doc-3'
      },
      {
        tier: 'explanation',
        label: 'Wear and Tear Law in India',
        text: 'Under settled Indian tenancy law, landlords cannot charge tenants for normal fading of paint or standard aging of fixtures. Any deduction requires valid tax receipts for actual damage beyond reasonable use.',
        disclaimer: 'Informational legal principle.'
      },
      {
        tier: 'possibility',
        label: 'Landlord Counter-Argument',
        text: 'The landlord may claim oral agreement regarding repainting charges or allege undocumented wall damages.',
        disclaimer: 'Likely defense strategy.'
      },
      {
        tier: 'counsel_required',
        label: 'Advocate Consultation for Court Plaint',
        text: 'If the landlord fails to respond to the demand notice and you decide to file a formal plaint before the Court of Small Causes, an enrolled Advocate must draft and file the vakalatnama.',
        citation: 'Advocates Act, 1961',
        confidenceScore: 0.98,
        groundingStatus: 'grounded'
      },
      {
        tier: 'unsupported',
        label: 'Unsubstantiated Damage Deductions',
        text: 'The landlord\'s claim of ₹40,000 for repainting and ₹25,000 deep sanitization is wholly lacking contractor tax receipts or joint move-out inspection signoffs, and is classified as unverified.',
        disclaimer: 'Evidentiary burden of proof lies on landlord under Section 101/102 Bharatiya Sakshya Adhiniyam 2023.',
        confidenceScore: 0.25,
        groundingStatus: 'unsupported'
      }
    ],

    auditLog: [
      {
        original: 'The landlord is committing illegal theft of deposit and must pay 18% penal interest.',
        rewritten: 'The landlord is withholding the security deposit in apparent breach of Clause 9; statutory interest as determined by the forum may be sought.',
        reason: 'Replaced aggressive criminal claim and fixed penal interest with factual breach analysis.',
        timestamp: '2026-09-17T10:15:00Z',
        component: 'SafetyVerificationAgent'
      },
      {
        original: 'You will definitely win before the Bengaluru Rent Tribunal with zero risk.',
        rewritten: 'You have a grounded statutory basis under the Indian Contract Act 1872 based on provided receipts.',
        reason: 'Neutralized judicial outcome guarantee into evidence-supported claim basis.',
        timestamp: '2026-09-17T10:15:02Z',
        component: 'ClaimSupportChecker'
      }
    ]
  },
  {
    id: 'matter-mumbai-consumer',
    title: 'Warranty Rejection for ₹42,000 Defective Smartphone Display by Brand',
    category: 'consumer_dispute',
    subCategory: 'Electronics & Warranty Denial',
    status: 'action_ready',
    createdAt: '2026-09-01T11:00:00Z',
    updatedAt: '2026-09-15T09:15:00Z',
    locationCity: 'Mumbai',
    locationState: 'Maharashtra',
    claimAmount: 42000,
    userStory: `I bought a flagship 5G smartphone for ₹42,000 from an authorized electronics store in Bandra, Mumbai on December 10, 2025 with 1-year brand warranty. In August 2026, after a routine software update, the screen suddenly developed permanent vertical green lines across the entire display. 
    
    I submitted the phone to the official company service center in Andheri (Job Sheet #MUM-88421). The service center rejected the free warranty claim, alleging 'internal pressure damage' and demanding ₹14,500 for display replacement, even though the outer glass has zero scratches, cracks, or liquid exposure. The company has refused my escalations via email.`,
    
    parties: [
      {
        id: 'p-1',
        name: 'Pooja Mehta (Consumer)',
        role: 'Aggrieved (You)',
        city: 'Mumbai',
        state: 'Maharashtra'
      },
      {
        id: 'p-2',
        name: 'Apex Mobile India Pvt Ltd & Retailer',
        role: 'Seller / Merchant',
        city: 'Mumbai',
        state: 'Maharashtra'
      }
    ],

    documents: [
      {
        id: 'doc-1',
        title: 'GST Tax Invoice (₹42,000 Smartphone)',
        type: 'invoice_bill',
        fileSize: '1.2 MB',
        uploadedAt: '2026-09-01',
        classification: 'Consumer Purchase Invoice',
        confidenceScore: 0.99,
        relevanceSummary: 'Proves consumer relationship under Section 2(7) CPA 2019 and active warranty validity.',
        status: 'verified'
      },
      {
        id: 'doc-2',
        title: 'Authorized Service Center Job Sheet (#MUM-88421)',
        type: 'other',
        fileSize: '720 KB',
        uploadedAt: '2026-09-01',
        classification: 'Service Intake Record',
        confidenceScore: 0.96,
        relevanceSummary: 'Acknowledges receipt of device in scratch-free external condition with green line fault.',
        status: 'verified'
      }
    ],

    summary: {
      plainLanguage: 'Your smartphone developed display defects following an official software update within warranty. The company has arbitrarily rejected free warranty repair without proof of user fault.',
      keyConflict: 'Manufacturer rejecting warranty claim on defective display unit and demanding ₹14,500 repair charge.',
      legalNature: 'Deficiency in Service & Unfair Trade Practice under Consumer Protection Act, 2019'
    },

    facts: [
      {
        id: 'fact-1',
        statement: 'Product was purchased for ₹42,000 on 10 Dec 2025 with 1-year warranty expiring 9 Dec 2026.',
        category: 'contractual',
        verified: true,
        tier: 'fact',
        confidence: 0.99
      },
      {
        id: 'fact-2',
        statement: 'Defect occurred within warranty period and service intake sheet confirms no external physical glass damage.',
        category: 'conduct',
        verified: true,
        tier: 'fact',
        confidence: 0.97
      }
    ],

    timelineEvents: [
      {
        id: 'ev-1',
        date: '2025-12-10',
        title: 'Device Purchased from Authorized Store',
        description: 'Purchased for ₹42,000 with 1-year comprehensive warranty.',
        isKeyMilestone: true,
        status: 'verified'
      },
      {
        id: 'ev-2',
        date: '2026-08-20',
        title: 'Screen Failure After Software Update',
        description: 'Permanent green lines appeared; phone deposited at Andheri service center.',
        isKeyMilestone: true,
        status: 'verified'
      },
      {
        id: 'ev-3',
        date: '2026-08-24',
        title: 'Warranty Denial & Demand of ₹14,500',
        description: 'Company denied free replacement citing alleged internal pressure.',
        isKeyMilestone: true,
        status: 'verified'
      }
    ],

    risks: [
      {
        id: 'risk-1',
        title: 'Statutory 2-Year Limitation Clock (Section 69 CPA)',
        severity: 'medium',
        description: 'Consumer complaints must be lodged within 2 years from date of denial (24 August 2026).',
        limitationPeriodInfo: {
          statute: 'Consumer Protection Act, 2019 (Section 69)',
          deadlineMonths: 24,
          daysRemaining: 700
        },
        mitigatingAction: 'Lodge complaint on e-Daakhil portal within 30 days if notice goes unheeded.',
        legalContext: 'Complaints filed via e-Daakhil have automatic digital timestamping.'
      }
    ],

    missingInformation: [],

    actionPlan: [
      {
        id: 'act-1',
        title: 'File National Consumer Helpline (NCH) Grievance (Toll Free 1915)',
        phase: 'immediate_48h',
        description: 'Register online docket on consumerhelpline.gov.in against manufacturer.',
        estimatedTurnaround: '15 mins',
        status: 'completed',
        priority: 'must_do'
      },
      {
        id: 'act-2',
        title: 'Serve Formal Statutory Legal Notice to Manufacturer & Retailer',
        phase: 'immediate_48h',
        description: 'Issue 15-day notice under CPA 2019 demanding free screen replacement or full refund.',
        estimatedTurnaround: '1 hour',
        status: 'in_progress',
        priority: 'must_do',
        associatedDraftType: 'legal_notice'
      },
      {
        id: 'act-3',
        title: 'File e-Daakhil Online Consumer Complaint (District Commission)',
        phase: 'formal_escalation',
        description: 'Direct digital filing on edaakhil.nic.in seeking replacement + ₹20,000 compensation.',
        estimatedTurnaround: '1 day',
        status: 'pending',
        priority: 'recommended',
        associatedDraftType: 'consumer_complaint'
      }
    ],

    drafts: [
      {
        id: 'draft-2-soft',
        matterId: 'matter-mumbai-consumer',
        type: 'soft_request',
        communicationTier: 'soft',
        title: '🌱 Customer Support Escalation (Email / App Grievance)',
        recipientName: 'Apex Mobile India Customer Grievance Cell',
        recipientAddress: 'Corporate Office, Bandra Kurla Complex, Mumbai - 400051',
        subject: 'Grievance: Warranty Denial for Display Green Lines - Job Sheet #MUM-88421',
        content: `Dear Customer Support Team,

I am writing regarding my Apex Pro 5G smartphone (IMEI: 864201928374615, Invoice #RET-9921 dated 10 Dec 2025), which is currently under active 1-year manufacturer warranty.

Following the recent official OTA software update on 20 August 2026, the device display developed permanent vertical green lines. I deposited the handset at your authorized Andheri service center under Job Sheet #MUM-88421.

The service center intake record clearly confirms the outer body and front glass are completely scratch-free with no physical damage or water exposure. Despite this, the service team has denied warranty coverage citing 'internal pressure' and asked for ₹14,500 repair charges.

Since this issue is widely acknowledged as a software update display glitch, I kindly request the grievance team to review this case and approve a complimentary screen replacement under standard warranty terms.

I have attached copies of the tax invoice and the initial service intake sheet for your reference.

Looking forward to your positive response and resolution.

Warm regards,
Pooja Mehta
+91 98200 54321`,
        statutoryReference: 'Consumer Protection Act, 2019 (Warranty Obligations)',
        disclaimer: 'Settlement-first grievance email to manufacturer before escalating to NCH or e-Daakhil.',
        groundingRefIds: ['fact-1', 'fact-2', 'doc-1', 'doc-2'],
        createdAt: '2026-09-17',
        status: 'ready_to_send'
      },
      {
        id: 'draft-2-formal',
        matterId: 'matter-mumbai-consumer',
        type: 'formal_demand',
        communicationTier: 'formal',
        title: '📄 Formal Pre-Litigation Demand to Brand Nodal Officer',
        recipientName: 'Nodal / Grievance Officer, Apex Mobile India Pvt. Ltd.',
        recipientAddress: 'Corporate Office, Bandra Kurla Complex, Mumbai - 400051',
        subject: 'FORMAL DEMAND FOR FREE WARRANTY REPAIR / PRODUCT REPLACEMENT - JOB SHEET #MUM-88421',
        content: `Date: 17 September 2026

To:
The Principal Nodal Officer
Apex Mobile India Pvt. Ltd.
Corporate Office, BKC, Mumbai - 400051
Email: nodalofficer.india@apexmobile.com

From:
Ms. Pooja Mehta
Residing at Mumbai Suburban
Mobile: +91 98200 54321
Email: pooja.mehta@email.com

SUBJECT: FORMAL DEMAND UNDER CONSUMER PROTECTION ACT 2019 FOR RECTIFICATION OF DEFICIENCY IN SERVICE (JOB SHEET #MUM-88421)

Sir / Madam,

1. I am the bona fide purchaser of Apex Pro 5G handset purchased for ₹42,000/- on 10.12.2025 under Tax Invoice RET-9921, carrying active 1-year warranty.
2. On 20.08.2026, within active warranty, the display malfunctioned with green lines post official firmware update.
3. Job Sheet #MUM-88421 confirms zero external impact or crack.
4. The demand of ₹14,500/- for display replacement constitutes 'Deficiency in Service' under Section 2(11) and 'Unfair Trade Practice' under Section 2(47) of the Consumer Protection Act, 2019.

You are formally called upon to arrange free display replacement or refund ₹42,000/- within SEVEN (7) DAYS of receipt of this notice, failing which a consumer complaint shall be lodged on the e-Daakhil portal without further reference.

Yours faithfully,

(Pooja Mehta)`,
        statutoryReference: 'Section 2(11) & Section 2(47), Consumer Protection Act 2019',
        disclaimer: 'Pre-litigation demand letter setting a 7-day cure window prior to filing on e-Daakhil.',
        groundingRefIds: ['fact-1', 'fact-2', 'doc-1', 'doc-2'],
        createdAt: '2026-09-17',
        status: 'ready_to_send'
      },
      {
        id: 'draft-2-legal',
        matterId: 'matter-mumbai-consumer',
        type: 'consumer_complaint',
        communicationTier: 'lawyer_ready',
        title: '⚖️ e-Daakhil Consumer Complaint Plaint (Section 35 CPA)',
        recipientName: 'District Consumer Disputes Redressal Commission, Mumbai Suburban',
        recipientAddress: 'Administrative Building, Bandra (E), Mumbai - 400051',
        subject: 'CONSUMER COMPLAINT UNDER SECTION 35 FOR DEFICIENCY IN SERVICE AND REFUSAL OF WARRANTY',
        content: `BEFORE THE HON'BLE DISTRICT CONSUMER DISPUTES REDRESSAL COMMISSION, MUMBAI SUBURBAN

COMPLAINT NO. ________ / 2026

IN THE MATTER OF:
Ms. Pooja Mehta
Residing at: Mumbai Suburban
...COMPLAINANT

VERSUS

1. Apex Mobile India Pvt. Ltd.
Through its Managing Director
Corporate Address, BKC, Mumbai - 400051

2. Authorized Electronics Retailer, Bandra
...OPPOSITE PARTIES

COMPLAINT UNDER SECTION 35 OF THE CONSUMER PROTECTION ACT, 2019

MOST RESPECTFULLY SHOWETH:

1. That the Complainant is a 'Consumer' within the meaning of Section 2(7) of the Consumer Protection Act, 2019, having purchased a smartphone (Model: Apex Pro 5G) for a total consideration of ₹42,000/- on 10.12.2025 vide Tax Invoice No. RET-9921 attached herewith.

2. That the Opposite Parties provided a standard 1-Year Comprehensive Manufacturer Warranty covering all hardware and display defects.

3. That on 20.08.2026, within the active warranty period, the display unit suddenly malfunctioned with multiple green vertical lines immediately following an official OTA firmware update.

4. That the Complainant deposited the device with Opposite Party No. 1's authorized service center on 20.08.2026 vide Job Sheet #MUM-88421. The Job Sheet unequivocally records the external condition as clean without any cracks or physical impact.

5. That the Opposite Parties arbitrarily and maliciously rejected the free warranty claim, demanding ₹14,500/- for display repair, which amounts to a gross 'Deficiency in Service' under Section 2(11) and 'Unfair Trade Practice' under Section 2(47) of the Act.

PRAYER:
It is therefore respectfully prayed that this Hon'ble Commission may be pleased to:
a) Direct the Opposite Parties to replace the defective handset with a brand new sealed unit OR refund the purchase price of ₹42,000/- with 12% interest p.a.;
b) Direct the Opposite Parties to pay ₹25,000/- towards compensation for mental agony, harassment, and loss of communication utility;
c) Direct payment of ₹10,000/- towards litigation costs incurred.

(Pooja Mehta)
Complainant in Person`,
        statutoryReference: 'Consumer Protection Act, 2019 (Section 2(11), 2(47), 35)',
        disclaimer: 'Generated for direct filing on the e-Daakhil digital portal (edaakhil.nic.in). No advocate mandate required for filing.',
        groundingRefIds: ['fact-1', 'fact-2', 'doc-1', 'doc-2'],
        createdAt: '2026-09-17',
        status: 'ready_to_send'
      }
    ],

    escalationRoutes: [
      {
        id: 'esc-1',
        name: 'e-Daakhil Online Portal (National Consumer Commission)',
        type: 'consumer_forum_edaakhil',
        description: 'File consumer cases online from home without paying advocate fees or visiting the consumer court.',
        criteriaMet: true,
        eligibilityDescription: 'All consumers who suffered defective goods or deficiency in services.',
        officialPortalUrl: 'https://edaakhil.nic.in',
        tollFreeNumber: '1915 (National Consumer Helpline)',
        stepsToApply: [
          'Register with Aadhaar / Mobile OTP on edaakhil.nic.in',
          'Upload Invoice, Job Sheet, and NyaySaathi Consumer Complaint Draft',
          'Pay nominal online fee (₹0 for claims up to ₹5 Lakhs under new rules)'
        ],
        costEstimate: '₹0 (Zero court fee for claims under ₹5 Lakh)'
      }
    ],

    lawyerBrief: {
      id: 'brief-2',
      matterId: 'matter-mumbai-consumer',
      executiveSummary: 'Ms. Pooja Mehta purchased a ₹42,000 smartphone with 1-year warranty. Display developed green lines within warranty period post-OTA update. Service center refused free repair alleging pressure damage despite clean external condition recorded on job sheet.',
      keyChronology: [
        { date: '2025-12-10', event: 'Purchased device for ₹42,000.' },
        { date: '2026-08-20', event: 'Screen malfunctioned; deposited at Andheri service center.' },
        { date: '2026-08-24', event: 'Warranty arbitrarily rejected.' }
      ],
      legalIssuesIdentified: [
        'Deficiency in service under Section 2(11) CPA 2019.',
        'Unfair trade practice in shifting burden of software-induced hardware defects onto consumers.'
      ],
      statutoryReferences: [
        {
          statute: 'Consumer Protection Act, 2019',
          section: 'Section 35',
          applicability: 'Filing before District Consumer Commission.'
        }
      ],
      reliefSought: [
        'Replacement or ₹42,000 refund with interest.',
        '₹25,000 compensation for harassment.'
      ],
      evidentiaryReadiness: {
        strongProof: [
          'Original GST purchase tax invoice',
          'Service center intake job sheet confirming clean exterior',
          'Email refusal thread'
        ],
        gapsOrMissingProof: []
      },
      estimatedClaimAmount: '₹42,000 + ₹25,000 damages',
      jurisdictionState: 'Maharashtra (Mumbai Suburban)',
      generatedAt: '17 September 2026'
    },

    trustSafetyItems: [
      {
        tier: 'fact',
        label: 'Purchase & Warranty Proof',
        text: 'Tax invoice proves device was purchased on 10 Dec 2025 and is within warranty period.',
        citation: 'Doc ID: doc-1'
      },
      {
        tier: 'explanation',
        label: 'Consumer Forum Procedure',
        text: 'Under Consumer Protection Act 2019, claims under ₹5 Lakh have zero court fee and consumers can argue their own cases directly on e-Daakhil without hiring a lawyer.',
        disclaimer: 'Procedural guidance.'
      },
      {
        tier: 'possibility',
        label: 'Company Legal Argument',
        text: 'The brand will claim user induced internal screen pressure.',
        disclaimer: 'Likely defense position.'
      },
      {
        tier: 'counsel_required',
        label: 'Appeals to State Commission',
        text: 'If the matter requires an appeal from District to State Commission, engaging a specialized consumer advocate is recommended.',
        citation: 'Section 41 CPA 2019',
        confidenceScore: 0.95,
        groundingStatus: 'grounded'
      },
      {
        tier: 'unsupported',
        label: 'Internal Pressure Damage Allegation',
        text: 'The brand\'s claim that user caused internal display pressure without any external drop or glass cracks is an unsupported assertion lacking forensic hardware diagnosis.',
        disclaimer: 'Burden of proving user-induced physical impact lies with manufacturer.',
        confidenceScore: 0.3,
        groundingStatus: 'unsupported'
      }
    ],

    auditLog: [
      {
        original: 'Apex Mobile committed criminal cheating and must replace the phone within 24 hours.',
        rewritten: 'The refusal of warranty appears to constitute deficiency in service under Section 2(11) CPA 2019; replacement or refund may be sought.',
        reason: 'Replaced coercive criminal charge with consumer deficiency in service statutory ground.',
        timestamp: '2026-09-15T09:15:00Z',
        component: 'SafetyVerificationAgent'
      }
    ]
  }
];
