'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [email,   setEmail]   = useState('')
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [focused, setFocused] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (err) { setError('Email-i nuk u gjet ose ndodhi një gabim. Provo sërish.'); return }
    setSent(true)
  }

  return (
    <div style={{ minHeight:'100vh', background:'#0a0908', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Sans','Helvetica Neue',sans-serif", padding:24 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,900;1,9..144,300&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes glow   { 0%,100%{box-shadow:0 0 20px rgba(232,98,26,0.15)} 50%{box-shadow:0 0 40px rgba(232,98,26,0.35)} }
        .back-link:hover{color:rgba(240,236,228,0.7)!important}
      `}</style>

      <div style={{ position:'fixed', top:'35%', left:'50%', transform:'translate(-50%,-50%)', width:500, height:300, background:'radial-gradient(ellipse,rgba(232,98,26,0.07) 0%,transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'fixed', inset:0, backgroundImage:'linear-gradient(rgba(240,236,228,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(240,236,228,0.015) 1px,transparent 1px)', backgroundSize:'56px 56px', pointerEvents:'none' }} />

      <div style={{ position:'relative', zIndex:1, width:'100%', maxWidth:420, animation:'fadeUp 0.6s ease' }}>

        <div style={{ textAlign:'center', marginBottom:40 }}>
          <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:10, textDecoration:'none' }}>
            <div style={{ width:44, height:44, background:'linear-gradient(135deg,#e8621a,#ff8c4a)', borderRadius:13, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Fraunces',serif", fontWeight:900, color:'#fff', fontSize:22, animation:'glow 3s ease infinite' }}>N</div>
            <span style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:20, letterSpacing:'-0.04em', color:'#f0ece4' }}>Ndreqe<span style={{ color:'#e8621a' }}>Shpin</span></span>
          </Link>
        </div>

        <div style={{ background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.08)', borderRadius:22, padding:'36px 32px', boxShadow:'0 24px 48px rgba(0,0,0,0.4)' }}>
          {sent ? (
            <div style={{ textAlign:'center' }}>
              <div style={{ width:72, height:72, borderRadius:'50%', background:'rgba(34,211,165,0.1)', border:'2px solid rgba(34,211,165,0.3)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px', fontSize:32 }}>✉️</div>
              <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'1.6rem', fontWeight:900, letterSpacing:'-0.03em', color:'#f0ece4', marginBottom:12 }}>Kontrollo email-in</h1>
              <p style={{ fontSize:14, color:'rgba(240,236,228,0.5)', lineHeight:1.7, marginBottom:8 }}>Kemi dërguar një link rivendosjeje tek</p>
              <p style={{ fontSize:14, fontWeight:700, color:'#22d3a5', marginBottom:28 }}>{email}</p>
              <p style={{ fontSize:12, color:'rgba(240,236,228,0.35)', lineHeight:1.7, marginBottom:28 }}>Nuk e shikon? Kontrollo spam-in ose prisni 2–3 minuta.</p>
              <button onClick={()=>setSent(false)} style={{ width:'100%', padding:'12px', borderRadius:13, background:'rgba(240,236,228,0.06)', border:'1px solid rgba(240,236,228,0.1)', color:'rgba(240,236,228,0.6)', fontFamily:'inherit', fontSize:14, fontWeight:600, cursor:'pointer', marginBottom:12 }}>
                ← Provo me email tjetër
              </button>
              <Link href="/login" style={{ display:'block', textAlign:'center', fontSize:13, color:'#e8621a', fontWeight:700, textDecoration:'none' }}>Kthehu tek Hyrja →</Link>
            </div>
          ) : (
            <>
              <div style={{ marginBottom:28 }}>
                <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'1.7rem', fontWeight:900, letterSpacing:'-0.03em', color:'#f0ece4', marginBottom:10, lineHeight:1.2 }}>
                  Harruat<br/>fjalëkalimin?
                </h1>
                <p style={{ fontSize:14, color:'rgba(240,236,228,0.45)', lineHeight:1.7 }}>
                  Shkruaj email-in dhe do të dërgojmë link rivendosjeje.
                </p>
              </div>

              {error&&(
                <div style={{ padding:'12px 16px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:12, marginBottom:18, fontSize:13, color:'#ef4444', display:'flex', alignItems:'center', gap:8 }}>
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
                <div style={{ position:'relative' }}>
                  <label style={{ position:'absolute', left:16, top:16, fontSize:14, color: focused||email ? '#e8621a' : 'rgba(240,236,228,0.4)', fontWeight:500, pointerEvents:'none', transition:'all 0.2s cubic-bezier(0.4,0,0.2,1)', transform: focused||email ? 'translateY(-22px) scale(0.82)' : 'translateY(0)', transformOrigin:'left', zIndex:1 }}>
                    Adresa email
                  </label>
                  <input type="email" value={email} required
                    onChange={e=>setEmail(e.target.value)}
                    onFocus={()=>setFocused(true)}
                    onBlur={()=>setFocused(false)}
                    style={{ width:'100%', padding:'20px 16px 8px', background:'rgba(240,236,228,0.04)', border:`1px solid ${focused?'#e8621a':'rgba(240,236,228,0.09)'}`, borderRadius:14, color:'#f0ece4', fontSize:15, fontFamily:'inherit', outline:'none', transition:'border-color 0.2s', boxSizing:'border-box' }}
                  />
                </div>

                <button type="submit" disabled={loading||!email}
                  style={{ padding:'15px', borderRadius:14, background: loading||!email ? 'rgba(240,236,228,0.07)' : 'linear-gradient(135deg,#e8621a,#ff7c35)', border:'none', color: loading||!email ? 'rgba(240,236,228,0.3)' : '#fff', fontFamily:"'Fraunces',serif", fontSize:'1rem', fontWeight:700, cursor: loading||!email ? 'not-allowed' : 'pointer', letterSpacing:'-0.01em', boxShadow: loading||!email ? 'none' : '0 6px 24px rgba(232,98,26,0.35)', transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
                  {loading ? (
                    <><div style={{ width:18, height:18, border:'2px solid rgba(240,236,228,0.2)', borderTop:'2px solid rgba(240,236,228,0.7)', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />Duke dërguar...</>
                  ) : 'Dërgo linkun →'}
                </button>

                <div style={{ textAlign:'center', paddingTop:4 }}>
                  <Link href="/login" className="back-link" style={{ fontSize:13, color:'rgba(240,236,228,0.4)', textDecoration:'none', fontWeight:500, transition:'color 0.15s' }}>
                    ← Kthehu tek Hyrja
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>

        <p style={{ textAlign:'center', fontSize:11, color:'rgba(240,236,228,0.2)', marginTop:24 }}>
          © 2025 NdreqeShpin · Bërë me ❤️ në Kosovë 🇽🇰
        </p>
      </div>
    </div>
  )
}