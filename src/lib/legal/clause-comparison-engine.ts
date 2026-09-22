// =============================================================================
// Clause Comparison Engine
// General-purpose semantic document comparison for legal documents
// =============================================================================

import {
  ClauseCategory,
  ClauseChangeStatus,
  ClauseComparison,
  DocumentClause,
  DocumentComparison,
  DocumentComparisonSummary,
} from '@/types/document-comparison';

// ---------------------------------------------------------------------------
// 1. Clause Segmentation
// ---------------------------------------------------------------------------

interface RawClause {
  heading: string;
  text: string;
  clauseNumber?: string;
  pageNumber?: number;
}

/**
 * Segments document text into individual clauses using heading patterns,
 * numbered sections, and structural cues.
 */
export function segmentClauses(
  text: string,
  documentId: string,
  documentTitle: string
): DocumentClause[] {
  if (!text || text.trim().length === 0) return [];

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const rawClauses: RawClause[] = [];
  let currentHeading = '';
  let currentClauseNum = '';
  let currentPage = 1;
  let currentLines: string[] = [];

  const headingPattern = /^(?:(?:clause|section|article|paragraph)\s*)?(\d+(?:\.\d+)?)[.):]\s*(.+)/i;
  const pagePattern = /^(?:page|pg\.?)\s*(\d+)/i;
  const romanPattern = /^(?:(?:[ivxlc]+)[.)]\s+)(.+)/i;

  for (const line of lines) {
    const pageMatch = line.match(pagePattern);
    if (pageMatch) {
      currentPage = parseInt(pageMatch[1], 10);
      continue;
    }

    const headingMatch = line.match(headingPattern) || line.match(romanPattern);
    if (headingMatch) {
      // Flush previous clause
      if (currentHeading) {
        rawClauses.push({
          heading: currentHeading,
          text: currentLines.length > 0 ? currentLines.join(' ') : currentHeading,
          clauseNumber: currentClauseNum,
          pageNumber: currentPage,
        });
      }
      currentClauseNum = headingMatch[1] || '';
      const rawHeading = (headingMatch[2] || headingMatch[1] || line).trim();
      
      const colonSplit = rawHeading.match(/^([^:\-–]{2,35})[:\-–]\s+(.+)/);
      if (colonSplit) {
        currentHeading = colonSplit[1].trim();
        currentLines = [colonSplit[2].trim()];
      } else {
        currentHeading = rawHeading;
        currentLines = [];
      }
    } else if (line.length > 5) {
      // Content line — if no heading yet, infer from content
      if (!currentHeading) {
        currentHeading = inferHeadingFromContent(line);
      }
      currentLines.push(line);
    }
  }

  // Flush last clause
  if (currentHeading) {
    rawClauses.push({
      heading: currentHeading,
      text: currentLines.length > 0 ? currentLines.join(' ') : currentHeading,
      clauseNumber: currentClauseNum,
      pageNumber: currentPage,
    });
  }

  // If segmentation found nothing, treat entire text as one clause
  if (rawClauses.length === 0 && text.trim().length > 0) {
    rawClauses.push({
      heading: 'General Terms',
      text: text.trim().slice(0, 2000),
      pageNumber: 1,
    });
  }

  return rawClauses.map((rc, idx) => ({
    id: `${documentId}-clause-${idx + 1}`,
    documentId,
    clauseNumber: rc.clauseNumber || `${idx + 1}`,
    heading: rc.heading,
    text: rc.text,
    pageNumber: rc.pageNumber,
    category: classifyClause(rc.heading, rc.text),
    sourceRefs: [{
      documentId,
      documentTitle,
      pageNumber: rc.pageNumber,
      clauseNumber: rc.clauseNumber || `${idx + 1}`,
      snippet: rc.text.slice(0, 120),
    }],
  }));
}

function inferHeadingFromContent(text: string): string {
  const lower = text.toLowerCase();
  if (/rent|monthly payment|lease amount/i.test(lower)) return 'Rent';
  if (/deposit|security|caution money/i.test(lower)) return 'Security Deposit';
  if (/notice period|written notice/i.test(lower)) return 'Notice';
  if (/terminat/i.test(lower)) return 'Termination';
  if (/maintenance|repair/i.test(lower)) return 'Maintenance';
  if (/jurisdiction|court/i.test(lower)) return 'Jurisdiction';
  return 'General Terms';
}

