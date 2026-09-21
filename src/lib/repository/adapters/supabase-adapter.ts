import { SupabaseClient } from '@supabase/supabase-js';
import {
  Matter,
  DocumentEvidence,
  TimelineEvent,
  RiskItem,
  LegalDraft,
  EvidenceGraphData,
  ActionStep,
  CommunicationRecord,
  MatterActivityEvent,
  MatterDeadline,
  EscalationWorkflowItem,
  MatterResolutionRecord,
  MatterNotification
} from '@/types/matter';
import {
  IStorageAdapter,
  IMatterRepository,
  IDocumentRepository,
  ITimelineRepository,
  IRiskRepository,
  IDraftRepository,
  IEvidenceGraphRepository,
  IActionRepository,
  ICommunicationRepository,
  IActivityEventRepository,
  IDeadlineRepository,
  IEscalationRepository,
  IResolutionRepository,
  INotificationRepository,
  IPilotFeedbackRepository,
  PilotFeedback,
  MatterFilter
} from '../types';

export class SupabaseStorageAdapter implements IStorageAdapter {
  private client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  public matters: IMatterRepository = {
    create: async (matter: Matter): Promise<Matter> => {
      // 1. Insert core matter
      const { error: matterErr } = await this.client.from('matters').insert({
        id: matter.id,
        user_id: matter.userId || null,
        title: matter.title,
        category: matter.category,
        sub_category: matter.subCategory,
        status: matter.status,
        claim_amount: matter.claimAmount || null,
        location_city: matter.locationCity || null,
        location_state: matter.locationState || null,
        user_story: matter.userStory,
        summary_plain: matter.summary?.plainLanguage || null,
        summary_conflict: matter.summary?.keyConflict || null,
        summary_legal_nature: matter.summary?.legalNature || null,
        language: matter.language || 'en',
        created_at: matter.createdAt,
        updated_at: matter.updatedAt
      });

      if (matterErr) throw new Error(`Supabase insert matter failed: ${matterErr.message}`);

      // 2. Insert parties
      if (matter.parties && matter.parties.length > 0) {
        const partyRows = matter.parties.map(p => ({
          id: p.id,
          matter_id: matter.id,
          name: p.name,
          role: p.role,
          contact_info: p.contactInfo || null,
          address: p.address || null,
          city: p.city || null,
          state: p.state || null
        }));
        await this.client.from('parties').insert(partyRows);
      }

      // 3. Insert documents
      if (matter.documents && matter.documents.length > 0) {
        const docRows = matter.documents.map(d => ({
          id: d.id,
          matter_id: matter.id,
          title: d.title,
          type: d.type,
          file_url: d.fileUrl || null,
          file_size: d.fileSize || null,
          extracted_text: d.extractedText || null,
          classification: d.classification || null,
          confidence_score: d.confidenceScore || 0.95,
          relevance_summary: d.relevanceSummary || null,
          status: d.status || 'verified'
        }));
        await this.client.from('documents').insert(docRows);
      }

      // 4. Insert facts
      if (matter.facts && matter.facts.length > 0) {
        const factRows = matter.facts.map(f => ({
          id: f.id,
          matter_id: matter.id,
          statement: f.statement,
          category: f.category,
          source_doc_id: f.sourceDocId || null,
          verified: f.verified ?? true,
          tier: f.tier || 'fact',
          confidence: f.confidence || 0.9,
          grounding_ref_ids: f.groundingRefIds || []
        }));
        await this.client.from('facts').insert(factRows);
      }

      // 5. Insert timeline events
      if (matter.timelineEvents && matter.timelineEvents.length > 0) {
        const timelineRows = matter.timelineEvents.map(t => ({
          id: t.id,
          matter_id: matter.id,
          date: t.date,
          title: t.title,
          description: t.description,
          evidence_doc_id: t.evidenceDocId || null,
          evidence_title: t.evidenceTitle || null,
          is_key_milestone: t.isKeyMilestone || false,
          status: t.status || 'verified',
          grounding_status: t.groundingStatus || 'grounded',
          grounding_ref_ids: t.groundingRefIds || []
        }));
        await this.client.from('timeline_events').insert(timelineRows);
      }

      // 6. Insert risks
      if (matter.risks && matter.risks.length > 0) {
        const riskRows = matter.risks.map(r => ({
          id: r.id,
          matter_id: matter.id,
          title: r.title,
          severity: r.severity,
          description: r.description,
          mitigating_action: r.mitigatingAction,
          legal_context: r.legalContext || null,
          limitation_info: r.limitationPeriodInfo || null,
          grounding_status: r.groundingStatus || 'grounded',
          grounding_ref_ids: r.groundingRefIds || []
        }));
        await this.client.from('risks').insert(riskRows);
      }

      // 7. Insert missing information
      if (matter.missingInformation && matter.missingInformation.length > 0) {
        const missingRows = matter.missingInformation.map(m => ({
          id: m.id,
          matter_id: matter.id,
          question: m.question,
          why_it_matters: m.whyItMatters,
          impact_on_outcome: m.impactOnOutcome,
          recommended_doc_type: m.suggestedSource || null,
          is_answered: m.isAnswered || false,
          answer: m.answer || null
        }));
        await this.client.from('missing_information').insert(missingRows);
      }

      // 8. Insert action steps
      if (matter.actionPlan && matter.actionPlan.length > 0) {
        const actionRows = matter.actionPlan.map(a => ({
          id: a.id,
          matter_id: matter.id,
          title: a.title,
          phase: a.phase,
          description: a.description,
          estimated_turnaround: a.estimatedTurnaround || null,
          status: a.status || 'pending',
          priority: a.priority || 'recommended',
          associated_draft_type: a.associatedDraftType || null,
          grounding_status: a.groundingStatus || 'grounded',
          grounding_ref_ids: a.groundingRefIds || []
        }));
        await this.client.from('action_steps').insert(actionRows);
      }

      // 9. Insert drafts
      if (matter.drafts && matter.drafts.length > 0) {
        const draftRows = matter.drafts.map(d => ({
          id: d.id,
          matter_id: matter.id,
          type: d.type,
          communication_tier: d.communicationTier,
          title: d.title,
          recipient_name: d.recipientName,
          recipient_address: d.recipientAddress || null,
          subject: d.subject,
          content: d.content,
          disclaimer: d.disclaimer || null,
          paragraphs: d.paragraphs || [],
          requires_advocate_review: d.requiresAdvocateReview || false,
          audit_log: d.auditLog || [],
          grounding_status: d.groundingStatus || 'grounded',
          grounding_ref_ids: d.groundingRefIds || []
        }));
        await this.client.from('drafts').insert(draftRows);
      }

      // 10. Insert lawyer brief
      if (matter.lawyerBrief) {
        const lb = matter.lawyerBrief;
        await this.client.from('lawyer_briefs').upsert({
          id: lb.id,
          matter_id: matter.id,
          executive_summary: lb.executiveSummary,
          key_chronology: lb.keyChronology || [],
          legal_issues_identified: lb.legalIssuesIdentified || [],
          statutory_references: lb.statutoryReferences || [],
          relief_sought: lb.reliefSought || [],
          evidentiary_readiness: lb.evidentiaryReadiness || null,
          estimated_claim_amount: lb.estimatedClaimAmount || null,
          jurisdiction_state: lb.jurisdictionState || null,
          grounding_status: lb.groundingStatus || 'grounded',
          grounding_ref_ids: lb.groundingRefIds || []
        });
      }

      // 11. Insert escalation routes
      if (matter.escalationRoutes && matter.escalationRoutes.length > 0) {
        const escRows = matter.escalationRoutes.map(e => ({
          id: e.id,
          matter_id: matter.id,
          name: e.name,
          type: e.type,
          description: e.description,
          criteria_met: e.criteriaMet,
          eligibility_description: e.eligibilityDescription || null,
          matching_reason: e.matchingReason || null,
          official_portal_url: e.officialPortalUrl || null,
          toll_free_number: e.tollFreeNumber || null,
          steps_to_apply: e.stepsToApply || [],
          cost_estimate: e.costEstimate || null,
          grounding_status: e.groundingStatus || 'grounded',
          grounding_ref_ids: e.groundingRefIds || []
        }));
        await this.client.from('escalation_routes').insert(escRows);
      }

      // 12. Insert trust safety items
      if (matter.trustSafetyItems && matter.trustSafetyItems.length > 0) {
        const tsRows = matter.trustSafetyItems.map(t => ({
          matter_id: matter.id,
          tier: t.tier,
          label: t.label,
          detail: t.text || '',
          confidence: t.confidenceScore || 0.9,
          grounding_ref_ids: t.groundingRefIds || [],
          grounding_status: t.groundingStatus || 'grounded'
        }));
        await this.client.from('trust_safety_items').insert(tsRows);
      }

      // 13. Insert evidence graph
      if (matter.evidenceGraph) {
        await this.client.from('evidence_graphs').upsert({
          matter_id: matter.id,
          nodes: matter.evidenceGraph.nodes || [],
          edges: matter.evidenceGraph.edges || [],
          updated_at: matter.evidenceGraph.updatedAt || new Date().toISOString()
        });
      }

      // 14. Insert audit logs
      if (matter.auditLog && matter.auditLog.length > 0) {
        const auditRows = matter.auditLog.map(a => ({
          matter_id: matter.id,
          original: a.original,
          rewritten: a.rewritten,
          reason: a.reason,
          component: a.component || 'AI Safety'
        }));
        await this.client.from('audit_logs').insert(auditRows);
      }

      // 15. Insert matter_actions (Phase 7 normalized)
      if (matter.actionPlan && matter.actionPlan.length > 0) {
        const actionRows = matter.actionPlan.map(a => ({
          matter_id: matter.id,
          title: a.title,
          phase: a.phase,
          description: a.description,
          estimated_turnaround: a.estimatedTurnaround || null,
          status: a.status,
          priority: a.priority,
          associated_draft_type: a.associatedDraftType || null,
          due_date: a.dueDate ? new Date(a.dueDate).toISOString() : null,
          completed_at: a.completedAt ? new Date(a.completedAt).toISOString() : null,
          notes: a.notes || null,
          blocking_reason: a.blockingReason || null,
          completion_proof: a.completionProof ? a.completionProof : null,
          result: a.result || null,
          grounding_status: a.groundingStatus || 'grounded'
        }));
        await this.client.from('matter_actions').insert(actionRows);
      }

      // 16. Insert matter_communications
      if (matter.communications && matter.communications.length > 0) {
        const commRows = matter.communications.map(c => ({
          matter_id: matter.id,
          type: c.type,
          direction: c.direction,
          date: c.date ? new Date(c.date).toISOString() : new Date().toISOString(),
          counterparty: c.counterparty,
          summary: c.summary,
          reference_number: c.referenceNumber || null,
          response_expected_by: c.responseExpectedBy ? new Date(c.responseExpectedBy).toISOString() : null,
          status: c.status,
          outcome_notes: c.outcomeNotes || null
        }));
        await this.client.from('matter_communications').insert(commRows);
      }

      // 17. Insert matter_activity_events
      if (matter.activityEvents && matter.activityEvents.length > 0) {
        const eventRows = matter.activityEvents.map(e => ({
          matter_id: matter.id,
          type: e.type,
          source: e.source,
          title: e.title,
          date: e.date ? new Date(e.date).toISOString() : new Date().toISOString(),
          description: e.description,
          reference_id: e.referenceId || null,
          metadata: e.metadata || {}
        }));
        await this.client.from('matter_activity_events').insert(eventRows);
      }

      // 18. Insert matter_deadlines
      if (matter.deadlines && matter.deadlines.length > 0) {
        const deadlineRows = matter.deadlines.map(d => ({
          matter_id: matter.id,
          title: d.title,
          description: d.description || null,
          due_date: new Date(d.dueDate).toISOString(),
          type: d.type,
          is_statutory: d.isStatutory ?? false,
          is_user_defined: d.isUserDefined ?? false,
          confidence: d.confidence || 0.85,
          trust_tier: d.trustTier || 'explanation',
          status: d.status,
          statute_reference: d.statuteReference || null
        }));
        await this.client.from('matter_deadlines').insert(deadlineRows);
      }

      // 19. Insert matter_escalations
      if (matter.escalationWorkflows && matter.escalationWorkflows.length > 0) {
        const escRows = matter.escalationWorkflows.map(e => ({
          matter_id: matter.id,
          route_id: e.routeId,
          authority_name: e.authorityName,
          status: e.status,
          requirements: e.requirements || [],
          documents_required: e.documentsRequired || [],
          submission_method: e.submissionMethod || 'online_portal',
          official_portal: e.officialPortal || null,
          reference_number: e.referenceNumber || null,
          submitted_at: e.submittedAt ? new Date(e.submittedAt).toISOString() : null,
          next_step: e.nextStep || null,
          notes: e.notes || null
        }));
        await this.client.from('matter_escalations').insert(escRows);
      }

      // 20. Insert matter_resolutions
      if (matter.resolution) {
        await this.client.from('matter_resolutions').insert({
          matter_id: matter.id,
          resolved_at: new Date(matter.resolution.resolvedAt).toISOString(),
          resolution_type: matter.resolution.resolutionType,
          outcome: matter.resolution.outcome,
          amount_recovered: matter.resolution.amountRecovered || null,
          amount_disputed: matter.resolution.amountDisputed || null,
          notes: matter.resolution.notes || null,
          is_reopened: matter.resolution.isReopened ?? false,
          reopened_at: matter.resolution.reopenedAt ? new Date(matter.resolution.reopenedAt).toISOString() : null,
          reopened_reason: matter.resolution.reopenedReason || null,
          reopened_by: matter.resolution.reopenedBy || null
        });
      }

      return matter;
    },

    findById: async (id: string, userId?: string): Promise<Matter | null> => {
      let query = this.client.from('matters').select('*').eq('id', id).single();
      if (userId) {
        query = this.client.from('matters').select('*').eq('id', id).eq('user_id', userId).single();
      }

      const { data: matterRow, error } = await query;
      if (error || !matterRow) return null;

      // Fetch related records in parallel, including Phase 7 normalized tables
      const [
        { data: parties },
        { data: docs },
        { data: facts },
        { data: timeline },
        { data: risks },
        { data: missingInfo },
        { data: actions },
        { data: drafts },
        { data: lawyerBrief },
        { data: escalations },
        { data: trustItems },
        { data: evidenceGraph },
        { data: auditLogs },
        { data: matterActions },
        { data: matterComms },
        { data: matterEvents },
        { data: matterDeadlines },
        { data: matterEscalations },
        { data: matterResolution },
        { data: matterNotifications }
      ] = await Promise.all([
        this.client.from('parties').select('*').eq('matter_id', id),
        this.client.from('documents').select('*').eq('matter_id', id),
        this.client.from('facts').select('*').eq('matter_id', id),
        this.client.from('timeline_events').select('*').eq('matter_id', id),
        this.client.from('risks').select('*').eq('matter_id', id),
        this.client.from('missing_information').select('*').eq('matter_id', id),
        this.client.from('action_steps').select('*').eq('matter_id', id),
        this.client.from('drafts').select('*').eq('matter_id', id),
        this.client.from('lawyer_briefs').select('*').eq('matter_id', id).maybeSingle(),
        this.client.from('escalation_routes').select('*').eq('matter_id', id),
        this.client.from('trust_safety_items').select('*').eq('matter_id', id),
        this.client.from('evidence_graphs').select('*').eq('matter_id', id).maybeSingle(),
        this.client.from('audit_logs').select('*').eq('matter_id', id),
        this.client.from('matter_actions').select('*').eq('matter_id', id),
        this.client.from('matter_communications').select('*').eq('matter_id', id).order('created_at', { ascending: false }),
        this.client.from('matter_activity_events').select('*').eq('matter_id', id).order('created_at', { ascending: false }),
        this.client.from('matter_deadlines').select('*').eq('matter_id', id),
        this.client.from('matter_escalations').select('*').eq('matter_id', id),
        this.client.from('matter_resolutions').select('*').eq('matter_id', id).maybeSingle(),
        this.client.from('matter_notifications').select('*').eq('matter_id', id).order('created_at', { ascending: false })
      ]);

      const constructed: Matter = {
        id: matterRow.id,
        userId: matterRow.user_id || undefined,
        title: matterRow.title,
        category: matterRow.category,
        subCategory: matterRow.sub_category || '',
        status: matterRow.status,
        createdAt: matterRow.created_at,
        updatedAt: matterRow.updated_at,
        locationCity: matterRow.location_city || undefined,
        locationState: matterRow.location_state || undefined,
        claimAmount: matterRow.claim_amount ? Number(matterRow.claim_amount) : undefined,
        userStory: matterRow.user_story,
        summary: {
          plainLanguage: matterRow.summary_plain || '',
          keyConflict: matterRow.summary_conflict || '',
          legalNature: matterRow.summary_legal_nature || ''
        },
        parties: (parties || []).map(p => ({
          id: p.id,
          name: p.name,
          role: p.role,
          contactInfo: p.contact_info || undefined,
          address: p.address || undefined,
          city: p.city || undefined,
          state: p.state || undefined
        })),
        documents: (docs || []).map(d => ({
          id: d.id,
          title: d.title,
          type: d.type,
          fileUrl: d.file_url || undefined,
          storagePath: d.storage_path || d.file_url || undefined,
          fileSize: d.file_size || undefined,
          uploadedAt: d.created_at,
          extractedText: d.extracted_text || undefined,
          classification: d.classification || undefined,
          confidenceScore: d.confidence_score ? Number(d.confidence_score) : 0.95,
          extractionStatus: d.extraction_status || undefined,
          relevanceSummary: d.relevance_summary || undefined,
          status: d.status
        })),
        facts: (facts || []).map(f => ({
          id: f.id,
          statement: f.statement,
          category: f.category,
          sourceDocId: f.source_doc_id || undefined,
          verified: f.verified,
          tier: f.tier,
          confidence: f.confidence ? Number(f.confidence) : 0.9,
          groundingRefIds: f.grounding_ref_ids || []
        })),
        timelineEvents: (timeline || []).map(t => ({
          id: t.id,
          date: t.date,
          title: t.title,
          description: t.description,
          evidenceDocId: t.evidence_doc_id || undefined,
          evidenceTitle: t.evidence_title || undefined,
          isKeyMilestone: t.is_key_milestone,
          status: t.status,
          groundingStatus: t.grounding_status || 'grounded',
          groundingRefIds: t.grounding_ref_ids || []
        })),
        risks: (risks || []).map(r => ({
          id: r.id,
          title: r.title,
          severity: r.severity,
          description: r.description,
          mitigatingAction: r.mitigating_action,
          legalContext: r.legal_context || '',
          limitationPeriodInfo: r.limitation_info || undefined,
          groundingStatus: r.grounding_status || 'grounded',
          groundingRefIds: r.grounding_ref_ids || []
        })),
        missingInformation: (missingInfo || []).map(m => ({
          id: m.id,
          question: m.question,
          whyItMatters: m.why_it_matters,
          impactOnOutcome: m.impact_on_outcome,
          suggestedSource: m.recommended_doc_type || 'User Records',
          isAnswered: m.is_answered,
          answer: m.answer || undefined
        })),
        actionPlan: (matterActions && matterActions.length > 0)
          ? matterActions.map(a => ({
              id: a.id,
              title: a.title,
              phase: a.phase,
              description: a.description,
              estimatedTurnaround: a.estimated_turnaround || undefined,
              status: a.status,
              priority: a.priority,
              associatedDraftType: a.associated_draft_type || undefined,
              dueDate: a.due_date || undefined,
              completedAt: a.completed_at || undefined,
              evidenceRequired: a.evidence_required || false,
              notes: a.notes || undefined,
              blockingReason: a.blocking_reason || undefined,
              completionProof: a.completion_proof || undefined,
              result: a.result || undefined,
              groundingStatus: a.grounding_status || 'grounded',
              groundingRefIds: []
            }))
          : (actions || []).map(a => ({
              id: a.id,
              title: a.title,
              phase: a.phase,
              description: a.description,
              estimatedTurnaround: a.estimated_turnaround || undefined,
              status: a.status,
              priority: a.priority,
              associatedDraftType: a.associated_draft_type || undefined,
              groundingStatus: a.grounding_status || 'grounded',
              groundingRefIds: a.grounding_ref_ids || []
            })),
        drafts: (drafts || []).map(d => ({
          id: d.id,
          matterId: id,
          type: d.type,
          communicationTier: d.communication_tier,
          title: d.title,
          recipientName: d.recipient_name,
          recipientAddress: d.recipient_address || undefined,
          subject: d.subject,
          content: d.content,
          disclaimer: d.disclaimer || 'Draft prepared for review by user or advocate.',
          createdAt: d.created_at || new Date().toISOString(),
          status: (d.status as 'draft' | 'customized' | 'ready_to_send') || 'draft',
          paragraphs: d.paragraphs || [],
          requiresAdvocateReview: d.requires_advocate_review,
          auditLog: d.audit_log || [],
          groundingStatus: d.grounding_status || 'grounded',
          groundingRefIds: d.grounding_ref_ids || []
        })),
        lawyerBrief: lawyerBrief ? {
          id: lawyerBrief.id,
          matterId: id,
          executiveSummary: lawyerBrief.executive_summary,
          keyChronology: lawyerBrief.key_chronology || [],
          legalIssuesIdentified: lawyerBrief.legal_issues_identified || [],
          statutoryReferences: lawyerBrief.statutory_references || [],
          reliefSought: lawyerBrief.relief_sought || [],
          evidentiaryReadiness: lawyerBrief.evidentiary_readiness || { strongProof: [], gapsOrMissingProof: [] },
          estimatedClaimAmount: lawyerBrief.estimated_claim_amount || undefined,
          jurisdictionState: lawyerBrief.jurisdiction_state || undefined,
          generatedAt: lawyerBrief.generated_at,
          groundingStatus: lawyerBrief.grounding_status || 'grounded',
          groundingRefIds: lawyerBrief.grounding_ref_ids || []
        } : undefined,
        escalationRoutes: (escalations || []).map(e => ({
          id: e.id,
          name: e.name,
          type: e.type,
          description: e.description,
          criteriaMet: e.criteria_met,
          eligibilityDescription: e.eligibility_description || undefined,
          matchingReason: e.matching_reason || undefined,
          officialPortalUrl: e.official_portal_url || undefined,
          tollFreeNumber: e.toll_free_number || undefined,
          stepsToApply: e.steps_to_apply || [],
          costEstimate: e.cost_estimate || undefined,
          groundingStatus: e.grounding_status || 'grounded',
          groundingRefIds: e.grounding_ref_ids || []
        })),
        trustSafetyItems: (trustItems || []).map(t => ({
          tier: t.tier,
          label: t.label,
          text: t.detail || t.text || '',
          confidenceScore: t.confidence ? Number(t.confidence) : 0.9,
          groundingRefIds: t.grounding_ref_ids || [],
          groundingStatus: t.grounding_status || 'grounded'
        })),
        evidenceGraph: evidenceGraph ? {
          nodes: evidenceGraph.nodes || [],
          edges: evidenceGraph.edges || [],
          updatedAt: evidenceGraph.updated_at
        } : undefined,
        auditLog: (auditLogs || []).map(a => ({
          original: a.original,
          rewritten: a.rewritten,
          reason: a.reason,
          component: a.component || 'AI Safety',
          timestamp: a.created_at
        })),
        communications: (matterComms || []).map(c => ({
          id: c.id,
          matterId: id,
          type: c.type,
          direction: c.direction,
          date: c.date,
          counterparty: c.counterparty,
          summary: c.summary,
          referenceNumber: c.reference_number || undefined,
          responseExpectedBy: c.response_expected_by || undefined,
          status: c.status,
          outcomeNotes: c.outcome_notes || undefined,
          createdAt: c.created_at
        })),
        activityEvents: (matterEvents || []).map(e => ({
          id: e.id,
          matterId: id,
          type: e.type,
          source: e.source,
          title: e.title,
          date: e.date,
          description: e.description,
          referenceId: e.reference_id || undefined,
          metadata: e.metadata || undefined
        })),
        deadlines: (matterDeadlines || []).map(d => ({
          id: d.id,
          matterId: id,
          title: d.title,
          description: d.description || undefined,
          dueDate: d.due_date,
          type: d.type,
          isStatutory: d.is_statutory,
          isUserDefined: d.is_user_defined,
          confidence: d.confidence ? Number(d.confidence) : 0.85,
          trustTier: d.trust_tier,
          relatedActionId: d.related_action_id || undefined,
          relatedEventId: d.related_event_id || undefined,
          status: d.status,
          statuteReference: d.statute_reference || undefined
        })),
        escalationWorkflows: (matterEscalations || []).map(e => ({
          id: e.id,
          matterId: id,
          routeId: e.route_id,
          authorityName: e.authority_name,
          status: e.status,
          requirements: e.requirements || [],
          documentsRequired: e.documents_required || [],
          optionalDocuments: e.optional_documents || [],
          submissionMethod: e.submission_method,
          officialPortal: e.official_portal || undefined,
          referenceNumber: e.reference_number || undefined,
          submittedAt: e.submitted_at || undefined,
          acknowledgedAt: e.acknowledged_at || undefined,
          nextStep: e.next_step || undefined,
          notes: e.notes || undefined
        })),
        resolution: matterResolution ? {
          resolvedAt: matterResolution.resolved_at,
          resolutionType: matterResolution.resolution_type,
          outcome: matterResolution.outcome,
          amountRecovered: matterResolution.amount_recovered ? Number(matterResolution.amount_recovered) : undefined,
          amountDisputed: matterResolution.amount_disputed ? Number(matterResolution.amount_disputed) : undefined,
          notes: matterResolution.notes || undefined,
          isReopened: matterResolution.is_reopened,
          reopenedAt: matterResolution.reopened_at || undefined,
          reopenedReason: matterResolution.reopened_reason || undefined,
          reopenedBy: matterResolution.reopened_by || undefined
        } : undefined,
        notifications: (matterNotifications || []).map(n => ({
          id: n.id,
          matterId: id,
          userId: n.user_id || undefined,
          type: n.type,
          title: n.title,
          message: n.message,
          channel: n.channel,
          isRead: n.is_read,
          createdAt: n.created_at,
          metadata: n.metadata || undefined
        })),
        language: matterRow.language || 'en'
      };

      return constructed;
    },

    list: async (filter?: MatterFilter): Promise<Matter[]> => {
      let query = this.client.from('matters').select('*').order('created_at', { ascending: false });

      if (filter) {
        if (filter.userId) query = query.eq('user_id', filter.userId);
        if (filter.category) query = query.eq('category', filter.category);
        if (filter.status) query = query.eq('status', filter.status);
        if (filter.search) {
          query = query.or(`title.ilike.%${filter.search}%,user_story.ilike.%${filter.search}%`);
        }
      }

      const { data, error } = await query;
      if (error || !data) return [];

      return data.map(m => ({
        id: m.id,
        userId: m.user_id || undefined,
        title: m.title,
        category: m.category,
        subCategory: m.sub_category || '',
        status: m.status,
        createdAt: m.created_at,
        updatedAt: m.updated_at,
        locationCity: m.location_city || undefined,
        locationState: m.location_state || undefined,
        claimAmount: m.claim_amount ? Number(m.claim_amount) : undefined,
        userStory: m.user_story,
        summary: {
          plainLanguage: m.summary_plain || '',
          keyConflict: m.summary_conflict || '',
          legalNature: m.summary_legal_nature || ''
        },
        parties: [],
        documents: [],
        facts: [],
        timelineEvents: [],
        risks: [],
        missingInformation: [],
        actionPlan: [],
        drafts: [],
        escalationRoutes: [],
        trustSafetyItems: [],
        language: m.language || 'en'
      }));
    },

    update: async (id: string, updates: Partial<Matter>, userId?: string): Promise<Matter | null> => {
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString()
      };

      if (updates.title) updateData.title = updates.title;
      if (updates.category) updateData.category = updates.category;
      if (updates.subCategory) updateData.sub_category = updates.subCategory;
      if (updates.status) updateData.status = updates.status;
      if (updates.claimAmount !== undefined) updateData.claim_amount = updates.claimAmount;
      if (updates.locationCity !== undefined) updateData.location_city = updates.locationCity;
      if (updates.locationState !== undefined) updateData.location_state = updates.locationState;
      if (updates.userStory) updateData.user_story = updates.userStory;
      if (updates.summary) {
        updateData.summary_plain = updates.summary.plainLanguage;
        updateData.summary_conflict = updates.summary.keyConflict;
        updateData.summary_legal_nature = updates.summary.legalNature;
      }
      if (updates.language) updateData.language = updates.language;

      let query = this.client.from('matters').update(updateData).eq('id', id);
      if (userId) query = query.eq('user_id', userId);

      const { error } = await query;
      if (error) throw new Error(`Supabase update matter failed: ${error.message}`);

      // If updating complex arrays, sync them as well
      if (updates.documents) {
        await this.client.from('documents').delete().eq('matter_id', id);
        const docRows = updates.documents.map(d => ({
          id: d.id,
          matter_id: id,
          title: d.title,
          type: d.type,
          file_url: d.fileUrl || null,
          file_size: d.fileSize || null,
          extracted_text: d.extractedText || null,
          classification: d.classification || null,
          confidence_score: d.confidenceScore || 0.95,
          relevance_summary: d.relevanceSummary || null,
          status: d.status || 'verified'
        }));
        if (docRows.length > 0) await this.client.from('documents').insert(docRows);
      }

      if (updates.missingInformation) {
        await this.client.from('missing_information').delete().eq('matter_id', id);
        const missingRows = updates.missingInformation.map(m => ({
          id: m.id,
          matter_id: id,
          question: m.question,
          why_it_matters: m.whyItMatters,
          impact_on_outcome: m.impactOnOutcome,
          recommended_doc_type: m.suggestedSource || null,
          is_answered: m.isAnswered || false,
          answer: m.answer || null
        }));
        if (missingRows.length > 0) await this.client.from('missing_information').insert(missingRows);
      }

      return this.matters.findById(id, userId);
    },

