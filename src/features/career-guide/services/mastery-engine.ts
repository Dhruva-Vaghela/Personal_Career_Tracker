import type {
  TopicMastery,
  TopicStatus,
  CareerReadinessBreakdown,
  QuizAttempt,
  AssessmentAttempt,
  PracticalSubmission,
  CodeReview,
  InterviewSession
} from "../types";
import careerCurriculum from "@/data/career-curriculum.json";

export const DEFAULT_THRESHOLDS = {
  quizPassing: 80,
  assessmentPassing: 80,
  practicalPassing: 75,
};

export function calculateTopicMastery(
  topicId: string,
  completedSubtopicIds: string[],
  quizAttempts: QuizAttempt[],
  assessmentAttempts: AssessmentAttempt[],
  practicalSubmissions: PracticalSubmission[],
  codeReviews: CodeReview[] = [],
  interviewSessions: InterviewSession[] = []
): TopicMastery {
  // Find topic in curriculum
  let totalSubtopics = 1;
  let topicFound = false;

  for (const mod of careerCurriculum.modules) {
    const t = mod.topics.find((tp) => tp.id === topicId);
    if (t) {
      totalSubtopics = t.subtopics.length || 1;
      topicFound = true;
      break;
    }
  }

  // 1. Knowledge Score (Subtopic completion)
  const completedCount = completedSubtopicIds.length;
  const knowledgeScore = Math.min(100, Math.round((completedCount / totalSubtopics) * 100));

  // 2. Best Quiz Score
  const topicQuizzes = quizAttempts.filter((q) => q.topicId === topicId);
  const quizScore = topicQuizzes.length > 0
    ? Math.max(...topicQuizzes.map((q) => q.score))
    : 0;
  const passedQuiz = quizScore >= DEFAULT_THRESHOLDS.quizPassing;

  // 3. Best Assessment Score
  const topicAssessments = assessmentAttempts.filter((a) => a.topicId === topicId);
  const assessmentScore = topicAssessments.length > 0
    ? Math.max(...topicAssessments.map((a) => a.overallScore))
    : 0;
  const passedAssessment = assessmentScore >= DEFAULT_THRESHOLDS.assessmentPassing;

  // 4. Best Practical Score
  const topicPracticals = practicalSubmissions.filter((p) => p.topicId === topicId);
  const practicalScore = topicPracticals.length > 0
    ? Math.max(...topicPracticals.map((p) => p.evaluation?.score || 0))
    : 0;
  const passedPractical = topicPracticals.length === 0 ? true : practicalScore >= DEFAULT_THRESHOLDS.practicalPassing;

  // 5. Code Quality Score
  const codeQualityScore = codeReviews.length > 0
    ? Math.round(codeReviews.reduce((acc, r) => acc + r.overallScore, 0) / codeReviews.length)
    : Math.max(quizScore, assessmentScore);

  // 6. Interview Readiness Score for Topic
  const topicInterviews = interviewSessions.filter((s) => s.topicId === topicId && s.overallEvaluation);
  const interviewReadinessScore = topicInterviews.length > 0
    ? Math.round(topicInterviews.reduce((acc, s) => acc + (s.overallEvaluation?.score || 0), 0) / topicInterviews.length)
    : Math.round((quizScore + assessmentScore) / 2);

  // Weighted Mastery Formula
  const masteryPercentage = Math.round(
    knowledgeScore * 0.15 +
    quizScore * 0.20 +
    assessmentScore * 0.30 +
    practicalScore * 0.20 +
    codeQualityScore * 0.15
  );

  // Determine Topic Status
  let status: TopicStatus = "Not Started";

  if (passedQuiz && passedAssessment && passedPractical && masteryPercentage >= 80) {
    status = "Mastered";
  } else if (passedQuiz && passedAssessment) {
    status = "Passed";
  } else if (
    (topicQuizzes.length > 0 && quizScore < DEFAULT_THRESHOLDS.quizPassing) ||
    (topicAssessments.length > 0 && assessmentScore < DEFAULT_THRESHOLDS.assessmentPassing)
  ) {
    status = "Needs Revision";
  } else if (passedQuiz && topicAssessments.length === 0) {
    status = "Assessment Pending";
  } else if (completedCount > 0) {
    status = "Practicing";
  } else if (knowledgeScore > 0) {
    status = "Learning";
  }

  return {
    topicId,
    status,
    masteryPercentage,
    knowledgeScore,
    quizScore,
    assessmentScore,
    practicalScore,
    codeQualityScore,
    interviewReadinessScore,
    lastUpdated: new Date().toISOString(),
    passedQuiz,
    passedAssessment,
    passedPractical,
  };
}

