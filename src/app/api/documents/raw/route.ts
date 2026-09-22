import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth-service';
import { getMatterService } from '@/lib/repository';
import { getStorageProvider } from '@/lib/storage/storage-provider';
import { enforceRateLimit } from '@/lib/security/rate-limiter';
import { SecurityAuditLogger } from '@/lib/observability/audit-logger';
import { isStoragePathOwnedByUser } from '@/lib/storage/canonical-path';

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

    // Check user ownership prefix: must belong strictly to authenticated user
    if (!isStoragePathOwnedByUser(decodedPath, user.id)) {
      SecurityAuditLogger.log({
        action: 'unauthorized_access_blocked',
        userId: user.id,
        resourceType: 'document',
        status: 'denied',
        metadata: { path: decodedPath, reason: 'cross_tenant_user_mismatch' }
      });
      return new NextResponse('Access denied: Unauthorized cross-tenant document path', { status: 403 });
    }

    // Check matter ownership and verify that path maps to an actual registered document record
    const matterMatch = decodedPath.match(/matters\/([^/]+)/);
    if (matterMatch && matterMatch[1]) {
      const matterId = matterMatch[1];
      const service = getMatterService(user.token);
      const matter = await service.getMatterById(matterId, user.id);
      if (!matter) {
        SecurityAuditLogger.log({
          action: 'unauthorized_access_blocked',
          userId: user.id,
          matterId,
          resourceType: 'document',
          status: 'denied',
          metadata: { path: decodedPath }
        });
        return new NextResponse('Access denied or matter not found', { status: 403 });
      }

      // Verify that this path maps to a registered document record in this matter
      const docs = matter.documents || (await service.getAdapter().documents.listByMatter(matterId));
      const hasMatchingDoc = docs.some(d =>
        d.storagePath === decodedPath ||
        (d.fileUrl && d.fileUrl.includes(encodeURIComponent(decodedPath))) ||
        (d.storagePath && decodedPath.includes(d.id))
      );

      if (!hasMatchingDoc) {
        SecurityAuditLogger.log({
          action: 'unauthorized_access_blocked',
          userId: user.id,
          matterId,
          resourceType: 'document',
          status: 'denied',
          metadata: { path: decodedPath, reason: 'unregistered_document_record' }
        });
        return new NextResponse('Document record not found for the specified path in this matter.', { status: 404 });
      }
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
