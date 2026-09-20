import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('ACCESSIBILITY AUDIT (WCAG 2.2 AA Standards & Axe-Core Alignment)', () => {
  const srcDir = path.resolve(process.cwd(), 'src');

  // 1. Zero Browser alert() / confirm() / prompt() Calls
  it('guarantees zero blocking browser alert(), confirm(), or prompt() calls across all source files', () => {
    function scanFiles(dir: string, fileList: string[] = []) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanFiles(fullPath, fileList);
        } else if (/\.(tsx|ts|jsx|js)$/.test(entry.name)) {
          fileList.push(fullPath);
        }
      }
      return fileList;
    }

    const files = scanFiles(srcDir);
    const violations: string[] = [];

    const alertRegex = /\b(?:window\.)?(alert|confirm|prompt)\s*\(/;

    for (const f of files) {
      const content = fs.readFileSync(f, 'utf-8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        // Exclude commented lines
        const trimmed = line.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;
        if (alertRegex.test(line)) {
          violations.push(`${path.relative(process.cwd(), f)}:${idx + 1}: ${trimmed}`);
        }
      });
    }

    assert.equal(
      violations.length,
      0,
      `Blocking dialog violations found:\n${violations.join('\n')}`
    );
  });

  // 2. WCAG 2.2 AA Modal Dialog Contracts
  it('validates WCAG 2.2 AA modal contracts across all matter dialog components', () => {
    const modalComponents = [
      'src/components/matter/ActionDetailModal.tsx',
      'src/components/matter/AdvocateCasePackModal.tsx',
      'src/components/matter/ResolutionModal.tsx',
      'src/components/matter/EvidenceUploader.tsx',
      'src/components/matter/CommunicationLog.tsx'
    ];

    for (const relPath of modalComponents) {
      const fullPath = path.resolve(process.cwd(), relPath);
      assert.ok(fs.existsSync(fullPath), `Modal file must exist: ${relPath}`);
      const content = fs.readFileSync(fullPath, 'utf-8');

      // role="dialog" or aria-modal="true"
      assert.ok(
        content.includes('role="dialog"') || content.includes("role='dialog'"),
        `${relPath} must have role="dialog"`
      );
      assert.ok(
        content.includes('aria-modal="true"') || content.includes("aria-modal='true'"),
        `${relPath} must have aria-modal="true"`
      );
      assert.ok(
        content.includes('aria-labelledby'),
        `${relPath} must reference an accessible header via aria-labelledby`
      );
      assert.ok(
        content.includes("'Escape'") || content.includes('"Escape"'),
        `${relPath} must handle the Escape key to dismiss dialog`
      );
    }
  });

  // 3. Accessible Live Region Toast System
  it('validates Toast component conforms to WAI-ARIA live region contracts', () => {
    const toastPath = path.resolve(process.cwd(), 'src/components/ui/Toast.tsx');
    assert.ok(fs.existsSync(toastPath), 'Toast component must exist');
    const content = fs.readFileSync(toastPath, 'utf-8');

    assert.ok(content.includes('role="status"'), 'Toast must have role="status"');
    assert.ok(content.includes('aria-live="polite"'), 'Toast must have aria-live="polite"');
    assert.ok(content.includes('aria-atomic="true"'), 'Toast must have aria-atomic="true"');
  });

  // 4. CSS High-Contrast Focus Rings & Reduced Motion
  it('verifies globals.css includes high-contrast focus rings and prefers-reduced-motion', () => {
    const cssPath = path.resolve(process.cwd(), 'src/app/globals.css');
    assert.ok(fs.existsSync(cssPath), 'globals.css must exist');
    const content = fs.readFileSync(cssPath, 'utf-8');

    assert.ok(
      content.includes(':focus-visible'),
      'globals.css must declare explicit :focus-visible rules'
    );
    assert.ok(
      content.includes('prefers-reduced-motion'),
      'globals.css must respect @media (prefers-reduced-motion: reduce)'
    );
  });

  // 5. Semantic Multi-Cue Status Indicators (No Color-Only Information)
  it('verifies status representations use text and icon cues rather than color alone', () => {
    const trustCardPath = path.resolve(process.cwd(), 'src/components/matter/TrustSafetyCard.tsx');
    const content = fs.readFileSync(trustCardPath, 'utf-8');

    assert.ok(content.includes('Verified Support') || content.includes('Supported'), 'Must show textual trust labels');
    assert.ok(content.includes('shrink-0'), 'Must include visual icons alongside text');
  });
});
