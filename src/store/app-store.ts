import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MentorRecommendation } from "@/features/ai-mentor/types";
import type { Project, InterviewReview } from "@/features/projects/types";
import type {
  QuizAttempt,
  AssessmentAttempt,
  InterviewSession,
  PracticalSubmission,
  CodeReview,
  TopicMastery,
  Question
} from "@/features/career-guide/types";
import { calculateTopicMastery } from "@/features/career-guide/services/mastery-engine";

export interface Goal {
  id: string;
  text: string;
  done: boolean;
}

export interface JournalEntry {
  id: string;
  date: string;
  learned: string;
  mistake: string;
  questions: string;
  ideas: string;
}

import type { KnowledgeNode, RevisionStatus } from "@/features/knowledge/types";

import type { UserItemState } from "@/features/learning/types";

export interface UserProfile {
  name: string;
  role: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  status: "To Read" | "Reading" | "Completed";
  progress: number; // percentage 0-100
  notes: string;
}

export interface TrackTopic {
  id: string;
  title: string;
  status: "Learning" | "Review" | "Completed";
  notes: string;
}

export interface PastMission {
  id: string;
  date: string;
  mission: MentorRecommendation["todaysMission"];
  status: "Completed" | "Skipped" | "Archived";
}

export interface AppState {
  // User Profile
  userProfile: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => void;

  // Roadmap Progress
  itemState: Record<string, UserItemState>;
  toggleItemCompletion: (id: string) => void;
  updateItemState: (id: string, partialState: Partial<UserItemState>) => void;

  // Knowledge Graph
  knowledgeNodes: KnowledgeNode[];
  addKnowledgeNode: (node: KnowledgeNode) => void;
  updateNodeMastery: (id: string, mastery: number) => void;
  updateNodeRevisionStatus: (id: string, status: RevisionStatus) => void;

  // Journal
  journalEntries: JournalEntry[];
  addJournalEntry: (entry: Omit<JournalEntry, "id" | "date">) => void;

  // Projects & Portfolio
  projects: Project[];
  projectReviews: Record<string, InterviewReview>; // projectId -> InterviewReview
  addProject: (project: Omit<Project, "id" | "createdAt" | "updatedAt">) => void;
  updateProject: (id: string, partial: Partial<Project>) => void;
  removeProject: (id: string) => void;
  addProjectReview: (review: InterviewReview) => void;

  // Streaks
  learningStreak: {
    currentStreak: number;
    lastActiveDate: string | null;
  };
  updateStreak: () => void;

  // Goals
  weeklyGoals: Goal[];
  toggleGoal: (id: string) => void;
  addGoal: (text: string) => void;
  removeGoal: (id: string) => void;

  // Analytics
  analytics: {
    totalLearningHours: number;
    problemsSolved: number;
    projectsBuilt: number;
  };
  addLearningHours: (hours: number) => void;
  addProblemSolved: () => void;
  addProjectBuilt: () => void;

  // AI Mentor Mission
  todaysMission: MentorRecommendation["todaysMission"] | null;
  missionDate: string | null;
  missionChecklistProgress: Record<string, boolean>;
  missionHistory: PastMission[];
  setTodaysMission: (mission: MentorRecommendation["todaysMission"]) => void;
  toggleMissionChecklistItem: (id: string) => void;
  completeMission: () => void;
  skipMission: () => void;
  archiveMission: (id: string) => void;

  // Books
  books: Book[];
  addBook: (book: Omit<Book, "id">) => void;
  updateBook: (id: string, partial: Partial<Book>) => void;
  removeBook: (id: string) => void;

  // System Design
  systemDesignTopics: TrackTopic[];
  addSystemDesignTopic: (topic: Omit<TrackTopic, "id">) => void;
  updateSystemDesignTopic: (id: string, partial: Partial<TrackTopic>) => void;
  removeSystemDesignTopic: (id: string) => void;

  // AI Engineering
  aiTopics: TrackTopic[];
  addAiTopic: (topic: Omit<TrackTopic, "id">) => void;
  updateAiTopic: (id: string, partial: Partial<TrackTopic>) => void;
  removeAiTopic: (id: string) => void;

