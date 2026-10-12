import type { MessageItem, RSVPSubmission } from '../types/wedding'

export interface PreviewSession {
  rsvp: RSVPSubmission | null
  /** Messages submitted during this browser preview only. */
  messages: MessageItem[]
  hasSubmittedMessage: boolean
}

const STORAGE_PREFIX = 'wedding-invitation-preview:'

function emptySession(): PreviewSession {
  return { rsvp: null, messages: [], hasSubmittedMessage: false }
}

export function loadPreviewSession(token: string): PreviewSession {
  try {
    const raw = window.sessionStorage.getItem(`${STORAGE_PREFIX}${token}`)
    if (!raw) return emptySession()
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return emptySession()
    const value = parsed as Partial<PreviewSession>
    return {
      rsvp: value.rsvp ?? null,
      messages: Array.isArray(value.messages) ? value.messages : [],
      hasSubmittedMessage: value.hasSubmittedMessage === true,
    }
  } catch {
    // Private browsing policies can disable storage; preview still works in memory.
    return emptySession()
  }
}

export function savePreviewSession(token: string, session: PreviewSession): void {
  try {
    window.sessionStorage.setItem(`${STORAGE_PREFIX}${token}`, JSON.stringify(session))
  } catch {
    // Storage is best-effort; the current interaction remains usable in memory.
  }
}
