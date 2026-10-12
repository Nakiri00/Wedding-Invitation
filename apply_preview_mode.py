#!/usr/bin/env python3
"""Apply the client preview-mode implementation to Wedding-Invitation.

Run from the repository root with: python apply_preview_mode.py
The script fails safely if expected source snippets don't match the checked-out branch.
"""
from pathlib import Path
import sys

ROOT = Path.cwd()


def read(rel: str) -> str:
    path = ROOT / rel
    if not path.is_file():
        raise RuntimeError(f"File not found: {rel}. Run this script from the repository root.")
    return path.read_text(encoding="utf-8")


def write(rel: str, content: str) -> None:
    with (ROOT / rel).open("w", encoding="utf-8", newline="\n") as handle:
        handle.write(content)


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"Cannot safely apply '{label}': expected 1 match, found {count}.")
    return text.replace(old, new, 1)


def add_new_file(rel: str, content: str) -> None:
    path = ROOT / rel
    if path.exists():
        existing = path.read_text(encoding="utf-8")
        if existing == content:
            return
        raise RuntimeError(f"Refusing to overwrite existing file: {rel}")
    path.parent.mkdir(parents=True, exist_ok=True)
    write(rel, content)


def main() -> None:
    # Validate all expected source snippets before making any file changes.
    app = read("src/App.tsx")
    admin = read("src/pages/AdminPage.tsx")
    gate = read("src/components/InvitationGate.tsx")
    rsvp = read("src/components/RSVPSection.tsx")
    messages = read("src/components/MessageSection.tsx")
    api = read("src/services/api.ts")
    backend_app = read("backend/src/app.ts")
    readme = read("README.md")

    # --- Preview session storage ---
    preview_session = '''import type { MessageItem, RSVPSubmission } from '../types/wedding'

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
'''

    # --- Frontend API: read-only QR image generation endpoint ---
    api = replace_once(
        api,
        "  getMessages: (token: string) => request<import('../types/wedding').MessageItem[]>(`/invitations/${encodeURIComponent(token)}/messages`),\n",
        "  getMessages: (token: string) => request<import('../types/wedding').MessageItem[]>(`/invitations/${encodeURIComponent(token)}/messages`),\n  createPreviewQr: (payload: string) => request<{ qrDataUrl: string }>(`/preview/qr?payload=${encodeURIComponent(payload)}`),\n",
        "frontend preview QR API",
    )

    # --- App: distinguish preview session from real invitation state ---
    app = replace_once(
        app,
        "import './WeddingInvitation.css'\n",
        "import './WeddingInvitation.css'\nimport { loadPreviewSession, savePreviewSession, type PreviewSession } from './lib/previewSession'\n",
        "App preview-session import",
    )
    app = replace_once(
        app,
        """  const invitationToken = useMemo(
    () => new URLSearchParams(window.location.search).get('invite')?.trim() ?? '',
    [],
  )
""",
        """  const invitationToken = useMemo(
    () => new URLSearchParams(window.location.search).get('invite')?.trim() ?? '',
    [],
  )
  const previewMode = useMemo(
    () => new URLSearchParams(window.location.search).get('preview') === '1',
    [],
  )
  const [previewSession, setPreviewSession] = useState<PreviewSession | null>(
    () => previewMode && invitationToken ? loadPreviewSession(invitationToken) : null,
  )

  useEffect(() => {
    if (!previewMode || !invitationToken || !previewSession) return
    savePreviewSession(invitationToken, previewSession)
  }, [invitationToken, previewMode, previewSession])
""",
        "App preview state",
    )
    app = replace_once(
        app,
        """  const existingRsvp = rsvp ?? (invitation?.rsvp ? {
    name: invitation.rsvp.name,
    attendance: invitation.rsvp.attendance,
    guests: invitation.rsvp.guestCount,
    babyCount: invitation.rsvp.babyCount,
    submittedAt: invitation.rsvp.submittedAt,
    qrDataUrl: invitation.rsvp.qrDataUrl,
  } : null)
""",
        """  const existingRsvp = previewMode
    ? previewSession?.rsvp ?? null
    : rsvp ?? (invitation?.rsvp ? {
        name: invitation.rsvp.name,
        attendance: invitation.rsvp.attendance,
        guests: invitation.rsvp.guestCount,
        babyCount: invitation.rsvp.babyCount,
        submittedAt: invitation.rsvp.submittedAt,
        qrDataUrl: invitation.rsvp.qrDataUrl,
      } : null)
""",
        "App preview RSVP source",
    )
    app = replace_once(
        app,
        """  const checkInStatus = useCheckInStatus(
    invitationToken,
    invitationValid &&
    existingRsvp?.attendance === 'attending',
  )
""",
        """  const checkInStatus = useCheckInStatus(
    invitationToken,
    !previewMode && invitationValid &&
    existingRsvp?.attendance === 'attending',
  )

  const displayedMessages = useMemo(() => {
    if (!previewMode) return messages
    const localMessages = previewSession?.messages ?? []
    const localIds = new Set(localMessages.map((item) => item.id))
    return [...localMessages, ...messages.filter((item) => !localIds.has(item.id))]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [messages, previewMode, previewSession?.messages])
""",
        "App preview check-in and messages",
    )
    app = replace_once(
        app,
        """  const handleRSVP = (submission: RSVPSubmission) => {
    setRsvp(submission)
    document.getElementById('rsvp-result')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
""",
        """  const handleRSVP = (submission: RSVPSubmission) => {
    if (previewMode) {
      setPreviewSession((current) => ({
        rsvp: submission,
        messages: current?.messages ?? [],
        hasSubmittedMessage: current?.hasSubmittedMessage ?? false,
      }))
    } else {
      setRsvp(submission)
    }
    document.getElementById('rsvp-result')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const resetPreview = () => {
    setPreviewSession({ rsvp: null, messages: [], hasSubmittedMessage: false })
  }
""",
        "App preview state handlers",
    )
    app = replace_once(
        app,
        """      <InvitationGate
        guestName={invitation?.guestName ?? 'Tamu Undangan'}
        valid={invitationValid}
""",
        """      <InvitationGate
        guestName={invitation?.guestName ?? 'Tamu Undangan'}
        previewMode={previewMode}
        valid={invitationValid}
""",
        "InvitationGate preview prop",
    )
    app = replace_once(
        app,
        """        <ScrollProgress />
        <FallingPetals mode="global" />
""",
        """        {previewMode && invitationOpened && (
          <div
            role="status"
            style={{
              position: 'fixed', top: '12px', left: '50%', transform: 'translateX(-50%)',
              zIndex: 10000, width: 'max-content', maxWidth: 'calc(100vw - 24px)',
              boxSizing: 'border-box', padding: '10px 14px',
              border: '1px solid #c5a66d', borderRadius: '999px',
              background: 'rgba(248, 244, 234, 0.97)', color: '#31473b',
              boxShadow: '0 6px 24px rgba(26, 54, 47, 0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              textAlign: 'center', fontSize: '11px', fontWeight: 700,
            }}
          >
            <span>MODE PREVIEW · Data simulasi tidak disimpan ke database</span>
            <button
              type="button"
              onClick={resetPreview}
              style={{ border: '1px solid #9a875e', borderRadius: '999px', background: 'transparent', color: 'inherit', padding: '4px 8px', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '10px' }}
            >
              Ulangi demo
            </button>
          </div>
        )}
        <ScrollProgress />
        <FallingPetals mode="global" />
""",
        "Preview banner and reset",
    )
    app = replace_once(
        app,
        """          <RSVPSection
            key={invitation?.guestName ?? 'unknown-guest'}
            token={invitationToken}
""",
        """          <RSVPSection
            key={invitation?.guestName ?? 'unknown-guest'}
            previewMode={previewMode}
            token={invitationToken}
""",
        "RSVP preview prop",
    )
    app = replace_once(
        app,
        """          <MessageSection
            token={invitationToken}
            guestName={invitation?.guestName ?? ''}
            initialMessages={messages}
            enabled={invitationValid}
            hasSubmittedInitially={invitation?.hasMessage ?? false}
            onMessageCreated={(message) => setMessages((current) => [message, ...current])}
          />
""",
        """          <MessageSection
            token={invitationToken}
            guestName={invitation?.guestName ?? ''}
            initialMessages={displayedMessages}
            enabled={invitationValid}
            previewMode={previewMode}
            hasSubmittedInitially={previewMode ? previewSession?.hasSubmittedMessage ?? false : invitation?.hasMessage ?? false}
            onMessageCreated={(message) => {
              if (previewMode) {
                setPreviewSession((current) => ({
                  rsvp: current?.rsvp ?? null,
                  messages: [message, ...(current?.messages ?? []).filter((item) => item.id !== message.id)],
                  hasSubmittedMessage: true,
                }))
              } else {
                setMessages((current) => [message, ...current])
              }
            }}
          />
""",
        "MessageSection preview props",
    )

    # --- Admin: add a second copy-link action containing preview=1 ---
    admin = replace_once(
        admin,
        """                        <CopyLinkButton token={i.token} onError={setNotice} />
""",
        """                        <CopyLinkButton token={i.token} onError={setNotice} />
                        <CopyLinkButton token={i.token} preview onError={setNotice} />
""",
        "Admin preview link button",
    )
    admin = replace_once(
        admin,
        """function CopyLinkButton({
  token,
  onError,
}: {
  token: string;
  onError: (msg: string) => void;
}) {
""",
        """function CopyLinkButton({
  token,
  onError,
  preview = false,
}: {
  token: string;
  onError: (msg: string) => void;
  preview?: boolean;
}) {
""",
        "CopyLinkButton preview prop",
    )
    admin = replace_once(
        admin,
        """    invitationUrl.searchParams.set('invite', token);

    const url = invitationUrl.toString();
""",
        """    invitationUrl.searchParams.set('invite', token);
    if (preview) invitationUrl.searchParams.set('preview', '1');

    const url = invitationUrl.toString();
""",
        "CopyLinkButton preview query",
    )
    admin = replace_once(
        admin,
        """      title="Salin Link"
""",
        """      title={preview ? 'Salin Link Preview Klien' : 'Salin Link Undangan'}
      aria-label={preview ? 'Salin link preview klien' : 'Salin link undangan'}
""",
        "CopyLinkButton accessible title",
    )
    admin = replace_once(
        admin,
        """        <div key="idle-state" className="icon-feedback" style={{ display: 'flex', alignItems: 'center' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
        </div>
""",
        """        <div key="idle-state" className="icon-feedback" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
          {preview && <span style={{ fontSize: '0.72rem', whiteSpace: 'nowrap' }}>Preview klien</span>}
        </div>
""",
        "CopyLinkButton preview label",
    )

    # --- Gate: visible indicator before the invite is opened ---
    gate = replace_once(
        gate,
        """  onOpen?: () => void
}
""",
        """  onOpen?: () => void
  previewMode?: boolean
}
""",
        "InvitationGate prop type",
    )
    gate = replace_once(
        gate,
        """  error = '',
  onOpen,
}: InvitationGateProps) {
""",
        """  error = '',
  onOpen,
  previewMode = false,
}: InvitationGateProps) {
""",
        "InvitationGate preview default",
    )
    gate = replace_once(
        gate,
        """          <p className="gate-kicker">The Wedding Of</p>
""",
        """          <p className="gate-kicker">The Wedding Of</p>
          {previewMode && (
            <p
              role="status"
              style={{
                display: 'inline-block', margin: '8px auto 0', padding: '6px 10px',
                border: '1px solid rgba(197, 166, 109, 0.8)', borderRadius: '999px',
                background: 'rgba(248, 244, 234, 0.92)', color: '#31473b',
                fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em',
              }}
            >
              PREVIEW KLIEN · SIMULASI
            </p>
          )}
""",
        "InvitationGate preview indicator",
    )

    # --- RSVP: local simulation branch; server only makes an image for a demo payload ---
    rsvp = replace_once(
        rsvp,
        """  onSubmit: (submission: RSVPSubmission) => void
}
""",
        """  onSubmit: (submission: RSVPSubmission) => void
  previewMode?: boolean
}
""",
        "RSVP preview prop type",
    )
    rsvp = replace_once(
        rsvp,
        """export function RSVPSection({ token, validToken, quota, existingRSVP, guestName, checkedInAt = null, onSubmit }: RSVPSectionProps) {
""",
        """export function RSVPSection({ token, validToken, quota, existingRSVP, guestName, checkedInAt = null, onSubmit, previewMode = false }: RSVPSectionProps) {
""",
        "RSVP preview prop default",
    )
    submit_start = rsvp.find("  const submit = (event: FormEvent<HTMLFormElement>) => {")
    submit_end = rsvp.find("\n\n  return (", submit_start)
    if submit_start < 0 or submit_end < 0:
        raise RuntimeError("Cannot safely apply RSVP submit handler: source block not found.")
    rsvp = rsvp[:submit_start] + '''  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!validToken) {
      setError('RSVP hanya dapat dilakukan melalui link undangan personal.')
      return
    }
    if (!name.trim()) {
      setError('Nama tamu wajib diisi.')
      return
    }
    if (attendance === 'attending' && guests > quota) {
      setError(`Jumlah kursi melebihi quota undangan (${quota}).`)
      return
    }

    setSubmitting(true)
    try {
      if (previewMode) {
        let qrDataUrl: string | null = null
        if (attendance === 'attending') {
          const previewPayload = `wedding:preview:${crypto.randomUUID()}`
          const qr = await weddingApi.createPreviewQr(previewPayload)
          qrDataUrl = qr.qrDataUrl
        }

        onSubmit({
          name: name.trim(),
          attendance,
          guests: attendance === 'attending' ? guests : 0,
          babyCount: attendance === 'attending' ? babyCount : 0,
          submittedAt: new Date().toISOString(),
          qrDataUrl,
          checkInCode: `PREVIEW-${token.slice(0, 6).toUpperCase()}`,
        })
        return
      }

      const result = await weddingApi.submitRSVP(token, {
        name: name.trim(),
        attendance,
        guestCount: attendance === 'attending' ? guests : 0,
        babyCount: attendance === 'attending' ? babyCount : 0,
      })
      onSubmit(result)
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'RSVP gagal dikirim.')
    } finally {
      setSubmitting(false)
    }
  }''' + rsvp[submit_end:]
    rsvp = replace_once(
        rsvp,
        """                <QrCodeCard
                   qrDataUrl={existingRSVP.qrDataUrl}
                   guestName={existingRSVP.name}
                 />
""",
        """                {previewMode && (
                  <span
                    role="status"
                    style={{ display: 'inline-block', marginBottom: '8px', padding: '5px 9px', borderRadius: '999px', background: '#f6ead1', color: '#634b22', fontSize: '10px', fontWeight: 800, letterSpacing: '0.08em' }}
                  >
                    QR PREVIEW
                  </span>
                )}
                <QrCodeCard
                   qrDataUrl={existingRSVP.qrDataUrl}
                   guestName={existingRSVP.name}
                 />
""",
        "RSVP preview QR badge",
    )
    rsvp = replace_once(
        rsvp,
        """                <small>
                  Tunjukkan QR code ini kepada staff saat
                  hari H.
                </small>
""",
        """                <small>
                  {previewMode
                    ? 'QR khusus preview — tidak berlaku untuk check-in acara.'
                    : 'Tunjukkan QR code ini kepada staff saat hari H.'}
                </small>
""",
        "RSVP preview QR warning",
    )

    # --- Message form: do not call the write endpoint while previewing ---
    messages = replace_once(
        messages,
        """  onMessageCreated: (message: MessageItem) => void
}
""",
        """  onMessageCreated: (message: MessageItem) => void
  previewMode?: boolean
}
""",
        "MessageSection preview prop type",
    )
    messages = replace_once(
        messages,
        """export function MessageSection({ token, guestName, initialMessages: serverMessages, enabled, hasSubmittedInitially, onMessageCreated }: MessageSectionProps) {
""",
        """export function MessageSection({ token, guestName, initialMessages: serverMessages, enabled, hasSubmittedInitially, onMessageCreated, previewMode = false }: MessageSectionProps) {
""",
        "MessageSection preview prop default",
    )
    messages = replace_once(
        messages,
        """    try {
      const created = await weddingApi.createMessage(token, {
        name: senderName,
        message: trimmedMessage,
      })

      onMessageCreated(created)
""",
        """    try {
      const created: MessageItem = previewMode
        ? {
            id: `preview-${crypto.randomUUID()}`,
            name: senderName,
            message: trimmedMessage,
            status: 'published',
            createdAt: new Date().toISOString(),
          }
        : await weddingApi.createMessage(token, {
            name: senderName,
            message: trimmedMessage,
          })

      onMessageCreated(created)
""",
        "MessageSection local submit branch",
    )

    # --- Backend: rate-limited QR generation with no database access ---
    backend_app = replace_once(
        backend_app,
        """import { attendanceRouter } from './modules/attendance/attendance.routes.js'
""",
        """import { attendanceRouter } from './modules/attendance/attendance.routes.js'
import { previewQrRouter } from './modules/preview/preview.routes.js'
""",
        "Backend preview router import",
    )
    backend_app = replace_once(
        backend_app,
        """app.use('/api/invitations/:token/rsvp', publicWriteLimiter)
app.use('/api/invitations/:token/messages', publicWriteLimiter)
""",
        """app.use('/api/invitations/:token/rsvp', publicWriteLimiter)
app.use('/api/invitations/:token/messages', publicWriteLimiter)
app.use('/api/preview/qr', publicWriteLimiter)
""",
        "Backend preview QR rate limit",
    )
    backend_app = replace_once(
        backend_app,
        """app.use('/api/attendance', attendanceRouter)
app.use('/api/invitations', invitationRouter)
""",
        """app.use('/api/attendance', attendanceRouter)
app.use('/api/preview', previewQrRouter)
app.use('/api/invitations', invitationRouter)
""",
        "Backend preview QR route registration",
    )

    readme = replace_once(
        readme,
        """## Verification commands
""",
        """## Client preview mode

From the admin invitation table, copy **Preview klien** for a dummy invitation and send that URL to the client. The link adds `preview=1`. The preview uses the invitation's name/quota and can demonstrate RSVP, a demo QR, and a new message without writing those interactions to MySQL. Previously published messages are read via the existing read-only messages endpoint. Local preview interactions are retained in that browser tab's session storage; use **Ulangi demo** to reset them. A preview QR uses the `wedding:preview:` payload and is not valid for event check-in.

The invitation record itself is still read from the database, so create a dummy invitation in admin before sharing its preview link. Avoid sharing a real guest's token for client demonstrations.

## Verification commands
""",
        "README preview documentation",
    )

    preview_route = '''import { Router } from 'express'
import QRCode from 'qrcode'
import { z } from 'zod'

export const previewQrRouter = Router()

// Only encode the dedicated preview payload format. This route does not access Prisma/MySQL.
const previewPayloadSchema = z.string().regex(
  /^wedding:preview:[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
)

previewQrRouter.get('/qr', async (request, response, next) => {
  const parsed = previewPayloadSchema.safeParse(request.query.payload)
  if (!parsed.success) {
    response.status(400).json({
      error: 'INVALID_PREVIEW_QR',
      message: 'Payload QR preview tidak valid.',
    })
    return
  }

  try {
    const qrDataUrl = await QRCode.toDataURL(parsed.data, { margin: 1, width: 280 })
    response.json({ data: { qrDataUrl } })
  } catch (error) {
    next(error)
  }
})
'''

    # Make all replacements in memory first, then write. If an expected source
    # differs from this repository version, no files have been changed yet.
    changed = {
        "src/App.tsx": app,
        "src/pages/AdminPage.tsx": admin,
        "src/components/InvitationGate.tsx": gate,
        "src/components/RSVPSection.tsx": rsvp,
        "src/components/MessageSection.tsx": messages,
        "src/services/api.ts": api,
        "backend/src/app.ts": backend_app,
        "README.md": readme,
    }
    add_new_file("src/lib/previewSession.ts", preview_session)
    add_new_file("backend/src/modules/preview/preview.routes.ts", preview_route)
    for rel, content in changed.items():
        write(rel, content)

    print("Preview mode applied successfully.")
    print("Updated files:")
    for rel in [*changed.keys(), "src/lib/previewSession.ts", "backend/src/modules/preview/preview.routes.ts"]:
        print(f"  - {rel}")
    print("Next: run frontend and backend typecheck/build commands before deployment.")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        print("No partial source replacements were written before validation completed. Check your branch/source version and retry.", file=sys.stderr)
        sys.exit(1)
