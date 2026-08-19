import { useQuery } from "@tanstack/react-query";
import { roadmapService } from "../roadmap-service";
import { useAppStore } from "@/store/app-store";
import type { EngineRoadmap } from "../types";
import { createLearningEngine } from "../learning-engine";

export function useLearningEngine() {
  // 1. Fetch the static JSON skeleton
  const query = useQuery({
    queryKey: ["roadmap-skeleton"],
    queryFn: () => roadmapService.getRoadmap(),
    staleTime: Infinity,
  });

  // 2. Grab the user's persistent item states
  const itemState = useAppStore((state) => state.itemState);

  // 3. If loading or error, pass it through
  if (query.isLoading || query.isError || !query.data) {
    return {
      data: undefined as EngineRoadmap | undefined,
      isLoading: query.isLoading,
      isError: query.isError,
    };
  }

  // 4. Calculate engine progress on the fly merging static roadmap with user state
  const learningEngine = createLearningEngine(query.data, itemState);

  return {
    data: learningEngine,
    isLoading: false,
    isError: false,
  };
}
