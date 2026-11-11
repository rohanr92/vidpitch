'use client'
import { useEffect, useState, useRef } from 'react'

type Video = {
    _id: string
    url: string
    outputUrl: string
    previewGif: string
    status: string
    prospectData?: Record<string, string>
    views: number
    watchSeconds: number
}

type UserProfile = {
    name: string
    email: string
}

export default function VideoLandingPage({ params }: { params: { videoId: string } }) {
    const [video, setVideo] = useState<Video | null>(null)
    const [bookingUrl, setBookingUrl] = useState('#')
    const [senderName, setSenderName] = useState('')
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)
    const [playing, setPlaying] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)
    const watchStartRef = useRef<number | null>(null)
    const trackedViewRef = useRef(false)

    useEffect(() => {
        fetch(`/api/videos?videoId=${params.videoId}`)
            .then(r => r.json())
            .then(data => {
                if (!data.video) { setNotFound(true); setLoading(false); return }
                setVideo(data.video)
                // Load sender's settings
                fetch(`/api/settings?userId=${data.video.userId}`)
                    .then(r => r.json())
                    .then(s => {
                        if (s.settings?.calendlyUrl) setBookingUrl(s.settings.calendlyUrl)
                        if (s.settings?.displayName) setSenderName(s.settings.displayName)
                    })
                setLoading(false)
            })
            .catch(() => { setNotFound(true); setLoading(false) })
    }, [params.videoId])

    // Track view on page load (count as a view)
    useEffect(() => {
        if (!video || trackedViewRef.current) return
        trackedViewRef.current = true
        fetch('/api/videos/view', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ videoId: params.videoId }),
        })
    }, [video])

    // Track watch time when user leaves
    useEffect(() => {
        const handleUnload = () => {
            if (watchStartRef.current) {
                const seconds = Math.floor((Date.now() - watchStartRef.current) / 1000)
                if (seconds > 2) {
                    navigator.sendBeacon('/api/videos/view', JSON.stringify({
                        videoId: params.videoId,
                        watchSeconds: seconds,
                    }))
                }
            }
        }
        window.addEventListener('beforeunload', handleUnload)
        return () => window.removeEventListener('beforeunload', handleUnload)
    }, [params.videoId])

    const handlePlay = () => {
        setPlaying(true)
        watchStartRef.current = Date.now()
    }

    const handlePause = () => {
        if (watchStartRef.current) {
            const seconds = Math.floor((Date.now() - watchStartRef.current) / 1000)
            if (seconds > 2) {
                fetch('/api/videos/view', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ videoId: params.videoId, watchSeconds: seconds }),
                })
            }
            watchStartRef.current = null
        }
    }

    const prospectName = video?.prospectData?.['first name'] ||
        video?.prospectData?.['First Name'] ||
        video?.prospectData?.['name'] ||
        video?.prospectData?.['Name'] ||
        ''

    const company = video?.prospectData?.['company'] ||
        video?.prospectData?.['Company'] ||
        video?.prospectData?.['company name'] ||
        ''

    if (loading) return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 40, height: 40, border: '3px solid #222', borderTop: '3px solid #00E5A0', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    )

    if (notFound) return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: 48 }}>🎬</p>
            <h1 style={{ color: '#fff', fontFamily: 'sans-serif', fontSize: 24, fontWeight: 700 }}>Video not found</h1>
            <p style={{ color: '#6B7280', fontFamily: 'sans-serif' }}>This link may have expired or been removed.</p>
        </div>
    )

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px 80px' }}>

            {/* Logo */}
            <div style={{ marginBottom: 40 }}>
                <a href="/" style={{ textDecoration: 'none', fontFamily: 'sans-serif', fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
                    Vid<span style={{ color: '#00E5A0' }}>Pitch</span>
                </a>
            </div>

            {/* Personalized greeting */}
            {(prospectName || company) && (
                <div style={{ marginBottom: 28, textAlign: 'center' }}>
                    <p style={{ fontSize: 14, color: '#6B7280', fontFamily: 'sans-serif', marginBottom: 6 }}>
                        A personal message for
                    </p>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', fontFamily: 'sans-serif', letterSpacing: '-0.5px' }}>
                        {prospectName}{prospectName && company ? ' at ' : ''}{company}
                    </h1>
                </div>
            )}

            {!prospectName && !company && (
                <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', fontFamily: 'sans-serif', marginBottom: 28, textAlign: 'center' }}>
                    A personal video for you 👋
                </h1>
            )}

            {/* Video player */}
            <div style={{ width: '100%', maxWidth: 780, borderRadius: 16, overflow: 'hidden', border: '1px solid #1f1f1f', background: '#000', position: 'relative', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}>
                {video?.outputUrl ? (
                    <video
                        ref={videoRef}
                        src={video.outputUrl}
                        controls
                        autoPlay={false}
                        onPlay={handlePlay}
                        onPause={handlePause}
                        onEnded={handlePause}
                        style={{ width: '100%', display: 'block', borderRadius: 16 }}
                        poster={video.previewGif || undefined}
                    />
                ) : (
                    <div style={{ padding: 64, textAlign: 'center', color: '#6B7280', fontFamily: 'sans-serif' }}>
                        Video is still processing...
                    </div>
                )}
            </div>

            {/* Website pill */}
            {video?.url && (
                <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: '#111', border: '1px solid #1f1f1f', borderRadius: 100 }}>
                    <span style={{ fontSize: 14 }}>🌐</span>
                    <span style={{ fontSize: 13, color: '#6B7280', fontFamily: 'sans-serif' }}>{video.url}</span>
                </div>
            )}

            {/* CTA card */}
            <div style={{ marginTop: 40, width: '100%', maxWidth: 780, padding: '32px 36px', background: '#111', border: '1px solid #1f1f1f', borderRadius: 20, textAlign: 'center' }}>
                <p style={{ fontSize: 18, fontWeight: 700, color: '#fff', fontFamily: 'sans-serif', marginBottom: 8 }}>
                    Interested? Let's talk 👋
                </p>
                <p style={{ fontSize: 14, color: '#6B7280', fontFamily: 'sans-serif', marginBottom: 24 }}>
                    Click below to book a quick call and see how we can help.
                </p>

                <a href="#"
                    style={{ display: 'inline-block', padding: '14px 36px', background: '#00E5A0', color: '#000', fontFamily: 'sans-serif', fontWeight: 700, fontSize: 15, borderRadius: 10, textDecoration: 'none', transition: 'opacity 0.2s' }}
                    onMouseOver={e => (e.currentTarget.style.opacity = '0.85')}
                    onMouseOut={e => (e.currentTarget.style.opacity = '1')}
                >
                     📅 Book a call{senderName ? ` with ${senderName}` : ''}
                </a>
                <p style={{ marginTop: 16, fontSize: 12, color: '#374151', fontFamily: 'sans-serif' }}>
                    Sent via VidPitch · Personalized video outreach
                </p>
            </div>

        </div>
    )
}