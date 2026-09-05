import type { EvaluationCase, MetricScore, RootCause, MutationAction } from "@repo/types";

export const researchEvaluationCase: EvaluationCase = {
  id: "eval-research-01",
  name: "Competitor Market Intelligence & Verification",
  description: "Research competing AI agent frameworks (e.g. LangGraph vs CrewAI vs Eve) and compile an evidence-backed comparison with independent benchmark references.",
  domain: "research",
  input: {
    targetSubjects: ["LangGraph", "CrewAI", "Eve"],
    requiredSections: ["Architecture Model", "Tool Calling Reliability", "Enterprise Benchmarks", "Pricing/License"],
    minSourcesPerClaim: 2,
    disallowUnverifiedClaims: true,
  },
  expectedOutcomes: [
    "Independent verification of latency and failure recovery claims",
    "Direct links or references to primary technical docs and benchmarks",
    "Distinction between vendor self-reported marketing vs third-party evals",
  ],
};

export const researchBaselineV0Metrics: MetricScore[] = [
  {
    name: "Accuracy",
    score: 61,
    targetThreshold: 85,
    passed: false,
    notes: "Accepted unverified vendor throughput statistics without cross-reference.",
  },
  {
    name: "Source Quality",
    score: 74,
    targetThreshold: 85,
    passed: false,
    notes: "Heavy reliance on marketing blogs rather than technical documentation or source code.",
  },
  {
    name: "Completeness",
    score: 58,
    targetThreshold: 85,
    passed: false,
    notes: "Omitted enterprise sandbox comparison and failover benchmarks.",
  },
  {
    name: "Citations",
    score: 67,
    targetThreshold: 85,
    passed: false,
    notes: "Single URL citations provided for composite assertions.",
  },
];

export const researchV0RootCauses: RootCause[] = [
  {
    id: "rc-res-1",
    title: "Relied on single-source claims",
    description: "The researcher accepted vendor landing page claims without consulting independent reports or comparative studies.",
    severity: "critical",
    affectedMetric: "Accuracy",
    affectedNodeId: "node-researcher",
    evidenceSnippet: "Vendor claims 99.9% uptime with 0 hallucinations in production workloads.",
  },
  {
    id: "rc-res-2",
    title: "No source cross-validation stage",
    description: "The pipeline routed raw researcher findings straight to the synthesizer without an intermediate fact-checking or verification checkpoint.",
    severity: "critical",
    affectedMetric: "Source Quality",
    affectedNodeId: "node-synthesizer",
  },
  {
    id: "rc-res-3",
    title: "Did not distinguish company claims from independent evidence",
    description: "Self-published benchmarks were treated with the same epistemic weight as peer-reviewed or independent user evaluations.",
    severity: "warning",
    affectedMetric: "Citations",
  },
];

export const researchProposedMutations: MutationAction[] = [
  {
    type: "add_tool",
    targetId: "tool-source-verifier",
    description: "+ Add verification tool (cross-references claims against academic & independent data)",
  },
  {
    type: "add_stage",
    targetId: "node-verifier",
    description: "+ Add source-validation stage (Planner -> Researcher -> Verifier -> Synthesizer)",
  },
  {
    type: "modify_prompt",
    targetId: "node-synthesizer",
    description: "+ Modify synthesis instructions (strictly require 2+ citations per comparative statement)",
  },
];

export const researchImprovedV1Metrics: MetricScore[] = [
  {
    name: "Accuracy",
    score: 89,
    delta: 28,
    targetThreshold: 85,
    passed: true,
    notes: "Verified claims against GitHub releases and third-party SWE-bench evaluations.",
  },
  {
    name: "Source Quality",
    score: 94,
    delta: 20,
    targetThreshold: 85,
    passed: true,
    notes: "High concentration of primary technical documentation and reproducible metrics.",
  },
  {
    name: "Completeness",
    score: 91,
    delta: 33,
    targetThreshold: 85,
    passed: true,
    notes: "All 4 required sections covered with detailed sandbox isolation breakdown.",
  },
  {
    name: "Citations",
    score: 96,
    delta: 29,
    targetThreshold: 85,
    passed: true,
    notes: "Every claim backed by 2 or more distinct citations with timestamp metadata.",
  },
];
