import {
  Matter,
  DocumentEvidence,
  ActionStep,
  CommunicationRecord,
  MatterActivityEvent,
  MatterDeadline,
  EscalationWorkflowItem,
  MatterResolutionRecord,
  MatterStatus
} from '@/types/matter';
import { IStorageAdapter, MatterFilter } from './types';
import { CreateMatterInput } from '@/lib/api/validation';
import { MatterOrchestrator } from '@/lib/agents/orchestrator';
import { ReanalysisTrigger } from '@/lib/agents/types';
import { getStorageProvider } from '@/lib/storage/storage-provider';
import { getDocumentParser } from '@/lib/parsing/document-parser';
import { DeadlineEngine } from '@/lib/deadlines/deadline-engine';
import { getInAppNotificationProvider } from '@/lib/notifications/notification-provider';

export interface AdvocateCasePack {
  matterId: string;
  title: string;
  category: string;
  jurisdiction: string;
  generatedAt: string;
  disclaimer: string;
  // 10 Key Sections
  executiveSummary: string;
  parties: Matter['parties'];
  chronology: Array<{ date: string; title: string; description: string; status: string }>;
  evidenceIndex: Array<{ id: string; title: string; type: string; classification: string; verificationStatus: string }>;
  legalIssues: Array<{ statute: string; section: string; title: string; applicability: string }>;
  risksAndUncertainties: Array<{ title: string; severity: string; description: string; limitationInfo?: string }>;
  actionsTaken: Array<{ title: string; completedAt: string; proof?: string; notes?: string }>;
  outstandingActions: Array<{ title: string; phase: string; priority: string; blockingReason?: string }>;
  drafts: Array<{ id: string; title: string; type: string; status: string; recipient: string }>;
  escalationHistory: Array<{ authority: string; status: string; referenceNumber?: string; nextStep?: string }>;
}

export class MatterService {
  private adapter: IStorageAdapter;
  private orchestrator = new MatterOrchestrator();

  constructor(adapter: IStorageAdapter) {
    this.adapter = adapter;
  }

  public getAdapter(): IStorageAdapter {
    return this.adapter;
  }

  public setAdapter(adapter: IStorageAdapter): void {
    this.adapter = adapter;
  }

  /**
   * Derive dynamic matter health / lifecycle status based on current activities.
   */
  public deriveMatterHealthStatus(matter: Matter): MatterStatus {
    // 1. Preserve resolved or closed states
    if (matter.resolution && !matter.resolution.isReopened) {
      return 'resolved';
    }
    if (matter.status === 'closed') {
      return 'closed';
    }

    // 2. Active Escalation status
    const activeEscalations = matter.escalationWorkflows || [];
    const hasMediationHearing = activeEscalations.some(
      e => (e.status === 'hearing_scheduled' || (e.routeId.includes('mediation') && e.status === 'under_review'))
    );
    if (hasMediationHearing) {
      return 'in_mediation';
    }

    const hasSubmittedEscalation = activeEscalations.some(
      e => e.status === 'submitted' || e.status === 'acknowledged' || e.status === 'under_review'
    );
    if (hasSubmittedEscalation) {
      return 'awaiting_authority';
    }

    // 3. Evaluate LATEST communication rather than any historical record
    const comms = (matter.communications || []).slice().sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
    const latestComm = comms[0];
    if (latestComm) {
      // If the latest communication is outgoing and awaiting response or sent
      if (
        latestComm.direction === 'outgoing' &&
        (latestComm.status === 'awaiting_response' || !!latestComm.responseExpectedBy || latestComm.status === 'sent')
      ) {
        return 'awaiting_other_party';
      }
    }

    // 4. Pending user action
    const hasIncompleteActions = matter.actionPlan?.some(
      a => a.status === 'pending' || a.status === 'in_progress' || a.status === 'blocked'
    );
    if (hasIncompleteActions) {
      return 'awaiting_user_action';
    }

    return 'open';
  }

