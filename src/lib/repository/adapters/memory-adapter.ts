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
          all = all.filter(m => m.userId === filter.userId);
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

      const safeUpdates = deepClone(updates);
      delete (safeUpdates as Record<string, unknown>).id;
      delete (safeUpdates as Record<string, unknown>).userId;
      delete (safeUpdates as Record<string, unknown>).createdAt;

      const updated: Matter = {
        ...existing,
        ...safeUpdates,
        id: existing.id,
        userId: existing.userId,
        createdAt: existing.createdAt,
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

  private notificationsStore: import('@/types/matter').MatterNotification[] = [];

  public actions: import('../types').IActionRepository = {
    listByMatter: async (matterId: string) => {
      const matter = this.store.get(matterId);
      if (!matter) return [];
      return (matter.actionPlan || []).map(deepClone);
    },
    update: async (matterId: string, actionId: string, updates: Partial<import('@/types/matter').ActionStep>) => {
      const matter = this.store.get(matterId);
      if (!matter) return null;
      const idx = (matter.actionPlan || []).findIndex(a => a.id === actionId);
      if (idx === -1) return null;
      const updated = { ...matter.actionPlan[idx], ...deepClone(updates) };
      matter.actionPlan[idx] = updated;
      return deepClone(updated);
    },
    replace: async (matterId: string, actions: import('@/types/matter').ActionStep[]) => {
      const matter = this.store.get(matterId);
      if (!matter) throw new Error(`Matter not found: ${matterId}`);
      matter.actionPlan = deepClone(actions);
      return deepClone(actions);
    }
  };

  public communications: import('../types').ICommunicationRepository = {
    listByMatter: async (matterId: string) => {
      const matter = this.store.get(matterId);
      if (!matter) return [];
      return (matter.communications || []).map(deepClone);
    },
    record: async (matterId: string, comm: import('@/types/matter').CommunicationRecord) => {
      const matter = this.store.get(matterId);
      if (!matter) throw new Error(`Matter not found: ${matterId}`);
      if (!matter.communications) matter.communications = [];
      matter.communications.unshift(deepClone(comm));
      return deepClone(comm);
    }
  };

  public activityEvents: import('../types').IActivityEventRepository = {
    listByMatter: async (matterId: string) => {
      const matter = this.store.get(matterId);
      if (!matter) return [];
      return (matter.activityEvents || []).map(deepClone);
    },
    record: async (matterId: string, event: import('@/types/matter').MatterActivityEvent) => {
      const matter = this.store.get(matterId);
      if (!matter) throw new Error(`Matter not found: ${matterId}`);
      if (!matter.activityEvents) matter.activityEvents = [];
      matter.activityEvents.unshift(deepClone(event));
      return deepClone(event);
    }
  };

  public deadlines: import('../types').IDeadlineRepository = {
    listByMatter: async (matterId: string) => {
      const matter = this.store.get(matterId);
      if (!matter) return [];
      return (matter.deadlines || []).map(deepClone);
    },
    upsert: async (matterId: string, deadline: import('@/types/matter').MatterDeadline) => {
      const matter = this.store.get(matterId);
      if (!matter) throw new Error(`Matter not found: ${matterId}`);
      if (!matter.deadlines) matter.deadlines = [];
      const idx = matter.deadlines.findIndex(d => d.id === deadline.id);
      if (idx !== -1) {
        matter.deadlines[idx] = deepClone(deadline);
      } else {
        matter.deadlines.push(deepClone(deadline));
      }
      return deepClone(deadline);
    },
    replace: async (matterId: string, deadlines: import('@/types/matter').MatterDeadline[]) => {
      const matter = this.store.get(matterId);
      if (!matter) throw new Error(`Matter not found: ${matterId}`);
      matter.deadlines = deepClone(deadlines);
      return deepClone(deadlines);
    }
  };

  public escalations: import('../types').IEscalationRepository = {
    listByMatter: async (matterId: string) => {
      const matter = this.store.get(matterId);
      if (!matter) return [];
      return (matter.escalationWorkflows || []).map(deepClone);
    },
    update: async (matterId: string, routeId: string, updates: Partial<import('@/types/matter').EscalationWorkflowItem>) => {
      const matter = this.store.get(matterId);
      if (!matter) return null;
      if (!matter.escalationWorkflows) matter.escalationWorkflows = [];
      const idx = matter.escalationWorkflows.findIndex(e => e.routeId === routeId);
      if (idx === -1) return null;
      const updated = { ...matter.escalationWorkflows[idx], ...deepClone(updates) };
      matter.escalationWorkflows[idx] = updated;
      return deepClone(updated);
    },
    replace: async (matterId: string, workflows: import('@/types/matter').EscalationWorkflowItem[]) => {
      const matter = this.store.get(matterId);
      if (!matter) throw new Error(`Matter not found: ${matterId}`);
      matter.escalationWorkflows = deepClone(workflows);
      return deepClone(workflows);
    }
  };

  public resolutions: import('../types').IResolutionRepository = {
    getByMatter: async (matterId: string) => {
      const matter = this.store.get(matterId);
      if (!matter || !matter.resolution) return null;
      return deepClone(matter.resolution);
    },
    resolve: async (matterId: string, resolution: import('@/types/matter').MatterResolutionRecord) => {
      const matter = this.store.get(matterId);
      if (!matter) throw new Error(`Matter not found: ${matterId}`);
      matter.resolution = deepClone(resolution);
      matter.status = 'resolved';
      return deepClone(resolution);
    },
    reopen: async (matterId: string, reason: string, reopenedBy?: string) => {
      const matter = this.store.get(matterId);
      if (!matter || !matter.resolution) return null;
      matter.resolution.isReopened = true;
      matter.resolution.reopenedAt = new Date().toISOString();
      matter.resolution.reopenedReason = reason;
      matter.resolution.reopenedBy = reopenedBy || 'User';
      matter.status = 'awaiting_user_action';
      return deepClone(matter.resolution);
    }
  };

  public notifications: import('../types').INotificationRepository = {
    listByUser: async (userId: string) => {
      return this.notificationsStore.filter(n => n.userId === userId).map(deepClone);
    },
    listByMatter: async (matterId: string) => {
      return this.notificationsStore.filter(n => n.matterId === matterId).map(deepClone);
    },
    create: async (notification: import('@/types/matter').MatterNotification) => {
      this.notificationsStore.unshift(deepClone(notification));
      return deepClone(notification);
    },
    markRead: async (notificationId: string, userId?: string) => {
      const notif = this.notificationsStore.find(n => n.id === notificationId && (!userId || n.userId === userId));
      if (notif) {
        notif.isRead = true;
        return true;
      }
      return false;
    },
    markAllRead: async (userId: string) => {
      let count = 0;
      for (const n of this.notificationsStore) {
        if (n.userId === userId && !n.isRead) {
          n.isRead = true;
          count++;
        }
      }
      return count > 0;
    },
    getUnreadCount: async (userId: string) => {
      return this.notificationsStore.filter(n => n.userId === userId && !n.isRead).length;
    }
  };

  private feedbackStore: import('../types').PilotFeedback[] = [];

  public pilotFeedback: import('../types').IPilotFeedbackRepository = {
    create: async (feedback: import('../types').PilotFeedback) => {
      const cloned = deepClone(feedback);
      if (!cloned.id) cloned.id = `fb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      if (!cloned.createdAt) cloned.createdAt = new Date().toISOString();
      this.feedbackStore.unshift(cloned);
      return deepClone(cloned);
    },
    list: async (filter) => {
      let res = this.feedbackStore;
      if (filter?.matterId) res = res.filter(f => f.matterId === filter.matterId);
      if (filter?.userId) res = res.filter(f => f.userId === filter.userId);
      if (filter?.category) res = res.filter(f => f.category === filter.category);
      return res.map(deepClone);
    },
    getMetrics: async (userId?: string) => {
      let filtered = this.feedbackStore;
      if (userId) {
        filtered = filtered.filter(f => f.userId === userId);
      }
      const total = filtered.length;
      if (total === 0) {
        return {
          totalSubmissions: 0,
          averageRating: 0,
          sampleSize: 0,
          measurementPeriod: userId ? 'No user evaluations recorded' : 'No evaluations recorded',
          categoryBreakdown: {},
          correctionBreakdown: {},
          advocateConsultedCount: 0
        };
      }
      const sum = filtered.reduce((acc, f) => acc + f.rating, 0);
      const avg = Math.round((sum / total) * 10) / 10;
      const catCounts: Record<string, number> = {};
      const corrCounts: Record<string, number> = {};
      let advCount = 0;
      for (const f of filtered) {
        catCounts[f.category] = (catCounts[f.category] || 0) + 1;
        if (f.correctionCategory) {
          corrCounts[f.correctionCategory] = (corrCounts[f.correctionCategory] || 0) + 1;
        }
        if (f.advocateConsulted) advCount++;
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
