import {
  Matter,
  DocumentEvidence,
  TimelineEvent,
  RiskItem,
  LegalDraft,
  EvidenceGraphData,
  MatterCategory,
  MatterStatus,
  ActionStep,
  CommunicationRecord,
  MatterActivityEvent,
  MatterDeadline,
  EscalationWorkflowItem,
  MatterResolutionRecord,
  MatterNotification
} from '@/types/matter';

export interface MatterFilter {
  userId?: string;
  category?: MatterCategory;
  status?: MatterStatus;
  search?: string;
}

export interface IMatterRepository {
  create(matter: Matter): Promise<Matter>;
  findById(id: string, userId?: string): Promise<Matter | null>;
  list(filter?: MatterFilter): Promise<Matter[]>;
  update(id: string, updates: Partial<Matter>, userId?: string): Promise<Matter | null>;
  delete(id: string, userId?: string): Promise<boolean>;
}

export interface IDocumentRepository {
  add(matterId: string, doc: DocumentEvidence): Promise<DocumentEvidence>;
  listByMatter(matterId: string): Promise<DocumentEvidence[]>;
  findById(matterId: string, docId: string): Promise<DocumentEvidence | null>;
  update(matterId: string, docId: string, updates: Partial<DocumentEvidence>): Promise<DocumentEvidence | null>;
  delete(matterId: string, docId: string): Promise<boolean>;
}

export interface ITimelineRepository {
  listByMatter(matterId: string): Promise<TimelineEvent[]>;
  add(matterId: string, event: TimelineEvent): Promise<TimelineEvent>;
  replace(matterId: string, events: TimelineEvent[]): Promise<TimelineEvent[]>;
}

export interface IRiskRepository {
  listByMatter(matterId: string): Promise<RiskItem[]>;
  replace(matterId: string, risks: RiskItem[]): Promise<RiskItem[]>;
}

export interface IDraftRepository {
  listByMatter(matterId: string): Promise<LegalDraft[]>;
  findById(matterId: string, draftId: string): Promise<LegalDraft | null>;
  update(matterId: string, draftId: string, updates: Partial<LegalDraft>): Promise<LegalDraft | null>;
  replace(matterId: string, drafts: LegalDraft[]): Promise<LegalDraft[]>;
}

export interface IEvidenceGraphRepository {
  getByMatter(matterId: string): Promise<EvidenceGraphData | null>;
  save(matterId: string, graph: EvidenceGraphData): Promise<EvidenceGraphData>;
}

export interface IActionRepository {
  listByMatter(matterId: string): Promise<ActionStep[]>;
  update(matterId: string, actionId: string, updates: Partial<ActionStep>): Promise<ActionStep | null>;
  replace(matterId: string, actions: ActionStep[]): Promise<ActionStep[]>;
}

export interface ICommunicationRepository {
  listByMatter(matterId: string): Promise<CommunicationRecord[]>;
  record(matterId: string, comm: CommunicationRecord): Promise<CommunicationRecord>;
}

export interface IActivityEventRepository {
  listByMatter(matterId: string): Promise<MatterActivityEvent[]>;
  record(matterId: string, event: MatterActivityEvent): Promise<MatterActivityEvent>;
}

export interface IDeadlineRepository {
  listByMatter(matterId: string): Promise<MatterDeadline[]>;
  upsert(matterId: string, deadline: MatterDeadline): Promise<MatterDeadline>;
  replace(matterId: string, deadlines: MatterDeadline[]): Promise<MatterDeadline[]>;
}

export interface IEscalationRepository {
  listByMatter(matterId: string): Promise<EscalationWorkflowItem[]>;
  update(matterId: string, routeId: string, updates: Partial<EscalationWorkflowItem>): Promise<EscalationWorkflowItem | null>;
  replace(matterId: string, workflows: EscalationWorkflowItem[]): Promise<EscalationWorkflowItem[]>;
}

export interface IResolutionRepository {
  getByMatter(matterId: string): Promise<MatterResolutionRecord | null>;
  resolve(matterId: string, resolution: MatterResolutionRecord): Promise<MatterResolutionRecord>;
  reopen(matterId: string, reason: string, reopenedBy?: string): Promise<MatterResolutionRecord | null>;
}

export interface INotificationRepository {
  listByUser(userId: string): Promise<MatterNotification[]>;
  listByMatter(matterId: string): Promise<MatterNotification[]>;
  create(notification: MatterNotification): Promise<MatterNotification>;
  markRead(notificationId: string, userId?: string): Promise<boolean>;
  markAllRead(userId: string): Promise<boolean>;
  getUnreadCount(userId: string): Promise<number>;
}

export interface IStorageAdapter {
  matters: IMatterRepository;
  documents: IDocumentRepository;
  timelines: ITimelineRepository;
  risks: IRiskRepository;
  drafts: IDraftRepository;
  evidenceGraphs: IEvidenceGraphRepository;
  actions?: IActionRepository;
  communications?: ICommunicationRepository;
  activityEvents?: IActivityEventRepository;
  deadlines?: IDeadlineRepository;
  escalations?: IEscalationRepository;
  resolutions?: IResolutionRepository;
  notifications?: INotificationRepository;
}
