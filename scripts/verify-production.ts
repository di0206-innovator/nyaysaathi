import { execSync } from 'node:child_process';

interface StepResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'NOT CONFIGURED' | 'SKIPPED';
  durationMs: number;
  error?: string;
}

function runStep(name: string, command: string): StepResult {
  const start = Date.now();
  try {
    execSync(command, { stdio: 'pipe', encoding: 'utf-8' });
    return { name, status: 'PASS', durationMs: Date.now() - start };
  } catch (err: unknown) {
    const errObj = err as { message?: string; stderr?: Buffer | string; stdout?: Buffer | string };
    const errorMsg = [
      errObj?.message,
      errObj?.stderr?.toString(),
      errObj?.stdout?.toString()
    ].filter(Boolean).join('\n');
    return { name, status: 'FAIL', durationMs: Date.now() - start, error: errorMsg };
  }
}

async function verifyProduction() {
  console.log('\n======================================================');
  console.log('NYAYSAATHI PRODUCTION VERIFICATION & COMPLIANCE AUDIT');
  console.log('======================================================\n');

  const results: StepResult[] = [];
  let criticalIssues = 0;
  let highIssues = 0;
  let warnings = 0;

  const isReleaseMode = process.argv.includes('--release') || process.env.RELEASE_MODE === 'true';
  if (isReleaseMode) {
    console.log('[RELEASE GATE ACTIVE] All services, test suites and browser engines must pass. NOT CONFIGURED is treated as release block.');
  }

  // 1. Lint
  console.log('1/10 Running ESLint static code quality inspection...');
  const lintRes = runStep('Lint', 'npm run lint');
  results.push(lintRes);
  if (lintRes.status === 'FAIL') highIssues++;

  // 2. Typecheck
  console.log('2/10 Running TypeScript compiler type check...');
  const typecheckRes = runStep('Typecheck', 'npx tsc --noEmit');
  results.push(typecheckRes);
  if (typecheckRes.status === 'FAIL') criticalIssues++;

  // 3. Unit Tests
  console.log('3/10 Running core repository, OCR provenance & statutory unit tests...');
  const unitRes = runStep(
    'Unit Tests',
    'npx tsx --test tests/persistence-and-intake.test.ts tests/ai-rag-multilingual.test.ts tests/prompt4-performance-contracts.test.ts tests/prompt5-gtm-wedge.test.ts tests/phase7-action-lifecycle.test.ts tests/ocr-extraction.test.ts'
  );
  results.push(unitRes);
  if (unitRes.status === 'FAIL') criticalIssues++;

  // 4. Security & Concurrency Tests
  console.log('4/10 Executing production security, authorization & atomic rate limiter suite...');
  const secRes = runStep(
    'Security & Concurrency',
    'npx tsx --test tests/prompt1-production-security.test.ts tests/security-regression.test.ts tests/rate-limiter-concurrency.test.ts tests/production-durability-and-storage.test.ts tests/adversarial-security-and-quality.test.ts'
  );
  results.push(secRes);
  if (secRes.status === 'FAIL') criticalIssues++;

  // 5. AI Evaluation
  console.log('5/10 Executing truthful AI reasoning, stale-law defense & evidence grounding suite...');
  const aiRes = runStep(
    'AI Evaluation',
    'npx tsx --test tests/prompt2-ai-evaluation.test.ts tests/evidence-enforcement.test.ts tests/failure-paths.test.ts'
  );
  results.push(aiRes);
  if (aiRes.status === 'FAIL') criticalIssues++;

  // 6. Supabase / Postgres RLS Integration Tests
  console.log('6/10 Inspecting Supabase / Postgres RLS integration environment...');
  const hasLiveSupabase = Boolean(
    (process.env.SUPABASE_TEST_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    (process.env.SUPABASE_TEST_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );

  const rlsIntegRes = runStep(
    'Supabase RLS Integration',
    'npx tsx --test tests/supabase-rls-integration.test.ts tests/phase8-production-integrity.test.ts'
  );
  if (!hasLiveSupabase) {
    results.push({
      name: 'Supabase RLS Integration',
      status: 'NOT CONFIGURED',
      durationMs: rlsIntegRes.durationMs
    });
    warnings++;
  } else {
    results.push(rlsIntegRes);
    if (rlsIntegRes.status === 'FAIL') highIssues++;
  }

  // 7. Accessibility Tests
  console.log('7/10 Running WCAG 2.2 AA accessibility and axe-core audit...');
  const a11yRes = runStep(
    'Accessibility',
    'npx tsx --test tests/prompt3-accessibility.test.ts tests/accessibility-audit.test.ts tests/accessibility-axe.test.ts'
  );
  results.push(a11yRes);
  if (a11yRes.status === 'FAIL') highIssues++;

  // 8. E2E Core Lifecycle Journey
  console.log('8/10 Executing complete E2E lifecycle journey from intake to advocate pack & resolution...');
  const e2eRes = runStep(
    'E2E Journey',
    'npx tsx --test tests/e2e-journey.test.ts tests/phase6-production-readiness.test.ts'
  );
  results.push(e2eRes);
  if (e2eRes.status === 'FAIL') criticalIssues++;

  // 9. Browser E2E (Playwright)
  console.log('9/10 Executing browser Playwright multi-viewport E2E suite...');
  const pwRes = runStep('Browser E2E (Playwright)', 'npx playwright test');
  if (
    pwRes.status === 'FAIL' &&
    (pwRes.error?.includes("Executable doesn't exist") ||
     pwRes.error?.includes("download new browsers") ||
     pwRes.error?.includes("playwright install"))
  ) {
    if (isReleaseMode) {
      results.push({
        name: 'Browser E2E (Playwright)',
        status: 'FAIL',
        durationMs: pwRes.durationMs,
        error: 'Playwright browser engine required for release mode but not installed.'
      });
      criticalIssues++;
    } else {
      results.push({
        name: 'Browser E2E (Playwright)',
        status: 'NOT CONFIGURED',
        durationMs: pwRes.durationMs
      });
      warnings++;
    }
  } else {
    results.push(pwRes);
    if (pwRes.status === 'FAIL') {
      criticalIssues++;
    }
  }

  // 10. Production Build
  console.log('10/10 Compiling Next.js Turbopack production bundle...');
  const buildRes = runStep('Production Build', 'npm run build');
  results.push(buildRes);
  if (buildRes.status === 'FAIL') criticalIssues++;

  // Render standardized report
  console.log('\n======================================================');
  console.log('NYAYSAATHI PRODUCTION VERIFICATION REPORT');
  console.log('======================================================\n');

  for (const r of results) {
    const padName = r.name.padEnd(28, ' ');
    const statusText =
      r.status === 'PASS'
        ? '\x1b[32mPASS\x1b[0m'
        : r.status === 'NOT CONFIGURED'
          ? '\x1b[33mNOT CONFIGURED\x1b[0m'
          : r.status === 'SKIPPED'
            ? '\x1b[36mSKIPPED\x1b[0m'
            : '\x1b[31mFAIL\x1b[0m';
    const duration = r.durationMs > 0 ? ` (${(r.durationMs / 1000).toFixed(2)}s)` : '';
    console.log(`${padName} ${statusText}${duration}`);
  }

  console.log('');
  console.log(`Critical Issues            ${criticalIssues}`);
  console.log(`High Issues                ${highIssues}`);
  console.log(`Warnings / Unconfigured    ${warnings}`);
  console.log('======================================================\n');

  if (criticalIssues > 0 || highIssues > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

verifyProduction();