  // Cyber Security
  securityTopics: TrackTopic[];
  addSecurityTopic: (topic: Omit<TrackTopic, "id">) => void;
  updateSecurityTopic: (id: string, partial: Partial<TrackTopic>) => void;
  removeSecurityTopic: (id: string) => void;

  // Career Guide + Assessment Engine
  completedCareerSubtopics: Record<string, boolean>; // subtopicId -> boolean
  toggleCareerSubtopic: (subtopicId: string, topicId: string) => void;
  
  quizAttempts: QuizAttempt[];
  addQuizAttempt: (attempt: QuizAttempt) => void;

  assessmentAttempts: AssessmentAttempt[];
  addAssessmentAttempt: (attempt: AssessmentAttempt) => void;

  interviewSessions: InterviewSession[];
  addInterviewSession: (session: InterviewSession) => void;
  updateInterviewSession: (sessionId: string, partial: Partial<InterviewSession>) => void;

  practicalSubmissions: PracticalSubmission[];
  addPracticalSubmission: (submission: PracticalSubmission) => void;

  codeReviews: CodeReview[];
  addCodeReview: (review: CodeReview) => void;

  topicQuizzes: Record<string, Question[]>; // topicId -> Question[]
  setTopicQuiz: (topicId: string, questions: Question[]) => void;

  topicAssessments: Record<string, Question[]>; // topicId -> Question[]
  setTopicAssessment: (topicId: string, questions: Question[]) => void;

