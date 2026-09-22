import test from 'node:test';
import assert from 'node:assert/strict';
import { LegalBenchmarkEvaluator } from './legal-benchmark/evaluator';
import { LEGAL_BENCHMARK_100_CASES } from './legal-benchmark/cases';

test('Legal Benchmark: 100 Indian Legal Case Empirical Evaluation', async (t) => {
  await t.test('evaluates 100 diverse Indian legal cases across 8 core dispute categories', () => {
    assert.equal(LEGAL_BENCHMARK_100_CASES.length, 100, 'Must contain exactly 100 benchmark cases');

    const summary = LegalBenchmarkEvaluator.evaluateAll();

    console.log('\n======================================================');
    console.log('   NYAYSAATHI LEGAL AI BENCHMARK RESULTS (100 CASES)   ');
    console.log('======================================================');
    console.log(`Total Cases Evaluated:       ${summary.totalCases}`);
    console.log(`Category Classification:     ${summary.categoryAccuracyPct}%`);
    console.log(`Statute Retrieval Accuracy:  ${summary.statuteRetrievalAccuracyPct}%`);
    console.log(`Limitation Accuracy:         ${summary.limitationAccuracyPct}%`);
    console.log(`Evidence Grounding Rate:     ${summary.evidenceGroundingRatePct}%`);
    console.log(`Unsupported Claim Rate:      ${summary.unsupportedClaimRatePct}%`);
    console.log(`False Positive Rate:         ${summary.falsePositiveRatePct}%`);
    console.log('------------------------------------------------------');
    console.log('Category Breakdown:');
    for (const [cat, data] of Object.entries(summary.categoryBreakdown)) {
      console.log(`  • ${cat}: ${data.total} cases | Cat: ${data.correctCategory}/${data.total} | Stat: ${data.correctStatutes}/${data.total} | Lim: ${data.correctLimitation}/${data.total}`);
    }
    console.log('======================================================\n');

    // Assert strict benchmark standards for judge readiness
    assert.ok(summary.categoryAccuracyPct >= 95.0, `Category accuracy must be >= 95%, got ${summary.categoryAccuracyPct}%`);
    assert.ok(summary.statuteRetrievalAccuracyPct >= 95.0, `Statute retrieval must be >= 95%, got ${summary.statuteRetrievalAccuracyPct}%`);
    assert.ok(summary.limitationAccuracyPct >= 95.0, `Limitation calculation must be >= 95%, got ${summary.limitationAccuracyPct}%`);
    assert.ok(summary.evidenceGroundingRatePct >= 95.0, `Evidence grounding must be >= 95%, got ${summary.evidenceGroundingRatePct}%`);
    assert.ok(summary.unsupportedClaimRatePct <= 2.0, `Unsupported claim rate must be <= 2%, got ${summary.unsupportedClaimRatePct}%`);
    assert.ok(summary.falsePositiveRatePct <= 2.0, `False positive rate must be <= 2%, got ${summary.falsePositiveRatePct}%`);
  });
});
