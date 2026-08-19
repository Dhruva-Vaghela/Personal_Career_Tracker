import { AiProvider } from "./ai-provider.interface";

export class ClaudeProvider implements AiProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY || "";
  }

  async generateJson(systemPrompt: string, userPrompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not configured.");
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307", // Fast model for JSON tasks
        system: systemPrompt,
        messages: [
          { role: "user", content: userPrompt },
          // Prefill assistant response to force JSON output without preamble
          { role: "assistant", content: "{" }
        ],
        temperature: 0.2,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || "";
    // Prepend the opening brace because we pre-filled it in the request
    return "{" + content;
  }
}
