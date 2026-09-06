import React, { useState, useRef, useEffect } from 'react'
import type { AgentSpec, ChatMessage } from '@repo/types'
import {
  RiRobot2Line,
  RiUser3Line,
  RiLoader4Line,
  RiSendPlane2Fill,
  RiSparklingLine,
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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const messages: ChatMessage[] =
    agent.messages && agent.messages.length > 0
      ? agent.messages
      : [
          {
            role: 'user',
            content: agent.goal,
            timestamp: agent.createdAt,
          },
        ]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, isSending])

  const handleSubmit = async (textToSend: string) => {
    if (!textToSend.trim() || isSending) return
    const text = textToSend.trim()
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    await onSendMessage(text)
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
          {messages.map((msg, i) => (
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

                {/* Quick suggestions if assistant asked clarification */}
                {msg.role === 'assistant' &&
                  msg.quickSuggestions &&
                  msg.quickSuggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.quickSuggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => handleSubmit(sug)}
                          disabled={isSending}
                          className="text-xs px-3 py-1 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 font-medium transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {sug}
                        </button>
                      ))}
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

          {isSending && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-foreground shrink-0">
                <RiLoader4Line className="w-4 h-4 animate-spin text-primary" />
              </div>
              <div className="p-3 rounded-2xl rounded-tl-xs bg-card/60 border border-border text-xs text-muted-foreground flex items-center gap-2">
                <RiSparklingLine className="w-3.5 h-3.5 text-primary animate-pulse" />
                <span>OpenBot is thinking...</span>
              </div>
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