export function calculateCareerReadiness(
  topicMasteries: Record<string, TopicMastery>,
  completedProjectCount: number = 0
): CareerReadinessBreakdown {
  const moduleScores: Record<string, number> = {};

  careerCurriculum.modules.forEach((mod) => {
    let modScore = 0;
    if (mod.topics.length > 0) {
      const sum = mod.topics.reduce((acc, t) => {
        const m = topicMasteries[t.id];
        return acc + (m ? m.masteryPercentage : 0);
      }, 0);
      modScore = Math.round(sum / mod.topics.length);
    }
    moduleScores[mod.id] = modScore;
  });

  // Category aggregations:
  // 1. Fundamentals (Module 1, 3)
  const fundamentalsScore = Math.round(((moduleScores["mod-1"] || 0) + (moduleScores["mod-3"] || 0)) / 2);

  // 2. Problem Solving (Module 2)
  const problemSolvingScore = moduleScores["mod-2"] || 0;

  // 3. Technical Skills (Module 4, 5, 6, 7)
  const technicalSkillsScore = Math.round(
    ((moduleScores["mod-4"] || 0) +
      (moduleScores["mod-5"] || 0) +
      (moduleScores["mod-6"] || 0) +
      (moduleScores["mod-7"] || 0)) /
      4
  );

  // 4. Projects (Based on completed portfolio projects & practicals)
  const projectScoreFromMasteries = Math.round(
    Object.values(topicMasteries).reduce((acc, tm) => acc + tm.practicalScore, 0) /
      Math.max(1, Object.keys(topicMasteries).length)
  );
  const projectsScore = Math.min(100, Math.round(projectScoreFromMasteries * 0.6 + Math.min(100, completedProjectCount * 25) * 0.4));

  // 5. Software Engineering (Module 8, 9, 10)
  const softwareEngineeringScore = Math.round(
    ((moduleScores["mod-8"] || 0) + (moduleScores["mod-9"] || 0) + (moduleScores["mod-10"] || 0)) / 3
  );

  // 6. AI Engineering (Module 11)
  const aiEngineeringScore = moduleScores["mod-11"] || 0;

  // 7. Interview Readiness (Module 12)
  const interviewReadinessScore = moduleScores["mod-12"] || 0;

  // Final Overall Career Readiness Formula
  const overallPercentage = Math.round(
    fundamentalsScore * 0.10 +
    problemSolvingScore * 0.15 +
    technicalSkillsScore * 0.25 +
    projectsScore * 0.15 +
    softwareEngineeringScore * 0.15 +
    aiEngineeringScore * 0.10 +
    interviewReadinessScore * 0.10
  );

  let readinessLabel: CareerReadinessBreakdown["readinessLabel"] = "Novice";
  if (overallPercentage >= 85) readinessLabel = "Elite Candidate";
  else if (overallPercentage >= 75) readinessLabel = "Job Ready";
  else if (overallPercentage >= 60) readinessLabel = "Practitioner";
  else if (overallPercentage >= 40) readinessLabel = "Apprentice";

  return {
    overallPercentage,
    fundamentalsScore,
    problemSolvingScore,
    technicalSkillsScore,
    projectsScore,
    softwareEngineeringScore,
    aiEngineeringScore,
    interviewReadinessScore,
    readinessLabel,
  };
}