// ---------------------------------------------------------------------------
// 2. Clause Classification
// ---------------------------------------------------------------------------

const CATEGORY_KEYWORDS: Record<ClauseCategory, RegExp> = {
  rent: /\b(rent|monthly rent|lease amount|rental|tenancy amount)\b/i,
  security_deposit: /\b(security deposit|caution money|earnest money|deposit amount|refundable deposit)\b/i,
  indemnity: /\b(indemnif[a-z]*|indemnity|defend and indemnify|hold harmless)\b/i,
  liability: /\b(liability|liable|responsible|responsibility)\b/i,
  dispute_resolution: /\b(arbitrat[a-z]*|mediat[a-z]*|conciliat[a-z]*|grievance redress|dispute resolution)\b/i,
  jurisdiction: /\b(jurisdiction|courts?\s+(?:of|at|in)|venue|governing law|applicable law)\b/i,
  confidentiality: /\b(confidential[a-z]*|non.?disclosure|proprietary|trade secret|nda)\b/i,
  non_compete: /\b(non.?compete|non.?solicit[a-z]*|restrictive covenant|competing business)\b/i,
  intellectual_property: /\b(intellectual property|copyright|patent|trademark|invention|ip rights)\b/i,
  termination: /\b(terminat[a-z]*|end of agreement|cancellat[a-z]*|revocation|expiration)\b/i,
  notice: /\b(notice period|written notice|advance notice|prior notice|days.?notice|months.?notice)\b/i,
  duration: /\b(duration|term|period of|commencement|expiry|tenure|validity)\b/i,
  renewal: /\b(renewal|renew|extension|extend|continuation|auto.?renew)\b/i,
  maintenance: /\b(maintenance|upkeep|cleaning|sanitation|housekeeping|property care)\b/i,
  repairs: /\b(repair[a-z]*|restoration|damage|broken|fixture|fitting|wear and tear|painting)\b/i,
  penalties: /\b(penalt[a-z]*|fine|forfeiture|liquidated damages|late fee|breach penalty)\b/i,
  subletting: /\b(sublet|sublease|sub.?tenant|assign|transfer of tenancy)\b/i,
  insurance: /\b(insurance|insure|coverage|policy|premium)\b/i,
  restrictions: /\b(restrict[a-z]*|prohibit[a-z]*|not allowed|forbidden|guest|pet|smoking|subletting not)\b/i,
  compensation: /\b(compensation|salary|wages|bonus|incentive|gratuity|severance|payout)\b/i,
  payment: /\b(payment|pay|remuneration|fee|charge|billing|invoice)\b/i,
  definitions: /\b(definition[a-z]*|interpret[a-z]*|herein|means|shall mean)\b/i,
  other: /./,
};

export function classifyClause(heading: string, text: string): ClauseCategory {
  const combined = `${heading} ${text}`.toLowerCase();

  // Check specific categories first (before 'other')
  const categories = Object.entries(CATEGORY_KEYWORDS) as [ClauseCategory, RegExp][];
  for (const [category, pattern] of categories) {
    if (category === 'other') continue;
    if (pattern.test(combined)) {
      return category;
    }
  }
  return 'other';
}

// ---------------------------------------------------------------------------
// 3. Clause Matching
// ---------------------------------------------------------------------------

interface ClauseMatch {
  oldClause: DocumentClause;
  newClause: DocumentClause;
  matchScore: number;
}

/**
 * Matches clauses between two documents by category + heading similarity.
 * Returns matched pairs, unmatched old (removed), and unmatched new (added).
 */
