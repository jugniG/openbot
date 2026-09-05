import { analyzeGoal } from "./packages/agent-engine/dist/goal-analyzer.js";
import { generateInitialV0Architecture } from "./packages/agent-engine/dist/arch-generator.js";
import dotenv from "dotenv";
dotenv.config({ path: "./apps/web/.env" });

async function main() {
  const prompt = "Build an agent that monitors Solana DEX liquidity pools, detects front-running arbitrage, and alerts my Telegram channel.";
  const analysis = await analyzeGoal(prompt);
  console.log("Synthesizing DAG with Gemini for:", analysis.agentName);

  const v0Spec = await generateInitialV0Architecture(analysis, prompt);
  console.log("\n=== REAL GEMINI V0 DAG ===");
  console.log(JSON.stringify({
    name: v0Spec.name,
    summary: v0Spec.architectureSummary,
    nodes: v0Spec.nodes.map(n => ({ id: n.id, name: n.name, role: n.role, tools: n.assignedTools })),
    edges: v0Spec.edges
  }, null, 2));
}

main();