  /**
   * Create a new matter, run full agent orchestration pipeline, and persist the complete graph.
   */
  public async createMatter(input: CreateMatterInput): Promise<Matter> {
    const matterId = `matter-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const initialMatter: Matter = {
      id: matterId,
      userId: input.userId,
      title: input.title,
      category: input.category,
      subCategory: 'General Legal Dispute',
      status: 'analyzing',
      createdAt: now,
      updatedAt: now,
      locationCity: input.locationCity,
      locationState: input.locationState,
      claimAmount: input.claimAmount,
      userStory: input.userStory,
      summary: {
        plainLanguage: 'Analyzing legal context...',
        keyConflict: 'Pending initial assessment',
        legalNature: 'Pending characterization'
      },
      parties: input.parties || [],
      documents: input.documents || [],
      facts: [],
      timelineEvents: [],
      risks: [],
      missingInformation: [],
      actionPlan: [],
      drafts: [],
      escalationRoutes: [],
      trustSafetyItems: [],
      language: 'en',
      activityEvents: [
        {
          id: `evt-${Date.now()}-1`,
          matterId,
          type: 'matter_created',
          source: 'user_recorded',
          title: 'Matter Workspace Initialized',
          date: now,
          description: `Matter created under category ${input.category}. Initial story ingested.`
        }
      ],
      communications: [],
      deadlines: [],
      escalationWorkflows: []
    };

    // Run initial agent pipeline
    const pipelineResult = await this.orchestrator.executePipeline(initialMatter, {
      trigger: 'full'
    });

    const populatedMatter: Matter = {
      ...pipelineResult.matter,
      id: matterId,
      userId: input.userId,
      status: 'awaiting_user_action',
      activityEvents: [
        {
          id: `evt-${Date.now()}-1`,
          matterId,
          type: 'matter_created',
          source: 'user_recorded',
          title: 'Matter Workspace Initialized',
          date: now,
          description: `Matter created under category ${input.category}. Initial story ingested.`
        },
        {
          id: `evt-${Date.now()}-2`,
          matterId,
          type: 'analysis_completed',
          source: 'user_recorded',
          title: 'Initial Legal Intelligence Completed',
          date: now,
          description: `Extracted ${pipelineResult.matter.facts.length} facts, matched ${pipelineResult.matter.applicableStatutes?.length || 0} statutes, and generated ${pipelineResult.matter.actionPlan.length} initial actions.`
        }
      ],
      communications: [],
      escalationWorkflows: (pipelineResult.matter.escalationRoutes || []).map(r => ({
        id: `esc-${r.id}`,
        matterId,
        routeId: r.id,
        authorityName: r.name,
        status: 'not_started',
        requirements: [r.eligibilityDescription],
        documentsRequired: ['Identity Proof (Aadhaar/PAN)', 'Primary Transaction Evidence'],
        submissionMethod: 'online_portal',
        officialPortal: r.officialPortalUrl,
        nextStep: r.stepsToApply[0] || 'Review filing eligibility requirements.'
      })),
      deadlines: DeadlineEngine.generateMatterDeadlines(pipelineResult.matter),
      updatedAt: new Date().toISOString()
    };

    return this.adapter.matters.create(populatedMatter);
  }

  /**
   * Retrieve a matter by ID with optional tenant isolation by userId.
   */
  public async getMatterById(id: string, userId?: string): Promise<Matter | null> {
    return this.adapter.matters.findById(id, userId);
  }

  /**
   * List matters with optional filtering.
   */
  public async listMatters(filter?: MatterFilter): Promise<Matter[]> {
    return this.adapter.matters.list(filter);
  }

  /**
   * Update an existing matter record.
   */
  public async updateMatter(id: string, updates: Partial<Matter>, userId?: string): Promise<Matter | null> {
    return this.adapter.matters.update(id, updates, userId);
  }

  /**
   * Delete a matter.
   */
  public async deleteMatter(id: string, userId?: string): Promise<boolean> {
    return this.adapter.matters.delete(id, userId);
  }

  /**
   * Record a new activity event in the matter timeline.
   */
  public async recordActivityEvent(
    matterId: string,
    event: Omit<MatterActivityEvent, 'id'>,
    userId?: string
  ): Promise<MatterActivityEvent> {
    const existing = await this.getMatterById(matterId, userId);
    if (!existing) throw new Error(`Matter not found: ${matterId}`);

    const newEvent: MatterActivityEvent = {
      ...event,
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    };

    const activityEvents = [newEvent, ...(existing.activityEvents || [])];
    await this.adapter.matters.update(matterId, { activityEvents }, userId);
    return newEvent;
  }

  /**
   * Update an action step status, proof of execution, or notes,
   * automatically recording timeline events and running selective re-analysis on completion.
   */
  public async updateActionStep(
    matterId: string,
    actionId: string,
    updates: Partial<ActionStep>,
    userId?: string
  ): Promise<Matter> {
    const existing = await this.getMatterById(matterId, userId);
    if (!existing) throw new Error(`Matter not found: ${matterId}`);

    if (existing.resolution && !existing.resolution.isReopened) {
      throw new Error(`Cannot update actions on a resolved matter. Reopen the matter first.`);
    }

    const actionIndex = existing.actionPlan.findIndex(a => a.id === actionId);
    if (actionIndex === -1) throw new Error(`Action step not found: ${actionId}`);

    const prevAction = existing.actionPlan[actionIndex];
    const targetStatus = updates.status || prevAction.status;

    // Validate state transitions
    if (updates.status && updates.status !== prevAction.status) {
      const validTransitions: Record<string, string[]> = {
        pending: ['in_progress', 'skipped', 'blocked', 'completed'],
        in_progress: ['completed', 'blocked', 'skipped', 'pending'],
        blocked: ['in_progress', 'pending', 'skipped'],
        completed: ['pending'],
        skipped: ['pending', 'in_progress']
      };
      if (!validTransitions[prevAction.status]?.includes(updates.status)) {
        throw new Error(`Invalid action status transition from '${prevAction.status}' to '${updates.status}'`);
      }
    }

    const isCompleted = targetStatus === 'completed';
    const isNowCompleted = isCompleted && prevAction.status !== 'completed';

    // Preserve completion metadata unless transitioning back to incomplete
    let completedAt = prevAction.completedAt;
    if (updates.completedAt !== undefined) {
      completedAt = updates.completedAt;
    } else if (isNowCompleted) {
      completedAt = new Date().toISOString();
    } else if (updates.status && updates.status !== 'completed') {
      completedAt = undefined;
    }

    const updatedAction: ActionStep = {
      ...prevAction,
      ...updates,
      status: targetStatus,
      completedAt,
      completionProof: updates.completionProof !== undefined ? updates.completionProof : prevAction.completionProof,
      result: updates.result !== undefined ? updates.result : prevAction.result,
      notes: updates.notes !== undefined ? updates.notes : prevAction.notes,
      dueDate: updates.dueDate !== undefined ? updates.dueDate : prevAction.dueDate,
      blockingReason: updates.blockingReason !== undefined ? updates.blockingReason : prevAction.blockingReason
    };

    const newActionPlan = [...existing.actionPlan];
    newActionPlan[actionIndex] = updatedAction;

    // Record activity event
    const newActivityEvents = [...(existing.activityEvents || [])];
    if (isNowCompleted) {
      newActivityEvents.unshift({
        id: `evt-act-${Date.now()}`,
        matterId,
        type: 'action_completed',
        source: 'user_recorded',
        title: `Action Completed: ${updatedAction.title}`,
        date: new Date().toISOString(),
        description: updatedAction.notes || `User marked step as completed. Proof attached: ${updatedAction.completionProof?.type || 'None'}`,
        referenceId: actionId
      });
    }

    const updatedMatter: Matter = {
      ...existing,
      actionPlan: newActionPlan,
      activityEvents: newActivityEvents,
      updatedAt: new Date().toISOString()
    };

    updatedMatter.status = this.deriveMatterHealthStatus(updatedMatter);
    await this.adapter.matters.update(matterId, updatedMatter, userId);

    // If completed, trigger selective re-analysis for action completion
    if (isNowCompleted) {
      const reanalyzed = await this.reanalyzeMatter(matterId, 'action_completed', userId);
      return reanalyzed || updatedMatter;
    }

    return updatedMatter;
  }

  /**
   * Record a communication event (legal notice sent, email, phone call, counterparty response),
   * dynamically scheduling response deadlines and re-evaluating matter status.
   */
  public async recordCommunication(
    matterId: string,
    comm: Omit<CommunicationRecord, 'id' | 'createdAt'>,
    userId?: string
  ): Promise<Matter> {
    const existing = await this.getMatterById(matterId, userId);
    if (!existing) throw new Error(`Matter not found: ${matterId}`);

    const newComm: CommunicationRecord = {
      ...comm,
      id: `comm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };

