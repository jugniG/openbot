import React, { useState } from "react";
import type { MutationDiff } from "@repo/types";
import { RiNodeTree, RiFileTextLine, RiAddLine } from "react-icons/ri";

interface DiffViewerProps {
  mutationDiff?: MutationDiff;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ mutationDiff }) => {
  const [activeTab, setActiveTab] = useState<"topology" | "prompt">("topology");

  if (!mutationDiff) {
    return (
      <div className="p-6 text-center text-xs text-muted-foreground bg-card rounded-lg border border-border">
        No mutation diff available for this iteration.
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-3.5 font-sans">
      {/* Sub tabs: Topology vs Prompt */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
          Mutation (v{mutationDiff.fromVersion} → v{mutationDiff.toVersion})
        </span>

        <div className="flex items-center gap-1 bg-muted p-1 rounded-md border border-border text-xs">
          <button
            onClick={() => setActiveTab("topology")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
              activeTab === "topology"
                ? "bg-background text-foreground shadow-xs border border-border/50"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <RiNodeTree className="w-3 h-3" />
            <span>Topology</span>
          </button>
          <button
            onClick={() => setActiveTab("prompt")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
              activeTab === "prompt"
                ? "bg-background text-foreground shadow-xs border border-border/50"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <RiFileTextLine className="w-3 h-3" />
            <span>Prompts</span>
          </button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        {mutationDiff.summary}
      </p>

      {/* Topology Diffs */}
      {activeTab === "topology" && (
        <div className="space-y-2">
          {mutationDiff.topologyDiffs.length > 0 ? (
            mutationDiff.topologyDiffs.map((td, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-card border border-border text-xs font-mono text-foreground flex items-start gap-2"
              >
                <RiAddLine className="w-3.5 h-3.5 text-foreground shrink-0 mt-0.5" />
                <span className="leading-relaxed">{td.description}</span>
              </div>
            ))
          ) : (
            <div className="p-4 text-xs text-muted-foreground font-mono text-center">
              No structural topology changes.
            </div>
          )}
        </div>
      )}

      {/* Prompt Diffs */}
      {activeTab === "prompt" && (
        <div className="space-y-2.5">
          {mutationDiff.promptDiffs.map((pd, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-card border border-border text-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground font-mono text-[11px]">
                  Node: {pd.nodeId}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                  Prompt Hardening
                </span>
              </div>

              {pd.oldPrompt && (
                <div className="p-2.5 rounded bg-destructive/10 border border-destructive/20 font-mono text-[11px] text-destructive leading-relaxed">
                  <span className="font-bold mr-1.5">-</span>
                  {pd.oldPrompt}
                </div>
              )}

              <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 font-mono text-[11px] text-emerald-400 leading-relaxed">
                <span className="font-bold mr-1.5">+</span>
                {pd.newPrompt}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