  topicMasteries: Record<string, TopicMastery>;
  recalculateMastery: (topicId: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      userProfile: { name: "Dhruva Vaghela", role: "AI Backend Engineer" },
      updateUserProfile: (profile) => {
        set((state) => ({ userProfile: { ...state.userProfile, ...profile } }));
      },
      itemState: {},
      toggleItemCompletion: (id: string) => {
        set((state) => {
          const current = state.itemState[id] || { isCompleted: false };
          return {
            itemState: {
              ...state.itemState,
              [id]: {
                ...current,
                isCompleted: !current.isCompleted,
                completedAt: !current.isCompleted ? new Date().toISOString() : undefined,
              },
            },
          };
        });
      },
      updateItemState: (id: string, partialState: Partial<UserItemState>) => {
        set((state) => {
          const current = state.itemState[id] || { isCompleted: false };
          return {
            itemState: {
              ...state.itemState,
              [id]: { ...current, ...partialState },
            }
          };
        });
      },

      knowledgeNodes: [
        {
          id: "http",
          title: "HTTP/REST",
          category: "API",
          description: "Stateless protocol and RESTful design principles.",
          mastery: 80,
          revisionStatus: "good",
          references: [],
          prerequisiteNodeIds: [],
          relatedNodeIds: [],
        },
        {
          id: "auth",
          title: "Authentication",
          category: "Security",
          description: "Verifying identity. Cookies, JWTs, OAuth.",
          mastery: 60,
          revisionStatus: "learning",
          references: [],
          prerequisiteNodeIds: ["http"],
          relatedNodeIds: ["jwt", "oauth"],
        },
        {
          id: "jwt",
          title: "JWT",
          category: "Security",
          description: "Stateless, cryptographically signed tokens.",
          mastery: 75,
          revisionStatus: "good",
          references: [],
          prerequisiteNodeIds: ["auth"],
          relatedNodeIds: [],
        },
        {
          id: "oauth",
          title: "OAuth 2.0",
          category: "Security",
          description: "Delegated authorization framework.",
          mastery: 40,
          revisionStatus: "due",
          references: [],
          prerequisiteNodeIds: ["auth"],
          relatedNodeIds: [],
        },
        {
          id: "db",
          title: "Databases",
          category: "Data",
          description: "Persistent storage. SQL vs NoSQL.",
          mastery: 90,
          revisionStatus: "good",
          references: [],
          prerequisiteNodeIds: [],
          relatedNodeIds: [],
        },
        {
          id: "redis",
          title: "Redis",
          category: "Data",
          description: "In-memory datastore and cache.",
          mastery: 65,
          revisionStatus: "learning",
          references: [],
          prerequisiteNodeIds: ["db"],
          relatedNodeIds: [],
        },
        {
          id: "sys-design",
          title: "System Design",
          category: "Architecture",
          description: "Scaling distributed systems.",
          mastery: 50,
          revisionStatus: "due",
          references: [],
          prerequisiteNodeIds: ["http", "db"],
          relatedNodeIds: ["redis"],
        },
      ],
      addKnowledgeNode: (node) => {
        set((state) => ({
          knowledgeNodes: [...state.knowledgeNodes, node],
        }));
      },
      updateNodeMastery: (id, mastery) => {
        set((state) => ({
          knowledgeNodes: state.knowledgeNodes.map((n) =>
            n.id === id ? { ...n, mastery } : n
          ),
        }));
      },
      updateNodeRevisionStatus: (id, status) => {
        set((state) => ({
          knowledgeNodes: state.knowledgeNodes.map((n) =>
            n.id === id ? { ...n, revisionStatus: status } : n
          ),
        }));
      },

      journalEntries: [],
      addJournalEntry: (entry) => {
        set((state) => ({
          journalEntries: [
            {
              id: crypto.randomUUID(),
              date: new Date().toDateString(),
              ...entry,
            },
            ...state.journalEntries,
          ],
        }));
      },

      projects: [],
      projectReviews: {},
      addProject: (project) => {
        set((state) => ({
          projects: [
            ...state.projects,
            {
              ...project,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        }));
      },
      updateProject: (id, partial) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...partial, updatedAt: new Date().toISOString() } : p
          ),
        }));
      },
      removeProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        }));
      },
      addProjectReview: (review) => {
        set((state) => ({
          projectReviews: {
            ...state.projectReviews,
            [review.projectId]: review,
          },
        }));
      },

      learningStreak: {
        currentStreak: 0,
        lastActiveDate: null,
      },
      updateStreak: () => {
        const today = new Date().toDateString();
        const { lastActiveDate, currentStreak } = get().learningStreak;

        if (lastActiveDate === today) return; // Already updated today

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastActiveDate === yesterday.toDateString()) {
          // Continuous streak
          set((state) => ({
            learningStreak: {
              currentStreak: state.learningStreak.currentStreak + 1,
              lastActiveDate: today,
            },
          }));
        } else {
          // Streak broken or newly started
          set({
            learningStreak: {
              currentStreak: 1,
              lastActiveDate: today,
            },
          });
        }
      },

      weeklyGoals: [],
      toggleGoal: (id: string) => {
        set((state) => ({
          weeklyGoals: state.weeklyGoals.map((g) =>
            g.id === id ? { ...g, done: !g.done } : g
          ),
        }));
      },
      addGoal: (text: string) => {
        const id = crypto.randomUUID();
        set((state) => ({
          weeklyGoals: [...state.weeklyGoals, { id, text, done: false }],
        }));
      },
      removeGoal: (id: string) => {
        set((state) => ({
          weeklyGoals: state.weeklyGoals.filter((g) => g.id !== id),
        }));
      },

      analytics: {
        totalLearningHours: 0,
        problemsSolved: 0,
        projectsBuilt: 0,
      },
      addLearningHours: (hours: number) => {
        set((state) => ({
          analytics: {
            ...state.analytics,
            totalLearningHours: state.analytics.totalLearningHours + hours,
          },
        }));
      },
      addProblemSolved: () => {
        set((state) => ({
          analytics: {
            ...state.analytics,
            problemsSolved: state.analytics.problemsSolved + 1,
          },
        }));
      },
      addProjectBuilt: () => {
        set((state) => ({
          analytics: {
            ...state.analytics,
            projectsBuilt: state.analytics.projectsBuilt + 1,
          },
        }));
      },

      todaysMission: null,
      missionDate: null,
      missionChecklistProgress: {},
      missionHistory: [],
      setTodaysMission: (mission) => {
        set({
          todaysMission: mission,
          missionDate: new Date().toDateString(),
          missionChecklistProgress: {}, // Reset checklist progress
        });
      },
      toggleMissionChecklistItem: (id: string) => {
        set((state) => ({
          missionChecklistProgress: {
            ...state.missionChecklistProgress,
            [id]: !state.missionChecklistProgress[id],
          },
        }));
      },
      completeMission: () => {
        get().updateStreak();
        const { todaysMission, missionDate, missionHistory } = get();
        if (todaysMission && missionDate) {
          set({
            missionHistory: [
              { id: crypto.randomUUID(), date: missionDate, mission: todaysMission, status: "Completed" },
              ...missionHistory
            ],
            todaysMission: null,
          });
        }
      },
      skipMission: () => {
        const { todaysMission, missionDate, missionHistory } = get();
        if (todaysMission && missionDate) {
          set({
            missionHistory: [
              { id: crypto.randomUUID(), date: missionDate, mission: todaysMission, status: "Skipped" },
              ...missionHistory
            ],
            todaysMission: null,
          });
        }
      },
      archiveMission: (id: string) => {
        set((state) => ({
          missionHistory: state.missionHistory.map(m => m.id === id ? { ...m, status: "Archived" } : m)
        }));
      },

      books: [],
      addBook: (book) => set((state) => ({ books: [{ id: crypto.randomUUID(), ...book }, ...state.books] })),
      updateBook: (id, partial) => set((state) => ({ books: state.books.map(b => b.id === id ? { ...b, ...partial } : b) })),
      removeBook: (id) => set((state) => ({ books: state.books.filter(b => b.id !== id) })),

      systemDesignTopics: [],
      addSystemDesignTopic: (topic) => set((state) => ({ systemDesignTopics: [{ id: crypto.randomUUID(), ...topic }, ...state.systemDesignTopics] })),
      updateSystemDesignTopic: (id, partial) => set((state) => ({ systemDesignTopics: state.systemDesignTopics.map(t => t.id === id ? { ...t, ...partial } : t) })),
      removeSystemDesignTopic: (id) => set((state) => ({ systemDesignTopics: state.systemDesignTopics.filter(t => t.id !== id) })),

      aiTopics: [],
      addAiTopic: (topic) => set((state) => ({ aiTopics: [{ id: crypto.randomUUID(), ...topic }, ...state.aiTopics] })),
      updateAiTopic: (id, partial) => set((state) => ({ aiTopics: state.aiTopics.map(t => t.id === id ? { ...t, ...partial } : t) })),
      removeAiTopic: (id) => set((state) => ({ aiTopics: state.aiTopics.filter(t => t.id !== id) })),

      securityTopics: [],
      addSecurityTopic: (topic) => set((state) => ({ securityTopics: [{ id: crypto.randomUUID(), ...topic }, ...state.securityTopics] })),
      updateSecurityTopic: (id, partial) => set((state) => ({ securityTopics: state.securityTopics.map(t => t.id === id ? { ...t, ...partial } : t) })),
      removeSecurityTopic: (id) => set((state) => ({ securityTopics: state.securityTopics.filter(b => b.id !== id) })),

      // Career Guide Implementations
      completedCareerSubtopics: {},
      toggleCareerSubtopic: (subtopicId: string, topicId: string) => {
        set((state) => {
          const updated = {
            ...state.completedCareerSubtopics,
            [subtopicId]: !state.completedCareerSubtopics[subtopicId],
          };
          
          // Helper: Recalculate mastery on state change
          const completedSubtopicIds = Object.keys(updated).filter((k) => updated[k]);
          const newMastery = calculateTopicMastery(
            topicId,
            completedSubtopicIds,
            state.quizAttempts,
            state.assessmentAttempts,
            state.practicalSubmissions,
            state.codeReviews,
            state.interviewSessions
          );

          return {
            completedCareerSubtopics: updated,
            topicMasteries: {
              ...state.topicMasteries,
              [topicId]: newMastery,
            },
          };
        });
      },

      quizAttempts: [],
      addQuizAttempt: (attempt: QuizAttempt) => {
        set((state) => {
          const updatedAttempts = [attempt, ...state.quizAttempts];
          const completedSubtopicIds = Object.keys(state.completedCareerSubtopics).filter((k) => state.completedCareerSubtopics[k]);
          const newMastery = calculateTopicMastery(
            attempt.topicId,
            completedSubtopicIds,
            updatedAttempts,
            state.assessmentAttempts,
            state.practicalSubmissions,
            state.codeReviews,
            state.interviewSessions
          );
          return {
            quizAttempts: updatedAttempts,
            topicMasteries: {
              ...state.topicMasteries,
              [attempt.topicId]: newMastery,
            },
          };
        });
      },

      assessmentAttempts: [],
      addAssessmentAttempt: (attempt: AssessmentAttempt) => {
        set((state) => {
          const updatedAttempts = [attempt, ...state.assessmentAttempts];
          const completedSubtopicIds = Object.keys(state.completedCareerSubtopics).filter((k) => state.completedCareerSubtopics[k]);
          const newMastery = calculateTopicMastery(
            attempt.topicId,
            completedSubtopicIds,
            state.quizAttempts,
            updatedAttempts,
            state.practicalSubmissions,
            state.codeReviews,
            state.interviewSessions
          );
          return {
            assessmentAttempts: updatedAttempts,
            topicMasteries: {
              ...state.topicMasteries,
              [attempt.topicId]: newMastery,
            },
          };
        });
      },

      interviewSessions: [],
      addInterviewSession: (session: InterviewSession) => {
        set((state) => ({
          interviewSessions: [session, ...state.interviewSessions],
        }));
      },
      updateInterviewSession: (sessionId: string, partial: Partial<InterviewSession>) => {
        set((state) => {
          const updatedSessions = state.interviewSessions.map((s) =>
            s.id === sessionId ? { ...s, ...partial } : s
          );
          const targetSession = updatedSessions.find((s) => s.id === sessionId);
          let newMasteries = { ...state.topicMasteries };
          
          if (targetSession) {
            const completedSubtopicIds = Object.keys(state.completedCareerSubtopics).filter((k) => state.completedCareerSubtopics[k]);
            newMasteries[targetSession.topicId] = calculateTopicMastery(
              targetSession.topicId,
              completedSubtopicIds,
              state.quizAttempts,
              state.assessmentAttempts,
              state.practicalSubmissions,
              state.codeReviews,
              updatedSessions
            );
          }

          return {
            interviewSessions: updatedSessions,
            topicMasteries: newMasteries,
          };
        });
      },

      practicalSubmissions: [],
      addPracticalSubmission: (submission: PracticalSubmission) => {
        set((state) => {
          const updatedSubmissions = [submission, ...state.practicalSubmissions];
          const completedSubtopicIds = Object.keys(state.completedCareerSubtopics).filter((k) => state.completedCareerSubtopics[k]);
          const newMastery = calculateTopicMastery(
            submission.topicId,
            completedSubtopicIds,
            state.quizAttempts,
            state.assessmentAttempts,
            updatedSubmissions,
            state.codeReviews,
            state.interviewSessions
          );
          return {
            practicalSubmissions: updatedSubmissions,
            topicMasteries: {
              ...state.topicMasteries,
              [submission.topicId]: newMastery,
            },
          };
        });
      },

      codeReviews: [],
      addCodeReview: (review: CodeReview) => {
        set((state) => ({
          codeReviews: [review, ...state.codeReviews],
        }));
      },

      topicQuizzes: {},
      setTopicQuiz: (topicId: string, questions: Question[]) => {
        set((state) => ({
          topicQuizzes: { ...state.topicQuizzes, [topicId]: questions },
        }));
      },

      topicAssessments: {},
      setTopicAssessment: (topicId: string, questions: Question[]) => {
        set((state) => ({
          topicAssessments: { ...state.topicAssessments, [topicId]: questions },
        }));
      },

      topicMasteries: {},
      recalculateMastery: (topicId: string) => {
        set((state) => {
          const completedSubtopicIds = Object.keys(state.completedCareerSubtopics).filter((k) => state.completedCareerSubtopics[k]);
          const newMastery = calculateTopicMastery(
            topicId,
            completedSubtopicIds,
            state.quizAttempts,
            state.assessmentAttempts,
            state.practicalSubmissions,
            state.codeReviews,
            state.interviewSessions
          );
          return {
            topicMasteries: {
              ...state.topicMasteries,
              [topicId]: newMastery,
            },
          };
        });
      },
    }),
    {
      name: "engineeros-storage", // name of the item in the storage (must be unique)
    }
  )
);
