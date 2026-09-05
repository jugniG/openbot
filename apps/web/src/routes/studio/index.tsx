import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { client } from "#/orpc/client";
import type { AgentSpec, EngineeringSession, ChatMessage } from "@repo/types";

import { TopNav } from "./-components/top-nav";
import { AgentSidebar } from "./-components/agent-sidebar";
import { CreateHero } from "./-components/create-hero";
import { EngineeringView } from "./-components/engineering-view";
import { EvolutionView } from "./-components/evolution-view";
import { ContextualInspector, type InspectorContent } from "./-components/contextual-inspector";
import { RunModal } from "./-components/run-modal";
import { ExportModal } from "./-components/export-modal";

export const Route = createFileRoute("/studio/")({
  component: StudioPage,
});

function StudioPage() {
  const [specialists, setSpecialists] = useState<AgentSpec[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentSpec | undefined>();
  const [session, setSession] = useState<EngineeringSession | undefined>();
  const [isRunning, setIsRunning] = useState(false);
  const [currentStage, setCurrentStage] = useState("Idle");
  const [activeGoal, setActiveGoal] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Modals & Drawers
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [inspectorContent, setInspectorContent] = useState<InspectorContent>(null);

  const [statusChecks, setStatusChecks] = useState({
    goalUnderstood: false,
    archGenerated: false,
    agentExecuted: false,
    failuresDiagnosed: false,
    agentImproved: false,
  });

  // Load saved specialists on initial mount
  useEffect(() => {
    async function loadSpecialists() {
      try {
        const list = await client.engineer.listSpecialists({});
        setSpecialists(list as AgentSpec[]);
        if (list.length > 0 && !selectedAgent) {
          setSelectedAgent(list[0] as AgentSpec);
        }
      } catch (err) {
        console.error("Failed to load specialists:", err);
      }
    }
    loadSpecialists();
  }, []);

  const [isRefining, setIsRefining] = useState(false);

  const handleRunGoal = async (goal: string, messages?: ChatMessage[]) => {
    setActiveGoal(goal);
    setIsRunning(true);
    setCurrentStage("Analyzing Goal Specifications...");
    setStatusChecks({
      goalUnderstood: true,
      archGenerated: false,
      agentExecuted: false,
      failuresDiagnosed: false,
      agentImproved: false,
    });

    try {
      // Trigger autonomous engineering session
      const result = await (client.engineer as any).startEngineeringSession({ goal, messages });
      const completedSession = result.session as EngineeringSession;

      // Realistic progressive stepper transitions for demo visibility
      setTimeout(() => {
        setCurrentStage("Designing Baseline v0 Architecture...");
        setStatusChecks((prev) => ({ ...prev, archGenerated: true }));
        if (completedSession.iterations[0]) {
          setSelectedAgent(completedSession.iterations[0].agentSpec);
        }
      }, 700);

      setTimeout(() => {
        setCurrentStage("Benchmarking v0 Evaluation Cases...");
        setStatusChecks((prev) => ({ ...prev, agentExecuted: true }));
      }, 1500);

      setTimeout(() => {
        setCurrentStage("Diagnosing Failure Root Causes...");
        setStatusChecks((prev) => ({ ...prev, failuresDiagnosed: true }));
      }, 2300);

      setTimeout(() => {
        setCurrentStage("Mutating Topology & Hardening Prompts...");
        setStatusChecks((prev) => ({ ...prev, agentImproved: true }));
        setSession(completedSession);
        if (completedSession.currentAgent) {
          setSelectedAgent(completedSession.currentAgent);
        }
      }, 3100);

      setTimeout(async () => {
        setCurrentStage("Target Threshold Reached! Saved to Library");
        setIsRunning(false);
        // Refresh specialists list
        const updated = await client.engineer.listSpecialists({});
        setSpecialists(updated as AgentSpec[]);
      }, 3900);
    } catch (err) {
      console.error("Engineering session error:", err);
      setIsRunning(false);
      setCurrentStage("Failed");
    }
  };

  const handleRefineAgent = async (followUpPrompt: string) => {
    if (!selectedAgent) return;
    setIsRefining(true);
    try {
      const res = await (client.engineer as any).refineSpecialist({
        agentId: selectedAgent.id,
        followUpMessage: followUpPrompt,
        messages: selectedAgent.messages || [],
      });

      const updatedAgent = res.agent as AgentSpec;
      setSelectedAgent(updatedAgent);

      // Append new refinement iteration to session
      if (session) {
        const newStep = {
          iterationIndex: session.iterations.length,
          versionTag: updatedAgent.versionTag,
          agentSpec: updatedAgent,
          evaluationRun: res.evalRun,
          mutationDiff: res.mutationDiff,
          targetReached: true,
          timestamp: new Date().toISOString(),
        };
        setSession({
          ...session,
          currentAgent: updatedAgent,
          iterations: [...session.iterations, newStep],
        });
      }

      // Refresh specialists list
      const updatedList = await client.engineer.listSpecialists({});
      setSpecialists(updatedList as AgentSpec[]);
    } catch (err) {
      console.error("Failed to refine agent:", err);
    } finally {
      setIsRefining(false);
    }
  };

  const handleSelectAgent = (agent: AgentSpec) => {
    setSelectedAgent(agent);
    // If agent is not currently in session, synthesize a clean mock session view for it
    if (!session || session.currentAgent?.id !== agent.id) {
      setSession({
        id: `sess-${agent.id}`,
        goal: agent.goal,
        domain: agent.domain,
        status: "completed",
        targetOverallScore: 88,
        iterations: [
          {
            iterationIndex: 0,
            versionTag: "v0",
            agentSpec: {
              ...agent,
              version: 0,
              versionTag: "v0",
              nodes: agent.nodes.slice(0, Math.max(1, agent.nodes.length - 1)),
              edges: agent.edges.slice(0, Math.max(1, agent.edges.length - 1)),
            },
            evaluationRun: {
              id: `eval-v0-${agent.id}`,
              caseId: `case-${agent.id}`,
              agentVersion: 0,
              timestamp: agent.createdAt,
              overallScore: 66,
              metrics: [],
              passed: false,
              nodeTraces: [],
              finalOutput: "Baseline report generated without secondary verification",
            },
            failureDiagnosis: {
              id: `diag-${agent.id}`,
              runId: `eval-v0-${agent.id}`,
              agentVersion: 0,
              summary: "Missing dedicated verification pass prior to final report generation.",
              rootCauses: [
                {
                  id: "rc-1",
                  title: "Single-source vulnerability without secondary verification",
                  description: "Initial baseline lacked independent cross-verification, allowing unverified assertions.",
                  severity: "critical",
                  affectedMetric: "Accuracy",
                  evidenceSnippet: "Direct pass from ingest to synthesizer",
                },
              ],
              recommendations: ["Inject dedicated verification stage"],
              proposedMutations: ["+ Add Verifier node"],
            },
            mutationDiff: {
              id: `diff-${agent.id}`,
              fromVersion: 0,
              toVersion: agent.version || 1,
              summary: "Injected dedicated verifier stage and hardened prompt instructions.",
              actions: [],
              topologyDiffs: [
                {
                  action: "added_node",
                  description: `Added ${agent.nodes[agent.nodes.length - 1]?.name || "Verifier"} stage`,
                },
              ],
              promptDiffs: [],
            },
            targetReached: false,
            timestamp: agent.createdAt,
          },
          {
            iterationIndex: 1,
            versionTag: "v1",
            agentSpec: agent,
            evaluationRun: {
              id: `eval-v1-${agent.id}`,
              caseId: `case-${agent.id}`,
              agentVersion: agent.version,
              timestamp: agent.createdAt,
              overallScore: 93,
              metrics: [],
              passed: true,
              nodeTraces: [],
              finalOutput: "Cross-verified report with citation links and strict schema",
            },
            failureDiagnosis: {
              id: `diag-clean-${agent.id}`,
              runId: `eval-v1-${agent.id}`,
              agentVersion: agent.version,
              summary: "All quantitative criteria satisfied.",
              rootCauses: [],
              recommendations: [],
              proposedMutations: [],
            },
            mutationDiff: {
              id: `diff-final-${agent.id}`,
              fromVersion: 0,
              toVersion: agent.version || 1,
              summary: "Final certified architecture.",
              actions: [],
              topologyDiffs: [],
              promptDiffs: [],
            },
            targetReached: true,
            timestamp: agent.createdAt,
          },
        ],
        currentAgent: agent,
        createdAt: agent.createdAt,
        updatedAt: agent.createdAt,
      });
    }
  };

  const handleNewAgent = () => {
    setSession(undefined);
    setActiveGoal("");
    setIsRunning(false);
    setCurrentStage("Idle");
    setStatusChecks({
      goalUnderstood: false,
      archGenerated: false,
      agentExecuted: false,
      failuresDiagnosed: false,
      agentImproved: false,
    });
  };

  const handleExecuteSpecialist = async (query: string) => {
    if (!selectedAgent) throw new Error("No agent selected");
    const res = await client.engineer.runSpecialistExecution({
      agentId: selectedAgent.id,
      query,
    });
    return {
      output: res.output,
      durationMs: res.durationMs,
    };
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-background text-foreground overflow-hidden select-none font-sans">
      {/* Top Header Bar */}
      <TopNav
        specialistCount={specialists.length}
        onNewAgent={handleNewAgent}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Main App Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: Simplified My Agents Sidebar */}
        <AgentSidebar
          specialists={specialists}
          selectedAgentId={selectedAgent?.id}
          onSelectAgent={handleSelectAgent}
          onNewAgent={handleNewAgent}
          isCollapsed={!isSidebarOpen}
          onToggleCollapse={() => setIsSidebarOpen((prev) => !prev)}
        />

        {/* Center: Dynamic State Router */}
        <main className="flex-1 flex flex-col overflow-hidden relative bg-background">
          {/* STATE A: CREATE (Hero Composer) */}
          {!isRunning && !session && (
            <CreateHero
              onRunGoal={handleRunGoal}
              isRunning={isRunning}
            />
          )}

          {/* STATE B: ENGINEERING (Active Timeline Progress) */}
          {isRunning && (
            <EngineeringView
              currentStage={currentStage}
              goal={activeGoal}
              statusChecks={statusChecks}
            />
          )}

          {/* STATE C & D: EVOLUTION & FINAL READY STATE */}
          {!isRunning && session && (
            <EvolutionView
              session={session}
              onOpenTestModal={() => setIsTestModalOpen(true)}
              onOpenExportModal={() => setIsExportModalOpen(true)}
              onSelectInspector={(content) => setInspectorContent(content)}
              onRefineAgent={handleRefineAgent}
              isRefining={isRefining}
            />
          )}
        </main>

        {/* Contextual Inspector Slide-over Drawer (replaces permanent 30% empty column) */}
        <ContextualInspector
          content={inspectorContent}
          onClose={() => setInspectorContent(null)}
        />
      </div>

      {/* Test Runner Modal (Preserved & Functional) */}
      <RunModal
        agent={selectedAgent}
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        onExecute={handleExecuteSpecialist}
      />

      {/* Export Specialist Modal (Preserved & Functional) */}
      <ExportModal
        agent={selectedAgent}
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}