export function matchClauses(
  oldClauses: DocumentClause[],
  newClauses: DocumentClause[]
): {
  matched: ClauseMatch[];
  removedFromOld: DocumentClause[];
  addedInNew: DocumentClause[];
} {
  const matched: ClauseMatch[] = [];
  const usedNewIndices = new Set<number>();
  const usedOldIndices = new Set<number>();

  // Pass 1: exact category + heading match
  for (let oi = 0; oi < oldClauses.length; oi++) {
    const oc = oldClauses[oi];
    for (let ni = 0; ni < newClauses.length; ni++) {
      if (usedNewIndices.has(ni)) continue;
      const nc = newClauses[ni];
      if (
        oc.category === nc.category &&
        normalizeHeading(oc.heading) === normalizeHeading(nc.heading)
      ) {
        matched.push({ oldClause: oc, newClause: nc, matchScore: 1.0 });
        usedOldIndices.add(oi);
        usedNewIndices.add(ni);
        break;
      }
    }
  }

  // Pass 2: category match with text similarity
  for (let oi = 0; oi < oldClauses.length; oi++) {
    if (usedOldIndices.has(oi)) continue;
    const oc = oldClauses[oi];
    let bestNi = -1;
    let bestScore = 0;

    for (let ni = 0; ni < newClauses.length; ni++) {
      if (usedNewIndices.has(ni)) continue;
      const nc = newClauses[ni];
      if (oc.category === nc.category) {
        const sim = textSimilarity(oc.text, nc.text);
        if (sim > bestScore && sim > 0.25) {
          bestScore = sim;
          bestNi = ni;
        }
      }
    }

    if (bestNi >= 0) {
      matched.push({
        oldClause: oc,
        newClause: newClauses[bestNi],
        matchScore: bestScore,
      });
      usedOldIndices.add(oi);
      usedNewIndices.add(bestNi);
    }
  }

  const removedFromOld = oldClauses.filter((_, i) => !usedOldIndices.has(i));
  const addedInNew = newClauses.filter((_, i) => !usedNewIndices.has(i));

  return { matched, removedFromOld, addedInNew };
}

function normalizeHeading(h?: string): string {
  return (h || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Simple word-overlap similarity (Jaccard-like) for clause matching.
 */
function textSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  const wordsB = new Set(b.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  if (wordsA.size === 0 && wordsB.size === 0) return 1;
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let intersection = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) intersection++;
  }
  return intersection / Math.max(wordsA.size, wordsB.size);
}

// ---------------------------------------------------------------------------
// 4. Change Detection & Explanation
// ---------------------------------------------------------------------------

function detectChange(oldText: string, newText: string): ClauseChangeStatus {
  if (normalizeForComparison(oldText) === normalizeForComparison(newText)) {
    return 'unchanged';
  }
  return 'modified';
}

