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
import { SEED_MATTERS } from '@/lib/db/seed-data';

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export class MemoryStorageAdapter implements IStorageAdapter {
  private store: Map<string, Matter> = new Map();

  constructor(initialMatters?: Matter[]) {
    this.seed(initialMatters || SEED_MATTERS);
  }

  public seed(matters: Matter[]) {
    this.store.clear();
    matters.forEach(m => {
      this.store.set(m.id, deepClone(m));
    });
  }

  public reset() {
    this.seed(SEED_MATTERS);
  }

  public matters: IMatterRepository = {
    create: async (matter: Matter): Promise<Matter> => {
      const cloned = deepClone(matter);
      this.store.set(cloned.id, cloned);
      return deepClone(cloned);
    },

    findById: async (id: string, userId?: string): Promise<Matter | null> => {
      const matter = this.store.get(id);
      if (!matter) return null;
      if (userId && matter.userId && matter.userId !== userId) {
        return null;
      }
      return deepClone(matter);
    },

    list: async (filter?: MatterFilter): Promise<Matter[]> => {
      let all = Array.from(this.store.values());

      if (filter) {
        if (filter.userId) {
          all = all.filter(m => !m.userId || m.userId === filter.userId);
        }
        if (filter.category) {
          all = all.filter(m => m.category === filter.category);
        }
        if (filter.status) {
          all = all.filter(m => m.status === filter.status);
        }
        if (filter.search) {
          const q = filter.search.toLowerCase();
          all = all.filter(m => m.title.toLowerCase().includes(q) || m.userStory.toLowerCase().includes(q));
        }
      }

      return all.map(deepClone);
    },

    update: async (id: string, updates: Partial<Matter>, userId?: string): Promise<Matter | null> => {
      const existing = this.store.get(id);
      if (!existing) return null;
      if (userId && existing.userId && existing.userId !== userId) {
        return null;
      }

      const updated: Matter = {
        ...existing,
        ...deepClone(updates),
        updatedAt: new Date().toISOString()
      };

      this.store.set(id, updated);
      return deepClone(updated);
    },

    delete: async (id: string, userId?: string): Promise<boolean> => {
      const existing = this.store.get(id);
      if (!existing) return false;
      if (userId && existing.userId && existing.userId !== userId) {
        return false;
      }
      return this.store.delete(id);
    }
  };

  public documents: IDocumentRepository = {
    add: async (matterId: string, doc: DocumentEvidence): Promise<DocumentEvidence> => {
      const matter = this.store.get(matterId);
      if (!matter) throw new Error(`Matter not found: ${matterId}`);
      const clonedDoc = deepClone(doc);
      matter.documents = [...(matter.documents || []), clonedDoc];
      matter.updatedAt = new Date().toISOString();
      return clonedDoc;
    },

    listByMatter: async (matterId: string): Promise<DocumentEvidence[]> => {
      const matter = this.store.get(matterId);
      if (!matter) return [];
      return (matter.documents || []).map(deepClone);
    },

    findById: async (matterId: string, docId: string): Promise<DocumentEvidence | null> => {
      const matter = this.store.get(matterId);
      if (!matter) return null;
      const doc = (matter.documents || []).find(d => d.id === docId);
      return doc ? deepClone(doc) : null;
    },

    update: async (matterId: string, docId: string, updates: Partial<DocumentEvidence>): Promise<DocumentEvidence | null> => {
      const matter = this.store.get(matterId);
      if (!matter) return null;
      const idx = (matter.documents || []).findIndex(d => d.id === docId);
      if (idx === -1) return null;

      const updatedDoc = {
        ...matter.documents[idx],
        ...deepClone(updates)
      };
      matter.documents[idx] = updatedDoc;
      matter.updatedAt = new Date().toISOString();
      return deepClone(updatedDoc);
    },

    delete: async (matterId: string, docId: string): Promise<boolean> => {
      const matter = this.store.get(matterId);
      if (!matter) return false;
      const initialLen = (matter.documents || []).length;
      matter.documents = (matter.documents || []).filter(d => d.id !== docId);
      return matter.documents.length < initialLen;
    }
  };

  public timelines: ITimelineRepository = {
    listByMatter: async (matterId: string): Promise<TimelineEvent[]> => {
      const matter = this.store.get(matterId);
      if (!matter) return [];
      return (matter.timelineEvents || []).map(deepClone);
    },

    add: async (matterId: string, event: TimelineEvent): Promise<TimelineEvent> => {
      const matter = this.store.get(matterId);
      if (!matter) throw new Error(`Matter not found: ${matterId}`);
      const clonedEvt = deepClone(event);
      matter.timelineEvents = [...(matter.timelineEvents || []), clonedEvt];
      return clonedEvt;
    },

    replace: async (matterId: string, events: TimelineEvent[]): Promise<TimelineEvent[]> => {
      const matter = this.store.get(matterId);
      if (!matter) throw new Error(`Matter not found: ${matterId}`);
      matter.timelineEvents = deepClone(events);
      return deepClone(events);
    }
  };

  public risks: IRiskRepository = {
    listByMatter: async (matterId: string): Promise<RiskItem[]> => {
      const matter = this.store.get(matterId);
      if (!matter) return [];
      return (matter.risks || []).map(deepClone);
    },

    replace: async (matterId: string, risks: RiskItem[]): Promise<RiskItem[]> => {
      const matter = this.store.get(matterId);
      if (!matter) throw new Error(`Matter not found: ${matterId}`);
      matter.risks = deepClone(risks);
      return deepClone(risks);
    }
  };

  public drafts: IDraftRepository = {
    listByMatter: async (matterId: string): Promise<LegalDraft[]> => {
      const matter = this.store.get(matterId);
      if (!matter) return [];
      return (matter.drafts || []).map(deepClone);
    },

    findById: async (matterId: string, draftId: string): Promise<LegalDraft | null> => {
      const matter = this.store.get(matterId);
      if (!matter) return null;
      const draft = (matter.drafts || []).find(d => d.id === draftId);
      return draft ? deepClone(draft) : null;
    },

    update: async (matterId: string, draftId: string, updates: Partial<LegalDraft>): Promise<LegalDraft | null> => {
      const matter = this.store.get(matterId);
      if (!matter) return null;
      const idx = (matter.drafts || []).findIndex(d => d.id === draftId);
      if (idx === -1) return null;

      const updated = {
        ...matter.drafts[idx],
        ...deepClone(updates)
      };
      matter.drafts[idx] = updated;
      return deepClone(updated);
    },

    replace: async (matterId: string, drafts: LegalDraft[]): Promise<LegalDraft[]> => {
      const matter = this.store.get(matterId);
      if (!matter) throw new Error(`Matter not found: ${matterId}`);
      matter.drafts = deepClone(drafts);
      return deepClone(drafts);
    }
  };

  public evidenceGraphs: IEvidenceGraphRepository = {
    getByMatter: async (matterId: string): Promise<EvidenceGraphData | null> => {
      const matter = this.store.get(matterId);
      if (!matter || !matter.evidenceGraph) return null;
      return deepClone(matter.evidenceGraph);
    },

    save: async (matterId: string, graph: EvidenceGraphData): Promise<EvidenceGraphData> => {
      const matter = this.store.get(matterId);
      if (!matter) throw new Error(`Matter not found: ${matterId}`);
      matter.evidenceGraph = deepClone(graph);
      return deepClone(graph);
    }
  };
}
