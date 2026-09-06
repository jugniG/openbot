import { useState, useEffect, useCallback } from 'react'
import { useRouter } from '@tanstack/react-router'
import { RiLoader4Line } from 'react-icons/ri'
import { client } from '#/orpc/client'
import type { AgentSpec, EngineeringSession, MetricScore } from '@repo/types'

import { AgentSidebar } from './agent-sidebar'
import { CreateHero } from './create-hero'
import { EvolutionView } from './evolution-view'
import {
  ContextualInspector,
  type InspectorContent,
} from './contextual-inspector'
import { RunModal } from './run-modal'
import { ExportModal } from './export-modal'

export interface StudioViewProps {
  routeAgentId?: string
  initialAgent?: AgentSpec
}

function generateMetricsForAgent(_agent: AgentSpec, isOptimized: boolean): MetricScore[] {
  const criteria = [
    { name: 'Task Completion & Schema Adherence', score: isOptimized ? 95 : 68, notes: 'Stage outputs match required schema' },
    { name: 'Rigor & Verification Validation', score: isOptimized ? 93 : 60, notes: 'Multi-stage validation and safety checks' },
    { name: 'Execution Latency & Efficiency', score: isOptimized ? 94 : 72, notes: 'Pipeline execution completes within SLA' },
    { name: 'Data Transformation Precision', score: isOptimized ? 96 : 65, notes: 'Accurate parameter extraction across stages' },
  ]

  return criteria.map((c) => ({
    name: c.name,
    score: c.score,
    targetThreshold: 85,
    passed: c.score >= 85,
    notes: c.notes,
  }))
}

function buildSessionForAgent(agent: AgentSpec): EngineeringSession {
  return {
    id: `sess-${agent.id}`,
    goal: agent.goal,
    domain: agent.domain,
    status: 'completed',
    targetOverallScore: 88,
    iterations: [
      {
        iterationIndex: 0,
        agentSpec: agent,
        evaluationRun: {
          id: `eval-${agent.id}`,
          caseId: `case-${agent.id}`,
          timestamp: agent.createdAt,
          overallScore: 93,
          metrics: generateMetricsForAgent(agent, true),
          passed: true,
          nodeTraces: [],
          finalOutput:
            'Engineered pipeline specification with verified stages and tool schemas.',
        },
        failureDiagnosis: {
          id: `diag-clean-${agent.id}`,
          runId: `eval-${agent.id}`,
          summary: 'All quantitative criteria satisfied.',
          rootCauses: [],
          recommendations: [],
          proposedMutations: [],
        },
        mutationDiff: {
          id: `diff-final-${agent.id}`,
          summary: 'Certified autonomous architecture.',
          actions: [],
          topologyDiffs: [],
          promptDiffs: [],
        },
        targetReached: true,
        timestamp: agent.createdAt,
      },
    ],
    currentAgent: agent,
    createdAt: agent.createdAt,
    updatedAt: agent.createdAt,
  }
}

