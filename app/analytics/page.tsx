'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ totalVideos: 0, totalViews: 0, completed: 0, campaigns: 0 })
  const [campaigns, setCampaigns] = useState<any[]>([])

  useEffect(() => {
    if (!user) return
    fetch(`/api/campaigns?userId=${user.uid}`)
      .then(r => r.json())
      .then(data => {
        const c = data.campaigns || []
        setCampaigns(c)
        setStats({
          campaigns: c.length,
          totalVideos: c.reduce((a: number, x: any) => a + (x.totalVideos || 0), 0),
          completed: c.reduce((a: number, x: any) => a + (x.completedVideos || 0), 0),
          totalViews: 0,
        })
      })
  }, [user])

  const sidebarItems = [
    { icon: '◼', label: 'Dashboard',  href: '/dashboard', active: false },
    { icon: '📁', label: 'Campaigns', href: '/dashboard', active: false },
    { icon: '🎬', label: 'Videos',    href: '/dashboard', active: false },
    { icon: '📊', label: 'Analytics', href: '/analytics', active: true  },
    { icon: '⚙️', label: 'Settings',  href: '/settings',  active: false },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
      <aside style={{ width: 240, borderRight: '1px solid var(--border)', padding: '24px 16px', background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <a href="/" style={{ textDecoration: 'none', fontFamily: 'var(--font-syne)', fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'block', marginBottom: 32, padding: '0 8px' }}>
          Vid<span style={{ color: 'var(--accent)' }}>Pitch</span>
        </a>
        {sidebarItems.map(item => (
          <a key={item.label} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: item.active ? 600 : 400, color: item.active ? 'var(--text)' : 'var(--muted)', background: item.active ? 'var(--surface2)' : 'transparent' }}>
            <span>{item.icon}</span>{item.label}
          </a>
        ))}
      </aside>

      <div style={{ flex: 1, padding: '48px 60px' }}>
        <h1 style={{ fontFamily: 'var(--font-syne)', fontSize: 32, fontWeight: 800, letterSpacing: '-1px', marginBottom: 6 }}>Analytics</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 48 }}>Track your campaign performance.</p>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 48 }}>
          {[
            { label: 'Total Campaigns', value: stats.campaigns, icon: '📁' },
            { label: 'Total Videos',    value: stats.totalVideos, icon: '🎬' },
            { label: 'Completed',       value: stats.completed,   icon: '✅' },
            { label: 'Total Views',     value: stats.totalViews,  icon: '👁' },
          ].map(s => (
            <div key={s.label} style={{ padding: '24px', border: '1px solid var(--border)', borderRadius: 16, background: 'var(--surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>{s.label}</span>
                <span style={{ fontSize: 20 }}>{s.icon}</span>
              </div>
              <p style={{ fontFamily: 'var(--font-syne)', fontSize: 36, fontWeight: 800 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Campaign table */}
        <div style={{ border: '1px solid var(--border)', borderRadius: 16, background: 'var(--surface)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: 16, fontWeight: 700 }}>Campaign Breakdown</h2>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Campaign', 'Videos', 'Completed', 'Progress', 'Created'].map(h => (
                  <th key={h} style={{ padding: '12px 24px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c: any) => {
                const pct = c.totalVideos > 0 ? Math.round((c.completedVideos / c.totalVideos) * 100) : 0
                return (
                  <tr key={c._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 24px', fontSize: 14, fontWeight: 500 }}>{c.name}</td>
                    <td style={{ padding: '16px 24px', fontSize: 14, color: 'var(--muted)' }}>{c.totalVideos}</td>
                    <td style={{ padding: '16px 24px', fontSize: 14, color: 'var(--muted)' }}>{c.completedVideos}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1, height: 6, background: 'var(--surface2)', borderRadius: 3 }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--muted)', minWidth: 32 }}>{pct}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: 13, color: 'var(--muted)' }}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}