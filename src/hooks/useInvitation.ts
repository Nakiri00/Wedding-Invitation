import { useEffect, useState } from 'react'
import { weddingApi } from '../services/api'
import type { InvitationData } from '../types/wedding'

export function useInvitation(token: string) {
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [loading, setLoading] = useState(Boolean(token))
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      return
    }

    let active = true
    weddingApi.getInvitation(token)
      .then((data) => {
        if (active) setInvitation(data)
      })
      .catch((reason: unknown) => {
        if (active) {
          setInvitation(null)
          setError(reason instanceof Error ? reason.message : 'Undangan tidak dapat dimuat.')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [token])

  return { invitation, loading, error }
}
