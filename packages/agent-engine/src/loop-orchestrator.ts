import type {
  EngineeringSession,
  IterationStep,
  SessionEvent,
  AgentSpec,
  ChatMessage,
} from "@repo/types";
import { analyzeGoal } from "./goal-analyzer.js";
import { generateInitialV0Architecture } from "./arch-generator.js";

export type EventCallback = (event: SessionEvent) => void;

export class LoopOrchestrator {
  private onEvent?: EventCallback;

  constructor(onEvent?: EventCallback) {
    this.onEvent = onEvent;
  }

  private emit(
    sessionId: string,
    type: SessionEvent["type"],
    message: string,
    iterationIndex: number,
    payload?: any
  ) {
    const event: SessionEvent = {
      sessionId,
      type,
      message,
      iterationIndex,
      payload,
      timestamp: new Date().toISOString(),
    };
    if (this.onEvent) {
      this.onEvent(event);
    }
  }

  public async runEngineeringLoop(
    goalPrompt: string,
    sessionId: string = `sess-${Date.now()}`,
    initialMessages?: ChatMessage[]
  ): Promise<EngineeringSession> {
    const now = new Date().toISOString();
    const finalMessages: ChatMessage[] =
      initialMessages && initialMessages.length > 0
        ? initialMessages
        : [{ role: "user", content: goalPrompt, timestamp: now }];

    const session: EngineeringSession = {
      id: sessionId,
      goal: goalPrompt,
      domain: "research",
      status: "analyzing",
      iterations: [],
      targetOverallScore: 88,
      createdAt: now,
      updatedAt: now,
    };

    this.emit(sessionId, "SESSION_STARTED", `Initiated engineering session for: "${goalPrompt}"`, 0);

    // 1. Goal Analysis (Dynamic / LLM)
    const analysis = await analyzeGoal(goalPrompt);
    session.domain = analysis.domain;
    session.targetOverallScore = analysis.targetScore;

    this.emit(sessionId, "GOAL_PARSED", `Parsed goal. Identified domain: ${analysis.domain.toUpperCase()}`, 0, {
      agentName: analysis.agentName,
      extractedRequirements: analysis.extractedRequirements,
      successCriteria: analysis.successCriteria,
    });

    // 2. Synthesize Initial v0 Architecture (Dynamic / LLM)
    session.status = "generating";
    let currentAgent: AgentSpec = await generateInitialV0Architecture(analysis, goalPrompt);
    currentAgent.messages = finalMessages;
    session.currentAgent = currentAgent;

    this.emit(
      sessionId,
      "ARCHITECTURE_GENERATED",
      `Synthesized initial ${currentAgent.versionTag} topology: [${currentAgent.architectureSummary}]`,
      0,
      { agentSpec: currentAgent }
    );

    // 3. Register synthesized agent in session
    session.status = "completed";
    const step: IterationStep = {
      iterationIndex: 0,
      versionTag: currentAgent.versionTag,
      agentSpec: currentAgent,
      targetReached: true,
      timestamp: new Date().toISOString(),
    };
    session.iterations.push(step);

    this.emit(
      sessionId,
      "TARGET_REACHED",
      `Synthesized ${currentAgent.versionTag}: [${currentAgent.architectureSummary}]. Ready to configure credentials and test.`,
      0,
      { finalAgent: currentAgent }
    );

    session.updatedAt = new Date().toISOString();
    return session;
  }
}
