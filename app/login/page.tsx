'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Button from '@/components/ui/Button'

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      router.push('/dashboard')
    } catch (e: any) {
      if (e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
        setError('Wrong email or password. Please try again.')
      } else if (e.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.')
      } else if (e.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.')
      } else {
        setError('Something went wrong. Please try again.')
      }
      setLoading(false)
    }
  }

  const inp: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    color: 'var(--text)',
    fontSize: 14,
    fontFamily: 'var(--font-dm)',
    outline: 'none',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative' }}>
      <div className="ambient ambient-1" />
      <div className="ambient ambient-2" />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <a href="/" style={{ textDecoration: 'none', fontFamily: 'var(--font-syne)', fontSize: 26, fontWeight: 800, color: 'var(--text)' }}>
            Vid<span style={{ color: 'var(--accent)' }}>Pitch</span>
          </a>
          <p style={{ marginTop: 8, fontSize: 14, color: 'var(--muted)' }}>Welcome back</p>
        </div>

        {/* Card */}
        <div style={{ padding: 40, border: '1px solid var(--border)', borderRadius: 20, background: 'var(--surface)' }}>
          <h1 style={{ fontFamily: 'var(--font-syne)', fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 28 }}>
            Sign in to your account
          </h1>

          {/* Error box */}
          {error && (
            <div style={{ padding: '12px 16px', background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.25)', borderRadius: 10, fontSize: 14, color: '#ff6b6b', marginBottom: 20 }}>
              {error}
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--muted)', marginBottom: 8 }}>
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              style={inp}
              onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)' }}>Password</label>
              <a href="#" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}>Forgot password?</a>
            </div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={inp}
              onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? 'rgba(0,229,160,0.5)' : 'var(--accent)',
              border: 'none',
              borderRadius: 10,
              color: '#000',
              fontSize: 15,
              fontWeight: 700,
              fontFamily: 'var(--font-dm)',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.2s',
            }}
          >
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--muted)' }}>
          Don&apos;t have an account?{' '}
          <a href="/signup" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
            Sign up free
          </a>
        </p>
      </div>
    </div>
  )
}