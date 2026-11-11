'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function SignupPage() {
  const { signup } = useAuth()
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async () => {
    setError('')
    if (!name.trim()) { setError('Please enter your name.'); return }
    if (!email.trim()) { setError('Please enter your email.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }

    setLoading(true)
    try {
      await signup(email, password, name)
      router.push('/dashboard')
    } catch (e: any) {
      if (e.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please sign in.')
      } else if (e.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.')
      } else if (e.code === 'auth/weak-password') {
        setError('Password is too weak. Use at least 8 characters.')
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
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <a href="/" style={{ textDecoration: 'none', fontFamily: 'var(--font-syne)', fontSize: 26, fontWeight: 800, color: 'var(--text)' }}>
            Vid<span style={{ color: 'var(--accent)' }}>Pitch</span>
          </a>
          <p style={{ marginTop: 8, fontSize: 14, color: 'var(--muted)' }}>
            Start sending personalized videos
          </p>
        </div>

        {/* Perks */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 28, flexWrap: 'wrap' }}>
          {['Free 10 videos', 'No credit card', 'Setup in 2 min'].map(t => (
            <span key={t} style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ color: 'var(--accent)' }}>✓</span>{t}
            </span>
          ))}
        </div>

        {/* Card */}
        <div style={{ padding: 40, border: '1px solid var(--border)', borderRadius: 20, background: 'var(--surface)' }}>
          <h1 style={{ fontFamily: 'var(--font-syne)', fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 28 }}>
            Create your account
          </h1>

          {/* Error box */}
          {error && (
            <div style={{ padding: '12px 16px', background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.25)', borderRadius: 10, fontSize: 14, color: '#ff6b6b', marginBottom: 20 }}>
              {error}
            </div>
          )}

          {/* Name */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--muted)', marginBottom: 8 }}>Full name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="John Smith"
              style={inp}
              onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--muted)', marginBottom: 8 }}>Work email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              style={inp}
              onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--muted)', marginBottom: 8 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min 8 characters"
              style={inp}
              onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              onKeyDown={e => e.key === 'Enter' && handleSignup()}
            />
          </div>

          {/* Password strength hint */}
          {password.length > 0 && (
            <div style={{ marginBottom: 20, marginTop: 8 }}>
              <div style={{ height: 3, borderRadius: 3, background: 'var(--surface2)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  borderRadius: 3,
                  transition: 'width 0.3s, background 0.3s',
                  width: password.length < 6 ? '25%' : password.length < 8 ? '55%' : password.length < 12 ? '75%' : '100%',
                  background: password.length < 6 ? '#ff6b6b' : password.length < 8 ? '#fbbf24' : 'var(--accent)',
                }} />
              </div>
              <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 5 }}>
                {password.length < 6 ? 'Too short' : password.length < 8 ? 'Almost there' : password.length < 12 ? 'Good' : 'Strong ✓'}
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSignup}
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
              marginBottom: 16,
            }}
          >
            {loading ? 'Creating account...' : 'Create free account →'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)' }}>
            By signing up you agree to our{' '}
            <a href="#" style={{ color: 'var(--text)' }}>Terms</a> and{' '}
            <a href="#" style={{ color: 'var(--text)' }}>Privacy Policy</a>.
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--muted)' }}>
          Already have an account?{' '}
          <a href="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}