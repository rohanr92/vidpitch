'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'
import { useAuth } from '@/context/AuthContext'
import Button from '@/components/ui/Button'

export default function NewCampaign() {
  const { user } = useAuth()
  const router = useRouter()
  const [parsedProspectData, setParsedProspectData] = useState<Record<string, string>[]>([])
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [name, setName] = useState('')
  const [video, setVideo] = useState<File | null>(null)
  const [urls, setUrls] = useState('')
  const [vDrag, setVDrag] = useState(false)
  const [fileDrag, setFileDrag] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [launching, setLaunching] = useState(false)
  const [error, setError] = useState('')
  const [urlInputMode, setUrlInputMode] = useState<'paste' | 'file'>('paste')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [parsedFileUrls, setParsedFileUrls] = useState<string[]>([])
  const [fileParseError, setFileParseError] = useState('')
  const vRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Final URL list — from paste OR from file
  const urlList = urlInputMode === 'paste'
    ? urls.split('\n').map(u => u.trim()).filter(u => u.startsWith('http'))
    : parsedFileUrls

  // Parse CSV or XLSX file
 // Parse CSV or XLSX file
  const handleFileUpload = async (file: File) => {
    setUploadedFile(file)
    setFileParseError('')
    setParsedFileUrls([])
    setParsedProspectData([])

    try {
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]
      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 })

      if (rows.length === 0) { setFileParseError('File is empty.'); return }

      const headerRow = rows[0].map((h: any) => String(h || '').toLowerCase().trim())
      const urlColumnNames = ['url', 'urls', 'website', 'websites', 'link', 'links', 'site', 'sites']
      let urlColIndex = -1

      for (const colName of urlColumnNames) {
        const idx = headerRow.indexOf(colName)
        if (idx !== -1) { urlColIndex = idx; break }
      }

      if (urlColIndex === -1) {
        for (let col = 0; col < (rows[0]?.length || 1); col++) {
          const hasUrls = rows.slice(1).some(row => String(row[col] || '').trim().startsWith('http'))
          if (hasUrls) { urlColIndex = col; break }
        }
      }

      if (urlColIndex === -1) urlColIndex = 0

      const startRow = String(rows[0][urlColIndex] || '').startsWith('http') ? 0 : 1
      // Get original headers for preserving prospect data
      const originalHeaders = startRow === 1 ? rows[0].map((h: any) => String(h || '')) : []

      const extracted: string[] = []
      const prospectRows: Record<string, string>[] = []

      rows.slice(startRow).forEach(row => {
        const url = String(row[urlColIndex] || '').trim()
        if (!url.startsWith('http')) return

        extracted.push(url)

        // Store all columns as key-value pairs
        const prospect: Record<string, string> = {}
        row.forEach((val: any, i: number) => {
          const key = originalHeaders[i] || `column_${i + 1}`
          prospect[key] = String(val || '')
        })
        prospectRows.push(prospect)
      })

      if (extracted.length === 0) {
        setFileParseError('No valid URLs found.')
        return
      }

      setParsedFileUrls(extracted)
      setParsedProspectData(prospectRows)
    } catch (err) {
      setFileParseError('Could not read file. Please use a valid CSV or XLSX file.')
    }
  }

  const inp: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    color: 'var(--text)',
    fontSize: 15,
    fontFamily: 'var(--font-dm)',
    outline: 'none',
  }

  const handleLaunch = async () => {
    if (!user || !video) return
    setError('')
    setLaunching(true)

    try {
      setUploadProgress(10)
      const formData = new FormData()
      formData.append('video', video)

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadRes.ok) throw new Error('Upload failed')

      setUploadProgress(80)
      const { url: videoUrl } = await uploadRes.json()
      setUploadProgress(100)

      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          name,
          urls: urlList,
          videoUrl,
          prospectData: urlInputMode === 'file' ? parsedProspectData : [],
        }),
      })

      if (!res.ok) throw new Error('Failed to save campaign')

      router.push('/dashboard')
    } catch (err) {
      console.error(err)
      setError('Something went wrong. Please try again.')
      setLaunching(false)
      setUploadProgress(0)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>

      {/* SIDEBAR */}
      <aside style={{
        width: 240,
        borderRight: '1px solid var(--border)',
        padding: '24px 16px',
        background: 'var(--surface)',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}>
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
          <a key={item.label} href={item.href} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 8, textDecoration: 'none',
            fontSize: 14, fontWeight: item.active ? 600 : 400,
            color: item.active ? 'var(--text)' : 'var(--muted)',
            background: item.active ? 'var(--surface2)' : 'transparent',
          }}>
            <span>{item.icon}</span>{item.label}
          </a>
        ))}
      </aside>

      {/* MAIN */}
      <div style={{ flex: 1, padding: '48px 60px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* Page title */}
        <div style={{ width: '100%', maxWidth: 640, marginBottom: 48 }}>
          <a href="/dashboard" style={{ display: 'inline-flex', gap: 6, fontSize: 13, color: 'var(--muted)', textDecoration: 'none', marginBottom: 20 }}>
            ← Back to dashboard
          </a>
          <h1 style={{ fontFamily: 'var(--font-syne)', fontSize: 32, fontWeight: 800, letterSpacing: '-1px', marginBottom: 6 }}>
            New Campaign
          </h1>
          <p style={{ fontSize: 15, color: 'var(--muted)' }}>
            Upload your video and websites to generate personalized pitches.
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 48 }}>
          {[{ n: 1, l: 'Name' }, { n: 2, l: 'Video' }, { n: 3, l: 'URLs' }].map((s, i) => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: step > s.n ? 'pointer' : 'default' }}
                onClick={() => step > s.n && setStep(s.n as 1 | 2 | 3)}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, border: '2px solid',
                  borderColor: step >= s.n ? 'var(--accent)' : 'var(--border)',
                  background: step > s.n ? 'var(--accent)' : 'transparent',
                  color: step > s.n ? '#000' : step === s.n ? 'var(--accent)' : 'var(--muted)',
                  transition: 'all 0.2s',
                }}>
                  {step > s.n ? '✓' : s.n}
                </div>
                <span style={{ fontSize: 14, fontWeight: 500, color: step === s.n ? 'var(--text)' : 'var(--muted)' }}>
                  {s.l}
                </span>
              </div>
              {i < 2 && (
                <div style={{ width: 60, height: 1, background: step > s.n ? 'var(--accent)' : 'var(--border)', margin: '0 16px', transition: 'background 0.3s' }} />
              )}
            </div>
          ))}
        </div>

        {/* Step card */}
        <div style={{ width: '100%', maxWidth: 640 }}>
          <div style={{ padding: 40, border: '1px solid var(--border)', borderRadius: 20, background: 'var(--surface)' }}>

            {/* STEP 1 */}
            {step === 1 && (
              <>
                <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                  Name your campaign
                </h2>
                <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 28 }}>
                  Give it a descriptive name so you can find it later.
                </p>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--muted)', marginBottom: 8 }}>
                  Campaign name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. SaaS Founders - Wave 1"
                  style={{ ...inp, marginBottom: 32 }}
                  onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                  onKeyDown={e => e.key === 'Enter' && name && setStep(2)}
                />
                <button
  disabled={!name}
  onClick={() => setStep(2)}
  style={{
    width: '100%', padding: '14px', borderRadius: 12, border: 'none',
    background: name ? 'var(--accent)' : 'var(--border)',
    color: name ? '#000' : 'var(--muted)',
    fontSize: 15, fontWeight: 700, cursor: name ? 'pointer' : 'not-allowed',
    fontFamily: 'var(--font-dm)', transition: 'all 0.2s',
  }}
