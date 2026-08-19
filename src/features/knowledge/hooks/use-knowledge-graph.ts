import { useMemo, useState } from "react";
import { useAppStore } from "@/store/app-store";
import { KnowledgeGraphService } from "../services/knowledge-graph.service";
import type { KnowledgeGraphFilter } from "../types";

export function useKnowledgeGraph() {
  const { knowledgeNodes, addKnowledgeNode, updateNodeMastery, updateNodeRevisionStatus } = useAppStore();
  
  const [filter, setFilter] = useState<KnowledgeGraphFilter>({
    categories: [],
    searchQuery: "",
  });

  const allCategories = useMemo(() => KnowledgeGraphService.getCategories(knowledgeNodes), [knowledgeNodes]);

  const graphData = useMemo(() => {
    const rawGraph = KnowledgeGraphService.buildGraph(knowledgeNodes);
    return KnowledgeGraphService.filterGraph(rawGraph, filter);
  }, [knowledgeNodes, filter]);

  const toggleCategoryFilter = (category: string) => {
    setFilter(prev => {
      const cats = prev.categories || [];
      if (cats.includes(category)) {
        return { ...prev, categories: cats.filter(c => c !== category) };
      }
      return { ...prev, categories: [...cats, category] };
    });
  };

  const setSearchQuery = (searchQuery: string) => {
    setFilter(prev => ({ ...prev, searchQuery }));
  };

  return {
    graphData,
    filter,
    allCategories,
    toggleCategoryFilter,
    setSearchQuery,
    addKnowledgeNode,
    updateNodeMastery,
    updateNodeRevisionStatus,
  };
}
