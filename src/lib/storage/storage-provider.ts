import { getSupabaseClient, isSupabaseConfigured } from '@/lib/db/supabase';
import { buildDocumentStoragePath, sanitizeFilename } from '@/lib/storage/canonical-path';
import { validateUploadedFile } from '@/lib/security/file-validator';
import { SupabaseClient } from '@supabase/supabase-js';

export interface StoredFile {
  fileUrl: string;
  fileSize: string;
  mimeType: string;
  filename: string;
  storagePath?: string;
  contentHash?: string;
}

export interface UploadFileInput {
  buffer: Buffer | ArrayBuffer;
  filename: string;
  mimeType: string;
  matterId: string;
  userId?: string;
  documentId?: string;
}

export interface DeleteUserFilesResult {
  discovered: number;
  deleted: number;
  failed: number;
  success: boolean;
}

export interface IStorageProvider {
  uploadFile(file: UploadFileInput): Promise<StoredFile>;
  deleteFile(fileUrlOrPath: string): Promise<boolean>;
  deleteUserFiles?(userId: string): Promise<DeleteUserFilesResult>;
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

/**
 * Local memory/data-URL storage provider for development and testing.
 */
export class LocalStorageProvider implements IStorageProvider {
  private files: Map<string, { buffer: Buffer; mimeType: string }> = new Map();

  public async uploadFile(file: UploadFileInput): Promise<StoredFile> {
    const validation = validateUploadedFile(file.buffer, file.filename, file.mimeType);
    if (!validation.valid) {
      throw new Error(validation.error || 'File validation failed.');
    }

    const nodeBuf = Buffer.isBuffer(file.buffer) ? file.buffer : Buffer.from(file.buffer);

    const sizeStr = formatBytes(nodeBuf.byteLength);
    const userId = file.userId || 'anonymous';
    const docId = file.documentId || `doc-${Date.now()}`;
    const safeFilename = `${Date.now()}-${sanitizeFilename(file.filename)}`;
    
    // Deterministic canonical path
    const storagePath = buildDocumentStoragePath(userId, file.matterId, docId, safeFilename);

    this.files.set(storagePath, { buffer: nodeBuf, mimeType: validation.detectedMimeType || file.mimeType });

    // In local dev, use an internal API/data URL route
    const fileUrl = `/api/documents/raw?path=${encodeURIComponent(storagePath)}`;

    return {
      fileUrl,
      fileSize: sizeStr,
      mimeType: validation.detectedMimeType || file.mimeType,
      filename: file.filename,
      storagePath,
      contentHash: validation.contentHash
    };
  }

  public async deleteFile(fileUrlOrPath: string): Promise<boolean> {
    let path = fileUrlOrPath;
    const match = fileUrlOrPath.match(/path=([^&]+)/);
    if (match && match[1]) {
      path = decodeURIComponent(match[1]);
    }
    return this.files.delete(path);
  }

