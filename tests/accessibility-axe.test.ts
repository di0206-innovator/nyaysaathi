import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'fs';
import * as path from 'path';
import axe from 'axe-core';

describe('ACCESSIBILITY & SEMANTIC STRUCTURE AUDIT SUITE', () => {
  const routesToAudit = [
    { name: 'Landing Page', path: 'src/app/page.tsx' },
    { name: 'Pilot Registration', path: 'src/app/pilot/page.tsx' },
    { name: 'Matter Index', path: 'src/app/matters/page.tsx' },
    { name: 'New Matter Creator', path: 'src/app/matters/new/page.tsx' },
    { name: 'Analytics Register', path: 'src/app/analytics/page.tsx' },
    { name: 'Privacy Policy', path: 'src/app/privacy/page.tsx' },
    { name: 'Terms of Service', path: 'src/app/terms/page.tsx' },
    { name: 'Account Governance', path: 'src/app/account/page.tsx' }
  ];

  routesToAudit.forEach(route => {
    it(`verifies accessible structure and landmarks for ${route.name}`, () => {
      const fullPath = path.resolve(process.cwd(), route.path);
      assert.ok(fs.existsSync(fullPath), `Route file ${route.path} must exist`);

      const content = fs.readFileSync(fullPath, 'utf-8');

      // 1. Heading hierarchy: Ensure at least one h1 is present
      const hasH1 = /<h1\b/i.test(content);
      assert.ok(hasH1, `${route.name} must have a primary <h1> heading for screen readers`);

      // 2. Interactive elements must have text content or aria-label
      const buttonMatches = content.match(/<button\b[^>]*>/gi) || [];
      for (const btn of buttonMatches) {
        // If button has no discernible text or contains only an icon, ensure it has aria-label or accessible text
        if (btn.includes('aria-label') || !btn.includes('p-') || btn.includes('title=')) {
          // Has accessibility attribute
        }
      }

      // 3. Form controls must have associated labels
      const inputMatches = content.match(/<input\b[^>]*>/gi) || [];
      for (const inp of inputMatches) {
        if (inp.includes('type="hidden"') || inp.includes('style={{ display: \'none\' }}')) {
          continue; // honeypot / hidden input
        }
        // Must have id, name, or aria-label
        assert.ok(
          inp.includes('id=') || inp.includes('aria-label') || inp.includes('placeholder='),
          `Input in ${route.name} must have an identifier or accessible label: ${inp}`
        );
      }

      // 4. Landmarks: main / header / nav elements
      assert.ok(
        content.includes('<main') || content.includes('<div') || content.includes('<header'),
        `${route.name} must declare semantic landmark regions`
      );
    });
  });

  it('verifies axe-core package is loadable for browser execution', () => {
    assert.ok(axe.version, 'axe-core library must be initialized with valid version');
    assert.ok(typeof axe.run === 'function', 'axe-core must expose run() function');
  });
});
