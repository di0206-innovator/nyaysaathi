import { Matter, MatterCategory, Party, DocumentEvidence } from '@/types/matter';
import { SEED_MATTERS } from './seed-data';
import { MatterOrchestrator } from '@/lib/agents/orchestrator';

// In-memory global store across server requests in dev
let mattersStore: Matter[] = [...SEED_MATTERS];

const orchestrator = new MatterOrchestrator();

export const MockDB = {
  /**
   * Get all matters
   */
  async getAllMatters(): Promise<Matter[]> {
    return [...mattersStore];
  },

  /**
   * Get matter by ID
   */
  async getMatterById(id: string): Promise<Matter | null> {
    const found = mattersStore.find(m => m.id === id);
    return found ? { ...found } : null;
  },

  /**
   * Create a new matter and run the AI agent orchestrator
   */
  async createMatter(data: {
    title: string;
    category: MatterCategory;
    userStory: string;
    claimAmount?: number;
    locationCity?: string;
    locationState?: string;
    parties?: Array<{ name: string; role: Party['role']; contactInfo?: string }>;
    documents?: Array<{ title: string; type: DocumentEvidence['type']; fileSize?: string; extractedText?: string }>;
  }): Promise<Matter> {
    const newId = `matter-${Date.now()}`;
    
    // Execute the agent pipeline
    const pipelineResult = await orchestrator.processMatter({
      matterId: newId,
      title: data.title,
      category: data.category,
      userStory: data.userStory,
      claimAmount: data.claimAmount,
      locationCity: data.locationCity,
      locationState: data.locationState,
      parties: data.parties?.map((p, idx) => ({
        id: `p-${idx + 1}`,
        name: p.name,
        role: p.role,
        contactInfo: p.contactInfo,
        city: data.locationCity,
        state: data.locationState
      })) || [],
      documents: data.documents?.map((d, idx) => ({
        id: `doc-${idx + 1}`,
        title: d.title,
        type: d.type,
        fileSize: d.fileSize || '1.0 MB',
        uploadedAt: new Date().toISOString().split('T')[0],
        extractedText: d.extractedText,
        status: 'verified'
      })) || []
    });

    const newMatter = pipelineResult.matter;
    mattersStore.unshift(newMatter);
    return newMatter;
  },

  /**
   * Update matter details
   */
  async updateMatter(id: string, updates: Partial<Matter>): Promise<Matter | null> {
    const index = mattersStore.findIndex(m => m.id === id);
    if (index === -1) return null;

    mattersStore[index] = {
      ...mattersStore[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return { ...mattersStore[index] };
  },

  /**
   * Delete matter
   */
  async deleteMatter(id: string): Promise<boolean> {
    const initialLength = mattersStore.length;
    mattersStore = mattersStore.filter(m => m.id !== id);
    return mattersStore.length < initialLength;
  },

  /**
   * Re-run agent analysis pipeline on existing matter
   */
  async reanalyzeMatter(id: string): Promise<Matter | null> {
    const existing = await this.getMatterById(id);
    if (!existing) return null;

    const result = await orchestrator.processMatter({
      matterId: existing.id,
      title: existing.title,
      category: existing.category,
      userStory: existing.userStory,
      claimAmount: existing.claimAmount,
      locationCity: existing.locationCity,
      locationState: existing.locationState,
      parties: existing.parties,
      documents: existing.documents
    });

    await this.updateMatter(id, result.matter);
    return result.matter;
  }
};
