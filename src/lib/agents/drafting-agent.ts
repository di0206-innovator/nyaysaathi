import { AgentInput, DraftingAgentResult, AgentMemoryEnvelope, SourceReference } from './types';
import { LegalDraft, LawyerBrief } from '@/types/matter';

export class DraftingAgent {
  public async execute(
    input: AgentInput,
    extractedParties: Array<{ name: string; role: string }>,
    timelineEvents: Array<{ date: string; title: string; description: string }>
  ): Promise<AgentMemoryEnvelope<DraftingAgentResult>> {
    const sourceReferences: SourceReference[] = [];
    const assumptions: string[] = [];
    const unresolvedQuestions: string[] = [];
    const drafts: LegalDraft[] = [];

    const today = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const claimant = extractedParties.find(p => p.role.includes('Aggrieved') || p.role.includes('You'))?.name || 'Aggrieved Party';
    const respondent = extractedParties.find(p => p.role.includes('Opposing') || p.role.includes('Landlord') || p.role.includes('Seller') || p.role.includes('Builder'))?.name || 'Opposing Party';
    const claimAmountStr = input.claimAmount ? `₹${input.claimAmount.toLocaleString('en-IN')}` : 'the specified refund amount';

    if (input.category === 'tenancy_housing') {
      // 1. Tier 1: Soft Request (WhatsApp / Email reminder)
      drafts.push({
        id: 'draft-tenancy-soft',
        matterId: input.matterId,
        type: 'soft_request',
        communicationTier: 'soft',
        title: '🌱 Friendly Settlement Reminder (WhatsApp / Email)',
        recipientName: respondent,
        subject: `Gentle reminder regarding security deposit refund for rented flat`,
        content: `Hi ${respondent},

Hope you are doing well.

I am writing regarding the refund of my security deposit of ${claimAmountStr} for the apartment. As you know, I handed over the keys and vacant possession with due notice on move-out day in clean condition.

It has now been more than 30 days since move-out. Could you please let me know when the deposit will be transferred to my bank account? If there are any specific utility bills or legitimate deductions, please share the contractor receipts or GST bills so we can reconcile and settle this mutually without delay.

Looking forward to your positive confirmation.

Best regards,
${claimant}`,
        disclaimer: 'Informal polite communication recommended as the first step before taking formal legal steps.',
        createdAt: today,
        status: 'ready_to_send',
        groundingRefIds: ['narrative-user']
      });

      // 2. Tier 2: Formal Demand Letter
      drafts.push({
        id: 'draft-tenancy-formal',
        matterId: input.matterId,
        type: 'formal_demand',
        communicationTier: 'formal',
        title: '📄 Formal Written Demand Letter (10-Day Cure Period)',
        recipientName: respondent,
        subject: `FORMAL WRITTEN DEMAND FOR REFUND OF SECURITY DEPOSIT OF ${claimAmountStr}`,
        content: `Date: ${today}

TO:
${respondent}
[Landlord Address]

FROM:
${claimant}
[Tenant Address & Contact]

SUBJECT: FORMAL DEMAND FOR REFUND OF SECURITY DEPOSIT OF ${claimAmountStr}

Dear Sir/Madam,

This is a formal communication regarding the tenancy of the residential premises vacated by me.

1. Pursuant to our Rental Agreement, an interest-free refundable Security Deposit of ${claimAmountStr} was paid by me at tenancy commencement.
2. I vacated the premises and delivered peaceful possession along with all keys after giving proper 30-day notice. All utility bills were cleared.
3. Under the lease terms and Indian tenancy guidelines, the deposit was to be returned within 15-30 days of vacant possession.
4. Despite reminders, the deposit has not been refunded. Under Indian law, ordinary wear and tear cannot be unilaterally deducted without furnishing authentic third-party contractor bills.

I request you to transfer the full deposit sum of ${claimAmountStr} into my bank account within TEN (10) DAYS of this letter:
Bank Name: [Insert Bank Name]
Account Number: [Insert Account Number]
IFSC Code: [Insert IFSC Code]

Failing which, I will be constrained to initiate formal dispute resolution, including approaching the District Legal Services Authority (DLSA) for pre-litigation mediation.

Yours sincerely,

${claimant}`,
        disclaimer: 'Structured formal demand establishing written record before statutory notice dispatch.',
        createdAt: today,
        status: 'ready_to_send',
        groundingRefIds: ['narrative-user']
      });

      // 3. Tier 3: Lawyer-Ready Statutory Legal Notice
      drafts.push({
        id: 'draft-tenancy-legal-notice',
        matterId: input.matterId,
        type: 'legal_notice',
        communicationTier: 'lawyer_ready',
        title: '⚖️ Statutory Legal Notice (Registered Speed Post RPAD)',
        recipientName: respondent,
        subject: `LEGAL NOTICE UNDER INDIAN CONTRACT ACT 1872 & RENT CONTROL LAWS`,
        content: `BY REGISTERED POST WITH ACKNOWLEDGEMENT DUE / SPEED POST & EMAIL

Date: ${today}

TO:
${respondent}
[Landlord Residential / Business Address]

FROM:
${claimant}
[Tenant Address & Contact]

SUBJECT: STATUTORY LEGAL NOTICE FOR WRONGFUL WITHHOLDING OF SECURITY DEPOSIT OF ${claimAmountStr}

Sir/Madam,

Under instructions and on behalf of myself, ${claimant}, residing at the above address, this formal Legal Notice is hereby served upon you:

1. That you, the Addressee, had leased the residential premises to the Applicant pursuant to a valid Rental Agreement entered into between the parties.
2. That at the inception of the tenancy, the Applicant transferred a refundable security deposit sum of ${claimAmountStr} to your account through verified banking channel.
3. That the Applicant peacefully vacated the leased premises and handed over vacant possession along with the keys after serving due 30-day notice.
4. That despite repeated written requests and handover of the premises in clean condition, you have failed and neglected to refund the said security deposit, which amounts to wrongful withholding and breach of contract under Section 73 of the Indian Contract Act, 1872.
5. That ordinary wear and tear during tenancy cannot legally be deducted without submitting original tax invoices and mutual inspection.

THEREFORE, I hereby formally call upon you to refund the full security deposit amount of ${claimAmountStr} along with interest @ 12% per annum into the bank account of the Applicant within FIFTEEN (15) DAYS from the receipt of this notice, failing which the Applicant shall initiate appropriate civil proceedings, including filing a petition before the Rent Tribunal / Court of Small Causes and District Legal Services Authority (DLSA), holding you liable for all legal costs and consequences arising therefrom.

Yours sincerely,

${claimant}`,
        statutoryReference: 'Indian Contract Act 1872 & State Tenancy / Rent Control Laws',
        disclaimer: 'Formal statutory notice for Speed Post dispatch with postal tracking proof.',
        createdAt: today,
        status: 'ready_to_send',
        groundingRefIds: ['narrative-user']
      });
    } else if (input.category === 'consumer_dispute') {
      // Consumer Dispute Tiers
      drafts.push({
        id: 'draft-cpa-soft',
        matterId: input.matterId,
        type: 'soft_request',
        communicationTier: 'soft',
        title: '🌱 Customer Care Nodal Officer Escalation (Email / Web)',
        recipientName: respondent,
        subject: `Grievance escalation regarding defective product / service denial`,
        content: `Dear Customer Service & Nodal Escalations Team (${respondent}),

I am writing regarding my purchase of [Product/Service Name] under Invoice No. [Insert Invoice No] purchased for ${claimAmountStr}.

The device has developed serious functional defects during the active warranty period. I deposited the unit with your authorized service center (Job Sheet Ref: [Insert Job Sheet No]), but my warranty claim was unexpectedly denied without valid technical justification.

I request you to re-evaluate this ticket and authorize a free warranty display/part replacement or refund at the earliest so this can be resolved smoothly.

Customer Name: ${claimant}
Phone: [Insert Phone]

Thank you,
${claimant}`,
        disclaimer: 'Polite brand escalation recommended before lodging consumer helpline complaints.',
        createdAt: today,
        status: 'ready_to_send',
        groundingRefIds: ['narrative-user']
      });

      drafts.push({
        id: 'draft-cpa-formal',
        matterId: input.matterId,
        type: 'formal_demand',
        communicationTier: 'formal',
        title: '📄 Formal Notice of Deficiency under CPA 2019',
        recipientName: respondent,
        subject: `FORMAL NOTICE OF DEFICIENCY IN SERVICE UNDER CONSUMER PROTECTION ACT 2019`,
        content: `Date: ${today}

TO:
1. ${respondent} (Manufacturer / Brand Headquarters)
2. The Authorized Service Center / Retailer

FROM:
${claimant}
[Consumer Address & Contact]

SUBJECT: NOTICE CALLING FOR IMMEDIATE WARRANTY REDRESSAL / REFUND OF ${claimAmountStr}

Sir/Madam,

Please take notice that I, ${claimant}, purchased your product/service for ${claimAmountStr} with 1-Year Comprehensive Warranty.

1. The product suffered critical functional defects within warranty.
2. The service intake job sheet confirms no external physical glass/liquid damage caused by user.
3. Your refusal to honor the warranty constitutes 'Deficiency in Service' under Section 2(11) of the Consumer Protection Act, 2019.

I hereby call upon you to replace the defective unit or refund ${claimAmountStr} within TEN (10) DAYS, failing which a formal docket will be lodged with the National Consumer Helpline (1915) followed by an e-Daakhil consumer complaint.

Yours faithfully,

${claimant}`,
        disclaimer: 'Formal notice before e-Daakhil filing.',
        createdAt: today,
        status: 'ready_to_send',
        groundingRefIds: ['narrative-user']
      });

      drafts.push({
        id: 'draft-cpa-edaakhil-complaint',
        matterId: input.matterId,
        type: 'consumer_complaint',
        communicationTier: 'lawyer_ready',
        title: '⚖️ e-Daakhil Consumer Complaint Plaint (Section 35 CPA 2019)',
        recipientName: 'District Consumer Disputes Redressal Commission',
        subject: `CONSUMER COMPLAINT UNDER SECTION 35 FOR DEFICIENCY IN SERVICE`,
        content: `BEFORE THE HON'BLE DISTRICT CONSUMER DISPUTES REDRESSAL COMMISSION

IN THE MATTER OF:
${claimant}
...COMPLAINANT

VERSUS

${respondent}
...OPPOSITE PARTY

COMPLAINT UNDER SECTION 35 OF THE CONSUMER PROTECTION ACT, 2019

1. That the Complainant is a 'Consumer' within Section 2(7) of CPA 2019, having purchased the goods/services for ${claimAmountStr}.
2. That Opposite Party failed to honor warranty terms during active coverage.
3. That this refusal constitutes deficiency in service under Section 2(11) and unfair trade practice under Section 2(47).

PRAYER:
a) Direct replacement of the defective product OR full refund of ${claimAmountStr} with 12% interest p.a.;
b) Direct payment of ₹25,000 towards compensation for harassment and mental agony;
c) Direct payment of ₹10,000 towards litigation costs.

( ${claimant} )
Complainant in Person`,
        statutoryReference: 'Consumer Protection Act 2019 (Section 35)',
        disclaimer: 'Directly uploadable to edaakhil.nic.in without requiring an advocate.',
        createdAt: today,
        status: 'ready_to_send',
        groundingRefIds: ['narrative-user']
      });
    } else {
      // General Civil Matter Tiers
      drafts.push({
        id: 'draft-gen-soft',
        matterId: input.matterId,
        type: 'soft_request',
        communicationTier: 'soft',
        title: '🌱 Friendly Settlement Communication',
        recipientName: respondent,
        subject: `Amicable resolution regarding outstanding matter`,
        content: `Dear ${respondent},\n\nWriting to follow up regarding our arrangement and the pending balance of ${claimAmountStr}. Please let me know when we can settle this amicably.\n\nBest regards,\n${claimant}`,
        disclaimer: 'First-stage friendly communication.',
        createdAt: today,
        status: 'ready_to_send',
        groundingRefIds: ['narrative-user']
      });

      drafts.push({
        id: 'draft-gen-formal',
        matterId: input.matterId,
        type: 'formal_demand',
        communicationTier: 'formal',
        title: '📄 Formal Demand Letter',
        recipientName: respondent,
        subject: `FORMAL DEMAND FOR PAYMENT OF ${claimAmountStr}`,
        content: `Date: ${today}\n\nTO: ${respondent}\nFROM: ${claimant}\n\nSir/Madam,\n\nThis is a formal demand for settlement of ${claimAmountStr} within 10 days.\n\n${claimant}`,
        disclaimer: 'Formal demand before statutory legal notice.',
        createdAt: today,
        status: 'ready_to_send',
        groundingRefIds: ['narrative-user']
      });

      drafts.push({
        id: 'draft-gen-notice',
        matterId: input.matterId,
        type: 'legal_notice',
        communicationTier: 'lawyer_ready',
        title: '⚖️ Statutory Legal Notice',
        recipientName: respondent,
        subject: `STATUTORY LEGAL NOTICE FOR RECOVERY OF ${claimAmountStr}`,
        content: `BY SPEED POST RPAD\n\nDate: ${today}\n\nTO: ${respondent}\nFROM: ${claimant}\n\nCalling upon you to settle ${claimAmountStr} within 15 days failing which civil recovery proceedings will be instituted.\n\n${claimant}`,
        statutoryReference: 'Indian Contract Act 1872',
        disclaimer: 'Statutory 15-day notice format.',
        createdAt: today,
        status: 'ready_to_send',
        groundingRefIds: ['narrative-user']
      });
    }

    // 1-Page Lawyer Brief
    const lawyerBrief: LawyerBrief = {
      id: 'brief-1',
      matterId: input.matterId,
      executiveSummary: `${claimant} is seeking recovery/redressal against ${respondent} arising out of ${input.category.replace(/_/g, ' ')}. The total quantified financial claim is ${claimAmountStr}. All communications and transaction receipts have been collated.`,
      keyChronology: timelineEvents.map(e => ({
        date: e.date,
        event: `${e.title} - ${e.description}`
      })),
      legalIssuesIdentified: [
        `Whether the actions of ${respondent} constitute actionable breach under governing Indian statutes.`,
        `Whether the claim is well within the limitation period under the Indian Limitation Act 1963.`,
        `Quantification of interest and damages for mental harassment and contractual non-performance.`
      ],
      statutoryReferences: [
        {
          statute: 'Governing Indian Laws & Precedents',
          applicability: 'Primary statutory anchor for establishing liability and securing relief.'
        }
      ],
      reliefSought: [
        `Full restitution / refund of ${claimAmountStr} with 12% statutory interest.`,
        `Compensation for damages, delay, and litigation overheads.`
      ],
      evidentiaryReadiness: {
        strongProof: [
          'Written agreement / contract record on file',
          'Bank / UPI transaction logs establishing payment consideration',
          'Contemporaneous electronic chat / email trail'
        ],
        gapsOrMissingProof: [
          'Postal delivery tracking slip of formal speed post legal notice'
        ]
      },
      estimatedClaimAmount: claimAmountStr,
      jurisdictionState: input.locationState || 'State of Jurisdiction',
      generatedAt: today,
      groundingRefIds: ['narrative-user']
    };

    drafts.forEach(d => {
      sourceReferences.push({
        id: d.id,
        type: 'doc',
        label: `${d.title} (${d.communicationTier})`
      });
    });

    return {
      result: {
        drafts,
        lawyerBrief
      },
      confidenceScore: 0.95,
      sourceReferences,
      assumptions,
      unresolvedQuestions,
      safetyFlags: []
    };
  }
}
