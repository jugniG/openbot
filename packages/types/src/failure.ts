import { z } from "zod";

export const RootCauseSchema = z.object({
  id: z.string(),
  title: z.string(), // "Relied on single-source claims"
  description: z.string(),
  severity: z.enum(["critical", "warning", "info"]),
  affectedMetric: z.string(), // "Accuracy"
  affectedNodeId: z.string().optional(),
  evidenceSnippet: z.string().optional(),
});

export type RootCause = z.infer<typeof RootCauseSchema>;

export const FailureDiagnosisSchema = z.object({
  id: z.string(),
  runId: z.string(),
  agentVersion: z.number().optional(),
  summary: z.string(),
  rootCauses: z.array(RootCauseSchema),
  recommendations: z.array(z.string()),
  proposedMutations: z.array(z.string()),
});

export type FailureDiagnosis = z.infer<typeof FailureDiagnosisSchema>;
