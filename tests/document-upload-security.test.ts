import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { POST as uploadPost } from '@/app/api/documents/upload/route';

describe('Document Upload Authentication & Security Regression Suite', () => {
  it('strictly rejects unauthenticated uploads with HTTP 401 before processing files', async () => {
    // Request without Authorization header or session cookies
    const formData = new FormData();
    const fakePdf = new Blob(['%PDF-1.4 mock content'], { type: 'application/pdf' });
    formData.append('file', fakePdf, 'lease.pdf');

    const req = new NextRequest('http://localhost:3000/api/documents/upload', {
      method: 'POST',
      body: formData
    });

    const res = await uploadPost(req);
    assert.strictEqual(res.status, 401, 'Unauthenticated upload must immediately return 401');

    const json = await res.json();
    assert.strictEqual(json.success, false);
    assert.strictEqual(json.error.code, 'UNAUTHORIZED');
    assert.ok(json.error.message.includes('Authentication required'));
  });

  it('permits authenticated uploads to proceed with 201 Created and extract text', async () => {
    const formData = new FormData();
    const validPdfBuffer = Buffer.from('%PDF-1.7\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF');
    const validBlob = new Blob([validPdfBuffer], { type: 'application/pdf' });
    formData.append('file', validBlob, 'test-agreement.pdf');

    const req = new NextRequest('http://localhost:3000/api/documents/upload', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer mock-user-citizen'
      },
      body: formData
    });

    const res = await uploadPost(req);
    assert.strictEqual(res.status, 201, 'Authenticated upload must succeed with 201');

    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(json.data.documentId);
    assert.strictEqual(json.data.filename, 'test-agreement.pdf');
    assert.strictEqual(json.data.processingMode, 'VERIFIED_DOCUMENT_MODE');
  });

  it('guarantees expensive parsing is NOT invoked when authentication fails', async () => {
    // Malicious or oversized payload sent by anonymous caller
    const oversizedBlob = new Blob([Buffer.alloc(11 * 1024 * 1024)], { type: 'application/pdf' });
    const formData = new FormData();
    formData.append('file', oversizedBlob, 'huge.pdf');

    const req = new NextRequest('http://localhost:3000/api/documents/upload', {
      method: 'POST',
      body: formData
    });

    const res = await uploadPost(req);
    // If it reached validator, it would have returned 400 INVALID_FILE (size limit)
    // Because auth runs FIRST, it must return 401 UNAUTHORIZED
    assert.strictEqual(res.status, 401);
    const json = await res.json();
    assert.strictEqual(json.error.code, 'UNAUTHORIZED');
  });
});
