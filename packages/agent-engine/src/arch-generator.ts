import type { AgentSpec } from "@repo/types";
import { availableTools } from "./tool-registry.js";
import type { GoalAnalysisResult } from "./goal-analyzer.js";
import { callGeminiJSON } from "./llm-provider.js";

export async function generateInitialV0Architecture(
  analysis: GoalAnalysisResult,
  userGoal: string
): Promise<AgentSpec> {
  const systemPrompt = `You are the Agent Architect & Tool Selector inside OpenBot (Automated Agent Engineering Factory).
Given a GoalAnalysisResult and the user's goal, design an initial v0 executable AgentSpec DAG.

Available Tools in the Registry:
${JSON.stringify(availableTools.map((t) => ({ id: t.id, name: t.name, description: t.description })))}

Node Types & Primitives (Strictly one of):
- "trigger": Execution trigger that initiates the pipeline (parameters: { triggerType: "schedule" | "webhook" | "manual", schedule?: string, cron?: string, event?: string })
- "tool": External API, scraper, or data source (parameters: { toolId: string, queries?: string[], sources?: string[] })
- "llm": AI intelligence for filtering, parsing, reasoning, or deduplication (parameters: { prompt: string, model?: string, criteria?: string })
- "condition": Logic routing or filtering
- "action": Output delivery such as email dispatch (parameters: { channel: "email", recipient?: string, subject?: string })
- "custom_code": Custom Python/Node execution

Requirements:
1. Design an executable DAG directly tailored to the user's goal: "${userGoal}".
   - "trigger" node: ONLY include a "trigger" node if the user explicitly specifies a recurring interval/schedule (e.g. "every 6hr", "daily") or an external event/webhook (e.g. "on PR", "webhook"). If the agent is interactive, user-invoked, or on-demand without an interval, DO NOT create a schedule trigger; start directly with the processing stage or use { triggerType: "manual" }.
   - If scraping or fetching data is needed, include a "tool" node using available tools from registry.
   - If filtering, deduplicating, or analyzing is required, include an "llm" node.
   - If sending an email, notification, or alert is requested, include an "action" node with recipient parameters.
2. For each node, create:
   - "id": string (unique ID e.g. "node-trigger", "node-web-scraper", "node-filter", "node-email-dispatch")
   - "name": string (descriptive name)
   - "role": string (responsibility)
   - "type": "trigger" | "tool" | "llm" | "condition" | "action" | "custom_code"
   - "parameters": object containing runtime parameters (e.g. schedule, queries, recipient, criteria)
   - "systemPrompt": string (instructions embedding the user's requirements)
   - "assignedTools": array of tool IDs selected from the Available Tools list
   - "stepIndex": number (0, 1, 2, ...)
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
  const rawNodes = Array.isArray(spec.nodes) ? spec.nodes : Array.isArray(spec.stages) ? spec.stages : [];
  const nodes = rawNodes.map((n: any, idx: number) => ({
    ...n,
    id: n.id || `node-${idx}-${Date.now()}`,
    type: n.type || "tool",
    parameters: n.parameters || {},
    systemPrompt: n.systemPrompt || n.role || "",
    assignedTools: Array.isArray(n.assignedTools) ? n.assignedTools : [],
    stepIndex: typeof n.stepIndex === "number" ? n.stepIndex : idx,
  }));
  const edges = Array.isArray(spec.edges) ? spec.edges : [];

  const requiredEnvsSet = new Set<string>(
    Array.isArray(spec.requiredEnvs) ? spec.requiredEnvs : []
  );
  for (const n of nodes) {
    for (const tId of n.assignedTools || []) {
      const def = availableTools.find((t) => t.id === tId);
      if (def?.requiredEnvs) {
        for (const e of def.requiredEnvs) {
          requiredEnvsSet.add(e);
        }
      }
    }
  }

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
    requiredEnvs: Array.from(requiredEnvsSet),
    architectureSummary: spec.architectureSummary || (nodes.length > 0 ? nodes.map((n: any) => n.name).join(" -> ") : "Stage 1 -> Stage 2"),
    availableTools,
    createdAt: new Date().toISOString(),
  };
}
