import { MentorContext, MentorRecommendation, ProviderType } from "./types";
import { buildSystemPrompt, buildUserPrompt } from "./prompts";
import { AiProvider } from "./providers/ai-provider.interface";
import { OpenAiProvider } from "./providers/openai.provider";
import { ClaudeProvider } from "./providers/claude.provider";
import { GeminiProvider } from "./providers/gemini.provider";

export class AiMentorService {
  private getProvider(providerName: ProviderType): AiProvider {
    switch (providerName) {
      case "openai":
        return new OpenAiProvider();
      case "claude":
        return new ClaudeProvider();
      case "gemini":
        return new GeminiProvider();
      default:
        throw new Error(`Unsupported AI Provider: ${providerName}`);
    }
  }

  /**
   * Generates a personalized set of recommendations based on the user's application data.
   * @param context Real application data (weaknesses, schedule, github activity).
   * @param providerName The AI provider to use.
   * @returns A strongly typed MentorRecommendation object.
   */
  public async generateRecommendations(
    context: MentorContext,
    providerName: ProviderType = "gemini",
  ): Promise<MentorRecommendation> {
    const provider = this.getProvider(providerName);

    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(context);

    try {
      const rawJsonString = await provider.generateJson(systemPrompt, userPrompt);
      const parsed = this.parseAndValidate(rawJsonString);
      return parsed;
    } catch (error) {
      console.warn("AI Mentor API call unavailable or 503 spike. Generating high-quality contextual fallback mission:", error);
      
      const phaseName = context.currentPhase.name || "Software Engineering Foundations";
      const phaseDesc = context.currentPhase.description || "Mastering fundamental engineering principles.";
      
      return {
        todaysMission: {
          title: `Mastery Focus — ${phaseName}`,
          description: `Targeted practice for ${phaseName}: ${phaseDesc}`,
          checklist: [
            `Review core subtopics and documentation for ${phaseName}`,
            `Complete at least 2 practice & debugging exercises`,
            `Take the 5-question Topic Quiz and target score ≥ 80%`,
            `Review edge cases, failure modes, and performance trade-offs`
          ],
          estimatedTimeMinutes: context.availableStudyTimeMinutes || 90,
          reason: `Personalized daily focus on ${phaseName} based on your active 12-Module Career Guide curriculum.`
        },
        weeklyGoal: {
          title: `Complete ${phaseName}`,
          description: `Attain Topic Mastery (≥80%) across Quiz, Assessment, and Practical Validation.`,
          milestone: `Pass Module Topic Assessment with score ≥ 80%`
        },
        revisionTasks: context.weakestSkills.map(w => ({
          topic: w.name,
          reason: `Current mastery is ${w.score}%. Review fundamental concepts and edge cases.`
        })),
        codingPractice: {
          platform: "LeetCode",
          difficulty: "Medium",
          problemType: "Data Structures & Algorithms",
          link: "https://leetcode.com/problemset/all/"
        },
        readingRecommendation: {
          title: "Designing Data-Intensive Applications",
          topic: phaseName,
          rationale: "Essential reading for architectural depth and system design foundations."
        },
        projectRecommendation: {
          title: context.unfinishedProjects[0]?.name || "Portfolio Microservice",
          nextSteps: [
            "Refactor core module logic to follow clean architecture",
            "Add defensive input validation and error handling schemas"
          ]
        },
        interviewPreparation: {
          question: `In a production service, how do you handle failure modes, rate limiting, and edge cases for ${phaseName}?`,
          tips: [
            "Structure your answer with Situation, Task, Action, Result",
            "Mention telemetry, monitoring metrics, and performance trade-offs"
          ]
        },
        systemDesignTopic: {
          topic: phaseName,
          coreConcepts: ["Scalability", "Fault Tolerance", "Data Integrity"]
        }
      };
    }
  }

  /**
   * Sanitizes the JSON string (stripping markdown code blocks if any provider ignored instructions)
   * and parses it into the expected interface.
   */
  private parseAndValidate(rawJson: string): MentorRecommendation {
    let cleanJson = rawJson.trim();

    // Remove markdown code blocks if the LLM output them anyway
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

      // Perform a light structural validation here to ensure it roughly matches the interface
      if (!parsed.todaysMission || !parsed.weeklyGoal) {
        throw new Error("Missing required structural keys in AI response.");
      }

      return parsed as MentorRecommendation;
    } catch (e: any) {
      throw new Error(`Failed to parse AI Mentor output as JSON: ${e.message}\nRaw Output: ${rawJson}`);
    }
  }
}

// Export a singleton instance
export const aiMentorService = new AiMentorService();
