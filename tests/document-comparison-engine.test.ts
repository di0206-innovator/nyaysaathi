import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  segmentClauses,
  classifyClause,
  compareDocuments,
  levenshteinDistance,
  normalizedLevenshteinSimilarity,
} from '../src/lib/legal/clause-comparison-engine';
import {
  understandDocument
} from '../src/lib/legal/document-understanding-engine';
import {
  DEMO_DOCUMENT_SETS,
} from '../src/lib/demo/demo-documents';

describe('GenAI Legal Document Understanding & Clause Comparison Engine', () => {
  describe('Clause Segmentation & Classification', () => {
    it('segments numbered clauses accurately from raw legal text', () => {
      const sampleText = `
        1. Rent and Maintenance
        The Tenant shall pay monthly rent of INR 35,000 on or before the 5th of each calendar month.

        2. Security Deposit
        The Tenant has deposited an interest-free refundable security deposit of INR 1,00,000.

        3. Termination and Notice Period
        Either party may terminate this agreement by providing 30 days written notice.
      `;

      const clauses = segmentClauses(sampleText, 'doc-1', 'Test Agreement');
      assert.equal(clauses.length, 3);
      assert.equal(clauses[0].heading, 'Rent and Maintenance');
      assert.equal(clauses[0].category, 'rent');
      assert.equal(clauses[1].heading, 'Security Deposit');
      assert.equal(clauses[1].category, 'security_deposit');
      assert.equal(clauses[2].heading, 'Termination and Notice Period');
      assert.equal(clauses[2].category, 'termination');
    });

    it('classifies various clause types correctly', () => {
      assert.equal(
        classifyClause('Arbitration and Dispute Resolution', 'All disputes shall be subject to arbitration in Bengaluru.'),
        'dispute_resolution'
      );
      assert.equal(
        classifyClause('Indemnification', 'The Lessee shall indemnify and hold harmless the Lessor against all third party claims.'),
        'indemnity'
      );
      assert.equal(
        classifyClause('Limitation of Liability', 'In no event shall either party be liable for consequential damages or lost profits.'),
        'liability'
      );
      assert.equal(
        classifyClause('Non-Disclosure and Confidentiality', 'Receiving party shall not disclose proprietary technical data for 3 years.'),
        'confidentiality'
      );
      assert.equal(
        classifyClause('Intellectual Property', 'All inventions, copyrights, and patents created during employment belong to the Company.'),
        'intellectual_property'
      );
      assert.equal(
        classifyClause('Governing Law & Jurisdiction', 'This Agreement is subject to the exclusive jurisdiction of the Courts at Bengaluru.'),
        'jurisdiction'
      );
    });

    it('handles empty or whitespace-only documents gracefully', () => {
      const emptyClauses = segmentClauses('', 'empty-doc', 'Empty');
      assert.equal(emptyClauses.length, 0);

      const whitespaceClauses = segmentClauses('   \n\n\t  \n  ', 'ws-doc', 'Whitespace');
      assert.equal(whitespaceClauses.length, 0);
    });
  });

  describe('Document Comparison & Semantic Clause Diffing', () => {
    it('detects identical documents with zero risk delta', () => {
      const text = `
        1. Rent: Tenant shall pay INR 25,000 monthly.
        2. Notice: Either party gives 30 days notice to vacate.
      `;

      const result = compareDocuments(
        'doc-a', 'Original', text,
        'doc-b', 'Identical Copy', text
      );
      assert.equal(result.clauses.length, 2);
      assert.equal(result.summary.unchanged, 2);
      assert.equal(result.summary.modified, 0);
      assert.equal(result.summary.added, 0);
      assert.equal(result.summary.removed, 0);
    });

    it('detects modified clauses across revisions', () => {
      const textA = `
        1. Security Deposit
        The deposit of INR 50,000 shall be refunded in full within 7 business days of vacating.
      `;
      const textB = `
        1. Security Deposit
        The deposit of INR 50,000 shall be refunded within 90 days, subject to mandatory 30% deduction for painting and forfeiture of deposit if vacated prior to 24 months.
      `;

      const result = compareDocuments(
        'doc-a', 'Standard Lease', textA,
        'doc-b', 'One-Sided Lease', textB
      );
      assert.equal(result.clauses.length, 1);
      assert.equal(result.clauses[0].status, 'modified');
      assert.ok(result.clauses[0].changeSummary.length > 0);
    });

    it('detects added and removed clauses across revisions', () => {
      const textA = `
        1. Rent
        Monthly rent is INR 20,000.
        2. Maintenance
        Tenant is responsible for internal upkeep.
      `;
      const textB = `
        1. Rent
        Monthly rent is INR 20,000.
        2. Governing Law
        Exclusive jurisdiction of courts at New Delhi.
      `;

      const result = compareDocuments(
        'doc-a', 'Version 1', textA,
        'doc-b', 'Version 2', textB
      );
      const added = result.clauses.filter(c => c.status === 'added');
      const removed = result.clauses.filter(c => c.status === 'removed');
      const unchanged = result.clauses.filter(c => c.status === 'unchanged');

      assert.equal(unchanged.length, 1);
      assert.equal(added.length, 1);
      assert.equal(removed.length, 1);
    });

    it('processes the built-in Rental Agreement demo pair correctly', () => {
      const demo = DEMO_DOCUMENT_SETS[0];
      const result = compareDocuments(
        demo.documentA.id, demo.documentA.title, demo.documentA.text,
        demo.documentB.id, demo.documentB.title, demo.documentB.text
      );

      assert.ok(result.clauses.length >= 6);
      assert.ok(result.summary.modified >= 2);
    });

    it('processes the built-in Employment Contract demo pair correctly', () => {
      const demo = DEMO_DOCUMENT_SETS[1];
      const result = compareDocuments(
        demo.documentA.id, demo.documentA.title, demo.documentA.text,
        demo.documentB.id, demo.documentB.title, demo.documentB.text
      );

      assert.ok(result.clauses.length >= 5);
      assert.ok(result.summary.modified >= 2);
    });

    it('identifies semantic equivalence for notice durations (30 days vs 1 month)', () => {
      const textA = '3. Notice: Either party shall provide notice no later than thirty days prior to vacating.';
      const textB = '3. Notice: Either party must give at least one month\'s prior written notice prior to vacating.';

      const result = compareDocuments('doc-a', 'Doc A', textA, 'doc-b', 'Doc B', textB);
      assert.equal(result.clauses.length, 1);
      assert.equal(result.clauses[0].status, 'modified');
      assert.ok(result.clauses[0].semanticAnalysis);
      assert.equal(result.clauses[0].semanticAnalysis?.matchType, 'semantic_equivalent');
      assert.ok(result.clauses[0].semanticAnalysis?.explanation?.includes('30-day'));
    });

    it('identifies semantic conflict when maintenance obligation shifts', () => {
      const textA = '4. Upkeep: Tenant is responsible for routine upkeep and repairs.';
      const textB = '4. Upkeep: Landlord shall bear all ordinary maintenance costs and upkeep.';

      const result = compareDocuments('doc-a', 'Doc A', textA, 'doc-b', 'Doc B', textB);
      assert.equal(result.clauses.length, 1);
      assert.equal(result.clauses[0].status, 'modified');
      assert.ok(result.clauses[0].semanticAnalysis);
      assert.equal(result.clauses[0].semanticAnalysis?.matchType, 'conflict');
      assert.ok(result.clauses[0].semanticAnalysis?.explanation?.includes('responsibility shifted'));
    });

    it('accurately computes normalized Levenshtein distance for typographical edits', () => {
      assert.strictEqual(levenshteinDistance('kitten', 'sitting'), 3);
      assert.strictEqual(levenshteinDistance('deposit', 'deposit'), 0);
      assert.ok(normalizedLevenshteinSimilarity('termination', 'termination') === 1.0);
      assert.ok(normalizedLevenshteinSimilarity('termination', 'termintion') > 0.85);
    });

    it('identifies identical clauses and marks them unchanged without modification overhead', () => {
      const textA = '1. Jurisdiction: The courts of New Delhi shall have exclusive jurisdiction.';
      const textB = '1. Jurisdiction: The courts of New Delhi shall have exclusive jurisdiction.';

      const result = compareDocuments('doc-a', 'Doc A', textA, 'doc-b', 'Doc B', textB);
      assert.equal(result.clauses.length, 1);
      assert.equal(result.clauses[0].status, 'unchanged');
      assert.equal(result.summary.unchanged, 1);
      assert.equal(result.summary.modified, 0);
    });
  });

  describe('Document Understanding & Overview Extraction', () => {
    it('extracts structured metadata from legal agreement text', () => {
      const demo = DEMO_DOCUMENT_SETS[0];
      const understanding = understandDocument(
        demo.documentA.id, demo.documentA.title, demo.documentA.text
      );
      
      assert.ok(understanding.overview.parties.length >= 2, 'Should identify landlord and tenant parties');
      assert.ok(understanding.overview.monetaryObligations.length >= 2, 'Should identify rent and deposit amounts');
      assert.ok(understanding.overview.jurisdiction, 'Should extract jurisdiction');
      assert.ok(understanding.keyClauses.length >= 5, 'Should break down key clauses with provenance');
    });

    it('handles unstructured text safely without throwing', () => {
      const minimalText = 'This is a random note with no legal clauses.';
      const understanding = understandDocument(
        'random-note', 'Random Note', minimalText
      );

      assert.ok(understanding);
      assert.ok(Array.isArray(understanding.overview.parties));
      assert.ok(Array.isArray(understanding.keyClauses));
    });
  });
});
