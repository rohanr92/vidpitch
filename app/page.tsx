import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Button from '@/components/ui/Button'

function HeroSection() {
  return (
    <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '140px 24px 100px', zIndex: 1 }}>
      <div className="animate-fade-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', border: '1px solid rgba(0,229,160,0.3)', borderRadius: 100, background: 'rgba(0,229,160,0.06)', fontSize: 11, fontWeight: 600, color: 'var(--accent)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 32 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'pulseDot 2s infinite', display: 'inline-block' }} />
        Now in public beta
      </div>
      <h1 className="animate-fade-up delay-100" style={{ fontFamily: 'var(--font-syne)', fontSize: 'clamp(44px,7vw,88px)', fontWeight: 800, lineHeight: 1, letterSpacing: '-3px', maxWidth: 900, marginBottom: 24 }}>
        Send videos that<br />
        <span className="gradient-text">feel hand-made.</span>
      </h1>
      <p className="animate-fade-up delay-200" style={{ fontSize: 18, color: 'var(--muted)', maxWidth: 520, marginBottom: 44, fontWeight: 300, lineHeight: 1.7 }}>
        Upload your video once. We visit every prospect&apos;s website, scroll it like a human, and merge your face in — making each pitch feel personally crafted.
      </p>
      <div className="animate-fade-up delay-300" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <Button variant="primary" size="lg" href="/signup">Start for free →</Button>
        <Button variant="ghost" size="lg" href="#how">See how it works</Button>
      </div>
      <p className="animate-fade-up delay-400" style={{ marginTop: 20, fontSize: 13, color: 'var(--muted)' }}>
        No credit card required · <span style={{ color: 'var(--text)' }}>Free 10 videos to start</span>
      </p>

      {/* Demo window */}
      <div className="animate-fade-up delay-500" style={{ position: 'relative', maxWidth: 860, width: '100%', marginTop: 64 }}>
        <div style={{ position: 'absolute', inset: -40, background: 'radial-gradient(ellipse at 50% 50%, rgba(0,229,160,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', background: 'var(--surface)', boxShadow: '0 40px 100px rgba(0,0,0,0.6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
            <div style={{ width:10, height:10, borderRadius:'50%', background:'#FF5F56' }} />
            <div style={{ width:10, height:10, borderRadius:'50%', background:'#FEBC2E' }} />
            <div style={{ width:10, height:10, borderRadius:'50%', background:'#27C83F' }} />
            <div style={{ flex:1, margin:'0 12px', padding:'5px 12px', background:'rgba(255,255,255,0.04)', border:'1px solid var(--border)', borderRadius:6, fontSize:12, color:'var(--muted)', fontFamily:'monospace', textAlign:'left' }}>https://stripe.com</div>
          </div>
          <div style={{ position:'relative', width:'100%', height:380, background:'linear-gradient(180deg,#0d1117 0%,#161b26 100%)', overflow:'hidden' }}>
            <div style={{ animation:'scrollSite 6s 1.5s ease-in-out infinite alternate', padding:32 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:36 }}>
                <div style={{ width:80, height:12, background:'rgba(255,255,255,0.15)', borderRadius:4 }} />
                <div style={{ display:'flex', gap:12 }}>
                  {[1,2,3].map(i => <div key={i} style={{ width:50, height:8, background:'rgba(255,255,255,0.08)', borderRadius:4 }} />)}
                </div>
                <div style={{ width:70, height:28, background:'rgba(0,229,160,0.2)', borderRadius:6 }} />
              </div>
              <div style={{ width:380, height:32, background:'rgba(255,255,255,0.18)', borderRadius:6, marginBottom:12 }} />
              <div style={{ width:260, height:32, background:'rgba(255,255,255,0.1)', borderRadius:6, marginBottom:20 }} />
              <div style={{ width:300, height:10, background:'rgba(255,255,255,0.07)', borderRadius:4, marginBottom:8 }} />
              <div style={{ width:240, height:10, background:'rgba(255,255,255,0.05)', borderRadius:4, marginBottom:32 }} />
              <div style={{ display:'flex', gap:16 }}>
                {[1,2,3].map(i => <div key={i} style={{ flex:1, height:100, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10 }} />)}
              </div>
            </div>
            <div style={{ position:'absolute', top:16, right:16, display:'flex', alignItems:'center', gap:6, padding:'6px 12px', background:'rgba(255,60,60,0.15)', border:'1px solid rgba(255,60,60,0.3)', borderRadius:100, fontSize:11, fontWeight:600, color:'#ff6b6b' }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:'#ff4444', animation:'pulseDot 1s infinite', display:'inline-block' }} /> REC
            </div>
            <div style={{ position:'absolute', bottom:20, right:20, width:120, height:90, borderRadius:10, border:'2px solid var(--accent)', background:'linear-gradient(135deg,#1a2a1a,#0a1a0a)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 32px rgba(0,0,0,0.5)' }}>
              <div style={{ width:50, height:70, background:'linear-gradient(180deg,#c8a882 40%,#3d2b1f 100%)', borderRadius:'50% 50% 30% 30%', position:'relative' }}>
                <div style={{ position:'absolute', top:-8, left:8, width:34, height:34, borderRadius:'50%', background:'#d4a574' }} />
              </div>
            </div>
            <div style={{ position:'absolute', bottom:0, left:0, height:3, background:'linear-gradient(90deg,var(--accent),var(--accent2))', animation:'progressBar 6s 1.5s linear infinite', borderRadius:'0 2px 0 0' }} />
          </div>
        </div>
      </div>
    </section>
  )
}

