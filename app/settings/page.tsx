'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'

export default function SettingsPage() {
  const { user } = useAuth()
  const [calendlyUrl, setCalendlyUrl] = useState('')
  const [name, setName] = useState('')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState({ notifyCampaignComplete: true, notifyVideoWatched: true })
  const [integrations, setIntegrations] = useState({ hubspot: false, salesforce: false, saleshandy: false })

  // Saleshandy modal state
  const [showSaleshandyModal, setShowSaleshandyModal] = useState(false)
  const [shApiKey, setShApiKey] = useState('')
  const [shSequences, setShSequences] = useState<any[]>([])
  const [shDefaultStepId, setShDefaultStepId] = useState('')
  const [shHotStepId, setShHotStepId] = useState('')
  const [shLoading, setShLoading] = useState(false)
  const [shError, setShError] = useState('')
  const [shStep, setShStep] = useState<'key' | 'sequences'>('key')

  useEffect(() => {
    if (!user) return

    // Check for OAuth callback result (HubSpot)
    const params = new URLSearchParams(window.location.search)
    const connected = params.get('connected')
    if (connected) {
      setIntegrations(prev => ({ ...prev, [connected]: true }))
      window.history.replaceState({}, '', '/settings')
    }

    fetch(`/api/settings?userId=${user.uid}`)
      .then(r => r.json())
      .then(data => {
        setCalendlyUrl(data.settings?.calendlyUrl || '')
        setName(data.settings?.displayName || '')
        setNotifications(data.settings?.notifications || { notifyCampaignComplete: true, notifyVideoWatched: true })
        setLoading(false)
      })

    fetch(`/api/integrations/status?userId=${user.uid}`)
      .then(r => r.json())
      .then(data => {
        setIntegrations(prev => ({ ...prev, ...(data.integrations || {}) }))
      })
  }, [user])

  const handleSave = async () => {
    if (!user) return
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.uid, displayName: name, calendlyUrl, notifications }),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // Saleshandy: verify API key and load sequences
  const handleSaleshandyApiKey = async () => {
    if (!shApiKey.trim()) return
    setShLoading(true)
    setShError('')
    try {
      // First connect with just the API key to verify it
      const res = await fetch('/api/integrations/saleshandy/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.uid, apiKey: shApiKey }),
      })
      const data = await res.json()
      if (!res.ok) {
        setShError(data.error || 'Invalid API key')
        setShLoading(false)
        return
      }

      // Load sequences
      const seqRes = await fetch(`/api/integrations/saleshandy/sequences?userId=${user?.uid}`)
      const seqData = await seqRes.json()
      setShSequences(seqData.sequences || [])
      setShStep('sequences')
    } catch (err) {
      setShError('Connection failed. Check your API key.')
    }
    setShLoading(false)
  }

  // Saleshandy: save sequence step selections
  const handleSaleshandySave = async () => {
    if (!shDefaultStepId) {
      setShError('Please select a default sequence step')
      return
    }
    setShLoading(true)
    await fetch('/api/integrations/saleshandy/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user?.uid,
        apiKey: shApiKey,
        defaultSequenceStepId: shDefaultStepId,
        hotSequenceStepId: shHotStepId,
      }),
    })
    setIntegrations(prev => ({ ...prev, saleshandy: true }))
    setShowSaleshandyModal(false)
    setShStep('key')
    setShLoading(false)
  }

  const crmList = [
    { key: 'hubspot',    name: 'HubSpot',    logo: '🟠', desc: 'Log video views as timeline notes on contacts', oauth: true },
    { key: 'saleshandy', name: 'Saleshandy', logo: '📧', desc: 'Auto-add prospects to sequences, trigger hot follow-ups on watch', oauth: false },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>

      {/* Saleshandy Modal */}
      {showSaleshandyModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 36, width: 480, maxWidth: '90vw' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>📧</span>
                <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: 18, fontWeight: 700 }}>Connect Saleshandy</h2>
              </div>
              <button onClick={() => { setShowSaleshandyModal(false); setShStep('key'); setShError('') }}
                style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 20 }}>✕</button>
            </div>

            {shStep === 'key' && (
              <>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.6 }}>
                  Go to Saleshandy → Settings → API Settings → Create New API Key. Paste it below.
                </p>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>Saleshandy API Key</label>
                <input
                  value={shApiKey}
                  onChange={e => setShApiKey(e.target.value)}
                  placeholder="sh_xxxxxxxxxxxxxxxxxxxxxxxx"
                  style={{ width: '100%', padding: '12px 14px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 12, fontFamily: 'monospace' }}
                />
                {shError && <p style={{ fontSize: 13, color: '#ef4444', marginBottom: 12 }}>{shError}</p>}
                <button
                  onClick={handleSaleshandyApiKey}
                  disabled={shLoading || !shApiKey.trim()}
                  style={{ width: '100%', padding: '12px', background: 'var(--accent)', border: 'none', borderRadius: 10, color: '#000', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: shLoading ? 0.6 : 1 }}
                >
                  {shLoading ? 'Verifying...' : 'Verify & Continue →'}
                </button>
              </>
            )}

            {shStep === 'sequences' && (
              <>
                <p style={{ fontSize: 13, color: 'var(--accent)', marginBottom: 20 }}>✓ API key verified! Now pick your sequences.</p>

                {/* Default sequence */}
                <label style={{ display: 'block', fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>
                  Default sequence step <span style={{ color: '#ef4444' }}>*</span>
                  <span style={{ fontSize: 11, marginLeft: 6 }}>(prospects added when campaign is created)</span>
                </label>
                <select
                  value={shDefaultStepId}
                  onChange={e => setShDefaultStepId(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 16 }}
                >
                  <option value="">Select sequence → step</option>
                  {shSequences.map(seq =>
                    seq.steps.map((step: any) => (
                      <option key={step.id} value={step.id}>
                        {seq.title} → Step {step.number}
                      </option>
                    ))
                  )}
                </select>

                {/* Hot sequence */}
                <label style={{ display: 'block', fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>
                  Hot follow-up sequence step
                  <span style={{ fontSize: 11, marginLeft: 6 }}>(triggered when prospect watches video)</span>
                </label>
                <select
                  value={shHotStepId}
                  onChange={e => setShHotStepId(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 20 }}
                >
                  <option value="">Optional — same as default</option>
                  {shSequences.map(seq =>
                    seq.steps.map((step: any) => (
                      <option key={step.id} value={step.id}>
                        {seq.title} → Step {step.number}
                      </option>
                    ))
                  )}
                </select>

                {shError && <p style={{ fontSize: 13, color: '#ef4444', marginBottom: 12 }}>{shError}</p>}

                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setShStep('key')}
                    style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--muted)', fontSize: 14, cursor: 'pointer' }}>
                    ← Back
                  </button>
                  <button onClick={handleSaleshandySave} disabled={shLoading || !shDefaultStepId}
                    style={{ flex: 2, padding: '12px', background: 'var(--accent)', border: 'none', borderRadius: 10, color: '#000', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: shLoading || !shDefaultStepId ? 0.6 : 1 }}>
                    {shLoading ? 'Saving...' : '✓ Connect Saleshandy'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside style={{ width: 240, borderRight: '1px solid var(--border)', padding: '24px 16px', background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <a href="/" style={{ textDecoration: 'none', fontFamily: 'var(--font-syne)', fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'block', marginBottom: 32, padding: '0 8px' }}>
          Vid<span style={{ color: 'var(--accent)' }}>Pitch</span>
        </a>
        {[
          { icon: '◼', label: 'Dashboard',  href: '/dashboard', active: false },
          { icon: '📁', label: 'Campaigns', href: '/dashboard', active: false },
          { icon: '🎬', label: 'Videos',    href: '/dashboard', active: false },
          { icon: '📊', label: 'Analytics', href: '/analytics', active: false },
          { icon: '⚙️', label: 'Settings',  href: '/settings',  active: true  },
        ].map(item => (
          <a key={item.label} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: item.active ? 600 : 400, color: item.active ? 'var(--text)' : 'var(--muted)', background: item.active ? 'var(--surface2)' : 'transparent' }}>
            <span>{item.icon}</span>{item.label}
          </a>
        ))}
      </aside>

      <div style={{ flex: 1, padding: '48px 60px', maxWidth: 720 }}>
        <h1 style={{ fontFamily: 'var(--font-syne)', fontSize: 28, fontWeight: 800, letterSpacing: '-1px', marginBottom: 6 }}>Settings</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 48 }}>Customize your VidPitch profile and landing pages.</p>

        {/* Profile */}
        <div style={{ padding: 32, border: '1px solid var(--border)', borderRadius: 16, background: 'var(--surface)', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Profile</h2>
          <label style={{ display: 'block', fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>Display name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name (shown on landing pages)"
            style={{ width: '100%', padding: '12px 14px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontSize: 14, fontFamily: 'var(--font-dm)', outline: 'none', marginBottom: 20, boxSizing: 'border-box' }} />
          <label style={{ display: 'block', fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>Email</label>
          <input value={user?.email || ''} disabled
            style={{ width: '100%', padding: '12px 14px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--muted)', fontSize: 14, fontFamily: 'var(--font-dm)', outline: 'none', boxSizing: 'border-box', opacity: 0.6 }} />
        </div>

        {/* Booking link */}
        <div style={{ padding: 32, border: '1px solid var(--border)', borderRadius: 16, background: 'var(--surface)', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Booking Link</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>This "Book a call" link appears on every video landing page you send to prospects.</p>
          <label style={{ display: 'block', fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>Calendly / Cal.com URL</label>
          <input value={calendlyUrl} onChange={e => setCalendlyUrl(e.target.value)} placeholder="https://calendly.com/yourname/30min"
            style={{ width: '100%', padding: '12px 14px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontSize: 14, fontFamily: 'var(--font-dm)', outline: 'none', boxSizing: 'border-box' }} />
          {calendlyUrl && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(0,229,160,0.06)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 8, fontSize: 13, color: 'var(--accent)' }}>
              ✓ Prospects will see a "Book a call" button linking to this URL
            </div>
          )}
        </div>

        {/* Notifications */}
        <div style={{ padding: 32, border: '1px solid var(--border)', borderRadius: 16, background: 'var(--surface)', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Email Notifications</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>Choose when to receive email alerts.</p>
          {[
            { key: 'notifyCampaignComplete', label: 'Campaign complete', desc: 'When all videos in a campaign finish processing' },
            { key: 'notifyVideoWatched',     label: 'Prospect watched video', desc: 'When a prospect opens and watches your video' },
          ].map(n => (
            <div key={n.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{n.label}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>{n.desc}</p>
              </div>
              <div onClick={() => setNotifications((prev: any) => ({ ...prev, [n.key]: !prev[n.key] }))}
                style={{ width: 44, height: 24, borderRadius: 12, background: (notifications as any)[n.key] ? 'var(--accent)' : 'var(--surface2)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', border: '1px solid var(--border)', flexShrink: 0 }}>
                <div style={{ position: 'absolute', top: 3, left: (notifications as any)[n.key] ? 22 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
              </div>
            </div>
          ))}
        </div>

        {/* CRM Integrations */}
        <div style={{ padding: 32, border: '1px solid var(--border)', borderRadius: 16, background: 'var(--surface)', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: 16, fontWeight: 700, marginBottom: 6 }}>CRM Integrations</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>Auto-log video activity and sync prospects to your tools.</p>

          {crmList.map(crm => (
            <div key={crm.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 24 }}>{crm.logo}</span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{crm.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--muted)' }}>{crm.desc}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {(integrations as any)[crm.key] ? (
                  <>
                    <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>✓ Connected</span>
                    <button
                      onClick={async () => {
                        await fetch('/api/integrations/status', {
                          method: 'DELETE',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ userId: user?.uid, provider: crm.key }),
                        })
                        setIntegrations(prev => ({ ...prev, [crm.key]: false }))
                      }}
                      style={{ padding: '6px 14px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--muted)', fontSize: 12, cursor: 'pointer' }}
                    >
                      Disconnect
                    </button>
                  </>
                ) : crm.oauth ? (
                  <a href={`/api/integrations/${crm.key}?userId=${user?.uid}`}
                    style={{ padding: '8px 18px', background: 'var(--accent)', color: '#000', fontWeight: 700, fontSize: 13, borderRadius: 8, textDecoration: 'none' }}>
                    Connect
                  </a>
                ) : (
                  <button onClick={() => { setShowSaleshandyModal(true); setShStep('key'); setShError('') }}
                    style={{ padding: '8px 18px', background: 'var(--accent)', color: '#000', fontWeight: 700, fontSize: 13, borderRadius: 8, border: 'none', cursor: 'pointer' }}>
                    Connect
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <button onClick={handleSave}
          style={{ padding: '12px 32px', background: saved ? 'rgba(0,229,160,0.15)' : 'var(--accent)', border: 'none', borderRadius: 10, color: saved ? 'var(--accent)' : '#000', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-dm)', transition: 'all 0.2s' }}>
          {saved ? '✓ Saved!' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}