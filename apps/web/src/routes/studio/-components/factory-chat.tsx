import React, { useState } from "react";
import {
  RiLoader4Line,
  RiSearchLine,
  RiCodeLine,
  RiBarChartBoxLine,
  RiCornerDownLeftLine,
  RiChatSmile2Line,
  RiRobot2Line,
  RiUser3Line,
} from "react-icons/ri";
import { client } from "#/orpc/client";
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
} from "#/components/ui/message-scroller";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageHeader,
  MessageFooter,
} from "#/components/ui/message";
import { Bubble, BubbleContent } from "#/components/ui/bubble";
import { Marker, MarkerIcon, MarkerContent } from "#/components/ui/marker";
import { Avatar } from "#/components/ui/avatar";

interface ChatBubble {
  role: "user" | "assistant";
  content: string;
  quickSuggestions?: string[];
}

interface FactoryChatProps {
  onRunGoal: (goal: string) => void;
  isRunning: boolean;
  currentStage: string;
  statusChecks: {
    goalUnderstood: boolean;
    archGenerated: boolean;
    agentExecuted: boolean;
    failuresDiagnosed: boolean;
    agentImproved: boolean;
  };
}

export const FactoryChat: React.FC<FactoryChatProps> = ({
  onRunGoal,
  isRunning,
  currentStage,
  statusChecks,
}) => {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<ChatBubble[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const demoPresets = [
    {
      id: "research",
      label: "Research & Fact-Check",
      icon: <RiSearchLine className="w-3 h-3 text-sky-400" />,
      text: "Build an agent that researches competing AI agent frameworks and creates an evidence-backed comparison report with cross-verified citations.",
    },
    {
      id: "coding",
      label: "GitHub Concurrency Fixer",
      icon: <RiCodeLine className="w-3 h-3 text-emerald-400" />,
      text: "Build an agent that diagnoses a GitHub issue deadlock, implements an atomic fix, and verifies it with sandbox integration tests.",
    },
    {
      id: "finance",
      label: "Expense Anomaly Sentinel",
      icon: <RiBarChartBoxLine className="w-3 h-3 text-amber-400" />,
      text: "Build an agent that analyzes corporate expense CSVs, isolates structured invoice splitting, and outputs audit-compliant findings.",
    },
  ];

  const handleSendPrompt = async (textToSend: string) => {
    if (!textToSend.trim() || isRunning || isAnalyzing) return;

    const userMsg: ChatBubble = { role: "user", content: textToSend.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setPrompt("");
    setIsAnalyzing(true);

    try {
      const res = await (client.engineer as any).clarifyOrAnalyzeGoal({
        messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
      });

      if (res.status === "needs_clarification") {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: res.question,
            quickSuggestions: res.quickSuggestions || [],
          },
        ]);
      } else if (res.status === "ready") {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Architectural specification complete for **${res.analysis.agentName}**. Initiating 5-stage autonomous loop...`,
          },
        ]);
        onRunGoal(res.analysis.refinedPrompt || textToSend);
      }
    } catch (err) {
      console.warn("Clarification fallback:", err);
      onRunGoal(textToSend);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendPrompt(prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSendPrompt(prompt);
    }
  };

  const steps = [
    { label: "Understand", active: statusChecks.goalUnderstood },
    { label: "Synthesize v0", active: statusChecks.archGenerated },
    { label: "Benchmark", active: statusChecks.agentExecuted },
    { label: "Diagnose", active: statusChecks.failuresDiagnosed },
    { label: "Optimize v1", active: statusChecks.agentImproved },
  ];

  return (
    <div className="flex flex-col bg-card border border-border rounded-xl p-4 shadow-xl text-foreground">
      {/* Top row: Label & Presets */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
        <span className="text-[11px] font-mono tracking-wider uppercase text-muted-foreground flex items-center gap-1.5">
          <RiChatSmile2Line className="w-3.5 h-3.5 text-primary" />
          Conversational Agent Architect
        </span>

        <div className="flex items-center gap-1.5">
          {demoPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSendPrompt(preset.text)}
              disabled={isRunning || isAnalyzing}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-secondary hover:bg-accent text-secondary-foreground hover:text-accent-foreground border border-border transition-all cursor-pointer disabled:opacity-50"
            >
              {preset.icon}
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* June 2026 Shadcn Chat Transcript (if any messages exist) */}
      {messages.length > 0 && (
        <div className="w-full mb-3">
          <MessageScrollerProvider>
            <MessageScroller className="w-full bg-background/50 border border-border/80 rounded-lg max-h-56 shadow-inner">
              <MessageScrollerViewport className="p-3">
                <MessageScrollerContent className="p-0 gap-2">
                  {messages.map((msg, i) => (
                    <MessageScrollerItem
                      key={i}
                      messageId={`factory-msg-${i}`}
                      scrollAnchor={msg.role === "user"}
                    >
                      <Message role={msg.role} align={msg.role === "user" ? "end" : "start"}>
                        <MessageAvatar>
                          <Avatar size="sm" className="border border-border/70">
                            <Avatar.Fallback
                              className={
                                msg.role === "user"
                                  ? "bg-primary/15 text-primary"
                                  : "bg-muted text-muted-foreground"
                              }
                            >
                              {msg.role === "user" ? (
                                <RiUser3Line className="size-3" />
                              ) : (
                                <RiRobot2Line className="size-3" />
                              )}
                            </Avatar.Fallback>
                          </Avatar>
                        </MessageAvatar>

                        <MessageContent align={msg.role === "user" ? "end" : "start"}>
                          <MessageHeader>
                            <span className="font-mono text-[10px] uppercase text-muted-foreground">
                              {msg.role === "user" ? "You" : "Lead Architect"}
                            </span>
                          </MessageHeader>

                          <Bubble
                            variant={msg.role === "user" ? "default" : "outline"}
                            align={msg.role === "user" ? "end" : "start"}
                            className="text-xs"
                          >
                            <BubbleContent>{msg.content}</BubbleContent>
                          </Bubble>

                          {msg.quickSuggestions && msg.quickSuggestions.length > 0 && !isRunning && (
                            <MessageFooter align={msg.role === "user" ? "end" : "start"}>
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {msg.quickSuggestions.map((sug, sIdx) => (
                                  <button
                                    key={sIdx}
                                    type="button"
                                    onClick={() => handleSendPrompt(sug)}
                                    className="text-[11px] px-2 py-0.5 rounded bg-secondary hover:bg-accent text-secondary-foreground hover:text-accent-foreground border border-border transition-all cursor-pointer"
                                  >
                                    + {sug}
                                  </button>
                                ))}
                              </div>
                            </MessageFooter>
                          )}
                        </MessageContent>
                      </Message>
                    </MessageScrollerItem>
                  ))}

                  {isAnalyzing && (
                    <MessageScrollerItem messageId="analyzing-status">
                      <div className="py-1">
                        <Marker variant="active">
                          <MarkerIcon>
                            <RiLoader4Line className="size-3.5 animate-spin text-primary" />
                          </MarkerIcon>
                          <MarkerContent className="shimmer text-foreground">
                            Architect is evaluating specifications...
                          </MarkerContent>
                        </Marker>
                      </div>
                    </MessageScrollerItem>
                  )}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          </MessageScrollerProvider>
        </div>
      )}

      {/* Input box */}
      <form onSubmit={handleSubmit} className="relative">
        <textarea
          rows={2}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isRunning || isAnalyzing}
          placeholder={
            messages.length > 0
              ? "Reply to architect or clarify requirements..."
              : "Describe the agent you want to build (e.g. 'Build an agent that monitors Solana DEX pools and alerts Telegram')..."
          }
          className="w-full bg-background border border-border focus:border-ring focus:ring-1 focus:ring-ring/20 rounded-lg p-3 text-xs text-foreground placeholder-muted-foreground focus:outline-none resize-none leading-relaxed transition-colors pr-24"
        />

        <div className="absolute right-2.5 bottom-3.5 flex items-center gap-2">
          <button
            type="submit"
            disabled={isRunning || isAnalyzing || !prompt.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary hover:bg-primary/90 disabled:bg-muted text-primary-foreground disabled:text-muted-foreground text-xs font-medium shadow-sm transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <RiLoader4Line className="w-3.5 h-3.5 animate-spin" />
                <span className="shimmer">Thinking...</span>
              </>
            ) : isRunning ? (
              <>
                <RiLoader4Line className="w-3.5 h-3.5 animate-spin" />
                <span>Engineering...</span>
              </>
            ) : (
              <>
                <span>{messages.length > 0 ? "Send" : "Architect"}</span>
                <RiCornerDownLeftLine className="w-3 h-3 opacity-70" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Progress timeline / Status bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-3.5 pt-3 border-t border-border">
        {/* Stepper nodes */}
        <div className="flex items-center gap-2 overflow-x-auto py-0.5">
          {steps.map((step, idx) => (
            <React.Fragment key={step.label}>
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <div
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    step.active
                      ? "bg-primary ring-4 ring-primary/20"
                      : isRunning && idx === steps.findIndex((s) => !s.active)
                      ? "bg-amber-400 animate-pulse"
                      : "bg-muted-foreground/30"
                  }`}
                />
                <span
                  className={`text-[11px] font-mono tracking-tight transition-colors ${
                    step.active
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`w-4 h-[1px] transition-colors ${
                    step.active ? "bg-primary/50" : "bg-border"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Current status pill */}
        <div className="flex items-center gap-2">
          {isRunning ? (
            <Marker variant="active">
              <MarkerIcon>
                <RiLoader4Line className="size-3 animate-spin text-primary" />
              </MarkerIcon>
              <MarkerContent className="shimmer">
                {currentStage.toUpperCase()}
              </MarkerContent>
            </Marker>
          ) : (
            <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
              <span>Ready for instruction</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
