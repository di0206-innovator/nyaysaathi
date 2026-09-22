// =============================================================================
// Document Understanding Engine
// Extracts structured overview and key clauses from a single legal document
// =============================================================================

import {
  DocumentOverview,
  DocumentUnderstanding,
  ExtractedClause,
  SourceRef,
} from '@/types/document-comparison';
import { segmentClauses } from './clause-comparison-engine';

// ---------------------------------------------------------------------------
// Overview Extraction
// ---------------------------------------------------------------------------

function extractParties(text: string): Array<{ name: string; role: string }> {
  const parties: Array<{ name: string; role: string }> = [];
  
  // Common patterns in Indian legal documents
  const patterns = [
    { regex: /(?:tenant|lessee|licensee)\s*[:=]?\s*(?:mr\.?|ms\.?|mrs\.?|shri|smt\.?)?\s*([A-Z][a-zA-Z\s.]+?)(?:[,\n(]|hereinafter|$)/i, role: 'Tenant' },
    { regex: /(?:landlord|lessor|licensor|owner)\s*[:=]?\s*(?:mr\.?|ms\.?|mrs\.?|shri|smt\.?)?\s*([A-Z][a-zA-Z\s.]+?)(?:[,\n(]|hereinafter|$)/i, role: 'Landlord' },
    { regex: /(?:employer|company)\s*[:=]?\s*(?:m\/s\.?|messrs\.?)?\s*([A-Z][a-zA-Z\s.&]+?)(?:[,\n(]|hereinafter|$)/i, role: 'Employer' },
    { regex: /(?:employee|worker|executive)\s*[:=]?\s*(?:mr\.?|ms\.?|mrs\.?|shri|smt\.?)?\s*([A-Z][a-zA-Z\s.]+?)(?:[,\n(]|hereinafter|$)/i, role: 'Employee' },
    { regex: /(?:party of the first part|first party)\s*[:=]?\s*(?:mr\.?|ms\.?|mrs\.?|shri|smt\.?)?\s*([A-Z][a-zA-Z\s.]+?)(?:[,\n(]|hereinafter|$)/i, role: 'First Party' },
    { regex: /(?:party of the second part|second party)\s*[:=]?\s*(?:mr\.?|ms\.?|mrs\.?|shri|smt\.?)?\s*([A-Z][a-zA-Z\s.]+?)(?:[,\n(]|hereinafter|$)/i, role: 'Second Party' },
  ];
  
  for (const { regex, role } of patterns) {
    const match = regex.exec(text);
    if (match && match[1]) {
      const name = match[1].trim().replace(/\s+/g, ' ');
      if (name.length > 2 && name.length < 60) {
        parties.push({ name, role });
      }
    }
  }

  return parties;
}

function extractDates(text: string): Array<{ label: string; value: string }> {
  const dates: Array<{ label: string; value: string }> = [];
  
  const datePatterns = [
    /(?:dated?|executed on|signed on|effective from|commencement date)\s*[:=]?\s*(\d{1,2}[\s/-](?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[\s/-]\d{4})/i,
    /(?:dated?|executed on|signed on|effective from)\s*[:=]?\s*(\d{1,2}[\s/.-]\d{1,2}[\s/.-]\d{4})/i,
  ];
  
  for (const pattern of datePatterns) {
    const match = pattern.exec(text);
    if (match && match[1]) {
      const label = match[0].split(/[:=]/)[0]?.trim().replace(/\b\w/g, c => c.toUpperCase()) || 'Date';
      dates.push({ label, value: match[1].trim() });
    }
  }

  return dates;
}

function extractMonetaryObligations(
  text: string,
  documentId: string,
  documentTitle: string
): Array<{ label: string; amount: string; source?: SourceRef }> {
  const obligations: Array<{ label: string; amount: string; source?: SourceRef }> = [];
  
  const patterns = [
    { regex: /(?:rent|monthly rent|lease amount)\s*(?:of|is|shall be|:)?\s*(?:Rs\.?|₹|INR)\s*([\d,]+)/i, label: 'Monthly Rent' },
    { regex: /(?:security deposit|caution money|earnest money)\s*(?:of|is|shall be|:)?\s*(?:Rs\.?|₹|INR)\s*([\d,]+)/i, label: 'Security Deposit' },
    { regex: /(?:maintenance charge|maintenance fee)\s*(?:of|is|shall be|:)?\s*(?:Rs\.?|₹|INR)\s*([\d,]+)/i, label: 'Maintenance' },
    { regex: /(?:salary|compensation|ctc|annual package)\s*(?:of|is|shall be|:)?\s*(?:Rs\.?|₹|INR)\s*([\d,]+)/i, label: 'Compensation' },
    { regex: /(?:penalty|fine|late fee)\s*(?:of|is|shall be|:)?\s*(?:Rs\.?|₹|INR)\s*([\d,]+)/i, label: 'Penalty' },
  ];
  
  for (const { regex, label } of patterns) {
    const match = regex.exec(text);
    if (match && match[1]) {
      obligations.push({
        label,
        amount: `₹${match[1]}`,
        source: { documentId, documentTitle, snippet: match[0].slice(0, 80) },
      });
    }
  }

  return obligations;
}

function extractTerm(text: string): string | undefined {
  const match = text.match(/(?:term|period|tenure|duration)\s*(?:of|is|shall be|:)?\s*(\d+)\s*(months?|years?|days?)/i);
  return match ? `${match[1]} ${match[2]}` : undefined;
}

function extractNoticePeriod(text: string): string | undefined {
  const match = text.match(/(?:notice period|prior notice|advance notice|written notice)\s*(?:of|is|shall be|:)?\s*(\d+)\s*(days?|months?|weeks?)/i);
  return match ? `${match[1]} ${match[2]}` : undefined;
}

function extractJurisdiction(text: string): string | undefined {
  const match = text.match(/(?:jurisdiction|courts?\s+(?:of|in|at))\s+([A-Z][a-zA-Z\s,]+?)(?:\.|,|\n|shall)/i);
  return match ? match[1].trim() : undefined;
}

function extractDocumentType(text: string): string | undefined {
  const lower = text.toLowerCase().slice(0, 500);
  if (/rental agreement|lease agreement|tenancy agreement|leave and license/i.test(lower)) return 'Rental Agreement';
  if (/employment contract|employment agreement|offer letter|appointment letter/i.test(lower)) return 'Employment Contract';
  if (/service agreement|service contract|master service/i.test(lower)) return 'Service Agreement';
  if (/non.?disclosure|nda|confidentiality agreement/i.test(lower)) return 'Non-Disclosure Agreement';
  if (/sale deed|conveyance deed|sale agreement/i.test(lower)) return 'Sale Agreement';
  if (/partnership deed|partnership agreement/i.test(lower)) return 'Partnership Agreement';
  return undefined;
}

// ---------------------------------------------------------------------------
// Main Understanding Pipeline
// ---------------------------------------------------------------------------

export function understandDocument(
  documentId: string,
  documentTitle: string,
  documentText: string,
  options?: { isDemo?: boolean }
): DocumentUnderstanding {
  const text = documentText || '';
  const trimmed = text.trim();

  if (trimmed.length === 0) {
    return {
      id: `understanding-${Date.now()}`,
      documentId,
      documentTitle,
      analyzedAt: new Date().toISOString(),
      overview: {
        documentTitle,
        parties: [],
        dates: [],
        monetaryObligations: [],
        importantObligations: [],
      },
      keyClauses: [],
      extractionConfidence: 0,
      extractionStatus: 'needs_review',
      warnings: ['No text content available for analysis. Please upload a document with extractable text.'],
      isDemo: options?.isDemo ?? false,
    };
  }

  // Extract overview
  const overview: DocumentOverview = {
    documentTitle,
    documentType: extractDocumentType(text),
    parties: extractParties(text),
    dates: extractDates(text),
    term: extractTerm(text),
    monetaryObligations: extractMonetaryObligations(text, documentId, documentTitle),
    noticePeriod: extractNoticePeriod(text),
    jurisdiction: extractJurisdiction(text),
    importantObligations: [],
  };

  // Extract and classify clauses
  const documentClauses = segmentClauses(text, documentId, documentTitle);
  
  const keyClauses: ExtractedClause[] = documentClauses.map((dc, idx) => ({
    id: `clause-${idx + 1}`,
    heading: dc.heading || `Clause ${idx + 1}`,
    text: dc.text,
    category: dc.category,
    pageNumber: dc.pageNumber,
    clauseNumber: dc.clauseNumber,
    sourceRef: {
      documentId,
      documentTitle,
      pageNumber: dc.pageNumber,
      clauseNumber: dc.clauseNumber,
      snippet: dc.text.slice(0, 120),
    },
  }));

  // Determine extraction confidence
  const hasParties = overview.parties.length > 0;
  const hasDates = overview.dates.length > 0;
  const hasClauses = keyClauses.length > 0;
  const hasMonetary = overview.monetaryObligations.length > 0;
  
  let confidence = 0.5;
  if (hasParties) confidence += 0.15;
  if (hasDates) confidence += 0.1;
  if (hasClauses) confidence += 0.15;
  if (hasMonetary) confidence += 0.1;
  confidence = Math.min(confidence, 0.98);

  const warnings: string[] = [];
  if (!hasParties) warnings.push('Could not automatically identify parties. Manual review recommended.');
  if (!hasDates) warnings.push('No dates were automatically extracted.');

  return {
    id: `understanding-${Date.now()}`,
    documentId,
    documentTitle,
    analyzedAt: new Date().toISOString(),
    overview,
    keyClauses,
    extractionConfidence: confidence,
    extractionStatus: confidence >= 0.7 ? 'complete' : confidence >= 0.5 ? 'partial' : 'needs_review',
    warnings,
    isDemo: options?.isDemo ?? false,
    demoDisclaimer: options?.isDemo
      ? 'Synthetic demo document. No real person or legal matter.'
      : undefined,
  };
}
