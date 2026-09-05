import { z } from "zod";
import { AgentSpecSchema } from "./agent.js";
import { EvaluationRunSchema } from "./evaluation.js";
import { FailureDiagnosisSchema } from "./failure.js";

export const MutationTypeSchema = z.enum([
  "add_tool",
  "remove_tool",
  "modify_prompt",
  "add_stage",
  "remove_stage",
  "alter_memory",
  "rewire_edge",
]);

export type MutationType = z.infer<typeof MutationTypeSchema>;

export const MutationActionSchema = z.object({
  type: MutationTypeSchema,
  targetId: z.string(), // node id, tool id, etc.
  description: z.string(), // "+ Add verification tool", "+ Add source-validation stage"
  before: z.any().optional(),
  after: z.any().optional(),
});

export type MutationAction = z.infer<typeof MutationActionSchema>;

export const MutationDiffSchema = z.object({
  id: z.string(),
  fromVersion: z.number(),
  toVersion: z.number(),
  actions: z.array(MutationActionSchema),
  summary: z.string(),
  promptDiffs: z.array(
    z.object({
      nodeId: z.string(),
      nodeName: z.string(),
      oldPrompt: z.string(),
      newPrompt: z.string(),
    })
  ).default([]),
  topologyDiffs: z.array(
    z.object({
      action: z.enum(["added_node", "removed_node", "added_edge", "removed_edge"]),
      description: z.string(),
    })
  ).default([]),
});

export type MutationDiff = z.infer<typeof MutationDiffSchema>;

export const IterationStepSchema = z.object({
  iterationIndex: z.number(), // 0 for v0, 1 for v1
  versionTag: z.string(), // "v0", "v1"
  agentSpec: AgentSpecSchema,
  evaluationRun: EvaluationRunSchema,
  failureDiagnosis: FailureDiagnosisSchema.optional(),
  mutationDiff: MutationDiffSchema.optional(),
  targetReached: z.boolean(),
  timestamp: z.string(),
});

export type IterationStep = z.infer<typeof IterationStepSchema>;
