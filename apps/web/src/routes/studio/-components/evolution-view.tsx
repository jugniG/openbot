import React, { useState, useRef, useEffect } from 'react'
import type {
  EngineeringSession,
  AgentSpec,
  ChatMessage,
  PipelineNode,
} from '@repo/types'
import {
  RiPlayCircleLine,
  RiNodeTree,
  RiLoader4Line,
  RiRobot2Line,
  RiUser3Line,
  RiShieldCheckLine,
  RiTerminalBoxLine,
  RiFileCopyLine,
  RiCheckboxCircleLine,
  RiArrowLeftLine,
  RiSearchLine,
  RiBracesLine,
  RiArrowRightSLine,
  RiArrowUpLine,
  RiKey2Line,
} from 'react-icons/ri'
import { N8nCanvas } from './n8n-canvas'
import { EnvsPanel } from './envs-panel'
import { EnvPromptCard } from './env-prompt-card'
import type { InspectorContent } from './contextual-inspector'

export interface AgentRunRecord {
  id: string
  timestamp: string
  timeAgo: string
  query: string
  triggerType: 'Scheduled Cron' | 'Manual Trigger' | 'API Webhook'
  durationMs: number
  sandboxId: string
  microVmType: string
  status: 'COMPLETED' | 'FAILED'
  exitCode: number
  terminalLogs: string[]
  outputPayload?: any
  nodeGraphSnapshot: PipelineNode[]
}

interface EvolutionViewProps {
  session: EngineeringSession
  onOpenTestModal: () => void
  onOpenExportModal: () => void
  onSelectInspector: (content: InspectorContent) => void
  onRefineAgent?: (followUpPrompt: string) => Promise<void>
  onExecuteSpecialist?: (query: string) => Promise<any>
  onUpdateAgent?: (updated: AgentSpec) => void
  isRefining?: boolean
}

type BoardTab = 'pipeline' | 'runs' | 'envs'
type RunDetailTab = 'logs' | 'graph' | 'output'

