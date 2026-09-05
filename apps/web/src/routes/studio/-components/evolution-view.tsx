import React, { useState } from "react";
import type { EngineeringSession, AgentSpec, RootCause, PipelineNode } from "@repo/types";
import {
  RiCheckLine,
  RiArrowRightLine,
  RiPlayCircleLine,
  RiDownload2Line,
  RiAlertLine,
  RiGitBranchLine,
  RiNodeTree,
  RiAddLine,
  RiSparklingLine,
} from "react-icons/ri";
import type { InspectorContent } from "./contextual-inspector";

interface EvolutionViewProps {
  session: EngineeringSession;
  onOpenTestModal: () => void;
  onOpenExportModal: () => void;
  onSelectInspector: (content: InspectorContent) => void;
}

export const EvolutionView: React.FC<EvolutionViewProps> = ({
  session,
  onOpenTestModal,
  onOpenExportModal,
  onSelectInspector,
}) => {
  const [activeTab, setActiveTab] = useState<"evolution" | "architecture">("evolution");

  const v0 = session.iterations[0];
  const v1 = session.iterations[session.iterations.length - 1];

  const v0Score = v0?.evaluationRun?.overallScore || 0;
  const v1Score = v1?.evaluationRun?.overallScore || 0;
  const netDelta = v1Score - v0Score;

  const v0Agent: AgentSpec | undefined = v0?.agentSpec;
  const v1Agent: AgentSpec | undefined = v1?.agentSpec || session.currentAgent;

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-5 sm:p-7 max-w-5xl mx-auto w-full font-sans text-foreground space-y-6 animate-in fade-in duration-300">
      {/* Top Banner: Final Agent State (Section 8) */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-xl bg-card border border-border shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <RiCheckLine className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                ✓ Agent Ready
              </span>
              <span className="text-[11px] font-mono text-muted-foreground">
                {v1Agent?.versionTag || "v1"}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
              {v1Agent?.name || "Engineered Specialist Agent"}
            </h2>
          </div>
        </div>

        {/* Top Action CTAs */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs font-medium border border-border shadow-xs transition-colors cursor-pointer"
          >
            <RiDownload2Line className="w-4 h-4 text-muted-foreground" />
            <span>Export Spec</span>
          </button>

          <button
            onClick={onOpenTestModal}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <RiPlayCircleLine className="w-4 h-4" />
            <span>Use Agent</span>
          </button>
        </div>
      </div>

      {/* View Switcher: Evolution Story vs Full Architecture Graph */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border">
          <button
            onClick={() => setActiveTab("evolution")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              activeTab === "evolution"
                ? "bg-background text-foreground shadow-xs border border-border/50"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <RiSparklingLine className="w-3.5 h-3.5" />
            <span>Evolution Story</span>
          </button>

          <button
            onClick={() => setActiveTab("architecture")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              activeTab === "architecture"
                ? "bg-background text-foreground shadow-xs border border-border/50"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <RiNodeTree className="w-3.5 h-3.5" />
            <span>Architecture View</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-muted-foreground">
          Target Threshold: {session.targetOverallScore}%
        </span>
      </div>

      {activeTab === "evolution" ? (
        <>
          {/* THE HERO JUMP CARD: Performance Evolution (Section 5) */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-xs relative overflow-hidden">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground block text-center mb-4">
              Autonomous Agent Performance Evolution
            </span>

            <div className="flex items-center justify-center gap-6 sm:gap-12 py-3">
              {/* v0 Baseline Score */}
              <div className="flex flex-col items-center">
                <span className="text-3xl sm:text-5xl font-extrabold text-muted-foreground font-mono tracking-tight">
                  {v0Score}%
                </span>
                <span className="text-xs font-mono font-medium text-muted-foreground/80 mt-1">
                  v0 Baseline
                </span>
              </div>

              {/* Transition Arrow & Delta */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-[1px] w-12 sm:w-28 bg-border" />
                  <RiArrowRightLine className="w-4 h-4 text-foreground" />
                </div>
                <span className="text-xs sm:text-sm font-mono font-semibold text-emerald-400 mt-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  +{netDelta} Point Net Gain
                </span>
              </div>

              {/* v1 Engineered Score */}
              <div className="flex flex-col items-center">
                <span className="text-3xl sm:text-5xl font-extrabold text-foreground font-mono tracking-tight">
                  {v1Score}%
                </span>
                <span className="text-xs font-mono font-medium text-emerald-400 mt-1">
                  {v1Agent?.versionTag || "v1"} Engineered
                </span>
              </div>
            </div>
          </div>

          {/* Side-by-Side Breakdown: WHY IT FAILED vs WHAT OPENBOT CHANGED */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Column 1: WHY IT FAILED */}
            <div className="flex flex-col bg-card border border-border rounded-xl p-5 shadow-xs space-y-3.5">
              <div className="flex items-center gap-2 pb-2.5 border-b border-border">
                <RiAlertLine className="w-4 h-4 text-destructive" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-destructive">
                  Why v0 Failed
                </h3>
              </div>

              <div className="space-y-2.5">
                {v0?.failureDiagnosis?.rootCauses && v0.failureDiagnosis.rootCauses.length > 0 ? (
                  v0.failureDiagnosis.rootCauses.map((rc: RootCause) => (
                    <div
                      key={rc.id}
                      onClick={() => onSelectInspector({ type: "failure", data: rc })}
                      className="p-3.5 rounded-lg bg-muted/40 hover:bg-muted/80 border border-border/80 hover:border-destructive/40 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-semibold text-destructive/90 group-hover:text-destructive">
                          ✕ {rc.title}
                        </span>
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-destructive/10 text-destructive border border-destructive/20">
                          {rc.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                        {rc.description}
                      </p>
                      <span className="text-[10px] font-mono text-muted-foreground/70 mt-2 block group-hover:text-foreground">
                        Click to inspect telemetry →
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic p-3">
                    No critical failure roots recorded.
                  </p>
                )}
              </div>
            </div>

            {/* Column 2: WHAT OPENBOT CHANGED */}
            <div className="flex flex-col bg-card border border-border rounded-xl p-5 shadow-xs space-y-3.5">
              <div className="flex items-center gap-2 pb-2.5 border-b border-border">
                <RiGitBranchLine className="w-4 h-4 text-foreground" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  What OpenBot Changed
                </h3>
              </div>

              <div className="space-y-2.5">
                {v0?.mutationDiff?.topologyDiffs && v0.mutationDiff.topologyDiffs.length > 0 ? (
                  v0.mutationDiff.topologyDiffs.map((mut, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-lg bg-muted/40 border border-border/80 flex items-start gap-2.5"
                    >
                      <span className="p-1 rounded bg-secondary text-foreground border border-border shrink-0 mt-0.5">
                        <RiAddLine className="w-3.5 h-3.5" />
                      </span>
                      <div>
                        <span className="text-xs font-medium text-foreground block">
                          {mut.description}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground mt-0.5 block">
                          Topology Mutation
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic p-3">
                    Mutations applied dynamically to DAG and system prompts.
                  </p>
                )}

                {v0?.mutationDiff?.promptDiffs && v0.mutationDiff.promptDiffs.length > 0 && (
                  <div className="p-3 rounded-lg bg-muted/30 border border-border text-xs text-muted-foreground">
                    <span className="text-[11px] font-mono text-foreground uppercase block mb-1">
                      Prompt Hardening
                    </span>
                    Injected strict negative constraints against ungrounded assertions across {v0.mutationDiff.promptDiffs.length} stages.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 9: ARCHITECTURE EVOLUTION (Visual Side-by-Side Diff) */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Architecture Evolution
                </h3>
                <span className="text-[11px] text-muted-foreground">
                  Visual comparison between initial baseline and mutated topology
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* v0 Baseline Topology */}
              <div className="flex flex-col space-y-2.5">
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  v0 Baseline ({v0Agent?.nodes?.length || 2} Stages)
                </span>
                <div className="space-y-2">
                  {v0Agent?.nodes?.map((node, i) => (
                    <div
                      key={node.id}
                      onClick={() => onSelectInspector({ type: "node", data: node })}
                      className="p-3 rounded-lg bg-muted/30 border border-border hover:border-border/80 hover:bg-muted/60 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-foreground">
                          0{i + 1}. {node.name}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {node.assignedTools?.length || 0} tools
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">
                        {node.role}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* v1 Engineered Topology */}
              <div className="flex flex-col space-y-2.5">
                <span className="text-xs font-mono text-foreground uppercase tracking-wider">
                  v1 Engineered ({v1Agent?.nodes?.length || 3} Stages)
                </span>
                <div className="space-y-2">
                  {v1Agent?.nodes?.map((node, i) => {
                    const isNewlyInjected = !v0Agent?.nodes?.some((old) => old.id === node.id);

                    return (
                      <div
                        key={node.id}
                        onClick={() => onSelectInspector({ type: "node", data: node })}
                        className={`p-3 rounded-lg border transition-all cursor-pointer ${
                          isNewlyInjected
                            ? "bg-accent/40 border-primary/40 shadow-xs"
                            : "bg-muted/30 border-border hover:border-border/80 hover:bg-muted/60"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                            0{i + 1}. {node.name}
                            {isNewlyInjected && (
                              <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/25">
                                Injected
                              </span>
                            )}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {node.assignedTools?.length || 0} tools
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">
                          {node.role}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Full Architecture Graph View (Section 6) */
        <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                How Your Agent Works
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Multi-stage DAG synthesized for: &ldquo;{session.goal}&rdquo;
              </p>
            </div>
            <span className="text-xs font-mono text-foreground">
              {v1Agent?.nodes.length} Executable Stages
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {v1Agent?.nodes.map((node: PipelineNode, index: number) => (
              <div
                key={node.id}
                onClick={() => onSelectInspector({ type: "node", data: node })}
                className="p-4 rounded-lg bg-muted/30 border border-border hover:border-border/80 hover:bg-muted/60 transition-all cursor-pointer flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">
                      Stage 0{index + 1}
                    </span>
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: node.color || "currentColor" }}
                    />
                  </div>
                  <h4 className="text-xs font-semibold text-foreground leading-tight">
                    {node.name}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-snug line-clamp-2">
                    {node.role}
                  </p>
                </div>

                <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                  <span>{node.assignedTools?.length || 0} Tools</span>
                  <span className="text-foreground hover:underline">Inspect →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
