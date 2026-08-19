import type { Project, InterviewReview } from "../types";
import { generateProjectReviewServerFn } from "@/features/career-guide/services/gemini-assessment.server";

export class InterviewReviewService {
  public async generateReview(
    project: Project,
  ): Promise<InterviewReview> {
    const res = await generateProjectReviewServerFn({
      data: {
        project: {
          id: project.id,
          title: project.title,
          category: project.category,
          status: project.status,
          technologies: project.technologies,
          description: project.description,
          development: project.development,
        },
      },
    });

    return {
      id: crypto.randomUUID(),
      projectId: project.id,
      ...res.review,
      generatedAt: new Date().toISOString(),
    };
  }
}

export const interviewReviewService = new InterviewReviewService();