    const communications = [newComm, ...(existing.communications || [])];

    // Activity event
    const activityEvents = [
      {
        id: `evt-comm-${Date.now()}`,
        matterId,
        type: 'communication_recorded' as const,
        source: 'user_recorded' as const,
        title: `${comm.direction === 'outgoing' ? 'Sent' : 'Received'}: ${comm.type.replace(/_/g, ' ')} (${comm.counterparty})`,
        date: comm.date,
        description: comm.summary,
        referenceId: newComm.id
      },
      ...(existing.activityEvents || [])
    ];

    const updatedMatter: Matter = {
      ...existing,
      communications,
      activityEvents,
      updatedAt: new Date().toISOString()
    };

    // Recalculate matter deadlines with Deadline Engine 2.0
    updatedMatter.deadlines = DeadlineEngine.generateMatterDeadlines(updatedMatter);
    updatedMatter.status = this.deriveMatterHealthStatus(updatedMatter);

    await this.adapter.matters.update(matterId, updatedMatter, userId);

    // Notify user in-app
    const notifProvider = getInAppNotificationProvider();
    await notifProvider.send({
      matterId,
      userId,
      type: comm.direction === 'incoming' ? 'authority_update' : 'response_expected',
      title: `Communication Logged: ${comm.type}`,
      message: `${comm.counterparty} - ${comm.summary.slice(0, 100)}`
    });

