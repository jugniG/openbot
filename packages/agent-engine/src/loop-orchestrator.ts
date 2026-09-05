import type {
  EngineeringSession,
  IterationStep,
  SessionEvent,
  AgentSpec,
  EvaluationCase,
  ChatMessage,
} from "@repo/types";
import { analyzeGoal } from "./goal-analyzer.js";
import { generateInitialV0Architecture } from "./arch-generator.js";
import { runAgentPipeline } from "./agent-runner.js";
import { evaluateAgentRun } from "./evaluator.js";
import { diagnoseFailures } from "./failure-analyzer.js";
import { optimizeAgent } from "./agent-optimizer.js";
import { getBenchmarkForDomain } from "@repo/benchmarks";

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

    // 3. Construct Dynamic Evaluation Case for the specific task
    const evalCase: EvaluationCase = {
      id: `eval-case-${analysis.domain}-${Date.now()}`,
      name: `Evaluation Suite: ${analysis.agentName}`,
      description: `Target test case for ${analysis.agentName} evaluating: ${goalPrompt}`,
      domain: analysis.domain,
      input: {
        taskDescription: goalPrompt,
        requiredCapabilities: analysis.extractedRequirements,
      },
      expectedOutcomes: analysis.successCriteria,
    };

    const maxIterations = 2;

    for (let iter = 0; iter < maxIterations; iter++) {
      session.status = "evaluating";

      // 4. Run Agent Pipeline (Dynamic Stage Execution)
      this.emit(
        sessionId,
        "AGENT_EXECUTING",
        `Executing ${currentAgent.versionTag} against dynamic evaluation suite...`,
        iter,
        { version: currentAgent.versionTag }
      );

      const execResult = await runAgentPipeline(currentAgent, evalCase);

      // 5. Multi-Metric Evaluation (Dynamic Scores & Deltas)
      const evalRun = evaluateAgentRun(currentAgent, evalCase, execResult);

      this.emit(
        sessionId,
        "EVALUATION_COMPLETED",
        `Evaluated ${currentAgent.versionTag}: Overall Score = ${evalRun.overallScore}% (Target: ${session.targetOverallScore}%)`,
        iter,
        { evalRun }
      );

      // Check if target met
      if (evalRun.passed) {
        const step: IterationStep = {
          iterationIndex: iter,
          versionTag: currentAgent.versionTag,
          agentSpec: currentAgent,
          evaluationRun: evalRun,
          targetReached: true,
          timestamp: new Date().toISOString(),
        };
        session.iterations.push(step);
        session.status = "completed";

        this.emit(
          sessionId,
          "TARGET_REACHED",
          `Autonomous optimization successful! ${currentAgent.versionTag} exceeded target threshold (${evalRun.overallScore}% >= ${session.targetOverallScore}%).`,
          iter,
          { finalAgent: currentAgent, evalRun }
        );
        break;
      }

      // 6. Failure Analysis (Dynamic Root Causes via Gemini)
      session.status = "diagnosing";
      const failureDiagnosis = await diagnoseFailures(currentAgent, evalRun);

      this.emit(
        sessionId,
        "FAILURES_DIAGNOSED",
        `Failure diagnosis for ${currentAgent.versionTag}: ${failureDiagnosis.summary}`,
        iter,
        { failureDiagnosis }
      );

      // 7. Optimization & Mutation (Dynamic DAG Transformation via Gemini)
      session.status = "optimizing";
      const { improvedAgent, mutationDiff } = await optimizeAgent(currentAgent, failureDiagnosis);

      this.emit(
        sessionId,
        "MUTATION_APPLIED",
        `Applied mutations: generated ${improvedAgent.versionTag} topology [${improvedAgent.architectureSummary}]`,
        iter,
        { mutationDiff, improvedAgent }
      );

      const step: IterationStep = {
        iterationIndex: iter,
        versionTag: currentAgent.versionTag,
        agentSpec: currentAgent,
        evaluationRun: evalRun,
        failureDiagnosis,
        mutationDiff,
        targetReached: false,
        timestamp: new Date().toISOString(),
      };
      session.iterations.push(step);

      // Advance agent for next iteration
      currentAgent = improvedAgent;
      session.currentAgent = currentAgent;
    }

    session.updatedAt = new Date().toISOString();
    return session;
  }
}
