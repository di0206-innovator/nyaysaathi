import { SupabaseClient } from '@supabase/supabase-js';
import {
  Matter,
  DocumentEvidence,
  TimelineEvent,
  RiskItem,
  LegalDraft,
  EvidenceGraphData
} from '@/types/matter';
import {
  IStorageAdapter,
  IMatterRepository,
  IDocumentRepository,
  ITimelineRepository,
  IRiskRepository,
  IDraftRepository,
  IEvidenceGraphRepository,
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

      return matter;
    },

    findById: async (id: string, userId?: string): Promise<Matter | null> => {
      let query = this.client.from('matters').select('*').eq('id', id).single();
      if (userId) {
        query = this.client.from('matters').select('*').eq('id', id).eq('user_id', userId).single();
      }

      const { data: matterRow, error } = await query;
      if (error || !matterRow) return null;

      // Fetch related records in parallel
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
        { data: auditLogs }
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
        this.client.from('audit_logs').select('*').eq('matter_id', id)
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
          fileSize: d.file_size || undefined,
          uploadedAt: d.created_at,
          extractedText: d.extracted_text || undefined,
          classification: d.classification || undefined,
          confidenceScore: d.confidence_score ? Number(d.confidence_score) : 0.95,
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
        actionPlan: (actions || []).map(a => ({
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
}
