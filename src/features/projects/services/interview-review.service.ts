import type { Project, InterviewReview } from "../types";
import { callGeminiWithModelFallback } from "@/features/career-guide/services/gemini-client";

export class InterviewReviewService {
  public async generateReview(
    project: Project,
  ): Promise<InterviewReview> {
    const systemPrompt = `You are a strict, experienced Staff Software Engineer acting as an interviewer at a top-tier tech company.
Your goal is to evaluate a candidate's project portfolio piece.

You MUST respond ONLY with a valid JSON object matching the exact schema below. Do not include markdown code blocks (e.g. \`\`\`json) or any conversational text.

Schema:
{
  "overallRating": "Beginner" | "Intermediate" | "Strong" | "Excellent",
  "evaluations": {
    "technicalDepth": "Beginner" | "Intermediate" | "Strong" | "Excellent",
    "architecture": "Beginner" | "Intermediate" | "Strong" | "Excellent",
    "scalability": "Beginner" | "Intermediate" | "Strong" | "Excellent",
    "maintainability": "Beginner" | "Intermediate" | "Strong" | "Excellent",
    "security": "Beginner" | "Intermediate" | "Strong" | "Excellent",
    "performance": "Beginner" | "Intermediate" | "Strong" | "Excellent",
    "documentation": "Beginner" | "Intermediate" | "Strong" | "Excellent",
    "folderStructure": "Beginner" | "Intermediate" | "Strong" | "Excellent",
    "resumeQuality": "Beginner" | "Intermediate" | "Strong" | "Excellent"
  },
  "strengths": ["string"],
  "weaknesses": ["string"],
  "missingConcepts": ["string"],
  "resumeSuggestions": ["string"],
  "portfolioSuggestions": ["string"],
  "likelyInterviewQuestions": ["string"],
  "likelyFollowUpQuestions": ["string"],
  "suggestedImprovements": ["string"],
  "hiringReadiness": "string"
}`;

    const userPrompt = `Please evaluate the following project:

Title: ${project.title}
Category: ${project.category}
Status: ${project.status}
Technologies: ${project.technologies.join(", ")}
Description: ${project.description}

Development Context:
Features: ${project.development?.features?.join(", ") || "N/A"}
Challenges: ${project.development?.challenges || "N/A"}
Architecture: ${project.development?.architecture || "N/A"}
Decisions: ${project.development?.decisions || "N/A"}
Learning Outcomes: ${project.development?.learningOutcomes || "N/A"}
Future Improvements: ${project.development?.futureImprovements || "N/A"}

Please generate the interview review as JSON.`;

    try {
      const rawJsonString = await callGeminiWithModelFallback({
        taskType: "review",
        systemPrompt,
        userPrompt,
        temperature: 0.2,
      });

      const parsed = this.parseAndValidate(rawJsonString);
      
      return {
        id: crypto.randomUUID(),
        projectId: project.id,
        ...parsed,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Interview Review failed to generate:", error);
      throw error;
    }
  }

  private parseAndValidate(rawJson: string): Omit<InterviewReview, "id" | "projectId" | "generatedAt"> {
    let cleanJson = rawJson.trim();

    if (cleanJson.startsWith("```json")) {
      cleanJson = cleanJson.replace(/^```json/, "");
    }
    if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```/, "");
    }
    if (cleanJson.endsWith("```")) {
      cleanJson = cleanJson.substring(0, cleanJson.length - 3).trim();
    }

    try {
      const parsed = JSON.parse(cleanJson);

      if (!parsed.overallRating || !parsed.strengths || !parsed.weaknesses || !parsed.evaluations) {
        throw new Error("Missing required structural keys in Interview Review response.");
      }

      return parsed;
    } catch (e: any) {
      throw new Error(`Failed to parse AI Interview Review output as JSON: ${e.message}\nRaw Output: ${rawJson}`);
    }
  }
}

export const interviewReviewService = new InterviewReviewService();
