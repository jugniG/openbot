import React, { useState } from 'react'
import type { AgentSpec } from '@repo/types'
import {
  RiAddLine,
  RiCheckLine,
  RiCompass3Line,
  RiCodeLine,
  RiBarChartBoxLine,
  RiSearch2Line,
} from 'react-icons/ri'

interface AgentLibraryProps {
  specialists: AgentSpec[]
  selectedAgentId?: string
  onSelectAgent: (agent: AgentSpec) => void
  onNewAgent: () => void
}

export const AgentLibrary: React.FC<AgentLibraryProps> = ({
  specialists,
  selectedAgentId,
  onSelectAgent,
  onNewAgent,
}) => {
  const [filterQuery, setFilterQuery] = useState('')

  const filteredSpecialists = specialists.filter(
    (a) =>
      a.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      a.domain.toLowerCase().includes(filterQuery.toLowerCase()) ||
      a.goal.toLowerCase().includes(filterQuery.toLowerCase()),
  )

  const getDomainIcon = (domain: string) => {
    switch (domain) {
      case 'coding':
        return <RiCodeLine className="w-3.5 h-3.5 text-emerald-400" />
      case 'finance':
        return <RiBarChartBoxLine className="w-3.5 h-3.5 text-amber-400" />
      default:
        return <RiCompass3Line className="w-3.5 h-3.5 text-foreground" />
    }
  }

  return (
    <div className="flex flex-col h-full bg-card border-r border-border text-foreground font-sans">
      {/* Sidebar Header */}
      <div className="px-4 py-3.5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
            Library
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-muted text-muted-foreground border border-border">
            {specialists.length}
          </span>
        </div>
        <button
          onClick={onNewAgent}
          className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-foreground bg-secondary hover:bg-secondary/80 border border-border transition-all cursor-pointer shadow-xs"
        >
          <RiAddLine className="w-3.5 h-3.5" />
          <span>New Spec</span>
        </button>
      </div>

      {/* Quick Search */}
      <div className="px-3 pt-3 pb-1">
        <div className="relative flex items-center">
          <RiSearch2Line className="w-3.5 h-3.5 absolute left-2.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Filter specialists..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full bg-background border border-border rounded-md pl-8 pr-3 py-1.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-colors"
          />
        </div>
      </div>

      {/* Specialist List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {filteredSpecialists.map((agent) => {
          const isSelected = agent.id === selectedAgentId
          return (
            <div
              key={agent.id}
              onClick={() => onSelectAgent(agent)}
              className={`group relative flex flex-col p-3 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-accent text-accent-foreground border-border shadow-xs'
                  : 'bg-transparent hover:bg-accent/40 border-transparent hover:border-border/60 text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1 rounded bg-muted border border-border shrink-0">
                    {getDomainIcon(agent.domain)}
                  </div>
                  <span className="text-xs font-medium text-foreground truncate transition-colors">
                    {agent.name}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Ready
                </span>
              </div>

              <p className="text-[11px] text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                {agent.goal}
              </p>

              <div className="mt-2.5 pt-2 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="font-mono">{agent.nodes.length} stages</span>
                <span className="text-emerald-400/90 flex items-center gap-1 font-mono">
                  <RiCheckLine className="w-3 h-3" /> Certified
                </span>
              </div>
            </div>
          )
        })}

        {filteredSpecialists.length === 0 && (
          <div className="p-6 text-center text-xs text-muted-foreground">
            No matching specialists found.
          </div>
        )}
      </div>
    </div>
  )
}
