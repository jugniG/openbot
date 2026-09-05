import React from 'react'
import type { FailureDiagnosis } from '@repo/types'
import { RiAlertLine, RiArrowRightLine } from 'react-icons/ri'

interface FailureCardProps {
  diagnosis?: FailureDiagnosis
}

export const FailureCard: React.FC<FailureCardProps> = ({ diagnosis }) => {
  if (!diagnosis || diagnosis.rootCauses.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-muted-foreground bg-card rounded-lg border border-border">
        No active failure diagnosis for this iteration.
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-3.5 font-sans">
      {/* Summary note */}
      <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-foreground/90 leading-relaxed">
        <div className="flex items-center gap-1.5 font-medium text-amber-400 mb-1 font-mono text-[11px]">
          <RiAlertLine className="w-3.5 h-3.5" />
          <span>
            Evaluation Failure Analysis (Initial Baseline)
          </span>
        </div>
        <p className="text-muted-foreground text-xs leading-relaxed">
          {diagnosis.summary}
        </p>
      </div>

      {/* Root Causes List */}
      <div className="space-y-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
          Root Causes Identified ({diagnosis.rootCauses.length})
        </span>

        {diagnosis.rootCauses.map((rc) => (
          <div
            key={rc.id}
            className="p-3 rounded-lg bg-card border border-border text-xs space-y-1.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-foreground">{rc.title}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-amber-400 border border-amber-500/20">
                {rc.affectedMetric}
              </span>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {rc.description}
            </p>

            {rc.evidenceSnippet && (
              <div className="mt-2 p-2 rounded bg-muted/40 border border-border text-[10px] font-mono text-muted-foreground">
                "{rc.evidenceSnippet}"
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Prescribed Mutations */}
      {diagnosis.proposedMutations.length > 0 && (
        <div className="space-y-2 pt-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            Prescribed Loop Mutations
          </span>
          <div className="space-y-1.5">
            {diagnosis.proposedMutations.map((mut, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-muted/40 border border-border text-xs text-foreground flex items-start gap-2"
              >
                <RiArrowRightLine className="w-3.5 h-3.5 text-foreground shrink-0 mt-0.5" />
                <span className="leading-snug">{mut}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
