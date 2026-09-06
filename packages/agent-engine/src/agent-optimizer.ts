import type {
  AgentSpec,
  ChatMessage,
  FailureDiagnosis,
  MutationDiff,
  PipelineNode,
  PipelineEdge,
} from "@repo/types";
import { callGeminiJSON } from "./llm-provider.js";
import { availableTools } from "./tool-registry.js";

export interface OptimizationResult {
  improvedAgent: AgentSpec;
  mutationDiff: MutationDiff;
}

interface LLMOptimizationResponse {
  architectureSummary: string;
  newNodes: PipelineNode[];
  newEdges: PipelineEdge[];
  mutationSummary: string;
  topologyDiffs: Array<{ action: "added_node" | "removed_node" | "added_edge" | "removed_edge"; description: string }>;
  promptDiffs: Array<{ nodeId: string; nodeName: string; oldPrompt: string; newPrompt: string }>;
}

export async function optimizeAgent(
  currentAgent: AgentSpec,
  diagnosis: FailureDiagnosis
): Promise<OptimizationResult> {
  const newVersion = currentAgent.version + 1;
  const newVersionTag = `v${newVersion}`;

  const systemPrompt = `You are the Agent Optimizer inside OpenBot (Automated Agent Engineering Factory).
Your role: Mutate the current agent architecture to solve the diagnosed root causes.

Available Tools in Registry:
${JSON.stringify(availableTools.map((t) => ({ id: t.id, name: t.name, description: t.description })))}

Optimization Strategy:
1. Topology Mutation: Inject a dedicated validation / verification stage or planner stage to eliminate single-path failure.
2. Tool Allocation: Assign dedicated verification tools (e.g. 'tool-source-verifier', 'tool-test-runner', 'tool-policy-checker').
3. Prompt Hardening: Update system prompts with strict negative constraints forbidding unverified assertions.
4. Generate clear Diffs for both topology and system prompts.

Output Schema:
{
  "architectureSummary": "string (e.g. 'Trigger -> Worker -> Verifier -> Action')",
  "newNodes": [ array of PipelineNode objects with id, name, role, type ('trigger'|'tool'|'llm'|'condition'|'action'|'custom_code'), parameters, systemPrompt, assignedTools, stepIndex, color ],
  "newEdges": [ array of PipelineEdge objects with id, source, target, label ],
  "mutationSummary": "string (executive summary of mutations)",
  "topologyDiffs": [ { "action": "added_node" | "removed_node" | "added_edge" | "removed_edge", "description": "string" } ],
  "promptDiffs": [ { "nodeId": "string", "nodeName": "string", "oldPrompt": "string", "newPrompt": "string" } ]
}`;

  const userPrompt = `Mutate and improve Agent: "${currentAgent.name}" (${currentAgent.versionTag})
Goal: "${currentAgent.goal}"
Current Nodes: ${JSON.stringify(currentAgent.nodes)}
Current Edges: ${JSON.stringify(currentAgent.edges)}
Failure Diagnosis:
Summary: ${diagnosis.summary}
Root Causes: ${JSON.stringify(diagnosis.rootCauses)}
Proposed Fixes: ${JSON.stringify(diagnosis.proposedMutations)}`;

  const res = await callGeminiJSON<LLMOptimizationResponse>(systemPrompt, userPrompt);

  const rawNodes = Array.isArray(res.newNodes) ? res.newNodes : currentAgent.nodes;
  const newNodes = rawNodes.map((n: any, idx: number) => ({
    ...n,
    id: n.id || `node-opt-${idx}`,
    type: n.type || currentAgent.nodes.find((cn) => cn.id === n.id)?.type || "tool",
    parameters: n.parameters || currentAgent.nodes.find((cn) => cn.id === n.id)?.parameters || {},
    systemPrompt: n.systemPrompt || n.role || "",
    assignedTools: Array.isArray(n.assignedTools) ? n.assignedTools : [],
    stepIndex: typeof n.stepIndex === "number" ? n.stepIndex : idx,
  }));

  const improvedAgent: AgentSpec = {
    ...currentAgent,
    version: newVersion,
    versionTag: newVersionTag,
    architectureSummary: res.architectureSummary || currentAgent.architectureSummary,
    nodes: newNodes,
    edges: Array.isArray(res.newEdges) ? res.newEdges : currentAgent.edges,
    availableTools,
  };

  const mutationDiff: MutationDiff = {
    id: `diff-v${currentAgent.version}-v${newVersion}-${Date.now()}`,
    fromVersion: currentAgent.version,
    toVersion: newVersion,
    summary: res.mutationSummary,
    actions: res.topologyDiffs.map((td) => ({
      type: td.action === "added_node" ? "add_stage" : "rewire_edge",
      targetId: td.description,
      description: td.description,
    })),
    topologyDiffs: res.topologyDiffs,
    promptDiffs: res.promptDiffs,
  };

  return {
    improvedAgent,
    mutationDiff,
  };
}

