import { Matter, DocumentEvidence } from '@/types/matter';
import { IStorageAdapter, MatterFilter } from './types';
import { CreateMatterInput } from '@/lib/api/validation';
import { MatterOrchestrator } from '@/lib/agents/orchestrator';
import { ReanalysisTrigger } from '@/lib/agents/types';
import { getStorageProvider } from '@/lib/storage/storage-provider';
import { getDocumentParser } from '@/lib/parsing/document-parser';

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
      language: 'en'
    };

    // Run initial agent pipeline
    const pipelineResult = await this.orchestrator.executePipeline(initialMatter, {
      trigger: 'full'
    });

    const populatedMatter: Matter = {
      ...pipelineResult.matter,
      id: matterId,
      userId: input.userId,
      status: 'action_ready',
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

    // 1. Upload to storage
    const storageProvider = getStorageProvider();
    const stored = await storageProvider.uploadFile({
      buffer: file.buffer,
      filename: file.filename,
      mimeType: file.mimeType,
      matterId
    });

    // 2. Parse document content (text/PDF/image OCR)
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

    // 3. Construct DocumentEvidence record
    const docId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newDoc: DocumentEvidence = {
      id: docId,
      title: file.title || file.filename,
      type: file.type || 'other',
      fileUrl: stored.fileUrl,
      fileSize: stored.fileSize,
      uploadedAt: new Date().toISOString().split('T')[0],
      extractedText: parsed.extractedText,
      classification: parsed.classification || 'Uploaded Document Evidence',
      confidenceScore: parsed.confidence,
      relevanceSummary: parsed.relevanceSummary || 'Corroborating document ingested into matter evidence repository.',
      keyQuotes: parsed.clauses?.map(c => c.text) || [],
      status: 'verified'
    };

    // 4. Save document to repository
    await this.adapter.documents.add(matterId, newDoc);

    // 5. Trigger selective re-analysis with doc_uploaded
    const reanalyzed = await this.reanalyzeMatter(matterId, 'doc_uploaded', userId);
    if (!reanalyzed) {
      throw new Error(`Failed to re-analyze matter after document upload: ${matterId}`);
    }

    return {
      document: newDoc,
      matter: reanalyzed
    };
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

    const pipelineResult = await this.orchestrator.executePipeline(existing, {
      trigger
    });

    const updatedMatter: Matter = {
      ...pipelineResult.matter,
      id: existing.id,
      userId: existing.userId,
      updatedAt: new Date().toISOString()
    };

    return this.adapter.matters.update(id, updatedMatter, userId);
  }
}
