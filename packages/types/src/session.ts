import { z } from "zod";
import { AgentSpecSchema } from "./agent.js";
import { IterationStepSchema } from "./optimization.js";

export const SessionEventTypeSchema = z.enum([
  "SESSION_STARTED",
  "GOAL_PARSED",
  "ARCHITECTURE_GENERATED",
  "AGENT_EXECUTING",
  "EVALUATION_COMPLETED",
  "FAILURES_DIAGNOSED",
  "MUTATION_APPLIED",
  "TARGET_REACHED",
  "SESSION_ERROR",
]);

export type SessionEventType = z.infer<typeof SessionEventTypeSchema>;

export const SessionEventSchema = z.object({
  sessionId: z.string(),
  type: SessionEventTypeSchema,
  message: z.string(),
  iterationIndex: z.number(),
  payload: z.any().optional(),
  timestamp: z.string(),
});

export type SessionEvent = z.infer<typeof SessionEventSchema>;

export const EngineeringSessionSchema = z.object({
  id: z.string(),
  goal: z.string(),
  domain: z.string().default("general"),
  status: z.enum(["idle", "analyzing", "generating", "evaluating", "diagnosing", "optimizing", "completed", "failed"]),
  iterations: z.array(IterationStepSchema),
  currentAgent: AgentSpecSchema.optional(),
  targetOverallScore: z.number().default(85),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type EngineeringSession = z.infer<typeof EngineeringSessionSchema>;
