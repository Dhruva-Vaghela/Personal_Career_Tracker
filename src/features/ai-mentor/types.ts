export type ProviderType = "openai" | "claude" | "gemini";

export interface MentorContext {
  availableStudyTimeMinutes: number;
  weakestSkills: Array<{ name: string; score: number }>;
  currentPhase: { name: string; description: string };
  unfinishedProjects: Array<{ name: string; progress: number }>;
  revisionSchedule: Array<{ topic: string; priority: number }>;
  githubActivity: { recentCommitsCount: number; activeRepos: string[] };
  learningStreakDays: number;
  customRequirement?: string;
}

export interface MentorRecommendation {
  todaysMission: {
    title: string;
    description: string;
    checklist: string[];
    estimatedTimeMinutes: number;
    reason: string;
    customRequirement?: string;
  };
  weeklyGoal: {
    title: string;
    description: string;
    milestone: string;
  };
  revisionTasks: Array<{
    topic: string;
    reason: string;
  }>;
  codingPractice: {
    platform: string;
    difficulty: string;
    problemType: string;
    link: string;
  };
  readingRecommendation: {
    title: string;
    topic: string;
    rationale: string;
  };
  projectRecommendation: {
    title: string;
    nextSteps: string[];
  };
  interviewPreparation: {
    question: string;
    tips: string[];
  };
  systemDesignTopic: {
    topic: string;
    coreConcepts: string[];
  };
}
