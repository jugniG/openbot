import React, { useState, useRef, useEffect } from 'react'
import {
  RiSearchLine,
  RiCodeLine,
  RiBarChartBoxLine,
  RiArrowRightLine,
  RiLoader4Line,
  RiRobot2Line,
  RiUser3Line,
  RiRefreshLine,
  RiSparklingLine,
  RiSendPlane2Fill,
} from 'react-icons/ri'
import type { ChatMessage } from '@repo/types'
import { client } from '#/orpc/client'

interface CreateHeroProps {
  onRunGoal: (goal: string, messages?: ChatMessage[]) => void
  isRunning: boolean
}

export const CreateHero: React.FC<CreateHeroProps> = ({
  onRunGoal,
  isRunning,
}) => {
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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

  // Auto-scroll on new messages
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isAnalyzing])

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isRunning || isAnalyzing) return

    const userMsg: ChatMessage = {
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toISOString(),
    }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setPrompt('')
    setIsAnalyzing(true)

    try {
      const res = await (client.engineer as any).clarifyOrAnalyzeGoal({
        messages: newMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      })

      if (res.status === 'needs_clarification') {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: res.question,
            quickSuggestions: res.quickSuggestions || [],
            timestamp: new Date().toISOString(),
          },
        ])
      } else if (res.status === 'ready') {
        const assistantMsg: ChatMessage = {
          role: 'assistant',
          content: `Requirements clear for ${res.analysis.agentName}. Starting build & test process...`,
          timestamp: new Date().toISOString(),
        }
        const finalMessages = [...newMessages, assistantMsg]
        setMessages(finalMessages)
        onRunGoal(res.analysis.refinedPrompt || textToSend, finalMessages)
      }
    } catch (err) {
      console.warn('Clarification fallback:', err)
      onRunGoal(textToSend, newMessages)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSend(prompt)
  }

  const handleResetChat = () => {
    setMessages([])
    setPrompt('')
    setIsAnalyzing(false)
  }

  // ==========================================
  // STATE 1: ACTIVE CLARIFICATION VIEW
  // ==========================================
  if (messages.length > 0) {
    return (
      <div className="flex-1 flex flex-col h-full w-full bg-background font-sans text-foreground overflow-hidden">
        {/* Header */}
        <div className="h-12 border-b border-border/80 px-4 sm:px-6 flex items-center justify-between shrink-0 bg-card/40 backdrop-blur-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs">
              <RiRobot2Line className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-foreground">
              Clarifying Requirements
            </span>
          </div>

          <button
            onClick={handleResetChat}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent px-2.5 py-1 rounded-md transition-colors cursor-pointer border border-transparent hover:border-border"
            title="Start over"
          >
            <RiRefreshLine className="w-3.5 h-3.5" />
            <span>Start Over</span>
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          <div className="max-w-2xl mx-auto space-y-6">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-foreground shrink-0 shadow-xs mt-0.5">
                    <RiRobot2Line className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`flex flex-col gap-1.5 ${
                    msg.role === 'user'
                      ? 'items-end max-w-[85%]'
                      : 'items-start max-w-[85%]'
                  }`}
                >
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-1">
                    {msg.role === 'user' ? 'You' : 'OpenBot'}
                  </span>

                  {msg.role === 'user' ? (
                    <div className="rounded-2xl rounded-tr-xs bg-secondary text-secondary-foreground border border-border px-4 py-2.5 text-sm leading-relaxed shadow-xs whitespace-pre-wrap break-words">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="rounded-2xl rounded-tl-xs bg-card text-foreground border border-border px-4 py-3 text-sm leading-relaxed shadow-xs whitespace-pre-wrap break-words">
                      {msg.content}
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-foreground shrink-0 shadow-xs mt-0.5">
                    <RiUser3Line className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isAnalyzing && (
              <div className="flex gap-3 justify-start items-center">
                <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-foreground shrink-0">
                  <RiLoader4Line className="w-4 h-4 animate-spin text-foreground" />
                </div>
                <div className="p-3.5 rounded-2xl rounded-tl-xs bg-card/60 border border-border text-xs text-muted-foreground flex items-center gap-2">
                  <RiSparklingLine className="w-3.5 h-3.5 text-foreground animate-pulse" />
                  <span>Checking requirements...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Bottom Composer */}
        <div className="border-t border-border/60 bg-card/40 backdrop-blur-md p-4 shrink-0">
          <form
            onSubmit={handleSubmit}
            className="max-w-2xl mx-auto w-full relative"
          >
            <div className="relative rounded-2xl bg-card border border-border focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/30 shadow-md transition-all">
              <textarea
                ref={textareaRef}
                rows={2}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend(prompt)
                  }
                }}
                disabled={isRunning || isAnalyzing}
                placeholder="Clarify details or add further requirements..."
                className="w-full bg-transparent px-4 pt-3.5 pb-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none resize-none leading-relaxed"
              />

              <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
                <span className="text-[11px] font-mono text-muted-foreground">
                  Press ↵ Enter to send, Shift + ↵ for newline
                </span>

                <button
                  type="submit"
                  disabled={isRunning || isAnalyzing || !prompt.trim()}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90 disabled:bg-muted text-primary-foreground disabled:text-muted-foreground text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <>
                      <RiLoader4Line className="w-3.5 h-3.5 animate-spin" />
                      <span>Checking...</span>
                    </>
                  ) : (
                    <>
                      <span>Send</span>
                      <RiSendPlane2Fill className="w-3 h-3" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // ==========================================
  // STATE 2: INITIAL HERO COMPOSER
  // ==========================================
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
      <form onSubmit={handleSubmit} className="w-full relative mb-8">
        <div className="relative rounded-2xl bg-card border border-border focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/30 shadow-xl transition-all">
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend(prompt)
              }
            }}
            disabled={isRunning || isAnalyzing}
            placeholder="e.g. Research competing products, find their pricing and features, and produce a verified comparison report..."
            className="w-full bg-transparent p-4 text-sm text-foreground placeholder-muted-foreground focus:outline-none resize-none leading-relaxed"
          />

          <div className="flex items-center justify-between px-4 pb-3 pt-1">
            <span className="text-[11px] font-mono text-muted-foreground">
              Press ↵ Enter to build, Shift + ↵ for newline
            </span>

            <button
              type="submit"
              disabled={isRunning || isAnalyzing || !prompt.trim()}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-primary hover:bg-primary/90 disabled:bg-muted text-primary-foreground disabled:text-muted-foreground text-sm font-semibold shadow-md transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <RiLoader4Line className="w-4 h-4 animate-spin" />
                  <span>Analyzing...</span>
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
              onClick={() => handleSend(preset.text)}
              disabled={isRunning || isAnalyzing}
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
