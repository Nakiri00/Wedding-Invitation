export type AttendanceStatus = 'attending' | 'not_attending'

export interface RSVPSubmission {
  name: string
  attendance: AttendanceStatus
  guests: number
  babyCount: number
  submittedAt: string
  qrDataUrl?: string | null
  checkInCode?: string | null
}

export interface InvitationData {
  id: string
  token: string
  guestName: string
  quota: number
  status: 'ACTIVE' | 'REVOKED'
  hasMessage: boolean
  rsvp: {
    name: string
    attendance: AttendanceStatus
    guestCount: number
    babyCount: number
    qrDataUrl?: string | null
    submittedAt: string
  } | null
}

export interface MessageItem {
  id: string
  name: string
  message: string
  createdAt: string
  status: 'published' | 'hidden' | 'pending'
}
