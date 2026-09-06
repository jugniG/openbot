import { z } from "zod";

export const ToolDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  parameters: z.record(z.any()).optional().default({}),
  category: z.enum(["search", "retrieval", "verification", "code", "data", "utility"]),
  isMock: z.boolean().default(false),
  requiredEnvs: z.array(z.string()).optional(),
});

export type ToolDefinition = z.infer<typeof ToolDefinitionSchema>;

export const AgentEnvVarSchema = z.object({
  key: z.string(),
  maskedValue: z.string(),
  encryptedValue: z.string(),
  hash: z.string().optional(),
  requiredBy: z.array(z.string()).optional().default([]),
  updatedAt: z.string().optional(),
});

export type AgentEnvVar = z.infer<typeof AgentEnvVarSchema>;

export const MemoryConfigSchema = z.object({
  type: z.enum(["buffer", "vector", "episodic", "state_kv"]),
  description: z.string().optional(),
  maxTokens: z.number().optional(),
});

export type MemoryConfig = z.infer<typeof MemoryConfigSchema>;

export const PipelineNodeTypeSchema = z.enum([
  "trigger",
  "tool",
  "llm",
  "condition",
  "action",
  "custom_code",
]);

export type PipelineNodeType = z.infer<typeof PipelineNodeTypeSchema>;

export const PipelineNodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  type: PipelineNodeTypeSchema.optional().default("tool"),
  parameters: z.record(z.any()).optional().default({}),
  systemPrompt: z.string(),
  assignedTools: z.array(z.string()).default([]),
  memory: MemoryConfigSchema.optional(),
  stepIndex: z.number(),
  color: z.string().optional(),
});

export type PipelineNode = z.infer<typeof PipelineNodeSchema>;

export const PipelineEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  condition: z.string().optional(),
  label: z.string().optional(),
});

export type PipelineEdge = z.infer<typeof PipelineEdgeSchema>;

export const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  timestamp: z.string().optional(),
  quickSuggestions: z.array(z.string()).optional(),
  requestedEnvs: z.array(z.string()).optional(),
  toolCall: z
    .object({
      name: z.string(),
      args: z.record(z.any()),
    })
    .optional(),
  toolResult: z
    .object({
      exitCode: z.number(),
      stdout: z.string().optional(),
      stderr: z.string().optional(),
      output: z.any().optional(),
    })
    .optional(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const AgentSpecSchema = z.object({
  id: z.string(),
  version: z.number().optional(),
  versionTag: z.string().optional(),
  name: z.string(),
  domain: z.enum(["research", "coding", "finance", "general"]),
  goal: z.string(),
  architectureSummary: z.string(),
  nodes: z.array(PipelineNodeSchema),
  edges: z.array(PipelineEdgeSchema),
  availableTools: z.array(ToolDefinitionSchema),
  messages: z.array(ChatMessageSchema).optional(),
  envs: z.record(AgentEnvVarSchema).optional(),
  requiredEnvs: z.array(z.string()).optional(),
  runs: z.array(z.any()).optional(),
  createdAt: z.string(),
});

export type AgentSpec = z.infer<typeof AgentSpecSchema>;

