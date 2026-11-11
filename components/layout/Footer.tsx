export default function Footer() {
  return (
    <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid var(--border)', padding: '40px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
        <a href="/" style={{ textDecoration: 'none', fontFamily: 'var(--font-syne)', fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>
          Vid<span style={{ color: 'var(--accent)' }}>Pitch</span>
        </a>
        <ul style={{ display: 'flex', gap: 24, listStyle: 'none' }}>
          {['Privacy','Terms','Status','Docs'].map(item => (
            <li key={item}><a href="#" style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none' }}>{item}</a></li>
          ))}
        </ul>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>© 2025 VidPitch. All rights reserved.</p>
      </div>
    </footer>
  )
}