function normalizeForComparison(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

function generateChangeSummary(
  oldClause: DocumentClause,
  newClause: DocumentClause
): string {
  // Extract specific value changes
  const oldNumbers = extractNumbers(oldClause.text);
  const newNumbers = extractNumbers(newClause.text);
  const oldDays = extractDaysPeriod(oldClause.text);
  const newDays = extractDaysPeriod(newClause.text);

  const changes: string[] = [];

  if (oldNumbers.length > 0 && newNumbers.length > 0 && oldNumbers[0] !== newNumbers[0]) {
    changes.push(`Amount changed from ${formatNumber(oldNumbers[0])} to ${formatNumber(newNumbers[0])}.`);
  }
  if (oldDays && newDays && oldDays !== newDays) {
    changes.push(`Period changed from ${oldDays} to ${newDays}.`);
  }

  if (changes.length === 0) {
    changes.push(`The wording of the ${oldClause.heading || oldClause.category} clause has been modified.`);
  }

  return changes.join(' ');
}

function generatePlainLanguage(
  status: ClauseChangeStatus,
  oldClause?: DocumentClause,
  newClause?: DocumentClause
): string {
  if (status === 'added' && newClause) {
    return `A new "${newClause.heading || newClause.category}" clause has been added in the newer document that was not present in the original.`;
  }
  if (status === 'removed' && oldClause) {
    return `The "${oldClause.heading || oldClause.category}" clause from the original document has been removed in the newer version.`;
  }
  if (status === 'unchanged') {
    return 'This clause remains the same in both documents.';
  }
  // Modified
  if (oldClause && newClause) {
    return generateChangeSummary(oldClause, newClause);
  }
  return 'This clause has been modified between the two document versions.';
}

function generateWhyItMayMatter(
  status: ClauseChangeStatus,
  category: ClauseCategory,
  oldClause?: DocumentClause,
  newClause?: DocumentClause
): string | undefined {
  if (status === 'unchanged') return undefined;

  const mattersMap: Partial<Record<ClauseCategory, string>> = {
    security_deposit: 'Changes to the security deposit may affect the financial obligation at signing or the refund amount at termination.',
    notice: 'A change in the notice period affects when the agreement can be terminated without breaching the contractual requirement.',
    termination: 'Modified termination terms could change the conditions under which either party can end the agreement.',
    rent: 'A change in rent directly affects the monthly financial obligation under the agreement.',
    penalties: 'Modified penalty clauses may change the financial consequences of a breach.',
    maintenance: 'Shifting maintenance responsibility affects which party bears the cost of property upkeep.',
    restrictions: 'New or modified restrictions change what activities are permitted under the agreement.',
    jurisdiction: 'A jurisdiction change affects where legal disputes would be heard, which can significantly impact convenience and costs.',
    liability: 'Changes to liability clauses affect the extent of financial or legal exposure.',
    compensation: 'Compensation changes directly affect the financial terms of the relationship.',
    non_compete: 'Non-compete modifications could restrict future employment or business opportunities.',
    confidentiality: 'Modified confidentiality obligations may change data handling requirements.',
  };

  if (status === 'added' && newClause) {
    return `A new ${category.replace(/_/g, ' ')} clause has been introduced. Review carefully whether this clause was discussed and agreed upon.`;
  }
  if (status === 'removed' && oldClause) {
    return `The removal of the ${category.replace(/_/g, ' ')} clause may reduce protections that existed in the original agreement.`;
  }

  return mattersMap[category] || `The change to the ${category.replace(/_/g, ' ')} clause may affect the rights or obligations under this agreement.`;
}

function extractNumbers(text: string): number[] {
  const matches = text.match(/₹?\s*[\d,]+(?:\.\d{1,2})?/g) || [];
  return matches
    .map(m => parseFloat(m.replace(/[₹,\s]/g, '')))
    .filter(n => !isNaN(n) && n > 0);
}

function extractDaysPeriod(text: string): string | null {
  const match = text.match(/(\d+)\s*(?:days?|months?|weeks?|years?)/i);
  return match ? match[0] : null;
}

function formatNumber(n: number): string {
  if (n >= 1000) return `₹${n.toLocaleString('en-IN')}`;
  return `${n}`;
}

// ---------------------------------------------------------------------------
// 5. Legal Context Lookup (lightweight, from existing statute data)
// ---------------------------------------------------------------------------

function lookupLegalContext(category: ClauseCategory): ClauseComparison['legalContext'] | undefined {
  const contextMap: Partial<Record<ClauseCategory, ClauseComparison['legalContext']>> = {
    security_deposit: {
      sourceId: 'tpa-108m',
      actName: 'Transfer of Property Act 1882',
      section: '§108(m)',
      bindingNature: 'statutory',
    },
    penalties: {
      sourceId: 'ica-74',
      actName: 'Indian Contract Act 1872',
      section: '§74',
      bindingNature: 'statutory',
    },
    notice: {
      sourceId: 'ica-37',
      actName: 'Indian Contract Act 1872',
      section: '§37',
      bindingNature: 'contractual',
    },
    termination: {
      sourceId: 'ica-62',
      actName: 'Indian Contract Act 1872',
      section: '§62',
      bindingNature: 'contractual',
    },
    jurisdiction: {
      sourceId: 'cpc-20',
      actName: 'Code of Civil Procedure 1908',
      section: '§20',
      bindingNature: 'statutory',
    },
    compensation: {
      sourceId: 'ica-73',
      actName: 'Indian Contract Act 1872',
      section: '§73',
      bindingNature: 'statutory',
    },
    non_compete: {
      sourceId: 'ica-27',
      actName: 'Indian Contract Act 1872',
      section: '§27',
      bindingNature: 'statutory',
    },
  };

  return contextMap[category];
}

// ---------------------------------------------------------------------------
// 6. Main Comparison Pipeline
// ---------------------------------------------------------------------------

export function compareDocuments(
  docAId: string,
  docATitle: string,
  docAText: string,
  docBId: string,
  docBTitle: string,
  docBText: string,
  options?: { isDemo?: boolean }
): DocumentComparison {
  // Step 1: Segment
  const oldClauses = segmentClauses(docAText, docAId, docATitle);
  const newClauses = segmentClauses(docBText, docBId, docBTitle);

  // Step 2: Match
  const { matched, removedFromOld, addedInNew } = matchClauses(oldClauses, newClauses);

  // Step 3: Build comparisons
  const comparisons: ClauseComparison[] = [];

  // Matched clauses — unchanged or modified
  for (const m of matched) {
    const status = detectChange(m.oldClause.text, m.newClause.text);
    const category = m.oldClause.category;
    const needsCounsel = status === 'modified' && ['penalties', 'liability', 'indemnity', 'non_compete'].includes(category);

    comparisons.push({
      id: `comp-${comparisons.length + 1}`,
      category,
      status,
      oldClause: m.oldClause,
      newClause: m.newClause,
      changeSummary: status === 'modified'
        ? generateChangeSummary(m.oldClause, m.newClause)
        : 'No change detected.',
      plainLanguageExplanation: generatePlainLanguage(status, m.oldClause, m.newClause),
      whyItMayMatter: generateWhyItMayMatter(status, category, m.oldClause, m.newClause),
      sourceRefs: [
        ...m.oldClause.sourceRefs,
        ...m.newClause.sourceRefs,
      ],
      legalContext: status !== 'unchanged' ? lookupLegalContext(category) : undefined,
      requiresCounselReview: needsCounsel,
    });
  }

  // Removed clauses
  for (const rc of removedFromOld) {
    comparisons.push({
      id: `comp-${comparisons.length + 1}`,
      category: rc.category,
      status: 'removed',
      oldClause: rc,
      newClause: undefined,
      changeSummary: `"${rc.heading || rc.category}" clause has been removed from the newer document.`,
      plainLanguageExplanation: generatePlainLanguage('removed', rc, undefined),
      whyItMayMatter: generateWhyItMayMatter('removed', rc.category, rc, undefined),
      sourceRefs: rc.sourceRefs,
      legalContext: lookupLegalContext(rc.category),
      requiresCounselReview: true,
    });
  }

  // Added clauses
  for (const ac of addedInNew) {
    comparisons.push({
      id: `comp-${comparisons.length + 1}`,
      category: ac.category,
      status: 'added',
      oldClause: undefined,
      newClause: ac,
      changeSummary: `New "${ac.heading || ac.category}" clause has been added.`,
      plainLanguageExplanation: generatePlainLanguage('added', undefined, ac),
      whyItMayMatter: generateWhyItMayMatter('added', ac.category, undefined, ac),
      sourceRefs: ac.sourceRefs,
      legalContext: lookupLegalContext(ac.category),
      requiresCounselReview: ['penalties', 'liability', 'non_compete', 'indemnity'].includes(ac.category),
    });
  }

  // Step 4: Summary
  const summary: DocumentComparisonSummary = {
    totalClauses: comparisons.length,
    added: comparisons.filter(c => c.status === 'added').length,
    removed: comparisons.filter(c => c.status === 'removed').length,
    modified: comparisons.filter(c => c.status === 'modified').length,
    unchanged: comparisons.filter(c => c.status === 'unchanged').length,
  };

  // Step 5: Unresolved questions
  const unresolvedQuestions: string[] = [];
  if (summary.modified > 0 || summary.added > 0) {
    unresolvedQuestions.push('Whether the newer version has been signed and agreed to by all parties.');
  }
  if (summary.removed > 0) {
    unresolvedQuestions.push('Whether the removal of clauses was mutually agreed or unilateral.');
  }
  const hasJurisdictionChange = comparisons.some(c => c.category === 'jurisdiction' && c.status === 'modified');
  if (hasJurisdictionChange) {
    unresolvedQuestions.push('Whether the jurisdiction change affects applicable state laws.');
  }

  return {
    id: `comparison-${Date.now()}`,
    documentAId: docAId,
    documentBId: docBId,
    documentATitle: docATitle,
    documentBTitle: docBTitle,
    comparedAt: new Date().toISOString(),
    summary,
    clauses: comparisons,
    unresolvedQuestions,
    isDemo: options?.isDemo ?? false,
    demoDisclaimer: options?.isDemo
      ? 'Synthetic demo documents. No real person or legal matter.'
      : undefined,
  };
}
