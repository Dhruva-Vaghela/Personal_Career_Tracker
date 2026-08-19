export type QuestionDifficulty = "beginner" | "intermediate" | "advanced" | "interview-ready";

export type QuestionType =
  | "multiple-choice"
  | "multiple-select"
  | "scenario"
  | "debugging"
  | "code-reading"
  | "concept-comparison"
  | "short-answer"
  | "coding"
  | "architecture";

export type TopicStatus =
  | "Not Started"
  | "Learning"
  | "Practicing"
  | "Assessment Pending"
  | "Needs Revision"
  | "Passed"
  | "Mastered";

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  topicId: string;
  subtopicId: string;
  prompt: string;
  codeSnippet?: string;
  options?: QuestionOption[];
  correctAnswer?: string | string[]; // Option ID or expected text/code
  explanation: string;
  expectedConcepts: string[];
  evaluationCriteria?: string[];
}

export interface QuestionAnswerPayload {
  questionId: string;
  selectedOptionIds?: string[];
  userTextAnswer?: string;
  userCodeAnswer?: string;
}

export interface QuestionEvaluationResult {
  questionId: string;
  score: number; // 0 to 100
  isCorrect: boolean;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  missingConcepts: string[];
}

export interface QuizAttempt {
  id: string;
  topicId: string;
  timestamp: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  passed: boolean;
  questions: Question[];
  userAnswers: Record<string, string[] | string>;
}

export interface AssessmentAttempt {
  id: string;
  topicId: string;
  timestamp: string;
  overallScore: number;
  passed: boolean;
  questions: Question[];
  evaluations: Record<string, QuestionEvaluationResult>;
  strengths: string[];
  weaknesses: string[];
  weakSubtopics: string[];
  recommendedRevisionPlan?: RevisionPlan;
}

export interface RevisionPlan {
  id: string;
  topicId: string;
  createdAt: string;
  weakSubtopics: string[];
  summary: string;
  activities: {
    subtopicId: string;
    subtopicTitle: string;
    conceptSummary: string;
    recommendedActions: string[];
    practicePrompt: string;
  }[];
}

export interface InterviewTurn {
  id: string;
  speaker: "interviewer" | "candidate";
  text: string;
  timestamp: string;
  codeSnippet?: string;
  evaluation?: {
    score: number; // 0 to 100
    technicalReasoning: string;
    missingConcepts: string[];
    feedback: string;
  };
}

export interface InterviewSession {
  id: string;
  moduleId: string;
  topicId: string;
  difficulty: QuestionDifficulty;
  createdAt: string;
  status: "in-progress" | "completed";
  turns: InterviewTurn[];
  overallEvaluation?: {
    score: number;
    readinessRating: "Needs Work" | "Developing" | "Solid" | "Interview Ready";
    summary: string;
    keyStrengths: string[];
    areasForImprovement: string[];
  };
}

export interface CodeReviewSeverityItem {
  id: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  category: "Correctness" | "Performance" | "Security" | "Architecture" | "Testing" | "Code Style";
  description: string;
  recommendedFix: string;
  explanation: string;
  conceptsToReview: string[];
}

export interface CodeReview {
  id: string;
  title: string;
  language: string;
  code: string;
  createdAt: string;
  overallScore: number;
  summary: string;
  strengths: string[];
  issues: CodeReviewSeverityItem[];
  architecturalSuggestions: string[];
}

export interface FlawedCodeAssessment {
  id: string;
  topicId: string;
  title: string;
  scenarioDescription: string;
  flawedCode: string;
  language: string;
  knownFlaws: {
    id: string;
    type: string;
    description: string;
  }[];
}

export interface FlawedCodeSubmission {
  assessmentId: string;
  identifiedProblems: string;
  fixedCode: string;
  explanation: string;
  submittedAt: string;
  evaluation?: {
    score: number;
    identifiedFlawsCount: number;
    totalFlawsCount: number;
    feedback: string;
    fixQuality: string;
  };
}

export interface PracticalTask {
  id: string;
  topicId: string;
  title: string;
  description: string;
  requirements: string[];
  evaluationCriteria: string[];
  reflectionQuestions: string[];
}

export interface PracticalSubmission {
  id: string;
  taskId: string;
  topicId: string;
  submittedAt: string;
  repositoryOrCode: string;
  reflectionAnswers: Record<string, string>;
  usedAiAssistance: boolean;
  evaluation?: {
    score: number;
    passed: boolean;
    functionalityScore: number;
    codeQualityScore: number;
    architectureScore: number;
    understandingScore: number;
    feedback: string;
    strengths: string[];
    weaknesses: string[];
  };
}

export interface TopicMastery {
  topicId: string;
  status: TopicStatus;
  masteryPercentage: number;
  knowledgeScore: number; // Subtopics completed %
  quizScore: number;
  assessmentScore: number;
  practicalScore: number;
  codeQualityScore: number;
  interviewReadinessScore: number;
  lastUpdated: string;
  passedQuiz: boolean;
  passedAssessment: boolean;
  passedPractical: boolean;
}

export interface CareerReadinessBreakdown {
  overallPercentage: number;
  fundamentalsScore: number;
  problemSolvingScore: number;
  technicalSkillsScore: number;
  projectsScore: number;
  softwareEngineeringScore: number;
  aiEngineeringScore: number;
  interviewReadinessScore: number;
  readinessLabel: "Novice" | "Apprentice" | "Practitioner" | "Job Ready" | "Elite Candidate";
}

export interface CareerSubtopic {
  id: string;
  title: string;
  description: string;
  keyConcepts: string[];
}

export interface LearningResource {
  id: string;
  title: string;
  type: "documentation" | "article" | "video" | "course" | "book" | string;
  url: string;
  isFree: boolean;
}

export interface PracticeExercise {
  id: string;
  title: string;
  type: "concept-question" | "debugging-task" | "coding-task" | "implementation" | string;
  prompt: string;
  initialCode?: string;
  solutionOrHint?: string;
}

export interface CareerTopic {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  subtopics: CareerSubtopic[];
  resources: LearningResource[];
  practiceExercises: PracticeExercise[];
  practicalTask?: PracticalTask;
}

export interface CareerModule {
  id: string;
  number: number;
  title: string;
  description: string;
  category:
    | "Foundations"
    | "Problem Solving"
    | "Web"
    | "Frontend"
    | "Backend"
    | "Databases"
    | "Full-Stack"
    | "Software Engineering"
    | "DevOps"
    | "System Design"
    | "AI Engineering"
    | "Interview Prep";
  topics: CareerTopic[];
}

export interface CareerCurriculum {
  id: string;
  title: string;
  description: string;
  modules: CareerModule[];
}
