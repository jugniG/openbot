import assert from "node:assert";
import test from "node:test";
import { LoopOrchestrator } from "./loop-orchestrator.js";

test("autonomous engineering loop: architecture synthesis (Research)", async () => {
  const events: string[] = [];
  const orchestrator = new LoopOrchestrator((e) => {
    events.push(e.type);
  });

  const session = await orchestrator.runEngineeringLoop(
    "Build an agent that researches competitors and creates an evidence-backed comparison report."
  );

  assert.ok(["research", "general", "coding", "finance"].includes(session.domain));
  assert.strictEqual(session.iterations.length, 1);
  assert.strictEqual(session.status, "completed");

  const v0Step = session.iterations[0];
  assert.strictEqual(v0Step.targetReached, true);
  assert.ok(v0Step.agentSpec.nodes.length > 0);

  // Verify events emitted
  assert.ok(events.includes("SESSION_STARTED"));
  assert.ok(events.includes("GOAL_PARSED"));
  assert.ok(events.includes("ARCHITECTURE_GENERATED"));
  assert.ok(events.includes("TARGET_REACHED"));
});

test("autonomous engineering loop: unseen arbitrary goal (Support Triage)", async () => {
  const orchestrator = new LoopOrchestrator();

  const session = await orchestrator.runEngineeringLoop(
    "Build an agent that monitors customer support tickets, classifies sentiment, and drafts empathetic responses."
  );

  assert.strictEqual(session.domain, "general");
  assert.ok(session.currentAgent);
  assert.ok(session.currentAgent.name.length > 0);
  assert.strictEqual(session.iterations.length, 1);
  assert.strictEqual(session.status, "completed");
  assert.ok(session.currentAgent.nodes.length > 0);
});
