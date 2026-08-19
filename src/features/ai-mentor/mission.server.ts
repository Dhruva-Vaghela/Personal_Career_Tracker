import { createServerFn } from "@tanstack/react-start";
import { aiMentorService } from "./ai-mentor.service";
import type { MentorContext, MentorRecommendation } from "./types";

export const generateMissionServerFn = createServerFn({ method: "POST" })
  .validator((data: MentorContext) => data)
  .handler(async ({ data }): Promise<{ recommendations: MentorRecommendation }> => {
    const recommendations = await aiMentorService.generateRecommendations(data, "gemini");
    return { recommendations };
  });
