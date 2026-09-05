import assert from "node:assert";
import test from "node:test";
import { LoopOrchestrator } from "./loop-orchestrator.js";

test("autonomous engineering loop: v0 failure -> mutation -> v1 pass (Research)", async () => {
  const events: string[] = [];
  const orchestrator = new LoopOrchestrator((e) => {
    events.push(e.type);
  });

  const session = await orchestrator.runEngineeringLoop(
    "Build an agent that researches competitors and creates an evidence-backed comparison report."
  );

  assert.strictEqual(session.domain, "research");
  assert.strictEqual(session.iterations.length, 2);

  // Iteration 0 (v0)
  const v0Step = session.iterations[0];
  assert.strictEqual(v0Step.versionTag, "v0");
  assert.strictEqual(v0Step.targetReached, false);
  assert.strictEqual(v0Step.evaluationRun.passed, false);
  assert.ok(v0Step.evaluationRun.overallScore < 75);
  assert.ok(v0Step.failureDiagnosis !== undefined);
  assert.ok(v0Step.failureDiagnosis.rootCauses.length > 0);
  assert.ok(v0Step.mutationDiff !== undefined);

  // Iteration 1 (v1)
  const v1Step = session.iterations[1];
  assert.strictEqual(v1Step.versionTag, "v1");
  assert.strictEqual(v1Step.targetReached, true);
  assert.strictEqual(v1Step.evaluationRun.passed, true);
  assert.ok(v1Step.evaluationRun.overallScore >= 85);

  // Verify events emitted
  assert.ok(events.includes("SESSION_STARTED"));
  assert.ok(events.includes("GOAL_PARSED"));
  assert.ok(events.includes("ARCHITECTURE_GENERATED"));
  assert.ok(events.includes("FAILURES_DIAGNOSED"));
  assert.ok(events.includes("MUTATION_APPLIED"));
  assert.ok(events.includes("TARGET_REACHED"));
});

test("autonomous engineering loop: unseen arbitrary goal (Support Triage)", async () => {
  const orchestrator = new LoopOrchestrator();

  const session = await orchestrator.runEngineeringLoop(
    "Build an agent that monitors customer support tickets, classifies sentiment, and drafts empathetic responses."
  );

  // Verify dynamic naming and requirements
  assert.strictEqual(session.domain, "general");
  assert.ok(session.currentAgent);
  assert.ok(session.currentAgent.name.length > 0);
  assert.strictEqual(session.iterations.length, 2);

  // v0 vs v1 delta
  const v0Score = session.iterations[0].evaluationRun.overallScore;
  const v1Score = session.iterations[1].evaluationRun.overallScore;
  assert.ok(v1Score > v0Score);
  assert.ok(v1Score >= 85);

  // Verify injected stage
  assert.strictEqual(session.iterations[0].agentSpec.nodes.length, 2);
  assert.strictEqual(session.iterations[1].agentSpec.nodes.length, 4);
});
