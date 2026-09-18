import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  MatterService,
  MemoryStorageAdapter
} from '../src/lib/repository';
import {
  validateCreateMatter,
  validateAnalyzeTrigger,
  validateDocumentFile
} from '../src/lib/api/validation';
import { ProductionDocumentParser } from '../src/lib/parsing/document-parser';

describe('Phase 4: Real Persistence, File Intake, and Production Data Layer', () => {
  const memoryAdapter = new MemoryStorageAdapter();
  const service = new MatterService(memoryAdapter);

  it('1. Matter creation persists full matter graph through MatterService', async () => {
    const created = await service.createMatter({
      title: 'Commercial Lease Security Deposit Withholding Dispute',
      category: 'tenancy_housing',
      userStory: 'I leased a retail commercial office space in Indiranagar, Bengaluru. Upon vacating with 30-day notice on July 31st 2026, the landlord refused to return ₹2,00,000 security deposit without any repair bills.',
      claimAmount: 200000,
      locationCity: 'Bengaluru',
      locationState: 'Karnataka',
      parties: [
        {
          id: 'p-1',
          name: 'Priya Sharma',
          role: 'Aggrieved (You)',
          city: 'Bengaluru',
          state: 'Karnataka'
        },
        {
          id: 'p-2',
          name: 'Indira Commercial Properties',
          role: 'Landlord',
          city: 'Bengaluru',
          state: 'Karnataka'
        }
      ]
    });

    assert.ok(created.id, 'Matter should have an ID');
    assert.strictEqual(created.title, 'Commercial Lease Security Deposit Withholding Dispute');
    assert.strictEqual(created.category, 'tenancy_housing');
    assert.ok(created.facts && created.facts.length > 0, 'Should extract facts');
    assert.ok(created.timelineEvents && created.timelineEvents.length > 0, 'Should extract timeline');
    assert.ok(created.risks && created.risks.length > 0, 'Should generate risks');
    assert.ok(created.actionPlan && created.actionPlan.length > 0, 'Should generate action plan');
    assert.ok(created.drafts && created.drafts.length > 0, 'Should generate drafts');
    assert.ok(created.evidenceGraph, 'Should compile normalized evidence graph');
    assert.ok(created.evidenceGraph.nodes.length > 0, 'Evidence graph should have nodes');

    // Retrieve from repository
    const fetched = await service.getMatterById(created.id);
    assert.ok(fetched, 'Matter should be retrievable from repository');
    assert.strictEqual(fetched.id, created.id);
    assert.strictEqual(fetched.parties.length, 2);
  });

  it('2. Document parser extracts text, clauses, and entities from attachments', async () => {
    const parser = new ProductionDocumentParser();

    // Plain text contract
    const textSample = `COMMERCIAL RENTAL AGREEMENT
Clause 9: The Lessor shall refund the entire security deposit of ₹2,00,000 to the Lessee within 15 days of vacant possession.
Handover Date: 31 July 2026.
Notice served on: 30 June 2026.`;

    const parsed = await parser.parseDocument({
      text: textSample,
      mimeType: 'text/plain',
      filename: 'agreement_deed.txt'
    });

    assert.ok(parsed.extractedText.includes('COMMERCIAL RENTAL AGREEMENT'));
    assert.ok(parsed.entities && parsed.entities.length > 0, 'Should extract financial & date entities');
    const hasRupee = parsed.entities.some(e => e.type === 'FINANCIAL_SUM' && e.name.includes('2,00,000'));
    assert.ok(hasRupee, 'Should detect ₹2,00,000 currency entity');
    assert.ok(parsed.clauses && parsed.clauses.length > 0, 'Should identify legal covenants');
  });

  it('3. Uploaded document persists record and triggers selective re-analysis (doc_uploaded)', async () => {
    // 1. Create matter
    const matter = await service.createMatter({
      title: 'E-Commerce Warranty Defect Claim',
      category: 'consumer_dispute',
      userStory: 'Purchased a high-end laptop with 2-year warranty. Motherboard failed within 4 months. Authorized service center refused repair claiming water damage without diagnostic report.',
      claimAmount: 85000,
      locationCity: 'Mumbai',
      locationState: 'Maharashtra'
    });

    const initialDocCount = matter.documents.length;

    // 2. Upload document
    const fileContent = Buffer.from(
      'TAX INVOICE & GST RECEIPT: Order #OD98124. Laptop Serial #NX8912. Total Consideration: ₹85,000 paid. Full 2-Year Comprehensive Warranty active.'
    );

    const result = await service.uploadDocumentAndReanalyze(matter.id, {
      buffer: fileContent,
      filename: 'laptop_tax_invoice.txt',
      mimeType: 'text/plain',
      title: 'Original Purchase Tax Invoice',
      type: 'invoice_bill'
    });

    assert.ok(result.document, 'Should return uploaded document record');
    assert.strictEqual(result.document.title, 'Original Purchase Tax Invoice');
    assert.strictEqual(result.document.type, 'invoice_bill');
    assert.ok(result.document.fileUrl, 'Should have file URL from storage');
    assert.ok(result.document.extractedText?.includes('TAX INVOICE'));

    // 3. Verify matter was updated and re-analyzed
    assert.strictEqual(result.matter.documents.length, initialDocCount + 1, 'Document list should expand');
    const added = result.matter.documents.find(d => d.id === result.document.id);
    assert.ok(added, 'Uploaded doc should be in matter documents');

    // 4. Verify Evidence Graph includes the newly uploaded document node
    assert.ok(result.matter.evidenceGraph, 'Evidence graph should be present');
    const docNode = result.matter.evidenceGraph.nodes.find(n => n.id === result.document.id);
    assert.ok(docNode, 'Evidence graph should contain node for uploaded document');
  });

  it('4. Repository layer functions identically with MemoryAdapter and respects userId isolation', async () => {
    const userA = 'user-uuid-111';
    const userB = 'user-uuid-222';

    const matterA = await service.createMatter({
      title: 'Tenant Dispute User A',
      category: 'tenancy_housing',
      userStory: 'Landlord refused to return deposit after notice period expired.',
      userId: userA
    });

    const matterB = await service.createMatter({
      title: 'Consumer Dispute User B',
      category: 'consumer_dispute',
      userStory: 'Defective phone sold with broken screen on delivery.',
      userId: userB
    });

    // List by userA
    const userAList = await service.listMatters({ userId: userA });
    assert.ok(userAList.some(m => m.id === matterA.id), 'User A should see Matter A');
    assert.ok(!userAList.some(m => m.id === matterB.id), 'User A should NOT see Matter B');

    // Direct ID fetch isolation
    const fetchedByOwner = await service.getMatterById(matterA.id, userA);
    assert.ok(fetchedByOwner, 'Owner can fetch own matter');

    const fetchedByStranger = await service.getMatterById(matterA.id, userB);
    assert.strictEqual(fetchedByStranger, null, 'Different user cannot fetch another user matter');
  });

  it('5. API input validation rejects invalid payloads safely with structured errors', () => {
    // Invalid category
    const invalidCategory = validateCreateMatter({
      title: 'Some Legal Issue',
      category: 'random_unsupported_category',
      userStory: 'This dispute has a valid narrative that is long enough.'
    });
    assert.strictEqual(invalidCategory.isValid, false);
    assert.ok(invalidCategory.errors.some(e => e.includes('Invalid category')));

    // Empty/short title
    const shortTitle = validateCreateMatter({
      title: 'Bad',
      category: 'tenancy_housing',
      userStory: 'Valid narrative for testing short title validation.'
    });
    assert.strictEqual(shortTitle.isValid, false);
    assert.ok(shortTitle.errors.some(e => e.includes('at least 5 characters')));

    // Short narrative
    const shortNarrative = validateCreateMatter({
      title: 'Valid Long Title',
      category: 'tenancy_housing',
      userStory: 'Too short.'
    });
    assert.strictEqual(shortNarrative.isValid, false);
    assert.ok(shortNarrative.errors.some(e => e.includes('at least 15 characters')));

    // Valid payload
    const valid = validateCreateMatter({
      title: 'Valid Tenancy Deposit Dispute',
      category: 'tenancy_housing',
      userStory: 'The landlord is withholding deposit without any justification after handover.',
      claimAmount: 50000
    });
    assert.strictEqual(valid.isValid, true);
    assert.strictEqual(valid.errors.length, 0);
  });

  it('6. Document file validation rejects oversized or unsupported files', () => {
    // Empty file
    const empty = validateDocumentFile({
      filename: 'empty.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 0
    });
    assert.strictEqual(empty.isValid, false);
    assert.ok(empty.error?.includes('empty'));

    // Oversized file (> 10MB)
    const oversized = validateDocumentFile({
      filename: 'large_video.mp4',
      mimeType: 'application/pdf',
      sizeBytes: 15 * 1024 * 1024
    });
    assert.strictEqual(oversized.isValid, false);
    assert.ok(oversized.error?.includes('10MB limit'));

    // Unsupported MIME type
    const unsupported = validateDocumentFile({
      filename: 'audio.mp3',
      mimeType: 'audio/mpeg',
      sizeBytes: 2048
    });
    assert.strictEqual(unsupported.isValid, false);
    assert.ok(unsupported.error?.includes('Unsupported file type'));

    // Valid PDF
    const validPdf = validateDocumentFile({
      filename: 'lease_agreement.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1024 * 500
    });
    assert.strictEqual(validPdf.isValid, true);
  });

  it('7. Re-analysis triggers validate correctly and audit logs persist in repository', async () => {
    // Valid trigger
    const validTrigger = validateAnalyzeTrigger({ trigger: 'doc_uploaded' });
    assert.strictEqual(validTrigger.isValid, true);
    assert.strictEqual(validTrigger.trigger, 'doc_uploaded');

    // Invalid trigger
    const invalidTrigger = validateAnalyzeTrigger({ trigger: 'magic_ai_action' });
    assert.strictEqual(invalidTrigger.isValid, false);
    assert.ok(invalidTrigger.error?.includes('Invalid trigger'));

    // Verify audit logs persist across updates
    const matter = await service.createMatter({
      title: 'Tenancy Security Deposit Claim With Audit Trail',
      category: 'tenancy_housing',
      userStory: 'Landlord refuses to refund ₹75,000 security deposit after complete flat handover.'
    });

    assert.ok(Array.isArray(matter.auditLog), 'Matter should have audit log array');

    // Update matter with simulated safety rewrite log
    const updated = await service.updateMatter(matter.id, {
      auditLog: [
        ...(matter.auditLog || []),
        {
          original: 'Landlord definitely committed criminal fraud',
          rewritten: 'Conduct appears inconsistent with statutory guidelines',
          reason: 'Softened aggressive assertion to factual non-compliance',
          timestamp: new Date().toISOString(),
          component: 'TrustSafety'
        }
      ]
    });

    assert.ok(updated, 'Update should succeed');
    const fetched = await service.getMatterById(matter.id);
    assert.ok(fetched?.auditLog && fetched.auditLog.length > 0, 'Audit log should persist in repository');
    const foundEntry = fetched.auditLog.find(a => a.original.includes('criminal fraud'));
    assert.ok(foundEntry, 'Specific audit entry should be preserved');
  });
});
