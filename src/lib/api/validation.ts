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
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
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
      userId: b.userId ? String(b.userId).trim() : undefined
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

export function validateDocumentFile(file: {
  filename: string;
  mimeType: string;
  sizeBytes: number;
}): { isValid: boolean; error?: string } {
  if (!file.filename || file.filename.trim().length === 0) {
    return { isValid: false, error: 'Document filename is required.' };
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

  return { isValid: true };
}
