import React, { useState, useRef, useEffect } from 'react'
import type { AgentSpec, ChatMessage } from '@repo/types'
import {
  RiRobot2Line,
  RiUser3Line,
  RiLoader4Line,
  RiSendPlane2Fill,
  RiSparklingLine,
  RiErrorWarningLine,
} from 'react-icons/ri'

interface AgentChatViewProps {
  agent: AgentSpec
  onSendMessage: (message: string) => Promise<void>
  isSending?: boolean
}

export const AgentChatView: React.FC<AgentChatViewProps> = ({
  agent,
  onSendMessage,
  isSending = false,
}) => {
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Local messages state for instant optimistic updates
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>(() =>
    agent.messages && agent.messages.length > 0
      ? agent.messages
      : [
          {
            role: 'user',
            content: agent.goal,
            timestamp: agent.createdAt,
          },
        ]
  )

  // Sync local messages whenever agent messages update from server
  useEffect(() => {
    if (agent.messages && agent.messages.length > 0) {
      setLocalMessages(agent.messages)
      setError(null)
      setLastFailedMessage(null)
    }
  }, [agent.id, agent.messages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [localMessages.length, isSending, error])

  const handleSubmit = async (textToSend: string) => {
    if (!textToSend.trim() || isSending) return
    const text = textToSend.trim()
    setInput('')
    setError(null)
    setLastFailedMessage(null)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    // Optimistic UI: immediately render user's message
    const optimisticMsg: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    }
    setLocalMessages((prev) => [...prev, optimisticMsg])

    try {
      await onSendMessage(text)
    } catch (err: any) {
      console.error('Agent chat send error:', err)
      setError(err?.message || 'Server error while processing message. Please try again.')
      setLastFailedMessage(text)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(input)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-background font-sans text-foreground overflow-hidden">
      {/* Minimal Top Header */}
      <div className="h-12 border-b border-border/80 px-4 sm:px-6 flex items-center justify-between shrink-0 bg-card/30 backdrop-blur-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs shrink-0">
            <RiSparklingLine className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold text-foreground truncate max-w-md">
            {agent.name}
          </span>
        </div>
        <span className="text-[11px] font-mono text-muted-foreground">
          OpenBot Assistant
        </span>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {localMessages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-foreground shrink-0 shadow-xs mt-0.5">
                  <RiRobot2Line className="w-4 h-4 text-primary" />
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

          {/* Thinking indicator placed directly after optimistic user message */}
          {isSending && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-foreground shrink-0 shadow-xs mt-0.5">
                <RiRobot2Line className="w-4 h-4 text-primary animate-pulse" />
              </div>
              <div className="rounded-2xl rounded-tl-xs bg-card/60 text-muted-foreground border border-border px-4 py-3 text-xs leading-relaxed shadow-xs flex items-center gap-2">
                <RiLoader4Line className="w-3.5 h-3.5 animate-spin text-primary" />
                <span>OpenBot is thinking...</span>
              </div>
            </div>
          )}

          {/* User-facing error message with retry button */}
          {error && (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-destructive/10 border border-destructive/25 text-destructive text-xs shadow-xs">
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <RiErrorWarningLine className="w-4 h-4 shrink-0" />
                <span className="truncate">{error}</span>
              </div>
              {lastFailedMessage && (
                <button
                  type="button"
                  onClick={() => handleSubmit(lastFailedMessage)}
                  disabled={isSending}
                  className="px-2.5 py-1 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 font-medium text-xs transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                >
                  Retry
                </button>
              )}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Modern Composer Input (No box background around the container) */}
      <div className="p-4 pt-1 shrink-0">
        <div className="max-w-2xl mx-auto w-full">
          <div className="relative rounded-2xl bg-card border border-border focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/30 shadow-md transition-all">
            <textarea
              ref={textareaRef}
              rows={2}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={isSending}
              placeholder="Type your message..."
              className="w-full bg-transparent px-4 pt-3.5 pb-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none resize-none leading-relaxed"
            />

            <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
              <span className="text-[11px] font-mono text-muted-foreground">
                Press ↵ Enter to send, Shift + ↵ for newline
              </span>

              <button
                type="button"
                onClick={() => handleSubmit(input)}
                disabled={isSending || !input.trim()}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90 disabled:bg-muted text-primary-foreground disabled:text-muted-foreground text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <>
                    <RiLoader4Line className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending...</span>
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
        </div>
      </div>
    </div>
  )
}
