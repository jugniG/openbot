import type { EvaluationCase, MetricScore, RootCause, MutationAction } from "@repo/types";

export const financeEvaluationCase: EvaluationCase = {
  id: "eval-finance-01",
  name: "Corporate Expense CSV Anomaly Detection",
  description: "Ingest multi-currency expense ledger, clean date/tax discrepancies, identify fraudulent or policy-breaching line items, and generate audit-ready findings.",
  domain: "finance",
  input: {
    dataset: "q3_corporate_expenses_50k_rows.csv",
    policyLimits: { meals: 75, travelDaily: 350, dualVendorSplitThreshold: 5000 },
    requireStatisticalJustification: true,
  },
  expectedOutcomes: [
    "Detect smurfing / invoice splitting below $5,000 approval thresholds",
    "Filter out legitimate exchange-rate spike anomalies",
    "Attach IRS/GAAP audit-compliant notes for every flagged item",
  ],
};

export const financeBaselineV0Metrics: MetricScore[] = [
  {
    name: "Precision",
    score: 63,
    targetThreshold: 85,
    passed: false,
    notes: "Overflagged 42 legitimate international travel expenses due to naive currency heuristic.",
  },
  {
    name: "False Positive Suppression",
    score: 52,
    targetThreshold: 85,
    passed: false,
    notes: "High false alarm rate created manual auditor fatigue.",
  },
  {
    name: "Explanation Clarity",
    score: 68,
    targetThreshold: 85,
    passed: false,
    notes: "Simply marked 'anomaly score > 0.8' without business logic explanation.",
  },
  {
    name: "Audit Compliance",
    score: 60,
    targetThreshold: 85,
    passed: false,
    notes: "Did not link flagged rows to specific corporate policy clause numbers.",
  },
];

export const financeV0RootCauses: RootCause[] = [
  {
    id: "rc-fin-1",
    title: "No domain-specific policy rule investigator",
    description: "The pipeline used generic Z-score outlier detection instead of combining statistical outliers with actual corporate travel & procurement policy thresholds.",
    severity: "critical",
    affectedMetric: "False Positive Suppression",
    affectedNodeId: "node-anomaly-detector",
  },
  {
    id: "rc-fin-2",
    title: "Missing compliance verifier stage",
    description: "No second pass confirmed whether an expense was pre-approved or fell under known executive travel exemptions.",
    severity: "warning",
    affectedMetric: "Audit Compliance",
    affectedNodeId: "node-report-gen",
  },
];

export const financeProposedMutations: MutationAction[] = [
  {
    type: "add_stage",
    targetId: "node-investigator",
    description: "+ Add Anomaly Investigator stage (cross-checks flagged rows against vendor contracts and FX tables)",
  },
  {
    type: "add_stage",
    targetId: "node-compliance-verifier",
    description: "+ Add Compliance Verifier stage (validates policy clause citations before final export)",
  },
  {
    type: "modify_prompt",
    targetId: "node-anomaly-detector",
    description: "+ Modify detector prompt (use interquartile range tailored per expense category rather than global mean)",
  },
];

export const financeImprovedV1Metrics: MetricScore[] = [
  {
    name: "Precision",
    score: 96,
    delta: 33,
    targetThreshold: 85,
    passed: true,
    notes: "Zero false flags on multi-currency conversion transactions.",
  },
  {
    name: "False Positive Suppression",
    score: 92,
    delta: 40,
    targetThreshold: 85,
    passed: true,
    notes: "Reduced false alarms from 42 items to 1 verified exception.",
  },
  {
    name: "Explanation Clarity",
    score: 94,
    delta: 26,
    targetThreshold: 85,
    passed: true,
    notes: "Clear narrative for every flagged transaction explaining trigger condition.",
  },
  {
    name: "Audit Compliance",
    score: 97,
    delta: 37,
    targetThreshold: 85,
    passed: true,
    notes: "Every finding maps directly to Corporate Procurement Handbook Section 4.2.",
  },
];
