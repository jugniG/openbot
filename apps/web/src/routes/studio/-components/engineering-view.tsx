import React from "react";
import {
  RiLoader4Line,
  RiCheckLine,
  RiCompass3Line,
  RiNodeTree,
  RiBarChartLine,
  RiAlertLine,
  RiGitBranchLine,
} from "react-icons/ri";

interface EngineeringViewProps {
  currentStage: string;
  goal: string;
  statusChecks: {
    goalUnderstood: boolean;
    archGenerated: boolean;
    agentExecuted: boolean;
    failuresDiagnosed: boolean;
    agentImproved: boolean;
  };
}

export const EngineeringView: React.FC<EngineeringViewProps> = ({
  currentStage,
  goal,
  statusChecks,
}) => {
  const timelineStages = [
    {
      id: "understand",
      name: "Understand",
      description: "Extract domain constraints, required capabilities, and quantitative success criteria",
      icon: <RiCompass3Line className="w-4 h-4" />,
      isCompleted: statusChecks.goalUnderstood,
      isCurrent: statusChecks.goalUnderstood && !statusChecks.archGenerated,
    },
    {
      id: "design",
      name: "Design v0",
      description: "Synthesize baseline DAG topology, roles, and capability tool allocations",
      icon: <RiNodeTree className="w-4 h-4" />,
      isCompleted: statusChecks.archGenerated,
      isCurrent: statusChecks.archGenerated && !statusChecks.agentExecuted,
    },
    {
      id: "test",
      name: "Benchmark & Evaluate",
      description: "Execute baseline agent against multi-metric evaluation criteria",
      icon: <RiBarChartLine className="w-4 h-4" />,
      isCompleted: statusChecks.agentExecuted,
      isCurrent: statusChecks.agentExecuted && !statusChecks.failuresDiagnosed,
    },
    {
      id: "diagnose",
      name: "Diagnose Failures",
      description: "Isolate root causes (single-source vulnerabilities, missing verifiers)",
      icon: <RiAlertLine className="w-4 h-4" />,
      isCompleted: statusChecks.failuresDiagnosed,
      isCurrent: statusChecks.failuresDiagnosed && !statusChecks.agentImproved,
    },
    {
      id: "improve",
      name: "Improve & Mutate",
      description: "Mutate DAG topology (+Verifier stages), bind verification tools, and harden prompts",
      icon: <RiGitBranchLine className="w-4 h-4" />,
      isCompleted: statusChecks.agentImproved,
      isCurrent: statusChecks.agentImproved,
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full font-sans text-foreground animate-in fade-in duration-300">
      {/* Active Phase Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border text-xs font-mono text-foreground mb-4 shadow-xs">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
        </span>
        <span className="shimmer font-semibold">{currentStage}</span>
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-foreground text-center mb-2 tracking-tight">
        OpenBot is engineering your agent
      </h2>
      <p className="text-xs sm:text-sm text-muted-foreground text-center max-w-md mb-8 line-clamp-2">
        &ldquo;{goal}&rdquo;
      </p>

      {/* Vertical Timeline Card */}
      <div className="w-full bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
        {timelineStages.map((stage, idx) => {
          return (
            <div key={stage.id} className="flex items-start gap-3.5">
              {/* Status Circle */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border transition-all duration-300 ${
                  stage.isCompleted
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                    : stage.isCurrent
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-muted border-border text-muted-foreground"
                }`}
              >
                {stage.isCompleted ? (
                  <RiCheckLine className="w-4 h-4" />
                ) : stage.isCurrent ? (
                  <RiLoader4Line className="w-4 h-4 animate-spin" />
                ) : (
                  <span className="text-[11px] font-mono">{idx + 1}</span>
                )}
              </div>

              {/* Stage Info */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center justify-between">
                  <h3
                    className={`text-xs font-semibold ${
                      stage.isCompleted || stage.isCurrent ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {stage.name}
                  </h3>
                  {stage.isCompleted && (
                    <span className="text-[10px] font-mono text-emerald-400">
                      Completed
                    </span>
                  )}
                  {stage.isCurrent && (
                    <span className="text-[10px] font-mono text-primary font-medium">
                      In Progress...
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                  {stage.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
