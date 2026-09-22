/**
 * Canonical Storage Path Generator & Validator for NyaySaathi
 * 
 * Enforces strictly deterministic private storage paths:
 *   user/{userId}/matters/{matterId}/documents/{documentId}/{safeFilename}
 * 
 * Guards against:
 *   - Path traversal (.., %2e%2e)
 *   - Absolute paths (/ or \)
 *   - Encoded traversal
 *   - Duplicated prefixes
 *   - Arbitrary user-supplied storage keys
 */

export interface CanonicalPathComponents {
  userId: string;
  matterId: string;
  documentId: string;
  safeFilename: string;
}

/**
 * Sanitize a filename to only alphanumeric characters, dashes, underscores, and single dots.
 */
export function sanitizeFilename(filename: string): string {
  const base = filename.split(/[/\\]/).pop() || 'document';
  // Remove any dangerous characters, keep only standard safe characters
  const clean = base.replace(/[^a-zA-Z0-9._-]/g, '_');
  // Avoid leading dots (hidden files) or trailing dots
  return clean.replace(/^\.+/, '').replace(/\.+$/, '') || 'document';
}

/**
 * Build canonical storage path.
 * Format: user/{userId}/matters/{matterId}/documents/{documentId}/{safeFilename}
 */
export function buildDocumentStoragePath(
  userId: string,
  matterId: string,
  documentId: string,
  filename: string
): string {
  if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
    throw new Error('Storage Path Violation: userId is required.');
  }
  if (!matterId || typeof matterId !== 'string' || matterId.trim().length === 0) {
    throw new Error('Storage Path Violation: matterId is required.');
  }
  if (!documentId || typeof documentId !== 'string' || documentId.trim().length === 0) {
    throw new Error('Storage Path Violation: documentId is required.');
  }

  // Validate components do not contain slashes, backslashes, or path traversal
  const components = [userId, matterId, documentId];
  for (const comp of components) {
    if (comp.includes('/') || comp.includes('\\') || comp.includes('..') || comp.includes('%2e')) {
      throw new Error(`Storage Path Violation: Component "${comp}" contains illegal path traversal characters.`);
    }
  }

  const safeName = sanitizeFilename(filename);
  return `user/${userId.trim()}/matters/${matterId.trim()}/documents/${documentId.trim()}/${safeName}`;
}

/**
 * Parse and validate a canonical storage path.
 * Returns the parsed components if valid, or throws an error.
 */
export function parseAndValidateStoragePath(storagePath: string): CanonicalPathComponents {
  if (!storagePath || typeof storagePath !== 'string') {
    throw new Error('Storage Path Violation: Path must be a non-empty string.');
  }

  // Check for path traversal or encoding tricks
  const decoded = decodeURIComponent(storagePath);
  if (
    decoded.includes('..') ||
    decoded.startsWith('/') ||
    decoded.startsWith('\\') ||
    decoded.includes('\\') ||
    decoded.includes('//')
  ) {
    throw new Error('Storage Path Violation: Traversal or malformed path detected.');
  }

  const parts = decoded.split('/');
  // Expected structure: user/{userId}/matters/{matterId}/documents/{documentId}/{safeFilename}
  // Length is 7: ['user', userId, 'matters', matterId, 'documents', documentId, safeFilename]
  if (
    parts.length !== 7 ||
    parts[0] !== 'user' ||
    parts[2] !== 'matters' ||
    parts[4] !== 'documents'
  ) {
    throw new Error(`Storage Path Violation: Path does not conform to canonical format "user/{userId}/matters/{matterId}/documents/{documentId}/{filename}".`);
  }

  const userId = parts[1];
  const matterId = parts[3];
  const documentId = parts[5];
  const safeFilename = parts[6];

  return {
    userId,
    matterId,
    documentId,
    safeFilename
  };
}

/**
 * Check whether a storage path strictly belongs to a specific user using exact segment extraction.
 */
export function isStoragePathOwnedByUser(storagePath: string, userId: string): boolean {
  if (!userId || typeof userId !== 'string') return false;
  try {
    const components = parseAndValidateStoragePath(storagePath);
    return components.userId === userId.trim();
  } catch {
    return false;
  }
}
