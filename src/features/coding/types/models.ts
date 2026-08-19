export enum CodingPlatform {
  LeetCode = "LeetCode",
  HackerRank = "HackerRank",
  Codeforces = "Codeforces",
  CodeChef = "CodeChef",
  AtCoder = "AtCoder",
  GeeksforGeeks = "GeeksforGeeks",
  Other = "Other"
}

export enum Difficulty {
  Easy = "Easy",
  Medium = "Medium",
  Hard = "Hard"
}

export enum ProblemStatus {
  NotStarted = "Not Started",
  Attempted = "Attempted",
  Solved = "Solved",
  Revised = "Revised"
}

export enum ProblemDomain {
  // Programming Fundamentals
  Variables = "Variables",
  Loops = "Loops",
  Functions = "Functions",
  Recursion = "Recursion",
  OOP = "OOP",
  
  // Data Structures
  Arrays = "Arrays",
  Strings = "Strings",
  Hashing = "Hashing",
  LinkedList = "Linked List",
  Stack = "Stack",
  Queue = "Queue",
  Trees = "Trees",
  BinarySearchTree = "Binary Search Tree",
  Heap = "Heap",
  Trie = "Trie",
  Graph = "Graph",

  // Algorithms
  BinarySearch = "Binary Search",
  SlidingWindow = "Sliding Window",
  TwoPointer = "Two Pointer",
  PrefixSum = "Prefix Sum",
  Sorting = "Sorting",
  Greedy = "Greedy",
  Backtracking = "Backtracking",
  DivideAndConquer = "Divide & Conquer",
  DynamicProgramming = "Dynamic Programming",
  BitManipulation = "Bit Manipulation",
  Mathematics = "Mathematics",

  // Backend
  REST_APIs = "REST APIs",
  Authentication = "Authentication",
  JWT = "JWT",
  Express = "Express",
  NodeJS = "Node.js",
  Middleware = "Middleware",

  // Database
  SQL = "SQL",
  MongoDB = "MongoDB",
  Redis = "Redis",

  // Computer Science
  DBMS = "DBMS",
  OperatingSystems = "Operating Systems",
  ComputerNetworks = "Computer Networks",

  // System Design
  LowLevelDesign = "Low Level Design",
  HighLevelDesign = "High Level Design",

  // AI
  MachineLearning = "Machine Learning",
  DeepLearning = "Deep Learning",
  LLM = "LLM",
  RAG = "RAG",

  // Cyber Security
  Cryptography = "Cryptography",
  Networking = "Networking",
  WebSecurity = "Web Security"
}

export type CodeStrengthRating = "Poor" | "Fair" | "Good" | "Strong" | "Excellent";

export interface AIReview {
  // 1. Correctness
  correctness: {
    isCorrect: boolean;
    handlesEdgeCases: boolean;
    logicalMistakes: string[];
  };

  // 2. Time Complexity
  timeComplexity: {
    exactTC: string;
    explanation: string;
    optimalTC: string;
    isOptimal: boolean;
  };

  // 3. Space Complexity
  spaceComplexity: {
    exactSC: string;
    explanation: string;
    optimalSC: string;
  };

  // 4. Code Strength Rating
  codeStrengthRating: CodeStrengthRating;
  ratingJustification: string;

  // 5. Interview Evaluation
  interviewEvaluation: {
    wouldPass: boolean;
    interviewReadinessScore: number; // out of 100
    difficultyHandled: string;
    followUpQuestions: string[];
    prerequisiteConcepts: string[];
  };

  // 6. Optimization Review
  optimizationReview: {
    betterAlgorithms: string[];
    betterDataStructures: string[];
    whyOptimalIsBetter: string;
    tradeOffs: string;
  };

  // 7. Code Quality
  codeQuality: {
    namingConventions: string;
    readability: string;
    functionDesign: string;
    modularity: string;
    bestPractices: string[];
    cleanCodePrinciples: string[];
  };

  // 8. Edge Case Analysis
  edgeCaseAnalysis: {
    missingEdgeCases: string[];
    possibleBugs: string[];
    overflowIssues: string[];
    boundaryConditions: string[];
    invalidInputHandling: string;
  };

  // 9. Learning Feedback
  learningFeedback: {
    biggestStrength: string;
    biggestWeakness: string;
    mistakesToAvoid: string[];
    topicsToRevise: string[];
    recommendedNextDifficulty: string;
    recommendedDomains: string[];
  };

  // 10. Overall Evaluation
  overallEvaluation: {
    overallScore: number;
    confidenceScore: number;
    hiringReadiness: string;
    estimatedPerformance: string;
  };

  // 11. Comparison with Optimal Solution
  comparison: {
    myTC: string;
    optTC: string;
    mySC: string;
    optSC: string;
    requiredImprovements: string;
  };

  generatedAt: string; // ISO date
}

export interface Solution {
  id: string;
  code: string;
  language: string;
  aiReview?: AIReview;
  submittedAt: string; // ISO date
}

export interface RevisionData {
  revisionCount: number;
  lastRevisionDate?: string; // ISO date
  nextSuggestedRevision?: string; // ISO date
}

export interface CodingProblem {
  id: string;
  title: string;
  platform: CodingPlatform;
  url?: string;
  dateSolved?: string; // ISO date string, undefined if not solved
  timeTaken: number; // in minutes
  attemptCount: number;
  difficulty: Difficulty;
  status: ProblemStatus;
  domains: ProblemDomain[];
  
  personalNotes: string;
  keyLearning: string;
  commonMistakes: string;
  optimizedApproach: string;
  bruteForceApproach: string;
  
  timeComplexity: string;
  spaceComplexity: string;
  
  confidenceScore: number; // 1 to 10
  needsRevision: boolean;
  favorite: boolean;
  tags: string[]; // custom tags
  
  solutions: Solution[];
  revision: RevisionData;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}
