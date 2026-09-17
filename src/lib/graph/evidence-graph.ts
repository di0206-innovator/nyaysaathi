import {
  EvidenceGraphData,
  EvidenceGraphNode,
  EvidenceGraphEdge,
  EvidenceNodeType,
  EvidenceEdgeRelation,
  GroundingStatus,
  Matter,
  ExtractedFact
} from '@/types/matter';

export class EvidenceGraph {
  private nodes: Map<string, EvidenceGraphNode> = new Map();
  private edges: EvidenceGraphEdge[] = [];

  constructor(initialData?: EvidenceGraphData) {
    if (initialData) {
      initialData.nodes.forEach(node => this.nodes.set(node.id, node));
      this.edges = [...initialData.edges];
    }
  }

  public addNode(node: EvidenceGraphNode): void {
    this.nodes.set(node.id, node);
  }

  public addEdge(source: string, target: string, relation: EvidenceEdgeRelation, weight: number = 1.0): void {
    const id = `edge-${source}-${target}-${relation}`;
    const exists = this.edges.some(e => e.id === id);
    if (!exists) {
      this.edges.push({ id, source, target, relation, weight });
    }
  }

  public getNode(id: string): EvidenceGraphNode | undefined {
    return this.nodes.get(id);
  }

  public getAllNodes(): EvidenceGraphNode[] {
    return Array.from(this.nodes.values());
  }

  public getAllEdges(): EvidenceGraphEdge[] {
    return [...this.edges];
  }

  /**
   * Find all evidence nodes that directly or transitively support a given node.
   */
  public getSupportingEvidence(nodeId: string): EvidenceGraphNode[] {
    const supportingNodeIds = new Set<string>();
    const queue = [nodeId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const incomingEdges = this.edges.filter(
        e => (e.target === current && (e.relation === 'supports' || e.relation === 'evidenced_by' || e.relation === 'derives_from'))
      );

      for (const edge of incomingEdges) {
        if (!supportingNodeIds.has(edge.source)) {
          supportingNodeIds.add(edge.source);
          queue.push(edge.source);
        }
      }
    }

    return Array.from(supportingNodeIds)
      .map(id => this.nodes.get(id))
      .filter((n): n is EvidenceGraphNode => n !== undefined);
  }

  /**
   * Detailed supporting evidence with relation type and source metadata.
   */
  public getDetailedSupportingEvidence(nodeId: string): Array<{
    node: EvidenceGraphNode;
    relation: EvidenceEdgeRelation;
  }> {
    const directEdges = this.edges.filter(
      e => e.target === nodeId && (e.relation === 'supports' || e.relation === 'evidenced_by' || e.relation === 'derives_from' || e.relation === 'governed_by')
    );

    return directEdges
      .map(edge => {
        const node = this.nodes.get(edge.source);
        return node ? { node, relation: edge.relation } : null;
      })
      .filter((item): item is { node: EvidenceGraphNode; relation: EvidenceEdgeRelation } => item !== null);
  }

  /**
   * Evaluates the grounding status of a specific node:
   * - grounded: Supported by documentary evidence and verified fact or statute with high confidence.
   * - partially_grounded: Supported by only a single unverified source or statute alone.
   * - unsupported: Has no documentary, factual, or statutory backing.
   */
  public getNodeGroundingStatus(nodeId: string): GroundingStatus {
    const supporting = this.getSupportingEvidence(nodeId);
    const groundTypes = supporting.map(n => n.type);

    const hasDoc = groundTypes.includes('doc');
    const hasFact = groundTypes.includes('fact');
    const hasStatute = groundTypes.includes('statute');

    if ((hasDoc && hasFact) || (hasDoc && hasStatute)) {
      return 'grounded';
    }

    if (hasDoc || hasFact || hasStatute) {
      return 'partially_grounded';
    }

    return 'unsupported';
  }

  /**
   * Validates if a node has at least one documentary or statutory ground truth.
   */
  public isGrounded(nodeId: string): { grounded: boolean; groundTypes: EvidenceNodeType[]; sourceIds: string[] } {
    const supporting = this.getSupportingEvidence(nodeId);
    const groundTypes = supporting.map(n => n.type);
    const hasDocOrFact = groundTypes.includes('doc') || groundTypes.includes('fact') || groundTypes.includes('statute');

    return {
      grounded: hasDocOrFact,
      groundTypes,
      sourceIds: supporting.map(n => n.id)
    };
  }