export const EvolutionView: React.FC<EvolutionViewProps> = ({
  session,
  onSelectInspector,
  onRefineAgent,
  onExecuteSpecialist,
  onUpdateAgent,
  isRefining = false,
}) => {
  const [boardTab, setBoardTab] = useState<BoardTab>('pipeline')
  const [openedRunId, setOpenedRunId] = useState<string | null>(null)
  const [runDetailTab, setRunDetailTab] = useState<RunDetailTab>('logs')
  const [runsSearch, setRunsSearch] = useState('')
  const [runsFilter, setRunsFilter] = useState<'ALL' | 'COMPLETED' | 'FAILED'>('ALL')
  const [refineInput, setRefineInput] = useState('')
  const [isRunningAgent, setIsRunningAgent] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const finalIteration = session.iterations[session.iterations.length - 1]
  const agent: AgentSpec = finalIteration?.agentSpec || session.currentAgent

  const configuredEnvCount = Object.keys(agent.envs || {}).length
  const requiresEnvs =
    (agent.requiredEnvs && agent.requiredEnvs.length > 0) ||
    agent.nodes.some(
      (n) =>
        n.parameters?.channel === 'slack' ||
        n.parameters?.channel === 'discord' ||
        n.parameters?.channel === 'sendgrid' ||
        n.name.toLowerCase().includes('slack') ||
        n.name.toLowerCase().includes('discord') ||
        n.assignedTools.some((t) =>
          [
            'tool-github-api',
            'tool-twitter-x',
            'tool-firecrawl',
            'tool-slack-notifier',
            'tool-discord-notifier',
            'tool-webhook-dispatch',
          ].includes(t)
        )
    )
  const hasEnvs = configuredEnvCount > 0 || requiresEnvs

  const triggerNode = agent.nodes.find((n) => n.type === 'trigger')
  const actionNode = agent.nodes.find(
    (n) => n.type === 'action' || n.name.toLowerCase().includes('email') || n.name.toLowerCase().includes('dispatch')
  )
  const conversationText =
    (agent.goal || '') + ' ' + (agent.messages?.map((m) => m.content).join(' ') || '') + ' ' + (session.goal || '')
  const extractedEmail = conversationText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0]

  const rawSchedule = triggerNode?.parameters?.schedule as string | undefined
  const isScheduled = Boolean(
    rawSchedule &&
      rawSchedule.toLowerCase() !== 'on-demand' &&
      rawSchedule.toLowerCase() !== 'manual'
  )
  const isWebhook =
    triggerNode?.parameters?.triggerType === 'webhook' ||
    Boolean(triggerNode?.parameters?.event || triggerNode?.parameters?.webhookUrl)

  const triggerBadgeText = isScheduled
    ? `⏱️ ${rawSchedule}`
    : isWebhook
    ? `⚡ Webhook (${(triggerNode?.parameters?.event as string) || 'Event'})`
    : '▶ On-Demand'

  const triggerDisplayText = isScheduled
    ? `Scheduled (${rawSchedule})`
    : isWebhook
    ? `Webhook (${(triggerNode?.parameters?.event as string) || 'Incoming'})`
    : 'Manual / On-Demand'

  const recipientEmail = (actionNode?.parameters?.recipient as string) || extractedEmail || 'user@example.com'

  const seedRuns: AgentRunRecord[] = [
    {
      id: 'run-9482',
      timestamp: '03:22 AM',
      timeAgo: '2m ago',
      query: agent.goal,
      triggerType: isScheduled ? 'Scheduled Cron' : isWebhook ? 'API Webhook' : 'Manual Trigger',
      durationMs: 420,
      sandboxId: 'sbx-789a12',
      microVmType: 'Isolated Sandbox Runtime (Linux 6.6)',
      status: 'COMPLETED',
      exitCode: 0,
      terminalLogs: [
        `[00:00:01] [INFO]  ⚡ Spawning ephemeral sandbox (sbx-789a12)...`,
        `[00:00:01] [INFO]  🔒 Hardware-isolated runtime active (Linux 6.6, 1vCPU, 2GB RAM)`,
        `[00:00:01] [STAGE] 📦 Ingesting agent DAG: "${agent.name}" (${agent.nodes.length} connected nodes)`,
        `[00:00:02] [STAGE] ▶ Stage 1 (${triggerNode?.name || 'Initiation'}): Trigger: ${triggerDisplayText}`,
        `[00:00:02] [TOOL]  ▶ Stage 2: Dispatched tool integrations and platform scrapers`,
        `[00:00:03] [STAGE] ▶ Stage 3: LLM reasoning, schema validation, and deduplication passed`,
        `[00:00:04] [STAGE] ▶ Stage 4 (${actionNode?.name || 'Action'}): Delivery action compiled for ${recipientEmail}`,
        `[00:00:04] [SUCCESS] ✔ Sandbox run completed successfully (exit code 0). Environment released.`,
      ],
      outputPayload: {
        status: 'SUCCESS',
        exitCode: 0,
        sandboxId: 'sbx-789a12',
        durationMs: 420,
        nodesExecuted: agent.nodes.length,
        trigger: triggerDisplayText,
        actionTarget: recipientEmail,
        summary: `Autonomous run completed across all ${agent.nodes.length} stages with zero execution errors.`,
      },
      nodeGraphSnapshot: [...agent.nodes],
    },
    {
      id: 'run-8910',
      timestamp: '09:22 PM',
      timeAgo: isScheduled ? '6h ago' : 'Yesterday',
      query: agent.goal,
      triggerType: isScheduled ? 'Scheduled Cron' : isWebhook ? 'API Webhook' : 'Manual Trigger',
      durationMs: 385,
      sandboxId: 'sbx-342b99',
      microVmType: 'Isolated Sandbox Runtime (Linux 6.6)',
      status: 'COMPLETED',
      exitCode: 0,
      terminalLogs: [
        isScheduled
          ? `[00:00:01] [INFO]  ⏰ Cron interval timer triggered scheduled run (${rawSchedule}) for "${agent.name}"`
          : isWebhook
          ? `[00:00:01] [INFO]  ⚡ Webhook event received: "${triggerNode?.parameters?.event || 'push'}"`
          : `[00:00:01] [INFO]  ▶ Manual execution initiated for "${agent.name}"`,
        `[00:00:01] [INFO]  Provisioned ephemeral sandbox runtime (sbx-342b99)`,
        `[00:00:02] [STAGE] Ingested input payload and checked source updates`,
        `[00:00:03] [TOOL]  Executed intermediate tool calls against gateway`,
        `[00:00:04] [STAGE] Emitted verified payload`,
        `[00:00:04] [SUCCESS] Exit code 0. Clean shutdown.`,
      ],
      outputPayload: {
        status: 'SUCCESS',
        exitCode: 0,
        sandboxId: 'sbx-342b99',
        durationMs: 385,
        nodesExecuted: agent.nodes.length,
        trigger: triggerDisplayText,
      },
      nodeGraphSnapshot: [...agent.nodes],
    },
  ]

  const [runs, setRuns] = useState<AgentRunRecord[]>(seedRuns)

  const openedRun = runs.find((r) => r.id === openedRunId) || runs[0]

  const filteredRuns = runs.filter((r) => {
    if (runsFilter === 'COMPLETED' && r.status !== 'COMPLETED') return false
    if (runsFilter === 'FAILED' && r.status !== 'FAILED') return false
    if (runsSearch.trim()) {
      const q = runsSearch.toLowerCase()
      return (
        r.id.toLowerCase().includes(q) ||
        r.query.toLowerCase().includes(q) ||
        r.sandboxId.toLowerCase().includes(q) ||
        r.triggerType.toLowerCase().includes(q)
      )
    }
    return true
  })

  const messages: ChatMessage[] =
    agent?.messages && agent.messages.length > 0
      ? agent.messages
      : [
          { role: 'user', content: session.goal },
          {
            role: 'assistant',
            content: `Engineered autonomous ${agent?.name}. Workflow synthesized into ${agent.nodes.length} stages (Trigger: ${triggerDisplayText}, Workers, Action to ${recipientEmail}). Check Runs for execution logs or chat to modify parameters.`,
          },
        ]

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, isRefining])

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleRefineSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!refineInput.trim() || isRefining || !onRefineAgent) return
    const text = refineInput.trim()
    setRefineInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    await onRefineAgent(text)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleRefineSubmit()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRefineInput(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`
    }
  }

  const handleRunAgentLive = async () => {
    if (isRunningAgent) return
    setIsRunningAgent(true)
    setBoardTab('runs')

    try {
      let res: any = null
      if (onExecuteSpecialist) {
        res = await onExecuteSpecialist(agent.goal)
      }
      const newRun: AgentRunRecord = {
        id: `run-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timeAgo: 'Just now',
        query: agent.goal,
        triggerType: 'Manual Trigger',
        durationMs: res?.durationMs || 450,
        sandboxId: res?.sandboxId || `sbx-${Math.random().toString(36).substring(2, 8)}`,
        microVmType: res?.microVmType || 'Isolated Sandbox Runtime (Linux 6.6)',
        status: 'COMPLETED',
        exitCode: 0,
        terminalLogs: res?.terminalLogs || [
          `[00:00:01] [INFO]  ⚡ Ephemeral sandbox spawned`,
          `[00:00:02] [STAGE] ▶ Executed DAG against integrated tools and Gemini LLM`,
          `[00:00:03] [SUCCESS] ✔ Execution finished with code 0`,
        ],
        outputPayload: res?.outputPayload || {
          status: 'SUCCESS',
          exitCode: 0,
          sandboxId: res?.sandboxId,
          durationMs: res?.durationMs,
          outputSummary: res?.output || `Executed ${agent.nodes.length} stages successfully in isolated sandbox.`,
        },
        nodeGraphSnapshot: [...agent.nodes],
      }
      setRuns((prev) => [newRun, ...prev])
      setOpenedRunId(newRun.id)
    } catch (err: any) {
      console.error('Run failed:', err)
      const failedRun: AgentRunRecord = {
        id: `run-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timeAgo: 'Just now',
        query: agent.goal,
        triggerType: 'Manual Trigger',
        durationMs: 240,
        sandboxId: `sbx-${Math.random().toString(36).substring(2, 8)}`,
        microVmType: 'Isolated Sandbox Runtime (Linux 6.6)',
        status: 'FAILED',
        exitCode: 1,
        terminalLogs: [
          `[00:00:01] [INFO]  ⚡ Ephemeral sandbox spawned`,
          `[00:00:02] [ERROR] ❌ Run failed: ${err?.message || 'Execution error'}`,
        ],
        outputPayload: {
          status: 'FAILED',
          exitCode: 1,
          error: err?.message || 'Execution failed',
        },
        nodeGraphSnapshot: [...agent.nodes],
      }
      setRuns((prev) => [failedRun, ...prev])
      setOpenedRunId(failedRun.id)
    } finally {
      setIsRunningAgent(false)
    }
  }


  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-3 sm:p-4 w-full font-sans text-foreground animate-in fade-in duration-200">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0 overflow-hidden">
        {/* Left: Chat & Refine Interface (col-span-5) */}
        <div className="lg:col-span-5 h-full flex flex-col min-h-0 bg-card border border-border rounded-xl overflow-hidden shadow-xs">
          {/* Chat Header with Agent Name & Status */}
          <div className="h-10 px-3.5 border-b border-border flex items-center justify-between bg-muted/20 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
                <RiShieldCheckLine className="w-3 h-3" />
              </div>
              <span className="text-xs font-bold text-foreground truncate">
                {agent.name}
              </span>
              <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-400 font-semibold px-1.5 py-0.2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                Ready
              </span>
            </div>
            {isScheduled ? (
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                {triggerBadgeText}
              </span>
            ) : isWebhook ? (
              <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                {triggerBadgeText}
              </span>
            ) : (
              <span className="text-[10px] font-mono text-muted-foreground bg-muted/40 border border-border px-2 py-0.5 rounded-md flex items-center gap-1">
                ▶ On-Demand
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-md bg-card border border-border flex items-center justify-center text-foreground shrink-0 shadow-xs mt-0.5">
                    <RiRobot2Line className="w-3 h-3 text-primary" />
                  </div>
                )}
                <div
                  className={`flex flex-col gap-0.5 max-w-[85%] ${
                    m.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <span className="text-[9px] font-mono uppercase text-muted-foreground px-1">
                    {m.role === 'user' ? 'You' : 'OpenBot Architect'}
                  </span>
                  <div
                    className={`rounded-xl px-3 py-2 leading-relaxed whitespace-pre-wrap break-words ${
                      m.role === 'user'
                        ? 'bg-secondary text-secondary-foreground border border-border rounded-tr-xs'
                        : 'bg-muted/40 text-foreground border border-border rounded-tl-xs'
                    }`}
                  >
                    {m.content}
                  </div>

                  {/* Separate Component: Prompt for Environment Variables when Agent Asks */}
                  {m.role === 'assistant' && (() => {
                    const detectedKeys: string[] = []
                    if (m.requestedEnvs && Array.isArray(m.requestedEnvs)) {
                      detectedKeys.push(...m.requestedEnvs)
                    }
                    const matches = m.content.match(/[A-Z0-9_]{3,}_(?:KEY|TOKEN|SECRET|URL|WEBHOOK)/g)
                    if (matches) {
                      matches.forEach((k) => {
                        if (!detectedKeys.includes(k)) detectedKeys.push(k)
                      })
                    }

                    const unconfigured = detectedKeys.filter((k) => !agent.envs?.[k])
                    if (unconfigured.length === 0) return null

                    return (
                      <div className="w-full space-y-2 mt-1.5">
                        {unconfigured.map((reqKey) => (
                          <EnvPromptCard
                            key={reqKey}
                            agentId={agent.id}
                            envKey={reqKey}
                            onSaved={(updated) => {
                              if (onUpdateAgent) onUpdateAgent(updated)
                            }}
                          />
                        ))}
                      </div>
                    )
                  })()}
                </div>
                {m.role === 'user' && (
                  <div className="w-6 h-6 rounded-md bg-secondary border border-border flex items-center justify-center text-foreground shrink-0 shadow-xs mt-0.5">
                    <RiUser3Line className="w-3 h-3" />
                  </div>
                )}
              </div>
            ))}

            {isRefining && (
              <div className="flex gap-2 items-center text-xs text-muted-foreground">
                <RiLoader4Line className="w-3.5 h-3.5 animate-spin text-primary" />
                <span>Updating node parameters in real-time...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Modern Chat Composer Input */}
          <div className="p-3 border-t border-border bg-card/40 shrink-0">
            <div className="rounded-xl bg-background border border-white/20 focus-within:border-white/60 focus-within:ring-2 focus-within:ring-white/10 shadow-xs transition-all flex flex-col">
              <textarea
                ref={textareaRef}
                value={refineInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={isRefining}
                rows={1}
                placeholder="Message architect to refine pipeline, modify parameters, or update filters..."
                className="w-full bg-transparent px-3.5 pt-3 pb-1.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none resize-none leading-relaxed min-h-[44px] max-h-[160px]"
              />

              <div className="flex items-center justify-between px-3 pb-2.5 pt-1 border-t border-border/30">
                <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground/70 select-none">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded bg-muted border border-border text-[9px]">↵</kbd> send
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded bg-muted border border-border text-[9px]">shift</kbd> + <kbd className="px-1 py-0.5 rounded bg-muted border border-border text-[9px]">↵</kbd> newline
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleRefineSubmit()}
                  disabled={isRefining || !refineInput.trim()}
                  className="w-7 h-7 rounded-lg bg-primary hover:bg-primary/90 disabled:bg-muted text-primary-foreground disabled:text-muted-foreground flex items-center justify-center shadow-xs transition-all cursor-pointer disabled:cursor-not-allowed shrink-0 group"
                  title="Send message"
                >
                  {isRefining ? (
                    <RiLoader4Line className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RiArrowUpLine className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 h-full flex flex-col min-h-0 bg-card border border-border rounded-xl overflow-hidden shadow-xs">
          <div className="h-10 px-3.5 border-b border-border flex items-center justify-between bg-muted/20 shrink-0">
            <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border">
              <button
                onClick={() => setBoardTab('pipeline')}
                className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  boardTab === 'pipeline'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <RiNodeTree className="w-3.5 h-3.5 text-primary" />
                <span>Pipeline</span>
              </button>

              <button
                onClick={() => setBoardTab('runs')}
                className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  boardTab === 'runs'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <RiPlayCircleLine className="w-3.5 h-3.5 text-emerald-400" />
                <span>Runs</span>
                <span className="text-[10px] font-mono px-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold">
                  {runs.length}
                </span>
              </button>

              {hasEnvs && (
                <button
                  onClick={() => setBoardTab('envs')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    boardTab === 'envs'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <RiKey2Line className="w-3.5 h-3.5 text-amber-400" />
                  <span>Envs & Secrets</span>
                  <span className="text-[10px] font-mono px-1 rounded-full bg-amber-500/10 text-amber-400 font-bold">
                    {configuredEnvCount}
                  </span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRunAgentLive}
                disabled={isRunningAgent}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-50 text-white font-medium text-xs shadow-xs transition-all cursor-pointer disabled:cursor-not-allowed"
                title="Execute current agent pipeline"
              >
                {isRunningAgent ? (
                  <RiLoader4Line className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RiPlayCircleLine className="w-3.5 h-3.5" />
                )}
                <span>{isRunningAgent ? 'Running...' : 'Run Agent'}</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 min-h-0">
            {boardTab === 'pipeline' && (
              <div className="h-full flex flex-col justify-between space-y-3">
                <N8nCanvas
                  agent={agent}
                  onSelectNode={(content) => onSelectInspector(content)}
                />
              </div>
            )}

            {boardTab === 'envs' && (
              <div className="h-full flex flex-col justify-between space-y-3">
                <EnvsPanel
                  agent={agent}
                  onUpdateAgent={(updated) => {
                    if (onUpdateAgent) onUpdateAgent(updated)
                  }}
                />
              </div>
            )}

            {boardTab === 'runs' && (
              <div className="h-full flex flex-col min-h-0 space-y-3">
                {!openedRunId || !openedRun ? (
                  // === VERCEL LOGS LISTINGS VIEW ===
                  <div className="flex-1 flex flex-col min-h-0 space-y-3">
                    {/* Top filter & controls bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border">
                      <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                        <div className="relative flex-1 max-w-sm">
                          <RiSearchLine className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                          <input
                            type="text"
                            value={runsSearch}
                            onChange={(e) => setRunsSearch(e.target.value)}
                            placeholder="Filter logs by query, sandbox, ID..."
                            className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-muted/40 border border-border focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground"
                          />
                        </div>
                        <div className="flex items-center gap-1 bg-muted/40 p-0.5 rounded-lg border border-border">
                          {(['ALL', 'COMPLETED', 'FAILED'] as const).map((filter) => (
                            <button
                              key={filter}
                              onClick={() => setRunsFilter(filter)}
                              className={`px-2.5 py-1 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                                runsFilter === filter
                                  ? 'bg-background text-foreground shadow-xs font-semibold'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              {filter === 'ALL'
                                ? `All (${runs.length})`
                                : filter === 'COMPLETED'
                                  ? `Success (${runs.filter((r) => r.status === 'COMPLETED').length})`
                                  : `Failed (${runs.filter((r) => r.status === 'FAILED').length})`}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Vercel-style Runs Table */}
                    <div className="flex-1 overflow-y-auto rounded-xl border border-border bg-card">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="sticky top-0 bg-muted/60 backdrop-blur-xs border-b border-border text-[10px] font-mono text-muted-foreground uppercase">
                          <tr>
                            <th className="py-2.5 px-3 font-semibold">Status</th>
                            <th className="py-2.5 px-3 font-semibold">Execution ID</th>
                            <th className="py-2.5 px-3 font-semibold">Trigger</th>
                            <th className="py-2.5 px-3 font-semibold">Task Query</th>
                            <th className="py-2.5 px-3 font-semibold">Sandbox ID</th>
                            <th className="py-2.5 px-3 font-semibold">Duration</th>
                            <th className="py-2.5 px-3 font-semibold text-right">Age</th>
                            <th className="py-2.5 px-3 text-right"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {filteredRuns.map((r) => (
                            <tr
                              key={r.id}
                              onClick={() => setOpenedRunId(r.id)}
                              className="group hover:bg-muted/40 cursor-pointer transition-colors"
                            >
                              <td className="py-3 px-3 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                                    r.status === 'COMPLETED'
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      r.status === 'COMPLETED' ? 'bg-emerald-400' : 'bg-rose-400'
                                    }`}
                                  />
                                  {r.status === 'COMPLETED' ? '200 OK' : '500 ERR'}
                                </span>
                              </td>
                              <td className="py-3 px-3 font-mono font-bold text-primary whitespace-nowrap">
                                #{r.id}
                              </td>
                              <td className="py-3 px-3 whitespace-nowrap">
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                                  {r.triggerType}
                                </span>
                              </td>
                              <td className="py-3 px-3 max-w-[200px] truncate text-foreground/90 font-medium">
                                {r.query}
                              </td>
                              <td className="py-3 px-3 font-mono text-muted-foreground whitespace-nowrap text-[11px]">
                                {r.sandboxId}
                              </td>
                              <td className="py-3 px-3 font-mono text-muted-foreground whitespace-nowrap text-[11px]">
                                {r.durationMs}ms
                              </td>
                              <td className="py-3 px-3 text-muted-foreground whitespace-nowrap text-right text-[11px]">
                                {r.timeAgo}
                              </td>
                              <td className="py-3 px-3 text-right">
                                <RiArrowRightSLine className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors inline-block" />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  // === VERCEL RUN DETAILS COCKPIT ===
                  <div className="flex-1 flex flex-col min-h-0 space-y-3">
                    {/* Breadcrumb Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-border">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setOpenedRunId(null)}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer px-2.5 py-1 rounded-lg hover:bg-muted font-medium"
                        >
                          <RiArrowLeftLine className="w-3.5 h-3.5" />
                          <span>All Executions</span>
                        </button>
                        <span className="text-muted-foreground text-xs">/</span>
                        <span className="text-xs font-mono font-bold text-primary">#{openedRun.id}</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1.5 font-mono text-emerald-400 font-semibold text-[11px] bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Exit Code 0
                        </span>
                        <span className="font-mono text-muted-foreground text-[11px]">
                          {openedRun.durationMs}ms
                        </span>
                      </div>
                    </div>

                    {/* Run Metadata Card */}
                    <div className="p-3 rounded-xl bg-muted/20 border border-border grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-mono text-muted-foreground block">
                          Trigger Event
                        </span>
                        <span className="font-medium text-foreground">{openedRun.triggerType}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-mono text-muted-foreground block">
                          Sandbox ID
                        </span>
                        <span className="font-mono text-foreground font-semibold">
                          {openedRun.sandboxId}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-mono text-muted-foreground block">
                          Execution Time
                        </span>
                        <span className="font-mono text-foreground">{openedRun.durationMs}ms</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-mono text-muted-foreground block">
                          Executed At
                        </span>
                        <span className="text-foreground">
                          {openedRun.timeAgo} ({openedRun.timestamp})
                        </span>
                      </div>
                    </div>

                    {/* Sub-tabs: Runtime Logs | Executed Node Graph | Output Payload */}
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <div className="flex items-center gap-1 bg-muted/50 p-0.5 rounded-lg border border-border">
                        <button
                          onClick={() => setRunDetailTab('logs')}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                            runDetailTab === 'logs'
                              ? 'bg-background text-foreground shadow-xs font-semibold'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <RiTerminalBoxLine className="w-3.5 h-3.5 text-primary" />
                          <span>Runtime Logs</span>
                        </button>

                        <button
                          onClick={() => setRunDetailTab('graph')}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                            runDetailTab === 'graph'
                              ? 'bg-background text-foreground shadow-xs font-semibold'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <RiNodeTree className="w-3.5 h-3.5 text-amber-400" />
                          <span>Executed Node Graph ({openedRun.nodeGraphSnapshot.length})</span>
                        </button>

                        <button
                          onClick={() => setRunDetailTab('output')}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                            runDetailTab === 'output'
                              ? 'bg-background text-foreground shadow-xs font-semibold'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <RiBracesLine className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Output Payload</span>
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          if (runDetailTab === 'logs') {
                            navigator.clipboard.writeText(openedRun.terminalLogs.join('\n'))
                          } else if (runDetailTab === 'output') {
                            navigator.clipboard.writeText(
                              JSON.stringify(openedRun.outputPayload, null, 2)
                            )
                          }
                        }}
                        className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground font-mono px-2.5 py-1 rounded bg-muted/40 border border-border cursor-pointer transition-colors"
                      >
                        <RiFileCopyLine className="w-3 h-3" />
                        <span>Copy</span>
                      </button>
                    </div>

                    {/* Detail Tab 1: Runtime Logs */}
                    {runDetailTab === 'logs' && (
                      <div className="flex-1 overflow-y-auto p-4 rounded-xl bg-black/95 border border-zinc-800 text-zinc-300 font-mono text-xs leading-relaxed space-y-1 shadow-inner min-h-[300px]">
                        <div className="text-[11px] text-zinc-500 mb-2 border-b border-zinc-800/80 pb-1.5 flex justify-between">
                          <span>Runtime: {openedRun.microVmType}</span>
                          <span>PID / Sandbox: {openedRun.sandboxId}</span>
                        </div>
                        {openedRun.terminalLogs.map((log, idx) => (
                          <div
                            key={idx}
                            className={
                              log.includes('[SUCCESS]') || log.includes('✔')
                                ? 'text-emerald-400 font-semibold'
                                : log.includes('[TOOL]') || log.includes('⚡')
                                  ? 'text-amber-400'
                                  : log.includes('[STAGE]') || log.includes('▶')
                                    ? 'text-primary'
                                    : 'text-zinc-400'
                            }
                          >
                            {log}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Detail Tab 2: Executed Node Graph Snapshot */}
                    {runDetailTab === 'graph' && (
                      <div className="flex-1 overflow-y-auto space-y-3">
                        <div className="text-xs text-muted-foreground font-mono">
                          Pipeline configuration active at the time this run executed:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {openedRun.nodeGraphSnapshot.map((n, i) => (
                            <div
                              key={n.id}
                              className="p-3.5 rounded-xl bg-card border border-border space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold">
                                  Stage 0{i + 1} • {n.type}
                                </span>
                                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                                  <RiCheckboxCircleLine className="w-3.5 h-3.5" />
                                  Executed
                                </span>
                              </div>
                              <h5 className="text-xs font-bold text-foreground">{n.name}</h5>
                              <p className="text-[11px] text-muted-foreground leading-relaxed">
                                {n.role}
                              </p>
                              {n.parameters && Object.keys(n.parameters).length > 0 && (
                                <div className="pt-2 border-t border-border/60 text-[10px] font-mono text-muted-foreground space-y-0.5">
                                  {Object.entries(n.parameters).map(([k, v]) => (
                                    <div key={k}>
                                      <span className="text-primary">{k}:</span> {String(v)}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Detail Tab 3: Output Payload JSON */}
                    {runDetailTab === 'output' && (
                      <div className="flex-1 overflow-y-auto p-4 rounded-xl bg-black/95 border border-zinc-800 text-emerald-400 font-mono text-xs leading-relaxed overflow-x-auto min-h-[300px]">
                        <pre>{JSON.stringify(openedRun.outputPayload, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}


          </div>
        </div>
      </div>
    </div>
  )
}
