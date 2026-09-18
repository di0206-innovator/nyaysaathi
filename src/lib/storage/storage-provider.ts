import { getSupabaseClient, isSupabaseConfigured } from '@/lib/db/supabase';

export interface StoredFile {
  fileUrl: string;
  fileSize: string;
  mimeType: string;
  filename: string;
}

export interface IStorageProvider {
  uploadFile(file: {
    buffer: Buffer | ArrayBuffer;
    filename: string;
    mimeType: string;
    matterId: string;
  }): Promise<StoredFile>;
  deleteFile(fileUrl: string): Promise<boolean>;
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

  public async uploadFile(file: {
    buffer: Buffer | ArrayBuffer;
    filename: string;
    mimeType: string;
    matterId: string;
  }): Promise<StoredFile> {
    const nodeBuf = Buffer.isBuffer(file.buffer) ? file.buffer : Buffer.from(file.buffer);
    const sizeStr = formatBytes(nodeBuf.byteLength);
    const safeFilename = `${Date.now()}-${file.filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storagePath = `matters/${file.matterId}/${safeFilename}`;

    this.files.set(storagePath, { buffer: nodeBuf, mimeType: file.mimeType });

    // In local dev, use an internal API/data URL route
    const fileUrl = `/api/documents/raw?path=${encodeURIComponent(storagePath)}`;

    return {
      fileUrl,
      fileSize: sizeStr,
      mimeType: file.mimeType,
      filename: file.filename
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
}

/**
 * Supabase Storage Provider for production bucket uploads.
 */
export class SupabaseStorageProvider implements IStorageProvider {
  private bucketName = 'evidence-documents';

  public async uploadFile(file: {
    buffer: Buffer | ArrayBuffer;
    filename: string;
    mimeType: string;
    matterId: string;
  }): Promise<StoredFile> {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client is not configured.');
    }

    const nodeBuf = Buffer.isBuffer(file.buffer) ? file.buffer : Buffer.from(file.buffer);
    const sizeStr = formatBytes(nodeBuf.byteLength);
    const safeFilename = `${Date.now()}-${file.filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storagePath = `${file.matterId}/${safeFilename}`;

    const { error } = await client.storage
      .from(this.bucketName)
      .upload(storagePath, nodeBuf, {
        contentType: file.mimeType,
        upsert: true
      });

    if (error) {
      throw new Error(`Supabase Storage upload failed: ${error.message}`);
    }

    const { data: publicUrlData } = client.storage
      .from(this.bucketName)
      .getPublicUrl(storagePath);

    return {
      fileUrl: publicUrlData.publicUrl,
      fileSize: sizeStr,
      mimeType: file.mimeType,
      filename: file.filename
    };
  }

  public async deleteFile(fileUrl: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    const parts = fileUrl.split(`/${this.bucketName}/`);
    if (parts.length < 2) return false;
    const path = parts[1];

    const { error } = await client.storage
      .from(this.bucketName)
      .remove([path]);

    return !error;
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
