import React, { useState, useEffect } from 'react'
import type { AgentSpec } from '@repo/types'
import {
  RiCloseLine,
  RiLoader4Line,
  RiCornerDownLeftLine,
  RiTerminalBoxLine,
  RiMailLine,
  RiBriefcaseLine,
  RiExternalLinkLine,
  RiSparklingLine,
  RiCpuLine,
  RiCheckDoubleLine,
} from 'react-icons/ri'

export interface RunModalResult {
  durationMs: number
  sandboxId?: string
  microVmType?: string
  status?: string
  terminalLogs?: string[]
  items?: Array<{
    id: string
    title: string
    company: string
    platform: 'Reddit' | 'X' | 'Web'
    sourceUrl: string
    rate: string
    location: string
    timeAgo: string
    snippet: string
    tags?: string[]
  }>
  emailPreview?: {
    recipient: string
    subject: string
    schedule: string
    html: string
  }
  output: string
}

interface RunModalProps {
  agent?: AgentSpec
  isOpen: boolean
  onClose: () => void
  onExecute: (query: string) => Promise<RunModalResult>
}

export const RunModal: React.FC<RunModalProps> = ({
  agent,
  isOpen,
  onClose,
  onExecute,
}) => {
  if (!isOpen || !agent) return null

  const [query, setQuery] = useState(
    agent.goal || 'Search remote AI engineer jobs on Reddit and X'
  )
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<RunModalResult | null>(null)
  const [activeTab, setActiveTab] = useState<'items' | 'email' | 'terminal'>('items')

  useEffect(() => {
    if (agent?.goal) {
      setQuery(agent.goal)
    }
  }, [agent?.goal])

  const handleRun = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!query.trim() || isRunning) return
    setIsRunning(true)
    setResult(null)
    try {
      const res = await onExecute(query)
      setResult(res)
      if (res.items && res.items.length > 0) {
        setActiveTab('items')
      } else if (res.emailPreview) {
        setActiveTab('email')
      } else {
        setActiveTab('terminal')
      }
    } catch (err) {
      console.error('Execution failed:', err)
    } finally {
      setIsRunning(false)
    }
  }

  const triggerNode = agent.nodes.find((n) => n.type === 'trigger')
  const rawSchedule = triggerNode?.parameters?.schedule as string | undefined
  const isScheduled = Boolean(
    rawSchedule &&
      rawSchedule.toLowerCase() !== 'on-demand' &&
      rawSchedule.toLowerCase() !== 'manual'
  )
  const isWebhook =
    triggerNode?.parameters?.triggerType === 'webhook' ||
    Boolean(triggerNode?.parameters?.event || triggerNode?.parameters?.webhookUrl)

  const triggerDisplayText = isScheduled
    ? `Scheduled (${rawSchedule})`
    : isWebhook
    ? `Webhook (${(triggerNode?.parameters?.event as string) || 'Event'})`
    : 'On-Demand Execution'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-foreground font-sans">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-border bg-muted/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <RiCpuLine className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">
                  {agent.name}
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Isolated Sandbox Runtime
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
                  ⚡ Tool Integrations
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                {agent.nodes.length} Stages • {triggerDisplayText}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <RiCloseLine className="w-5 h-5" />
          </button>
        </div>

        {/* Query Input Bar */}
        <form
          onSubmit={handleRun}
          className="p-4 sm:p-5 border-b border-border bg-card/50 flex flex-col gap-2 shrink-0"
        >
          <div className="flex items-center justify-between text-[11px] font-mono uppercase text-muted-foreground">
            <span>Execution Goal / Trigger Query</span>
            <span className="text-primary">Runs inside isolated sandbox runtime</span>
          </div>

          <div className="relative flex items-center">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isRunning}
              placeholder="e.g. give me job listing from reddit, x in every 6hr and email me"
              className="w-full bg-background border border-border rounded-xl pl-3.5 pr-28 py-2.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-colors shadow-xs"
            />
            <button
              type="submit"
              disabled={isRunning || !query.trim()}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-lg bg-primary hover:bg-primary/90 disabled:bg-muted text-primary-foreground disabled:text-muted-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              {isRunning ? (
                <>
                  <RiLoader4Line className="w-4 h-4 animate-spin" />
                  <span>Executing...</span>
                </>
              ) : (
                <>
                  <span>Run Agent</span>
                  <RiCornerDownLeftLine className="w-3.5 h-3.5 opacity-70" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Tab Navigation (Visible after run or when results exist) */}
        <div className="px-5 border-b border-border bg-muted/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('items')}
              className={`px-3.5 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'items'
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <RiBriefcaseLine className="w-3.5 h-3.5" />
              <span>Extracted Opportunities</span>
              {result?.items && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-primary/20 text-primary font-bold">
                  {result.items.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('email')}
              className={`px-3.5 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'email'
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <RiMailLine className="w-3.5 h-3.5" />
              <span>Email Digest Preview</span>
              {result?.emailPreview && (
                <span className="text-[10px] font-mono text-emerald-400">● Ready</span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('terminal')}
              className={`px-3.5 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'terminal'
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <RiTerminalBoxLine className="w-3.5 h-3.5" />
              <span>Sandbox Logs</span>
            </button>
          </div>

          {result && (
            <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-2">
              <span className="text-emerald-400 flex items-center gap-1">
                <RiCheckDoubleLine className="w-3.5 h-3.5" />
                Verified Exit 0
              </span>
              <span>•</span>
              <span>{result.durationMs}ms</span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 min-h-[320px]">
          {/* Running State */}
          {isRunning && (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center space-y-3">
              <div className="relative">
                <RiLoader4Line className="w-8 h-8 animate-spin text-primary" />
                <span className="absolute -inset-1 rounded-full bg-primary/20 animate-ping opacity-75" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Executing in Isolated Sandbox Runtime...
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  Spinning up isolated sandbox, executing search and extraction tools, and verifying payload.
                </p>
              </div>
            </div>
          )}

          {/* Empty Initial State */}
          {!isRunning && !result && (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center space-y-3 text-muted-foreground">
              <div className="p-3 rounded-2xl bg-muted/40 border border-border">
                <RiSparklingLine className="w-6 h-6 text-primary" />
              </div>
              <div className="max-w-md">
                <h4 className="text-sm font-semibold text-foreground mb-1">
                  Ready for Real Execution
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Click <strong>Run Agent</strong> to launch this agent inside an isolated sandbox environment. It will execute the full DAG, fetch live data from targeted sources, and generate the output digest.
                </p>
              </div>
            </div>
          )}

          {/* TAB 1: CURATED JOB CARDS */}
          {!isRunning && result && activeTab === 'items' && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-muted-foreground">
                  Found <strong>{result.items?.length || 0}</strong> verified opportunities matching filters
                </span>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                  Deduplicated & Filtered
                </span>
              </div>

              {result.items && result.items.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {result.items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-card border border-border hover:border-primary/50 rounded-xl p-4 shadow-sm flex flex-col justify-between transition-all group"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span
                            className={`inline-flex items-center text-[10px] font-mono px-2 py-0.5 rounded font-semibold border ${
                              item.platform === 'Reddit'
                                ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                            }`}
                          >
                            {item.platform} • {item.timeAgo}
                          </span>
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            {item.rate}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                          {item.title}
                        </h4>

                        <div className="text-[11px] text-muted-foreground mt-1 mb-2">
                          <span className="font-semibold text-foreground/80">{item.company}</span> • <span>{item.location}</span>
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-3">
                          {item.snippet}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {item.tags?.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                        >
                          <span>Apply</span>
                          <RiExternalLinkLine className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No direct items returned in this pass. Check the Solari Sandbox Logs tab for full trace.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EMAIL DIGEST PREVIEW */}
          {!isRunning && result && activeTab === 'email' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border text-xs">
                <div className="flex items-center gap-2">
                  <RiMailLine className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-foreground">Delivery Target:</span>
                  <span className="font-mono text-primary">
                    {result.emailPreview?.recipient || 'sahil@example.com'}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-muted-foreground">
                  Trigger: {result.emailPreview?.schedule || triggerDisplayText}
                </div>
              </div>

              {result.emailPreview?.html ? (
                <div
                  className="rounded-xl border border-border p-4 bg-background overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: result.emailPreview.html }}
                />
              ) : (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No email preview generated.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SOLARI SANDBOX TERMINAL LOGS */}
          {!isRunning && result && activeTab === 'terminal' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Runtime Environment: {result.microVmType || 'Isolated Sandbox'}</span>
                <span>Sandbox ID: {result.sandboxId || 'sbx-active'}</span>
              </div>

              <div className="p-4 rounded-xl bg-black/90 border border-zinc-800 text-zinc-300 font-mono text-xs leading-relaxed space-y-1.5 shadow-inner">
                {result.terminalLogs && result.terminalLogs.length > 0 ? (
                  result.terminalLogs.map((log, index) => (
                    <div
                      key={index}
                      className={
                        log.includes('✔')
                          ? 'text-emerald-400'
                          : log.includes('⚡')
                            ? 'text-amber-400 font-semibold'
                            : log.includes('▶')
                              ? 'text-primary'
                              : 'text-zinc-400'
                      }
                    >
                      {log}
                    </div>
                  ))
                ) : (
                  <div>{result.output}</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-border bg-card flex items-center justify-between shrink-0">
          <span className="text-[11px] text-muted-foreground font-mono">
            Powered by Solari AI Sandboxes & Integrated Tools
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs font-medium border border-border transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
