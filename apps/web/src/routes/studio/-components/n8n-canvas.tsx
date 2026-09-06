import React from 'react'
import type { AgentSpec, PipelineNode } from '@repo/types'
import {
  RiToolsLine,
  RiShieldCheckLine,
  RiArrowDownLine,
  RiSparklingLine,
  RiMailLine,
  RiTimeLine,
  RiTerminalBoxLine,
  RiFlashlightLine,
  RiPlayCircleLine,
} from 'react-icons/ri'
import type { InspectorContent } from './contextual-inspector'

interface N8nCanvasProps {
  agent: AgentSpec
  onSelectNode: (content: InspectorContent) => void
}

export const N8nCanvas: React.FC<N8nCanvasProps> = ({
  agent,
  onSelectNode,
}) => {
  const getNodeTypeBadge = (node: PipelineNode) => {
    if (node.type === 'trigger') {
      const schedule = node.parameters?.schedule as string | undefined
      const event = node.parameters?.event as string | undefined
      const triggerType = node.parameters?.triggerType as string | undefined

      if (schedule && schedule.toLowerCase() !== 'on-demand' && schedule.toLowerCase() !== 'manual') {
        return {
          label: `Trigger (${schedule})`,
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
          icon: <RiTimeLine className="w-3.5 h-3.5 text-amber-400" />,
        }
      }
      if (event || triggerType === 'webhook') {
        return {
          label: `Trigger (Webhook: ${event || 'Event'})`,
          color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
          icon: <RiFlashlightLine className="w-3.5 h-3.5 text-purple-400" />,
        }
      }
      return {
        label: 'Trigger (Manual / On-Demand)',
        color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        icon: <RiPlayCircleLine className="w-3.5 h-3.5 text-blue-400" />,
      }
    }
    if (
      node.type === 'action' ||
      node.name.toLowerCase().includes('email') ||
      node.name.toLowerCase().includes('dispatch')
    ) {
      return {
        label: 'Action (Dispatcher)',
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        icon: <RiMailLine className="w-3.5 h-3.5 text-emerald-400" />,
      }
    }
    if (node.name.toLowerCase().includes('verif') || node.role.toLowerCase().includes('verif')) {
      return {
        label: 'Guardrail & Verifier',
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        icon: <RiShieldCheckLine className="w-3.5 h-3.5 text-emerald-400" />,
      }
    }
    if (node.type === 'custom_code') {
      return {
        label: 'Code Worker',
        color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
        icon: <RiTerminalBoxLine className="w-3.5 h-3.5 text-rose-400" />,
      }
    }
    if (node.type === 'tool' || node.assignedTools.length > 0) {
      return {
        label: 'Integrated Tool',
        color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
        icon: <RiToolsLine className="w-3.5 h-3.5 text-cyan-400" />,
      }
    }
    return {
      label: 'LLM Reasoning & Intelligence',
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      icon: <RiSparklingLine className="w-3.5 h-3.5 text-purple-400" />,
    }
  }

  return (
    <div className="flex flex-col bg-card border border-border rounded-2xl overflow-hidden shadow-sm font-sans text-foreground">
      {/* Canvas Top Bar */}
      <div className="h-12 px-4 sm:px-5 border-b border-border/80 flex items-center justify-between bg-muted/20 shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold text-foreground">
            Agent Workflow Pipeline
          </span>
          <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 border border-border/70 px-2 py-0.5 rounded-full">
            Sequential DAG
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
          <span>
            {agent.nodes.length === 0
              ? 'Requirements Gathering'
              : `${agent.nodes.length} Connected Stages`}
          </span>
        </div>
      </div>

      {/* Main Pipeline Display Area (Strictly Vertical Sequential Flow) */}
      <div
        className="p-4 sm:p-6 overflow-y-auto max-h-[calc(100vh-210px)] flex-1 relative"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        {agent.nodes.length === 0 ? (
          <div className="max-w-md mx-auto py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-xs">
              <RiSparklingLine className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Requirements Gathering in Progress
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                OpenBot is analyzing your goal and clarifying parameters in the conversation. Once the requirements are complete, autonomous pipeline stages, tools, and verification suites will synthesize here.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-card border border-border text-left w-full shadow-xs">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block mb-1">
                Target Task
              </span>
              <p className="text-xs text-foreground font-medium line-clamp-2">
                {agent.goal}
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-xl mx-auto py-2">
            {agent.nodes.map((node: PipelineNode, idx: number) => {
            const badge = getNodeTypeBadge(node)
            const isLast = idx === agent.nodes.length - 1

            return (
              <React.Fragment key={node.id}>
                {/* Vertical Node Card */}
                <div
                  onClick={() => onSelectNode({ type: 'node', data: node })}
                  className="w-full bg-card/95 hover:bg-card border border-border hover:border-primary/60 rounded-xl p-4 shadow-xs transition-all duration-150 cursor-pointer group select-none relative"
                >
                  {/* Step Sequence Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border ${badge.color}`}
                    >
                      {badge.icon}
                      <span>{badge.label}</span>
                    </span>

                    <span className="text-[10px] font-mono text-muted-foreground">
                      Stage 0{idx + 1}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                    {node.name}
                  </h4>

                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {node.role}
                  </p>

                  {/* Runtime Execution Parameters */}
                  {node.parameters && Object.keys(node.parameters).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {node.parameters.schedule && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          ⏱️ {node.parameters.schedule}
                        </span>
                      )}
                      {node.parameters.recipient && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          📧 {node.parameters.recipient}
                        </span>
                      )}
                      {node.parameters.channel && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 uppercase">
                          ⚡ {node.parameters.channel}
                        </span>
                      )}
                      {node.parameters.criteria && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
                          🎯 {node.parameters.criteria}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Tools Allocated */}
                  <div className="mt-3 pt-2.5 border-t border-border/60">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {node.assignedTools.length > 0 ? (
                        node.assignedTools.map((toolId) => {
                          const cleanName = toolId
                            .replace('tool-', '')
                            .replace('monid-', '')
                            .replace(/-/g, ' ')
                          return (
                            <span
                              key={toolId}
                              className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground border border-border"
                            >
                              <span className="text-amber-400">⚡</span>
                              <span className="capitalize">{cleanName}</span>
                            </span>
                          )
                        })
                      ) : (
                        <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                          <span>Direct Reasoning Pass</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground pt-1">
                      <span className="text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Active
                      </span>
                      <span className="text-primary group-hover:underline">
                        Inspect →
                      </span>
                    </div>
                  </div>
                </div>

                {/* Downward Sequential Connector Arrow */}
                {!isLast && (
                  <div className="flex flex-col items-center justify-center my-1.5 text-primary/70">
                    <div className="w-[2px] h-4 bg-primary/40 relative flex flex-col items-center justify-end">
                      <RiArrowDownLine className="w-3.5 h-3.5 text-primary absolute -bottom-1.5" />
                    </div>
                  </div>
                )}
              </React.Fragment>
            )
          })}
        </div>
        )}
      </div>

      {/* Canvas Footer Note */}
      <div className="px-4 py-2 bg-muted/10 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>
          Workflow synthesized autonomously by OpenBot. Click any node to inspect parameters and system instructions.
        </span>
        <span className="font-mono text-primary">
          Sequential Pipeline DAG
        </span>
      </div>
    </div>
  )
}
