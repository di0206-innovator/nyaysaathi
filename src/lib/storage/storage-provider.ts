import { getSupabaseClient, isSupabaseConfigured } from '@/lib/db/supabase';

export interface StoredFile {
  fileUrl: string;
  fileSize: string;
  mimeType: string;
  filename: string;
  storagePath?: string;
}

export interface UploadFileInput {
  buffer: Buffer | ArrayBuffer;
  filename: string;
  mimeType: string;
  matterId: string;
  userId?: string;
  documentId?: string;
}

export interface IStorageProvider {
  uploadFile(file: UploadFileInput): Promise<StoredFile>;
  deleteFile(fileUrl: string): Promise<boolean>;
  getSignedUrl?(storagePath: string, expiresInSeconds?: number): Promise<string | null>;
  getFile?(storagePath: string): Promise<{ buffer: Buffer; mimeType: string } | null>;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Local memory/data-URL storage provider for development and testing.
 */
export class LocalStorageProvider implements IStorageProvider {
  private files: Map<string, { buffer: Buffer; mimeType: string }> = new Map();

  public async uploadFile(file: UploadFileInput): Promise<StoredFile> {
    const nodeBuf = Buffer.isBuffer(file.buffer) ? file.buffer : Buffer.from(file.buffer);

    // Enforce 10MB limit
    if (nodeBuf.byteLength > MAX_FILE_SIZE_BYTES) {
      throw new Error(`File size (${formatBytes(nodeBuf.byteLength)}) exceeds maximum permitted 10MB limit.`);
    }

    const sizeStr = formatBytes(nodeBuf.byteLength);
    const safeFilename = `${Date.now()}-${file.filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const userId = file.userId || 'anonymous';
    const docId = file.documentId || `doc-${Date.now()}`;
    const storagePath = `user/${userId}/matters/${file.matterId}/documents/${docId}/${safeFilename}`;

    this.files.set(storagePath, { buffer: nodeBuf, mimeType: file.mimeType });

    // In local dev, use an internal API/data URL route
    const fileUrl = `/api/documents/raw?path=${encodeURIComponent(storagePath)}`;

    return {
      fileUrl,
      fileSize: sizeStr,
      mimeType: file.mimeType,
      filename: file.filename,
      storagePath
    };
  }

  public async deleteFile(fileUrl: string): Promise<boolean> {
    const match = fileUrl.match(/path=([^&]+)/);
    if (match && match[1]) {
      const decoded = decodeURIComponent(match[1]);
      return this.files.delete(decoded);
    }
    return false;
  }

  public async getSignedUrl(storagePath: string): Promise<string | null> {
    return `/api/documents/raw?path=${encodeURIComponent(storagePath)}`;
  }

  public async getFile(storagePath: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
    const found = this.files.get(storagePath);
    return found || null;
  }
}

/**
 * Supabase Storage Provider for production bucket uploads.
 * Enforces private bucket access, deterministic paths, and signed URLs.
 */
export class SupabaseStorageProvider implements IStorageProvider {
  private bucketName = 'evidence-documents';

  public async uploadFile(file: UploadFileInput): Promise<StoredFile> {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client is not configured.');
    }

    const nodeBuf = Buffer.isBuffer(file.buffer) ? file.buffer : Buffer.from(file.buffer);

    // Enforce 10MB limit
    if (nodeBuf.byteLength > MAX_FILE_SIZE_BYTES) {
      throw new Error(`File size (${formatBytes(nodeBuf.byteLength)}) exceeds maximum permitted 10MB limit.`);
    }

    const sizeStr = formatBytes(nodeBuf.byteLength);
    const safeFilename = `${Date.now()}-${file.filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const userId = file.userId || 'anonymous';
    const docId = file.documentId || `doc-${Date.now()}`;

    // Deterministic scoped private path
    const storagePath = `user/${userId}/matters/${file.matterId}/documents/${docId}/${safeFilename}`;

    const { error } = await client.storage
      .from(this.bucketName)
      .upload(storagePath, nodeBuf, {
        contentType: file.mimeType,
        upsert: true
      });

    if (error) {
      throw new Error(`Supabase Storage upload failed: ${error.message}`);
    }

    // Generate a private signed URL valid for 1 hour (3600 seconds)
    const { data: signedData, error: signedError } = await client.storage
      .from(this.bucketName)
      .createSignedUrl(storagePath, 3600);

    const fileUrl = !signedError && signedData?.signedUrl
      ? signedData.signedUrl
      : `/api/documents/raw?path=${encodeURIComponent(storagePath)}`;

    return {
      fileUrl,
      fileSize: sizeStr,
      mimeType: file.mimeType,
      filename: file.filename,
      storagePath
    };
  }

  public async deleteFile(fileUrl: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    let path = '';
    if (fileUrl.includes(`/${this.bucketName}/`)) {
      const parts = fileUrl.split(`/${this.bucketName}/`);
      path = parts[1]?.split('?')[0] || '';
    } else {
      const match = fileUrl.match(/path=([^&]+)/);
      if (match && match[1]) {
        path = decodeURIComponent(match[1]);
      }
    }

    if (!path) return false;

    const { error } = await client.storage
      .from(this.bucketName)
      .remove([path]);

    return !error;
  }

  public async getSignedUrl(storagePath: string, expiresInSeconds: number = 3600): Promise<string | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    const { data, error } = await client.storage
      .from(this.bucketName)
      .createSignedUrl(storagePath, expiresInSeconds);

    return error ? null : (data?.signedUrl || null);
  }

  public async getFile(storagePath: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    const { data, error } = await client.storage
      .from(this.bucketName)
      .download(storagePath);

    if (error || !data) return null;

    const arrayBuffer = await data.arrayBuffer();
    return {
      buffer: Buffer.from(arrayBuffer),
      mimeType: data.type || 'application/octet-stream'
    };
  }
}

let activeStorageProvider: IStorageProvider | null = null;

export function getStorageProvider(): IStorageProvider {
  if (!activeStorageProvider) {
    if (isSupabaseConfigured()) {
      activeStorageProvider = new SupabaseStorageProvider();
    } else {
      activeStorageProvider = new LocalStorageProvider();
    }
  }
  return activeStorageProvider;
}

export function setStorageProvider(provider: IStorageProvider) {
  activeStorageProvider = provider;
}