function HowSection() {
  const steps = [
    { num:'01', icon:'📹', color:'rgba(0,229,160,0.1)', title:'Record your video', desc:'Record yourself once and upload any MP4 from your device.' },
    { num:'02', icon:'🌐', color:'rgba(0,102,255,0.1)', title:'Paste your URLs', desc:'Drop in a list of prospect URLs. Process hundreds at once.' },
    { num:'03', icon:'🤖', color:'rgba(139,92,246,0.1)', title:'We record each site', desc:'Our browser visits every URL, scrolls naturally, and records.' },
    { num:'04', icon:'🎬', color:'rgba(251,146,60,0.1)', title:'Videos are merged', desc:'Your face is composited over each recording via FFmpeg.' },
  ]
  return (
    <section id="how" style={{ position:'relative', zIndex:1, maxWidth:1100, margin:'0 auto', padding:'100px 24px' }}>
      <p style={{ fontSize:11, color:'var(--accent)', textTransform:'uppercase', letterSpacing:3, fontWeight:600, marginBottom:16 }}>How it works</p>
      <h2 style={{ fontFamily:'var(--font-syne)', fontSize:'clamp(32px,4vw,52px)', fontWeight:800, letterSpacing:'-2px', lineHeight:1.05, marginBottom:16 }}>From one video<br/>to hundreds of pitches</h2>
      <p style={{ fontSize:17, color:'var(--muted)', fontWeight:300, marginBottom:60 }}>Four steps. Fully automated.</p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:2, border:'1px solid var(--border)', borderRadius:16, overflow:'hidden' }}>
        {steps.map(s => (
          <div key={s.num} style={{ padding:'36px 32px', background:'var(--surface)', position:'relative' }}>
            <span style={{ fontFamily:'var(--font-syne)', fontSize:64, fontWeight:800, color:'rgba(255,255,255,0.04)', position:'absolute', top:20, right:24 }}>{s.num}</span>
            <div style={{ width:44, height:44, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, marginBottom:20, background:s.color }}>{s.icon}</div>
            <h3 style={{ fontFamily:'var(--font-syne)', fontSize:18, fontWeight:700, marginBottom:10 }}>{s.title}</h3>
            <p style={{ fontSize:14, color:'var(--muted)', lineHeight:1.7 }}>{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function FeaturesSection() {
  const features = [
    { icon:'⚡', title:'Bulk processing', desc:'Queue up to 500 URLs per campaign, processed in parallel.' },
    { icon:'🎥', title:'Picture-in-picture', desc:'Your face in the corner while the prospect\'s website scrolls.' },
    { icon:'🔗', title:'Shareable links', desc:'Every video gets a unique link. Embed in email or LinkedIn.' },
    { icon:'📊', title:'View tracking', desc:'See who watched, for how long, and how many times.' },
    { icon:'🧩', title:'CRM integrations', desc:'Connect HubSpot, Salesforce, or Zapier to your workflow.' },
    { icon:'🛡️', title:'Stealth browser', desc:'Bypasses bot detection on most modern websites.' },
  ]
  return (
    <div id="features" style={{ position:'relative', zIndex:1, borderTop:'1px solid var(--border)', padding:'100px 24px' }}>
      <div style={{ maxWidth:1100, margin:'0 auto' }}>
        <p style={{ fontSize:11, color:'var(--accent)', textTransform:'uppercase', letterSpacing:3, fontWeight:600, marginBottom:16 }}>Features</p>
        <h2 style={{ fontFamily:'var(--font-syne)', fontSize:'clamp(32px,4vw,52px)', fontWeight:800, letterSpacing:'-2px', lineHeight:1.05, marginBottom:60 }}>Everything you need<br/>to close more deals</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))', gap:20 }}>
          {features.map(f => (
            <div key={f.title} style={{ padding:32, border:'1px solid var(--border)', borderRadius:16, background:'var(--surface)' }}>
              <span style={{ fontSize:28, display:'block', marginBottom:20 }}>{f.icon}</span>
              <h3 style={{ fontFamily:'var(--font-syne)', fontSize:20, fontWeight:700, marginBottom:10 }}>{f.title}</h3>
              <p style={{ fontSize:14, color:'var(--muted)', lineHeight:1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PricingSection() {
  const plans = [
    { name:'Starter', price:'$0', period:'forever free', features:['10 videos / month','1 campaign','Shareable links','720p output'], cta:'Get started', featured:false },
    { name:'Pro', price:'$49', period:'per month', features:['500 videos / month','Unlimited campaigns','View tracking','1080p output','CSV upload','Priority rendering'], cta:'Start Pro trial', featured:true },
    { name:'Agency', price:'$149', period:'per month', features:['2,000 videos / month','White-label pages','CRM integrations','5 team seats','API access'], cta:'Contact sales', featured:false },
  ]
  return (
    <div id="pricing" style={{ position:'relative', zIndex:1, borderTop:'1px solid var(--border)', padding:'100px 24px' }}>
      <div style={{ maxWidth:1100, margin:'0 auto' }}>
        <p style={{ fontSize:11, color:'var(--accent)', textTransform:'uppercase', letterSpacing:3, fontWeight:600, marginBottom:16 }}>Pricing</p>
        <h2 style={{ fontFamily:'var(--font-syne)', fontSize:'clamp(32px,4vw,52px)', fontWeight:800, letterSpacing:'-2px', marginBottom:60 }}>Simple, honest pricing</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:24 }}>
          {plans.map(p => (
            <div key={p.name} style={{ padding:'36px 32px', border:`1px solid ${p.featured ? 'var(--accent)' : 'var(--border)'}`, borderRadius:16, background: p.featured ? 'linear-gradient(135deg,rgba(0,229,160,0.05) 0%,var(--surface) 60%)' : 'var(--surface)', position:'relative' }}>
              {p.featured && <div style={{ position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)', padding:'4px 14px', background:'var(--accent)', color:'#000', fontSize:11, fontWeight:700, borderRadius:100, whiteSpace:'nowrap' }}>Most Popular</div>}
              <p style={{ fontFamily:'var(--font-syne)', fontSize:13, fontWeight:700, textTransform:'uppercase', letterSpacing:1, color:'var(--muted)', marginBottom:12 }}>{p.name}</p>
              <div style={{ fontFamily:'var(--font-syne)', fontSize:52, fontWeight:800, letterSpacing:'-2px', lineHeight:1, marginBottom:4 }}>{p.price}</div>
              <p style={{ fontSize:13, color:'var(--muted)', marginBottom:28 }}>{p.period}</p>
              <ul style={{ listStyle:'none', marginBottom:32 }}>
                {p.features.map(f => (
                  <li key={f} style={{ display:'flex', gap:10, fontSize:14, color:'var(--muted)', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                    <span style={{ color:'var(--accent)' }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <a href="/signup" style={{ display:'block', textAlign:'center', padding:12, borderRadius:10, fontWeight:600, fontSize:14, textDecoration:'none', background: p.featured ? 'var(--accent)' : 'transparent', color: p.featured ? '#000' : 'var(--text)', border: p.featured ? 'none' : '1px solid var(--border)' }}>{p.cta}</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <main style={{ position: 'relative' }}>
      <div className="ambient ambient-1" />
      <div className="ambient ambient-2" />
      <Navbar />
      <HeroSection />
      <div style={{ borderTop:'1px solid var(--border)' }} />
      <HowSection />
      <div style={{ height:1, background:'var(--border)', maxWidth:1100, margin:'0 auto' }} />
      <FeaturesSection />
      <PricingSection />
      <section style={{ position:'relative', zIndex:1, padding:'100px 24px', textAlign:'center' }}>
        <div style={{ maxWidth:700, margin:'0 auto', padding:'80px 60px', border:'1px solid var(--border)', borderRadius:24, background:'var(--surface)' }}>
          <h2 style={{ fontFamily:'var(--font-syne)', fontSize:'clamp(32px,4vw,48px)', fontWeight:800, letterSpacing:'-2px', marginBottom:16 }}>Ready to personalize<br/>at scale?</h2>
          <p style={{ color:'var(--muted)', marginBottom:36 }}>Join hundreds of sales teams sending videos that actually get responses.</p>
          <Button variant="primary" size="lg" href="/signup">Create your first campaign →</Button>
        </div>
      </section>
      <Footer />
    </main>
  )
}