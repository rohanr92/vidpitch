'use client'
import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import { useAuth } from '@/context/AuthContext'

type Video = {
  _id: string
  url: string
  status: string
  outputUrl: string
  previewGif: string
  error: string
  createdAt: string
  prospectData?: Record<string, string>
  views: number
  watchSeconds: number
  lastViewedAt?: string
}

const statusMap: Record<string, { bg: string; color: string; label: string }> = {
  completed:  { bg: 'rgba(0,229,160,0.1)',    color: '#00E5A0', label: 'Done' },
  processing: { bg: 'rgba(0,102,255,0.1)',    color: '#4da6ff', label: 'Processing' },
  queued:     { bg: 'rgba(255,255,255,0.06)', color: '#6B7280', label: 'Queued' },
  failed:     { bg: 'rgba(255,80,80,0.1)',    color: '#ff6b6b', label: 'Failed' },
}

export default function CampaignDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)
  const [activeGif, setActiveGif] = useState<string | null>(null)

  useEffect(() => {
    if (!params.id) return
    const load = () => {
      fetch(`/api/videos?campaignId=${params.id}`)
        .then(r => r.json())
        .then(data => {
          setVideos(data.videos || [])
          setLoading(false)
        })
    }
    load()
    const interval = setInterval(load, 5000)
    return () => clearInterval(interval)
  }, [params.id])

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const getGifEmbedCode = (video: Video) => {
    return `<a href="${video.outputUrl}" target="_blank">
  <img src="${video.previewGif}" alt="Watch personalized video" width="480" style="border-radius:8px;cursor:pointer;" />
</a>`
  }

  const copyGifForEmail = async (video: Video, id: string) => {
    try {
      const htmlContent = `<a href="${video.outputUrl}" target="_blank" style="display:inline-block;text-decoration:none;">
  <img src="${video.previewGif}" alt="Watch personalized video" width="480" style="border-radius:8px;cursor:pointer;display:block;" />
  <div style="margin-top:6px;font-size:13px;color:#6B7280;font-family:sans-serif;">▶ Click to watch personalized video</div>
</a>`
      const htmlBlob = new Blob([htmlContent], { type: 'text/html' })
      const textBlob = new Blob([video.outputUrl], { type: 'text/plain' })
      await navigator.clipboard.write([
        new ClipboardItem({ 'text/html': htmlBlob, 'text/plain': textBlob })
      ])
      setCopied(id)
      setTimeout(() => setCopied(null), 2500)
    } catch (err) {
      copyToClipboard(getGifEmbedCode(video), id)
    }
  }

  const getVideoEmbedCode = (video: Video) => {
    return `<video width="480" controls style="border-radius:8px;">
  <source src="${video.outputUrl}" type="video/mp4" />
</video>`
  }

  // ── DOWNLOAD EXCEL — preserves prospect data + adds video/embed columns ──
  const downloadExcel = () => {
    if (videos.filter(v => v.status === 'completed').length === 0) return

    const rows = videos.map(video => {
      const base = { ...(video.prospectData || {}) }
      return {
        ...base,
        'Website URL': video.url,
        'Status': video.status,
        'Video URL': video.outputUrl || '',
        'GIF Preview URL': video.previewGif || '',
        'Email HTML (paste in Gmail to show GIF)': video.outputUrl
          ? `<a href="${video.outputUrl}" target="_blank" style="display:inline-block;text-decoration:none;"><img src="${video.previewGif}" alt="Watch personalized video" width="480" style="border-radius:8px;cursor:pointer;display:block;" /><div style="margin-top:6px;font-size:13px;color:#6B7280;font-family:sans-serif;">▶ Click to watch personalized video</div></a>`
          : '',
        'Video Embed (for websites)': video.outputUrl
          ? `<video width="480" controls style="border-radius:8px;"><source src="${video.outputUrl}" type="video/mp4" /></video>`
          : '',
      }
    })

    const worksheet = XLSX.utils.json_to_sheet(rows)
    const colWidths = Object.keys(rows[0] || {}).map(key => ({ wch: Math.max(key.length + 4, 22) }))
    worksheet['!cols'] = colWidths

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Campaign Videos')
    XLSX.writeFile(workbook, `vidpitch-campaign-${params.id}.xlsx`)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>

      {/* Sidebar */}
      <aside style={{ width: 240, borderRight: '1px solid var(--border)', padding: '24px 16px', background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <a href="/" style={{ textDecoration: 'none', fontFamily: 'var(--font-syne)', fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'block', marginBottom: 32, padding: '0 8px' }}>
          Vid<span style={{ color: 'var(--accent)' }}>Pitch</span>
        </a>
        {[
          { icon: '◼', label: 'Dashboard',  href: '/dashboard', active: false },
{ icon: '📁', label: 'Campaigns', href: '/dashboard', active: true  },
{ icon: '🎬', label: 'Videos',    href: '/dashboard', active: false },
{ icon: '📊', label: 'Analytics', href: '/analytics', active: false },
{ icon: '⚙️', label: 'Settings',  href: '/settings',  active: false },
        ].map(item => (
          <a key={item.label} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: item.active ? 600 : 400, color: item.active ? 'var(--text)' : 'var(--muted)', background: item.active ? 'var(--surface2)' : 'transparent' }}>
            <span>{item.icon}</span>{item.label}
          </a>
        ))}
      </aside>

      {/* Main */}
      <div style={{ flex: 1, padding: '36px 40px', overflowY: 'auto' }}>

        {/* ── HEADER with Download Excel button ── */}
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <a href="/dashboard" style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none' }}>← Back to dashboard</a>
            <h1 style={{ fontFamily: 'var(--font-syne)', fontSize: 28, fontWeight: 800, letterSpacing: '-1px', marginTop: 12, marginBottom: 4 }}>
              Campaign Videos
            </h1>
            <p style={{ fontSize: 14, color: 'var(--muted)' }}>
              {videos.length} videos · Auto-refreshing every 5 seconds
            </p>
          </div>

          {videos.some(v => v.status === 'completed') && (
            <button
              onClick={downloadExcel}
              style={{
                marginTop: 36,
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 20px',
                background: 'rgba(0,229,160,0.08)',
                border: '1px solid rgba(0,229,160,0.3)',
                borderRadius: 10, cursor: 'pointer',
                color: 'var(--accent)', fontSize: 14, fontWeight: 600,
                fontFamily: 'var(--font-dm)',
              }}
            >
              📥 Download Excel
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 64, color: 'var(--muted)' }}>Loading videos...</div>
        ) : videos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 64 }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>⏳</p>
            <p style={{ fontFamily: 'var(--font-syne)', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Videos are being processed</p>
            <p style={{ fontSize: 14, color: 'var(--muted)' }}>This page will update automatically.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {videos.map(video => {
              const s = statusMap[video.status] || statusMap.queued
              return (
                <div key={video._id} style={{ border: '1px solid var(--border)', borderRadius: 16, background: 'var(--surface)', overflow: 'hidden' }}>

              {/* Top bar */}
<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <span style={{ fontSize: 16 }}>🌐</span>
    <div>
      <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{video.url}</p>
      <p style={{ fontSize: 12, color: 'var(--muted)' }}>
        {new Date(video.createdAt).toLocaleDateString()}
      </p>
    </div>
  </div>
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    {/* View stats */}
    {video.status === 'completed' && (
      <>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: 'var(--surface2)', borderRadius: 100, fontSize: 12, color: 'var(--muted)' }}>
          👁 {video.views || 0} view{video.views !== 1 ? 's' : ''}
        </div>
        {video.watchSeconds > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: 'var(--surface2)', borderRadius: 100, fontSize: 12, color: 'var(--muted)' }}>
            ⏱ {Math.floor((video.watchSeconds || 0) / 60)}m {(video.watchSeconds || 0) % 60}s watched
          </div>
        )}
        {/* Copy shareable link */}
        <button
          onClick={() => copyToClipboard(`${window.location.origin}/v/${video._id}`, `share_${video._id}`)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: copied === `share_${video._id}` ? 'rgba(0,229,160,0.1)' : 'var(--surface2)', border: `1px solid ${copied === `share_${video._id}` ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 100, fontSize: 12, color: copied === `share_${video._id}` ? 'var(--accent)' : 'var(--muted)', cursor: 'pointer', fontFamily: 'var(--font-dm)' }}
        >
          {copied === `share_${video._id}` ? '✓ Copied!' : '🔗 Copy link'}
        </button>
      </>
    )}
    <span style={{ padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  </div>
</div>

                  {/* Completed */}
                  {video.status === 'completed' && video.outputUrl && (
                    <div style={{ padding: 24 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

                        {/* Left — video player */}
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
                            Final Video
                          </p>
                          <video
                            controls
                            style={{ width: '100%', borderRadius: 10, border: '1px solid var(--border)', background: '#000' }}
                            src={video.outputUrl}
                          />
                          <button
                            onClick={() => copyToClipboard(video.outputUrl, `url_${video._id}`)}
                            style={{ marginTop: 10, width: '100%', padding: '9px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: copied === `url_${video._id}` ? 'var(--accent)' : 'var(--muted)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-dm)' }}
                          >
                            {copied === `url_${video._id}` ? '✓ Copied!' : '📋 Copy video URL'}
                          </button>
                        </div>

                        {/* Right — GIF preview + embed */}
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
                            Email GIF Preview
                          </p>

                          {video.previewGif ? (
                            <>
                              <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)', marginBottom: 10 }}>
                                <img src={video.previewGif} alt="Preview GIF" style={{ width: '100%', display: 'block' }} />
                                <div style={{ position: 'absolute', bottom: 8, right: 8, padding: '3px 8px', background: 'rgba(0,0,0,0.7)', borderRadius: 4, fontSize: 11, color: '#fff', fontWeight: 600 }}>
                                  GIF PREVIEW
                                </div>
                              </div>

                              <button
                                onClick={() => copyGifForEmail(video, `gmail_${video._id}`)}
                                style={{ width: '100%', padding: '9px', background: copied === `gmail_${video._id}` ? 'rgba(0,229,160,0.1)' : 'rgba(0,229,160,0.06)', border: `1px solid ${copied === `gmail_${video._id}` ? 'var(--accent)' : 'rgba(0,229,160,0.2)'}`, borderRadius: 8, color: copied === `gmail_${video._id}` ? 'var(--accent)' : '#00E5A0', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-dm)', fontWeight: 600, marginBottom: 8 }}
                              >
                                {copied === `gmail_${video._id}` ? '✓ Copied! Now paste in Gmail' : '📧 Copy for Gmail / Email'}
                              </button>

                              <button
                                onClick={() => copyToClipboard(getGifEmbedCode(video), `gif_${video._id}`)}
                                style={{ width: '100%', padding: '9px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: copied === `gif_${video._id}` ? 'var(--accent)' : 'var(--muted)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-dm)', marginBottom: 8 }}
                              >
                                {copied === `gif_${video._id}` ? '✓ Copied!' : '🎞️ Copy HTML embed code'}
                              </button>

                              <button
                                onClick={() => setActiveGif(activeGif === video._id ? null : video._id)}
                                style={{ width: '100%', padding: '9px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--muted)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-dm)' }}
                              >
                                {activeGif === video._id ? '▲ Hide embed code' : '▼ Show embed code'}
                              </button>

                              {activeGif === video._id && (
                                <div style={{ marginTop: 8, padding: 12, background: 'var(--surface2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                                  <pre style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0, fontFamily: 'monospace', lineHeight: 1.6 }}>
                                    {getGifEmbedCode(video)}
                                  </pre>
                                </div>
                              )}
                            </>
                          ) : (
                            <div style={{ padding: 24, background: 'var(--surface2)', borderRadius: 10, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
                              GIF preview generating...
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {video.status === 'processing' && (
                    <div style={{ padding: 32, textAlign: 'center' }}>
                      <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTop: '3px solid var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                      <p style={{ fontSize: 14, color: 'var(--muted)' }}>Recording and merging video...</p>
                    </div>
                  )}

                  {video.status === 'queued' && (
                    <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
                      ⏳ Waiting in queue...
                    </div>
                  )}

                  {video.status === 'failed' && (
                    <div style={{ padding: 24, background: 'rgba(255,80,80,0.05)', borderTop: '1px solid rgba(255,80,80,0.1)' }}>
                      <p style={{ fontSize: 13, color: '#ff6b6b' }}>❌ Failed: {video.error || 'Unknown error'}</p>
                    </div>
                  )}

                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}