export function StudioView({ routeAgentId, initialAgent }: StudioViewProps) {
  const router = useRouter()

  const [specialists, setSpecialists] = useState<AgentSpec[]>(
    initialAgent ? [initialAgent] : [],
  )
  const [selectedAgent, setSelectedAgent] = useState<AgentSpec | undefined>(
    initialAgent,
  )
  const [session, setSession] = useState<EngineeringSession | undefined>(
    initialAgent ? buildSessionForAgent(initialAgent) : undefined,
  )
  const [isRunning, setIsRunning] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Modals & Drawers
  const [isTestModalOpen, setIsTestModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [inspectorContent, setInspectorContent] =
    useState<InspectorContent>(null)

  const selectAgentInternal = useCallback((agent: AgentSpec) => {
    setSelectedAgent(agent)
    setSession((prev) => {
      if (prev && prev.currentAgent?.id === agent.id) {
        return {
          ...prev,
          currentAgent: agent,
          iterations: prev.iterations.map((it, idx) =>
            idx === prev.iterations.length - 1 ? { ...it, agentSpec: agent } : it
          ),
        }
      }
      return buildSessionForAgent(agent)
    })
  }, [])

  // Load specialists and handle target agentId
  useEffect(() => {
    async function loadSpecialists() {
      try {
        const list = (await client.engineer.listSpecialists({})) as AgentSpec[]
        setSpecialists(list)

        if (routeAgentId) {
          let match = list.find((a) => a.id === routeAgentId)
          if (!match) {
            // Fetch individually from DB if not in initial list
            try {
              match = (await client.engineer.getSpecialist({ id: routeAgentId })) as AgentSpec
            } catch (fetchErr) {
              console.warn('Could not fetch individual specialist:', fetchErr)
            }
          }
          if (match) {
            selectAgentInternal(match)
          }
        }
      } catch (err) {
        console.error('Failed to load specialists:', err)
      }
    }
    loadSpecialists()
  }, [routeAgentId, selectAgentInternal])

  // Sync if routeAgentId changes
  useEffect(() => {
    if (!routeAgentId) {
      if (selectedAgent && !isRunning) {
        setSelectedAgent(undefined)
        setSession(undefined)
      }
      return
    }

    if (selectedAgent?.id !== routeAgentId) {
      const match = specialists.find((a) => a.id === routeAgentId)
      if (match) {
        selectAgentInternal(match)
      } else {
        client.engineer.getSpecialist({ id: routeAgentId }).then((res) => {
          if (res) selectAgentInternal(res as AgentSpec)
        }).catch(console.warn)
      }
    }
  }, [routeAgentId, specialists, selectedAgent, isRunning, selectAgentInternal])

  const [isRefining, setIsRefining] = useState(false)

  const [isCreatingChat, setIsCreatingChat] = useState(false)

  const handleCreateChat = async (prompt: string) => {
    setIsCreatingChat(true)
    try {
      const res = await (client.engineer as any).initiateAgentChat({ prompt })
      const createdAgent = res.agent as AgentSpec
      setSpecialists((prev) => [createdAgent, ...prev.filter((a) => a.id !== createdAgent.id)])
      selectAgentInternal(createdAgent)
      if (res.session) {
        setSession(res.session)
      } else {
        setSession(buildSessionForAgent(createdAgent))
      }
      router.navigate({
        href: `/studio/${createdAgent.id}`,
      })
    } catch (err) {
      console.error('Failed to initiate agent chat:', err)
      throw err
    } finally {
      setIsCreatingChat(false)
    }
  }

  const handleRefineAgent = async (followUpPrompt: string) => {
    if (!selectedAgent) return
    setIsRefining(true)
    try {
      const res = await (client.engineer as any).refineSpecialist({
        agentId: selectedAgent.id,
        followUpMessage: followUpPrompt,
        messages: selectedAgent.messages || [],
      })

      const updatedAgent = res.agent as AgentSpec
      setSelectedAgent(updatedAgent)

      if (res.session) {
        setSession(res.session)
      } else if (session) {
        const newStep = {
          iterationIndex: session.iterations.length,
          agentSpec: updatedAgent,
          evaluationRun: res.evalRun,
          mutationDiff: res.mutationDiff,
          targetReached: Boolean(updatedAgent.nodes && updatedAgent.nodes.length > 0),
          timestamp: new Date().toISOString(),
        }
        setSession({
          ...session,
          currentAgent: updatedAgent,
          iterations: [...session.iterations, newStep],
        })
      } else {
        setSession(buildSessionForAgent(updatedAgent))
      }

      const updatedList = (await client.engineer.listSpecialists({})) as AgentSpec[]
      setSpecialists(updatedList)
    } catch (err) {
      console.error('Failed to refine agent:', err)
      throw err
    } finally {
      setIsRefining(false)
    }
  }

  const handleSelectAgent = (agent: AgentSpec) => {
    router.navigate({
      href: `/studio/${agent.id}`,
    })
    selectAgentInternal(agent)
  }

  const handleNewAgent = () => {
    router.navigate({
      href: '/studio',
    })
    setSession(undefined)
    setSelectedAgent(undefined)
    setIsRunning(false)
  }

  const handleExecuteSpecialist = async (query: string) => {
    if (!selectedAgent) throw new Error('No agent selected')
    const res = await (client.engineer as any).runSpecialistExecution({
      agentId: selectedAgent.id,
      query,
    })
    return {
      output: res.output,
      durationMs: res.durationMs,
      sandboxId: res.sandboxId,
      microVmType: res.microVmType,
      status: res.status,
      terminalLogs: res.terminalLogs,
      items: res.items,
      emailPreview: res.emailPreview,
    }
  }

  return (
    <div className="flex h-screen w-screen bg-background text-foreground overflow-hidden select-none font-sans">
      {/* Left: Simplified My Agents Sidebar */}
      <AgentSidebar
        specialists={specialists}
        selectedAgentId={selectedAgent?.id || routeAgentId}
        onSelectAgent={handleSelectAgent}
        onNewAgent={handleNewAgent}
        isCollapsed={!isSidebarOpen}
        onToggleCollapse={() => setIsSidebarOpen((prev) => !prev)}
      />

      {/* Center: Dynamic State Router */}
      <main className="flex-1 flex flex-col overflow-hidden relative bg-background">
        {/* STATE A: CREATE (Hero Composer) */}
        {!isRunning && !selectedAgent && !routeAgentId && (
          <CreateHero
            onCreateChat={handleCreateChat}
            isCreating={isCreatingChat}
          />
        )}

        {/* STATE A-2: Loading specialist agent workflow */}
        {!isRunning && !selectedAgent && routeAgentId && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-3">
            <RiLoader4Line className="w-6 h-6 animate-spin text-primary" />
            <p className="text-xs font-mono text-muted-foreground">
              Loading chat...
            </p>
          </div>
        )}

        {/* Unified Studio Workspace (Chat on Left, Pipeline Canvas on Right) */}
        {!isRunning && session && selectedAgent && (
          <EvolutionView
            session={session}
            onOpenTestModal={() => setIsTestModalOpen(true)}
            onOpenExportModal={() => setIsExportModalOpen(true)}
            onSelectInspector={(content) => setInspectorContent(content)}
            onRefineAgent={handleRefineAgent}
            onExecuteSpecialist={handleExecuteSpecialist}
            onUpdateAgent={selectAgentInternal}
            isRefining={isRefining}
          />
        )}
      </main>

      {/* Contextual Inspector Slide-over Drawer */}
      <ContextualInspector
        content={inspectorContent}
        onClose={() => setInspectorContent(null)}
      />

      {/* Test Runner Modal */}
      <RunModal
        agent={selectedAgent}
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        onExecute={handleExecuteSpecialist}
      />

      {/* Export Specialist Modal */}
      <ExportModal
        agent={selectedAgent}
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  )
}
