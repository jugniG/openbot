import React, { useState } from 'react'
import {
  RiKey2Line,
  RiLockPasswordLine,
  RiEyeLine,
  RiEyeOffLine,
  RiCheckLine,
  RiLoader4Line,
  RiShieldCheckLine,
} from 'react-icons/ri'
import { client } from '#/orpc/client'
import type { AgentSpec } from '@repo/types'

interface EnvPromptCardProps {
  agentId: string
  envKey: string
  requiredBy?: string
  onSaved?: (updatedAgent: AgentSpec) => void
}

export const EnvPromptCard: React.FC<EnvPromptCardProps> = ({
  agentId,
  envKey,
  requiredBy,
  onSaved,
}) => {
  const [value, setValue] = useState('')
  const [showPlain, setShowPlain] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!value.trim() || isSaving) return
    setIsSaving(true)
    setErrorMsg(null)

    try {
      const res = await (client.engineer as any).saveAgentEnv({
        agentId,
        key: envKey,
        secretValue: value.trim(),
        requiredBy: requiredBy ? [requiredBy] : [],
      })
      if (res.success) {
        setIsSaved(true)
        setValue('')
        if (onSaved && res.agent) {
          onSaved(res.agent)
        }
      }
    } catch (err: any) {
      console.error('Failed to save secret:', err)
      setErrorMsg(err.message || 'Failed to encrypt secret.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isSaved) {
    return (
      <div className="my-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-foreground flex items-center justify-between animate-in fade-in duration-200">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <RiCheckLine className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-mono font-bold text-emerald-400">{envKey}</span>
            <span className="text-muted-foreground ml-1.5 text-[11px]">
              securely encrypted and stored in agent vault.
            </span>
          </div>
        </div>
        <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          AES-256
        </span>
      </div>
    )
  }

  return (
    <div className="my-2.5 p-3.5 rounded-xl bg-card/80 border border-border shadow-xs text-xs text-foreground space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
            <RiKey2Line className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-mono font-bold text-foreground">{envKey}</span>
            <span className="text-[10px] font-mono text-amber-400 ml-2 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
              Required by Agent
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
          <RiShieldCheckLine className="w-3 h-3 text-primary" />
          <span>Hashed & Encrypted</span>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        {requiredBy
          ? `Stage "${requiredBy}" requires this credential to interact with third-party APIs.`
          : 'This integration requires an environment variable to execute live.'}
        {' '}Encrypted with your workspace Better-Auth secret.
      </p>

      <form onSubmit={handleSave} className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type={showPlain ? 'text' : 'password'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={isSaving}
            placeholder={`Enter ${envKey}...`}
            className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary pr-8 font-mono"
          />
          <button
            type="button"
            onClick={() => setShowPlain((prev) => !prev)}
            className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground cursor-pointer"
            title={showPlain ? 'Hide secret' : 'Show secret'}
          >
            {showPlain ? <RiEyeOffLine className="w-3.5 h-3.5" /> : <RiEyeLine className="w-3.5 h-3.5" />}
          </button>
        </div>

        <button
          type="submit"
          disabled={!value.trim() || isSaving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 text-primary-foreground text-xs font-medium transition-all cursor-pointer disabled:cursor-not-allowed shrink-0 shadow-xs"
        >
          {isSaving ? (
            <RiLoader4Line className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RiLockPasswordLine className="w-3.5 h-3.5" />
          )}
          <span>{isSaving ? 'Encrypting...' : 'Save & Encrypt'}</span>
        </button>
      </form>

      {errorMsg && (
        <p className="text-[11px] text-rose-400">{errorMsg}</p>
      )}
    </div>
  )
}
