export * from "./research-suite.js";
export * from "./coding-suite.js";
export * from "./finance-suite.js";

import {
  researchEvaluationCase,
  researchBaselineV0Metrics,
  researchV0RootCauses,
  researchProposedMutations,
  researchImprovedV1Metrics,
} from "./research-suite.js";

import {
  codingEvaluationCase,
  codingBaselineV0Metrics,
  codingV0RootCauses,
  codingProposedMutations,
  codingImprovedV1Metrics,
} from "./coding-suite.js";

import {
  financeEvaluationCase,
  financeBaselineV0Metrics,
  financeV0RootCauses,
  financeProposedMutations,
  financeImprovedV1Metrics,
} from "./finance-suite.js";

export function getBenchmarkForDomain(domain: string) {
  switch (domain.toLowerCase()) {
    case "coding":
      return {
        evalCase: codingEvaluationCase,
        v0Metrics: codingBaselineV0Metrics,
        v0RootCauses: codingV0RootCauses,
        mutations: codingProposedMutations,
        v1Metrics: codingImprovedV1Metrics,
      };
    case "finance":
      return {
        evalCase: financeEvaluationCase,
        v0Metrics: financeBaselineV0Metrics,
        v0RootCauses: financeV0RootCauses,
        mutations: financeProposedMutations,
        v1Metrics: financeImprovedV1Metrics,
      };
    case "research":
    default:
      return {
        evalCase: researchEvaluationCase,
        v0Metrics: researchBaselineV0Metrics,
        v0RootCauses: researchV0RootCauses,
        mutations: researchProposedMutations,
        v1Metrics: researchImprovedV1Metrics,
      };
  }
}
