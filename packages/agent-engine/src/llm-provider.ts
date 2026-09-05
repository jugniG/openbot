/**
 * Google AI Studio Gemini LLM Provider for OpenBot
 * Supports gemini-3.1-flash-lite with automatic retry and model fallback (gemini-2.5-flash) on 503/429.
 */

const FALLBACK_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash",
  "gemini-1.5-flash",
];

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function callGeminiJSON<T>(
  systemPrompt: string,
  userPrompt: string
): Promise<T> {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_AI_STUDIO_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Please set GEMINI_API_KEY in your .env or system environment to use Google AI Studio."
    );
  }

  const primaryModel = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
  const candidateModels = [primaryModel, ...FALLBACK_MODELS.filter((m) => m !== primaryModel)];

  let lastError: any = null;

  for (const model of candidateModels) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const requestBody = {
          system_instruction: {
            parts: [
              {
                text: `${systemPrompt}\nYou MUST return a single, valid JSON object strictly conforming to the requested schema. Do NOT include markdown code fences or backticks. Return raw JSON only.`,
              },
            ],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: userPrompt }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1,
          },
        };

        const res = await fetch(geminiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (res.status === 503 || res.status === 429) {
          // Temporary high demand spike: wait 1.5s and retry or try fallback model
          await delay(1500);
          continue;
        }

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Google AI Studio Gemini API error (${res.status}) on ${model}: ${errText}`);
        }

        const data = await res.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) {
          throw new Error(`Gemini (${model}) returned an empty candidate response.`);
        }

        const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleaned) as T;
      } catch (err: any) {
        lastError = err;
        await delay(1000);
      }
    }
  }

  throw lastError || new Error("Failed to call Google AI Studio Gemini after retries and model fallbacks.");
}

export async function callGeminiText(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_AI_STUDIO_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set."
    );
  }

  const primaryModel = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
  const candidateModels = [primaryModel, ...FALLBACK_MODELS.filter((m) => m !== primaryModel)];

  let lastError: any = null;

  for (const model of candidateModels) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const requestBody = {
          system_instruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: userPrompt }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
          },
        };

        const res = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        if (res.status === 503 || res.status === 429) {
          await delay(1500);
          continue;
        }

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Google AI Studio error (${res.status}) on ${model}: ${errText}`);
        }

        const data = await res.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) return rawText.trim();
      } catch (err: any) {
        lastError = err;
        await delay(1000);
      }
    }
  }

  throw lastError || new Error("Failed to call Gemini.");
}
