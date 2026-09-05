import React from "react";
import type { RootCause, PipelineNode, MetricScore } from "@repo/types";
import { RiCloseLine, RiAlertLine, RiCpuLine, RiBarChartLine, RiToolsLine } from "react-icons/ri";

export type InspectorContent =
  | { type: "failure"; data: RootCause }
  | { type: "node"; data: PipelineNode }
  | { type: "metric"; data: MetricScore }
  | null;

interface ContextualInspectorProps {
  content: InspectorContent;
  onClose: () => void;
}

export const ContextualInspector: React.FC<ContextualInspectorProps> = ({
  content,
  onClose,
}) => {
  if (!content) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-card border-l border-border shadow-2xl z-40 flex flex-col animate-in slide-in-from-right duration-200 text-foreground font-sans">
      {/* Header */}
      <div className="h-14 px-5 border-b border-border flex items-center justify-between shrink-0 bg-card">
        <div className="flex items-center gap-2">
          {content.type === "failure" && (
            <>
              <RiAlertLine className="w-4 h-4 text-destructive" />
              <span className="text-xs font-semibold uppercase tracking-wider text-destructive">
                Failure Diagnosis
              </span>
            </>
          )}
          {content.type === "node" && (
            <>
              <RiCpuLine className="w-4 h-4 text-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Pipeline Stage
              </span>
            </>
          )}
          {content.type === "metric" && (
            <>
              <RiBarChartLine className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Metric Evaluation
              </span>
            </>
          )}
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
        >
          <RiCloseLine className="w-4 h-4" />
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {content.type === "failure" && (
          <>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold ${
                    content.data.severity === "critical"
                      ? "bg-destructive/10 text-destructive border border-destructive/20"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}
                >
                  {content.data.severity}
                </span>
                <span className="text-xs font-mono text-muted-foreground">
                  {content.data.affectedMetric}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-foreground leading-snug">
                {content.data.title}
              </h3>
            </div>

            <div className="bg-muted/40 border border-border rounded-lg p-3 text-xs text-foreground/90 leading-relaxed">
              <span className="text-[11px] font-mono text-muted-foreground uppercase block mb-1">
                Root Cause Analysis
              </span>
              {content.data.description}
            </div>

            {content.data.evidenceSnippet && (
              <div className="bg-muted/20 border border-border rounded-lg p-3 text-xs text-muted-foreground font-mono leading-relaxed">
                <span className="text-[10px] uppercase text-muted-foreground/80 block mb-1">
                  Evidence Telemetry Snippet
                </span>
                {content.data.evidenceSnippet}
              </div>
            )}
          </>
        )}

        {content.type === "node" && (
          <>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-muted-foreground uppercase">
                  Stage 0{content.data.stepIndex + 1}
                </span>
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: content.data.color || "currentColor" }}
                />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                {content.data.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {content.data.role}
              </p>
            </div>

            {/* Equipped Tools */}
            <div>
              <span className="text-[11px] font-mono uppercase text-muted-foreground block mb-2">
                Equipped Tools ({content.data.assignedTools.length})
              </span>
              {content.data.assignedTools.length === 0 ? (
                <span className="text-xs text-muted-foreground italic">
                  No external tools (Direct reasoning stage)
                </span>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {content.data.assignedTools.map((tool) => (
                    <span
                      key={tool}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-secondary border border-border text-[11px] font-mono text-secondary-foreground"
                    >
                      <RiToolsLine className="w-3 h-3 text-muted-foreground" />
                      {tool}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* System Prompt Instructions */}
            <div>
              <span className="text-[11px] font-mono uppercase text-muted-foreground block mb-2">
                System Prompt Instructions
              </span>
              <div className="bg-muted/20 border border-border rounded-lg p-3 text-xs text-foreground font-mono leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                {content.data.systemPrompt}
              </div>
            </div>
          </>
        )}

        {content.type === "metric" && (
          <>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-foreground">
                  {content.data.name}
                </span>
                <span
                  className={`text-xs font-mono font-bold ${
                    content.data.passed ? "text-emerald-400" : "text-destructive"
                  }`}
                >
                  {content.data.score}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full rounded-full ${
                    content.data.passed ? "bg-emerald-500" : "bg-destructive"
                  }`}
                  style={{ width: `${content.data.score}%` }}
                />
              </div>
            </div>

            <div className="bg-muted/40 border border-border rounded-lg p-3 text-xs space-y-2">
              <div className="flex justify-between text-muted-foreground">
                <span>Target Threshold:</span>
                <span className="font-mono text-foreground">
                  {content.data.targetThreshold}%
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Evaluation Status:</span>
                <span
                  className={`font-mono font-semibold ${
                    content.data.passed ? "text-emerald-400" : "text-destructive"
                  }`}
                >
                  {content.data.passed ? "PASSED TARGET" : "BELOW TARGET"}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
