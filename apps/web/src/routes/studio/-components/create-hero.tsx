import React, { useState } from 'react'
import {
  RiSearchLine,
  RiCodeLine,
  RiBarChartBoxLine,
  RiArrowRightLine,
  RiLoader4Line,
  RiSparklingLine,
} from 'react-icons/ri'

interface CreateHeroProps {
  onCreateChat: (prompt: string) => Promise<void>
  isCreating?: boolean
}

export const CreateHero: React.FC<CreateHeroProps> = ({
  onCreateChat,
  isCreating = false,
}) => {
  const [prompt, setPrompt] = useState('')

  const presets = [
    {
      id: 'research',
      title: 'Competitor Research',
      subtitle: 'Multi-source evidence & verified citations',
      icon: <RiSearchLine className="w-4 h-4 text-foreground" />,
      text: 'Research competing AI agent frameworks and create an evidence-backed comparison report with cross-verified citations.',
    },
    {
      id: 'coding',
      title: 'GitHub Issue Fixer',
      subtitle: 'Code analysis & verified sandbox tests',
      icon: <RiCodeLine className="w-4 h-4 text-foreground" />,
      text: 'Diagnose a GitHub issue deadlock, implement an atomic fix, and verify it with sandbox integration tests.',
    },
    {
      id: 'finance',
      title: 'Expense Anomaly Analyst',
      subtitle: 'Outlier detection & compliance verification',
      icon: <RiBarChartBoxLine className="w-4 h-4 text-foreground" />,
      text: 'Analyze corporate expense CSVs, isolate structured invoice splitting, and output audit-compliant findings.',
    },
  ]

  const handleSubmit = async (textToSend: string) => {
    if (!textToSend.trim() || isCreating) return
    await onCreateChat(textToSend.trim())
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full font-sans text-foreground animate-in fade-in duration-300">
      {/* Hero Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary mb-3">
          <RiSparklingLine className="w-3.5 h-3.5" />
          <span>Autonomous Agent Engineer</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
          What agent do you want to build?
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
          Describe your task. OpenBot will build an initial agent, test it
          against real challenges, fix its weaknesses, and deliver a ready
          specialist.
        </p>
      </div>

      {/* Main Input Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit(prompt)
        }}
        className="w-full relative mb-8"
      >
        <div className="relative rounded-2xl bg-card border border-border focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/30 shadow-xl transition-all">
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(prompt)
              }
            }}
            disabled={isCreating}
            placeholder="e.g. Research competing products, find their pricing and features, and produce a verified comparison report..."
            className="w-full bg-transparent p-4 text-sm text-foreground placeholder-muted-foreground focus:outline-none resize-none leading-relaxed"
          />

          <div className="flex items-center justify-between px-4 pb-3 pt-1">
            <span className="text-[11px] font-mono text-muted-foreground">
              Press ↵ Enter to build, Shift + ↵ for newline
            </span>

            <button
              type="submit"
              disabled={isCreating || !prompt.trim()}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-primary hover:bg-primary/90 disabled:bg-muted text-primary-foreground disabled:text-muted-foreground text-sm font-semibold shadow-md transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <>
                  <RiLoader4Line className="w-4 h-4 animate-spin" />
                  <span>Initializing...</span>
                </>
              ) : (
                <>
                  <span>Build Agent</span>
                  <RiArrowRightLine className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Benchmark Preset Cards */}
      <div className="w-full">
        <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground block text-center mb-3">
          Or start from an example:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSubmit(preset.text)}
              disabled={isCreating}
              className="flex flex-col items-start p-3.5 rounded-xl bg-card hover:bg-accent/40 border border-border hover:border-primary/40 transition-all text-left group cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="p-1.5 rounded-lg bg-muted border border-border group-hover:border-primary/40 transition-colors">
                  {preset.icon}
                </div>
                <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                  {preset.title}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                {preset.subtitle}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
