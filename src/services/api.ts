const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api').replace(/\/$/, '')

interface ApiEnvelope<T> { data: T; error?: string; message?: string }

function readCookie(name: string) {
  const prefix = `${name}=`
  return document.cookie.split('; ').find((part) => part.startsWith(prefix))?.slice(prefix.length) ?? null
}

async function ensureCsrf() {
  if (readCookie('han_wedding_csrf')) return
  await fetch(`${API_URL}/auth/csrf`, { credentials: 'include' })
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const method = options?.method?.toUpperCase() ?? 'GET'
  const headers: Record<string, string> = { ...(options?.body ? { 'Content-Type': 'application/json' } : {}), ...(options?.headers as Record<string, string> | undefined) }
  if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
    await ensureCsrf()
    const csrf = readCookie('han_wedding_csrf')
    if (csrf) headers['X-CSRF-Token'] = decodeURIComponent(csrf)
  }
  const response = await fetch(`${API_URL}${path}`, { ...options, credentials: 'include', headers })
  const payload = (await response.json().catch(() => ({}))) as Partial<ApiEnvelope<T>>
  if (!response.ok) throw new Error(payload.message ?? 'Permintaan ke server gagal.')
  return payload.data as T
}

export const weddingApi = {
  getInvitation: (token: string) => request<import('../types/wedding').InvitationData>(`/invitations/${encodeURIComponent(token)}`),
  submitRSVP: async (token: string, payload: { name: string; attendance: 'attending' | 'not_attending'; guestCount: number; babyCount: number }) => {
    const result = await request<{
      name: string
      attendance: 'attending' | 'not_attending'
      guestCount: number
      babyCount: number
      submittedAt: string
      qrDataUrl?: string | null
      checkInCode?: string | null
    }>(`/invitations/${encodeURIComponent(token)}/rsvp`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    return {
      name: result.name,
      attendance: result.attendance,
      guests: result.guestCount,
      babyCount: result.babyCount,
      submittedAt: result.submittedAt,
      qrDataUrl: result.qrDataUrl,
      checkInCode: result.checkInCode,
    }
  },
  getMessages: (token: string) => request<import('../types/wedding').MessageItem[]>(`/invitations/${encodeURIComponent(token)}/messages`),
  createMessage: (token: string, payload: { name: string; message: string }) =>
    request<import('../types/wedding').MessageItem>(`/invitations/${encodeURIComponent(token)}/messages`, { method: 'POST', body: JSON.stringify(payload) }),
}
