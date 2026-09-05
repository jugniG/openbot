import { callGeminiJSON } from "./packages/agent-engine/dist/llm-provider.js";
import dotenv from "dotenv";
dotenv.config({ path: "./apps/web/.env" });

async function main() {
  console.log("Testing Google AI Studio Gemini integration with key:", process.env.GEMINI_API_KEY?.slice(0, 8) + "...");

  const systemPrompt = "You are a specialized agent architect. Return JSON with 'success': boolean and 'model': string.";
  const userPrompt = "Confirm Gemini API connection.";

  try {
    const res = await callGeminiJSON(systemPrompt, userPrompt);
    console.log("Gemini API Response:", JSON.stringify(res, null, 2));
  } catch (err) {
    console.error("Gemini Error:", err.message);
  }
}

main();
