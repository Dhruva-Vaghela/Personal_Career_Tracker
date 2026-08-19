import { Search, SlidersHorizontal, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Panel } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import type { KnowledgeNode, KnowledgeGraphFilter } from "../types";

interface KnowledgeSidebarProps {
  filter: KnowledgeGraphFilter;
  allCategories: string[];
  setSearchQuery: (q: string) => void;
  toggleCategoryFilter: (c: string) => void;
  selectedNode: KnowledgeNode | null;
  updateNodeMastery: (id: string, mastery: number) => void;
}

export function KnowledgeSidebar({
  filter,
  allCategories,
  setSearchQuery,
  toggleCategoryFilter,
  selectedNode,
  updateNodeMastery,
}: KnowledgeSidebarProps) {
  return (
    <div className="space-y-6 flex flex-col h-full">
      <Panel title="Search & Filter">
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search concepts..." 
            className="pl-9 bg-background/50 text-[13px] h-9"
            value={filter.searchQuery || ""}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Categories
          </div>
          <div className="flex flex-wrap gap-1.5">
            {allCategories.map((cat) => {
              const isActive = filter.categories?.includes(cat);
              return (
                <Badge
                  key={cat}
                  variant={isActive ? "default" : "secondary"}
                  className="cursor-pointer transition-colors"
                  onClick={() => toggleCategoryFilter(cat)}
                >
                  {cat}
                </Badge>
              );
            })}
          </div>
        </div>
      </Panel>

      <Panel title={selectedNode ? "Concept Details" : "Graph Stats"} className="flex-1 overflow-y-auto">
        {selectedNode ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <div className="flex items-center justify-between mb-1">
                <Badge variant="secondary">{selectedNode.category}</Badge>
                <span className={`text-[11px] uppercase tracking-wider font-medium ${
                  selectedNode.revisionStatus === "due" ? "text-destructive" : 
                  selectedNode.revisionStatus === "learning" ? "text-warning" : "text-success"
                }`}>
                  {selectedNode.revisionStatus}
                </span>
              </div>
              <h3 className="text-lg font-semibold tracking-tight mt-2">{selectedNode.title}</h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed mt-2">
                {selectedNode.description}
              </p>
            </div>

            <div className="pt-4 border-t border-border/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-medium">Mastery</span>
                <span className="text-[12px] font-mono text-muted-foreground">{selectedNode.mastery}%</span>
              </div>
              <Slider 
                value={[selectedNode.mastery]} 
                max={100} 
                step={5}
                onValueChange={(vals) => updateNodeMastery(selectedNode.id, vals[0])}
                className="my-3"
              />
            </div>

            {selectedNode.references && selectedNode.references.length > 0 && (
              <div className="pt-4 border-t border-border/50">
                <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-3">
                  <BookOpen className="h-3.5 w-3.5" /> References
                </div>
                <ul className="space-y-2">
                  {selectedNode.references.map((ref, i) => (
                    <li key={i} className="text-[12px] text-primary hover:underline cursor-pointer">
                      {ref}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground opacity-70">
            <p className="text-[13px]">Select a node in the graph to view details and update mastery.</p>
          </div>
        )}
      </Panel>
    </div>
  );
}
