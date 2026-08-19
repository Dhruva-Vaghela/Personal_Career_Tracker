import type { KnowledgeNode, KnowledgeEdge, KnowledgeGraphData, KnowledgeGraphFilter } from "../types";

export class KnowledgeGraphService {
  /**
   * Automatically generates edges (prerequisites and related) from the nodes array.
   */
  static buildGraph(nodes: KnowledgeNode[]): KnowledgeGraphData {
    const edges: KnowledgeEdge[] = [];
    const nodeIds = new Set(nodes.map(n => n.id));

    nodes.forEach(node => {
      // Build prerequisite edges
      node.prerequisiteNodeIds?.forEach(reqId => {
        if (nodeIds.has(reqId)) {
          edges.push({
            source: reqId,
            target: node.id,
            type: "prerequisite"
          });
        }
      });

      // Build related edges (bidirectional inherently, but we'll just create a directional edge for rendering)
      node.relatedNodeIds?.forEach(relId => {
        if (nodeIds.has(relId)) {
          // Prevent duplicate edges (A->B and B->A)
          const edgeExists = edges.some(e => 
            (e.source === node.id && e.target === relId) || 
            (e.source === relId && e.target === node.id)
          );
          
          if (!edgeExists) {
            edges.push({
              source: node.id,
              target: relId,
              type: "related"
            });
          }
        }
      });
    });

    return { nodes, edges };
  }

  /**
   * Filters the graph based on search and category criteria.
   * Invalidates edges whose source or target nodes were filtered out.
   */
  static filterGraph(graph: KnowledgeGraphData, filter: KnowledgeGraphFilter): KnowledgeGraphData {
    let filteredNodes = graph.nodes;

    if (filter.searchQuery && filter.searchQuery.trim().length > 0) {
      const q = filter.searchQuery.toLowerCase();
      filteredNodes = filteredNodes.filter(n => 
        n.title.toLowerCase().includes(q) || 
        n.description.toLowerCase().includes(q)
      );
    }

    if (filter.categories && filter.categories.length > 0) {
      filteredNodes = filteredNodes.filter(n => filter.categories!.includes(n.category));
    }

    if (filter.minMastery !== undefined) {
      filteredNodes = filteredNodes.filter(n => n.mastery >= filter.minMastery!);
    }

    if (filter.maxMastery !== undefined) {
      filteredNodes = filteredNodes.filter(n => n.mastery <= filter.maxMastery!);
    }

    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredEdges = graph.edges.filter(e => 
      filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target)
    );

    return {
      nodes: filteredNodes,
      edges: filteredEdges,
    };
  }

  static getCategories(nodes: KnowledgeNode[]): string[] {
    return Array.from(new Set(nodes.map(n => n.category))).sort();
  }
}
