import {
  EvidenceGraphData,
  EvidenceGraphNode,
  EvidenceGraphEdge,
  EvidenceNodeType,
  EvidenceEdgeRelation
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
   * Find unsupported claims or risks lacking documentary proof.
   */
  public findEvidentiaryGaps(): Array<{ nodeId: string; label: string; reason: string }> {
    const gaps: Array<{ nodeId: string; label: string; reason: string }> = [];

    for (const [id, node] of this.nodes.entries()) {
      if (node.type === 'risk' || node.type === 'action') {
        const { grounded, groundTypes } = this.isGrounded(id);
        if (!grounded) {
          gaps.push({
            nodeId: id,
            label: node.label,
            reason: `No supporting document or verified fact found (only found: ${groundTypes.join(', ') || 'none'}).`
          });
        }
      }
    }

    return gaps;
  }

  public toJSON(): EvidenceGraphData {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: this.edges,
      updatedAt: new Date().toISOString()
    };
  }
}
