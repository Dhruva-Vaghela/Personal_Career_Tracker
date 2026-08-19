import { useRef, useCallback, useEffect, useState } from "react";
import type { KnowledgeGraphData, KnowledgeNode } from "../types";

export interface KnowledgeGraphRendererProps {
  data: KnowledgeGraphData;
  onNodeClick?: (node: KnowledgeNode) => void;
  selectedNodeId?: string;
}

export function KnowledgeGraphRenderer({ data, onNodeClick, selectedNodeId }: KnowledgeGraphRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<any>(undefined);
  const [ForceGraph2D, setForceGraph2D] = useState<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Dynamically load browser-only force-graph on client mount (bypassing SSR module evaluation)
  useEffect(() => {
    let isMounted = true;
    import("react-force-graph-2d").then((mod) => {
      if (isMounted) {
        setForceGraph2D(() => mod.default || mod);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Format data for the graph library
  const graphData = {
    nodes: data.nodes.map((n) => ({ ...n })), // clone to prevent mutating store
    links: data.edges.map((e) => ({
      source: e.source,
      target: e.target,
      type: e.type,
    })),
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      API: "#3178c6",
      Security: "#e34c26",
      Data: "#41b883",
      Architecture: "#a97bff",
    };
    return colors[category] || "#888888";
  };

  const drawNode = useCallback(
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const label = node.title;
      const fontSize = 12 / globalScale;
      ctx.font = `${fontSize}px Inter, sans-serif`;
      const textWidth = ctx.measureText(label).width;
      const bckgDimensions = [textWidth + 8, fontSize + 8] as [number, number];

      const isSelected = selectedNodeId === node.id;
      const radius = 5 + (node.mastery / 100) * 10;

      // Draw circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = getCategoryColor(node.category);
      ctx.fill();

      if (isSelected) {
        ctx.lineWidth = 2 / globalScale;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();
      }

      // Draw label background
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(
        node.x - bckgDimensions[0] / 2,
        node.y + radius + 4,
        bckgDimensions[0],
        bckgDimensions[1]
      );

      // Draw label
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(label, node.x, node.y + radius + 4 + bckgDimensions[1] / 2);

      node.__bckgDimensions = bckgDimensions;
    },
    [selectedNodeId]
  );

  return (
    <div ref={containerRef} className="h-full w-full bg-background relative rounded-lg overflow-hidden border border-border/50">
      {!ForceGraph2D ? (
        <div className="h-full w-full bg-background/50 relative rounded-lg flex flex-col items-center justify-center p-6 text-center animate-pulse">
          <div className="w-12 h-12 rounded-full border-2 border-primary/40 border-t-primary animate-spin mb-3" />
          <p className="text-sm text-muted-foreground font-medium">Initializing Knowledge Graph...</p>
        </div>
      ) : (
        <ForceGraph2D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeLabel="description"
          nodeCanvasObject={drawNode}
          nodeRelSize={6}
          linkColor={(link: any) => (link.type === "prerequisite" ? "oklch(1 0 0 / 25%)" : "oklch(1 0 0 / 10%)")}
          linkWidth={(link: any) => (link.type === "prerequisite" ? 1.5 : 1)}
          linkDirectionalArrowLength={(link: any) => (link.type === "prerequisite" ? 3 : 0)}
          linkDirectionalArrowRelPos={1}
          onNodeClick={(node: any) => onNodeClick?.(node as KnowledgeNode)}
          d3VelocityDecay={0.3}
          cooldownTicks={100}
        />
      )}
    </div>
  );
}
