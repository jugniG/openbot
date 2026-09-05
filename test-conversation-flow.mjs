import dotenv from "dotenv";
dotenv.config({ path: "./apps/web/.env" });

import { analyzeGoalWithConversation } from "./packages/agent-engine/dist/goal-analyzer.js";

async function main() {
  console.log("=== MULTI-TURN CONVERSATIONAL ARCHITECT TEST ===");

  const messages = [
    { role: "user", content: "Build an agent that monitors Solana DEX pools" }
  ];

  console.log("\n[Turn 1] User:", messages[0].content);
  const step1 = await analyzeGoalWithConversation(messages);
  console.log("Architect Status:", step1.status);

  if (step1.status === "needs_clarification") {
    console.log("Architect Question:", step1.question);
    console.log("Missing Pillars:", step1.missingPillars);
    console.log("Quick Suggestions:", step1.quickSuggestions);

    // Turn 2: User answers with details
    messages.push({ role: "assistant", content: step1.question });
    messages.push({ role: "user", content: "Detect front-running sandwich attacks and alert my Telegram channel with transaction hashes." });

    console.log("\n[Turn 2] User:", messages[2].content);
    const step2 = await analyzeGoalWithConversation(messages);
    console.log("Architect Status:", step2.status);

    if (step2.status === "ready") {
      console.log("\n✅ ALL REQUIREMENTS SATISFIED! READY TO ENGINEER:");
      console.log("Agent Title:", step2.analysis.agentName);
      console.log("Domain:", step2.analysis.domain);
      console.log("Extracted Requirements:", step2.analysis.extractedRequirements);
      console.log("Success Criteria:", step2.analysis.successCriteria);
      console.log("Refined Prompt:", step2.analysis.refinedPrompt);
    }
  } else {
    console.log("Already ready on Turn 1:", step1.analysis.agentName);
  }
}

main().catch(console.error);
