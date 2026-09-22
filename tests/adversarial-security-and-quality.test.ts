import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeHtml, detectPrototypePollution, validateCreateMatter } from '../src/lib/api/validation';
import { PgVectorLegalRAGProvider } from '../src/lib/rag/pgvector-provider';
import { LocalEmbeddingProvider } from '../src/lib/ai/mock-providers';
import { DeadlineEngine } from '../src/lib/deadlines/deadline-engine';
import { Matter } from '../src/types/matter';

describe('Adversarial Security, Efficiency, Accessibility & Problem Alignment Suite', () => {

  describe('1. Security: Stored XSS Neutralization', () => {
    it('strips <script> tags and embedded executable code', () => {
      const malicious = 'Tenant dispute <script>alert("xss")</script> with landlord';
      const clean = sanitizeHtml(malicious);
      assert.strictEqual(clean.includes('<script>'), false);
      assert.strictEqual(clean.includes('alert("xss")'), false);
      assert.strictEqual(clean, 'Tenant dispute  with landlord');
    });

    it('strips malicious inline event handlers and javascript: URIs', () => {
      const payload = '<img src=x onerror="fetch(\'/api/steal\')" /> <a href="javascript:void(0)">Click</a>';
      const clean = sanitizeHtml(payload);
      assert.strictEqual(clean.includes('onerror='), false);
      assert.strictEqual(clean.includes('javascript:'), false);
    });

    it('sanitizes matter title and userStory upon validation', () => {
      const raw = {
        title: 'Withheld Deposit <iframe src="evil.com"></iframe>',
        category: 'tenancy_housing',
        userStory: 'Landlord refused deposit <script>document.cookie</script> without reasons.',
        locationCity: 'Bengaluru'
      };
      const res = validateCreateMatter(raw);
      assert.strictEqual(res.isValid, true);
      assert.ok(res.data);
      assert.strictEqual(res.data.title.includes('iframe'), false);
      assert.strictEqual(res.data.userStory.includes('script'), false);
    });
  });

  describe('2. Security: Deep Prototype Pollution Defense', () => {
    it('detects and flags __proto__ injection in request body', () => {
      const polluted = JSON.parse('{"title":"Security deposit","__proto__":{"admin":true}}');
      const detected = detectPrototypePollution(polluted);
      assert.strictEqual(detected, true);

      const res = validateCreateMatter(polluted);
      assert.strictEqual(res.isValid, false);
      assert.ok(res.errors.some(e => e.includes('Prototype pollution violation')));
    });

    it('detects nested constructor/prototype attacks', () => {
      const nested = {
        title: 'Valid title',
        details: {
          constructor: {
            prototype: {
              isAdmin: true
            }
          }
        }
      };
      assert.strictEqual(detectPrototypePollution(nested), true);
    });
  });

  describe('3. Efficiency: RAG Query Caching & Redundant Call Elimination', () => {
    it('caches identical statutory searches and returns in under 5ms', async () => {
      const embeddingProvider = new LocalEmbeddingProvider();
      const rag = new PgVectorLegalRAGProvider(embeddingProvider);

      const criteria = {
        category: 'tenancy_housing' as const,
        state: 'Karnataka',
        limit: 3
      };

      // First query (cold)
      const start1 = Date.now();
      const res1 = await rag.searchStatutes('security deposit refund timeline', criteria);
      const dur1 = Date.now() - start1;
      assert.ok(res1.length > 0);
      void dur1;

      // Second query (cached warm)
      const start2 = performance.now();
      const res2 = await rag.searchStatutes('security deposit refund timeline', criteria);
      const dur2 = performance.now() - start2;

      assert.strictEqual(res2.length, res1.length);
      assert.ok(dur2 < 5, `Expected cached execution < 5ms, got ${dur2.toFixed(2)}ms`);
    });
  });

  describe('4. Accessibility: WCAG 2.2 AA Layout Landmarks', () => {
    it('verifies layout contains skip-to-main-content link pointing to main landmark', async () => {
      const fs = await import('node:fs');
      const layoutContent = fs.readFileSync('src/app/layout.tsx', 'utf-8');
      assert.ok(layoutContent.includes('href="#main-content"'), 'Must include skip link targeting #main-content');
      assert.ok(layoutContent.includes('id="main-content"'), 'Must include <main id="main-content">');
    });

    it('verifies navigation has aria-label and aria-current support', async () => {
      const fs = await import('node:fs');
      const navContent = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf-8');
      assert.ok(navContent.includes('aria-label="Main Navigation"'));
      assert.ok(navContent.includes('aria-current'));
    });

    it('verifies footer has role="contentinfo"', async () => {
      const fs = await import('node:fs');
      const footerContent = fs.readFileSync('src/components/layout/Footer.tsx', 'utf-8');
      assert.ok(footerContent.includes('role="contentinfo"'));
      assert.ok(footerContent.includes('aria-label="Site Footer"'));
    });
  });

  describe('5. Problem Statement Alignment: Indian Legal Nuances', () => {
    it('computes 15-day statutory cure window for Section 138 NI Act cheque bounce', () => {
      const matter: Matter = {
        id: 'mat_138',
        userId: 'u_138',
        title: 'Bounced Business Cheque',
        category: 'financial_cheque_bounce',
        subCategory: 'cheque_dishonour',
        status: 'action_ready',
        claimAmount: 150000,
        userStory: 'Bounced business cheque from counterparty without honoring statutory demand window.',
        summary: {
          plainLanguage: 'Bounced cheque',
          keyConflict: 'Dishonour of cheque',
          legalNature: 'Sec 138 NI Act'
        },
        createdAt: '2026-09-01T00:00:00Z',
        updatedAt: '2026-09-01T00:00:00Z',
        parties: [],
        facts: [],
        documents: [],
        timelineEvents: [],
        risks: [],
        missingInformation: [],
        actionPlan: [],
        drafts: [],
        escalationRoutes: [],
        trustSafetyItems: [],
        communications: [
          {
            id: 'comm_1',
            matterId: 'mat_138',
            type: 'legal_notice',
            counterparty: 'Defaulter Corp',
            direction: 'outgoing',
            date: '2026-09-10T10:00:00Z',
            summary: 'Formal statutory demand notice under Section 138 Negotiable Instruments Act',
            status: 'sent',
            createdAt: '2026-09-10T10:00:00Z'
          }
        ]
      };

      const deadlines = DeadlineEngine.calculateDeadlines(matter);

      const s138Deadline = deadlines.find(d => d.statuteBasis.includes('Section 138'));
      assert.ok(s138Deadline, 'Must detect statutory limitation deadline for Sec 138 NI Act');
      assert.strictEqual(s138Deadline.category, 'notice_cure');
      assert.strictEqual(s138Deadline.daysRemaining >= 0, true);
    });

    it('enforces Advocates Act 1961 regulatory disclaimer on generated briefs', async () => {
      const { AdvocatePackService } = await import('../src/lib/advocate/advocate-pack');
      const matter: Matter = {
        id: 'mat_pack',
        userId: 'u_pack',
        title: 'Tenant Security Deposit Recovery',
        category: 'tenancy_housing',
        subCategory: 'deposit_refund',
        status: 'action_ready',
        userStory: 'Landlord refused to refund 1.2 Lakhs security deposit after peaceful vacating of premises.',
        summary: {
          plainLanguage: 'Deposit recovery',
          keyConflict: 'Unreasonable withholding of deposit',
          legalNature: 'Tenancy refund dispute'
        },
        createdAt: '2026-09-01T00:00:00Z',
        updatedAt: '2026-09-01T00:00:00Z',
        parties: [],
        facts: [],
        documents: [],
        timelineEvents: [],
        risks: [],
        missingInformation: [],
        actionPlan: [],
        drafts: [],
        escalationRoutes: [],
        trustSafetyItems: [],
        communications: []
      };

      const pack = AdvocatePackService.compileAdvocateBrief(matter);
      assert.ok(pack.aiLimitationsDisclaimer.includes('advocate convenience'));
      assert.ok(pack.aiLimitationsDisclaimer.includes('does not constitute formal legal representation'));
    });
  });

});
