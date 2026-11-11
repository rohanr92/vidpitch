'use client'
import { useEffect, useState } from 'react'
import Button from '../ui/Button'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: '18px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
      background: scrolled ? 'rgba(8,10,15,0.85)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      transition: 'all 0.3s ease',
    }}>
      <a href="/" style={{ textDecoration: 'none', fontFamily: 'var(--font-syne)', fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text)' }}>
        Vid<span style={{ color: 'var(--accent)' }}>Pitch</span>
      </a>
      <ul style={{ display: 'flex', gap: 32, listStyle: 'none' }}>
        {[['How it works','#how'],['Features','#features'],['Pricing','#pricing']].map(([label, href]) => (
          <li key={label}><a href={href} style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>{label}</a></li>
        ))}
      </ul>
      <div style={{ display: 'flex', gap: 10 }}>
        <Button variant="ghost" size="sm" href="/login">Sign in</Button>
        <Button variant="primary" size="sm" href="/signup">Get started free</Button>
      </div>
    </nav>
  )
}