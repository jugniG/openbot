import React from 'react'
import {
  RiFileTextLine,
  RiHammerLine,
  RiFlaskLine,
  RiMagicLine,
  RiCheckboxCircleLine,
  RiArrowRightSLine,
  RiCheckLine,
} from 'react-icons/ri'

export type FlowStep = 1 | 2 | 3 | 4 | 5

interface FlowStepperProps {
  currentStep: FlowStep
  className?: string
}

export const FLOW_STEPS = [
  { step: 1, name: 'Describe', icon: RiFileTextLine, desc: 'Requirements' },
  { step: 2, name: 'Build', icon: RiHammerLine, desc: 'Baseline' },
  { step: 3, name: 'Test', icon: RiFlaskLine, desc: 'Benchmark' },
  { step: 4, name: 'Improve', icon: RiMagicLine, desc: 'Fix & Harden' },
  { step: 5, name: 'Ready', icon: RiCheckboxCircleLine, desc: 'Production' },
] as const

export const FlowStepper: React.FC<FlowStepperProps> = ({
  currentStep,
  className = '',
}) => {
  return (
    <nav
      aria-label="Agent engineering progress"
      className={`flex items-center justify-center gap-1 sm:gap-2 ${className}`}
    >
      {FLOW_STEPS.map((s, idx) => {
        const isPast = s.step < currentStep
        const isCurrent = s.step === currentStep

        return (
          <React.Fragment key={s.step}>
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                isPast
                  ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                  : isCurrent
                    ? 'text-primary bg-primary/10 border border-primary/30 font-semibold shadow-xs'
                    : 'text-muted-foreground/60 bg-muted/20 border border-transparent'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                  isPast
                    ? 'bg-emerald-500 text-black font-bold'
                    : isCurrent
                      ? 'bg-primary text-primary-foreground font-bold'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {isPast ? (
                  <RiCheckLine className="w-2.5 h-2.5" />
                ) : (
                  <span>{s.step}</span>
                )}
              </div>
              <span className="hidden sm:inline">{s.name}</span>
            </div>

            {idx < FLOW_STEPS.length - 1 && (
              <RiArrowRightSLine
                className={`w-3.5 h-3.5 shrink-0 ${
                  s.step < currentStep
                    ? 'text-emerald-400/60'
                    : 'text-muted-foreground/30'
                }`}
              />
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
