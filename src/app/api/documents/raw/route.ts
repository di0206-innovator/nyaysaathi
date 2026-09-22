import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth-service';
import { getMatterService } from '@/lib/repository';
import { getStorageProvider } from '@/lib/storage/storage-provider';
import { enforceRateLimit } from '@/lib/security/rate-limiter';
import { SecurityAuditLogger } from '@/lib/observability/audit-logger';

export async function GET(req: NextRequest) {
  try {
    const user = await AuthService.getAuthenticatedUser(req);
    if (!user) {
      return new NextResponse('Authentication required to view document', { status: 401 });
    }

    const rateLimitRes = await enforceRateLimit(req, 'raw_document_access', 60, 60, user.id);
    if (rateLimitRes) return rateLimitRes;

    const { searchParams } = new URL(req.url);
    const rawPath = searchParams.get('path');

    if (!rawPath) {
      return new NextResponse('Path parameter is required', { status: 400 });
    }

    const decodedPath = decodeURIComponent(rawPath);

    // Path traversal check
    if (decodedPath.includes('..') || decodedPath.startsWith('/') || decodedPath.includes('\\')) {
      SecurityAuditLogger.log({
        action: 'unauthorized_access_blocked',
        userId: user.id,
        resourceType: 'document',
        status: 'denied',
        metadata: { path: decodedPath, reason: 'path_traversal' }
      });
      return new NextResponse('Invalid document path: path traversal detected', { status: 400 });
    }

    // Parse canonical path into exact segments
    const { parseAndValidateStoragePath } = await import('@/lib/storage/canonical-path');
    let pathSegments: { userId: string; matterId: string; documentId: string; safeFilename: string };
    try {
      pathSegments = parseAndValidateStoragePath(decodedPath);
    } catch {
      SecurityAuditLogger.log({
        action: 'unauthorized_access_blocked',
        userId: user.id,
        resourceType: 'document',
        status: 'denied',
        metadata: { path: decodedPath, reason: 'malformed_canonical_path' }
      });
      return new NextResponse('Invalid or malformed document storage path', { status: 400 });
    }

    // 1. Strict User Isolation: Must match authenticated user ID
    if (pathSegments.userId !== user.id) {
      SecurityAuditLogger.log({
        action: 'unauthorized_access_blocked',
        userId: user.id,
        resourceType: 'document',
        status: 'denied',
        metadata: { path: decodedPath, targetUser: pathSegments.userId, reason: 'cross_tenant_user_mismatch' }
      });
      return new NextResponse('Access denied: Unauthorized cross-tenant document path', { status: 403 });
    }

    // 2. Strict Matter Isolation: Matter must exist and belong to user
    const service = getMatterService(user.token);
    const matter = await service.getMatterById(pathSegments.matterId, user.id);
    if (!matter) {
      SecurityAuditLogger.log({
        action: 'unauthorized_access_blocked',
        userId: user.id,
        matterId: pathSegments.matterId,
        resourceType: 'document',
        status: 'denied',
        metadata: { path: decodedPath, reason: 'matter_not_found_or_unowned' }
      });
      return new NextResponse('Access denied or matter not found', { status: 403 });
    }

    // 3. Exact Document Record Match: Must map to an actual document record in this matter
    const docs = matter.documents || (await service.getAdapter().documents.listByMatter(pathSegments.matterId));
    const matchingDoc = docs.find(d => d.id === pathSegments.documentId);

    if (!matchingDoc) {
      SecurityAuditLogger.log({
        action: 'unauthorized_access_blocked',
        userId: user.id,
        matterId: pathSegments.matterId,
        resourceType: 'document',
        status: 'denied',
        metadata: { path: decodedPath, documentId: pathSegments.documentId, reason: 'unregistered_document_record' }
      });
      return new NextResponse('Document record not found for the specified path in this matter.', { status: 404 });
    }

    // Request-scoped storage provider using user's authentication token
    const storageProvider = getStorageProvider(user.token);

    // 1. Attempt to stream file buffer directly
    if (storageProvider.getFile) {
      const fileData = await storageProvider.getFile(decodedPath);
      if (fileData) {
        return new NextResponse(new Uint8Array(fileData.buffer), {
          status: 200,
          headers: {
            'Content-Type': fileData.mimeType,
            'Content-Length': String(fileData.buffer.byteLength),
            'Content-Disposition': 'inline',
            'X-Content-Type-Options': 'nosniff'
          }
        });
      }
    }

    // 2. Attempt to redirect to short-lived signed URL (15 minutes / 900s)
    if (storageProvider.getSignedUrl) {
      const signedUrl = await storageProvider.getSignedUrl(decodedPath, 900);
      if (signedUrl && !signedUrl.startsWith('/api/documents/raw')) {
        return NextResponse.redirect(signedUrl);
      }
    }

    return new NextResponse('Document not found in storage', { status: 404 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching raw document';
    return new NextResponse(message, { status: 500 });
  }
}
