import { AgentInput, IntakeAgentResult } from './types';
import { Party } from '@/types/matter';

export class IntakeAgent {
  /**
   * Parses free-form user narrative and structured intake inputs,
   * normalizes parties, extracts amounts, and synthesizes key legal conflict.
   */
  public async execute(input: AgentInput): Promise<IntakeAgentResult> {
    const text = input.userStory;
    
    // Extract financial amounts if mentioned in text and not provided
    let extractedAmount = input.claimAmount;
    if (!extractedAmount) {
      const amountMatch = text.match(/(?:₹|rs\.?|inr)\s*([\d,]+)/i);
      if (amountMatch) {
        extractedAmount = parseFloat(amountMatch[1].replace(/,/g, ''));
      }
    }

    // Identify parties if none provided
    const parties: Party[] = [...input.parties];
    if (parties.length === 0) {
      parties.push({
        id: 'p-1',
        name: 'Aggrieved Citizen (You)',
        role: 'Aggrieved (You)',
        city: input.locationCity,
        state: input.locationState
      });
      parties.push({
        id: 'p-2',
        name: 'Opposing Entity / Respondent',
        role: 'Opposing Party'
      });
    }

    // Generate plain-language summary & legal classification
    let plainLanguageSummary = '';
    let keyConflict = '';
    let legalNature = '';

    switch (input.category) {
      case 'tenancy_housing':
        plainLanguageSummary = `Dispute regarding rental housing tenancy, involving security deposit withholding or maintenance deduction without proper itemized bills.`;
        keyConflict = `Withholding of refund post vacant possession without mutual agreement.`;
        legalNature = `Civil Contractual & Rent Control Violation`;
        break;
      case 'consumer_dispute':
        plainLanguageSummary = `Deficiency in goods/services or unfair trade practice where product/service delivered failed promised standard or warranty terms.`;
        keyConflict = `Refusal to repair, replace, or refund for defective product or deficient service.`;
        legalNature = `Consumer Protection Act, 2019 Violation`;
        break;
      case 'property_rera':
        plainLanguageSummary = `Real estate builder delay in flat possession or failure to adhere to registered allotment agreement.`;
        keyConflict = `Non-delivery of unit within promised timeline and non-payment of delayed possession interest.`;
        legalNature = `RERA Section 18 Statutory Violation`;
        break;
      case 'workplace_employment':
        plainLanguageSummary = `Unlawful wage withholding, non-payment of full & final settlement, or breach of employment agreement.`;
        keyConflict = `Employer withholding earned compensation, notice pay, or statutory benefits.`;
        legalNature = `Payment of Wages & Labour Law Non-Compliance`;
        break;
      case 'financial_cheque_bounce':
        plainLanguageSummary = `Dishonour of bank cheque issued towards legal debt or liability due to insufficiency of funds.`;
        keyConflict = `Default in honoring payment instrument within statutory window.`;
        legalNature = `Negotiable Instruments Act Section 138 (Quasi-Criminal)`;
        break;
      case 'cyber_fraud':
        plainLanguageSummary = `Unauthorized financial debit or online deception via digital channels or fake identity.`;
        keyConflict = `Financial misappropriation through online deceit.`;
        legalNature = `Cyber Fraud & Cheating under Bharatiya Nyaya Sanhita`;
        break;
      default:
        plainLanguageSummary = `Civil or administrative grievance requiring structured documentation and formal notice.`;
        keyConflict = `Unresolved rights violation or breach of representation.`;
        legalNature = `General Civil / Statutory Redressal`;
        break;
    }

    return {
      refinedTitle: input.title || `${input.category.replace(/_/g, ' ').toUpperCase()} Matter`,
      detectedCategory: input.category,
      detectedSubCategory: input.category.replace(/_/g, ' '),
      extractedParties: parties,
      claimAmount: extractedAmount,
      plainLanguageSummary,
      keyConflict,
      legalNature
    };
  }
}
