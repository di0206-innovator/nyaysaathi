import { Matter, MatterCategory, Party, DocumentEvidence } from '@/types/matter';
import { ReanalysisTrigger } from '@/lib/agents/types';
import { getMatterService } from '@/lib/repository';

/**
 * MockDB Facade / Local Adapter
 * Retained as a backwards-compatible local development interface delegating to MatterService.
 */
export const MockDB = {
  async getAllMatters(): Promise<Matter[]> {
    return getMatterService().listMatters();
  },

  async getMatterById(id: string): Promise<Matter | null> {
    return getMatterService().getMatterById(id);
  },

  async createMatter(data: {
    title: string;
    category: MatterCategory;
    userStory: string;
    claimAmount?: number;
    locationCity?: string;
    locationState?: string;
    parties?: Array<{ name: string; role: Party['role']; contactInfo?: string }>;
    documents?: Array<{ title: string; type: DocumentEvidence['type']; fileSize?: string; extractedText?: string }>;
    userId?: string;
  }): Promise<Matter> {
    const parties: Party[] = data.parties?.map((p, idx) => ({
      id: `p-${idx + 1}`,
      name: p.name,
      role: p.role,
      contactInfo: p.contactInfo,
      city: data.locationCity,
      state: data.locationState
    })) || [];

    const documents: DocumentEvidence[] = data.documents?.map((d, idx) => ({
      id: `doc-${idx + 1}`,
      title: d.title,
      type: d.type,
      fileSize: d.fileSize || '1.0 MB',
      uploadedAt: new Date().toISOString().split('T')[0],
      extractedText: d.extractedText,
      classification: 'Initial Intake Upload',
      confidenceScore: 0.95,
      relevanceSummary: 'Supplied during initial matter creation.',
      status: 'verified' as const
    })) || [];

    return getMatterService().createMatter({
      title: data.title,
      category: data.category,
      userStory: data.userStory,
      claimAmount: data.claimAmount,
      locationCity: data.locationCity,
      locationState: data.locationState,
      parties,
      documents,
      userId: data.userId
    });
  },

  async updateMatter(id: string, updates: Partial<Matter>): Promise<Matter | null> {
    return getMatterService().updateMatter(id, updates);
  },

  async deleteMatter(id: string): Promise<boolean> {
    return getMatterService().deleteMatter(id);
  },

  async reanalyzeMatter(id: string, trigger?: ReanalysisTrigger): Promise<Matter | null> {
    return getMatterService().reanalyzeMatter(id, trigger || 'full');
  }
};
