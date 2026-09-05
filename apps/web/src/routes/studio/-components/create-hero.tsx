import React, { useState, useRef, useEffect } from "react";
import {
  RiSearchLine,
  RiCodeLine,
  RiBarChartBoxLine,
  RiArrowRightLine,
  RiLoader4Line,
  RiRobot2Line,
  RiUser3Line,
  RiRefreshLine,
  RiAlertLine,
  RiSparklingLine,
  RiSendPlane2Fill,
  RiInformationLine,
} from "react-icons/ri";
import { client } from "#/orpc/client";

interface CreateHeroProps {
  onRunGoal: (goal: string) => void;
  isRunning: boolean;
}

interface ChatBubble {
  role: "user" | "assistant";
  content: string;
  quickSuggestions?: string[];
}

export const CreateHero: React.FC<CreateHeroProps> = ({ onRunGoal, isRunning }) => {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<ChatBubble[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const presets = [
    {
      id: "research",
      title: "Research Agent",
      subtitle: "Multi-source evidence & fact checking",
      icon: <RiSearchLine className="w-4 h-4 text-foreground" />,
      text: "Research competing AI agent frameworks and create an evidence-backed comparison report with cross-verified citations.",
    },
    {
      id: "coding",
      title: "GitHub Issue Fixer",
      subtitle: "AST analysis & verified sandbox patching",
      icon: <RiCodeLine className="w-4 h-4 text-foreground" />,
      text: "Diagnose a GitHub issue deadlock, implement an atomic fix, and verify it with sandbox integration tests.",
    },
    {
      id: "finance",
      title: "Expense Anomaly Analyst",
      subtitle: "Outlier detection & compliance verification",
      icon: <RiBarChartBoxLine className="w-4 h-4 text-foreground" />,
      text: "Analyze corporate expense CSVs, isolate structured invoice splitting, and output audit-compliant findings.",
    },
  ];

  // Auto-scroll on new messages
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAnalyzing]);

  const handleSend = async (textToSend: string) => {
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
            content: `Architectural specification complete for ${res.analysis.agentName}. Initiating autonomous engineering loop...`,
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
    handleSend(prompt);
  };

  const handleResetChat = () => {
    setMessages([]);
    setPrompt("");
    setIsAnalyzing(false);
  };

  // ==========================================
  // STATE 1: ACTIVE CHAT VIEW (ChatGPT / Claude Style)
  // ==========================================
  if (messages.length > 0) {
    return (
      <div className="flex-1 flex flex-col h-full w-full bg-background font-sans text-foreground overflow-hidden">
        {/* Top Header Bar with Temporary Chat Hint */}
        <div className="h-12 border-b border-border/80 px-4 sm:px-6 flex items-center justify-between shrink-0 bg-card/40 backdrop-blur-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs">
              <RiRobot2Line className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-foreground">
              OpenBot Architect
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Active Session
            </span>
          </div>

          {/* Temporary Chat Notice & Reset Action */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md">
              <RiAlertLine className="w-3.5 h-3.5 shrink-0" />
              <span>Temporary chat — will reset if you navigate away</span>
            </div>

            <button
              onClick={handleResetChat}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent px-2.5 py-1 rounded-md transition-colors cursor-pointer border border-transparent hover:border-border"
              title="Reset conversation"
            >
              <RiRefreshLine className="w-3.5 h-3.5" />
              <span>New Chat</span>
            </button>
          </div>
        </div>

        {/* Temporary Notice for Mobile */}
        <div className="sm:hidden flex items-center gap-1.5 text-[10px] text-amber-400/90 bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5">
          <RiAlertLine className="w-3.5 h-3.5 shrink-0" />
          <span>Temporary chat — clears when you leave.</span>
        </div>

        {/* Message Stream (Full Height, Natural Chat Layout) */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {/* Assistant Avatar */}
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-foreground shrink-0 shadow-xs mt-0.5">
                    <RiRobot2Line className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`flex flex-col gap-2 ${
                    msg.role === "user" ? "items-end max-w-[85%]" : "items-start max-w-[85%]"
                  }`}
                >
                  {/* Sender Label */}
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-1">
                    {msg.role === "user" ? "You" : "OpenBot Architect"}
                  </span>

                  {/* Message Bubble / Body */}
                  {msg.role === "user" ? (
                    <div className="rounded-2xl rounded-tr-xs bg-secondary text-secondary-foreground border border-border px-4 py-2.5 text-sm leading-relaxed shadow-xs whitespace-pre-wrap break-words">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="rounded-2xl rounded-tl-xs bg-card text-foreground border border-border px-4 py-3 text-sm leading-relaxed shadow-xs whitespace-pre-wrap break-words">
                      {msg.content}

                      {/* Quick Suggestions Chips */}
                      {msg.quickSuggestions && msg.quickSuggestions.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border/60">
                          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block mb-2">
                            Suggested Options:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.quickSuggestions.map((sug, sIdx) => (
                              <button
                                key={sIdx}
                                type="button"
                                onClick={() => handleSend(sug)}
                                className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-accent text-secondary-foreground hover:text-foreground border border-border transition-all cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
                              >
                                + {sug}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-foreground shrink-0 shadow-xs mt-0.5">
                    <RiUser3Line className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Analyzing Indicator */}
            {isAnalyzing && (
              <div className="flex gap-3 justify-start items-center">
                <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-foreground shrink-0">
                  <RiLoader4Line className="w-4 h-4 animate-spin text-foreground" />
                </div>
                <div className="p-3.5 rounded-2xl rounded-tl-xs bg-card/60 border border-border text-xs text-muted-foreground flex items-center gap-2">
                  <RiSparklingLine className="w-3.5 h-3.5 text-foreground animate-pulse" />
                  <span className="shimmer">
                    Architect is evaluating requirements and topology constraints...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Bottom Fixed Composer (Claude / ChatGPT style) */}
        <div className="border-t border-border/60 bg-card/40 backdrop-blur-md p-4 shrink-0">
          <form
            onSubmit={handleSubmit}
            className="max-w-3xl mx-auto w-full relative"
          >
            <div className="relative rounded-2xl bg-card border border-border focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/30 shadow-md transition-all">
              <textarea
                ref={textareaRef}
                rows={2}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                    e.preventDefault();
                    handleSend(prompt);
                  }
                }}
                disabled={isRunning || isAnalyzing}
                placeholder="Clarify details, add constraints, or type a response..."
                className="w-full bg-transparent px-4 pt-3.5 pb-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none resize-none leading-relaxed"
              />

              <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
                <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1.5">
                  <RiInformationLine className="w-3.5 h-3.5 text-muted-foreground/80" />
                  <span>⌘ + Enter to send · Chat resets if you leave</span>
                </span>

                <button
                  type="submit"
                  disabled={isRunning || isAnalyzing || !prompt.trim()}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90 disabled:bg-muted text-primary-foreground disabled:text-muted-foreground text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <>
                      <RiLoader4Line className="w-3.5 h-3.5 animate-spin" />
                      <span>Analyzing...</span>
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
    );
  }

  // ==========================================
  // STATE 2: INITIAL HERO COMPOSER (When no messages yet)
  // ==========================================
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-3xl mx-auto w-full font-sans text-foreground animate-in fade-in duration-300">
      {/* Hero Header */}
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground text-center mb-3">
        Build an agent for the job.
      </h1>
      <p className="text-sm sm:text-base text-muted-foreground text-center max-w-lg mb-6 leading-relaxed">
        Describe what you need. OpenBot will design, test, diagnose, and autonomously improve the agent.
      </p>

      {/* Ephemeral Warning Hint */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80 bg-muted/40 border border-border/80 px-3 py-1 rounded-full mb-6">
        <RiInformationLine className="w-3.5 h-3.5 text-muted-foreground" />
        <span>Prompt sessions are temporary. Engineered agents are saved in My Agents.</span>
      </div>

      {/* Main Input Composer */}
      <form onSubmit={handleSubmit} className="w-full relative mb-8">
        <div className="relative rounded-2xl bg-card border border-border focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/30 shadow-xl transition-all">
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                handleSend(prompt);
              }
            }}
            disabled={isRunning || isAnalyzing}
            placeholder="I need an agent that researches competitors and creates an evidence-backed comparison report..."
            className="w-full bg-transparent p-4 text-sm text-foreground placeholder-muted-foreground focus:outline-none resize-none leading-relaxed"
          />

          <div className="flex items-center justify-between px-4 pb-3 pt-1">
            <span className="text-[11px] font-mono text-muted-foreground">
              Press ⌘ + Enter to start
            </span>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isRunning || isAnalyzing || !prompt.trim()}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-primary hover:bg-primary/90 disabled:bg-muted text-primary-foreground disabled:text-muted-foreground text-sm font-semibold shadow-md transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <RiLoader4Line className="w-4 h-4 animate-spin" />
                    <span className="shimmer">Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>Engineer Agent</span>
                    <RiArrowRightLine className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Benchmark Preset Cards */}
      <div className="w-full">
        <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground block text-center mb-3">
          Or test with an unseen benchmark task
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
  );
};
