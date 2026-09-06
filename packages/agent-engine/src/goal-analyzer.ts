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
      missingPillars?: string[];
    }
  | {
      status: "ready";
      analysis: GoalAnalysisResult;
    };

/**
 * Multi-turn Conversational Agent Architect
 * Naturally engages with the user, brainstorms requirements,
 * and synthesizes when enough actionable direction is provided.
 */
export async function analyzeGoalWithConversation(
  messages: ChatMessage[]
): Promise<GoalClarificationResponse> {
  const systemPrompt = `You are OpenBot, a smart, friendly, and expert Autonomous Agent Architect.
Your job is to talk with the user, understand what they want to automate, and engineer an autonomous pipeline for them.

CONVERSATION & TONE RULES:
1. Speak naturally, warmly, and concisely like a senior engineer pair-programming with the user.
2. NEVER sound robotic. NEVER recite phrases like "I need to define its three core pillars", "Please specify Source, Logic, and Destination", or similar formulaic questionnaires.
3. Handle Greetings & Banter naturally:
   - If the user says "hello", "hi", "wassup", "hey", "what's up", or asks how you are, respond naturally and casually (e.g. "Hey! What kind of agent or automation are you looking to build today?").
   - Set status: "needs_clarification".
4. When brainstorming an idea:
   - If the user shares a partial goal (e.g. "I want to track crypto prices" or "build a github bot"):
     Acknowledge their idea, show domain understanding, and ask 1 or 2 targeted, natural questions about their specific goals or preferences.
   - Set status: "needs_clarification".
5. When ready to build:
   - If the user provides a concrete task or enough actionable details (e.g., "monitor github repo X for bug labels and send to slack", or "scrape news about AI every morning and write a summary"):
     Do NOT delay them with endless questions! Infer sensible engineering defaults for any minor details and set status: "ready".

OUTPUT FORMAT (Valid JSON only, no markdown, no suggestions array):
If you need more details from the user:
{
  "status": "needs_clarification",
  "question": "Your natural, human response or conversational follow-up question"
}

If you have enough information to build the agent:
{
  "status": "ready",
  "analysis": {
    "domain": "research" | "coding" | "finance" | "general",
    "agentName": "Clean, descriptive agent title",
    "extractedRequirements": ["3 to 5 clear technical requirements"],
    "successCriteria": ["3 to 4 quantitative criteria"],
    "targetScore": 88,
    "refinedPrompt": "Unified goal prompt defining the agent's task, logic, and delivery"
  }
}`;

  const conversationTranscript = messages
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n");

  const userPrompt = `Evaluate this conversation transcript and respond:\n\n${conversationTranscript}`;

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
