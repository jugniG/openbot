import type { AgentSpec, EvaluationRun, FailureDiagnosis } from "@repo/types";
import { callGeminiJSON } from "./llm-provider.js";

export async function diagnoseFailures(
  agent: AgentSpec,
  evalRun: EvaluationRun
): Promise<FailureDiagnosis> {
  const systemPrompt = `You are the Failure Analyzer inside OpenBot (Automated Agent Engineering Factory).
Analyze why the current agent pipeline underperformed against its target criteria.

Return JSON matching FailureDiagnosis:
{
  "id": "string",
  "runId": "string",
  "agentVersion": number,
  "summary": "string (high-level diagnostic summary)",
  "rootCauses": [
    {
      "id": "string",
      "title": "string (e.g. 'Single-source vulnerability without secondary verification')",
      "description": "string (deep technical explanation)",
      "severity": "critical" | "warning" | "info",
      "affectedMetric": "string",
      "evidenceSnippet": "string"
    }
  ],
  "recommendations": ["string (concrete architectural fixes)"],
  "proposedMutations": ["string (e.g. '+ Add Verifier stage', '+ Allocate verification tool')"]
}`;

  const userPrompt = `Diagnose failures for Agent: "${agent.name}"
Goal: "${agent.goal}"
Current Architecture: ${agent.architectureSummary}
Evaluation Overall Score: ${evalRun.overallScore}% (Passed: ${evalRun.passed})
Metrics: ${JSON.stringify(evalRun.metrics)}
Traces: ${JSON.stringify(evalRun.nodeTraces.map((t) => ({ node: t.nodeName, status: t.status, output: t.output })))}`;

  const diagnosis = await callGeminiJSON<FailureDiagnosis>(systemPrompt, userPrompt);

  return {
    ...diagnosis,
    id: diagnosis.id || `diag-${evalRun.id}`,
    runId: evalRun.id,
  };
}
