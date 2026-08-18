import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Droplet, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import Field from '../components/ui/Field'
import { ErrorBanner } from '../components/ui/Misc'
import { inputClass } from '../components/ui/styles'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login({ email, password })
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-suds-600 text-white shadow-[var(--shadow-card)]">
            <Droplet className="h-6 w-6" fill="currentColor" />
          </span>
          <h1 className="font-display text-xl font-semibold text-ink">Car Wash Management</h1>
          <p className="mt-1 text-sm text-ink-muted">Đăng nhập để tiếp tục vận hành</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Email">
              <input
                type="email"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </Field>
            <Field label="Mật khẩu">
              <input
                type="password"
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </Field>

            {error && <ErrorBanner>{error}</ErrorBanner>}

            <Button type="submit" variant="primary" disabled={submitting} className="mt-1 w-full">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
