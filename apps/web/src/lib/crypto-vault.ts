import crypto from 'node:crypto'
import { env } from '#/env'

function getDerivedKey(): Buffer {
  return crypto.createHash('sha256').update(env.BETTER_AUTH_SECRET).digest()
}

export function maskSecret(plain: string): string {
  if (!plain) return ''
  if (plain.length <= 8) return '••••••••'
  const prefix = plain.slice(0, 4)
  const suffix = plain.slice(-4)
  return `${prefix}••••${suffix}`
}

export function hashSecret(plain: string): string {
  return crypto.createHmac('sha256', env.BETTER_AUTH_SECRET).update(plain).digest('hex')
}

export function encryptSecret(plain: string): {
  encryptedValue: string
  hash: string
  maskedValue: string
} {
  const key = getDerivedKey()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()

  const encryptedValue = `enc:v1:${iv.toString('base64')}:${tag.toString('base64')}:${enc.toString('base64')}`
  const hash = hashSecret(plain)
  const maskedValue = maskSecret(plain)

  return { encryptedValue, hash, maskedValue }
}

export function decryptSecret(encryptedPayload: string): string {
  if (!encryptedPayload || !encryptedPayload.startsWith('enc:v1:')) {
    return encryptedPayload || ''
  }
  try {
    const parts = encryptedPayload.split(':')
    const iv = Buffer.from(parts[2], 'base64')
    const tag = Buffer.from(parts[3], 'base64')
    const data = Buffer.from(parts[4], 'base64')
    const key = getDerivedKey()

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(tag)
    return decipher.update(data, undefined, 'utf8') + decipher.final('utf8')
  } catch (err) {
    console.error('Failed to decrypt secret:', err)
    return ''
  }
}
