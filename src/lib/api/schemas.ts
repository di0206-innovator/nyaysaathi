import { z } from 'zod';

/**
 * Zod Schemas for Runtime API Validation across NyaySaathi
 */

export const MatterCategoryEnum = z.enum([
  'tenancy_housing',
  'consumer_dispute',
  'workplace_employment',
  'financial_cheque_bounce',
  'property_rera',
  'family_matrimonial',
  'cyber_fraud',
  'police_criminal_grievance',
  'other'
]);

export const PartySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Party name must have at least 2 characters'),
  role: z.enum(['individual_complainant', 'landlord', 'tenant', 'employer', 'employee', 'business_entity', 'bank_financial_inst', 'government_body', 'other']),
  contactInfo: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional()
});

export const MatterCreateSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long'),
  category: MatterCategoryEnum,
  userStory: z.string().min(15, 'User story must be at least 15 characters long'),
  claimAmount: z.number().positive().optional(),
  locationCity: z.string().min(2).optional(),
  locationState: z.string().min(2).optional(),
  parties: z.array(PartySchema).optional().default([]),
  acquisitionSource: z.string().optional().default('direct')
});

export const MatterPatchSchema = z.object({
  title: z.string().min(5).optional(),
  category: MatterCategoryEnum.optional(),
  status: z.enum(['intake', 'analyzing', 'action_required', 'pending_response', 'escalated', 'resolved', 'closed']).optional(),
  claimAmount: z.number().positive().nullable().optional(),
  locationCity: z.string().nullable().optional(),
  locationState: z.string().nullable().optional(),
  language: z.string().optional(),
  userStory: z.string().min(15).optional()
});

export const DocumentMetadataSchema = z.object({
  title: z.string().min(1, 'Document title is required'),
  type: z.enum(['lease_agreement', 'rent_receipt', 'legal_notice', 'email_communication', 'whatsapp_screenshot', 'bank_statement', 'police_complaint', 'other']),
  classification: z.string().optional(),
  relevanceSummary: z.string().optional()
});

export const ActionUpdateSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed', 'blocked', 'skipped']).optional(),
  notes: z.string().optional(),
  proofOfExecution: z.string().optional()
});

export const DeadlineSchema = z.object({
  title: z.string().min(3, 'Deadline title is required'),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'Due date must be YYYY-MM-DD format'),
  statutoryBasis: z.string().optional(),
  consequencesOfMissing: z.string().optional(),
  urgency: z.enum(['low', 'medium', 'high', 'critical']).optional().default('medium'),
  reminderDaysBefore: z.array(z.number()).optional().default([7, 3, 1])
});

export const CommunicationSchema = z.object({
  type: z.enum(['notice_sent', 'response_received', 'verbal_conversation', 'written_letter', 'portal_filing', 'phone_call', 'in_person_meeting']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'Date must be YYYY-MM-DD format'),
  recipient: z.string().min(2, 'Recipient is required'),
  sender: z.string().min(2, 'Sender is required'),
  summary: z.string().min(5, 'Summary must be at least 5 characters'),
  channel: z.enum(['email', 'speed_post', 'registered_post_ad', 'whatsapp', 'hand_delivery', 'in_person', 'portal']).optional().default('speed_post'),
  deliveryProofDocId: z.string().optional()
});

export const EscalationSchema = z.object({
  forumId: z.string().min(2, 'Forum identifier is required'),
  forumName: z.string().min(3, 'Forum name is required'),
  forumType: z.enum(['consumer_commission', 'rera_authority', 'rent_authority', 'labour_commissioner', 'civil_court', 'magistrate_court', 'ombudsman', 'police_grievance']),
  jurisdictionLevel: z.enum(['district', 'state', 'national']),
  filingPrerequisites: z.array(z.string()).optional().default([]),
  statutoryLimitationDays: z.number().positive().optional()
});

export const ResolutionSchema = z.object({
  outcome: z.enum(['settled_amicably', 'statutory_compliance_achieved', 'advocate_retained', 'matter_closed_unresolved', 'court_order_obtained', 'withdrawn_by_user']),
  resolvedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional(),
  summary: z.string().min(5, 'Resolution summary is required'),
  financialRecoveryAmount: z.number().nonnegative().optional(),
  learningsNotes: z.string().optional(),
  feedbackScore: z.number().int().min(1).max(5).optional()
});

export const FeedbackSchema = z.object({
  matterId: z.string().min(3, 'Matter ID is required'),
  rating: z.number().int().min(1).max(5),
  category: z.enum(['statute_accuracy', 'ocr_quality', 'action_usefulness', 'timeline_clarity', 'overall_experience']),
  notes: z.string().max(1000).optional(),
  advocateConsulted: z.boolean().optional().default(false)
});

export const NotificationSchema = z.object({
  matterId: z.string().min(3),
  userId: z.string().optional(),
  type: z.enum(['deadline_due', 'deadline_approaching', 'response_expected', 'action_blocked', 'analysis_completed', 'evidence_required', 'authority_update']),
  title: z.string().min(3),
  message: z.string().min(5),
  metadata: z.record(z.string(), z.unknown()).optional()
});

export const AnalyticsEventSchema = z.object({
  eventType: z.enum(['matter_created', 'document_uploaded', 'analysis_completed', 'action_completed', 'escalation_viewed', 'advocate_pack_downloaded', 'feedback_submitted']),
  matterId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional()
});

export const TranslationRequestSchema = z.object({
  targetLanguage: z.enum(['en', 'hi', 'bn', 'mr', 'te', 'ta', 'gu', 'kn', 'ml', 'pa']),
  fields: z.array(z.string()).optional()
});

export const NotificationPatchSchema = z.object({
  notificationId: z.string().min(3).optional(),
  markAllRead: z.boolean().optional()
}).refine(data => data.notificationId !== undefined || data.markAllRead === true, {
  message: 'Must provide notificationId or markAllRead: true'
});

export const DocumentCompareSchema = z.object({
  sourceDocumentId: z.string().min(1).optional(),
  baseDocumentId: z.string().min(1).optional(),
  targetDocumentId: z.string().min(1, 'Target document ID is required'),
  comparisonFocus: z.enum(['tenancy_clauses', 'liability_terms', 'financial_claims', 'notice_timelines', 'general']).optional().default('general'),
  comparisonType: z.enum(['agreement_vs_notice', 'clause_vs_statute', 'general_diff']).optional().default('agreement_vs_notice')
}).refine(data => Boolean(data.sourceDocumentId || data.baseDocumentId), {
  message: 'Must provide sourceDocumentId or baseDocumentId'
});

export async function parseRequestBody<T>(
  req: Request,
  schema: z.ZodType<T>
): Promise<{ success: true; data: T } | { success: false; error: string; issues: z.ZodIssue[] }> {
  try {
    const raw = await req.json();
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map(i => `${i.path.join('.') || 'root'}: ${i.message}`).join('; ');
      return { success: false, error: errorMsg, issues: parsed.error.issues };
    }
    return { success: true, data: parsed.data };
  } catch {
    return { success: false, error: 'Invalid JSON request payload', issues: [] };
  }
}

