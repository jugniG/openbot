import { LoopOrchestrator } from "./packages/agent-engine/dist/loop-orchestrator.js";
import dotenv from "dotenv";
dotenv.config({ path: "./apps/web/.env" });

async function main() {
  const prompt = "Build an agent that monitors Solana DEX liquidity pools, detects front-running arbitrage, and alerts my Telegram channel.";
  console.log("Running Full Autonomous Loop via Google AI Studio Gemini for:\n", prompt);

  const events = [];
  const orchestrator = new LoopOrchestrator((e) => {
    console.log(`[Event: ${e.type}] ${e.message}`);
    events.push(e);
  });

  const session = await orchestrator.runEngineeringLoop(prompt);

  console.log("\n=== AUTONOMOUS OPTIMIZATION LOOP COMPLETED ===");
  console.log("Agent:", session.currentAgent?.name);
  console.log("Iterations:", session.iterations.length);
  console.log("v0 Score:", session.iterations[0].evaluationRun.overallScore + "%");
  console.log("v1 Score:", session.iterations[1]?.evaluationRun.overallScore + "%");
  console.log("v1 Topology:", session.currentAgent?.architectureSummary);
  console.log("v1 Stages:", session.currentAgent?.nodes.map(n => n.name).join(" -> "));
  console.log("Diff Summary:", session.iterations[0].mutationDiff?.summary);
}

main();
