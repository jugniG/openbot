import type { AgentSpec } from "@repo/types";
import { availableTools } from "./tool-registry.js";
import type { GoalAnalysisResult } from "./goal-analyzer.js";
import { callGeminiJSON } from "./llm-provider.js";

export async function generateInitialV0Architecture(
  analysis: GoalAnalysisResult,
  userGoal: string
): Promise<AgentSpec> {
  const systemPrompt = `You are the Agent Architect & Tool Selector inside OpenBot (Automated Agent Engineering Factory).
Given a GoalAnalysisResult and the user's goal, design an initial v0 AgentSpec DAG.

Available Tools in the Registry:
${JSON.stringify(availableTools.map((t) => ({ id: t.id, name: t.name, description: t.description })))}

Requirements:
1. Design a 2-stage baseline pipeline (v0) directly tailored to the user's requirements: [${analysis.extractedRequirements.join("; ")}].
2. For each node, create:
   - "id": string (unique ID e.g. "node-ingestor", "node-executor")
   - "name": string (descriptive stage name e.g. "Ledger Normalizer", "Code Investigator")
   - "role": string (precise responsibility)
   - "systemPrompt": string (detailed instruction embedding the user's requirements)
   - "assignedTools": array of tool IDs selected from the Available Tools list
   - "stepIndex": number (0, 1)
   - "color": string (hex color)
3. Create edges connecting the sequential flow.
4. Output JSON matching the AgentSpec schema.`;

  const userPrompt = `Synthesize v0 architecture for:
Agent Name: "${analysis.agentName}"
Domain: "${analysis.domain}"
Goal: "${userGoal}"
Requirements: ${JSON.stringify(analysis.extractedRequirements)}
Success Criteria: ${JSON.stringify(analysis.successCriteria)}`;

  const spec = await callGeminiJSON<any>(systemPrompt, userPrompt);
  const nodes = Array.isArray(spec.nodes) ? spec.nodes : Array.isArray(spec.stages) ? spec.stages : [];
  const edges = Array.isArray(spec.edges) ? spec.edges : [];

  return {
    ...spec,
    id: spec.id || `agent-${analysis.domain}-${Date.now()}`,
    version: 0,
    versionTag: "v0",
    name: analysis.agentName,
    domain: analysis.domain,
    goal: userGoal,
    nodes,
    edges,
    architectureSummary: spec.architectureSummary || (nodes.length > 0 ? nodes.map((n: any) => n.name).join(" -> ") : "Stage 1 -> Stage 2"),
    availableTools,
    createdAt: new Date().toISOString(),
  };
}
