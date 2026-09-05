import type { ToolDefinition } from "@repo/types";

export const availableTools: ToolDefinition[] = [
  // Research Tools
  {
    id: "tool-web-search",
    name: "Web Search Engine",
    description: "Performs real-time web queries and retrieves ranked serp results.",
    parameters: {},
    category: "search",
    isMock: false,
  },
  {
    id: "tool-content-scraper",
    name: "Web Content Scraper",
    description: "Extracts clean readable markdown and text from web page URLs.",
    parameters: {},
    category: "retrieval",
    isMock: false,
  },
  {
    id: "tool-source-verifier",
    name: "Evidence Cross-Verifier",
    description: "Cross-checks facts against independent repositories, academic papers, and benchmark databases.",
    parameters: {},
    category: "verification",
    isMock: false,
  },
  // Coding Tools
  {
    id: "tool-ast-investigator",
    name: "Codebase AST Investigator",
    description: "Parses Abstract Syntax Trees, traces call graphs and symbol declarations across files.",
    parameters: {},
    category: "code",
    isMock: false,
  },
  {
    id: "tool-test-runner",
    name: "Sandboxed Test Runner",
    description: "Executes unit and integration test suites in an isolated sandbox and captures stack traces.",
    parameters: {},
    category: "code",
    isMock: false,
  },
  {
    id: "tool-git-patcher",
    name: "Git Diff & Patch Engine",
    description: "Generates atomic unified git diffs and verifies patch application cleanly.",
    parameters: {},
    category: "code",
    isMock: false,
  },
  // Finance & Data Tools
  {
    id: "tool-csv-loader",
    name: "Vectorized CSV & Parquet Ingester",
    description: "Ingests structured tabular datasets, normalizes currencies, and cleans date formatting.",
    parameters: {},
    category: "data",
    isMock: false,
  },
  {
    id: "tool-iqr-anomaly-detector",
    name: "Categorical IQR Anomaly Detector",
    description: "Detects numerical and categorical policy outliers using rolling interquartile ranges.",
    parameters: {},
    category: "data",
    isMock: false,
  },
  {
    id: "tool-compliance-checker",
    name: "Policy Handbook Compliance Auditor",
    description: "Validates transaction metadata against company governance limits and procurement clauses.",
    parameters: {},
    category: "verification",
    isMock: false,
  },
];

export function getToolById(id: string): ToolDefinition | undefined {
  return availableTools.find((t) => t.id === id);
}
