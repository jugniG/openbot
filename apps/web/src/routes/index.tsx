import { createFileRoute, Link } from "@tanstack/react-router";
import { RiCpuLine, RiSparklingLine, RiArrowRightLine, RiSearchLine, RiCodeLine, RiBarChartBoxLine } from "react-icons/ri";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Navbar */}
      <nav className="h-16 border-b border-slate-800/80 px-6 flex items-center justify-between backdrop-blur-md bg-slate-950/80 sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 shadow-lg shadow-cyan-900/30">
            <RiCpuLine className="w-5 h-5 text-white" />
          </div>
          <span className="text-base font-black tracking-wider uppercase bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
            OpenBot
          </span>
          <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/60 ml-1">
            Track 1
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-xs text-slate-400 hover:text-white transition-colors font-medium"
          >
            Sign In
          </Link>
          <Link
            to="/studio"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-md shadow-cyan-900/40 transition-all cursor-pointer"
          >
            <span>Launch Studio</span>
            <RiArrowRightLine className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-20 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-mono mb-6 shadow-sm">
          <RiSparklingLine className="w-3.5 h-3.5 text-cyan-400" />
          <span>Autonomous Agent Engineering</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight max-w-3xl text-slate-100 leading-tight">
          Describe the job. <br />
          <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
            We engineer the agent.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
          OpenBot doesn't merely generate agents. It synthesizes architectures, executes evaluation benchmarks, diagnoses failure points, self-mutates (prompts, tools, and DAG topology), and proves measurable accuracy gains.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex items-center gap-4">
          <Link
            to="/studio"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm shadow-xl shadow-cyan-900/30 transition-all scale-100 hover:scale-105 cursor-pointer"
          >
            <RiCpuLine className="w-4 h-4" />
            <span>Open Autonomous Studio</span>
            <RiArrowRightLine className="w-4 h-4" />
          </Link>
        </div>

        {/* 3 Domain Features Cards */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-5 text-left w-full">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="p-2.5 rounded-lg bg-cyan-950/60 border border-cyan-800/60 w-fit text-cyan-400 mb-4">
              <RiSearchLine className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">Deep Research & Verification</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Detects single-source bias. Automatically injects evidence cross-checking nodes and transforms simple scrapers into multi-verifier analysts (61% → 92%).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 w-fit text-emerald-400 mb-4">
              <RiCodeLine className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">GitHub Issue & Patch Fixer</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Diagnoses concurrency deadlocks. Injects sandboxed test runners and AST boundary reviewers to eliminate regressions before merge.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="p-2.5 rounded-lg bg-amber-950/60 border border-amber-800/60 w-fit text-amber-400 mb-4">
              <RiBarChartBoxLine className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">Expense Anomaly Sentinel</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Eliminates false alarms in corporate ledger audits by mutating naive statistical thresholds into policy-aware compliance checks.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 font-mono">
        Built with Turborepo + TanStack Start for Syndicate by Maximor (Track 1)
      </footer>
    </div>
  );
}
