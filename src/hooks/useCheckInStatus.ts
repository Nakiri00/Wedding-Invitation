import { useEffect, useState } from 'react'
import { weddingApi } from '../services/api'

interface CheckInStatus {
  checkedIn: boolean
  checkedInAt: string | null
}

const initialStatus: CheckInStatus = {
  checkedIn: false,
  checkedInAt: null,
}

export function useCheckInStatus(
  token: string,
  enabled: boolean,
) {
  const [statusSnapshot, setStatusSnapshot] = useState<{
    token: string
    status: CheckInStatus
  } | null>(null)

  useEffect(() => {
    if (!token || !enabled) return

    let active = true
    let inFlight = false

    const loadStatus = async () => {
      if (inFlight) return

      inFlight = true

      try {
        const result =
          await weddingApi.getCheckInStatus(token)

        if (active) {
          setStatusSnapshot({ token, status: result })
        }
      } catch {
        // Kegagalan polling tidak perlu mengganggu UI tamu.
      } finally {
        inFlight = false
      }
    }

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') {
        void loadStatus()
      }
    }

    const refreshWhenFocused = () => {
      void loadStatus()
    }

    void loadStatus()

    const interval = window.setInterval(
      loadStatus,
      8000,
    )

    document.addEventListener(
      'visibilitychange',
      refreshWhenVisible,
    )

    window.addEventListener(
      'focus',
      refreshWhenFocused,
    )

    return () => {
      active = false

      window.clearInterval(interval)

      document.removeEventListener(
        'visibilitychange',
        refreshWhenVisible,
      )

      window.removeEventListener(
        'focus',
        refreshWhenFocused,
      )
    }
  }, [token, enabled])

  return token && enabled && statusSnapshot?.token === token
    ? statusSnapshot.status
    : initialStatus
}