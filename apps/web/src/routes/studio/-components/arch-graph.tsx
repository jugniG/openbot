import React from "react";
import type { AgentSpec, PipelineNode } from "@repo/types";
import { RiToolsLine, RiCpuLine, RiArrowRightLine } from "react-icons/ri";

interface ArchGraphProps {
  agent?: AgentSpec;
  activeNodeId?: string;
}

export const ArchGraph: React.FC<ArchGraphProps> = ({ agent, activeNodeId }) => {
  if (!agent || agent.nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-72 border border-dashed border-border rounded-xl bg-card p-8 text-center text-muted-foreground font-sans">
        <RiCpuLine className="w-8 h-8 text-muted-foreground/60 mb-2.5" />
        <p className="text-xs font-semibold text-foreground">No Pipeline Generated</p>
        <p className="text-[11px] text-muted-foreground mt-1 max-w-sm">
          Select a preset or describe a task above to autonomously engineer the multi-stage DAG.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-card border border-border rounded-xl p-5 shadow-xs relative overflow-hidden text-foreground font-sans">
      {/* Visual Canvas Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-border mb-4">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
            Pipeline Topology
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-muted text-foreground border border-border">
            {agent.versionTag}
          </span>
          <span className="text-xs text-muted-foreground font-medium">
            {agent.name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-muted-foreground">
            {agent.nodes.length} Stages
          </span>
        </div>
      </div>

      {/* DAG Visualizer Track */}
      <div className="relative py-3 overflow-x-auto">
        <div className="flex items-center gap-3 min-w-max pb-2 px-1">
          {agent.nodes.map((node: PipelineNode, index: number) => {
            const isActive = node.id === activeNodeId;
            const isLast = index === agent.nodes.length - 1;

            return (
              <React.Fragment key={node.id}>
                {/* Node Card */}
                <div
                  className={`flex flex-col w-60 rounded-lg border p-4 transition-all duration-200 relative ${
                    isActive
                      ? "bg-muted/80 border-primary shadow-xs ring-1 ring-primary"
                      : "bg-muted/30 border-border hover:border-border/80 hover:bg-muted/60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                      0{index + 1}
                    </span>
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: node.color || "currentColor" }}
                    />
                  </div>

                  <h4 className="text-xs font-semibold text-foreground line-clamp-1">
                    {node.name}
                  </h4>

                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed line-clamp-2 min-h-[32px]">
                    {node.role}
                  </p>

                  {/* Tools Allocated */}
                  <div className="mt-3 pt-2.5 border-t border-border/60 flex flex-wrap gap-1">
                    {node.assignedTools.length > 0 ? (
                      node.assignedTools.map((toolId) => (
                        <span
                          key={toolId}
                          className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground border border-border"
                        >
                          <RiToolsLine className="w-2.5 h-2.5 text-muted-foreground" />
                          <span>{toolId.replace("tool-", "")}</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                        <RiCpuLine className="w-2.5 h-2.5" /> Direct Reasoning
                      </span>
                    )}
                  </div>
                </div>

                {/* Connector Arrow */}
                {!isLast && (
                  <div className="flex items-center text-muted-foreground shrink-0 px-0.5">
                    <RiArrowRightLine className="w-4 h-4 text-muted-foreground/60" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="mt-2 pt-2.5 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
        <span className="truncate max-w-md">{agent.architectureSummary}</span>
        <span className="text-emerald-400">● Self-Healed Architecture</span>
      </div>
    </div>
  );
};
