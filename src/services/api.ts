const API_URL = (
  import.meta.env.VITE_API_URL ??
  'http://localhost:4000/api'
).replace(/\/$/, '');

// interface ApiEnvelope<T> {
//   data: T;
//   error?: string;
//   message?: string;
// }

let csrfToken: string | null = null;
let csrfRequest: Promise<string> | null = null;

async function ensureCsrf(): Promise<string> {
  if (csrfToken) return csrfToken;

  if (!csrfRequest) {
    csrfRequest = (async () => {
      const response = await fetch(`${API_URL}/auth/csrf`, {
        credentials: 'include',
      });

      const payload = (await response.json().catch(() => ({}))) as {
        data?: {
          ready: boolean;
          csrfToken: string;
        };
        message?: string;
      };

      const token = payload.data?.csrfToken;

      if (!response.ok || !token) {
        throw new Error(
          payload.message ?? 'Gagal memperoleh token keamanan.',
        );
      }

      return token;
    })();
  }

  try {
    csrfToken = await csrfRequest;
    return csrfToken;
  } finally {
    csrfRequest = null;
  }
}

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const method = options?.method?.toUpperCase() ?? 'GET';

  const headers: Record<string, string> = {
    ...(options?.body
      ? {
          'Content-Type': 'application/json',
        }
      : {}),
    ...(options?.headers as Record<string, string> | undefined),
  };

  if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
    headers['X-CSRF-Token'] = await ensureCsrf();
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  const payload = (await response.json().catch(() => ({}))) as {
    data?: T;
    message?: string;
  };

  if (!response.ok) {
    if (response.status === 403) {
      csrfToken = null;
    }

    throw new Error(payload.message ?? 'Permintaan gagal.');
  }

  const result = payload.data as T;

  if (result && typeof result === 'object') {
    const nextCsrfToken = (
      result as {
        csrfToken?: unknown;
      }
    ).csrfToken;

    if (typeof nextCsrfToken === 'string') {
      csrfToken = nextCsrfToken;
    }
  }

  return result;
}

export const weddingApi = {
  getInvitation: (token: string) => request<import('../types/wedding').InvitationData>(`/invitations/${encodeURIComponent(token)}`),
  getCheckInStatus: (token: string) =>request<{
    checkedIn: boolean
    checkedInAt: string | null
  }>(
    `/invitations/${encodeURIComponent(
      token,
    )}/check-in-status`,
  ),
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
  createPreviewQr: (payload: string) => request<{ qrDataUrl: string }>(`/preview/qr?payload=${encodeURIComponent(payload)}`),
  createMessage: (token: string, payload: { name: string; message: string }) =>
    request<import('../types/wedding').MessageItem>(`/invitations/${encodeURIComponent(token)}/messages`, { method: 'POST', body: JSON.stringify(payload) }),
}
