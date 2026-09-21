import { spawn } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

function findTestFiles(dir: string): string[] {
  const results: string[] = [];
  const entries = readdirSync(dir);
  for (const entry of entries) {
    if (entry === 'e2e' || entry === 'fixtures' || entry === 'node_modules') continue;
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...findTestFiles(fullPath));
    } else if (entry.endsWith('.test.ts') || entry.endsWith('.test.js')) {
      results.push(fullPath);
    }
  }
  return results.sort();
}

const testFiles = findTestFiles(join(process.cwd(), 'tests'));
if (testFiles.length === 0) {
  console.error('No test files discovered in tests/ directory.');
  process.exit(1);
}

console.log(`[Test Runner] Discovered ${testFiles.length} test suites:`);
for (const f of testFiles) {
  console.log(`  - ${f.replace(process.cwd() + '/', '')}`);
}

const child = spawn('npx', ['tsx', '--test', ...testFiles], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'test'
  }
});

child.on('exit', (code) => {
  process.exit(code ?? 1);
});
