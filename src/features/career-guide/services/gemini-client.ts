export type GeminiTaskType =
  | "heavy"
  | "quiz"
  | "assessment"
  | "mission"
  | "review"
  | "light"
  | "interview"
  | "revision"
  | "practical";

// Official Google Generative AI v1beta valid REST model identifiers
const MODEL_CHAINS: Record<GeminiTaskType, string[]> = {
  // Heavy / Complex tasks
  heavy: ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash-exp", "gemini-flash-latest"],
  quiz: ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash-exp", "gemini-flash-latest"],
  assessment: ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-2.0-flash-exp", "gemini-flash-latest"],
  mission: ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash-exp", "gemini-flash-latest"],
  review: ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-2.0-flash-exp", "gemini-flash-latest"],

  // Interactive / Lower latency tasks
  light: ["gemini-1.5-flash", "gemini-2.0-flash-exp", "gemini-flash-latest"],
  interview: ["gemini-1.5-flash", "gemini-2.0-flash-exp", "gemini-flash-latest"],
  revision: ["gemini-1.5-flash", "gemini-2.0-flash-exp", "gemini-flash-latest"],
  practical: ["gemini-1.5-flash", "gemini-2.0-flash-exp", "gemini-flash-latest"],
};

interface CallGeminiOptions {
  taskType: GeminiTaskType;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxRetriesPerModel?: number;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function getGeminiApiKey(): string {
  let key = "";

  // 1. Try import.meta.env (Vite client & server side)
  try {
    if (typeof import.meta !== "undefined" && import.meta.env) {
      key = import.meta.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || "";
    }
  } catch (e) {}

  // 2. Try process.env (Node.js runtime server functions)
  if (!key) {
    try {
      if (typeof process !== "undefined" && process.env) {
        key = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "";
      }
    } catch (e) {}
  }

  return key;
}

export async function callGeminiWithModelFallback(options: CallGeminiOptions): Promise<string> {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    throw new Error("Gemini API key is missing. Please ensure GEMINI_API_KEY or VITE_GEMINI_API_KEY is configured in your .env file.");
  }

  const modelList = MODEL_CHAINS[options.taskType] || MODEL_CHAINS.heavy;
  const maxRetries = options.maxRetriesPerModel ?? 3;
  const temperature = options.temperature ?? 0.3;

  let lastErrorMessage = "";

  for (const modelName of modelList) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: options.systemPrompt }],
            },
            contents: [
              {
                role: "user",
                parts: [{ text: options.userPrompt }],
              },
            ],
            generationConfig: {
              response_mime_type: "application/json",
              temperature,
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (content && content.trim()) {
            return content;
          }
        }

        const errorText = await response.text();
        const status = response.status;
        lastErrorMessage = `Gemini ${modelName} returned HTTP ${status}: ${errorText.substring(0, 150)}`;
        console.warn(`[Gemini Attempt ${attempt} on ${modelName}] HTTP ${status}: ${errorText.substring(0, 120)}`);

        // If HTTP 503 (high demand) or 429 (rate limit), pause with exponential backoff before retry
        if (status === 503 || status === 429) {
          if (attempt < maxRetries) {
            await delay(attempt * 1000); // 1s, 2s, 3s backoff
            continue;
          }
        } else {
          // If 404 or non-retriable, move directly to next model in fallback chain
          break;
        }
      } catch (err: any) {
        lastErrorMessage = err?.message || String(err);
        console.warn(`[Gemini Error on ${modelName}]`, lastErrorMessage);
        if (attempt < maxRetries) {
          await delay(attempt * 1000);
          continue;
        }
      }
    }
  }

  throw new Error(`Gemini service temporarily unavailable across all models. ${lastErrorMessage}`);
}
