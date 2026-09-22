import { MatterCategory, Party, DocumentEvidence } from '@/types/matter';
import { ReanalysisTrigger } from '@/lib/agents/types';

export const VALID_CATEGORIES: MatterCategory[] = [
  'tenancy_housing',
  'consumer_dispute',
  'workplace_employment',
  'financial_cheque_bounce',
  'property_rera',
  'family_matrimonial',
  'cyber_fraud',
  'police_criminal_grievance',
  'other'
];

export const VALID_TRIGGERS: ReanalysisTrigger[] = [
  'full',
  'missing_info_answered',
  'doc_uploaded',
  'party_updated',
  'amount_updated'
];

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'text/plain'
];

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB


export interface CreateMatterInput {
  title: string;
  category: MatterCategory;
  userStory: string;
  claimAmount?: number;
  locationCity?: string;
  locationState?: string;
  parties?: Party[];
  documents?: DocumentEvidence[];
  userId?: string;
  acquisitionSource?: string;
}

export function validateCreateMatter(body: unknown): {
  isValid: boolean;
  errors: string[];
  data?: CreateMatterInput;
} {
  const errors: string[] = [];

  if (!body || typeof body !== 'object') {
    return { isValid: false, errors: ['Request body must be a valid JSON object.'] };
  }

  const b = body as Record<string, unknown>;

  // Title validation
  if (!b.title || typeof b.title !== 'string' || b.title.trim().length < 5) {
    errors.push('Title is required and must be at least 5 characters long.');
  }

  // Category validation
  if (!b.category || typeof b.category !== 'string' || !VALID_CATEGORIES.includes(b.category as MatterCategory)) {
    errors.push(`Invalid category: "${b.category}". Allowed: ${VALID_CATEGORIES.join(', ')}.`);
  }

  // User story narrative validation
  if (!b.userStory || typeof b.userStory !== 'string' || b.userStory.trim().length < 15) {
    errors.push('User story narrative is required and must describe the dispute in at least 15 characters.');
  }

  // Claim amount validation
  let claimAmount: number | undefined = undefined;
  if (b.claimAmount !== undefined && b.claimAmount !== null) {
    const num = Number(b.claimAmount);
    if (isNaN(num) || num < 0) {
      errors.push('Claim amount must be a positive number if provided.');
    } else {
      claimAmount = num;
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: [],
    data: {
      title: String(b.title).trim(),
      category: b.category as MatterCategory,
      userStory: String(b.userStory).trim(),
      claimAmount,
      locationCity: b.locationCity ? String(b.locationCity).trim() : undefined,
      locationState: b.locationState ? String(b.locationState).trim() : undefined,
      parties: Array.isArray(b.parties) ? (b.parties as Party[]) : [],
      documents: Array.isArray(b.documents) ? (b.documents as DocumentEvidence[]) : [],
      userId: b.userId ? String(b.userId).trim() : undefined,
      acquisitionSource: b.acquisitionSource ? String(b.acquisitionSource).trim() : 'direct'
    }
  };
}

export function validateAnalyzeTrigger(body: unknown): {
  isValid: boolean;
  error?: string;
  trigger: ReanalysisTrigger;
} {
  if (!body || typeof body !== 'object') {
    return { isValid: true, trigger: 'full' };
  }

  const b = body as Record<string, unknown>;
  if (!b.trigger) {
    return { isValid: true, trigger: 'full' };
  }

  if (!VALID_TRIGGERS.includes(b.trigger as ReanalysisTrigger)) {
    return {
      isValid: false,
      error: `Invalid trigger "${b.trigger}". Allowed: ${VALID_TRIGGERS.join(', ')}.`,
      trigger: 'full'
    };
  }

  return { isValid: true, trigger: b.trigger as ReanalysisTrigger };
}

export function detectFileSignature(buffer: Buffer | Uint8Array): string | null {
  if (!buffer || buffer.length < 4) return null;
  const b = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);

  // PDF signature: %PDF- (0x25 0x50 0x44 0x46 0x2D)
  if (b.length >= 5 && b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46 && b[4] === 0x2D) {
    return 'application/pdf';
  }

  // PNG signature: 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47) {
    return 'image/png';
  }

  // JPEG signature: 0xFF 0xD8 0xFF
  if (b.length >= 3 && b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF) {
    return 'image/jpeg';
  }

  // WebP signature: RIFF....WEBP
  if (
    b.length >= 12 &&
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  ) {
    return 'image/webp';
  }

  // Detect HTML or XML disguise
  const snippet = b.slice(0, 100).toString('utf-8').trim().toLowerCase();
  if (snippet.startsWith('<!doctype html') || snippet.startsWith('<html') || snippet.startsWith('<?xml')) {
    return 'text/html';
  }

  return null;
}

export function validateDocumentFile(file: {
  filename: string;
  mimeType: string;
  sizeBytes: number;
  buffer?: Buffer | ArrayBuffer | Uint8Array;
}): { isValid: boolean; error?: string } {
  if (!file.filename || file.filename.trim().length === 0) {
    return { isValid: false, error: 'Document filename is required.' };
  }

  const lowerName = file.filename.toLowerCase();
  if (lowerName.endsWith('.doc') || lowerName.endsWith('.docx')) {
    return {
      isValid: false,
      error: 'Word documents (.doc, .docx) are not supported for automated legal analysis. Please convert the agreement or notice to PDF before uploading.'
    };
  }

  if (file.sizeBytes <= 0) {
    return { isValid: false, error: 'Uploaded file is empty (0 bytes).' };
  }

  if (file.sizeBytes > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `File size exceeds 10MB limit (uploaded: ${(file.sizeBytes / (1024 * 1024)).toFixed(1)} MB).`
    };
  }

  const mime = file.mimeType.toLowerCase();
  const isAllowed = ALLOWED_MIME_TYPES.some(allowed => mime.startsWith(allowed) || allowed === mime);
  if (!isAllowed) {
    return {
      isValid: false,
      error: `Unsupported file type "${file.mimeType}". Allowed formats: PDF, PNG, JPEG, WEBP, Plain Text.`
    };
  }

  // Magic bytes / file signature validation if content buffer is supplied
  if (file.buffer) {
    const nodeBuf = Buffer.isBuffer(file.buffer)
      ? file.buffer
      : Buffer.from(file.buffer instanceof ArrayBuffer ? new Uint8Array(file.buffer) : file.buffer);

    const detected = detectFileSignature(nodeBuf);

    if (detected === 'text/html') {
      return {
        isValid: false,
        error: 'Invalid file content: Arbitrary HTML bytes detected in document. Renaming HTML to .pdf is rejected for security.'
      };
    }

    if ((mime === 'application/pdf' || lowerName.endsWith('.pdf')) && detected && detected !== 'application/pdf') {
      return {
        isValid: false,
        error: `Invalid PDF format: File declares PDF extension but signature matches ${detected}.`
      };
    }

    if ((mime === 'image/png' || lowerName.endsWith('.png')) && detected && detected !== 'image/png') {
      return {
        isValid: false,
        error: `Invalid PNG format: File declares PNG extension but signature matches ${detected}.`
      };
    }

    if ((mime.includes('jpeg') || lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) && detected && detected !== 'image/jpeg') {
      return {
        isValid: false,
        error: `Invalid JPEG format: File declares JPEG extension but signature matches ${detected}.`
      };
    }
  }

  return { isValid: true };
}

