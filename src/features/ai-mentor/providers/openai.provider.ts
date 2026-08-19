import { AiProvider } from "./ai-provider.interface";

export class OpenAiProvider implements AiProvider {
  private apiKey: string;

  constructor() {
    // In a real app, you would inject this or read from env
    this.apiKey = process.env.OPENAI_API_KEY || "";
  }

  async generateJson(systemPrompt: string, userPrompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error("OPENAI_API_KEY is not configured.");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Cost-effective model for JSON tasks
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2, // Low temperature for deterministic, structured output
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "{}";
  }
}