export async function refineAgentWithFollowUp(
  currentAgent: AgentSpec,
  followUpPrompt: string,
  updatedMessages: ChatMessage[]
): Promise<OptimizationResult> {
  const newVersion = currentAgent.version + 1;
  const newVersionTag = `v${newVersion}`;

  const systemPrompt = `You are the Lead Agent Architect inside OpenBot (Automated Agent Engineering Factory).
The user is providing an incremental modification or refinement instruction for an existing agent (e.g., changing schedule, changing recipient email, changing search filters).
Your role: Mutate and refine the agent's architecture, nodes, tools, parameters, and system prompts to fulfill the user's new instruction while preserving existing capabilities.

Node Types & Primitives:
- "trigger": Execution trigger (parameters: { triggerType: "schedule" | "webhook" | "manual", schedule?: string, cron?: string, event?: string })
- "tool": External API or scraper (parameters: { toolId: string, queries?: string[] })
- "llm": AI intelligence (parameters: { prompt: string, criteria?: string })
- "condition": Logic routing
- "action": Output delivery (parameters: { channel: "email", recipient?: string, subject?: string })
- "custom_code": Custom Python/Node execution

Guidelines:
1. If the user specifies an email address (e.g. "change email to sahil@example.com"), locate or add the "action" node and update its "parameters.recipient".
2. If the user specifies a schedule/interval change (e.g. "every 12hr", "daily"), update the "trigger" node's "parameters.schedule". If the user asks to run on-demand or remove the interval, set parameters.triggerType to "manual" or remove the schedule parameter.
3. Preserve all other functional nodes and edges.

Available Tools in Registry:
${JSON.stringify(availableTools.map((t) => ({ id: t.id, name: t.name, description: t.description })))}

Output Schema:
{
  "architectureSummary": "string (e.g. 'Trigger -> Worker -> Verifier -> Notifier')",
  "newNodes": [ array of PipelineNode objects with id, name, role, type ('trigger'|'tool'|'llm'|'condition'|'action'|'custom_code'), parameters, systemPrompt, assignedTools, stepIndex, color ],
  "newEdges": [ array of PipelineEdge objects with id, source, target, label ],
  "mutationSummary": "string (executive summary of mutations fulfilling user request)",
  "topologyDiffs": [ { "action": "added_node" | "removed_node" | "added_edge" | "removed_edge", "description": "string" } ],
  "promptDiffs": [ { "nodeId": "string", "nodeName": "string", "oldPrompt": "string", "newPrompt": "string" } ]
}`;

  const userPrompt = `Existing Agent: "${currentAgent.name}" (${currentAgent.versionTag})
Current Goal: "${currentAgent.goal}"
Current Nodes: ${JSON.stringify(currentAgent.nodes)}
Current Edges: ${JSON.stringify(currentAgent.edges)}

User Modification Request: "${followUpPrompt}"
Full Conversation Context:
${updatedMessages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n")}`;

  const res = await callGeminiJSON<LLMOptimizationResponse>(systemPrompt, userPrompt);

  const rawNodes = Array.isArray(res.newNodes) ? res.newNodes : currentAgent.nodes;
  const newNodes = rawNodes.map((n: any, idx: number) => ({
    ...n,
    id: n.id || `node-refine-${idx}`,
    type: n.type || currentAgent.nodes.find((cn) => cn.id === n.id)?.type || "tool",
    parameters: n.parameters || currentAgent.nodes.find((cn) => cn.id === n.id)?.parameters || {},
    systemPrompt: n.systemPrompt || n.role || "",
    assignedTools: Array.isArray(n.assignedTools) ? n.assignedTools : [],
    stepIndex: typeof n.stepIndex === "number" ? n.stepIndex : idx,
  }));

  const requiredEnvsSet = new Set<string>(
    Array.isArray(currentAgent.requiredEnvs) ? currentAgent.requiredEnvs : []
  );
  for (const n of newNodes) {
    for (const tId of n.assignedTools || []) {
      const def = availableTools.find((t) => t.id === tId);
      if (def?.requiredEnvs) {
        for (const e of def.requiredEnvs) {
          requiredEnvsSet.add(e);
        }
      }
    }
  }

  const improvedAgent: AgentSpec = {
    ...currentAgent,
    version: newVersion,
    versionTag: newVersionTag,
    architectureSummary: res.architectureSummary || currentAgent.architectureSummary,
    nodes: newNodes,
    edges: Array.isArray(res.newEdges) ? res.newEdges : currentAgent.edges,
    requiredEnvs: Array.from(requiredEnvsSet),
    availableTools,
    messages: updatedMessages,
  };

  const mutationDiff: MutationDiff = {
    id: `diff-v${currentAgent.version}-v${newVersion}-${Date.now()}`,
    fromVersion: currentAgent.version,
    toVersion: newVersion,
    summary: res.mutationSummary,
    actions: res.topologyDiffs.map((td) => ({
      type: td.action === "added_node" ? "add_stage" : "rewire_edge",
      targetId: td.description,
      description: td.description,
    })),
    topologyDiffs: res.topologyDiffs,
    promptDiffs: res.promptDiffs,
  };

  return {
    improvedAgent,
    mutationDiff,
  };
}

