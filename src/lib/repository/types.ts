import {
  Matter,
  DocumentEvidence,
  TimelineEvent,
  RiskItem,
  LegalDraft,
  EvidenceGraphData,
  MatterCategory,
  MatterStatus
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

export interface IStorageAdapter {
  matters: IMatterRepository;
  documents: IDocumentRepository;
  timelines: ITimelineRepository;
  risks: IRiskRepository;
  drafts: IDraftRepository;
  evidenceGraphs: IEvidenceGraphRepository;
}