    delete: async (id: string, userId?: string): Promise<boolean> => {
      let query = this.client.from('matters').delete().eq('id', id);
      if (userId) query = query.eq('user_id', userId);
      const { error } = await query;
      return !error;
    }
  };

  public documents: IDocumentRepository = {
    add: async (matterId: string, doc: DocumentEvidence): Promise<DocumentEvidence> => {
      const { error } = await this.client.from('documents').insert({
        id: doc.id,
        matter_id: matterId,
        title: doc.title,
        type: doc.type,
        file_url: doc.fileUrl || null,
        file_size: doc.fileSize || null,
        extracted_text: doc.extractedText || null,
        classification: doc.classification || null,
        confidence_score: doc.confidenceScore || 0.95,
        relevance_summary: doc.relevanceSummary || null,
        status: doc.status || 'verified'
      });
      if (error) throw new Error(`Supabase add document failed: ${error.message}`);
      return doc;
    },

    listByMatter: async (matterId: string): Promise<DocumentEvidence[]> => {
      const { data, error } = await this.client.from('documents').select('*').eq('matter_id', matterId);
      if (error || !data) return [];
      return data.map(d => ({
        id: d.id,
        title: d.title,
        type: d.type,
        fileUrl: d.file_url || undefined,
        fileSize: d.file_size || undefined,
        uploadedAt: d.created_at,
        extractedText: d.extracted_text || undefined,
        classification: d.classification || undefined,
        confidenceScore: d.confidence_score ? Number(d.confidence_score) : 0.95,
        relevanceSummary: d.relevance_summary || undefined,
        status: d.status
      }));
    },

    findById: async (matterId: string, docId: string): Promise<DocumentEvidence | null> => {
      const { data, error } = await this.client.from('documents')
        .select('*')
        .eq('matter_id', matterId)
        .eq('id', docId)
        .single();
      if (error || !data) return null;
      return {
        id: data.id,
        title: data.title,
        type: data.type,
        fileUrl: data.file_url || undefined,
        fileSize: data.file_size || undefined,
        uploadedAt: data.created_at,
        extractedText: data.extracted_text || undefined,
        classification: data.classification || undefined,
        confidenceScore: data.confidence_score ? Number(data.confidence_score) : 0.95,
        relevanceSummary: data.relevance_summary || undefined,
        status: data.status
      };
    },

    update: async (matterId: string, docId: string, updates: Partial<DocumentEvidence>): Promise<DocumentEvidence | null> => {
      const updateData: Record<string, unknown> = {};
      if (updates.title) updateData.title = updates.title;
      if (updates.extractedText) updateData.extracted_text = updates.extractedText;
      if (updates.status) updateData.status = updates.status;
      if (updates.relevanceSummary) updateData.relevance_summary = updates.relevanceSummary;

      const { error } = await this.client.from('documents')
        .update(updateData)
        .eq('matter_id', matterId)
        .eq('id', docId);

      if (error) return null;
      return this.documents.findById(matterId, docId);
    },

    delete: async (matterId: string, docId: string): Promise<boolean> => {
      const { error } = await this.client.from('documents')
        .delete()
        .eq('matter_id', matterId)
        .eq('id', docId);
      return !error;
    }
  };

  public timelines: ITimelineRepository = {
    listByMatter: async (matterId: string): Promise<TimelineEvent[]> => {
      const { data } = await this.client.from('timeline_events').select('*').eq('matter_id', matterId);
      return (data || []).map(t => ({
        id: t.id,
        date: t.date,
        title: t.title,
        description: t.description,
        evidenceDocId: t.evidence_doc_id || undefined,
        evidenceTitle: t.evidence_title || undefined,
        isKeyMilestone: t.is_key_milestone,
        status: t.status,
        groundingStatus: t.grounding_status || 'grounded',
        groundingRefIds: t.grounding_ref_ids || []
      }));
    },

    add: async (matterId: string, event: TimelineEvent): Promise<TimelineEvent> => {
      await this.client.from('timeline_events').insert({
        id: event.id,
        matter_id: matterId,
        date: event.date,
        title: event.title,
        description: event.description,
        evidence_doc_id: event.evidenceDocId || null,
        evidence_title: event.evidenceTitle || null,
        is_key_milestone: event.isKeyMilestone || false,
        status: event.status || 'verified',
        grounding_status: event.groundingStatus || 'grounded',
        grounding_ref_ids: event.groundingRefIds || []
      });
      return event;
    },

    replace: async (matterId: string, events: TimelineEvent[]): Promise<TimelineEvent[]> => {
      await this.client.from('timeline_events').delete().eq('matter_id', matterId);
      if (events.length > 0) {
        const rows = events.map(t => ({
          id: t.id,
          matter_id: matterId,
          date: t.date,
          title: t.title,
          description: t.description,
          evidence_doc_id: t.evidenceDocId || null,
          evidence_title: t.evidenceTitle || null,
          is_key_milestone: t.isKeyMilestone || false,
          status: t.status || 'verified',
          grounding_status: t.groundingStatus || 'grounded',
          grounding_ref_ids: t.groundingRefIds || []
        }));
        await this.client.from('timeline_events').insert(rows);
      }
      return events;
    }
  };

  public risks: IRiskRepository = {
    listByMatter: async (matterId: string): Promise<RiskItem[]> => {
      const { data } = await this.client.from('risks').select('*').eq('matter_id', matterId);
      return (data || []).map(r => ({
        id: r.id,
        title: r.title,
        severity: r.severity,
        description: r.description,
        mitigatingAction: r.mitigating_action,
        legalContext: r.legal_context || '',
        limitationPeriodInfo: r.limitation_info || undefined,
        groundingStatus: r.grounding_status || 'grounded',
        groundingRefIds: r.grounding_ref_ids || []
      }));
    },

    replace: async (matterId: string, risks: RiskItem[]): Promise<RiskItem[]> => {
      await this.client.from('risks').delete().eq('matter_id', matterId);
      if (risks.length > 0) {
        const rows = risks.map(r => ({
          id: r.id,
          matter_id: matterId,
          title: r.title,
          severity: r.severity,
          description: r.description,
          mitigating_action: r.mitigatingAction,
          legal_context: r.legalContext || null,
          limitation_info: r.limitationPeriodInfo || null,
          grounding_status: r.groundingStatus || 'grounded',
          grounding_ref_ids: r.groundingRefIds || []
        }));
        await this.client.from('risks').insert(rows);
      }
      return risks;
    }
  };

  public drafts: IDraftRepository = {
    listByMatter: async (matterId: string): Promise<LegalDraft[]> => {
      const { data } = await this.client.from('drafts').select('*').eq('matter_id', matterId);
      return (data || []).map(d => ({
        id: d.id,
        matterId,
        type: d.type,
        communicationTier: d.communication_tier,
        title: d.title,
        recipientName: d.recipient_name,
        recipientAddress: d.recipient_address || undefined,
        subject: d.subject,
        content: d.content,
        disclaimer: d.disclaimer || 'Draft prepared for review by user or advocate.',
        createdAt: d.created_at || new Date().toISOString(),
        status: (d.status as 'draft' | 'customized' | 'ready_to_send') || 'draft',
        paragraphs: d.paragraphs || [],
        requiresAdvocateReview: d.requires_advocate_review,
        auditLog: d.audit_log || [],
        groundingStatus: d.grounding_status || 'grounded',
        groundingRefIds: d.grounding_ref_ids || []
      }));
    },

    findById: async (matterId: string, draftId: string): Promise<LegalDraft | null> => {
      const { data } = await this.client.from('drafts')
        .select('*')
        .eq('matter_id', matterId)
        .eq('id', draftId)
        .single();
      if (!data) return null;
      return {
        id: data.id,
        matterId,
        type: data.type,
        communicationTier: data.communication_tier,
        title: data.title,
        recipientName: data.recipient_name,
        recipientAddress: data.recipient_address || undefined,
        subject: data.subject,
        content: data.content,
        disclaimer: data.disclaimer || 'Draft prepared for review by user or advocate.',
        createdAt: data.created_at || new Date().toISOString(),
        status: (data.status as 'draft' | 'customized' | 'ready_to_send') || 'draft',
        paragraphs: data.paragraphs || [],
        requiresAdvocateReview: data.requires_advocate_review,
        auditLog: data.audit_log || [],
        groundingStatus: data.grounding_status || 'grounded',
        groundingRefIds: data.grounding_ref_ids || []
      };
    },

    update: async (matterId: string, draftId: string, updates: Partial<LegalDraft>): Promise<LegalDraft | null> => {
      const updateData: Record<string, unknown> = {};
      if (updates.content) updateData.content = updates.content;
      if (updates.paragraphs) updateData.paragraphs = updates.paragraphs;
      if (updates.auditLog) updateData.audit_log = updates.auditLog;
      if (updates.requiresAdvocateReview !== undefined) updateData.requires_advocate_review = updates.requiresAdvocateReview;

      const { error } = await this.client.from('drafts')
        .update(updateData)
        .eq('matter_id', matterId)
        .eq('id', draftId);

      if (error) return null;
      return this.drafts.findById(matterId, draftId);
    },

    replace: async (matterId: string, drafts: LegalDraft[]): Promise<LegalDraft[]> => {
      await this.client.from('drafts').delete().eq('matter_id', matterId);
      if (drafts.length > 0) {
        const rows = drafts.map(d => ({
          id: d.id,
          matter_id: matterId,
          type: d.type,
          communication_tier: d.communicationTier,
          title: d.title,
          recipient_name: d.recipientName,
          recipient_address: d.recipientAddress || null,
          subject: d.subject,
          content: d.content,
          disclaimer: d.disclaimer || null,
          paragraphs: d.paragraphs || [],
          requires_advocate_review: d.requiresAdvocateReview || false,
          audit_log: d.auditLog || [],
          grounding_status: d.groundingStatus || 'grounded',
          grounding_ref_ids: d.groundingRefIds || []
        }));
        await this.client.from('drafts').insert(rows);
      }
      return drafts;
    }
  };

  public evidenceGraphs: IEvidenceGraphRepository = {
    getByMatter: async (matterId: string): Promise<EvidenceGraphData | null> => {
      const { data } = await this.client.from('evidence_graphs')
        .select('*')
        .eq('matter_id', matterId)
        .maybeSingle();
      if (!data) return null;
      return {
        nodes: data.nodes || [],
        edges: data.edges || [],
        updatedAt: data.updated_at
      };
    },

    save: async (matterId: string, graph: EvidenceGraphData): Promise<EvidenceGraphData> => {
      await this.client.from('evidence_graphs').upsert({
        matter_id: matterId,
        nodes: graph.nodes || [],
        edges: graph.edges || [],
        updated_at: graph.updatedAt || new Date().toISOString()
      });
      return graph;
    }
  };

  public actions: IActionRepository = {
    listByMatter: async (matterId: string): Promise<ActionStep[]> => {
      const { data } = await this.client.from('matter_actions')
        .select('*')
        .eq('matter_id', matterId)
        .order('created_at', { ascending: true });
      return (data || []).map(a => ({
        id: a.id,
        title: a.title,
        phase: a.phase,
        description: a.description,
        estimatedTurnaround: a.estimated_turnaround || undefined,
        status: a.status,
        priority: a.priority,
        associatedDraftType: a.associated_draft_type || undefined,
        dueDate: a.due_date || undefined,
        completedAt: a.completed_at || undefined,
        evidenceRequired: a.evidence_required || false,
        notes: a.notes || undefined,
        blockingReason: a.blocking_reason || undefined,
        completionProof: a.completion_proof || undefined,
        result: a.result || undefined,
        groundingStatus: a.grounding_status || 'grounded',
        groundingRefIds: []
      }));
    },

    update: async (matterId: string, actionId: string, updates: Partial<ActionStep>): Promise<ActionStep | null> => {
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString()
      };
      if (updates.status) updateData.status = updates.status;
      if (updates.completedAt !== undefined) updateData.completed_at = updates.completedAt ? new Date(updates.completedAt).toISOString() : null;
      if (updates.notes !== undefined) updateData.notes = updates.notes;
      if (updates.blockingReason !== undefined) updateData.blocking_reason = updates.blockingReason;
      if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate ? new Date(updates.dueDate).toISOString() : null;
      if (updates.completionProof !== undefined) updateData.completion_proof = updates.completionProof;
      if (updates.result !== undefined) updateData.result = updates.result;

      const { data, error } = await this.client.from('matter_actions')
        .update(updateData)
        .eq('matter_id', matterId)
        .eq('id', actionId)
        .select()
        .single();

      if (error || !data) return null;
      return {
        id: data.id,
        title: data.title,
        phase: data.phase,
        description: data.description,
        estimatedTurnaround: data.estimated_turnaround || undefined,
        status: data.status,
        priority: data.priority,
        associatedDraftType: data.associated_draft_type || undefined,
        dueDate: data.due_date || undefined,
        completedAt: data.completed_at || undefined,
        evidenceRequired: data.evidence_required || false,
        notes: data.notes || undefined,
        blockingReason: data.blocking_reason || undefined,
        completionProof: data.completion_proof || undefined,
        result: data.result || undefined,
        groundingStatus: data.grounding_status || 'grounded',
        groundingRefIds: []
      };
    },

    replace: async (matterId: string, actions: ActionStep[]): Promise<ActionStep[]> => {
      await this.client.from('matter_actions').delete().eq('matter_id', matterId);
      if (actions.length > 0) {
        const rows = actions.map(a => ({
          id: a.id,
          matter_id: matterId,
          title: a.title,
          phase: a.phase,
          description: a.description,
          estimated_turnaround: a.estimatedTurnaround || null,
          status: a.status,
          priority: a.priority,
          associated_draft_type: a.associatedDraftType || null,
          due_date: a.dueDate ? new Date(a.dueDate).toISOString() : null,
          completed_at: a.completedAt ? new Date(a.completedAt).toISOString() : null,
          notes: a.notes || null,
          blocking_reason: a.blockingReason || null,
          completion_proof: a.completionProof || null,
          result: a.result || null,
          grounding_status: a.groundingStatus || 'grounded'
        }));
        await this.client.from('matter_actions').insert(rows);
      }
      return actions;
    }
  };

  public communications: ICommunicationRepository = {
    listByMatter: async (matterId: string): Promise<CommunicationRecord[]> => {
      const { data } = await this.client.from('matter_communications')
        .select('*')
        .eq('matter_id', matterId)
        .order('created_at', { ascending: false });
      return (data || []).map(c => ({
        id: c.id,
        matterId: c.matter_id,
        type: c.type,
        direction: c.direction,
        date: c.date,
        counterparty: c.counterparty,
        summary: c.summary,
        referenceNumber: c.reference_number || undefined,
        responseExpectedBy: c.response_expected_by || undefined,
        status: c.status,
        outcomeNotes: c.outcome_notes || undefined,
        createdAt: c.created_at
      }));
    },

    record: async (matterId: string, comm: CommunicationRecord): Promise<CommunicationRecord> => {
      const row = {
        id: comm.id,
        matter_id: matterId,
        type: comm.type,
        direction: comm.direction,
        date: comm.date ? new Date(comm.date).toISOString() : new Date().toISOString(),
        counterparty: comm.counterparty,
        summary: comm.summary,
        reference_number: comm.referenceNumber || null,
        response_expected_by: comm.responseExpectedBy ? new Date(comm.responseExpectedBy).toISOString() : null,
        status: comm.status,
        outcome_notes: comm.outcomeNotes || null,
        created_at: comm.createdAt ? new Date(comm.createdAt).toISOString() : new Date().toISOString()
      };
      await this.client.from('matter_communications').insert(row);
      return comm;
    }
  };

  public activityEvents: IActivityEventRepository = {
    listByMatter: async (matterId: string): Promise<MatterActivityEvent[]> => {
      const { data } = await this.client.from('matter_activity_events')
        .select('*')
        .eq('matter_id', matterId)
        .order('created_at', { ascending: false });
      return (data || []).map(e => ({
        id: e.id,
        matterId,
        type: e.type,
        source: e.source,
        title: e.title,
        date: e.date,
        description: e.description,
        referenceId: e.reference_id || undefined,
        metadata: e.metadata || undefined
      }));
    },

    record: async (matterId: string, event: MatterActivityEvent): Promise<MatterActivityEvent> => {
      const row = {
        id: event.id,
        matter_id: matterId,
        type: event.type,
        source: event.source,
        title: event.title,
        date: event.date ? new Date(event.date).toISOString() : new Date().toISOString(),
        description: event.description,
        reference_id: event.referenceId || null,
        metadata: event.metadata || {},
        created_at: new Date().toISOString()
      };
      await this.client.from('matter_activity_events').insert(row);
      return event;
    }
  };

  public deadlines: IDeadlineRepository = {
    listByMatter: async (matterId: string): Promise<MatterDeadline[]> => {
      const { data } = await this.client.from('matter_deadlines')
        .select('*')
        .eq('matter_id', matterId)
        .order('due_date', { ascending: true });
      return (data || []).map(d => ({
        id: d.id,
        matterId,
        title: d.title,
        description: d.description || undefined,
        dueDate: d.due_date,
        type: d.type,
        isStatutory: d.is_statutory,
        isUserDefined: d.is_user_defined,
        confidence: d.confidence ? Number(d.confidence) : 0.85,
        trustTier: d.trust_tier,
        relatedActionId: d.related_action_id || undefined,
        relatedEventId: d.related_event_id || undefined,
        status: d.status,
        statuteReference: d.statute_reference || undefined
      }));
    },

    upsert: async (matterId: string, deadline: MatterDeadline): Promise<MatterDeadline> => {
      const row = {
        id: deadline.id,
        matter_id: matterId,
        title: deadline.title,
        description: deadline.description || null,
        due_date: new Date(deadline.dueDate).toISOString(),
        type: deadline.type,
        is_statutory: deadline.isStatutory ?? false,
        is_user_defined: deadline.isUserDefined ?? false,
        confidence: deadline.confidence || 0.85,
        trust_tier: deadline.trustTier || 'explanation',
        related_action_id: deadline.relatedActionId || null,
        related_event_id: deadline.relatedEventId || null,
        status: deadline.status,
        statute_reference: deadline.statuteReference || null
      };
      await this.client.from('matter_deadlines').upsert(row);
      return deadline;
    },

    replace: async (matterId: string, deadlines: MatterDeadline[]): Promise<MatterDeadline[]> => {
      await this.client.from('matter_deadlines').delete().eq('matter_id', matterId);
      if (deadlines.length > 0) {
        const rows = deadlines.map(d => ({
          id: d.id,
          matter_id: matterId,
          title: d.title,
          description: d.description || null,
          due_date: new Date(d.dueDate).toISOString(),
          type: d.type,
          is_statutory: d.isStatutory ?? false,
          is_user_defined: d.isUserDefined ?? false,
          confidence: d.confidence || 0.85,
          trust_tier: d.trustTier || 'explanation',
          related_action_id: d.relatedActionId || null,
          related_event_id: d.relatedEventId || null,
          status: d.status,
          statute_reference: d.statuteReference || null
        }));
        await this.client.from('matter_deadlines').insert(rows);
      }
      return deadlines;
    }
  };

  public escalations: IEscalationRepository = {
    listByMatter: async (matterId: string): Promise<EscalationWorkflowItem[]> => {
      const { data } = await this.client.from('matter_escalations')
        .select('*')
        .eq('matter_id', matterId);
      return (data || []).map(e => ({
        id: e.id,
        matterId,
        routeId: e.route_id,
        authorityName: e.authority_name,
        status: e.status,
        requirements: e.requirements || [],
        documentsRequired: e.documents_required || [],
        optionalDocuments: e.optional_documents || [],
        submissionMethod: e.submission_method,
        officialPortal: e.official_portal || undefined,
        referenceNumber: e.reference_number || undefined,
        submittedAt: e.submitted_at || undefined,
        acknowledgedAt: e.acknowledged_at || undefined,
        nextStep: e.next_step || undefined,
        notes: e.notes || undefined
      }));
    },

    update: async (matterId: string, routeId: string, updates: Partial<EscalationWorkflowItem>): Promise<EscalationWorkflowItem | null> => {
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString()
      };
      if (updates.status) updateData.status = updates.status;
      if (updates.submittedAt !== undefined) updateData.submitted_at = updates.submittedAt ? new Date(updates.submittedAt).toISOString() : null;
      if (updates.acknowledgedAt !== undefined) updateData.acknowledged_at = updates.acknowledgedAt ? new Date(updates.acknowledgedAt).toISOString() : null;
      if (updates.referenceNumber !== undefined) updateData.reference_number = updates.referenceNumber;
      if (updates.nextStep !== undefined) updateData.next_step = updates.nextStep;
      if (updates.notes !== undefined) updateData.notes = updates.notes;

      const { data, error } = await this.client.from('matter_escalations')
        .update(updateData)
        .eq('matter_id', matterId)
        .eq('route_id', routeId)
        .select()
        .single();

      if (error || !data) return null;
      return {
        id: data.id,
        matterId,
        routeId: data.route_id,
        authorityName: data.authority_name,
        status: data.status,
        requirements: data.requirements || [],
        documentsRequired: data.documents_required || [],
        optionalDocuments: data.optional_documents || [],
        submissionMethod: data.submission_method,
        officialPortal: data.official_portal || undefined,
        referenceNumber: data.reference_number || undefined,
        submittedAt: data.submitted_at || undefined,
        acknowledgedAt: data.acknowledged_at || undefined,
        nextStep: data.next_step || undefined,
        notes: data.notes || undefined
      };
    },

    replace: async (matterId: string, workflows: EscalationWorkflowItem[]): Promise<EscalationWorkflowItem[]> => {
      await this.client.from('matter_escalations').delete().eq('matter_id', matterId);
      if (workflows.length > 0) {
        const rows = workflows.map(e => ({
          id: e.id,
          matter_id: matterId,
          route_id: e.routeId,
          authority_name: e.authorityName,
          status: e.status,
          requirements: e.requirements || [],
          documents_required: e.documentsRequired || [],
          submission_method: e.submissionMethod || 'online_portal',
          official_portal: e.officialPortal || null,
          reference_number: e.referenceNumber || null,
          submitted_at: e.submittedAt ? new Date(e.submittedAt).toISOString() : null,
          next_step: e.nextStep || null,
          notes: e.notes || null
        }));
        await this.client.from('matter_escalations').insert(rows);
      }
      return workflows;
    }
  };

  public resolutions: IResolutionRepository = {
    getByMatter: async (matterId: string): Promise<MatterResolutionRecord | null> => {
      const { data } = await this.client.from('matter_resolutions')
        .select('*')
        .eq('matter_id', matterId)
        .maybeSingle();
      if (!data) return null;
      return {
        resolvedAt: data.resolved_at,
        resolutionType: data.resolution_type,
        outcome: data.outcome,
        amountRecovered: data.amount_recovered ? Number(data.amount_recovered) : undefined,
        amountDisputed: data.amount_disputed ? Number(data.amount_disputed) : undefined,
        notes: data.notes || undefined,
        isReopened: data.is_reopened,
        reopenedAt: data.reopened_at || undefined,
        reopenedReason: data.reopened_reason || undefined,
        reopenedBy: data.reopened_by || undefined
      };
    },

    resolve: async (matterId: string, resolution: MatterResolutionRecord): Promise<MatterResolutionRecord> => {
      const row = {
        matter_id: matterId,
        resolved_at: new Date(resolution.resolvedAt).toISOString(),
        resolution_type: resolution.resolutionType,
        outcome: resolution.outcome,
        amount_recovered: resolution.amountRecovered || null,
        amount_disputed: resolution.amountDisputed || null,
        notes: resolution.notes || null,
        is_reopened: false,
        updated_at: new Date().toISOString()
      };
      await this.client.from('matter_resolutions').upsert(row);
      return resolution;
    },

    reopen: async (matterId: string, reason: string, reopenedBy?: string): Promise<MatterResolutionRecord | null> => {
      const { data, error } = await this.client.from('matter_resolutions')
        .update({
          is_reopened: true,
          reopened_at: new Date().toISOString(),
          reopened_reason: reason,
          reopened_by: reopenedBy || 'User',
          updated_at: new Date().toISOString()
        })
        .eq('matter_id', matterId)
        .select()
        .single();

      if (error || !data) return null;
      return {
        resolvedAt: data.resolved_at,
        resolutionType: data.resolution_type,
        outcome: data.outcome,
        amountRecovered: data.amount_recovered ? Number(data.amount_recovered) : undefined,
        amountDisputed: data.amount_disputed ? Number(data.amount_disputed) : undefined,
        notes: data.notes || undefined,
        isReopened: data.is_reopened,
        reopenedAt: data.reopened_at || undefined,
        reopenedReason: data.reopened_reason || undefined,
        reopenedBy: data.reopened_by || undefined
      };
    }
  };

  public notifications: INotificationRepository = {
    listByUser: async (userId: string): Promise<MatterNotification[]> => {
      const { data } = await this.client.from('matter_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return (data || []).map(n => ({
        id: n.id,
        matterId: n.matter_id,
        userId: n.user_id || undefined,
        type: n.type,
        title: n.title,
        message: n.message,
        channel: n.channel,
        isRead: n.is_read,
        createdAt: n.created_at,
        metadata: n.metadata || undefined
      }));
    },

    listByMatter: async (matterId: string): Promise<MatterNotification[]> => {
      const { data } = await this.client.from('matter_notifications')
        .select('*')
        .eq('matter_id', matterId)
        .order('created_at', { ascending: false });
      return (data || []).map(n => ({
        id: n.id,
        matterId: n.matter_id,
        userId: n.user_id || undefined,
        type: n.type,
        title: n.title,
        message: n.message,
        channel: n.channel,
        isRead: n.is_read,
        createdAt: n.created_at,
        metadata: n.metadata || undefined
      }));
    },

    create: async (notification: MatterNotification): Promise<MatterNotification> => {
      const row = {
        id: notification.id,
        matter_id: notification.matterId,
        user_id: notification.userId || null,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        channel: notification.channel,
        is_read: notification.isRead,
        metadata: notification.metadata || {},
        created_at: notification.createdAt ? new Date(notification.createdAt).toISOString() : new Date().toISOString()
      };
      await this.client.from('matter_notifications').insert(row);
      return notification;
    },

    markRead: async (notificationId: string, userId?: string): Promise<boolean> => {
      let query = this.client.from('matter_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      if (userId) query = query.eq('user_id', userId);
      const { error } = await query;
      return !error;
    },

    markAllRead: async (userId: string): Promise<boolean> => {
      const { error } = await this.client.from('matter_notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);
      return !error;
    },

    getUnreadCount: async (userId: string): Promise<number> => {
      const { count } = await this.client.from('matter_notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);
      return count || 0;
    }
  };

  public pilotFeedback: IPilotFeedbackRepository = {
    create: async (feedback: PilotFeedback) => {
      const row = {
        id: feedback.id || undefined,
        user_id: feedback.userId || null,
        matter_id: feedback.matterId || null,
        rating: feedback.rating,
        category: feedback.category,
        feedback_text: feedback.feedbackText || null,
        correction_text: feedback.correctionText || null,
        correction_category: feedback.correctionCategory || null,
        advocate_consulted: feedback.advocateConsulted || false,
        source: feedback.source || 'direct',
        status: feedback.status || 'pending_review',
        created_at: feedback.createdAt || new Date().toISOString()
      };
      const { data, error } = await this.client.from('pilot_feedback').insert(row).select().single();
      if (error) throw new Error(`Supabase insert pilot_feedback failed: ${error.message}`);
      return {
        id: data.id,
        userId: data.user_id,
        matterId: data.matter_id,
        rating: data.rating,
        category: data.category,
        feedbackText: data.feedback_text,
        correctionText: data.correction_text,
        correctionCategory: data.correction_category,
        advocateConsulted: data.advocate_consulted,
        source: data.source,
        status: data.status,
        createdAt: data.created_at
      };
    },
    list: async (filter) => {
      let query = this.client.from('pilot_feedback').select('*');
      if (filter?.matterId) query = query.eq('matter_id', filter.matterId);
      if (filter?.userId) query = query.eq('user_id', filter.userId);
      if (filter?.category) query = query.eq('category', filter.category);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error || !data) return [];
      return data.map((d: Record<string, unknown>) => ({
        id: String(d.id),
        userId: d.user_id ? String(d.user_id) : undefined,
        matterId: d.matter_id ? String(d.matter_id) : undefined,
        rating: Number(d.rating),
        utility: (d.utility as 'yes' | 'partially' | 'no') || undefined,
        category: String(d.category),
        feedbackText: d.feedback_text ? String(d.feedback_text) : undefined,
        correctionText: d.correction_text ? String(d.correction_text) : undefined,
        correctionCategory: d.correction_category as PilotFeedback['correctionCategory'],
        advocateConsulted: Boolean(d.advocate_consulted),
        source: String(d.source),
        status: (d.status as PilotFeedback['status']) || 'pending_review',
        createdAt: String(d.created_at)
      }));
    },
    getMetrics: async () => {
      const { data, error } = await this.client.from('pilot_feedback').select('*');
      if (error || !data || data.length === 0) {
        return {
          totalSubmissions: 0,
          averageRating: 0,
          sampleSize: 0,
          measurementPeriod: 'No evaluations recorded',
          categoryBreakdown: {},
          correctionBreakdown: {},
          advocateConsultedCount: 0
        };
      }
      const total = data.length;
      const sum = data.reduce((acc: number, f: Record<string, unknown>) => acc + (Number(f.rating) || 0), 0);
      const avg = Math.round((sum / total) * 10) / 10;
      const catCounts: Record<string, number> = {};
      const corrCounts: Record<string, number> = {};
      let advCount = 0;
      for (const f of data as Array<Record<string, unknown>>) {
        const cat = f.category ? String(f.category) : '';
        const corr = f.correction_category ? String(f.correction_category) : '';
        if (cat) catCounts[cat] = (catCounts[cat] || 0) + 1;
        if (corr) {
          corrCounts[corr] = (corrCounts[corr] || 0) + 1;
        }
        if (f.advocate_consulted) advCount++;
      }
      return {
        totalSubmissions: total,
        averageRating: avg,
        sampleSize: total,
        measurementPeriod: `All-time (${total} evaluations)`,
        categoryBreakdown: catCounts,
        correctionBreakdown: corrCounts,
        advocateConsultedCount: advCount
      };
    }
  };
}
