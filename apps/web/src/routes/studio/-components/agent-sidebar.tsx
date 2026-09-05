import React, { useState } from "react";
import type { AgentSpec } from "@repo/types";
import {
  RiAddLine,
  RiSearch2Line,
  RiCompass3Line,
  RiCodeLine,
  RiBarChartBoxLine,
  RiCheckLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
} from "react-icons/ri";

interface AgentSidebarProps {
  specialists: AgentSpec[];
  selectedAgentId?: string;
  onSelectAgent: (agent: AgentSpec) => void;
  onNewAgent: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const AgentSidebar: React.FC<AgentSidebarProps> = ({
  specialists,
  selectedAgentId,
  onSelectAgent,
  onNewAgent,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [filter, setFilter] = useState("");

  const filtered = specialists.filter(
    (a) =>
      a.name.toLowerCase().includes(filter.toLowerCase()) ||
      a.domain.toLowerCase().includes(filter.toLowerCase())
  );

  const getDomainIcon = (domain: string) => {
    switch (domain) {
      case "coding":
        return <RiCodeLine className="w-3.5 h-3.5 text-emerald-400" />;
      case "finance":
        return <RiBarChartBoxLine className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <RiCompass3Line className="w-3.5 h-3.5 text-foreground" />;
    }
  };

  if (isCollapsed) {
    return (
      <div className="w-12 bg-card/60 border-r border-border flex flex-col items-center py-4 shrink-0">
        <button
          onClick={onToggleCollapse}
          title="Expand My Agents"
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer mb-4"
        >
          <RiArrowRightSLine className="w-4 h-4" />
        </button>
        <button
          onClick={onNewAgent}
          title="Create New Agent"
          className="p-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs transition-colors cursor-pointer"
        >
          <RiAddLine className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <aside className="w-64 bg-card/60 border-r border-border flex flex-col h-full shrink-0 font-sans text-foreground">
      {/* Header */}
      <div className="h-14 px-4 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            My Agents
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
            {specialists.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onNewAgent}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium shadow-xs transition-colors cursor-pointer"
          >
            <RiAddLine className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
          <button
            onClick={onToggleCollapse}
            title="Collapse Sidebar"
            className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <RiArrowLeftSLine className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="p-3 border-b border-border/60">
        <div className="relative flex items-center">
          <RiSearch2Line className="w-3.5 h-3.5 absolute left-2.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search agents..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-background border border-border rounded-md pl-8 pr-3 py-1.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-colors"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filtered.map((agent) => {
          const isSelected = agent.id === selectedAgentId;
          return (
            <div
              key={agent.id}
              onClick={() => onSelectAgent(agent)}
              className={`p-2.5 rounded-lg border transition-all cursor-pointer group ${
                isSelected
                  ? "bg-primary/10 border-primary/30 text-foreground shadow-xs"
                  : "bg-transparent border-transparent hover:bg-accent/50 hover:border-border/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  {getDomainIcon(agent.domain)}
                  <span className="text-xs font-medium text-foreground truncate max-w-[140px]">
                    {agent.name}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-muted border border-border text-emerald-400">
                  {agent.versionTag}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="capitalize">{agent.domain}</span>
                <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400/90">
                  <RiCheckLine className="w-3 h-3" />
                  Ready
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
