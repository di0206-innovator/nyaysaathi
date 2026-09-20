import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('PROMPT 3: Accessibility, UX & WCAG 2.2 AA Standards', () => {
  const srcDir = path.resolve(process.cwd(), 'src');

  it('ensures zero browser alert() or confirm() calls across entire src tree', () => {
    function walkSync(dir: string, filelist: string[] = []): string[] {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filepath = path.join(dir, file);
        if (fs.statSync(filepath).isDirectory()) {
          walkSync(filepath, filelist);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
          filelist.push(filepath);
        }
      }
      return filelist;
    }

    const files = walkSync(srcDir);
    const offenders: string[] = [];

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;
        if (/\b(?:window\.)?alert\s*\(/.test(trimmed) && !trimmed.includes('//') && !trimmed.includes('Toast')) {
          offenders.push(`${file}:${idx + 1}: ${trimmed}`);
        }
        if (/\b(?:window\.)?confirm\s*\(/.test(trimmed) && !trimmed.includes('//')) {
          offenders.push(`${file}:${idx + 1}: ${trimmed}`);
        }
      });
    }

    assert.deepEqual(offenders, [], `Found prohibited native alert/confirm dialogs:\n${offenders.join('\n')}`);
  });

  it('validates WCAG 2.2 AA modal contracts across all matter dialog components', () => {
    const modalComponents = [
      'src/components/matter/ActionDetailModal.tsx',
      'src/components/matter/AdvocateCasePackModal.tsx',
      'src/components/matter/ResolutionModal.tsx',
      'src/components/matter/CommunicationLog.tsx',
      'src/components/matter/EvidenceUploader.tsx',
    ];

    for (const compPath of modalComponents) {
      const fullPath = path.resolve(process.cwd(), compPath);
      assert.ok(fs.existsSync(fullPath), `Modal component exists: ${compPath}`);
      const content = fs.readFileSync(fullPath, 'utf-8');

      // Check role="dialog"
      assert.ok(
        content.includes('role="dialog"') || content.includes('<dialog'),
        `${compPath} must specify role="dialog" or use <dialog>`
      );

      // Check aria-modal="true"
      assert.ok(
        content.includes('aria-modal="true"'),
        `${compPath} must specify aria-modal="true"`
      );

      // Check aria-labelledby
      assert.ok(
        content.includes('aria-labelledby='),
        `${compPath} must specify aria-labelledby for screen reader announcement`
      );

      // Check Escape key handler
      assert.ok(
        content.includes("'Escape'") || content.includes('"Escape"'),
        `${compPath} must listen for the Escape key to dismiss the modal`
      );

      // Check accessible close button
      assert.ok(
        content.includes('aria-label='),
        `${compPath} must contain accessible close buttons with aria-label`
      );
    }
  });

  it('validates global CSS contains WCAG 2.2 AA reduced motion and focus visibility', () => {
    const cssPath = path.resolve(process.cwd(), 'src/app/globals.css');
    const css = fs.readFileSync(cssPath, 'utf-8');

    assert.ok(
      css.includes('prefers-reduced-motion: reduce'),
      'globals.css must respect prefers-reduced-motion'
    );
    assert.ok(
      css.includes(':focus-visible'),
      'globals.css must define accessible :focus-visible outlines'
    );
    assert.ok(
      css.includes('min-tap-target') || css.includes('min-h-[44px]'),
      'globals.css must supply minimum touch target sizing for mobile accessibility'
    );
  });

  it('validates Toast live region accessibility attributes', () => {
    const toastPath = path.resolve(process.cwd(), 'src/components/ui/Toast.tsx');
    const toastContent = fs.readFileSync(toastPath, 'utf-8');

    assert.ok(
      toastContent.includes('aria-live="assertive"') || toastContent.includes('aria-live="polite"'),
      'Toast must implement an aria-live region'
    );
    assert.ok(
      (toastContent.includes("'alert'") || toastContent.includes('"alert"')) &&
      (toastContent.includes("'status'") || toastContent.includes('"status"')),
      'Toast must supply role="alert" or role="status"'
    );
  });

  it('verifies truthful multi-agent status reporting instead of synthetic timer steppers', () => {
    const matterDetailPath = path.resolve(process.cwd(), 'src/app/matters/[id]/page.tsx');
    const detailContent = fs.readFileSync(matterDetailPath, 'utf-8');

    assert.ok(
      !detailContent.includes('setInterval(') && !detailContent.includes('mockStepInterval'),
      'Matter detail page must not use fake setInterval steps for multi-agent reasoning'
    );
  });
});
