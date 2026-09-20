import { execSync } from 'node:child_process';

interface StepResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'NOT CONFIGURED';
  durationMs: number;
  error?: string;
}

function runStep(name: string, command: string): StepResult {
  const start = Date.now();
  try {
    execSync(command, { stdio: 'pipe', encoding: 'utf-8' });
    return { name, status: 'PASS', durationMs: Date.now() - start };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { name, status: 'FAIL', durationMs: Date.now() - start, error: errorMsg };
  }
}

async function verifyProduction() {
  console.log('\n=======================================');
  console.log('NYAYSAATHI PRODUCTION VERIFICATION');
  console.log('=======================================\n');

  const results: StepResult[] = [];
  let criticalIssues = 0;
  let highIssues = 0;
  let warnings = 0;

  // 1. Lint
  console.log('1/9 Running ESLint static code quality inspection...');
  const lintRes = runStep('Lint', 'npm run lint');
  results.push(lintRes);
  if (lintRes.status === 'FAIL') highIssues++;

  // 2. Typecheck
  console.log('2/9 Running TypeScript compiler type check...');
  const typecheckRes = runStep('Typecheck', 'npx tsc --noEmit');
  results.push(typecheckRes);
  if (typecheckRes.status === 'FAIL') criticalIssues++;

  // 3. Unit Tests
  console.log('3/9 Running core repository & statutory unit test suites...');
  const unitRes = runStep(
    'Unit Tests',
    'npx tsx --test tests/persistence-and-intake.test.ts tests/ai-rag-multilingual.test.ts tests/prompt4-performance-contracts.test.ts tests/prompt5-gtm-wedge.test.ts tests/phase7-action-lifecycle.test.ts'
  );
  results.push(unitRes);
  if (unitRes.status === 'FAIL') criticalIssues++;

  // 4. Integration Tests
  console.log('4/9 Inspecting external integration environment...');
  const hasSupabase = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  if (!hasSupabase) {
    results.push({
      name: 'Integration Tests',
      status: 'NOT CONFIGURED',
      durationMs: 0
    });
    warnings++;
  } else {
    const integRes = runStep('Integration Tests', 'npx tsx --test tests/phase8-production-integrity.test.ts');
    results.push(integRes);
    if (integRes.status === 'FAIL') highIssues++;
  }

  // 5. Security Tests
  console.log('5/9 Executing production security & authorization regression suite...');
  const secRes = runStep(
    'Security Tests',
    'npx tsx --test tests/prompt1-production-security.test.ts tests/security-regression.test.ts'
  );
  results.push(secRes);
  if (secRes.status === 'FAIL') criticalIssues++;

  // 6. AI Evaluation
  console.log('6/9 Executing truthful AI reasoning, stale-law defense & evidence grounding suite...');
  const aiRes = runStep(
    'AI Evaluation',
    'npx tsx --test tests/prompt2-ai-evaluation.test.ts tests/evidence-enforcement.test.ts tests/failure-paths.test.ts'
  );
  results.push(aiRes);
  if (aiRes.status === 'FAIL') criticalIssues++;

  // 7. Accessibility
  console.log('7/9 Running WCAG 2.2 AA accessibility audit (live regions, focus rings, contracts)...');
  const a11yRes = runStep(
    'Accessibility',
    'npx tsx --test tests/prompt3-accessibility.test.ts tests/accessibility-audit.test.ts'
  );
  results.push(a11yRes);
  if (a11yRes.status === 'FAIL') highIssues++;

  // 8. E2E Smoke & Journey
  console.log('8/9 Executing complete E2E lifecycle journey from intake to advocate pack & resolution...');
  const e2eRes = runStep(
    'E2E',
    'npx tsx --test tests/e2e-journey.test.ts tests/phase6-production-readiness.test.ts'
  );
  results.push(e2eRes);
  if (e2eRes.status === 'FAIL') criticalIssues++;

  // 9. Production Build
  console.log('9/9 Compiling Next.js Turbopack production bundle...');
  const buildRes = runStep('Production Build', 'npm run build');
  results.push(buildRes);
  if (buildRes.status === 'FAIL') criticalIssues++;

  // Render standardized report
  console.log('\n=======================================');
  console.log('NYAYSAATHI PRODUCTION VERIFICATION');
  console.log('=======================================\n');

  for (const r of results) {
    const padName = r.name.padEnd(20, ' ');
    const statusText =
      r.status === 'PASS'
        ? '\x1b[32mPASS\x1b[0m'
        : r.status === 'NOT CONFIGURED'
          ? '\x1b[33mNOT CONFIGURED\x1b[0m'
          : '\x1b[31mFAIL\x1b[0m';
    const duration = r.durationMs > 0 ? ` (${(r.durationMs / 1000).toFixed(2)}s)` : '';
    console.log(`${padName} ${statusText}${duration}`);
  }

  console.log('');
  console.log(`Critical Issues      ${criticalIssues}`);
  console.log(`High Issues          ${highIssues}`);
  console.log(`Warnings              ${warnings}`);
  console.log('=======================================\n');

  if (criticalIssues > 0 || highIssues > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

verifyProduction();
