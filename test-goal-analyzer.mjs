import { analyzeGoal } from "./packages/agent-engine/dist/goal-analyzer.js";
import dotenv from "dotenv";
dotenv.config({ path: "./apps/web/.env" });

async function main() {
  const prompt = "Build an agent that monitors Solana DEX liquidity pools, detects front-running arbitrage, and alerts my Telegram channel.";
  console.log("Analyzing novel prompt with Gemini 3.1 Flash Lite:", prompt);

  const res = await analyzeGoal(prompt);
  console.log("\n=== REAL GEMINI OUTPUT ===");
  console.log(JSON.stringify(res, null, 2));
}

main();
