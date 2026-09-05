import dotenv from "dotenv";
dotenv.config({ path: "./apps/web/.env" });

import { analyzeGoal } from "./packages/agent-engine/dist/goal-analyzer.js";
import { generateInitialV0Architecture } from "./packages/agent-engine/dist/arch-generator.js";
import { evaluateAgentRun } from "./packages/agent-engine/dist/evaluator.js";

async function testDomain(domainName, prompt) {
  console.log(`\n========================================`);
  console.log(`Testing Domain: ${domainName}`);
  console.log(`Prompt: "${prompt}"`);

  const analysis = await analyzeGoal(prompt);
  console.log(`Synthesized Title: ${analysis.agentName}`);
  console.log(`Extracted Requirements: ${analysis.extractedRequirements.slice(0, 2).join("; ")}`);

  const v0 = await generateInitialV0Architecture(analysis, prompt);
  console.log(`v0 Architecture: ${v0.architectureSummary}`);
  console.log(`v0 Nodes: ${v0.nodes.map(n => `${n.name} [tools: ${n.assignedTools.join(", ") || "none"}]`).join(" -> ")}`);

  return { domainName, title: analysis.agentName, arch: v0.architectureSummary, tools: v0.nodes.map(n => n.assignedTools).flat() };
}

async function main() {
  const r1 = await testDomain("Research", "Research a company and produce an evidence-backed report using multiple independent sources.");
  const r2 = await testDomain("Coding", "Analyze a GitHub issue, investigate the repository, propose a fix and verify it.");
  const r3 = await testDomain("Data", "Analyze an expense CSV and identify anomalies.");

  console.log("\n========================================");
  console.log("GENERALIZATION SUMMARY:");
  console.log("Research:", r1.arch);
  console.log("Coding:", r2.arch);
  console.log("Data:", r3.arch);
}

main().catch(console.error);