  /**
   * Scans nodes and returns user-actionable prompts when grounding is weak or missing.
   */
  public getMissingEvidencePrompts(): Array<{
    nodeId: string;
    label: string;
    nodeType: EvidenceNodeType;
    missingPrompt: string;
    recommendedDocumentType: string;
  }> {
    const prompts: Array<{
      nodeId: string;
      label: string;
      nodeType: EvidenceNodeType;
      missingPrompt: string;
      recommendedDocumentType: string;
    }> = [];

    for (const [id, node] of this.nodes.entries()) {
      if (node.type === 'risk' || node.type === 'action' || node.type === 'claim') {
        const status = this.getNodeGroundingStatus(id);
        if (status === 'unsupported' || status === 'partially_grounded') {
          let missingPrompt = `Upload verifying proof to support: "${node.label}"`;
          let docType = 'invoice_bill';

          const lower = (node.label + ' ' + node.content).toLowerCase();
          if (lower.includes('deposit') || lower.includes('rent') || lower.includes('tenan')) {
            missingPrompt = `Upload your Registered Rental Agreement, move-out handover acknowledgment, or NEFT payment proof.`;
            docType = 'rental_agreement';
          } else if (lower.includes('warranty') || lower.includes('device') || lower.includes('defect')) {
            missingPrompt = `Upload your GST Tax Invoice and the authorized service center intake job sheet.`;
            docType = 'invoice_bill';
          } else if (lower.includes('notice') || lower.includes('speed post') || lower.includes('rpad')) {
            missingPrompt = `Upload the Speed Post postal dispatch receipt or digital delivery tracking confirmation.`;
            docType = 'other';
          }

          prompts.push({
            nodeId: id,
            label: node.label,
            nodeType: node.type,
            missingPrompt,
            recommendedDocumentType: docType
          });
        }
      }
    }

    return prompts;
  }

  /**
   * Find unsupported claims or risks lacking documentary proof.
   */
  public findEvidentiaryGaps(): Array<{ nodeId: string; label: string; reason: string }> {
    const gaps: Array<{ nodeId: string; label: string; reason: string }> = [];

    for (const [id, node] of this.nodes.entries()) {
      if (node.type === 'risk' || node.type === 'action' || node.type === 'claim') {
        const { grounded, groundTypes } = this.isGrounded(id);
        if (!grounded) {
          gaps.push({
            nodeId: id,
            label: node.label,
            reason: `No supporting document or verified fact found (found sources: ${groundTypes.join(', ') || 'none'}).`
          });
        }
      }
    }

    return gaps;
  }

  /**
   * Build a populated EvidenceGraph from a Matter instance.
   */
  public static buildFromMatter(matter: Matter): EvidenceGraph {
    if (matter.evidenceGraph && matter.evidenceGraph.nodes.length > 0) {
      return new EvidenceGraph(matter.evidenceGraph);
    }

    const graph = new EvidenceGraph();

    // Narrative claim node
    graph.addNode({
      id: 'claim-user-narrative',
      type: 'claim',
      label: 'User Initial Narrative',
      content: matter.userStory,
      confidence: 1.0
    });

    // Document nodes
    (matter.documents || []).forEach(doc => {
      graph.addNode({
        id: doc.id,
        type: 'doc',
        label: doc.title,
        content: doc.relevanceSummary || doc.title,
        confidence: doc.confidenceScore || 0.95
      });
      graph.addEdge(doc.id, 'claim-user-narrative', 'supports');
    });

    // Fact nodes
    const factsList: ExtractedFact[] = matter.facts || [];
    factsList.forEach(fact => {
      graph.addNode({
        id: fact.id,
        type: 'fact',
        label: (fact.category || 'FACT').toUpperCase(),
        content: fact.statement,
        confidence: fact.confidence || 0.9
      });
      if (fact.sourceDocId) {
        graph.addEdge(fact.sourceDocId, fact.id, 'evidenced_by');
      }
      graph.addEdge(fact.id, 'claim-user-narrative', 'supports');
    });

    // Timeline event nodes
    (matter.timelineEvents || []).forEach(evt => {
      graph.addNode({
        id: evt.id,
        type: 'timeline',
        label: evt.title,
        content: `${evt.date}: ${evt.description}`,
        confidence: 0.9
      });
      if (evt.evidenceDocId) {
        graph.addEdge(evt.evidenceDocId, evt.id, 'evidenced_by');
      }
      graph.addEdge(evt.id, 'claim-user-narrative', 'supports');
    });

    // Risk nodes
    (matter.risks || []).forEach(risk => {
      graph.addNode({
        id: risk.id,
        type: 'risk',
        label: risk.title,
        content: risk.description,
        confidence: risk.severity === 'high' ? 0.9 : 0.75
      });
      if (risk.groundingRefIds && risk.groundingRefIds.length > 0) {
        risk.groundingRefIds.forEach((refId: string) => graph.addEdge(refId, risk.id, 'derives_from'));
      }
    });

    // Action nodes
    (matter.actionPlan || []).forEach(action => {
      graph.addNode({
        id: action.id,
        type: 'action',
        label: action.title,
        content: action.description,
        confidence: 0.9
      });
      if (action.associatedDraftType) {
        const matchingDraft = (matter.drafts || []).find(d => d.type === action.associatedDraftType);
        if (matchingDraft) {
          graph.addEdge(matchingDraft.id, action.id, 'supports');
        }
      }
    });

    return graph;
  }

  public toJSON(): EvidenceGraphData {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: this.edges,
      updatedAt: new Date().toISOString()
    };
  }
}

export const EvidenceGraphBuilder = EvidenceGraph;

