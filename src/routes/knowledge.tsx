import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageBody, PageHeader } from "@/components/app-shell";
import { KnowledgeGraphRenderer } from "@/features/knowledge/components/knowledge-graph-renderer";
import { KnowledgeSidebar } from "@/features/knowledge/components/knowledge-sidebar";
import { useKnowledgeGraph } from "@/features/knowledge/hooks/use-knowledge-graph";
import type { KnowledgeNode } from "@/features/knowledge/types";

export const Route = createFileRoute("/knowledge")({
  head: () => ({
    meta: [
      { title: "Knowledge Graph · Engineering OS" },
      { name: "description", content: "Interactive visualization of your learning network." },
    ],
  }),
  component: KnowledgePage,
});

function KnowledgePage() {
  const {
    graphData,
    filter,
    allCategories,
    setSearchQuery,
    toggleCategoryFilter,
    updateNodeMastery,
  } = useKnowledgeGraph();

  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);

  const handleNodeClick = (node: KnowledgeNode) => {
    // Toggle selection
    if (selectedNode?.id === node.id) {
      setSelectedNode(null);
    } else {
      setSelectedNode(node);
    }
  };

  // Keep selected node state in sync with mastery updates
  const activeSelectedNode = selectedNode 
    ? graphData.nodes.find(n => n.id === selectedNode.id) || selectedNode
    : null;

  return (
    <>
      <PageHeader eyebrow="Second brain" title="Knowledge Graph" description="Concepts, connected and mapped dynamically." />
      <PageBody>
        <div className="grid gap-6 lg:grid-cols-[1fr_320px] h-[calc(100vh-12rem)] min-h-[600px]">
          <div className="relative h-full w-full">
            {graphData.nodes.length === 0 ? (
              <div className="flex h-full w-full items-center justify-center border border-dashed border-border/50 rounded-lg bg-background/20">
                <p className="text-[13px] text-muted-foreground">No concepts match your filters.</p>
              </div>
            ) : (
              <KnowledgeGraphRenderer
                data={graphData}
                onNodeClick={handleNodeClick}
                selectedNodeId={activeSelectedNode?.id}
              />
            )}
          </div>
          
          <div className="h-full">
            <KnowledgeSidebar
              filter={filter}
              allCategories={allCategories}
              setSearchQuery={setSearchQuery}
              toggleCategoryFilter={toggleCategoryFilter}
              selectedNode={activeSelectedNode}
              updateNodeMastery={updateNodeMastery}
            />
          </div>
        </div>
      </PageBody>
    </>
  );
}