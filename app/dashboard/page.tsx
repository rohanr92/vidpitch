'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Button from '@/components/ui/Button'

type Campaign = {
  _id: string
  name: string
  status: string
  totalVideos: number
  completedVideos: number
  createdAt: string
}

const statusMap: Record<string, { bg: string; color: string; label: string }> = {
  completed:  { bg: 'rgba(0,229,160,0.1)',    color: '#00E5A0',       label: 'Completed'  },
  processing: { bg: 'rgba(0,102,255,0.1)',    color: '#4da6ff',       label: 'Processing' },
  queued:     { bg: 'rgba(255,255,255,0.06)', color: 'var(--muted)',  label: 'Queued'     },
  failed:     { bg: 'rgba(255,80,80,0.1)',    color: '#ff6b6b',       label: 'Failed'     },
}

export default function Dashboard() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [fetching, setFetching] = useState(true)
  const [tab, setTab] = useState<'all' | 'processing' | 'completed'>('all')

  // 🔒 If not logged in → go to login page
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Load campaigns from MongoDB
  useEffect(() => {
    if (!user) return
    fetch(`/api/campaigns?userId=${user.uid}`)
      .then(r => r.json())
      .then(data => {
        setCampaigns(data.campaigns || [])
        setFetching(false)
      })
      .catch(() => setFetching(false))
  }, [user])

  // Show spinner while checking auth
  if (loading || !user) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTop: '3px solid var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  const filtered = tab === 'all' ? campaigns : campaigns.filter(c => c.status === tab)

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: 240,
        borderRight: '1px solid var(--border)',
        padding: '24px 16px',
        background: 'var(--surface)',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        position: 'sticky',
        top: 0,
        height: '100vh',
      }}>
        <a href="/" style={{ textDecoration: 'none', fontFamily: 'var(--font-syne)', fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'block', marginBottom: 32, padding: '0 8px' }}>
          Vid<span style={{ color: 'var(--accent)' }}>Pitch</span>
        </a>

        {[
          { icon: '◼', label: 'Dashboard',  href: '/dashboard', active: true  },
{ icon: '📁', label: 'Campaigns', href: '/dashboard', active: false },
{ icon: '🎬', label: 'Videos',    href: '/dashboard', active: false },
{ icon: '📊', label: 'Analytics', href: '/analytics', active: false },
{ icon: '⚙️', label: 'Settings',  href: '/settings',  active: false },
        ].map(item => (
          <a key={item.label} href={item.href} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 8, textDecoration: 'none',
            fontSize: 14, fontWeight: item.active ? 600 : 400,
            color: item.active ? 'var(--text)' : 'var(--muted)',
            background: item.active ? 'var(--surface2)' : 'transparent',
          }}>
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            {item.label}
          </a>
        ))}

        {/* Bottom of sidebar — user info + logout */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ padding: 12, borderRadius: 10, background: 'var(--surface2)', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>Signed in as</p>
            <p style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: 9,
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: 8, color: 'var(--muted)',
              fontSize: 13, cursor: 'pointer',
              fontFamily: 'var(--font-dm)',
            }}
          >
            Sign out
          </button>
          <Button variant="primary" size="sm" fullWidth href="/campaign/new">
            + New Campaign
          </Button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, padding: '36px 40px', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-syne)', fontSize: 28, fontWeight: 800, letterSpacing: '-1px', marginBottom: 4 }}>
              Dashboard
            </h1>
            <p style={{ fontSize: 14, color: 'var(--muted)' }}>
              Welcome back, {user.email?.split('@')[0]}. Here&apos;s what&apos;s happening.
            </p>
          </div>
          <Button variant="primary" href="/campaign/new">+ New Campaign</Button>
        </div>

        {/* Stats cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 36 }}>
          {[
            { label: 'Total Videos',  value: String(campaigns.reduce((a, c) => a + c.totalVideos, 0)), icon: '🎬', sub: 'all time' },
            { label: 'Completed',     value: String(campaigns.filter(c => c.status === 'completed').length),  icon: '✅', sub: 'campaigns' },
            { label: 'Processing',    value: String(campaigns.filter(c => c.status === 'processing').length), icon: '⚡', sub: 'right now' },
            { label: 'Campaigns',     value: String(campaigns.length), icon: '📁', sub: 'total' },
          ].map(s => (
            <div key={s.label} style={{ padding: 24, border: '1px solid var(--border)', borderRadius: 14, background: 'var(--surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>{s.label}</span>
                <span style={{ fontSize: 20 }}>{s.icon}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-syne)', fontSize: 36, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1, marginBottom: 6 }}>
                {s.value}
              </div>
              <p style={{ fontSize: 12, color: 'var(--accent)' }}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Campaigns table */}
        <div style={{ border: '1px solid var(--border)', borderRadius: 16, background: 'var(--surface)', overflow: 'hidden' }}>

          {/* Table top bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: 16, fontWeight: 700 }}>Campaigns</h2>
            <div style={{ display: 'flex', gap: 4, background: 'var(--surface2)', padding: 4, borderRadius: 8 }}>
              {(['all', 'processing', 'completed'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  padding: '6px 14px', borderRadius: 6, border: 'none',
                  cursor: 'pointer', fontSize: 13, fontWeight: 500,
                  fontFamily: 'var(--font-dm)',
                  background: tab === t ? 'var(--surface)' : 'transparent',
                  color: tab === t ? 'var(--text)' : 'var(--muted)',
                }}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Loading state */}
          {fetching && (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>
              Loading campaigns...
            </div>
          )}

          {/* Empty state */}
          {!fetching && filtered.length === 0 && (
            <div style={{ padding: 64, textAlign: 'center' }}>
              <p style={{ fontSize: 40, marginBottom: 12 }}>📭</p>
              <p style={{ fontFamily: 'var(--font-syne)', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                No campaigns yet
              </p>
              <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>
                Create your first campaign to get started.
              </p>
              <Button variant="primary" href="/campaign/new">+ Create Campaign</Button>
            </div>
          )}

          {/* Table rows */}
          {!fetching && filtered.length > 0 && (
            <>
              {/* Column headers */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 120px', padding: '12px 24px', borderBottom: '1px solid var(--border)' }}>
                {['Campaign', 'Progress', 'Created', 'Status'].map(col => (
                  <span key={col} style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {col}
                  </span>
                ))}
              </div>

              {filtered.map((c, i) => {
                const pct = c.totalVideos > 0 ? Math.round((c.completedVideos / c.totalVideos) * 100) : 0
                const s = statusMap[c.status] || statusMap.queued
                return (
                  <div key={c._id} style={{
                    display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 120px',
                    padding: '18px 24px', alignItems: 'center',
                    borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                    cursor: 'pointer', transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')} onClick={() => router.push(`/campaign/${c._id}`)}
                  >
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{c.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--muted)' }}>{c.totalVideos} videos</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 13, marginBottom: 6 }}>{c.completedVideos}/{c.totalVideos}</p>
                      <div style={{ height: 4, borderRadius: 4, background: 'var(--surface2)', width: 80 }}>
                        <div style={{ height: '100%', borderRadius: 4, width: `${pct}%`, background: c.status === 'processing' ? 'var(--accent2)' : 'var(--accent)' }} />
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--muted)' }}>{timeAgo(c.createdAt)}</p>
                    <span style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: s.bg, color: s.color, width: 'fit-content' }}>
                      {s.label}
                    </span>
                  </div>
                )
              })}
            </>
          )}
        </div>
      </div>
    </div>
  )
}