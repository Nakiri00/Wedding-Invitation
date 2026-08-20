import { useState } from 'react'
import type { FormEvent } from 'react'
import { adminApi, type AuthSession } from '../services/adminApi'

interface Props { onLogin: (session: AuthSession) => void }
export function AuthPage({ onLogin }: Props) {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false)
  async function submit(e: FormEvent) { e.preventDefault(); setError(''); setLoading(true); try { onLogin(await adminApi.login(email, password)) } catch (err) { setError(err instanceof Error ? err.message : 'Login gagal.') } finally { setLoading(false) } }
  return <main className="console-auth"><div className="auth-card"><span className="console-kicker">The Wedding of Konan & Nilo</span><h1>Wedding Console</h1><p>Masuk sebagai admin atau staff untuk mengelola undangan dan check-in.</p><form onSubmit={submit}><label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label><label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></label>{error && <div className="form-error">{error}</div>}<button className="primary-button" disabled={loading}>{loading ? 'Memeriksa…' : 'Masuk'}</button></form>{import.meta.env.DEV && <small>Development seed: admin@example.com / ChangeMe123!</small>}</div></main>
}
