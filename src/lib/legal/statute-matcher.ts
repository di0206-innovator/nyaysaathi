import { INDIAN_STATUTES } from './statutes';
import { MatterCategory } from '@/types/matter';

export interface StatuteMatchCriteria {
  category: MatterCategory;
  state?: string;
  claimAmount?: number;
  hasRegisteredAgreement?: boolean;
  isUrgentLimitation?: boolean;
}

export interface MatchedStatuteResult {
  statute: string;
  section: string;
  title: string;
  category: string;
  plainSummary: string;
  limitationMonths?: number;
  forumOrAuthority: string;
  standardRemedy: string;
  matchScore: number;
  matchReason: string;
}

export class StatuteMatcher {
  public static match(criteria: StatuteMatchCriteria): MatchedStatuteResult[] {
    const results: MatchedStatuteResult[] = [];
    const state = criteria.state?.toLowerCase() || '';

    for (const statute of INDIAN_STATUTES) {
      let score = 0;
      let reason = '';

      if (statute.category === criteria.category) {
        score += 50;
        reason = `Matches primary matter category (${criteria.category.replace(/_/g, ' ')})`;
      }

      // State specific adjustments
      if (criteria.category === 'tenancy_housing') {
        if (state.includes('karnataka')) {
          reason += ' • Adjusted for Karnataka Rent Act & Model Tenancy framework in Bengaluru';
          score += 20;
        } else if (state.includes('maharashtra')) {
          reason += ' • Adjusted for Maharashtra Rent Control Act & Leave and License rules';
          score += 20;
        } else if (state.includes('delhi')) {
          reason += ' • Adjusted for Delhi Rent Control Act & Transfer of Property Act rules';
          score += 20;
        }
      }

      // Claim amount pecuniary adjustments for Consumer Disputes (CPA 2019 rules)
      if (criteria.category === 'consumer_dispute') {
        const amt = criteria.claimAmount || 0;
        if (amt <= 5000000) { // Up to 50 Lakhs -> District Commission
          reason += ' • Claim quantum qualifies for District Consumer Commission under CPA 2019 (Pecuniary limit ₹50 Lakhs)';
          score += 25;
        } else {
          reason += ' • Claim quantum exceeds ₹50 Lakhs, directing jurisdiction to State Consumer Commission';
          score += 25;
        }
      }

      // Real estate builder delays under RERA
      if (criteria.category === 'property_rera') {
        if (state.includes('uttar pradesh') || state.includes('noida') || state.includes('up')) {
          reason += ' • Grounded under UP-RERA Authority & Adjudicating Officer regulations';
          score += 25;
        } else if (state.includes('maharashtra') || state.includes('mumbai') || state.includes('pune')) {
          reason += ' • Grounded under MahaRERA fast-track conciliation procedures';
          score += 25;
        }
      }

      if (score > 0) {
        results.push({
          ...statute,
          matchScore: score,
          matchReason: reason
        });
      }
    }

    // Sort by highest match score
    return results.sort((a, b) => b.matchScore - a.matchScore);
  }
}