  public async deleteUserFiles(userId: string): Promise<DeleteUserFilesResult> {
    const prefix = `user/${userId}/`;
    const toDelete: string[] = [];
    for (const path of Array.from(this.files.keys())) {
      if (path.startsWith(prefix)) {
        toDelete.push(path);
      }
    }

    const discovered = toDelete.length;
    let deleted = 0;
    for (const p of toDelete) {
      if (this.files.delete(p)) {
        deleted++;
      }
    }

    return {
      discovered,
      deleted,
      failed: discovered - deleted,
      success: discovered === deleted
    };
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
 * Enforces request-scoped user authorization context, private bucket access,
 * canonical paths, and signed URLs.
 */
export class SupabaseStorageProvider implements IStorageProvider {
  private bucketName = 'evidence-documents';
  private userToken?: string;

  constructor(userToken?: string) {
    this.userToken = userToken;
  }

  private getClient(): SupabaseClient | null {
    return getSupabaseClient(this.userToken);
  }

  public async uploadFile(file: UploadFileInput): Promise<StoredFile> {
    const client = this.getClient();
    if (!client) {
      throw new Error('Supabase client is not configured.');
    }

    const validation = validateUploadedFile(file.buffer, file.filename, file.mimeType);
    if (!validation.valid) {
      throw new Error(validation.error || 'File validation failed.');
    }

    const nodeBuf = Buffer.isBuffer(file.buffer) ? file.buffer : Buffer.from(file.buffer);

    const sizeStr = formatBytes(nodeBuf.byteLength);
    const userId = file.userId || 'anonymous';
    const docId = file.documentId || `doc-${Date.now()}`;
    const safeFilename = `${Date.now()}-${sanitizeFilename(file.filename)}`;

    // Deterministic canonical path
    const storagePath = buildDocumentStoragePath(userId, file.matterId, docId, safeFilename);

    const { error } = await client.storage
      .from(this.bucketName)
      .upload(storagePath, nodeBuf, {
        contentType: validation.detectedMimeType || file.mimeType,
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
      mimeType: validation.detectedMimeType || file.mimeType,
      filename: file.filename,
      storagePath,
      contentHash: validation.contentHash
    };
  }

  public async deleteFile(fileUrlOrPath: string): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;

    let path = fileUrlOrPath;
    if (path.includes(`/${this.bucketName}/`)) {
      const parts = path.split(`/${this.bucketName}/`);
      path = parts[1]?.split('?')[0] || '';
    } else {
      const match = path.match(/path=([^&]+)/);
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

  /**
   * Recursively discovers all nested objects under `user/{userId}/` and purges them.
   * Architecture: user -> matters -> documents -> files
   */
  public async deleteUserFiles(userId: string): Promise<DeleteUserFilesResult> {
    const client = this.getClient();
    if (!client) {
      return { discovered: 0, deleted: 0, failed: 0, success: false };
    }

    try {
      const allPaths: string[] = [];
      const queue: string[] = [`user/${userId}`];

      while (queue.length > 0) {
        const currentPrefix = queue.shift()!;
        let offset = 0;
        const pageSize = 100;
        let hasMore = true;

        while (hasMore) {
          const { data: listData, error: listError } = await client.storage
            .from(this.bucketName)
            .list(currentPrefix, { limit: pageSize, offset });

          if (listError || !listData || listData.length === 0) {
            hasMore = false;
            break;
          }

          for (const item of listData) {
            const fullItemPath = `${currentPrefix}/${item.name}`;
            // In Supabase storage, folders have id === null or no metadata/mimetype
            if (item.id === null || !item.metadata) {
              queue.push(fullItemPath);
            } else {
              allPaths.push(fullItemPath);
            }
          }

          if (listData.length < pageSize) {
            hasMore = false;
          } else {
            offset += pageSize;
          }
        }
      }

      const discovered = allPaths.length;
      if (discovered === 0) {
        return { discovered: 0, deleted: 0, failed: 0, success: true };
      }

      // Batch removal (in chunks of 100)
      let deleted = 0;
      let failed = 0;
      const chunkSize = 100;

      for (let i = 0; i < allPaths.length; i += chunkSize) {
        const chunk = allPaths.slice(i, i + chunkSize);
        const { data: removeData, error: removeError } = await client.storage
          .from(this.bucketName)
          .remove(chunk);

        if (removeError) {
          failed += chunk.length;
        } else {
          deleted += removeData?.length || chunk.length;
        }
      }

      return {
        discovered,
        deleted,
        failed,
        success: failed === 0 && deleted === discovered
      };
    } catch {
      return { discovered: 0, deleted: 0, failed: 0, success: false };
    }
  }

  public async getSignedUrl(storagePath: string, expiresInSeconds: number = 3600): Promise<string | null> {
    const client = this.getClient();
    if (!client) return null;

    const { data, error } = await client.storage
      .from(this.bucketName)
      .createSignedUrl(storagePath, expiresInSeconds);

    return error ? null : (data?.signedUrl || null);
  }

  public async getFile(storagePath: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
    const client = this.getClient();
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

/**
 * Request-scoped storage provider factory.
 * If userToken is supplied, binds storage requests to authenticated user context.
 */
export function getStorageProvider(userToken?: string): IStorageProvider {
  if (userToken && isSupabaseConfigured()) {
    return new SupabaseStorageProvider(userToken);
  }
  if (activeStorageProvider) {
    return activeStorageProvider;
  }
  if (isSupabaseConfigured()) {
    return new SupabaseStorageProvider();
  }
  return new LocalStorageProvider();
}

export function setStorageProvider(provider: IStorageProvider): void {
  activeStorageProvider = provider;
}
