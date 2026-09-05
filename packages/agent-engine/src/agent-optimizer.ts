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
  "architectureSummary": "string (e.g. 'Planner -> Worker -> Verifier -> Synthesizer')",
  "newNodes": [ array of PipelineNode objects with id, name, role, systemPrompt, assignedTools, stepIndex, color ],
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

  const improvedAgent: AgentSpec = {
    ...currentAgent,
    version: newVersion,
    versionTag: newVersionTag,
    architectureSummary: res.architectureSummary,
    nodes: res.newNodes,
    edges: res.newEdges,
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
The user is providing an incremental modification or refinement instruction for an existing agent.
Your role: Mutate and refine the agent's architecture, nodes, tools, and system prompts to fulfill the user's new instruction while preserving existing capabilities.

Available Tools in Registry:
${JSON.stringify(availableTools.map((t) => ({ id: t.id, name: t.name, description: t.description })))}

Output Schema:
{
  "architectureSummary": "string (e.g. 'Planner -> Worker -> Verifier -> Notifier')",
  "newNodes": [ array of PipelineNode objects with id, name, role, systemPrompt, assignedTools, stepIndex, color ],
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

  const improvedAgent: AgentSpec = {
    ...currentAgent,
    version: newVersion,
    versionTag: newVersionTag,
    architectureSummary: res.architectureSummary,
    nodes: res.newNodes,
    edges: res.newEdges,
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

