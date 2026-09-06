import { os } from "@orpc/server";
import * as z from "zod";
import {
  LoopOrchestrator,
  analyzeGoalWithConversation,
  refineAgentWithFollowUp,
  executeInSolariSandbox,
} from "@repo/agent-engine";
import type {
  EngineeringSession,
  SessionEvent,
  AgentSpec,
  ChatMessage,
} from "@repo/types";
import { prisma } from "#/db";
import { env } from "#/env";

export const clarifyOrAnalyzeGoal = os
  .input(
    z.object({
      messages: z.array(
        z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
        })
      ),
    })
  )
  .handler(async ({ input }) => {
    return analyzeGoalWithConversation(input.messages);
  });

export const initiateAgentChat = os
  .input(
    z.object({
      prompt: z.string().min(1),
    })
  )
  .handler(async ({ input }) => {
    const agentId = `agent-${Date.now()}`;
    const userMsg: ChatMessage = {
      role: "user",
      content: input.prompt.trim(),
      timestamp: new Date().toISOString(),
    };

    // Analyze intent with LLM with graceful fallback
    let analysisRes;
    try {
      analysisRes = await analyzeGoalWithConversation([userMsg]);
    } catch (llmErr) {
      console.warn("LLM initial analyze error:", llmErr);
      analysisRes = {
        status: "needs_clarification" as const,
        question: "Hey! What kind of agent or automation are you looking to build today? Tell me what you have in mind.",
      };
    }

    let assistantMsg: ChatMessage;
    let agentSpec: AgentSpec;
    let session: EngineeringSession | undefined;

    if (analysisRes.status === "needs_clarification") {
      assistantMsg = {
        role: "assistant",
        content: analysisRes.question,
        timestamp: new Date().toISOString(),
      };

      agentSpec = {
        id: agentId,
        name: input.prompt.length > 40 ? `${input.prompt.slice(0, 40)}...` : input.prompt,
        domain: "general",
        goal: input.prompt.trim(),
        architectureSummary: "Interactive Requirements Interview",
        nodes: [],
        edges: [],
        availableTools: [],
        messages: [userMsg, assistantMsg],
        createdAt: new Date().toISOString(),
      };
    } else {
      // Requirements are already satisfied! Synthesize immediately
      try {
        const orchestrator = new LoopOrchestrator();
        session = await orchestrator.runEngineeringLoop(
          analysisRes.analysis.refinedPrompt || input.prompt,
          `sess-${agentId}`,
          [userMsg]
        );
        agentSpec = session.currentAgent || {
          id: agentId,
          name: analysisRes.analysis.agentName,
          domain: analysisRes.analysis.domain,
          goal: input.prompt.trim(),
          architectureSummary: "Synthesized Autonomous Pipeline",
          nodes: [],
          edges: [],
          availableTools: [],
          messages: [userMsg],
          createdAt: new Date().toISOString(),
        };
        const assistantReply: ChatMessage = {
          role: "assistant",
          content: `Engineered **${agentSpec.name}** with ${agentSpec.nodes.length} stages [${agentSpec.architectureSummary}]. Ready to configure credentials and test.`,
          timestamp: new Date().toISOString(),
          requestedEnvs: agentSpec.requiredEnvs,
        };
        agentSpec.messages = [userMsg, assistantReply];
      } catch (synthErr) {
        console.warn("Initial synthesis fallback:", synthErr);
        assistantMsg = {
          role: "assistant",
          content: "I understood your requirements, but encountered a temporary issue generating the complete pipeline. Let's refine the specifications together.",
          quickSuggestions: ["Specify data format", "Add API credentials", "Confirm notifications channel"],
          timestamp: new Date().toISOString(),
        };
        agentSpec = {
          id: agentId,
          name: analysisRes.analysis.agentName || (input.prompt.length > 40 ? `${input.prompt.slice(0, 40)}...` : input.prompt),
          domain: analysisRes.analysis.domain || "general",
          goal: input.prompt.trim(),
          architectureSummary: "Interactive Requirements Interview",
          nodes: [],
          edges: [],
          availableTools: [],
          messages: [userMsg, assistantMsg],
          createdAt: new Date().toISOString(),
        };
      }
    }

    // Persist immediately to Supabase PostgreSQL!
    try {
      await prisma.agent.create({
        data: {
          id: agentId,
          name: agentSpec.name,
          domain: agentSpec.domain,
          goal: agentSpec.goal,
          currentVersion: 1,
          architectureSummary: agentSpec.architectureSummary,
          spec: agentSpec as any,
        },
      });
    } catch (e) {
      console.warn("Prisma initiateAgentChat creation error:", e);
    }

    return {
      agent: agentSpec,
      isReady: agentSpec.nodes.length > 0,
      session,
    };
  });

