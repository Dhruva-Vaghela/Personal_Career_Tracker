import type {
  Roadmap,
  Phase,
  Module,
  Topic,
  Subtopic,
  ChecklistItem,
  UserItemState,
  EngineChecklistItem,
  EngineSubtopic,
  EngineTopic,
  EngineModule,
  EnginePhase,
  EngineRoadmap,
  NodeProgress
} from "./types";

function calculateProgress(completedCount: number, totalCount: number): NodeProgress {
  return {
    completedItemsCount: completedCount,
    totalItemsCount: totalCount,
    completionPercentage: totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100),
    isCompleted: totalCount > 0 && completedCount === totalCount
  };
}

export function createLearningEngine(
  roadmap: Roadmap,
  itemState: Record<string, UserItemState>
): EngineRoadmap {
  
  let roadmapCompletedItems = 0;
  let roadmapTotalItems = 0;

  const enginePhases: EnginePhase[] = roadmap.phases.map(phase => {
    let phaseCompletedItems = 0;
    let phaseTotalItems = 0;

    const engineModules: EngineModule[] = phase.modules.map(module => {
      let modCompletedItems = 0;
      let modTotalItems = 0;

      const engineTopics: EngineTopic[] = module.topics.map(topic => {
        let topicCompletedItems = 0;
        let topicTotalItems = 0;

        const engineSubtopics: EngineSubtopic[] = topic.subtopics.map(subtopic => {
          let subCompletedItems = 0;
          let subTotalItems = subtopic.checklist.length;

          const engineChecklist: EngineChecklistItem[] = subtopic.checklist.map(item => {
            const state = itemState[item.id] || { isCompleted: false };
            if (state.isCompleted) {
              subCompletedItems++;
            }
            return {
              ...item,
              state
            };
          });

          const subProgress = calculateProgress(subCompletedItems, subTotalItems);
          
          if (subProgress.isCompleted) topicCompletedItems++;
          topicTotalItems++;

          return {
            ...subtopic,
            checklist: engineChecklist,
            progress: subProgress
          };
        });

        const topicProgress = calculateProgress(topicCompletedItems, topicTotalItems);
        
        if (topicProgress.isCompleted) modCompletedItems++;
        modTotalItems++;

        return {
          ...topic,
          subtopics: engineSubtopics,
          progress: topicProgress
        };
      });

      const modProgress = calculateProgress(modCompletedItems, modTotalItems);
      
      if (modProgress.isCompleted) phaseCompletedItems++;
      phaseTotalItems++;

      return {
        ...module,
        topics: engineTopics,
        progress: modProgress
      };
    });

    const phaseProgress = calculateProgress(phaseCompletedItems, phaseTotalItems);

    if (phaseProgress.isCompleted) roadmapCompletedItems++;
    roadmapTotalItems++;

    return {
      ...phase,
      modules: engineModules,
      progress: phaseProgress,
      isUnlocked: true // Simplification for now, unlock everything or compute sequentially
    };
  });
  
  // Sequential unlock logic: A phase is unlocked if the previous phase is completed
  for (let i = 0; i < enginePhases.length; i++) {
    if (i === 0) {
      enginePhases[i].isUnlocked = true;
    } else {
      enginePhases[i].isUnlocked = enginePhases[i - 1].progress.isCompleted;
    }
  }

  const roadmapProgress = calculateProgress(roadmapCompletedItems, roadmapTotalItems);

  return {
    ...roadmap,
    phases: enginePhases,
    progress: roadmapProgress
  };
}
