const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api').replace(/\/$/, '')

export interface AuthSession { user: { id: string; name: string; email?: string; role: 'ADMIN' | 'STAFF' }; csrfToken?:string }
export interface AdminGuest { id: string; name: string; contact: string | null; countedGuest: boolean }
export interface AdminInvitation { id: string; token: string; guestName: string; contact: string | null; quota: number; status: 'ACTIVE' | 'REVOKED'; guests: AdminGuest[]; rsvp: { attendance: 'ATTENDING' | 'NOT_ATTENDING'; guestCount: number; babyCount: number; submittedAt: string } | null; checkedInAt: string | null; checkInSource: 'STAFF' | 'WALK_IN' | null; createdAt: string }
export interface AdminMessage { id: string; guestName: string; message: string; status: 'PENDING' | 'PUBLISHED' | 'HIDDEN'; createdAt: string; invitation: { guestName: string; token: string } | null }
export interface Overview {
  invited: number; rsvp: number; attending: number; notAttending: number; checkedIn: number; pendingMessages: number; walkIns: number;
  invitedSeats: number; confirmedSeats: number; confirmationRate: number; checkInRate: number
}

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

export const adminApi = {
  csrf: () =>
    request<{
      ready: boolean;
      csrfToken: string;
    }>('/auth/csrf'),

  login: (email: string, password: string) =>
    request<AuthSession>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
      }),
    }),

  me: () =>
    request<{
      user: AuthSession['user'];
    }>('/auth/me'),

  logout: async () => {
    const result = await request<{
      success: boolean;
    }>('/auth/logout', {
      method: 'POST',
    });

    csrfToken = null;
    return result;
  },
  // Pertahankan seluruh method lainnya seperti sebelumnya.
  overview: () => request<Overview>('/admin/overview'),
  invitations: () => request<AdminInvitation[]>('/admin/invitations'),
  createInvitation: (payload: { guestName: string; contact?: string; quota: number }) => request<AdminInvitation>('/admin/invitations', { method: 'POST', body: JSON.stringify(payload) }),
  revokeInvitation: (id: string) => request<AdminInvitation>(`/admin/invitations/${id}/revoke`, { method: 'POST' }),
  messages: () => request<AdminMessage[]>('/admin/messages'),
  moderateMessage: (id: string, status: 'PUBLISHED' | 'HIDDEN') => request<AdminMessage>(`/admin/messages/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  auditLogs: () => request<unknown[]>('/admin/audit-logs'),
  attendance: () => request<unknown[]>('/attendance'),
  guests: (invitationId: string) => request<AdminGuest[]>(`/admin/invitations/${invitationId}/guests`),
  addGuest: (invitationId: string, payload: { name: string; contact?: string; countedGuest: boolean }) => request<AdminGuest>(`/admin/invitations/${invitationId}/guests`, { method: 'POST', body: JSON.stringify(payload) }),
  deleteGuest: (guestId: string) => request<{ success: boolean }>(`/admin/guests/${guestId}`, { method: 'DELETE' }),
  searchWalkIns: (q: string) => request<Array<{ id: string; guestName: string; contact: string | null; quota: number; token: string; attendance: string | null; guestCount: number | null; babyCount: number | null; checkedInAt: string | null }>>(`/attendance/search?q=${encodeURIComponent(q)}`),
  walkInCheckIn: (invitationId: string, guestCount: number, babyCount: number) => request<{ guestName: string; guestCount: number; babyCount: number; checkedInAt: string; source: 'WALK_IN' }>('/attendance/walk-in', { method: 'POST', body: JSON.stringify({ invitationId, guestCount, babyCount }) }),
  validateQr: (qrToken: string) => request<{ invitationId: string; guestName: string; quota: number; guestCount: number; babyCount: number; checkedInAt: string | null }>('/attendance/validate-qr', { method: 'POST', body: JSON.stringify({ qrToken }) }),
  checkIn: (qrToken: string) => request<{ attendanceId: string; guestName: string; guestCount: number; babyCount: number; checkedInAt: string; source: 'STAFF' }>('/attendance/check-in', { method: 'POST', body: JSON.stringify({ qrToken }) }),
}