// In-memory active sessions & event queues
const sessions = new Map<string, EngineeringSession>();
const sessionEvents = new Map<string, SessionEvent[]>();

export const startEngineeringSession = os
  .input(
    z.object({
      goal: z.string(),
      sessionId: z.string().optional(),
      messages: z
        .array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
            timestamp: z.string().optional(),
          })
        )
        .optional(),
    })
  )
  .handler(async ({ input }) => {
    const sessionId = input.sessionId || `sess-${Date.now()}`;
    const events: SessionEvent[] = [];
    sessionEvents.set(sessionId, events);

    const orchestrator = new LoopOrchestrator((event) => {
      events.push(event);
    });

    const session = await orchestrator.runEngineeringLoop(
      input.goal,
      sessionId,
      input.messages as any
    );
    sessions.set(sessionId, session);

    // Persist finalized agent to PostgreSQL
    if (session.currentAgent) {
      const finalStep = session.iterations[session.iterations.length - 1];
    if (finalStep?.targetReached && (prisma as any)?.agent?.upsert) {
      try {
        await (prisma as any).agent.upsert({
          where: { id: finalStep.agentSpec.id },
          create: {
            id: finalStep.agentSpec.id,
            name: finalStep.agentSpec.name,
            domain: finalStep.agentSpec.domain,
            goal: finalStep.agentSpec.goal,
            currentVersion: 1,
            architectureSummary: finalStep.agentSpec.architectureSummary || "Multi-stage pipeline",
            spec: finalStep.agentSpec as any,
          },
          update: {
            currentVersion: 1,
            architectureSummary: finalStep.agentSpec.architectureSummary || "Multi-stage pipeline",
            spec: finalStep.agentSpec as any,
          },
        });

        if ((prisma as any)?.agentSession?.create) {
          await (prisma as any).agentSession.create({
            data: {
              id: session.id,
              agentId: finalStep.agentSpec.id,
              goal: session.goal,
              domain: session.domain,
              iterations: session.iterations as any,
              targetScore: session.targetOverallScore || 85,
              status: session.status,
            },
          });
        }
      } catch (dbErr) {
        console.warn("Prisma session persistence fallback:", dbErr);
      }
    }
    }

    return {
      session,
      events,
    };
  });

export const getSession = os
  .input(z.object({ sessionId: z.string() }))
  .handler(({ input }) => {
    const session = sessions.get(input.sessionId);
    const events = sessionEvents.get(input.sessionId) || [];
    return { session, events };
  });

export const listSpecialists = os.input(z.object({})).handler(async () => {
  try {
    if (prisma.agent?.findMany) {
      const dbAgents = await prisma.agent.findMany({
        orderBy: { createdAt: "desc" },
      });
      return dbAgents.map((a) => a.spec as any as AgentSpec);
    }
  } catch (err) {
    console.warn("DB listSpecialists error:", err);
  }
  return [];
});

export const getSpecialist = os
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    try {
      if (prisma.agent?.findUnique) {
        const dbAgent = await prisma.agent.findUnique({
          where: { id: input.id },
        });
        if (dbAgent?.spec) {
          return dbAgent.spec as any as AgentSpec;
        }
      }
    } catch (err) {
      console.warn("DB getSpecialist error:", err);
    }
    return null;
  });

