import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  DeterministicLLMProvider,
  setLLMProvider
} from '../src/lib/ai';
import { LegalRAGService } from '../src/lib/rag/rag-service';
import { MatterQAService } from '../src/lib/qa/qa-service';
import { LanguageService } from '../src/lib/multilingual/language-service';
import { DeadlineEngine } from '../src/lib/deadlines/deadline-engine';
import { ClaimSupportChecker } from '../src/lib/reasoning/claim-support-checker';
import { Matter } from '../src/types/matter';

describe('Phase 5: Real AI/RAG Pipeline, Multilingual UX, and Advanced Legal Navigation', () => {
  let sampleMatter: Matter;

  beforeEach(() => {
    sampleMatter = {
      id: 'matter-p5-test',
      title: 'Delayed Security Deposit & Disputed Repainting Charges',
      category: 'tenancy_housing',
      subCategory: 'security_deposit_refund',
      status: 'action_ready',
      userStory:
        'I vacated my rental apartment on 31 January 2026 after serving a 30-day move out notice. The landlord acknowledged receipt of keys on WhatsApp. The agreement says ₹75,000 security deposit must be refunded within 30 days. It is now March 2026 and he refuses to refund, claiming ₹40,000 painting without any contractor invoice.',
      claimAmount: 75000,
      locationCity: 'Bengaluru',
      locationState: 'Karnataka',
      createdAt: '2026-02-01T10:00:00.000Z',
      updatedAt: '2026-02-01T10:00:00.000Z',
      parties: [
        { id: 'p1', name: 'Rohan Sharma', role: 'Aggrieved (You)', city: 'Bengaluru', state: 'Karnataka' },
        { id: 'p2', name: 'Alok Gupta', role: 'Landlord', city: 'Bengaluru', state: 'Karnataka' }
      ],
      documents: [
        {
          id: 'doc-1',
          title: 'Registered Tenancy Agreement',
          type: 'rental_agreement',
          uploadedAt: '2026-02-01',
          extractedText:
            'The Lessee has paid a refundable security deposit of ₹75,000. Clause 14: Upon vacant possession and 30-day notice, the Lessor shall refund the entire deposit within 30 days, subject to verified utility deductions.',
          status: 'verified'
        },
        {
          id: 'doc-2',
          title: 'Key Handover & Move-out WhatsApp Chat',
          type: 'whatsapp_chat',
          uploadedAt: '2026-02-02',
          extractedText: 'Keys handed over and flat inspected on 31 Jan. Landlord acknowledged handover.',
          status: 'verified'
        }
      ],
      facts: [
        {
          id: 'fact-1',
          statement: 'Security deposit of ₹75,000 was paid and acknowledged in lease agreement.',
          category: 'financial',
          verified: true,
          tier: 'fact',
          confidence: 0.98
        }
      ],
      timelineEvents: [
        {
          id: 'evt-1',
          date: '2026-01-31',
          title: 'Vacant Possession & Key Handover',
          description: 'Tenant handed over keys with written acknowledgment.',
          status: 'verified',
          groundingStatus: 'grounded'
        }
      ],
      risks: [
        {
          id: 'risk-1',
          title: 'Unilateral Damage Deductions Without Invoices',
          severity: 'high',
          description: 'Landlord withholding ₹40,000 without sharing verified repair bills.',
          mitigatingAction: 'Demand itemized GST contractor invoices within 7 days.',
          legalContext: 'Model Tenancy Act mandates invoice substantiation for deposit deductions.',
          limitationPeriodInfo: {
            statute: 'Indian Limitation Act, 1963 (Money Recovery)',
            deadlineMonths: 36
          },
          groundingStatus: 'grounded'
        }
      ],
      missingInformation: [
        {
          id: 'miss-1',
          question: 'Do you have bank account transfer statement for the ₹75,000 initial deposit?',
          whyItMatters: 'Conclusively establishes consideration on banking rail.',
          impactOnOutcome: 'critical',
          suggestedSource: 'Bank Account Passbook / NEFT UTR',
          isAnswered: false
        }
      ],
      actionPlan: [
        {
          id: 'act-1',
          title: 'Issue 15-Day Formal Demand Notice',
          phase: 'immediate_48h',
          description: 'Send registered post speed post notice demanding ₹75,000 refund with interest.',
          estimatedTurnaround: '48 Hours',
          status: 'pending',
          priority: 'must_do',
          groundingStatus: 'grounded'
        }
      ],
      drafts: [
        {
          id: 'draft-1',
          matterId: 'matter-p5-test',
          type: 'legal_notice',
          communicationTier: 'formal',
          title: 'Legal Demand Notice for Security Deposit Refund',
          recipientName: 'Alok Gupta',
          subject: 'Formal Demand for immediate refund of ₹75,000 deposit',
          content: 'You are illegally holding my money and must pay immediately or face civil and criminal courts.',
          disclaimer: 'Draft notice for review.',
          createdAt: '2026-02-01',
          status: 'draft',
          groundingStatus: 'grounded'
        }
      ],
      lawyerBrief: {
        id: 'brief-1',
        matterId: 'matter-p5-test',
        executiveSummary: 'Tenancy dispute over non-refund of ₹75,000 deposit post 30-day notice.',
        keyChronology: [{ date: '2026-01-31', event: 'Key Handover', docRefId: 'doc-2' }],
        legalIssuesIdentified: ['Unlawful retention of security deposit', 'Absence of contractor repair invoices'],
        statutoryReferences: [
          {
            statute: 'Model Tenancy Act & State Rent Acts',
            section: 'Section 10',
            applicability: 'Obligation to refund deposit within 30 days of vacant handover.'
          }
        ],
        reliefSought: ['Refund of ₹75,000', '12% interest from due date'],
        evidentiaryReadiness: {
          strongProof: ['Lease deed', 'Move-out chat transcript'],
          gapsOrMissingProof: ['NEFT bank debit slip']
        },
        generatedAt: '2026-02-01T10:00:00.000Z',
        groundingStatus: 'grounded'
      },
      escalationRoutes: [],
      trustSafetyItems: [],
      summary: {
        plainLanguage:
          'You vacated the apartment on 31 January 2026 with notice. The landlord is unlawfully withholding ₹75,000 without showing repair bills.',
        keyConflict: 'Withholding of security deposit refund without proof of damages.',
        legalNature: 'Tenancy Contract & Rent Control Dispute'
      }
    };
  });

  it('1. AI Provider layer can be mocked and returns structured envelopes', async () => {
    const mockLLM = new DeterministicLLMProvider();
    setLLMProvider(mockLLM);

    const textRes = await mockLLM.generateText('Analyze tenancy matter in English');
    assert.ok(textRes.content.length > 20);
    assert.strictEqual(textRes.confidenceScore, 0.94);

    const structuredRes = await mockLLM.generateStructured(
      'Extract parties',
      {
        name: 'PartiesSchema',
        description: 'Schema of extracted parties',
        example: { parties: ['Landlord', 'Tenant'] }
      }
    );
    assert.deepStrictEqual(structuredRes.content, { parties: ['Landlord', 'Tenant'] });
  });

  it('2. Legal RAG service retrieves sources and generates accurate citations', async () => {
    const ragService = new LegalRAGService();
    const results = await ragService.retrieveForMatter(sampleMatter, 3);

    assert.ok(results.length > 0, 'Should retrieve at least one statutory provision');
    const topMatch = results[0];
    assert.strictEqual(topMatch.chunk.category, 'tenancy_housing');
    assert.ok(topMatch.relevanceScore >= 0.7, 'Top match should have high relevance score');
    assert.ok(topMatch.matchReasons.length > 0);

    // Citations helper
    const citations = ragService.toSourceReferences(results);
    assert.ok(citations.length > 0);
    assert.strictEqual(citations[0].type, 'statute');
    assert.ok(citations[0].label.includes('Model Tenancy Act') || citations[0].label.includes('Section'));

    // Citation block formatter
    const block = ragService.formatCitationBlock([topMatch.chunk]);
    assert.ok(block.includes(topMatch.chunk.statute));
    assert.ok(block.includes(topMatch.chunk.forumOrAuthority));
  });

  it('3. RAG evaluates retrieval tier and downgrades when retrieval is weak', async () => {
    const ragService = new LegalRAGService();

    // Strong results
    const strongResults = await ragService.retrieveForMatter(sampleMatter, 1);
    const strongTier = ragService.evaluateRetrievalTier(strongResults);
    assert.strictEqual(strongTier.tier, 'explanation');

    // Empty results -> counsel_required
    const emptyTier = ragService.evaluateRetrievalTier([]);
    assert.strictEqual(emptyTier.tier, 'counsel_required');
    assert.ok(emptyTier.recommendation.includes('Advocate'));
  });

  it('4. Follow-up Q&A answers matter-grounded queries with exact citations', async () => {
    const qaService = new MatterQAService();

    // Query directly grounded in tenancy deposit and WhatsApp evidence
    const res = await qaService.answerQuestion(
      sampleMatter,
      'Does the WhatsApp chat prove that I gave the keys to the landlord?'
    );

    assert.strictEqual(res.isFullyGrounded, true);
    assert.strictEqual(res.tier, 'explanation');
    assert.ok(res.citations.length > 0, 'Must cite evidence items');
    assert.ok(res.citations.some(c => c.label.includes('WhatsApp') || c.type === 'doc'));
    assert.ok(res.answer.length > 30);
  });

  it('5. Follow-up Q&A never invents facts: ungrounded questions become missing information questions', async () => {
    const qaService = new MatterQAService();

    // Query asking about completely unrelated or unrecorded facts
    const res = await qaService.answerQuestion(
      sampleMatter,
      'Did the landlord secretly sell the furniture to a third party on Diwali night?'
    );

    assert.strictEqual(res.isFullyGrounded, false, 'Ungrounded query must not be marked as fully grounded');
    assert.strictEqual(res.tier, 'unsupported');
    assert.ok(res.missingInfoPrompt, 'Must supply missing information prompt');
    assert.ok(res.missingInfoPrompt?.includes('not currently documented'));
    assert.ok(res.suggestedQuestions && res.suggestedQuestions.length > 0, 'Must suggest clarifying questions');
    assert.ok(res.answer.includes('cannot safely answer this without factual grounding'));
  });

  it('6. Indic translations (Hindi, Hinglish, Marathi) preserve statutory citations & legal meaning', async () => {
    const langService = new LanguageService();

    // Hindi translation
    const hiResult = await langService.localizeMatter(sampleMatter, 'hi');
    assert.strictEqual(hiResult.language, 'hi');
    assert.ok(hiResult.summary.plainLanguage.includes('[हिंदी अनुवाद'), 'Should include Hindi executive banner');
    assert.ok(hiResult.glossary['Security Deposit'], 'Should contain Security Deposit in Hindi glossary');

    // Hinglish translation
    const hinglishResult = await langService.localizeMatter(sampleMatter, 'hinglish');
    assert.strictEqual(hinglishResult.language, 'hinglish');
    assert.ok(hinglishResult.summary.plainLanguage.includes('[Hinglish Guidance'));

    // Marathi translation
    const mrResult = await langService.localizeMatter(sampleMatter, 'mr');
    assert.strictEqual(mrResult.language, 'mr');
    assert.ok(mrResult.summary.plainLanguage.includes('[मराठी भाषांतर'));
    assert.ok(mrResult.glossary['Security Deposit'], 'Should contain Security Deposit in Marathi glossary');
  });

  it('7. Deadline engine calculates limitation periods, notice windows, and urgency levels accurately', () => {
    const deadlines = DeadlineEngine.calculateDeadlines(sampleMatter);

    assert.ok(deadlines.length >= 2, 'Should compute notice window and statutory limitation');

    const noticeDeadline = deadlines.find(d => d.category === 'notice_cure');
    assert.ok(noticeDeadline, 'Should calculate notice cure window');
    assert.strictEqual(noticeDeadline.daysRemaining, 15);
    assert.strictEqual(noticeDeadline.urgency, 'warning');
    assert.ok(noticeDeadline.statuteBasis.includes('Notice Practice'));

    const limDeadline = deadlines.find(d => d.category === 'statutory_limitation');
    assert.ok(limDeadline, 'Should calculate statutory limitation deadline');
    assert.ok(limDeadline.dueDate.length === 10); // YYYY-MM-DD
    assert.ok(limDeadline.daysRemaining > 0);
  });

  it('8. Draft safety auditing neutralizes aggressive phrasing into factual legal terminology', () => {
    const aggressiveDraft = 'You are illegally withholding my deposit and must pay immediately or face criminal arrest.';
    const audited = ClaimSupportChecker.auditDraftContent(aggressiveDraft, { isLawyerReady: true });

    assert.strictEqual(audited.requiresAdvocateReview, true);
    assert.ok(audited.auditEntries.length > 0, 'Audit entries must record neutralized claims');

    // Check that aggressive terms like "illegally" and "must pay" were neutralized
    assert.ok(!audited.sanitizedContent.includes('illegally'));
    assert.ok(!audited.sanitizedContent.includes('must pay'));
    assert.ok(audited.sanitizedContent.includes('appears inconsistent with contractual terms'));
    assert.ok(audited.sanitizedContent.includes('is formally requested to remit / refund'));
  });
});
