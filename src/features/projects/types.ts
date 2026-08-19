export type ProjectCategory = 
  | "Hackathon"
  | "College Project"
  | "Freelance"
  | "Research"
  | "Personal Project"
  | "Startup Idea"
  | "Problem Statement"
  | "Open Source"
  | "Competition"
  | "Client Work"
  | "Other";

export type ProjectStatus = "Planning" | "In Progress" | "Completed" | "Archived" | "Maintained";

export type ProjectSource = "MANUAL" | "GITHUB";

export interface ProjectMedia {
  images?: string[];
  videos?: string[];
  pdfs?: string[];
  presentation?: string;
  demo?: string;
}

export interface ProjectDevelopmentInfo {
  features?: string[];
  challenges?: string;
  architecture?: string;
  decisions?: string;
  learningOutcomes?: string;
  futureImprovements?: string;
}

export interface Project {
  id: string;
  source: ProjectSource;
  
  // General
  title: string;
  description: string;
  category: ProjectCategory;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  technologies: string[];
  githubUrl?: string;
  liveLink?: string;
  documentationUrl?: string;
  teamSize?: number;
  myRole?: string;

  // Development details (Mostly for manual projects)
  development?: ProjectDevelopmentInfo;

  // Portfolio Media
  media?: ProjectMedia;
  
  // For GitHub imported projects, we might store the original repo ID
  githubRepoId?: number;
  
  createdAt: string;
  updatedAt: string;
}

export type ReviewRating = "Beginner" | "Intermediate" | "Strong" | "Excellent";

export interface InterviewReview {
  id: string;
  projectId: string;
  
  overallRating: ReviewRating;
  evaluations: {
    technicalDepth: ReviewRating;
    architecture: ReviewRating;
    scalability: ReviewRating;
    maintainability: ReviewRating;
    security: ReviewRating;
    performance: ReviewRating;
    documentation: ReviewRating;
    folderStructure: ReviewRating;
    resumeQuality: ReviewRating;
  };
  strengths: string[];
  weaknesses: string[];
  missingConcepts: string[];
  resumeSuggestions: string[];
  portfolioSuggestions: string[];
  likelyInterviewQuestions: string[];
  likelyFollowUpQuestions: string[];
  suggestedImprovements: string[];
  hiringReadiness: string;
  
  generatedAt: string;
}
