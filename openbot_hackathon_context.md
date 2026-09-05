# OpenBot Hackathon --- Project Context & Conversation Handoff

## 1. Hackathon

**Syndicate by Maximor**, September 5--6, 2026. Relevant track: **Track
1 --- Automated Agent Engineering**.

The track asks for a system that can **design, test, and improve
specialized agents for tasks it has never seen before**.

Given a goal, available tools, and a way to evaluate success, the system
should: 1. Generate an agent architecture. 2. Run the agent. 3. Analyze
where it fails. 4. Iteratively improve prompts, tools, memory, or
orchestration.

Strong submissions should demonstrate this across multiple distinct
domains and show measurable improvements in accuracy, reliability, cost,
and/or speed.

All participants must use **Agent Orchestrator (AO)** while building.
The submission should mention AO usage, and organizers may review the
demo for AO sessions.

## 2. Core project idea

Working names considered: **Agent Factory, Conversational Agent Factory,
AgentForge, OpenBot**. No final name is locked.

The product is an **autonomous agent engineer**.

User says what they want:

> "Build me an agent that researches competitors and creates an
> evidence-backed comparison report."

The system should: - understand the goal; - clarify requirements if
necessary; - determine success criteria; - generate an architecture; -
choose tools, skills, memory and orchestration; - generate evaluation
cases; - build and run the agent; - evaluate its output; - diagnose
failures; - modify the agent; - rerun it; - repeat until the target is
reached; - save the resulting specialist into an agent library.

The important point is that this is **not just an agent builder**. The
engineering loop must be real and autonomous.

## 3. High-level architecture

``` text
USER: “Build me an agent for X”
              |
              v
      +----------------+
      |  AGENT FACTORY |
      +----------------+
              |
      +--------+--------+
      |        |        |
 Goal      Architecture  Tool
 Analyzer   Generator   Selector
      |        |        |
      +--------+--------+
              |
              v
        AGENT SPEC / GEN
              |
              v
        GENERATED AGENT
              |
              v
          RUNNER
              |
              v
          EVALUATOR
              |
              v
       FAILURE ANALYZER
              |
              v
          OPTIMIZER
       /      |          prompt   tools   memory
       \ architecture /
              |
              v
        NEW AGENT VERSION
              |
              +-------> EVALUATOR
                           |
                       target reached?
                       /                               no            yes
                     |              |
                     +----loop      v
                             AGENT LIBRARY
```

## 4. The most important demo

The demo should visibly show an agent improving.

Example:

### Agent v0

Architecture: `Researcher -> Synthesizer`

Evaluation: - factual accuracy - source coverage - completeness -
citation correctness

First run:

``` text
Accuracy        61%
Source Quality  74%
Completeness    58%
Citations       67%
Overall         64%
```

Failure analyzer:

``` text
- Relied on single-source claims
- No source cross-validation
- Did not distinguish company claims from independent evidence

Changes:
+ Add verification tool
+ Add research skill
+ Add source-validation stage
+ Modify synthesis instructions
```

Generated v1:

``` text
Planner
  -> Researcher
  -> Verifier
  -> Synthesizer
```

Second run:

``` text
Accuracy        89%   +28
Source Quality  94%   +20
Completeness    91%   +33
Citations       96%   +29
Overall         92%   +28
```

This "before -\> diagnosis -\> modification -\> after" sequence should
be the money shot.

## 5. Multi-domain demonstration

Use the **same factory** to generate very different agents.

### Research

"Build an agent that researches a company and creates an evidence-backed
report."

Possible architecture:
`Planner -> Web Researcher -> Source Verifier -> Analyst -> Writer -> Fact Checker`

### Coding

"Build an agent that diagnoses a GitHub issue, implements a fix, and
verifies it."

Possible architecture:
`Issue Classifier -> Repository Analyst -> Code Investigator -> Implementer -> Test Runner -> Reviewer`

### Data / finance

"Build an agent that analyzes an expense CSV and identifies anomalies."

Possible architecture:
`Data Loader -> Cleaner -> Anomaly Detector -> Investigator -> Report Generator -> Verifier`

These should NOT be three hardcoded agents. The point is that the
factory generates the appropriate architecture for each new task.

## 6. Competitors discovered

We investigated whether this idea already exists. The answer is **yes,
in substantial parts**, so do not claim it is completely novel.

### n8n

This is an important competitor. n8n has natural-language AI workflow
building plus AI-agent evaluation features, including test datasets,
metrics, execution inspection, traces, human feedback and iteration.

Therefore:

> "AI turns a prompt into an agent/workflow and lets you test it"

is not enough differentiation.

Our intended distinction is that **autonomous agent engineering for a
new task is the primary abstraction**: the system determines the
architecture and can change
architecture/tools/prompts/memory/orchestration based on failures.

Do not claim n8n cannot perform any individual part of this.

### LangSmith

LangSmith is an Agent Engineering Platform with tracing, evaluation,
failure diagnosis and development/optimization workflows.

It overlaps heavily with the evaluation side.

### Google Gemini Enterprise Agent Platform

Google provides agent evaluation/optimization capabilities including
evaluation cases, execution, scoring, failure analysis and optimization
of instructions/prompts.

Very close to the engineering loop.

### AWS Bedrock AgentCore Optimization

AWS provides trace/evaluation-driven optimization and recommendations
for prompts/tool descriptions, with validation/A-B testing.

Again, close to the optimization side.

### NEO

NEO is especially close conceptually: it is positioned as an AI
engineering agent capable of building, testing, debugging and improving
AI systems from a task.

Therefore do not pitch the general concept as unprecedented.

### Eve

Eve is best considered a possible **agent runtime/infrastructure layer**
for our product.

## 7. Eve

