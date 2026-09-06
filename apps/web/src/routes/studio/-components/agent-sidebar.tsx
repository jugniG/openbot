import React, { useState } from 'react'
import type { AgentSpec } from '@repo/types'
import {
  RiCpuLine,
  RiAddLine,
  RiSearch2Line,
  RiCompass3Line,
  RiCodeLine,
  RiBarChartBoxLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
} from 'react-icons/ri'

interface AgentSidebarProps {
  specialists: AgentSpec[]
  selectedAgentId?: string
  onSelectAgent: (agent: AgentSpec) => void
  onNewAgent: () => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export const AgentSidebar: React.FC<AgentSidebarProps> = ({
  specialists,
  selectedAgentId,
  onSelectAgent,
  onNewAgent,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [filter, setFilter] = useState('')

  const filtered = specialists.filter(
    (a) =>
      a.name.toLowerCase().includes(filter.toLowerCase()) ||
      a.domain.toLowerCase().includes(filter.toLowerCase()),
  )

  const getDomainIcon = (domain: string) => {
    switch (domain) {
      case 'coding':
        return <RiCodeLine className="w-3.5 h-3.5 text-blue-400" />
      case 'finance':
        return <RiBarChartBoxLine className="w-3.5 h-3.5 text-amber-400" />
      default:
        return <RiCompass3Line className="w-3.5 h-3.5 text-emerald-400" />
    }
  }

  if (isCollapsed) {
    return (
      <div className="w-13 bg-card border-r border-border flex flex-col items-center py-3.5 shrink-0 justify-between h-full font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-1">
            <RiCpuLine className="w-4 h-4" />
          </div>
          <button
            onClick={onToggleCollapse}
            title="Expand Sidebar"
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
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
      </div>
    )
  }

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-full shrink-0 font-sans text-foreground">
      {/* Brand Header */}
      <div className="h-14 px-3.5 border-b border-border flex items-center justify-between shrink-0 bg-muted/20">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <RiCpuLine className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold tracking-tight text-foreground block truncate">
              OpenBot
            </span>
            <span className="text-[10px] text-muted-foreground block truncate font-mono">
              Agent Studio
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onNewAgent}
            title="Create New Agent"
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <RiAddLine className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
          <button
            onClick={onToggleCollapse}
            title="Collapse Sidebar"
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
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
          const isSelected = agent.id === selectedAgentId
          const hasPipeline = agent.nodes && agent.nodes.length > 0

          return (
            <div
              key={agent.id}
              onClick={() => onSelectAgent(agent)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer group ${
                isSelected
                  ? 'bg-primary/10 border-primary/40 text-foreground shadow-xs'
                  : 'bg-transparent border-transparent hover:bg-accent/40 hover:border-border/60 text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  {getDomainIcon(agent.domain)}
                  <span className="text-xs font-semibold text-foreground truncate max-w-[150px]">
                    {agent.name}
                  </span>
                </div>
                {hasPipeline && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Ready
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground font-mono text-[10px] flex items-center gap-1">
                  {hasPipeline ? `${agent.nodes.length} stages` : 'Chat'}
                </span>
                <span className="text-muted-foreground capitalize text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/40">
                  {agent.domain}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
