import React, { useState } from "react";
import type { EngineeringSession, IterationStep } from "@repo/types";
import { MetricRadar } from "./metric-radar";
import { FailureCard } from "./failure-card";
import { DiffViewer } from "./diff-viewer";
import {
  RiPlayCircleLine,
  RiDownload2Line,
  RiArrowRightLine,
  RiBarChartLine,
  RiAlertLine,
  RiGitBranchLine,
  RiSparklingLine,
} from "react-icons/ri";

interface EngineeringPanelProps {
  session?: EngineeringSession;
  onOpenTestModal: () => void;
  onOpenExportModal?: () => void;
}

export const EngineeringPanel: React.FC<EngineeringPanelProps> = ({
  session,
  onOpenTestModal,
  onOpenExportModal,
}) => {
  const [selectedIterationIndex, setSelectedIterationIndex] = useState<number>(0);
  const [inspectorTab, setInspectorTab] = useState<"metrics" | "diagnosis" | "diff">("metrics");

  if (!session || session.iterations.length === 0) {
    return (
      <div className="flex flex-col h-full bg-card border-l border-border p-6 text-foreground font-sans">
        <div className="flex items-center justify-between pb-3.5 border-b border-border">
          <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
            Inspector
          </span>
          <span className="text-[11px] text-muted-foreground font-mono">Idle</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
          <RiSparklingLine className="w-8 h-8 mb-2.5 text-muted-foreground/60" />
          <p className="text-xs font-semibold text-foreground">Awaiting Engineering Goal</p>
          <p className="text-[11px] text-muted-foreground mt-1 max-w-xs leading-relaxed">
            Run an autonomous engineering cycle to inspect iteration scores, diagnosed failure root causes, and mutation diffs.
          </p>
        </div>
      </div>
    );
  }

  const v0 = session.iterations[0];
  const v1 = session.iterations[session.iterations.length - 1];
  const currentStep: IterationStep =
    session.iterations[selectedIterationIndex] || session.iterations[session.iterations.length - 1];

  const isFinalSuccess = v1?.targetReached;
  const netDelta = v1 && v0 ? v1.evaluationRun.overallScore - v0.evaluationRun.overallScore : 0;

  return (
    <div className="flex flex-col h-full bg-card border-l border-border text-foreground font-sans overflow-hidden">
      {/* Inspector Header */}
      <div className="px-5 py-3.5 border-b border-border flex items-center justify-between bg-card shrink-0">
        <div>
          <h2 className="text-xs font-semibold tracking-wider uppercase text-foreground">
            Engineering Inspector
          </h2>
          <span className="text-[11px] text-muted-foreground font-mono">
            {session.domain.toUpperCase()} • {session.iterations.length} Iterations
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenExportModal && (
            <button
              onClick={onOpenExportModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs font-medium border border-border transition-all cursor-pointer shadow-xs"
            >
              <RiDownload2Line className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Export</span>
            </button>
          )}

          {isFinalSuccess && (
            <button
              onClick={onOpenTestModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <RiPlayCircleLine className="w-3.5 h-3.5" />
              <span>Test Agent</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Core Thesis Score Jump Card */}
        {v0 && v1 && session.iterations.length > 1 && (
          <div className="p-4 rounded-xl bg-muted/40 border border-border text-xs shadow-xs">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider font-semibold">
              Autonomous Optimization Result
            </span>

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-3 font-mono">
                <div className="text-center">
                  <div className="text-sm font-bold text-muted-foreground">
                    {v0.evaluationRun.overallScore}%
                  </div>
                  <div className="text-[10px] text-muted-foreground/80">v0 Baseline</div>
                </div>

                <RiArrowRightLine className="w-4 h-4 text-muted-foreground" />

                <div className="text-center">
                  <div className="text-sm font-bold text-foreground">
                    {v1.evaluationRun.overallScore}%
                  </div>
                  <div className="text-[10px] text-muted-foreground/80">v1 Specialist</div>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 font-mono font-semibold border border-emerald-500/20 text-xs">
                +{netDelta}% Net Gain
              </span>
            </div>
          </div>
        )}

        {/* Iteration Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-lg border border-border">
          {session.iterations.map((step, idx) => {
            const isSelected = idx === (selectedIterationIndex ?? session.iterations.length - 1);
            return (
              <button
                key={step.versionTag}
                onClick={() => setSelectedIterationIndex(idx)}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-md text-xs font-mono font-medium transition-all cursor-pointer ${
                  isSelected
                    ? "bg-background text-foreground shadow-xs border border-border/50"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{step.versionTag}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded ${
                    step.evaluationRun.passed
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-amber-500/10 text-amber-400"
                  }`}
                >
                  {step.evaluationRun.overallScore}%
                </span>
              </button>
            );
          })}
        </div>

        {/* Segmented Inspector Tabs */}
        <div className="flex items-center border-b border-border text-xs font-medium">
          <button
            onClick={() => setInspectorTab("metrics")}
            className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
              inspectorTab === "metrics"
                ? "border-primary text-foreground font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <RiBarChartLine className="w-3.5 h-3.5" />
            <span>Benchmark Metrics</span>
          </button>
          <button
            onClick={() => setInspectorTab("diagnosis")}
            className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
              inspectorTab === "diagnosis"
                ? "border-primary text-foreground font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <RiAlertLine className="w-3.5 h-3.5" />
            <span>Root Causes</span>
          </button>
          <button
            onClick={() => setInspectorTab("diff")}
            className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
              inspectorTab === "diff"
                ? "border-primary text-foreground font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <RiGitBranchLine className="w-3.5 h-3.5" />
            <span>Mutations</span>
          </button>
        </div>

        {/* Active Tab View */}
        <div className="pt-1">
          {inspectorTab === "metrics" && (
            <MetricRadar
              metrics={currentStep.evaluationRun.metrics}
              overallScore={currentStep.evaluationRun.overallScore}
              versionTag={currentStep.versionTag}
              targetScore={session.targetOverallScore}
            />
          )}

          {inspectorTab === "diagnosis" && (
            <FailureCard diagnosis={currentStep.failureDiagnosis} />
          )}

          {inspectorTab === "diff" && (
            <DiffViewer mutationDiff={currentStep.mutationDiff} />
          )}
        </div>
      </div>
    </div>
  );
};
