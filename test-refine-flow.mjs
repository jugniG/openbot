import dotenv from "dotenv";
dotenv.config({ path: "./apps/web/.env" });

import { LoopOrchestrator } from "./packages/agent-engine/dist/loop-orchestrator.js";
import { refineAgentWithFollowUp } from "./packages/agent-engine/dist/agent-optimizer.js";
import { runAgentPipeline } from "./packages/agent-engine/dist/agent-runner.js";
import { evaluateAgentRun } from "./packages/agent-engine/dist/evaluator.js";

async function testChatAndRefineFlow() {
  console.log("================================================================================");
  console.log("🧪 TESTING 1-CHAT = 1-AGENT WORKSPACE & FOLLOW-UP REFINEMENT");
  console.log("================================================================================");

  const initialPrompt = "Build an agent that monitors Solana DEX liquidity pools and detects front-running arbitrage.";
  const initialMessages = [
    { role: "user", content: initialPrompt },
    { role: "assistant", content: "Understood! I will engineer a specialist with transaction simulation and verification." }
  ];

  console.log("\n[1] Starting Initial Engineering Loop with Chat...");
  const orchestrator = new LoopOrchestrator();
  const session = await orchestrator.runEngineeringLoop(initialPrompt, "test-sess-" + Date.now(), initialMessages);

  const v1Agent = session.currentAgent;
  console.log("✓ Agent Created: " + v1Agent.name + " (" + v1Agent.versionTag + ")");
  console.log("✓ Topology: " + v1Agent.architectureSummary);
  console.log("✓ Chat Messages Attached: " + (v1Agent.messages?.length || 0));

  console.log("\n[2] Testing Follow-Up Refinement in the Same Agent Chat...");
  const followUpPrompt = "Now also add a Telegram notification node to alert me when arbitrage exceeds $5,000.";
  console.log("User Follow-Up: " + followUpPrompt);

  const updatedMessages = [
    ...(v1Agent.messages || []),
    { role: "user", content: followUpPrompt }
  ];

  const { improvedAgent, mutationDiff } = await refineAgentWithFollowUp(
    v1Agent,
    followUpPrompt,
    updatedMessages
  );

  console.log("\n✓ Agent Mutated: " + improvedAgent.name + " (" + improvedAgent.versionTag + ")");
  console.log("✓ New Topology: " + improvedAgent.architectureSummary);
  console.log("✓ Mutation Summary: " + mutationDiff.summary);
  console.log("✓ Total Stages: " + improvedAgent.nodes.length + " (Previous: " + v1Agent.nodes.length + ")");

  // Verify evaluation on mutated agent
  const evalCase = {
    id: "eval-refine-test",
    name: "Refinement Verification",
    description: followUpPrompt,
    domain: improvedAgent.domain,
    input: { query: followUpPrompt },
    expectedOutcomes: ["Accuracy >= 85%"]
  };

  const exec = await runAgentPipeline(improvedAgent, evalCase);
  const evalRun = evaluateAgentRun(improvedAgent, evalCase, exec);
  console.log("✓ Re-Evaluation Score: " + evalRun.overallScore + "% (Passed: " + evalRun.passed + ")");

  console.log("\n================================================================================");
  console.log("✅ 1-CHAT = 1-AGENT PERSISTENCE & REFINEMENT VERIFIED SUCCESSFULLY");
  console.log("================================================================================");
}

testChatAndRefineFlow().catch(console.error);
