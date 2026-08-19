import { AiProvider } from "./ai-provider.interface";
import { callGeminiWithModelFallback } from "@/features/career-guide/services/gemini-client";

export class GeminiProvider implements AiProvider {
  async generateJson(systemPrompt: string, userPrompt: string): Promise<string> {
    return await callGeminiWithModelFallback({
      taskType: "mission",
      systemPrompt,
      userPrompt,
      temperature: 0.3,
    });
  }
}
