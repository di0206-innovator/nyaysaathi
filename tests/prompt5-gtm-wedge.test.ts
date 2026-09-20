import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { POST as feedbackPost, GET as feedbackGet } from '../src/app/api/feedback/route';
import { NextRequest } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';

describe('PROMPT 5: GTM, Product Wedge, Real-World Validation & Feedback Capture', () => {
  it('validates primary launch wedge (Tenant-Landlord) prominence in landing page and routing', () => {
    const pagePath = path.resolve(process.cwd(), 'src/app/page.tsx');
    assert.ok(fs.existsSync(pagePath));
    const content = fs.readFileSync(pagePath, 'utf-8');

    // Asserts clear launch wedge positioning
    assert.ok(content.includes('Primary Launch Wedge'), 'Landing page must feature Primary Launch Wedge');
    assert.ok(content.includes('tenancy_housing'), 'Landing page must direct to tenancy_housing category');
    assert.ok(content.includes('Model Tenancy Act'), 'Must ground tenancy disputes in statutory frameworks');
    assert.ok(content.includes('/analytics'), 'Must link to live pilot product analytics');
  });

  it('validates pilot feedback capture API rejects invalid ratings or missing fields', async () => {
    // 1. Missing rating or out-of-range rating
    const badReq1 = new NextRequest('http://localhost:3000/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '203.0.113.10'
      },
      body: JSON.stringify({ rating: 7, category: 'draft_quality', feedbackText: 'Test' })
    });
    const res1 = await feedbackPost(badReq1);
    assert.equal(res1.status, 400);

    // 2. Missing feedback text
    const badReq2 = new NextRequest('http://localhost:3000/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '203.0.113.11'
      },
      body: JSON.stringify({ rating: 4, category: 'draft_quality', feedbackText: '' })
    });
    const res2 = await feedbackPost(badReq2);
    assert.equal(res2.status, 400);
  });

  it('accepts valid pilot feedback and returns aggregated calibration metrics', async () => {
    const goodReq = new NextRequest('http://localhost:3000/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '203.0.113.12'
      },
      body: JSON.stringify({
        rating: 5,
        category: 'statute_accuracy',
        feedbackText: 'Model Tenancy Act section 13 was accurately cited for the 30-day deposit refund.',
        advocateConsulted: true
      })
    });

    const postRes = await feedbackPost(goodReq);
    assert.equal(postRes.status, 200);
    const postJson = (await postRes.json()) as { success: boolean; feedbackId: string };
    assert.equal(postJson.success, true);
    assert.ok(postJson.feedbackId);

    // Retrieve summary via GET
    const getRes = await feedbackGet();
    assert.equal(getRes.status, 200);
    const getJson = (await getRes.json()) as {
      totalSubmissions: number;
      averageRating: number;
      categoryBreakdown: Record<string, number>;
    };

    assert.ok(getJson.totalSubmissions >= 1);
    assert.ok(getJson.averageRating >= 1 && getJson.averageRating <= 5);
    assert.ok('statute_accuracy' in getJson.categoryBreakdown);
  });

  it('verifies product analytics page existence and key metric formulas', () => {
    const analyticsPath = path.resolve(process.cwd(), 'src/app/analytics/page.tsx');
    assert.ok(fs.existsSync(analyticsPath), 'Analytics dashboard page must exist');
    const content = fs.readFileSync(analyticsPath, 'utf-8');

    assert.ok(content.includes('amountRecovered'), 'Must track financial recovery in INR');
    assert.ok(content.includes('claimAmount'), 'Must track stake disputed');
    assert.ok(content.includes('Primary Launch Wedge Focus'), 'Must highlight launch wedge metrics');
    assert.ok(content.includes('totalNoticesDispatched'), 'Must track notice dispatch velocity');
  });
});