Website:

https://eve.dev/

Eve provides useful primitives such as: - filesystem-oriented agent
definitions; - `instructions.md`; - tools; - skills; - sandbox; -
subagents; - human-in-the-loop; - persistent execution; - evaluations; -
channels.

Eve also has a Software Factory / Foreman template involving stages such
as classifier, analyst, implementer and reviewer.

Important distinction:

**Eve is not our hackathon product.**

Potential relationship:

``` text
OUR AGENT FACTORY
        |
        v
generated specialist
        |
        v
    EVE RUNTIME
        |
  +-----+-----+
 tools skills sandbox
        |
       evals
```

The interesting layer is our meta-engineering loop that decides how to
build and improve an agent for a new task.

Do not simply copy Eve's Software Factory.

## 8. Product positioning

Avoid: - "AI-powered agent builder" - "n8n but with AI" - "A platform
for creating custom agents"

Better:

> **An autonomous agent engineer: describe the job, and the system
> figures out what kind of agent is needed, builds it, tests it,
> diagnoses failures, changes it, and keeps iterating.**

Short pitch:

> **Describe the job. We engineer the agent.**

## 9. Suggested UI

Avoid making it look like a generic ChatGPT clone.

Possible structure:

``` text
+------------------------------------------------------------------+
| AGENTFORGE                                  + New Agent           |
+----------------+-----------------------------+-------------------+
| MY AGENTS      | Build your agent            | ENGINEERING       |
|                |                             |                   |
| Researcher     | You: “I need an agent...”  | Iteration 3       |
| GitHub Fixer   |                             |                   |
| Expense AI     | Agent Factory               | Score: 92%        |
|                |                             | Accuracy: 89%     |
|                | ✓ Goal understood           | Reliability: 94%  |
|                | ✓ Architecture generated    |                   |
|                | ✓ Agent executed            | [View Agent]      |
|                | ✓ Failures analyzed         | [Diff]            |
|                | ✓ Agent improved            |                   |
+----------------+-----------------------------+-------------------+
```

The engineering panel should show:

`Architecture -> Run -> Failure -> Diagnosis -> Improvement -> Run -> Pass`

## 10. Proposed technical stack

Initial idea:

``` text
Next.js + React
        |
        v
Agent Factory API
        |
        +-- Goal Analyzer
        +-- Architecture Generator
        +-- Tool Selector
        +-- Eval Generator
        +-- Agent Runner
        +-- Failure Analyzer
        +-- Agent Optimizer
                    |
                    v
                  Eve
                    |
             Tools / Skills / Sandbox
                    |
                    v
                  Evals
                    |
                    v
              Agent Library
```

This is not locked. Inspect the existing repo first.

## 11. GitHub repo

Repository:

https://github.com/Sahil-Gupta584/openbot

At the time of discussion the repo was empty.

GitHub integration reported: - public repo; - default branch `main`; -
pull/read access; - `push: false`.

Attempts to create `README.md` through the GitHub integration returned:

`403 Resource not accessible by integration`

The user changed the GitHub plugin UI permission to **Allow all**, but
the connector still reported `push: false`.

Conclusion: the ChatGPT plugin permission setting does not appear to
change the underlying GitHub OAuth/App repository write scope.

The user considered providing a PAT. We concluded that a PAT would not
fix the GitHub connector's scope. A normal authenticated `git push`
could theoretically work from a local environment, but the relevant
container environment could not reach GitHub.

Do not unnecessarily request or expose a PAT.

## 12. DevSpace

Local project path:

``` text
C:\s\openbot
```

The user has a DevSpace workspace.

User-provided workspace ID:

``` text
ws_dc1156eb1f
```

A fresh ChatGPT conversation successfully opened the project and
received a different active workspace ID:

``` text
ws_d8c300176e
```

The screenshot showed:

> Connected to `C:\s\openbot` via DevSpace.

It also showed 3 skills: - remotion-best-practices - tastemaker -
subagents

and several providers.

DevSpace exposes: - `open_workspace` - `read` - `write` - `edit` -
`bash`

Correct workflow:

``` text
open_workspace("C:\s\openbot")
       |
       v
receive current workspaceId
       |
       v
reuse that workspaceId for read/write/edit/bash
```

The old conversation's DevSpace execution became disabled/stale, while a
fresh conversation worked. Therefore, if coding in another chat, open
the workspace there and use the active workspace ID returned by
DevSpace.

## 13. User preferences / working style

The user strongly values: - factual correctness; - no exaggerated
novelty claims; - practical engineering; - ambitious hackathon ideas; -
concrete demos and measurable results; - direct comparison against
existing products.

The user repeatedly challenged whether the idea was really different
from existing products such as n8n. Preserve that skepticism.

## 14. Recommended implementation order

1.  Inspect the current `C:\s\openbot` repo.
2.  Decide the minimal architecture that convincingly satisfies Track 1.
3.  Implement the **engineering loop first**, not just the chat UI.
4.  Build a polished UI around the loop.
5.  Create 3+ distinct task demos.
6.  Show generated architectures changing between tasks.
7.  Add visible evaluation scores.
8.  Add failure diagnosis.
9.  Add version/diff visualization.
10. Make the optimizer genuinely change
    prompts/tools/memory/orchestration.
11. Use AO heavily during development.
12. Prepare a short demo showing:
    -   new task;
    -   generated architecture;
    -   first failed run;
    -   diagnosis;
    -   automatic improvement;
    -   improved score;
    -   second/third unseen task;
    -   saved final specialist.

## 15. Core thesis

The project should communicate:

> **You describe the job. The system engineers the agent.**

The system should not merely generate an agent.

It should:

> **determine how the agent should be built, prove where it fails,
> change it, and keep improving it.**
