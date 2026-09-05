import React from 'react'
import {
  RiLoader4Line,
  RiCheckLine,
  RiFileTextLine,
  RiHammerLine,
  RiFlaskLine,
  RiMagicLine,
  RiCheckboxCircleLine,
} from 'react-icons/ri'

interface EngineeringViewProps {
  currentStage: string
  goal: string
  statusChecks: {
    goalUnderstood: boolean
    archGenerated: boolean
    agentExecuted: boolean
    failuresDiagnosed: boolean
    agentImproved: boolean
  }
}

export const EngineeringView: React.FC<EngineeringViewProps> = ({
  currentStage,
  goal,
  statusChecks,
}) => {
  const steps = [
    {
      id: 'describe',
      name: '1. Describe',
      summary: 'Understand Requirements',
      detail: 'Extracted objectives, constraints, and success criteria',
      icon: RiFileTextLine,
      isCompleted: statusChecks.goalUnderstood,
      isCurrent: statusChecks.goalUnderstood && !statusChecks.archGenerated,
    },
    {
      id: 'build',
      name: '2. Build',
      summary: 'Build Baseline Agent',
      detail: 'Configured baseline reasoning stages and tool allocations',
      icon: RiHammerLine,
      isCompleted: statusChecks.archGenerated,
      isCurrent: statusChecks.archGenerated && !statusChecks.agentExecuted,
    },
    {
      id: 'test',
      name: '3. Test',
      summary: 'Benchmark Against Test Cases',
      detail: 'Tested accuracy, completeness, and edge-case handling',
      icon: RiFlaskLine,
      isCompleted: statusChecks.agentExecuted,
      isCurrent: statusChecks.agentExecuted && !statusChecks.failuresDiagnosed,
    },
    {
      id: 'improve',
      name: '4. Improve',
      summary: 'Fix Weaknesses & Harden',
      detail:
        'Identified failure points, added verification safeguards, and upgraded rules',
      icon: RiMagicLine,
      isCompleted: statusChecks.agentImproved,
      isCurrent:
        (statusChecks.failuresDiagnosed || statusChecks.agentExecuted) &&
        !statusChecks.agentImproved,
    },
    {
      id: 'ready',
      name: '5. Ready',
      summary: 'Verify & Finalize',
      detail: 'Ensured target threshold is exceeded for production deployment',
      icon: RiCheckboxCircleLine,
      isCompleted: statusChecks.agentImproved,
      isCurrent: statusChecks.agentImproved,
    },
  ]

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-xl mx-auto w-full font-sans text-foreground animate-in fade-in duration-300">
      {/* Current Activity Pill */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary mb-4 shadow-xs">
        <RiLoader4Line className="w-4 h-4 animate-spin text-primary" />
        <span className="font-semibold">{currentStage}</span>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-2 tracking-tight">
        Building your agent...
      </h2>
      <p className="text-xs sm:text-sm text-muted-foreground text-center max-w-md mb-8 line-clamp-2">
        &ldquo;{goal}&rdquo;
      </p>

      {/* Progress Cards */}
      <div className="w-full bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        {steps.map((step) => {
          const Icon = step.icon
          const isDone = step.isCompleted
          const isCurrent = step.isCurrent && !isDone

          return (
            <div
              key={step.id}
              className={`flex items-start gap-3.5 p-3 rounded-xl transition-all ${
                isCurrent
                  ? 'bg-accent/40 border border-primary/30'
                  : isDone
                    ? 'bg-muted/30 border border-transparent'
                    : 'opacity-50'
              }`}
            >
              {/* Step Status Icon */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                  isDone
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : isCurrent
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-muted border-border text-muted-foreground'
                }`}
              >
                {isDone ? (
                  <RiCheckLine className="w-4 h-4" />
                ) : isCurrent ? (
                  <RiLoader4Line className="w-4 h-4 animate-spin" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>

              {/* Step Info */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold ${
                      isDone || isCurrent
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {step.name}: {step.summary}
                  </span>
                  {isDone && (
                    <span className="text-[10px] font-mono text-emerald-400 font-medium">
                      ✓ Done
                    </span>
                  )}
                  {isCurrent && (
                    <span className="text-[10px] font-mono text-primary font-medium">
                      In progress...
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                  {step.detail}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