    // If incoming response recorded, trigger selective re-analysis
    if (comm.direction === 'incoming' || comm.status === 'responded') {
      const reanalyzed = await this.reanalyzeMatter(matterId, 'external_response_recorded', userId);
      return reanalyzed || updatedMatter;
    }

    return updatedMatter;
  }

  /**
   * Create or update a matter deadline / reminder.
   */
  public async manageDeadline(
    matterId: string,
    deadlineInput: Omit<MatterDeadline, 'id'>,
    userId?: string
  ): Promise<Matter> {
    const existing = await this.getMatterById(matterId, userId);
    if (!existing) throw new Error(`Matter not found: ${matterId}`);

    const newDeadline: MatterDeadline = {
      ...deadlineInput,
      id: `dl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    };

    const deadlines = [...(existing.deadlines || []), newDeadline];

    const activityEvents = [
      {
        id: `evt-dl-${Date.now()}`,
        matterId,
        type: 'deadline_created' as const,
        source: 'user_recorded' as const,
        title: `Deadline Scheduled: ${newDeadline.title}`,
        date: new Date().toISOString(),
        description: `Target due date: ${newDeadline.dueDate}. Type: ${newDeadline.type}.`,
        referenceId: newDeadline.id
      },
      ...(existing.activityEvents || [])
    ];

    const updatedMatter: Matter = {
      ...existing,
      deadlines,
      activityEvents,
      updatedAt: new Date().toISOString()
    };

    await this.adapter.matters.update(matterId, updatedMatter, userId);
    return updatedMatter;
  }

  public async upsertDeadline(
    matterId: string,
    deadlineInput: Omit<MatterDeadline, 'id'>,
    userId?: string
  ): Promise<Matter> {
    return this.manageDeadline(matterId, deadlineInput, userId);
  }

  /**
   * Update official escalation workflow filing status (e.g. DLSA, RERA, e-Daakhil).
   */
  public async updateEscalation(
    matterId: string,
    escalationInput: Partial<EscalationWorkflowItem> & { routeId: string },
    userId?: string
  ): Promise<Matter> {
    const existing = await this.getMatterById(matterId, userId);
    if (!existing) throw new Error(`Matter not found: ${matterId}`);

    const workflows = [...(existing.escalationWorkflows || [])];
    const index = workflows.findIndex(w => w.routeId === escalationInput.routeId);

    const isSubmitted = escalationInput.status === 'submitted' || escalationInput.status === 'acknowledged';

    if (index !== -1) {
      workflows[index] = {
        ...workflows[index],
        ...escalationInput,
        submittedAt: isSubmitted ? (workflows[index].submittedAt || new Date().toISOString()) : workflows[index].submittedAt
      };
    } else {
      workflows.push({
        id: `esc-${Date.now()}`,
        matterId,
        routeId: escalationInput.routeId,
        authorityName: escalationInput.authorityName || 'Grievance Redressal Authority',
        status: escalationInput.status || 'preparing',
        requirements: escalationInput.requirements || [],
        documentsRequired: escalationInput.documentsRequired || [],
        submissionMethod: escalationInput.submissionMethod || 'online_portal',
        officialPortal: escalationInput.officialPortal,
        referenceNumber: escalationInput.referenceNumber,
        submittedAt: isSubmitted ? new Date().toISOString() : undefined,
        nextStep: escalationInput.nextStep,
        notes: escalationInput.notes
      });
    }

    const activityEvents = [
      {
        id: `evt-esc-${Date.now()}`,
        matterId,
        type: 'escalation_submitted' as const,
        source: 'user_recorded' as const,
        title: `Escalation Status Updated: ${escalationInput.authorityName || 'Authority'}`,
        date: new Date().toISOString(),
        description: `Status changed to ${escalationInput.status || 'updated'}. Ref: ${escalationInput.referenceNumber || 'N/A'}`
      },
      ...(existing.activityEvents || [])
    ];

    const updatedMatter: Matter = {
      ...existing,
      escalationWorkflows: workflows,
      activityEvents,
      updatedAt: new Date().toISOString()
    };

    updatedMatter.status = this.deriveMatterHealthStatus(updatedMatter);
    await this.adapter.matters.update(matterId, updatedMatter, userId);
    return updatedMatter;
  }

  /**
   * Formal Resolution Workflow:
   * Records resolution outcome, amount recovered, locks editing, and records immutable activity.
   */
  public async resolveMatter(
    matterId: string,
    resolution: Omit<MatterResolutionRecord, 'isReopened'>,
    userId?: string
  ): Promise<Matter> {
    const existing = await this.getMatterById(matterId, userId);
    if (!existing) throw new Error(`Matter not found: ${matterId}`);

    const resolutionRecord: MatterResolutionRecord = {
      ...resolution,
      isReopened: false
    };

    const activityEvents = [
      {
        id: `evt-res-${Date.now()}`,
        matterId,
        type: 'matter_resolved' as const,
        source: 'user_recorded' as const,
        title: `Matter Resolved: ${resolution.outcome}`,
        date: resolution.resolvedAt,
        description: `Resolution Type: ${resolution.resolutionType.replace(/_/g, ' ')}. Amount Recovered: ₹${resolution.amountRecovered || 0}. Notes: ${resolution.notes || 'None'}.`
      },
      ...(existing.activityEvents || [])
    ];

    const updatedMatter: Matter = {
      ...existing,
      status: 'resolved',
      resolution: resolutionRecord,
      activityEvents,
      updatedAt: new Date().toISOString()
    };

    await this.adapter.matters.update(matterId, updatedMatter, userId);
    return updatedMatter;
  }

  /**
   * Reopen a previously resolved matter with audit rationale.
   */
  public async reopenMatter(
    matterId: string,
    reason: string,
    reopenedBy?: string,
    userId?: string
  ): Promise<Matter> {
    const existing = await this.getMatterById(matterId, userId);
    if (!existing) throw new Error(`Matter not found: ${matterId}`);

    const updatedResolution: MatterResolutionRecord | undefined = existing.resolution
      ? {
          ...existing.resolution,
          isReopened: true,
          reopenedAt: new Date().toISOString(),
          reopenedReason: reason,
          reopenedBy: reopenedBy || 'User'
        }
      : undefined;

    const activityEvents = [
      {
        id: `evt-reopen-${Date.now()}`,
        matterId,
        type: 'matter_reopened' as const,
        source: 'user_recorded' as const,
        title: 'Matter Reopened',
        date: new Date().toISOString(),
        description: `Matter reopened. Reason: ${reason}`
      },
      ...(existing.activityEvents || [])
    ];

    const updatedMatter: Matter = {
      ...existing,
      status: 'awaiting_user_action',
      resolution: updatedResolution,
      activityEvents,
      updatedAt: new Date().toISOString()
    };

    await this.adapter.matters.update(matterId, updatedMatter, userId);
    return updatedMatter;
  }

  /**
   * Generates a comprehensive 10-section Advocate Case Pack for lawyer / legal-aid handoff.
   */
  public async generateAdvocateCasePack(matterId: string, userId?: string): Promise<AdvocateCasePack> {
    const matter = await this.getMatterById(matterId, userId);
    if (!matter) throw new Error(`Matter not found: ${matterId}`);

    return {
      matterId: matter.id,
      title: matter.title,
      category: matter.category.replace(/_/g, ' ').toUpperCase(),
      jurisdiction: `${matter.locationCity || ''}, ${matter.locationState || 'Central / All India'}`.trim(),
      generatedAt: new Date().toISOString(),
      disclaimer: 'Prepared by NyaySaathi — Informational Case Preparation Pack. Not a substitute for formal legal advice or advocate appearance in court.',
      // 1. Executive Summary
      executiveSummary: matter.summary.plainLanguage,
      // 2. Parties
      parties: matter.parties,
      // 3. Chronology
      chronology: matter.timelineEvents.map(e => ({
        date: e.date,
        title: e.title,
        description: e.description,
        status: e.status
      })),
      // 4. Evidence Index
      evidenceIndex: matter.documents.map(d => ({
        id: d.id,
        title: d.title,
        type: d.type,
        classification: d.classification || 'Document Evidence',
        verificationStatus: d.status
      })),
      // 5. Legal Issues & Statutory References
      legalIssues: (matter.applicableStatutes || []).map(s => ({
        statute: s.statute,
        section: s.section,
        title: s.title,
        applicability: s.applicabilityNote
      })),
      // 6. Risks & Uncertainties
      risksAndUncertainties: matter.risks.map(r => ({
        title: r.title,
        severity: r.severity,
        description: r.description,
        limitationInfo: r.limitationPeriodInfo ? `${r.limitationPeriodInfo.statute} (${r.limitationPeriodInfo.deadlineMonths} months)` : undefined
      })),
      // 7. Actions Taken
      actionsTaken: matter.actionPlan
        .filter(a => a.status === 'completed')
        .map(a => ({
          title: a.title,
          completedAt: a.completedAt || 'Recorded',
          proof: a.completionProof ? `${a.completionProof.type}: ${a.completionProof.reference || a.completionProof.notes || 'Attached'}` : undefined,
          notes: a.notes
        })),
      // 8. Outstanding Actions
      outstandingActions: matter.actionPlan
        .filter(a => a.status !== 'completed')
        .map(a => ({
          title: a.title,
          phase: a.phase,
          priority: a.priority,
          blockingReason: a.blockingReason
        })),
      // 9. Drafts
      drafts: matter.drafts.map(d => ({
        id: d.id,
        title: d.title,
        type: d.type,
        status: d.status,
        recipient: d.recipientName
      })),
      // 10. Escalation History
      escalationHistory: (matter.escalationWorkflows || []).map(e => ({
        authority: e.authorityName,
        status: e.status,
        referenceNumber: e.referenceNumber,
        nextStep: e.nextStep
      }))
    };
  }

  /**
   * Upload an evidence document file, parse its text/clauses, store metadata,
   * and automatically trigger selective pipeline re-analysis with `doc_uploaded`.
   */
  public async uploadDocumentAndReanalyze(
    matterId: string,
    file: {
      buffer: Buffer | ArrayBuffer;
      filename: string;
      mimeType: string;
      title?: string;
      type?: DocumentEvidence['type'];
    },
    userId?: string
  ): Promise<{ document: DocumentEvidence; matter: Matter }> {
    const existing = await this.getMatterById(matterId, userId);
    if (!existing) {
      throw new Error(`Matter not found: ${matterId}`);
    }

    if (existing.resolution && !existing.resolution.isReopened) {
      throw new Error(`Cannot upload documents to a resolved matter. Reopen the matter first.`);
    }

    const docId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Upload to private storage
    const storageProvider = getStorageProvider();
    const stored = await storageProvider.uploadFile({
      buffer: file.buffer,
      filename: file.filename,
      mimeType: file.mimeType,
      matterId,
      userId: existing.userId || userId,
      documentId: docId
    });

    try {
      // Parse document content
      const nodeBuf = Buffer.isBuffer(file.buffer) ? file.buffer : Buffer.from(file.buffer);
      const arrayBuffer = nodeBuf.buffer.slice(
        nodeBuf.byteOffset,
        nodeBuf.byteOffset + nodeBuf.byteLength
      ) as ArrayBuffer;

      const parser = getDocumentParser();
      const parsed = await parser.parseDocument({
        buffer: arrayBuffer,
        filename: file.filename,
        mimeType: file.mimeType
      });

      const isVerified = parsed.extractionStatus === 'verified_extraction' || parsed.extractionStatus === 'partial_extraction';

      // Construct DocumentEvidence record
      const newDoc: DocumentEvidence = {
        id: docId,
        title: file.title || file.filename,
        type: file.type || 'other',
        fileUrl: stored.fileUrl,
        storagePath: stored.storagePath || stored.fileUrl,
        fileSize: stored.fileSize,
        uploadedAt: new Date().toISOString().split('T')[0],
        extractedText: parsed.extractedText,
        classification: parsed.classification || 'Uploaded Document Evidence',
        confidenceScore: parsed.confidence,
        extractionStatus: parsed.extractionStatus,
        relevanceSummary: parsed.relevanceSummary || 'Corroborating document ingested into matter evidence repository.',
        keyQuotes: parsed.clauses?.map(c => c.text) || [],
        status: isVerified ? 'verified' : 'unverified'
      };

      // Save document to repository
      await this.adapter.documents.add(matterId, newDoc);

      // Record activity event
      await this.recordActivityEvent(matterId, {
        matterId,
        type: 'document_uploaded',
        source: 'user_recorded',
        title: `Document Uploaded: ${newDoc.title}`,
        date: new Date().toISOString(),
        description: `Uploaded ${file.filename} (${newDoc.type}). System extracted ${newDoc.keyQuotes?.length || 0} clauses. Status: ${newDoc.extractionStatus || 'needs_review'}.`,
        referenceId: docId
      }, userId);

      // Trigger selective re-analysis with doc_uploaded
      const reanalyzed = await this.reanalyzeMatter(matterId, 'doc_uploaded', userId);
      if (!reanalyzed) {
        throw new Error(`Failed to re-analyze matter after document upload: ${matterId}`);
      }

      return {
        document: newDoc,
        matter: reanalyzed
      };
    } catch (err) {
      // Rollback uploaded storage file on failure
      await storageProvider.deleteFile(stored.fileUrl).catch(() => {});
      throw err;
    }
  }

  /**
   * Re-run agent reasoning loop on an existing matter with selective trigger support.
   */
  public async reanalyzeMatter(
    id: string,
    trigger: ReanalysisTrigger = 'full',
    userId?: string
  ): Promise<Matter | null> {
    const existing = await this.getMatterById(id, userId);
    if (!existing) return null;

    if (existing.resolution && !existing.resolution.isReopened) {
      throw new Error(`Cannot re-analyze a resolved matter. Reopen the matter first.`);
    }

    const pipelineResult = await this.orchestrator.executePipeline(existing, {
      trigger
    });

    // Preserve user execution state on existing action steps
    const existingActionMap = new Map((existing.actionPlan || []).map(a => [a.id, a]));
    const mergedActionPlan = (pipelineResult.matter.actionPlan || []).map(newStep => {
      const prev = existingActionMap.get(newStep.id) || (existing.actionPlan || []).find(a => a.title === newStep.title);
      if (prev && (prev.status === 'completed' || prev.status === 'in_progress' || prev.status === 'blocked' || prev.status === 'skipped')) {
        return {
          ...newStep,
          status: prev.status,
          completedAt: prev.completedAt,
          completionProof: prev.completionProof,
          notes: prev.notes || newStep.notes,
          blockingReason: prev.blockingReason,
          result: prev.result || newStep.result
        };
      }
      return newStep;
    });

    const updatedMatter: Matter = {
      ...pipelineResult.matter,
      id: existing.id,
      userId: existing.userId,
      actionPlan: mergedActionPlan,
      activityEvents: existing.activityEvents || [],
      communications: existing.communications || [],
      deadlines: existing.deadlines || [],
      escalationWorkflows: existing.escalationWorkflows || [],
      resolution: existing.resolution,
      updatedAt: new Date().toISOString()
    };

    // Re-evaluate deadlines and status
    updatedMatter.deadlines = DeadlineEngine.generateMatterDeadlines(updatedMatter);
    updatedMatter.status = this.deriveMatterHealthStatus(updatedMatter);

    return this.adapter.matters.update(id, updatedMatter, userId);
  }
}
