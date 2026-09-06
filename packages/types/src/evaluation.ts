import { z } from "zod";

export const EvaluationCaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  input: z.record(z.any()),
  expectedOutcomes: z.array(z.string()),
  domain: z.string().default("general"),
});

export type EvaluationCase = z.infer<typeof EvaluationCaseSchema>;

export const MetricScoreSchema = z.object({
  name: z.string(), // "Accuracy", "Source Quality", "Completeness", "Citations", "Reliability"
  score: z.number().min(0).max(100),
  delta: z.number().optional(), // +28
  targetThreshold: z.number().default(85),
  passed: z.boolean(),
  notes: z.string().optional(),
});

export type MetricScore = z.infer<typeof MetricScoreSchema>;

export const NodeTraceSchema = z.object({
  nodeId: z.string(),
  nodeName: z.string(),
  input: z.any(),
  output: z.any(),
  toolsCalled: z.array(z.string()).default([]),
  durationMs: z.number(),
  status: z.enum(["success", "warning", "failure"]),
  log: z.string().optional(),
});

export type NodeTrace = z.infer<typeof NodeTraceSchema>;

export const EvaluationRunSchema = z.object({
  id: z.string(),
  agentVersion: numberOrString().optional(),
  caseId: z.string(),
  timestamp: z.string(),
  metrics: z.array(MetricScoreSchema),
  overallScore: z.number().min(0).max(100),
  passed: z.boolean(),
  nodeTraces: z.array(NodeTraceSchema),
  finalOutput: z.string(),
});

function numberOrString() {
  return z.union([z.number(), z.string()]);
}

export type EvaluationRun = z.infer<typeof EvaluationRunSchema>;
