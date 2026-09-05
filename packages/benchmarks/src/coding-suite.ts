import type { EvaluationCase, MetricScore, RootCause, MutationAction } from "@repo/types";

export const codingEvaluationCase: EvaluationCase = {
  id: "eval-coding-01",
  name: "GitHub Issue Diagnosis & Patch Verification",
  description: "Diagnose an async race condition in an open-source task queue, generate a minimal patch, and run integration tests to prevent regressions.",
  domain: "coding",
  input: {
    repo: "open-queue/core",
    issueNumber: 412,
    issueTitle: "Deadlock on high concurrency shutdown during worker drain",
    failingTest: "test/worker-drain-concurrency.test.ts",
  },
  expectedOutcomes: [
    "Identify root cause in mutex release ordering",
    "Produce unified diff without breaking backwards compatibility",
    "Execute full test suite and confirm 0 regressions",
  ],
};

export const codingBaselineV0Metrics: MetricScore[] = [
  {
    name: "Patch Correctness",
    score: 64,
    targetThreshold: 85,
    passed: false,
    notes: "Fix broke graceful shutdown timeout handler.",
  },
  {
    name: "Regression Safety",
    score: 55,
    targetThreshold: 85,
    passed: false,
    notes: "Introduced secondary flaky test failure in pipeline scheduler.",
  },
  {
    name: "Test Coverage",
    score: 59,
    targetThreshold: 85,
    passed: false,
    notes: "No regression test added for edge case with 0 active workers.",
  },
  {
    name: "Code Quality",
    score: 72,
    targetThreshold: 85,
    passed: false,
    notes: "Left debug logs and missed TypeScript strict null checks.",
  },
];

export const codingV0RootCauses: RootCause[] = [
  {
    id: "rc-cod-1",
    title: "Patch applied without local test runner feedback",
    description: "The Implementer agent generated code based on static assumptions without executing the test suite in a sandboxed runner.",
    severity: "critical",
    affectedMetric: "Regression Safety",
    affectedNodeId: "node-implementer",
  },
  {
    id: "rc-cod-2",
    title: "Missing static analysis / reviewer stage",
    description: "No linter or reviewer checked code style or boundary constraints before declaring the patch complete.",
    severity: "warning",
    affectedMetric: "Code Quality",
    affectedNodeId: "node-reviewer",
  },
];

export const codingProposedMutations: MutationAction[] = [
  {
    type: "add_stage",
    targetId: "node-test-runner",
    description: "+ Add Test Runner stage (executes Vitest in sandbox and feeds errors back to Implementer)",
  },
  {
    type: "add_stage",
    targetId: "node-reviewer",
    description: "+ Add Senior Reviewer stage (checks AST, strict types, and boundary conditions)",
  },
  {
    type: "modify_prompt",
    targetId: "node-implementer",
    description: "+ Modify implementer prompt (mandate minimal diff and forbid modification of public method signatures)",
  },
];

export const codingImprovedV1Metrics: MetricScore[] = [
  {
    name: "Patch Correctness",
    score: 93,
    delta: 29,
    targetThreshold: 85,
    passed: true,
    notes: "Clean atomic mutex unlock with deferred promise resolution.",
  },
  {
    name: "Regression Safety",
    score: 97,
    delta: 42,
    targetThreshold: 85,
    passed: true,
    notes: "All 148 unit and integration tests passed in isolated sandbox.",
  },
  {
    name: "Test Coverage",
    score: 90,
    delta: 31,
    targetThreshold: 85,
    passed: true,
    notes: "Added dedicated stress test case reproducing 100 concurrent workers.",
  },
  {
    name: "Code Quality",
    score: 95,
    delta: 23,
    targetThreshold: 85,
    passed: true,
    notes: "Zero lint warnings, strict types checked, formatted with Prettier.",
  },
];
