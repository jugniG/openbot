import React, { useState } from "react";
import type { AgentSpec } from "@repo/types";
import { RiCloseLine, RiLoader4Line, RiCornerDownLeftLine } from "react-icons/ri";

interface RunModalProps {
  agent?: AgentSpec;
  isOpen: boolean;
  onClose: () => void;
  onExecute: (query: string) => Promise<{ output: string; durationMs: number }>;
}

export const RunModal: React.FC<RunModalProps> = ({
  agent,
  isOpen,
  onClose,
  onExecute,
}) => {
  if (!isOpen || !agent) return null;

  const [query, setQuery] = useState(
    agent.domain === "coding"
      ? "Diagnose worker deadlock during high concurrency drain"
      : agent.domain === "finance"
      ? "Audit Q3 expense ledger for structured invoice splitting"
      : "Compare LangGraph vs CrewAI vs Eve memory architecture"
  );
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<{ output: string; durationMs: number } | null>(null);

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isRunning) return;
    setIsRunning(true);
    setResult(null);
    try {
      const res = await onExecute(query);
      setResult(res);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-foreground font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] px-2 py-0.5 rounded bg-muted border border-border text-foreground font-mono">
                {agent.versionTag} Specialist
              </span>
              <h3 className="text-sm font-semibold text-foreground">{agent.name}</h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{agent.architectureSummary}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <RiCloseLine className="w-5 h-5" />
          </button>
        </div>

        {/* Query Input */}
        <form onSubmit={handleRun} className="p-5 border-b border-border bg-muted/20">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
            Execution Test Query
          </label>
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isRunning}
              placeholder="Enter test query for specialist..."
              className="w-full bg-background border border-border rounded-lg pl-3 pr-24 py-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-colors"
            />
            <button
              type="submit"
              disabled={isRunning || !query.trim()}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-md bg-primary hover:bg-primary/90 disabled:bg-muted text-primary-foreground disabled:text-muted-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {isRunning ? (
                <>
                  <RiLoader4Line className="w-3.5 h-3.5 animate-spin" />
                  <span className="shimmer">Running</span>
                </>
              ) : (
                <>
                  <span>Execute</span>
                  <RiCornerDownLeftLine className="w-3 h-3 opacity-70" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Output Console */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-muted-foreground text-[11px]">
            <span>Verified Execution Telemetry</span>
            {result && <span>Latency: {result.durationMs}ms</span>}
          </div>

          {isRunning && (
            <div className="flex items-center justify-center p-12 text-muted-foreground gap-2">
              <RiLoader4Line className="w-5 h-5 animate-spin text-primary" />
              <span className="text-xs shimmer">Executing multi-stage pipeline across assigned tools...</span>
            </div>
          )}

          {result && (
            <div className="p-4 rounded-lg bg-muted/30 border border-border text-foreground leading-relaxed whitespace-pre-wrap select-all">
              {result.output}
            </div>
          )}

          {!isRunning && !result && (
            <div className="p-10 text-center text-muted-foreground text-xs">
              Click Execute to run the agent's synthesized DAG against the query.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border bg-card flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs font-medium border border-border transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
