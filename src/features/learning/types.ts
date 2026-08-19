// The deep hierarchical data structure for the Roadmap

export type ChecklistItemType = 
  | "learning-objective" 
  | "theory" 
  | "practical" 
  | "mini-project" 
  | "practice-problem" 
  | "interview-question" 
  | "revision-task" 
  | "resource";

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  type: ChecklistItemType;
  estimatedMinutes: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  tags: string[];
}

export interface Subtopic {
  id: string;
  title: string;
  checklist: ChecklistItem[];
}

export interface Topic {
  id: string;
  title: string;
  subtopics: Subtopic[];
}

export interface Module {
  id: string;
  title: string;
  topics: Topic[];
}

export interface Phase {
  id: string;
  title: string;
  description: string;
  modules: Module[];
}

export interface Roadmap {
  id: string;
  title: string;
  description: string;
  phases: Phase[];
}

// User state for tracking progress on items
export interface UserItemState {
  isCompleted: boolean;
  completedAt?: string;
  notes?: string;
  studyTimeSpentMinutes?: number;
  confidenceScore?: number; // 0 - 100
  priority?: "low" | "medium" | "high";
  revisionRequired?: boolean;
}

// Progress metrics calculated recursively
export interface NodeProgress {
  completionPercentage: number;
  completedItemsCount: number;
  totalItemsCount: number;
  isCompleted: boolean;
}

// Augmented hierarchy with progress mixed in (used by the UI Engine)
export interface EngineChecklistItem extends ChecklistItem { state: UserItemState }
export interface EngineSubtopic extends Omit<Subtopic, 'checklist'> { progress: NodeProgress; checklist: EngineChecklistItem[] }
export interface EngineTopic extends Omit<Topic, 'subtopics'> { progress: NodeProgress; subtopics: EngineSubtopic[] }
export interface EngineModule extends Omit<Module, 'topics'> { progress: NodeProgress; topics: EngineTopic[] }
export interface EnginePhase extends Omit<Phase, 'modules'> { progress: NodeProgress; modules: EngineModule[]; isUnlocked: boolean }
export interface EngineRoadmap extends Omit<Roadmap, 'phases'> { progress: NodeProgress; phases: EnginePhase[] }

