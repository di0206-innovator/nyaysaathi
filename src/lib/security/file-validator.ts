import { createHash } from 'node:crypto';

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  detectedMimeType?: string;
  contentHash?: string;
  byteLength: number;
}

export const MAX_ALLOWED_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Validates uploaded files against size, MIME, magic bytes, extension consistency, and content hash.
 */
export function validateUploadedFile(
  buffer: Buffer | ArrayBuffer,
  filename: string,
  declaredMimeType: string
): FileValidationResult {
  const nodeBuf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  const byteLength = nodeBuf.byteLength;

  if (byteLength === 0) {
    return { valid: false, error: 'Empty file payload is not permitted.', byteLength: 0 };
  }

  if (byteLength > MAX_ALLOWED_FILE_SIZE) {
    return {
      valid: false,
      error: `File size (${(byteLength / (1024 * 1024)).toFixed(2)} MB) exceeds maximum permitted 10MB limit.`,
      byteLength
    };
  }

  // Calculate SHA-256 hash for provenance integrity
  const contentHash = createHash('sha256').update(nodeBuf).digest('hex');

  // Extract file extension
  const extMatch = filename.match(/\.([a-zA-Z0-9]+)$/);
  const ext = extMatch ? extMatch[1].toLowerCase() : '';

  // 1. Magic byte verification
  let detectedType: string | undefined;

  // Check PDF (%PDF-)
  if (
    nodeBuf.length >= 5 &&
    nodeBuf[0] === 0x25 &&
    nodeBuf[1] === 0x50 &&
    nodeBuf[2] === 0x44 &&
    nodeBuf[3] === 0x46 &&
    nodeBuf[4] === 0x2d
  ) {
    detectedType = 'application/pdf';
  }
  // Check PNG (\x89PNG\r\n\x1a\n)
  else if (
    nodeBuf.length >= 8 &&
    nodeBuf[0] === 0x89 &&
    nodeBuf[1] === 0x50 &&
    nodeBuf[2] === 0x4e &&
    nodeBuf[3] === 0x47 &&
    nodeBuf[4] === 0x0d &&
    nodeBuf[5] === 0x0a &&
    nodeBuf[6] === 0x1a &&
    nodeBuf[7] === 0x0a
  ) {
    detectedType = 'image/png';
  }
  // Check JPEG (\xFF\xD8\xFF)
  else if (
    nodeBuf.length >= 3 &&
    nodeBuf[0] === 0xff &&
    nodeBuf[1] === 0xd8 &&
    nodeBuf[2] === 0xff
  ) {
    detectedType = 'image/jpeg';
  }
  // Check WebP (RIFF....WEBP)
  else if (
    nodeBuf.length >= 12 &&
    nodeBuf.toString('ascii', 0, 4) === 'RIFF' &&
    nodeBuf.toString('ascii', 8, 12) === 'WEBP'
  ) {
    detectedType = 'image/webp';
  }
  // Check Plain Text / Markdown / JSON (no binary null bytes in first 512 bytes, not HTML)
  else {
    const sample = nodeBuf.slice(0, Math.min(512, nodeBuf.length));
    let hasNullByte = false;
    for (let i = 0; i < sample.length; i++) {
      if (sample[i] === 0) {
        hasNullByte = true;
        break;
      }
    }

    const sampleStr = sample.toString('utf-8').trim().toLowerCase();

    // Block HTML injection / XSS payload disguised as legal document
    if (
      sampleStr.includes('<html') ||
      sampleStr.includes('<script') ||
      sampleStr.includes('<!doctype html') ||
      sampleStr.includes('<svg')
    ) {
      return {
        valid: false,
        error: 'Disallowed file content: Executable HTML/script payloads are rejected.',
        byteLength
      };
    }

    if (!hasNullByte) {
      if (declaredMimeType.includes('json') || ext === 'json') {
        detectedType = 'application/json';
      } else {
        detectedType = 'text/plain';
      }
    }
  }

  if (!detectedType) {
    return {
      valid: false,
      error: 'Unsupported file format or invalid binary signature.',
      byteLength
    };
  }

  // 2. Extension vs MIME Type Consistency
  const validExtensions: Record<string, string[]> = {
    'application/pdf': ['pdf'],
    'image/png': ['png'],
    'image/jpeg': ['jpg', 'jpeg'],
    'image/webp': ['webp'],
    'text/plain': ['txt', 'md', 'text', 'csv'],
    'application/json': ['json']
  };

  const expectedExts = validExtensions[detectedType] || [];
  if (ext && !expectedExts.includes(ext)) {
    return {
      valid: false,
      error: `File extension ".${ext}" does not match the verified file format (${detectedType}).`,
      byteLength
    };
  }

  return {
    valid: true,
    detectedMimeType: detectedType,
    contentHash,
    byteLength
  };
}
