import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { validateUploadedFile, MAX_ALLOWED_FILE_SIZE } from '@/lib/security/file-validator';
import { RateLimiter } from '@/lib/security/rate-limiter';

describe('Document Security & Validation Hardening', () => {
  describe('File Validation & Magic Bytes', () => {
    it('accepts valid PDF with proper magic bytes (%PDF-)', () => {
      const validPdfBuffer = Buffer.from('%PDF-1.7\n%Legal agreement dummy content\n%%EOF');
      const result = validateUploadedFile(validPdfBuffer, 'lease-agreement.pdf', 'application/pdf');

      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.detectedMimeType, 'application/pdf');
      assert.ok(result.contentHash);
      assert.strictEqual(result.contentHash?.length, 64); // SHA-256
    });

    it('rejects executable HTML/XSS disguised as PDF', () => {
      const xssBuffer = Buffer.from('<!doctype html><html><script>alert("pwned")</script></html>');
      const result = validateUploadedFile(xssBuffer, 'exploit.pdf', 'application/pdf');

      assert.strictEqual(result.valid, false);
      assert.ok(result.error?.includes('Disallowed file content'));
    });

    it('rejects SVG disguised as image or document', () => {
      const svgBuffer = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
      const result = validateUploadedFile(svgBuffer, 'diagram.png', 'image/png');

      assert.strictEqual(result.valid, false);
      assert.ok(result.error?.includes('Disallowed file content'));
    });

    it('rejects mismatched file extension vs actual format', () => {
      // PDF header but named .png
      const fakePngBuffer = Buffer.from('%PDF-1.4 sample content');
      const result = validateUploadedFile(fakePngBuffer, 'document.png', 'image/png');

      assert.strictEqual(result.valid, false);
      assert.ok(result.error?.includes('does not match the verified file format'));
    });

    it('rejects file exceeding 10MB maximum size', () => {
      const oversizedBuffer = Buffer.alloc(MAX_ALLOWED_FILE_SIZE + 1024, '%PDF-');
      const result = validateUploadedFile(oversizedBuffer, 'huge.pdf', 'application/pdf');

      assert.strictEqual(result.valid, false);
      assert.ok(result.error?.includes('10MB limit'));
    });

    it('rejects empty payloads', () => {
      const emptyBuffer = Buffer.alloc(0);
      const result = validateUploadedFile(emptyBuffer, 'empty.pdf', 'application/pdf');

      assert.strictEqual(result.valid, false);
      assert.ok(result.error?.includes('Empty file payload'));
    });

    it('accepts valid PNG image magic bytes', () => {
      const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
      const result = validateUploadedFile(pngHeader, 'evidence.png', 'image/png');

      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.detectedMimeType, 'image/png');
    });

    it('accepts valid JPEG image magic bytes', () => {
      const jpegHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
      const result = validateUploadedFile(jpegHeader, 'receipt.jpg', 'image/jpeg');

      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.detectedMimeType, 'image/jpeg');
    });
  });

  describe('Rate Limiter Fail-Closed in Production', () => {
    const originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
      RateLimiter.clear();
    });

    afterEach(() => {
      (process.env as Record<string, string | undefined>).NODE_ENV = originalEnv;
    });

    it('fails closed in production for expensive endpoints when distributed limiter is down', async () => {
      (process.env as Record<string, string | undefined>).NODE_ENV = 'production';

      // 'compare_docs' is an expensive operation
      const result = await RateLimiter.checkAsync('user:123:compare_docs', 20, 60);

      assert.strictEqual(result.allowed, false);
      assert.strictEqual(result.failClosed, true);
      assert.strictEqual(result.remaining, 0);
    });

    it('falls back to in-memory sliding window in development mode', async () => {
      (process.env as Record<string, string | undefined>).NODE_ENV = 'development';

      const result = await RateLimiter.checkAsync('user:123:compare_docs', 20, 60);

      assert.strictEqual(result.allowed, true);
      assert.strictEqual(result.failClosed, undefined);
      assert.strictEqual(result.remaining, 19);
    });

    it('allows non-expensive operations to fallback in production', async () => {
      (process.env as Record<string, string | undefined>).NODE_ENV = 'production';

      const result = await RateLimiter.checkAsync('user:123:health_check', 20, 60);

      assert.strictEqual(result.allowed, true);
      assert.strictEqual(result.failClosed, undefined);
    });
  });
});
