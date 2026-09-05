import type { ChatMessage } from "@repo/types";
import { callGeminiJSON } from "./llm-provider.js";

export type { ChatMessage };

export interface GoalAnalysisResult {
  domain: "research" | "coding" | "finance" | "general";
  agentName: string;
  extractedRequirements: string[];
  successCriteria: string[];
  targetScore: number;
  refinedPrompt?: string;
}

export type GoalClarificationResponse =
  | {
      status: "needs_clarification";
      question: string;
      missingPillars: string[];
      quickSuggestions?: string[];
    }
  | {
      status: "ready";
      analysis: GoalAnalysisResult;
    };

/**
 * Multi-turn Goal Clarifier & Analyzer
 * Checks if the user's prompt has the 3 required pillars:
 * 1. Data/Source Ingest
 * 2. Core Logic/Trigger Condition
 * 3. Delivery/Output Destination
 *
 * If any pillar is vague or missing, returns a targeted clarifying question.
 * If all pillars are satisfied, returns the finalized GoalAnalysisResult.
 */
export async function analyzeGoalWithConversation(
  messages: ChatMessage[]
): Promise<GoalClarificationResponse> {
  const systemPrompt = `You are the Lead Agent Architect inside OpenBot (Automated Agent Engineering Factory).
Your responsibility is to interview the user to ensure an agent has complete, rigorous architectural specifications before building.

An agent requires 3 Core Pillars to be built with full knowledge:
1. Source/Ingest: What data or systems does it read? (e.g. CSVs, GitHub repos, Solana DEX pools, Twitter/X)
2. Core Logic/Trigger: What specific logic, anomaly, threshold, or transformation does it perform? (e.g. transactions >$50k, deadlock detection, duplicate invoice splitting)
3. Action/Destination: Where does the output go? (e.g. Telegram webhook, markdown report, PR patch, Slack)

Decision Criteria:
- Review the entire conversation history.
- IF ANY of the 3 pillars are missing, ambiguous, or vague:
  Return JSON:
  {
    "status": "needs_clarification",
    "question": "A concise, conversational question asking ONLY for the missing details (do NOT repeat what was already answered)",
    "missingPillars": ["Source" | "Logic" | "Destination"],
    "quickSuggestions": ["2 to 3 short clickable suggested answers to help the user answer quickly"]
  }
- IF ALL 3 pillars are reasonably clear (or if the user provided enough context):
  Return JSON:
  {
    "status": "ready",
    "analysis": {
      "domain": "research" | "coding" | "finance" | "general",
      "agentName": "Specialized agent title (e.g. 'Solana Whale Swap Sentinel', 'Deadlock Resolution Specialist')",
      "extractedRequirements": ["3 to 5 clear technical requirements synthesized from the conversation"],
      "successCriteria": ["4 quantitative criteria, e.g. 'Detection Latency <= 500ms', 'Accuracy >= 90%'"],
      "targetScore": 88,
      "refinedPrompt": "Complete, unified goal prompt incorporating all user answers"
    }
  }`;

  const conversationTranscript = messages
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n");

  const userPrompt = `Evaluate this requirements conversation transcript:\n\n${conversationTranscript}`;

  return callGeminiJSON<GoalClarificationResponse>(systemPrompt, userPrompt);
}

/**
 * Single-prompt convenience analyzer (backwards-compatible)
 */
export async function analyzeGoal(goalPrompt: string): Promise<GoalAnalysisResult> {
  const res = await analyzeGoalWithConversation([{ role: "user", content: goalPrompt }]);
  if (res.status === "ready") {
    return res.analysis;
  }

  // If clarification was requested but single-prompt mode was invoked, auto-synthesize
  return {
    domain: "general",
    agentName: "Autonomous Task Specialist",
    extractedRequirements: [
      `Execute task: ${goalPrompt}`,
      "Ensure robust error handling and verification",
      "Format structured output for the user"
    ],
    successCriteria: [
      "Task Completion >= 85%",
      "Accuracy >= 85%",
      "Execution Latency <= 2s",
      "Verification Pass Rate >= 90%"
    ],
    targetScore: 88,
    refinedPrompt: goalPrompt
  };
}
