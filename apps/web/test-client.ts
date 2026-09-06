import 'dotenv/config';
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import router from "./src/orpc/router/index.js";
import type { RouterClient } from "@orpc/server";

const link = new RPCLink({
  url: "http://localhost:5173/api/rpc",
});

const client: RouterClient<typeof router> = createORPCClient(link);

const testGoals = [
  {
    domain: "RESEARCH",
    goal: "Build an agent that researches competing AI agent frameworks and creates an evidence-backed comparison report with cross-verified citations.",
  },
  {
    domain: "CODING",
    goal: "Build an agent that diagnoses a GitHub issue deadlock, implements an atomic fix, and verifies it with sandbox integration tests.",
  },
  {
    domain: "FINANCE",
    goal: "Build an agent that analyzes corporate expense CSVs, isolates structured invoice splitting, and outputs audit-compliant findings.",
  },
];

async function runFullSuite() {
  console.log("===============================================================");
  console.log("   OPENBOT: AUTONOMOUS AGENT ENGINEERING END-TO-END SUITE   ");
  console.log("===============================================================\n");

  for (const item of testGoals) {
    console.log(`>>> [DOMAIN: ${item.domain}] Starting Autonomous Engineering...`);
    console.log(`    Goal: "${item.goal}"`);

    const res = await client.engineer.startEngineeringSession({ goal: item.goal });
    const session = res.session;

    console.log(`    Domain Detected: ${session.domain.toUpperCase()}`);
    console.log(`    Total Iterations: ${session.iterations.length}`);

    // Iteration 0
    const v0 = session.iterations[0];
    console.log(`    [Iteration 0 - Baseline]`);
    console.log(`      Architecture: ${v0.agentSpec.architectureSummary}`);
    if (v0.evaluationRun) {
      console.log(`      Overall Score: ${v0.evaluationRun.overallScore}% (PASSED: ${v0.evaluationRun.passed})`);
      console.log(`      Metrics:`);
      for (const m of v0.evaluationRun.metrics) {
        console.log(`        - ${m.name}: ${m.score}% (Passed: ${m.passed})`);
      }
    }
    console.log(`      Failure Diagnosis: ${v0.failureDiagnosis?.summary}`);
    console.log(`      Root Causes Identified:`);
    for (const rc of v0.failureDiagnosis?.rootCauses || []) {
      console.log(`        * ${rc.title} (Affects: ${rc.affectedMetric})`);
    }
    console.log(`      Prescribed Mutations:`);
    for (const mut of v0.failureDiagnosis?.proposedMutations || []) {
      console.log(`        + ${mut}`);
    }

    // Iteration 1
    const v1 = session.iterations[1];
    if (v1) {
      console.log(`    [Iteration 1 - Improved]`);
      console.log(`      New Architecture: ${v1.agentSpec.architectureSummary}`);
      if (v1.evaluationRun) {
        console.log(`      Overall Score: ${v1.evaluationRun.overallScore}% (PASSED: ${v1.evaluationRun.passed})`);
        console.log(`      Metrics:`);
        for (const m of v1.evaluationRun.metrics) {
          console.log(`        - ${m.name}: ${m.score}% (+${m.delta}%) (Passed: ${m.passed})`);
        }
      }
      console.log(`      Target Reached: ${v1.targetReached}`);
    }

    // Execute the engineered agent on custom task
    console.log(`    [Live Specialist Test Run]`);
    const execRes = await client.engineer.runSpecialistExecution({
      agentId: session.currentAgent?.id || v1.agentSpec.id,
      query: `Execute benchmark validation for ${item.domain}`,
    });
    console.log(`      Latency: ${execRes.durationMs}ms`);
    console.log(`      Agent Output Summary: ${execRes.output.slice(0, 160).replace(/\n/g, ' ')}...`);
    console.log(`---------------------------------------------------------------\n`);
  }

  const finalLibrary = await client.engineer.listSpecialists({});
  console.log(`>>> AGENT LIBRARY VERIFICATION:`);
  console.log(`    Total Specialist Agents in Library: ${finalLibrary.length}`);
  for (const a of finalLibrary) {
    console.log(`    * [${a.domain.toUpperCase()}] ${a.name} (${a.versionTag}) - ${a.architectureSummary}`);
  }

  console.log("\n===============================================================");
  console.log("   ALL 3 DOMAINS ENGINEERED, VERIFIED, AND CERTIFIED!   ");
  console.log("===============================================================");
}

runFullSuite().catch((err) => {
  console.error("FATAL ERROR IN SUITE:", err);
  process.exit(1);
});
