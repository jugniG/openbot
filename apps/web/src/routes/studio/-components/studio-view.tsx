import { useState, useEffect, useCallback } from 'react'
import { useRouter } from '@tanstack/react-router'
import { RiLoader4Line } from 'react-icons/ri'
import { client } from '#/orpc/client'
import type { AgentSpec, EngineeringSession, ChatMessage, MetricScore } from '@repo/types'

import { AgentSidebar } from './agent-sidebar'
import { CreateHero } from './create-hero'
import { EngineeringView } from './engineering-view'
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

function generateMetricsForAgent(agent: AgentSpec, isOptimized: boolean): MetricScore[] {
  const d = agent.domain.toLowerCase()
  if (d === 'coding') {
    return [
      {
        name: 'Task 1: Concurrency Bug & Race Condition Isolation',
        score: isOptimized ? 95 : 62,
        targetThreshold: 85,
        passed: isOptimized,
        notes: isOptimized
          ? 'Pinpointed async mutex race condition via AST call-graph'
          : 'Failed: Missed thread safety hazard in concurrent event loop',
      },
      {
        name: 'Task 2: Atomic Minimal Patch Generation',
        score: isOptimized ? 94 : 70,
        targetThreshold: 85,
        passed: isOptimized,
        notes: isOptimized
          ? 'Generated clean thread-safe patch with lock guard'
          : 'Patch contained potential regression side-effects',
      },
      {
        name: 'Task 3: Automated Sandbox Regression Tests',
        score: isOptimized ? 93 : 58,
        targetThreshold: 85,
        passed: isOptimized,
        notes: isOptimized
          ? 'All sandbox test suites passed with 0 regressions'
          : 'Failed: Unverified patch broke edge-case test suite in sandbox',
      },
      {
        name: 'Task 4: Strict Type & Lint Compliance',
        score: isOptimized ? 96 : 74,
        targetThreshold: 85,
        passed: isOptimized,
        notes: isOptimized
          ? 'Zero type errors or debug statements remaining'
          : 'Minor lint and typing warnings unaddressed',
      },
    ]
  }

  if (d === 'finance') {
    return [
      {
        name: 'Task 1: Ingestion & Currency Normalization',
        score: isOptimized ? 96 : 82,
        targetThreshold: 85,
        passed: isOptimized,
        notes: isOptimized
          ? 'Accurately converted ISO currencies and cleaned timestamps'
          : 'Failed on multi-currency split transactions',
      },
      {
        name: 'Task 2: Outlier & Fraud Anomaly Isolation',
        score: isOptimized ? 94 : 59,
        targetThreshold: 85,
        passed: isOptimized,
        notes: isOptimized
          ? 'Flagged fraudulent spikes with zero false positives'
          : 'High false positive rate using naive static limits',
      },
      {
        name: 'Task 3: Policy Handbook Compliance Verification',
        score: isOptimized ? 92 : 60,
        targetThreshold: 85,
        passed: isOptimized,
        notes: isOptimized
          ? 'Verified line items against company procurement policies'
          : 'Failed to cross-check item categories with policy limits',
      },
      {
        name: 'Task 4: Audit-Ready Dossier Generation',
        score: isOptimized ? 95 : 63,
        targetThreshold: 85,
        passed: isOptimized,
        notes: isOptimized
          ? 'Produced audit-compliant findings with traceable citations'
          : 'Summary lacked source references and proof breakdown',
      },
    ]
  }

  // Default / Research / Web / Aggregation
  return [
    {
      name: 'Task 1: Core Entity & Target Data Extraction',
      score: isOptimized ? 96 : 80,
      targetThreshold: 85,
      passed: true,
      notes: isOptimized
        ? 'Extracted all target entities, links, and structured metadata'
        : 'Extracted initial listings but missed nested metadata attributes',
    },
    {
      name: 'Task 2: Source Verification & Anti-Hallucination',
      score: isOptimized ? 93 : 58,
      targetThreshold: 85,
      passed: isOptimized,
      notes: isOptimized
        ? 'Validated all links and claims against independent live sources'
        : 'Failed: Accepted unverified single-source claims and dead links',
    },
    {
      name: 'Task 3: Noise Filtration & Deduplication',
      score: isOptimized ? 92 : 55,
      targetThreshold: 85,
      passed: isOptimized,
      notes: isOptimized
        ? 'Purged duplicate entries and excluded spam/expired items'
        : 'Failed: Emitted duplicates and expired listings',
    },
    {
      name: 'Task 4: Output Schema & Constraint Adherence',
      score: isOptimized ? 95 : 71,
      targetThreshold: 85,
      passed: isOptimized,
      notes: isOptimized
        ? 'Strict adherence to required output format and schema constraints'
        : 'Failed: Output formatting was incomplete without required fields',
    },
  ]
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
        versionTag: 'v0',
        agentSpec: {
          ...agent,
          version: 0,
          versionTag: 'v0',
          nodes: agent.nodes.slice(0, Math.max(1, agent.nodes.length - 1)),
          edges: agent.edges.slice(0, Math.max(1, agent.edges.length - 1)),
        },
        evaluationRun: {
          id: `eval-v0-${agent.id}`,
          caseId: `case-${agent.id}`,
          agentVersion: 0,
          timestamp: agent.createdAt,
          overallScore: 66,
          metrics: generateMetricsForAgent(agent, false),
          passed: false,
          nodeTraces: [],
          finalOutput:
            'Baseline report generated without secondary verification',
        },
        failureDiagnosis: {
          id: `diag-${agent.id}`,
          runId: `eval-v0-${agent.id}`,
          agentVersion: 0,
          summary:
            'Missing dedicated verification pass prior to final report generation.',
          rootCauses: [
            {
              id: 'rc-1',
              title:
                'Single-source vulnerability without secondary verification',
              description:
                'Initial baseline lacked independent cross-verification, allowing unverified assertions.',
              severity: 'critical',
              affectedMetric: 'Accuracy',
              evidenceSnippet: 'Direct pass from ingest to synthesizer',
            },
          ],
          recommendations: ['Inject dedicated verification stage'],
          proposedMutations: ['+ Add Verifier node'],
        },
        mutationDiff: {
          id: `diff-${agent.id}`,
          fromVersion: 0,
          toVersion: agent.version || 1,
          summary:
            'Injected dedicated verifier stage and hardened prompt instructions.',
          actions: [],
          topologyDiffs: [
            {
              action: 'added_node',
              description: `Added ${agent.nodes[agent.nodes.length - 1]?.name || 'Verifier'} stage`,
            },
          ],
          promptDiffs: [],
        },
        targetReached: false,
        timestamp: agent.createdAt,
      },
      {
        iterationIndex: 1,
        versionTag: 'v1',
        agentSpec: agent,
        evaluationRun: {
          id: `eval-v1-${agent.id}`,
          caseId: `case-${agent.id}`,
          agentVersion: agent.version,
          timestamp: agent.createdAt,
          overallScore: 93,
          metrics: generateMetricsForAgent(agent, true),
          passed: true,
          nodeTraces: [],
          finalOutput:
            'Cross-verified report with citation links and strict schema',
        },
        failureDiagnosis: {
          id: `diag-clean-${agent.id}`,
          runId: `eval-v1-${agent.id}`,
          agentVersion: agent.version,
          summary: 'All quantitative criteria satisfied.',
          rootCauses: [],
          recommendations: [],
          proposedMutations: [],
        },
        mutationDiff: {
          id: `diff-final-${agent.id}`,
          fromVersion: 0,
          toVersion: agent.version || 1,
          summary: 'Final certified architecture.',
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
  const [currentStage, setCurrentStage] = useState('Idle')
  const [activeGoal, setActiveGoal] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Modals & Drawers
  const [isTestModalOpen, setIsTestModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [inspectorContent, setInspectorContent] =
    useState<InspectorContent>(null)

  const [statusChecks, setStatusChecks] = useState({
    goalUnderstood: false,
    archGenerated: false,
    agentExecuted: false,
    failuresDiagnosed: false,
    agentImproved: false,
  })

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
        setActiveGoal('')
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

  const handleRunGoal = async (goal: string, messages?: ChatMessage[]) => {
    setActiveGoal(goal)
    setIsRunning(true)
    setCurrentStage('Understanding requirements...')
    setStatusChecks({
      goalUnderstood: true,
      archGenerated: false,
      agentExecuted: false,
      failuresDiagnosed: false,
      agentImproved: false,
    })

    try {
      const result = await (client.engineer as any).startEngineeringSession({
        goal,
        messages,
      })
      const completedSession = result.session as EngineeringSession

      setTimeout(() => {
        setCurrentStage('Building initial agent pipeline...')
        setStatusChecks((prev) => ({ ...prev, archGenerated: true }))
        if (completedSession.iterations[0]) {
          setSelectedAgent(completedSession.iterations[0].agentSpec)
        }
      }, 700)

      setTimeout(() => {
        setCurrentStage('Testing agent against benchmark cases...')
        setStatusChecks((prev) => ({ ...prev, agentExecuted: true }))
      }, 1500)

      setTimeout(() => {
        setCurrentStage('Diagnosing failure points & weaknesses...')
        setStatusChecks((prev) => ({ ...prev, failuresDiagnosed: true }))
      }, 2300)

      setTimeout(() => {
        setCurrentStage('Adding verification safeguards & hardening rules...')
        setStatusChecks((prev) => ({ ...prev, agentImproved: true }))
        setSession(completedSession)
        if (completedSession.currentAgent) {
          setSelectedAgent(completedSession.currentAgent)
        }
      }, 3100)

      setTimeout(async () => {
        setCurrentStage('Agent verified & ready!')
        setIsRunning(false)
        const updated = (await client.engineer.listSpecialists({})) as AgentSpec[]
        setSpecialists(updated)
        if (completedSession.currentAgent) {
          router.navigate({
            href: `/studio/${completedSession.currentAgent.id}`,
          })
        }
      }, 3900)
    } catch (err) {
      console.error('Engineering session error:', err)
      setIsRunning(false)
      setCurrentStage('Failed')
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

      if (session) {
        const newStep = {
          iterationIndex: session.iterations.length,
          versionTag: updatedAgent.versionTag,
          agentSpec: updatedAgent,
          evaluationRun: res.evalRun,
          mutationDiff: res.mutationDiff,
          targetReached: true,
          timestamp: new Date().toISOString(),
        }
        setSession({
          ...session,
          currentAgent: updatedAgent,
          iterations: [...session.iterations, newStep],
        })
      }

      const updatedList = (await client.engineer.listSpecialists({})) as AgentSpec[]
      setSpecialists(updatedList)
    } catch (err) {
      console.error('Failed to refine agent:', err)
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
    setActiveGoal('')
    setIsRunning(false)
    setCurrentStage('Idle')
    setStatusChecks({
      goalUnderstood: false,
      archGenerated: false,
      agentExecuted: false,
      failuresDiagnosed: false,
      agentImproved: false,
    })
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
        {!isRunning && !session && !routeAgentId && (
          <CreateHero onRunGoal={handleRunGoal} isRunning={isRunning} />
        )}

        {/* STATE A-2: Loading specialist agent workflow */}
        {!isRunning && !session && routeAgentId && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-3">
            <RiLoader4Line className="w-6 h-6 animate-spin text-primary" />
            <p className="text-xs font-mono text-muted-foreground">
              Loading specialist agent workflow...
            </p>
          </div>
        )}

        {/* STATE B: ENGINEERING (Active Timeline Progress) */}
        {isRunning && (
          <EngineeringView
            currentStage={currentStage}
            goal={activeGoal}
            statusChecks={statusChecks}
          />
        )}

        {/* STATE C & D: EVOLUTION & FINAL READY STATE */}
        {!isRunning && session && (
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
