export type RevisionStatus = "learning" | "good" | "due";

export interface KnowledgeNode {
  id: string;
  title: string;
  category: string;
  description: string;
  mastery: number; // 0 to 100
  revisionStatus: RevisionStatus;
  references: string[]; // Links or markdown refs
  prerequisiteNodeIds: string[];
  relatedNodeIds: string[];
}

export interface KnowledgeEdge {
  source: string;
  target: string;
  type: "prerequisite" | "related";
}

export interface KnowledgeGraphData {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
}

export interface KnowledgeGraphFilter {
  searchQuery?: string;
  categories?: string[];
  minMastery?: number;
  maxMastery?: number;
}