export const runSpecialistExecution = os
  .input(
    z.object({
      agentId: z.string(),
      query: z.string(),
    })
  )
  .handler(async ({ input }) => {
    const dbAgent = await prisma.agent.findUnique({
      where: { id: input.agentId },
    });

    if (!dbAgent?.spec) {
      throw new Error(`Specialist with ID ${input.agentId} not found.`);
    }

    const specialist = dbAgent.spec as any as AgentSpec;

    // Execute specialist dynamically inside Solari MicroVM Sandbox with tool integrations and Gemini reasoning
    const solariResult = await executeInSolariSandbox(specialist, input.query);

    // Live Email Dispatch via Resend
    if (solariResult.emailPreview?.recipient && solariResult.emailPreview?.html) {
      const recipientEmail = solariResult.emailPreview.recipient.trim();
      if (recipientEmail.includes("@") && !recipientEmail.includes("example.com")) {
        try {
          const { Resend } = await import("resend");
          const resend = new Resend(env.RESEND_API_KEY);
          const sendRes = await resend.emails.send({
            from: "OpenBot <onboarding@resend.dev>",
            to: recipientEmail,
            subject: solariResult.emailPreview.subject,
            html: solariResult.emailPreview.html,
          });
          if (sendRes.data?.id) {
            solariResult.terminalLogs.push(
              `[00:00:06] 🚀 Live email successfully dispatched to ${recipientEmail} via Resend (ID: ${sendRes.data.id})`
            );
          } else if (sendRes.error) {
            solariResult.terminalLogs.push(
              `[00:00:06] ⚠️ Resend dispatch warning: ${sendRes.error.message}`
            );
          }
        } catch (mailErr: any) {
          console.warn("Real email dispatch error:", mailErr);
          solariResult.terminalLogs.push(
            `[00:00:06] ⚠️ Email delivery notice: ${mailErr?.message || mailErr}`
          );
        }
      }
    }

    // Decrypt any stored secrets for live third-party dispatch
    try {
      const { decryptSecret } = await import('#/lib/crypto-vault');
      const decryptedEnvs: Record<string, string> = {};
      if (specialist.envs) {
        for (const [k, v] of Object.entries(specialist.envs)) {
          decryptedEnvs[k] = decryptSecret(v.encryptedValue);
        }
      }

      // Live Slack Webhook Dispatch
      const slackWebhook =
        decryptedEnvs['SLACK_WEBHOOK_URL'] ||
        (specialist.nodes.find((n) => n.parameters?.webhookUrl)?.parameters?.webhookUrl as string | undefined);
      if (slackWebhook && typeof slackWebhook === 'string' && slackWebhook.startsWith('http')) {
        try {
          const text =
            `*${specialist.name} Execution Digest*\n` +
            (solariResult.items?.map((it) => `• *${it.title}* (${it.rate}) - <${it.sourceUrl}|View>`).join('\n') ||
              solariResult.outputSummary);
          await fetch(slackWebhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
          });
          solariResult.terminalLogs.push(`[00:00:06] ⚡ Live Slack alert dispatched via configured SLACK_WEBHOOK_URL`);
        } catch (e: any) {
          solariResult.terminalLogs.push(`[00:00:06] ⚠️ Slack dispatch warning: ${e.message}`);
        }
      }

      // Live Discord Webhook Dispatch
      const discordWebhook = decryptedEnvs['DISCORD_WEBHOOK_URL'];
      if (discordWebhook && typeof discordWebhook === 'string' && discordWebhook.startsWith('http')) {
        try {
          const content =
            `**${specialist.name} Execution Digest**\n` +
            (solariResult.items?.map((it) => `• **${it.title}** (${it.rate}) - ${it.sourceUrl}`).join('\n') ||
              solariResult.outputSummary);
          await fetch(discordWebhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content }),
          });
          solariResult.terminalLogs.push(`[00:00:06] ⚡ Live Discord alert dispatched via configured DISCORD_WEBHOOK_URL`);
        } catch (e: any) {
          solariResult.terminalLogs.push(`[00:00:06] ⚠️ Discord dispatch warning: ${e.message}`);
        }
      }
    } catch (vaultErr) {
      console.warn('Crypto vault decryption notice:', vaultErr);
    }

    const runRecord = {
      id: `run-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      timeAgo: "Just now",
      query: input.query,
      triggerType: "Manual Trigger" as const,
      durationMs: solariResult.durationMs,
      sandboxId: solariResult.sandboxId,
      microVmType: solariResult.microVmType,
      status: solariResult.status,
      exitCode: (solariResult as any).exitCode ?? (solariResult.status === "COMPLETED" ? 0 : 1),
      terminalLogs: solariResult.terminalLogs,
      outputPayload: solariResult.outputPayload,
      nodeGraphSnapshot: specialist.nodes || [],
    };

    specialist.runs = [runRecord, ...(specialist.runs || [])];
    try {
      await prisma.agent.update({
        where: { id: specialist.id },
        data: {
          spec: specialist as any,
        },
      });
    } catch (saveRunErr) {
      console.warn("Save run record to DB error:", saveRunErr);
    }

    return {
      agentId: specialist.id,
      agentName: specialist.name,
      domain: specialist.domain,
      query: input.query,
      durationMs: solariResult.durationMs,
      sandboxId: solariResult.sandboxId,
      microVmType: solariResult.microVmType,
      status: solariResult.status,
      terminalLogs: solariResult.terminalLogs,
      outputPayload: solariResult.outputPayload,
      items: solariResult.items,
      emailPreview: solariResult.emailPreview,
      output: solariResult.outputSummary,
      runRecord,
    };
  });

export const refineSpecialist = os
  .input(
    z.object({
      agentId: z.string(),
      followUpMessage: z.string(),
      messages: z.array(
        z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
          timestamp: z.string().optional(),
          quickSuggestions: z.array(z.string()).optional(),
        }).passthrough()
      ).optional(),
    })
  )
  .handler(async ({ input }) => {
    const dbAgent = await prisma.agent.findUnique({ where: { id: input.agentId } });
    if (!dbAgent?.spec) {
      throw new Error(`Specialist with ID ${input.agentId} not found.`);
    }

    const currentAgent = dbAgent.spec as any as AgentSpec;
    const existingMessages: ChatMessage[] =
      currentAgent.messages && currentAgent.messages.length > 0
        ? currentAgent.messages
        : input.messages && input.messages.length > 0
        ? input.messages.map((m) => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp || new Date().toISOString(),
            quickSuggestions: m.quickSuggestions,
          }))
        : [
            {
              role: "user",
              content: currentAgent.goal,
              timestamp: currentAgent.createdAt || new Date().toISOString(),
            },
            {
              role: "assistant",
              content: `Engineered autonomous ${currentAgent.name}. Pipeline: ${currentAgent.architectureSummary}.`,
              timestamp: currentAgent.createdAt || new Date().toISOString(),
            },
          ];

    const updatedMessages: ChatMessage[] = [
      ...existingMessages,
      {
        role: "user",
        content: input.followUpMessage,
        timestamp: new Date().toISOString(),
      },
    ];

    // CRITICAL: Immediately persist the user message to database so it is NEVER lost on reload
    currentAgent.messages = updatedMessages;
    try {
      await prisma.agent.update({
        where: { id: currentAgent.id },
        data: {
          spec: {
            ...currentAgent,
            messages: updatedMessages,
          } as any,
        },
      });
    } catch (immediateSaveErr) {
      console.warn("Prisma immediate user message persist warning:", immediateSaveErr);
    }

    // Check if agent is currently in draft (interview / requirements gathering) mode
    if (!currentAgent.nodes || currentAgent.nodes.length === 0) {
      let analysisRes;
      try {
        analysisRes = await analyzeGoalWithConversation(updatedMessages);
      } catch (llmErr: any) {
        console.warn("analyzeGoalWithConversation failed, using fallback:", llmErr);
        const fallbackReply: ChatMessage = {
          role: "assistant",
          content: "I ran into a temporary hiccup analyzing that. Could you tell me a bit more about what you'd like your agent to do?",
          timestamp: new Date().toISOString(),
        };
        const fallbackAgent: AgentSpec = {
          ...currentAgent,
          messages: [...updatedMessages, fallbackReply],
        };
        try {
          await prisma.agent.update({
            where: { id: fallbackAgent.id },
            data: { spec: fallbackAgent as any },
          });
        } catch (dbErr) {
          console.warn("DB fallback update error:", dbErr);
        }
        return {
          agent: fallbackAgent,
          mutationDiff: { summary: "Analysis retry needed", addedNodes: [], removedNodes: [], modifiedNodes: [] },
          evalRun: null,
          assistantReply: fallbackReply,
        };
      }

      if (analysisRes.status === "needs_clarification") {
        const assistantReply: ChatMessage = {
          role: "assistant",
          content: analysisRes.question,
          timestamp: new Date().toISOString(),
        };

        const updatedAgent: AgentSpec = {
          ...currentAgent,
          messages: [...updatedMessages, assistantReply],
        };

        try {
          await prisma.agent.update({
            where: { id: updatedAgent.id },
            data: {
              spec: updatedAgent as any,
            },
          });
        } catch (dbErr) {
          console.warn("Prisma draft agent update error:", dbErr);
        }

        return {
          agent: updatedAgent,
          mutationDiff: {
            summary: "Clarified requirements",
            addedNodes: [],
            removedNodes: [],
            modifiedNodes: [],
          },
          evalRun: null,
          assistantReply,
        };
      } else {
        // Status is 'ready'! Requirements established; synthesize autonomous pipeline
        try {
          const orchestrator = new LoopOrchestrator();
          const refinedPrompt = analysisRes.analysis?.refinedPrompt || currentAgent.goal;
          const session = await orchestrator.runEngineeringLoop(
            refinedPrompt,
            `sess-${currentAgent.id}`,
            updatedMessages
          );

          let engineeredAgent = session.currentAgent;
          if (!engineeredAgent) {
            engineeredAgent = {
              ...currentAgent,
              name: analysisRes.analysis?.agentName || currentAgent.name,
              domain: analysisRes.analysis?.domain || currentAgent.domain,
              architectureSummary: "Synthesized Autonomous Pipeline",
              nodes: [],
              edges: [],
              availableTools: [],
              messages: updatedMessages,
            };
          }
          engineeredAgent.id = currentAgent.id;

          const assistantReply: ChatMessage = {
            role: "assistant",
            content: `Engineered **${engineeredAgent.name}** with ${engineeredAgent.nodes.length} stages [${engineeredAgent.architectureSummary}]. Ready to configure credentials and test.`,
            timestamp: new Date().toISOString(),
            requestedEnvs: engineeredAgent.requiredEnvs,
          };
          engineeredAgent.messages = [...updatedMessages, assistantReply];

          try {
            await prisma.agent.update({
              where: { id: engineeredAgent.id },
              data: {
                name: engineeredAgent.name,
                domain: engineeredAgent.domain,
                currentVersion: 1,
                architectureSummary: engineeredAgent.architectureSummary,
                spec: engineeredAgent as any,
              },
            });
          } catch (dbErr) {
            console.warn("Prisma agent synthesis update error:", dbErr);
          }

          const finalStep = session.iterations[session.iterations.length - 1];
          return {
            agent: engineeredAgent,
            mutationDiff: {
              summary: `Synthesized initial pipeline (${engineeredAgent.nodes.length} stages)`,
              addedNodes: engineeredAgent.nodes.map((n) => n.name),
              removedNodes: [],
              modifiedNodes: [],
            },
            evalRun: finalStep?.evaluationRun || null,
            assistantReply,
            session,
          };
        } catch (synthErr: any) {
          console.warn("Synthesis loop fallback:", synthErr);
          const assistantReply: ChatMessage = {
            role: "assistant",
            content: `I ran into an issue synthesizing the pipeline: ${synthErr.message || "Synthesis failed"}. You can refine your instructions or try again.`,
            timestamp: new Date().toISOString(),
          };
          const fallbackAgent: AgentSpec = {
            ...currentAgent,
            messages: [...updatedMessages, assistantReply],
          };
          try {
            await prisma.agent.update({
              where: { id: fallbackAgent.id },
              data: { spec: fallbackAgent as any },
            });
          } catch (dbErr) {
            console.warn("DB synthesis fallback update error:", dbErr);
          }
          return {
            agent: fallbackAgent,
            mutationDiff: { summary: "Synthesis retry needed", addedNodes: [], removedNodes: [], modifiedNodes: [] },
            evalRun: null,
            assistantReply,
          };
        }
      }
    }

    try {
      const { improvedAgent, mutationDiff } = await refineAgentWithFollowUp(
        currentAgent,
        input.followUpMessage,
        updatedMessages
      );

      const assistantReply: ChatMessage = {
        role: "assistant",
        content: `Updated architecture [${improvedAgent.architectureSummary}]: ${mutationDiff.summary}.`,
        timestamp: new Date().toISOString(),
        requestedEnvs: improvedAgent.requiredEnvs,
      };

      improvedAgent.messages = [...updatedMessages, assistantReply];

      // Persist to Supabase PostgreSQL
      try {
        await prisma.agent.update({
          where: { id: improvedAgent.id },
          data: {
            currentVersion: 1,
            architectureSummary: improvedAgent.architectureSummary,
            spec: improvedAgent as any,
          },
        });
      } catch (dbErr) {
        console.warn("Prisma agent update fallback:", dbErr);
      }

      return {
        agent: improvedAgent,
        mutationDiff,
        evalRun: null,
        assistantReply,
      };
    } catch (refineErr: any) {
      console.warn("refineAgentWithFollowUp error fallback:", refineErr);
      const assistantReply: ChatMessage = {
        role: "assistant",
        content: `I received your modification request, but encountered an issue updating the architecture: ${refineErr.message || "Refinement failed"}. Please try again.`,
        timestamp: new Date().toISOString(),
      };
      const fallbackAgent: AgentSpec = {
        ...currentAgent,
        messages: [...updatedMessages, assistantReply],
      };
      try {
        await prisma.agent.update({
          where: { id: fallbackAgent.id },
          data: { spec: fallbackAgent as any },
        });
      } catch (dbErr) {
        console.warn("DB refinement error update error:", dbErr);
      }
      return {
        agent: fallbackAgent,
        mutationDiff: { summary: "Refinement error fallback", addedNodes: [], removedNodes: [], modifiedNodes: [] },
        evalRun: null,
        assistantReply,
      };
    }
  });

export const saveAgentEnv = os
  .input(
    z.object({
      agentId: z.string(),
      key: z.string().min(1),
      secretValue: z.string().min(1),
      requiredBy: z.array(z.string()).optional(),
    })
  )
  .handler(async ({ input }) => {
    const { encryptSecret } = await import('#/lib/crypto-vault');
    const { encryptedValue, hash, maskedValue } = encryptSecret(input.secretValue);

    const dbAgent = await prisma.agent.findUnique({ where: { id: input.agentId } });
    if (!dbAgent?.spec) {
      throw new Error(`Specialist with ID ${input.agentId} not found.`);
    }
    const specialist = dbAgent.spec as any as AgentSpec;

    if (!specialist.envs) {
      specialist.envs = {};
    }

    specialist.envs[input.key] = {
      key: input.key,
      maskedValue,
      encryptedValue,
      hash,
      requiredBy: input.requiredBy || [],
      updatedAt: new Date().toISOString(),
    };

    try {
      await prisma.agent.update({
        where: { id: specialist.id },
        data: { spec: specialist as any },
      });
    } catch (e) {
      console.warn('DB saveAgentEnv error:', e);
    }

    return {
      success: true,
      key: input.key,
      maskedValue,
      updatedAt: specialist.envs[input.key].updatedAt,
      agent: specialist,
    };
  });

export const deleteAgentEnv = os
  .input(
    z.object({
      agentId: z.string(),
      key: z.string(),
    })
  )
  .handler(async ({ input }) => {
    const dbAgent = await prisma.agent.findUnique({ where: { id: input.agentId } });
    if (!dbAgent?.spec) {
      throw new Error(`Specialist with ID ${input.agentId} not found.`);
    }
    const specialist = dbAgent.spec as any as AgentSpec;

    if (specialist.envs && specialist.envs[input.key]) {
      delete specialist.envs[input.key];
      try {
        await prisma.agent.update({
          where: { id: specialist.id },
          data: { spec: specialist as any },
        });
      } catch (e) {
        console.warn('DB deleteAgentEnv error:', e);
      }
    }

    return {
      success: true,
      key: input.key,
      agent: specialist,
    };
  });