>
  Continue →
</button>
              </>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <>
                <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                  Upload your video
                </h2>
                <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 28 }}>
                  This talking-head video will appear in the corner of each output.
                </p>

                <div
                  onDragOver={e => { e.preventDefault(); setVDrag(true) }}
                  onDragLeave={() => setVDrag(false)}
                  onDrop={e => {
                    e.preventDefault()
                    setVDrag(false)
                    const f = e.dataTransfer.files[0]
                    if (f?.type.startsWith('video/')) setVideo(f)
                  }}
                  onClick={() => vRef.current?.click()}
                  style={{
                    border: `2px dashed ${vDrag ? 'var(--accent)' : video ? 'rgba(0,229,160,0.4)' : 'var(--border)'}`,
                    borderRadius: 16, padding: '48px 24px', textAlign: 'center',
                    cursor: 'pointer', background: video ? 'rgba(0,229,160,0.02)' : 'var(--surface2)',
                    transition: 'all 0.2s', marginBottom: 28,
                  }}
                >
                  <input
                    ref={vRef}
                    type="file"
                    accept="video/*"
                    style={{ display: 'none' }}
                    onChange={e => { const f = e.target.files?.[0]; if (f) setVideo(f) }}
                  />
                  {video ? (
                    <>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                      <p style={{ fontFamily: 'var(--font-syne)', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                        {video.name}
                      </p>
                      <p style={{ fontSize: 13, color: 'var(--muted)' }}>
                        {(video.size / 1024 / 1024).toFixed(1)} MB · Click to replace
                      </p>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 40, marginBottom: 16 }}>🎥</div>
                      <p style={{ fontFamily: 'var(--font-syne)', fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
                        Drop your video here
                      </p>
                      <p style={{ fontSize: 14, color: 'var(--muted)' }}>
                        or click to browse — MP4, MOV · Max 500MB
                      </p>
                    </>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <Button variant="ghost" size="lg" onClick={() => setStep(1)}>← Back</Button>
                  <Button variant="primary" size="lg" fullWidth disabled={!video} onClick={() => setStep(3)}>
                    Continue →
                  </Button>
                </div>
              </>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <>
                <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                  Add prospect websites
                </h2>
                <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 28 }}>
                  Paste URLs manually or upload a CSV/XLSX file.
                </p>

                {/* Toggle */}
                <div style={{ display: 'flex', gap: 4, background: 'var(--surface2)', padding: 4, borderRadius: 10, marginBottom: 24 }}>
                  {(['paste', 'file'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setUrlInputMode(t)}
                      style={{
                        flex: 1, padding: '8px', borderRadius: 7, border: 'none',
                        cursor: 'pointer', fontSize: 13, fontWeight: 500,
                        fontFamily: 'var(--font-dm)',
                        background: urlInputMode === t ? 'var(--surface)' : 'transparent',
                        color: urlInputMode === t ? 'var(--text)' : 'var(--muted)',
                      }}
                    >
                      {t === 'paste' ? '✏️ Paste URLs' : '📁 Upload CSV / XLSX'}
                    </button>
                  ))}
                </div>

                {/* PASTE MODE */}
                {urlInputMode === 'paste' && (
                  <>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--muted)', marginBottom: 8 }}>
                      Paste URLs (one per line)
                    </label>
                    <textarea
                      value={urls}
                      onChange={e => setUrls(e.target.value)}
                      placeholder={'https://stripe.com\nhttps://notion.so\nhttps://linear.app'}
                      rows={8}
                      style={{
                        width: '100%', padding: '14px 16px',
                        background: 'var(--surface2)', border: '1px solid var(--border)',
                        borderRadius: 12, color: 'var(--text)', fontSize: 14,
                        fontFamily: 'monospace', outline: 'none', resize: 'vertical',
                        marginBottom: 12, lineHeight: 1.8,
                        boxSizing: 'border-box',
                      }}
                      onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                      onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                    />
                  </>
                )}

                {/* FILE UPLOAD MODE */}
                {urlInputMode === 'file' && (
                  <>
                    <div
                      onDragOver={e => { e.preventDefault(); setFileDrag(true) }}
                      onDragLeave={() => setFileDrag(false)}
                      onDrop={e => {
                        e.preventDefault()
                        setFileDrag(false)
                        const f = e.dataTransfer.files[0]
                        if (f) handleFileUpload(f)
                      }}
                      onClick={() => fileRef.current?.click()}
                      style={{
                        border: `2px dashed ${fileDrag ? 'var(--accent)' : uploadedFile ? 'rgba(0,229,160,0.4)' : 'var(--border)'}`,
                        borderRadius: 16, padding: '40px 24px', textAlign: 'center',
                        cursor: 'pointer',
                        background: uploadedFile ? 'rgba(0,229,160,0.02)' : 'var(--surface2)',
                        transition: 'all 0.2s', marginBottom: 16,
                      }}
                    >
                      <input
                        ref={fileRef}
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        style={{ display: 'none' }}
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f) }}
                      />
                      {uploadedFile ? (
                        <>
                          <div style={{ fontSize: 36, marginBottom: 10 }}>✅</div>
                          <p style={{ fontFamily: 'var(--font-syne)', fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
                            {uploadedFile.name}
                          </p>
                          <p style={{ fontSize: 13, color: 'var(--muted)' }}>
                            {(uploadedFile.size / 1024).toFixed(1)} KB · Click to replace
                          </p>
                        </>
                      ) : (
                        <>
                          <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
                          <p style={{ fontFamily: 'var(--font-syne)', fontSize: 15, fontWeight: 700, marginBottom: 6 }}>
                            Drop your CSV or XLSX here
                          </p>
                          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
                            or click to browse
                          </p>
                          <div style={{ display: 'inline-block', padding: '8px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--muted)' }}>
                            Supported: .csv · .xlsx · .xls
                          </div>
                        </>
                      )}
                    </div>

                    {/* Format hint */}
                    <div style={{ padding: '12px 16px', background: 'rgba(0,102,255,0.06)', border: '1px solid rgba(0,102,255,0.15)', borderRadius: 10, marginBottom: 16 }}>
                      <p style={{ fontSize: 12, color: '#4da6ff', fontWeight: 600, marginBottom: 6 }}>📋 File format</p>
                      <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
                        Your file needs a column with URLs. Column can be named: <strong style={{ color: 'var(--text)' }}>url, URL, website, Website, link, Link</strong> — or just put URLs in the first column.
                      </p>
                      <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--surface2)', borderRadius: 6, fontFamily: 'monospace', fontSize: 11, color: 'var(--muted)' }}>
                        url<br/>
                        https://stripe.com<br/>
                        https://notion.so<br/>
                        https://linear.app
                      </div>
                    </div>

                    {/* Parse error */}
                    {fileParseError && (
                      <div style={{ padding: '12px 16px', background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.2)', borderRadius: 10, fontSize: 13, color: '#ff6b6b', marginBottom: 16 }}>
                        ❌ {fileParseError}
                      </div>
                    )}

                    {/* Parsed preview */}
                    {parsedFileUrls.length > 0 && (
                      <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
                        <div style={{ padding: '12px 16px', background: 'var(--surface2)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>
                            ✓ {parsedFileUrls.length} URLs found
                          </span>
                          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Preview (first 5)</span>
                        </div>
                        {parsedFileUrls.slice(0, 5).map((u, i) => (
                          <div key={i} style={{ padding: '10px 16px', borderBottom: i < 4 && i < parsedFileUrls.length - 1 ? '1px solid var(--border)' : 'none', fontSize: 13, fontFamily: 'monospace', color: 'var(--muted)' }}>
                            {u}
                          </div>
                        ))}
                        {parsedFileUrls.length > 5 && (
                          <div style={{ padding: '10px 16px', fontSize: 12, color: 'var(--muted)', background: 'var(--surface2)' }}>
                            + {parsedFileUrls.length - 5} more URLs
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* URL count badge */}
                {urlList.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, padding: '10px 14px', background: 'rgba(0,229,160,0.06)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 8 }}>
                    <span style={{ color: 'var(--accent)' }}>✓</span>
                    <span style={{ fontSize: 14 }}>
                      <strong style={{ color: 'var(--accent)' }}>{urlList.length} URLs</strong>
                      <span style={{ color: 'var(--muted)' }}> ready to process</span>
                    </span>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div style={{ padding: '12px 16px', background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.25)', borderRadius: 10, fontSize: 14, color: '#ff6b6b', marginBottom: 16 }}>
                    {error}
                  </div>
                )}

                {/* Upload progress */}
                {launching && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                        {uploadProgress < 100 ? `Uploading video... ${uploadProgress}%` : 'Saving campaign...'}
                      </span>
                      <span style={{ fontSize: 13, color: 'var(--accent)' }}>{uploadProgress}%</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 4, background: 'var(--surface2)' }}>
                      <div style={{
                        height: '100%', borderRadius: 4,
                        width: `${uploadProgress}%`,
                        background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
                        transition: 'width 0.3s',
                      }} />
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 12 }}>
                  <Button variant="ghost" size="lg" onClick={() => setStep(2)} disabled={launching}>
                    ← Back
                  </Button>
                  <Button
                    variant="primary" size="lg" fullWidth
                    disabled={urlList.length === 0 || launching}
                    onClick={handleLaunch}
                  >
                    {launching ? 'Launching...' : `🚀 Launch ${urlList.length > 0 ? urlList.length : ''} videos`}
                  </Button>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}