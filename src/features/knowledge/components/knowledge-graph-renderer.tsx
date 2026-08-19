import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";
import type { KnowledgeGraphData, KnowledgeNode } from "../types";

const KnowledgeGraphRendererClient = lazy(() => import("./knowledge-graph-renderer.client"));

export interface KnowledgeGraphRendererProps {
  data: KnowledgeGraphData;
  onNodeClick?: (node: KnowledgeNode) => void;
  selectedNodeId?: string;
}

function GraphFallback() {
  return (
    <div className="h-full w-full bg-background/50 relative rounded-lg border border-border/50 flex flex-col items-center justify-center p-6 text-center animate-pulse">
      <div className="w-12 h-12 rounded-full border-2 border-primary/40 border-t-primary animate-spin mb-3" />
      <p className="text-sm text-muted-foreground font-medium">Initializing Knowledge Graph...</p>
    </div>
  );
}

export function KnowledgeGraphRenderer(props: KnowledgeGraphRendererProps) {
  return (
    <ClientOnly fallback={<GraphFallback />}>
      <Suspense fallback={<GraphFallback />}>
        <KnowledgeGraphRendererClient {...props} />
      </Suspense>
    </ClientOnly>
  );
}
