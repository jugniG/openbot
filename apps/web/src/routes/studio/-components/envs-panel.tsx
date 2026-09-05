import React, { useState } from 'react'
import type { AgentSpec, AgentEnvVar } from '@repo/types'
import {
  RiKey2Line,
  RiLockPasswordLine,
  RiDeleteBin7Line,
  RiAddLine,
  RiShieldCheckLine,
  RiLoader4Line,
  RiAlertLine,
  RiEyeLine,
  RiEyeOffLine,
} from 'react-icons/ri'
import { client } from '#/orpc/client'

interface EnvsPanelProps {
  agent: AgentSpec
  onUpdateAgent?: (updated: AgentSpec) => void
}

export const EnvsPanel: React.FC<EnvsPanelProps> = ({ agent, onUpdateAgent }) => {
  const [isAdding, setIsAdding] = useState(false)
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [deletingKey, setDeletingKey] = useState<string | null>(null)
  const [showPlain, setShowPlain] = useState(false)

  // Find all required envs from nodes or tools
  const detectedRequiredEnvs: Array<{ key: string; requiredBy: string }> = []
  
  // From action nodes (e.g. slack webhook)
  agent.nodes.forEach((n) => {
    if (n.parameters?.channel === 'slack' || n.name.toLowerCase().includes('slack')) {
      detectedRequiredEnvs.push({ key: 'SLACK_WEBHOOK_URL', requiredBy: n.name })
    }
    if (n.parameters?.channel === 'discord' || n.name.toLowerCase().includes('discord')) {
      detectedRequiredEnvs.push({ key: 'DISCORD_WEBHOOK_URL', requiredBy: n.name })
    }
    if (n.parameters?.channel === 'sendgrid' || n.name.toLowerCase().includes('sendgrid')) {
      detectedRequiredEnvs.push({ key: 'SENDGRID_API_KEY', requiredBy: n.name })
    }
    if (n.assignedTools.includes('tool-github-api')) {
      detectedRequiredEnvs.push({ key: 'GITHUB_TOKEN', requiredBy: n.name })
    }
    if (n.assignedTools.includes('tool-twitter-x')) {
      detectedRequiredEnvs.push({ key: 'TWITTER_BEARER_TOKEN', requiredBy: n.name })
    }
    if (n.assignedTools.includes('tool-firecrawl')) {
      detectedRequiredEnvs.push({ key: 'FIRECRAWL_API_KEY', requiredBy: n.name })
    }
    if (n.assignedTools.includes('tool-webhook-dispatch')) {
      detectedRequiredEnvs.push({ key: 'WEBHOOK_URL', requiredBy: n.name })
    }
    if (Array.isArray(n.parameters?.requiredEnvs)) {
      n.parameters.requiredEnvs.forEach((k: string) => {
        detectedRequiredEnvs.push({ key: k, requiredBy: n.name })
      })
    }
  })

  // Deduplicate required keys
  const requiredMap = new Map<string, string[]>()
  detectedRequiredEnvs.forEach(({ key, requiredBy }) => {
    const prev = requiredMap.get(key) || []
    if (!prev.includes(requiredBy)) prev.push(requiredBy)
    requiredMap.set(key, prev)
  })

  const configuredEnvs: Record<string, AgentEnvVar> = agent.envs || {}
  const missingEnvs = Array.from(requiredMap.entries()).filter(
    ([key]) => !configuredEnvs[key]
  )

  const handleSaveEnv = async (keyToSave: string, valToSave: string, reqBy: string[] = []) => {
    if (!keyToSave.trim() || !valToSave.trim() || isSaving) return
    setIsSaving(true)

    try {
      const res = await (client.engineer as any).saveAgentEnv({
        agentId: agent.id,
        key: keyToSave.trim().toUpperCase(),
        secretValue: valToSave.trim(),
        requiredBy: reqBy,
      })
      if (res.success && res.agent && onUpdateAgent) {
        onUpdateAgent(res.agent)
      }
      setIsAdding(false)
      setNewKey('')
      setNewValue('')
    } catch (err) {
      console.error('Failed to save env:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteEnv = async (key: string) => {
    if (deletingKey) return
    setDeletingKey(key)
    try {
      const res = await (client.engineer as any).deleteAgentEnv({
        agentId: agent.id,
        key,
      })
      if (res.success && res.agent && onUpdateAgent) {
        onUpdateAgent(res.agent)
      }
    } catch (err) {
      console.error('Failed to delete env:', err)
    } finally {
      setDeletingKey(null)
    }
  }

  return (
    <div className="flex flex-col h-full bg-card border border-border rounded-2xl overflow-hidden shadow-sm font-sans text-foreground">
      {/* Top Bar Header */}
      <div className="h-12 px-4 sm:px-5 border-b border-border/80 flex items-center justify-between bg-muted/20 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-md bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
            <RiKey2Line className="w-3 h-3" />
          </div>
          <span className="text-xs font-semibold text-foreground">
            Environment Variables & Secrets Vault
          </span>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
            <RiShieldCheckLine className="w-3 h-3" />
            Better-Auth Encrypted (AES-256)
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding((prev) => !prev)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium transition-all shadow-xs cursor-pointer"
        >
          <RiAddLine className="w-3.5 h-3.5" />
          <span>Add Secret</span>
        </button>
      </div>

      <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
        {/* Info Banner */}
        <p className="text-xs text-muted-foreground leading-relaxed">
          Variables and API keys are reversibly encrypted with your workspace secret. When this agent executes inside the isolated sandbox runtime, these keys are securely injected into its environment for authenticating with third-party tools.
        </p>

        {/* Missing Required Envs Callout */}
        {missingEnvs.length > 0 && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-semibold">
              <RiAlertLine className="w-4 h-4 shrink-0" />
              <span>Missing Required Credentials ({missingEnvs.length})</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Connected stages in your pipeline require the following keys to execute third-party operations:
            </p>

            <div className="space-y-2">
              {missingEnvs.map(([key, reqBy]) => (
                <div
                  key={key}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-background/80 border border-border"
                >
                  <div>
                    <span className="font-mono font-bold text-xs text-foreground">{key}</span>
                    <span className="text-[10px] font-mono text-muted-foreground ml-2">
                      Required by: {reqBy.join(', ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      placeholder={`Paste ${key}...`}
                      id={`input-missing-${key}`}
                      className="bg-card border border-border rounded px-2.5 py-1 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary font-mono w-44"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById(`input-missing-${key}`) as HTMLInputElement
                        if (el && el.value.trim()) {
                          handleSaveEnv(key, el.value.trim(), reqBy)
                        }
                      }}
                      className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold cursor-pointer shrink-0"
                    >
                      Save Key
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New Secret Form */}
        {isAdding && (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSaveEnv(newKey, newValue)
            }}
            className="p-4 rounded-xl bg-muted/30 border border-border/80 space-y-3 animate-in fade-in duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Add New Environment Variable</span>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono uppercase text-muted-foreground mb-1">
                  Key Name (e.g. SLACK_WEBHOOK_URL)
                </label>
                <input
                  type="text"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="KEY_NAME"
                  className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground font-mono uppercase focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-muted-foreground mb-1">
                  Secret Value
                </label>
                <div className="relative">
                  <input
                    type={showPlain ? 'text' : 'password'}
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="Enter secret..."
                    className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground font-mono focus:outline-none focus:border-primary pr-8"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPlain((prev) => !prev)}
                    className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showPlain ? <RiEyeOffLine className="w-3.5 h-3.5" /> : <RiEyeLine className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!newKey.trim() || !newValue.trim() || isSaving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <RiLoader4Line className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RiLockPasswordLine className="w-3.5 h-3.5" />
                )}
                <span>Encrypt & Store Secret</span>
              </button>
            </div>
          </form>
        )}

        {/* Configured Keys Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between pb-1 text-[11px] font-mono uppercase text-muted-foreground">
            <span>Configured Key</span>
            <span>Encrypted Value</span>
          </div>

          {Object.keys(configuredEnvs).length === 0 ? (
            <div className="p-6 rounded-xl border border-dashed border-border flex flex-col items-center justify-center text-center space-y-2">
              <RiKey2Line className="w-6 h-6 text-muted-foreground/50" />
              <p className="text-xs text-muted-foreground">
                No environment variables configured yet for this agent.
              </p>
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="text-xs text-primary hover:underline cursor-pointer"
              >
                + Add your first secret
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {Object.entries(configuredEnvs).map(([key, envVar]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 rounded-xl bg-card border border-border hover:border-border/80 transition-colors shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-muted/60 border border-border flex items-center justify-center text-foreground shrink-0">
                      <RiKey2Line className="w-3 h-3 text-amber-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-foreground">{key}</span>
                        <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded">
                          Active
                        </span>
                      </div>
                      {envVar.requiredBy && envVar.requiredBy.length > 0 && (
                        <span className="text-[10px] text-muted-foreground font-mono">
                          Used in: {envVar.requiredBy.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-muted-foreground bg-muted/40 px-2.5 py-1 rounded border border-border">
                      {envVar.maskedValue || '••••••••••••'}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleDeleteEnv(key)}
                      disabled={deletingKey === key}
                      className="p-1.5 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                      title="Delete secret"
                    >
                      {deletingKey === key ? (
                        <RiLoader4Line className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <RiDeleteBin7Line className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
