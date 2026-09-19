import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth-service';
import { getMatterService } from '@/lib/repository';
import { getStorageProvider } from '@/lib/storage/storage-provider';

export async function GET(req: NextRequest) {
  try {
    const user = await AuthService.getAuthenticatedUser(req);
    if (!user) {
      return new NextResponse('Authentication required to view document', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const rawPath = searchParams.get('path');

    if (!rawPath) {
      return new NextResponse('Path parameter is required', { status: 400 });
    }

    const decodedPath = decodeURIComponent(rawPath);

    // Path traversal check
    if (decodedPath.includes('..') || decodedPath.startsWith('/') || decodedPath.includes('\\')) {
      return new NextResponse('Invalid document path: path traversal detected', { status: 400 });
    }

    // Check matter ownership if path contains matter ID
    // Supported path formats:
    // 1. matters/{matterId}/{filename}
    // 2. user/{userId}/matters/{matterId}/documents/{documentId}/{filename}
    const matterMatch = decodedPath.match(/matters\/([^/]+)/);
    if (matterMatch && matterMatch[1]) {
      const matterId = matterMatch[1];
      const service = getMatterService();
      const matter = await service.getMatterById(matterId, user.id);
      if (!matter) {
        return new NextResponse('Access denied or document not found', { status: 403 });
      }
    }

    const storageProvider = getStorageProvider();

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

    // 2. Attempt to redirect to signed URL if available
    if (storageProvider.getSignedUrl) {
      const signedUrl = await storageProvider.getSignedUrl(decodedPath);
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
