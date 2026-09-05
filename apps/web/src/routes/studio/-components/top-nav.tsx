import React from 'react'
import { Link } from '@tanstack/react-router'
import {
  RiCpuLine,
  RiAddLine,
  RiFoldersLine,
  RiArrowLeftLine,
} from 'react-icons/ri'
import { FlowStepper, type FlowStep } from './flow-stepper'

interface TopNavProps {
  specialistCount: number
  onNewAgent: () => void
  onToggleSidebar: () => void
  isSidebarOpen: boolean
  currentStep: FlowStep
}

export const TopNav: React.FC<TopNavProps> = ({
  specialistCount,
  onNewAgent,
  onToggleSidebar,
  isSidebarOpen,
  currentStep,
}) => {
  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-20 shrink-0 font-sans text-foreground">
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <RiCpuLine className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold tracking-tight text-foreground">
            OpenBot
          </span>
          <span className="text-xs text-muted-foreground hidden lg:inline-block">
            Autonomous Agent Engineer
          </span>
        </div>
      </div>

      {/* Central Flow Stepper: Describe -> Build -> Test -> Improve -> Ready */}
      <div className="flex items-center">
        <FlowStepper currentStep={currentStep} />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onToggleSidebar}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
            isSidebarOpen
              ? 'bg-secondary text-secondary-foreground border-border'
              : 'bg-background/80 border-border/60 text-muted-foreground hover:text-foreground hover:bg-accent'
          }`}
        >
          <RiFoldersLine className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="hidden sm:inline">My Agents</span>
          <span className="text-[10px] font-mono px-1 rounded bg-muted text-muted-foreground">
            {specialistCount}
          </span>
        </button>

        <button
          onClick={onNewAgent}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium shadow-sm transition-colors cursor-pointer"
        >
          <RiAddLine className="w-3.5 h-3.5" />
          <span>New</span>
        </button>

        <div className="h-4 w-px bg-border mx-1 hidden sm:block" />

        <Link
          to="/"
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title="Return to Home"
        >
          <RiArrowLeftLine className="w-4 h-4" />
        </Link>
      </div>
    </header>
  )
}
