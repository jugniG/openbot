import React from 'react'
import type { MetricScore } from '@repo/types'
import { RiCheckLine, RiCloseLine } from 'react-icons/ri'

interface MetricRadarProps {
  metrics: MetricScore[]
  overallScore: number
  targetScore: number
  versionTag?: string
}

export const MetricRadar: React.FC<MetricRadarProps> = ({
  metrics,
  overallScore,
  targetScore,
}) => {
  const isPassed = overallScore >= targetScore

  return (
    <div className="flex flex-col space-y-4 font-sans">
      {/* Overall Score Header */}
      <div className="p-4 rounded-xl bg-card border border-border flex items-center justify-between shadow-xs">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            Overall Benchmark Evaluation
          </span>
          <div className="flex items-baseline gap-2.5 mt-1">
            <span
              className={`text-3xl font-bold font-mono ${
                isPassed ? 'text-foreground' : 'text-amber-400'
              }`}
            >
              {overallScore}%
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Target Threshold: {targetScore}%
            </span>
          </div>
        </div>

        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium border ${
            isPassed
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          }`}
        >
          {isPassed ? (
            <>
              <RiCheckLine className="w-3.5 h-3.5" />
              <span>Certified</span>
            </>
          ) : (
            <>
              <RiCloseLine className="w-3.5 h-3.5" />
              <span>Below Target</span>
            </>
          )}
        </div>
      </div>

      {/* Metrics List */}
      <div className="space-y-2.5">
        {metrics.map((m) => {
          return (
            <div
              key={m.name}
              className="p-3 rounded-lg bg-card border border-border text-xs"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-medium text-foreground">{m.name}</span>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  {m.delta !== undefined && m.delta > 0 && (
                    <span className="text-emerald-400 font-medium">
                      +{m.delta}%
                    </span>
                  )}
                  <span
                    className={
                      m.passed
                        ? 'text-foreground font-semibold'
                        : 'text-amber-400 font-semibold'
                    }
                  >
                    {m.score}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    m.passed ? 'bg-primary' : 'bg-amber-400'
                  }`}
                  style={{ width: `${Math.min(m.score, 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between mt-1 text-[10px] text-muted-foreground font-mono">
                <span>Threshold: {m.targetThreshold}%</span>
                <span>{m.passed ? 'Pass' : 'Fail'}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
