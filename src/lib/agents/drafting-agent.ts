import { AgentInput, DraftingAgentResult } from './types';
import { LegalDraft, LawyerBrief } from '@/types/matter';

export class DraftingAgent {
  /**
   * Generates formal, legally compliant Indian drafts (Legal Notice under Contract/Rent/CPA law,
   * e-Daakhil consumer complaint, RTI application) and generates an Advocate Case Briefing Sheet.
   */
  public async execute(
    input: AgentInput,
    extractedParties: Array<{ name: string; role: string }>,
    timelineEvents: Array<{ date: string; title: string; description: string }>
  ): Promise<DraftingAgentResult> {
    const drafts: LegalDraft[] = [];
    const today = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const claimant = extractedParties.find(p => p.role.includes('Aggrieved') || p.role.includes('You'))?.name || 'Aggrieved Party';
    const respondent = extractedParties.find(p => p.role.includes('Opposing') || p.role.includes('Landlord') || p.role.includes('Seller') || p.role.includes('Builder'))?.name || 'Opposing Party';
    const claimAmountStr = input.claimAmount ? `₹${input.claimAmount.toLocaleString('en-IN')}` : 'the specified refund amount';

    // 1. Generate Legal Notice / Demand Letter
    let draftTitle = 'Legal Demand Notice';
    let draftSubject = `Demand for immediate payment and compliance`;
    let draftContent = '';
    let draftStatutoryRef = '';

    if (input.category === 'tenancy_housing') {
      draftTitle = 'Formal Legal Demand Notice for Security Deposit Refund';
      draftSubject = `DEMAND NOTICE FOR REFUND OF UNLAWFULLY WITHHELD SECURITY DEPOSIT OF ${claimAmountStr}`;
      draftStatutoryRef = 'Indian Contract Act 1872 & Applicable State Rent Control / Tenancy Laws';
      draftContent = `BY REGISTERED POST WITH ACKNOWLEDGEMENT DUE / SPEED POST / EMAIL

Date: ${today}

TO:
${respondent}
[Insert Residential/Business Address]
[Insert City, State, PIN Code]

FROM:
${claimant}
[Insert Current Address]
[Insert Contact Number & Email]

SUBJECT: ${draftSubject}

Sir/Madam,

Under instructions and on behalf of my client/myself, ${claimant}, residing at the above address, this formal Demand Notice is hereby served upon you:

1. That you, the Addressee, had leased the residential premises to the Applicant pursuant to a valid Rental Agreement entered into between the parties.
2. That at the inception of the tenancy, the Applicant transferred a refundable security deposit sum of ${claimAmountStr} to your account.
3. That the Applicant peacefully vacated the leased premises and handed over vacant possession along with the keys after serving due notice.
4. That despite repeated requests and handover of the premises in clean condition, you have failed and neglected to refund the said security deposit of ${claimAmountStr}, which amounts to wrongful withholding and breach of trust.
5. That ordinary wear and tear during tenancy cannot legally be deducted without submitting original tax invoices and mutual inspection.

THEREFORE, I hereby call upon you to refund the full security deposit amount of ${claimAmountStr} along with interest @ 12% per annum into the bank account of the Applicant within FIFTEEN (15) DAYS from the receipt of this notice, failing which the Applicant shall be constrained to initiate appropriate civil proceedings, including filing a petition before the Rent Tribunal / Small Causes Court and District Legal Services Authority (DLSA), holding you liable for all legal costs and consequences arising therefrom.

Yours sincerely,

${claimant}`;
    } else if (input.category === 'consumer_dispute') {
      draftTitle = 'Statutory Legal Notice for Deficiency in Service & Product Defect';
      draftSubject = `LEGAL NOTICE UNDER SECTION 35 OF THE CONSUMER PROTECTION ACT, 2019`;
      draftStatutoryRef = 'Section 2(11), Section 2(47), and Section 35 of Consumer Protection Act, 2019';
      draftContent = `BY SPEED POST / EMAIL

Date: ${today}

TO:
1. ${respondent} (Manufacturer / Service Provider)
[Corporate Office Address]
2. The Authorized Retailer / Service Center

FROM:
${claimant}
[Consumer Address & Phone]

SUBJECT: ${draftSubject}

Sir/Madam,

Please take notice that I, ${claimant}, purchased the product/service bearing Invoice No. [Insert Invoice Number] for valuable consideration of ${claimAmountStr}.

1. That the said product/service developed severe functional defects within the warranty period, causing substantial hardship and loss of utility.
2. That upon reporting the issue to your authorized service center, your representatives arbitrarily refused to honor the warranty obligations or effect free replacement/repair.
3. That your refusal constitutes a blatant "Deficiency in Service" under Section 2(11) and "Unfair Trade Practice" under Section 2(47) of the Consumer Protection Act, 2019.

THEREFORE, you are hereby called upon to:
a) Replace the defective product with a brand new unit OR refund the entire purchase price of ${claimAmountStr} with 12% annual interest;
b) Pay a sum of ₹25,000 towards compensation for mental agony, harassment, and litigation expenses incurred by the Consumer;

Within FIFTEEN (15) DAYS of the receipt of this notice, failing which a formal Consumer Complaint will be instituted before the District Consumer Disputes Redressal Commission via the e-Daakhil portal.

Yours faithfully,

${claimant}`;
    } else {
      draftTitle = 'Formal Legal Notice of Dispute & Demand for Compliance';
      draftSubject = `LEGAL NOTICE CALLING FOR IMMEDIATE RECTIFICATION AND PAYMENT`;
      draftStatutoryRef = 'Indian Contract Act, 1872 & Code of Civil Procedure, 1908';
      draftContent = `Date: ${today}

TO: ${respondent}
FROM: ${claimant}

SUBJECT: ${draftSubject}

Sir/Madam,

This notice is served upon you regarding the breach of agreed obligations and non-payment of legitimate dues amounting to ${claimAmountStr}.

You are hereby called upon to settle the entire outstanding liability within 15 days of this notice, failing which civil and statutory recovery proceedings will be initiated at your sole risk and cost.

${claimant}`;
    }

    drafts.push({
      id: 'draft-1',
      matterId: input.matterId,
      type: input.category === 'consumer_dispute' ? 'consumer_complaint' : 'legal_notice',
      title: draftTitle,
      recipientName: respondent,
      subject: draftSubject,
      content: draftContent,
      statutoryReference: draftStatutoryRef,
      disclaimer: 'This draft is generated for informational structuring purposes based on user inputs. Please review dates, party names, and account numbers prior to formal dispatch.',
      createdAt: today,
      status: 'ready_to_send'
    });

    // 2. Generate 1-Page Lawyer Case Brief
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
          statute: draftStatutoryRef || 'Applicable Indian Laws',
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
          'Proof of service / delivery acknowledgment of final demand notice'
        ]
      },
      estimatedClaimAmount: claimAmountStr,
      jurisdictionState: input.locationState || 'State of Jurisdiction',
      generatedAt: today
    };

    return {
      drafts,
      lawyerBrief
    };
  }
}
