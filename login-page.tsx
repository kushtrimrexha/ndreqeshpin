'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'

const PARTICLES = Array.from({length:20},(_,i)=>({
  id:i,
  x: Math.random()*100,
  y: Math.random()*100,
  size: Math.random()*3+1,
  delay: Math.random()*4,
  duration: Math.random()*6+4,
}))

export default function LoginPage() {
  const router       = useRouter()
  const params       = useSearchParams()
  const redirect     = params.get('redirect') || null
  const supabase     = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [focused,  setFocused]  = useState<string|null>(null)
  const [mounted,  setMounted]  = useState(false)

  useEffect(() => { setMounted(true) }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Email ose fjalëkalimi është gabim. Provo sërish.')
      setLoading(false)
      return
    }

    if (data.session) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.session.user.id)
        .single()

      const dest = redirect || `/${profile?.role || 'client'}/dashboard`
      router.push(dest)
      router.refresh()
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#0a0908', display:'flex', alignItems:'stretch', fontFamily:"'DM Sans','Helvetica Neue',sans-serif", overflow:'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900;1,9..144,300;1,9..144,400&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes fadeUp    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes pulse     { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.2)} }
        @keyframes spin      { to{transform:rotate(360deg)} }
        @keyframes shimmer   { 0%{opacity:0.3;transform:translateX(-100%)} 100%{opacity:0;transform:translateX(100%)} }
        @keyframes drift     { 0%,100%{transform:translate(0,0) rotate(0deg)} 33%{transform:translate(6px,-8px) rotate(2deg)} 66%{transform:translate(-4px,4px) rotate(-1deg)} }
        @keyframes glow      { 0%,100%{box-shadow:0 0 20px rgba(232,98,26,0.2)} 50%{box-shadow:0 0 40px rgba(232,98,26,0.4)} }
        .inp:focus{outline:none}
        .inp-wrap:focus-within .inp-label{color:#e8621a !important;transform:translateY(-22px) scale(0.82) !important}
        .submit-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 12px 40px rgba(232,98,26,0.45) !important}
        .submit-btn:active:not(:disabled){transform:translateY(0)}
        .social-btn:hover{border-color:rgba(240,236,228,0.2) !important;background:rgba(240,236,228,0.06) !important}
        @media(max-width:768px){.login-left{display:none !important}}
      `}</style>

      {/* ── LEFT — Decorative panel ──────────────────────────────────── */}
      <div className="login-left" style={{ flex:'0 0 50%', position:'relative', background:'linear-gradient(160deg,#0f0d0b 0%,#1a120a 50%,#0a0908 100%)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', overflow:'hidden', padding:60 }}>

        {/* Ambient glow */}
        <div style={{ position:'absolute', top:'20%', left:'30%', width:400, height:400, background:'radial-gradient(circle,rgba(232,98,26,0.12) 0%,transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'20%', right:'20%', width:300, height:300, background:'radial-gradient(circle,rgba(34,211,165,0.06) 0%,transparent 70%)', pointerEvents:'none' }} />

        {/* Grid texture */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(240,236,228,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(240,236,228,0.02) 1px,transparent 1px)', backgroundSize:'48px 48px', pointerEvents:'none' }} />

        {/* Floating particles */}
        {mounted && PARTICLES.map(p => (
          <div key={p.id} style={{ position:'absolute', left:`${p.x}%`, top:`${p.y}%`, width:p.size, height:p.size, borderRadius:'50%', background:'rgba(232,98,26,0.4)', animation:`drift ${p.duration}s ease-in-out ${p.delay}s infinite`, pointerEvents:'none' }} />
        ))}

        {/* Content */}
        <div style={{ position:'relative', zIndex:1, textAlign:'center', maxWidth:420 }}>
          {/* Logo */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:12, marginBottom:56, animation:'fadeUp 0.8s ease 0.1s both' }}>
            <div style={{ width:48, height:48, background:'linear-gradient(135deg,#e8621a,#ff8c4a)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Fraunces',serif", fontWeight:900, color:'#fff', fontSize:24, boxShadow:'0 8px 24px rgba(232,98,26,0.35)', animation:'glow 3s ease infinite' }}>N</div>
            <span style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:24, letterSpacing:'-0.04em', color:'#f0ece4' }}>Ndreqe<span style={{ color:'#e8621a' }}>Shpin</span></span>
          </div>

          {/* Headline */}
          <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(2rem,4vw,3rem)', fontWeight:900, letterSpacing:'-0.04em', lineHeight:0.95, color:'#f0ece4', marginBottom:20, animation:'fadeUp 0.8s ease 0.2s both' }}>
            Platforma e<br/><em style={{ color:'#e8621a' }}>renovimeve</em><br/>në Kosovë
          </h2>

          <p style={{ fontSize:15, color:'rgba(240,236,228,0.45)', lineHeight:1.8, marginBottom:48, fontWeight:400, animation:'fadeUp 0.8s ease 0.3s both' }}>
            Klientë, kompani dhe punëtorë — të gjithë bashkë në një platformë të vetme.
          </p>

          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16, animation:'fadeUp 0.8s ease 0.4s both' }}>
            {[
              { num:'500+', label:'Klientë' },
              { num:'200+', label:'Kompani' },
              { num:'1000+', label:'Punë të kryera' },
            ].map((s,i) => (
              <div key={i} style={{ padding:'16px 12px', background:'rgba(240,236,228,0.03)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:14 }}>
                <div style={{ fontFamily:"'Fraunces',serif", fontSize:'1.6rem', fontWeight:900, color:'#e8621a', lineHeight:1, marginBottom:4 }}>{s.num}</div>
                <div style={{ fontSize:11, color:'rgba(240,236,228,0.4)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div style={{ marginTop:32, padding:'20px 24px', background:'rgba(232,98,26,0.06)', border:'1px solid rgba(232,98,26,0.15)', borderRadius:16, textAlign:'left', animation:'fadeUp 0.8s ease 0.5s both' }}>
            <div style={{ fontSize:24, color:'#e8621a', marginBottom:10, lineHeight:1 }}>"</div>
            <p style={{ fontSize:13, color:'rgba(240,236,228,0.6)', lineHeight:1.7, fontStyle:'italic', marginBottom:12 }}>
              Brenda 2 orësh mora 8 oferta. Çmimi ishte 40% më i lirë se sa mendoja.
            </p>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:9, background:'linear-gradient(135deg,#e8621a,#ff7c35)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:'#fff' }}>A</div>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:'#f0ece4' }}>Ardian K.</div>
                <div style={{ fontSize:10, color:'rgba(240,236,228,0.3)' }}>Prishtinë · Klient</div>
              </div>
              <div style={{ marginLeft:'auto', color:'#fbbf24', fontSize:14 }}>★★★★★</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT — Login form ───────────────────────────────────────── */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'48px 40px', position:'relative' }}>

        {/* Mobile logo */}
        <div style={{ position:'absolute', top:32, left:0, right:0, display:'flex', justifyContent:'center' }}>
          <Link href="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
            <div style={{ width:36, height:36, background:'linear-gradient(135deg,#e8621a,#ff8c4a)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Fraunces',serif", fontWeight:900, color:'#fff', fontSize:18 }}>N</div>
            <span style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:18, letterSpacing:'-0.04em', color:'#f0ece4' }}>Ndreqe<span style={{ color:'#e8621a' }}>Shpin</span></span>
          </Link>
        </div>

        <div style={{ width:'100%', maxWidth:400, animation:'fadeUp 0.6s ease' }}>

          {/* Header */}
          <div style={{ marginBottom:36 }}>
            <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'2rem', fontWeight:900, letterSpacing:'-0.04em', color:'#f0ece4', marginBottom:10 }}>
              Mirë se u kthyet
            </h1>
            <p style={{ fontSize:14, color:'rgba(240,236,228,0.4)', lineHeight:1.6 }}>
              Ende nuk keni llogari?{' '}
              <Link href="/register" style={{ color:'#e8621a', textDecoration:'none', fontWeight:700 }}>Regjistrohu falas →</Link>
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ padding:'12px 16px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:12, marginBottom:20, fontSize:13, color:'#ef4444', display:'flex', alignItems:'center', gap:8, animation:'fadeUp 0.3s ease' }}>
              <span style={{ fontSize:16 }}>⚠️</span> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* Email */}
            <div className="inp-wrap" style={{ position:'relative' }}>
              <label className="inp-label" style={{
                position:'absolute', left:16, top:16, fontSize:14, color: focused==='email' || email ? '#e8621a' : 'rgba(240,236,228,0.4)',
                fontWeight:500, pointerEvents:'none', transition:'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                transform: focused==='email' || email ? 'translateY(-22px) scale(0.82)' : 'translateY(0) scale(1)',
                transformOrigin:'left', zIndex:1,
              }}>Email-i</label>
              <input className="inp" type="email" value={email} required
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                style={{ width:'100%', padding:'20px 16px 8px', background:'rgba(240,236,228,0.04)', border:`1px solid ${focused==='email' ? '#e8621a' : 'rgba(240,236,228,0.09)'}`, borderRadius:14, color:'#f0ece4', fontSize:15, fontFamily:'inherit', transition:'border-color 0.2s', WebkitAutofill:'none' }}
              />
            </div>

            {/* Password */}
            <div className="inp-wrap" style={{ position:'relative' }}>
              <label className="inp-label" style={{
                position:'absolute', left:16, top:16, fontSize:14, color: focused==='pw' || password ? '#e8621a' : 'rgba(240,236,228,0.4)',
                fontWeight:500, pointerEvents:'none', transition:'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                transform: focused==='pw' || password ? 'translateY(-22px) scale(0.82)' : 'translateY(0) scale(1)',
                transformOrigin:'left', zIndex:1,
              }}>Fjalëkalimi</label>
              <input className="inp" type={showPw ? 'text' : 'password'} value={password} required
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocused('pw')}
                onBlur={() => setFocused(null)}
                style={{ width:'100%', padding:'20px 48px 8px 16px', background:'rgba(240,236,228,0.04)', border:`1px solid ${focused==='pw' ? '#e8621a' : 'rgba(240,236,228,0.09)'}`, borderRadius:14, color:'#f0ece4', fontSize:15, fontFamily:'inherit', transition:'border-color 0.2s' }}
              />
              <button type="button" onClick={() => setShowPw(p=>!p)}
                style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:18, color:'rgba(240,236,228,0.3)', padding:4, lineHeight:1 }}>
                {showPw ? '🙈' : '👁'}
              </button>
            </div>

            {/* Forgot password */}
            <div style={{ textAlign:'right', marginTop:-8 }}>
              <Link href="/forgot-password" style={{ fontSize:12, color:'rgba(240,236,228,0.35)', textDecoration:'none', fontWeight:500, transition:'color 0.15s' }}
                onMouseEnter={e=>(e.currentTarget.style.color='rgba(240,236,228,0.7)')}
                onMouseLeave={e=>(e.currentTarget.style.color='rgba(240,236,228,0.35)')}>
                Harruat fjalëkalimin?
              </Link>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="submit-btn"
              style={{ padding:'16px', borderRadius:14, background: loading ? 'rgba(240,236,228,0.08)' : 'linear-gradient(135deg,#e8621a,#ff7c35)', border:'none', color: loading ? 'rgba(240,236,228,0.3)' : '#fff', fontFamily:"'Fraunces',serif", fontSize:'1rem', fontWeight:700, cursor: loading ? 'not-allowed' : 'pointer', letterSpacing:'-0.01em', boxShadow: loading ? 'none' : '0 6px 24px rgba(232,98,26,0.35)', transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
              {loading ? (
                <>
                  <div style={{ width:18, height:18, border:'2px solid rgba(240,236,228,0.2)', borderTop:'2px solid rgba(240,236,228,0.7)', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
                  Duke u kyçur...
                </>
              ) : 'Kyçu →'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:12, margin:'24px 0' }}>
            <div style={{ flex:1, height:1, background:'rgba(240,236,228,0.07)' }} />
            <span style={{ fontSize:11, color:'rgba(240,236,228,0.25)', fontWeight:600, letterSpacing:'0.06em' }}>OSE KYÇU SI</span>
            <div style={{ flex:1, height:1, background:'rgba(240,236,228,0.07)' }} />
          </div>

          {/* Role quick links */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
            {[
              { label:'Klient',  icon:'🏠', color:'#3b82f6' },
              { label:'Kompani', icon:'🏢', color:'#e8621a' },
              { label:'Punëtor', icon:'🔧', color:'#10b981' },
            ].map(r => (
              <Link key={r.label} href="/register"
                className="social-btn"
                style={{ padding:'12px 8px', background:'rgba(240,236,228,0.03)', border:'1px solid rgba(240,236,228,0.08)', borderRadius:12, textDecoration:'none', textAlign:'center', transition:'all 0.2s', display:'block' }}>
                <div style={{ fontSize:20, marginBottom:4 }}>{r.icon}</div>
                <div style={{ fontSize:11, fontWeight:700, color:'rgba(240,236,228,0.5)' }}>{r.label}</div>
              </Link>
            ))}
          </div>

          <p style={{ textAlign:'center', fontSize:11, color:'rgba(240,236,228,0.2)', marginTop:28, lineHeight:1.7 }}>
            Duke u kyçur, pranoni{' '}
            <Link href="/terms" style={{ color:'rgba(240,236,228,0.4)', textDecoration:'none' }}>Kushtet</Link>
            {' '}dhe{' '}
            <Link href="/privacy" style={{ color:'rgba(240,236,228,0.4)', textDecoration:'none' }}>Privatësinë</Link>
          </p>
        </div>
      </div>
    </div>
  )
}