import { useEffect, useState } from 'react'
import { AuthPage } from './pages/AuthPage'
import { AdminPage } from './pages/AdminPage'
import { StaffPage } from './pages/StaffPage'
import { adminApi, type AuthSession } from './services/adminApi'

export function ConsoleApp({ section }: { section: 'admin' | 'staff' }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    adminApi.me()
      .then(({ user }) => { if (active) setSession({ user }) })
      .catch(() => { if (active) setSession(null) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  async function logout() {
    await adminApi.logout().catch(() => undefined)
    setSession(null)
  }

  if (loading) return <main className="console-auth"><div className="auth-card"><p>Memeriksa sesi…</p></div></main>
  if (!session) return <AuthPage onLogin={setSession} />
  if (section === 'admin' && session.user.role !== 'ADMIN') return <main className="console-auth"><div className="auth-card"><h1>Akses ditolak</h1><p>Akun staff tidak dapat membuka dashboard admin.</p><button className="primary-button" onClick={logout}>Keluar</button></div></main>
  return section === 'admin' ? <AdminPage session={session} onLogout={logout} /> : <StaffPage session={session} onLogout={logout} />
}
