'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [pw,       setPw]       = useState('')
  const [pw2,      setPw2]      = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [done,     setDone]     = useState(false)
  const [error,    setError]    = useState('')
  const [focused,  setFocused]  = useState<string|null>(null)
  const [session,  setSession]  = useState(false)

  useEffect(()=>{
    supabase.auth.onAuthStateChange((event)=>{
      if (event==='PASSWORD_RECOVERY') setSession(true)
    })
  },[])

  const strong = pw.length>=8
  const match  = pw===pw2&&pw2.length>0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!strong) { setError('Fjalëkalimi duhet të ketë të paktën 8 karaktere.'); return }
    if (!match)  { setError('Fjalëkalimet nuk përputhen.'); return }
    setLoading(true); setError('')
    const { error:err } = await supabase.auth.updateUser({ password: pw })
    setLoading(false)
    if (err) { setError(err.message||'Gabim gjatë rivendosjes. Provo sërish.'); return }
    setDone(true)
    setTimeout(()=>router.push('/login'), 3000)
  }

  const strength = pw.length===0?0:pw.length<6?1:pw.length<8?2:pw.match(/[A-Z]/)&&pw.match(/[0-9]/)?4:3
  const strengthLabel = ['','Shumë i shkurtër','I dobët','I mirë','Shumë i fortë'][strength]
  const strengthCol   = ['','#ef4444','#f59e0b','#3b82f6','#22d3a5'][strength]

  return (
    <div style={{ minHeight:'100vh', background:'#0a0908', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Sans','Helvetica Neue',sans-serif", padding:24 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes glow   { 0%,100%{box-shadow:0 0 20px rgba(232,98,26,0.15)} 50%{box-shadow:0 0 40px rgba(232,98,26,0.35)} }
        @keyframes barFill{ from{width:0} to{width:100%} }
        @keyframes successPop { 0%{transform:scale(0.5);opacity:0} 60%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
      `}</style>

      <div style={{ position:'fixed', top:'35%', left:'50%', transform:'translate(-50%,-50%)', width:500, height:300, background:'radial-gradient(ellipse,rgba(232,98,26,0.07) 0%,transparent 70%)', pointerEvents:'none' }} />

      <div style={{ position:'relative', zIndex:1, width:'100%', maxWidth:420, animation:'fadeUp 0.6s ease' }}>
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:10, textDecoration:'none' }}>
            <div style={{ width:44, height:44, background:'linear-gradient(135deg,#e8621a,#ff8c4a)', borderRadius:13, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Fraunces',serif", fontWeight:900, color:'#fff', fontSize:22, animation:'glow 3s ease infinite' }}>N</div>
            <span style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:20, letterSpacing:'-0.04em', color:'#f0ece4' }}>Ndreqe<span style={{ color:'#e8621a' }}>Shpin</span></span>
          </Link>
        </div>

        <div style={{ background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.08)', borderRadius:22, padding:'36px 32px', boxShadow:'0 24px 48px rgba(0,0,0,0.4)' }}>
          {done ? (
            <div style={{ textAlign:'center' }}>
              <div style={{ width:80, height:80, borderRadius:'50%', background:'rgba(34,211,165,0.1)', border:'2px solid rgba(34,211,165,0.4)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px', fontSize:36, animation:'successPop 0.5s cubic-bezier(0.4,0,0.2,1)' }}>✓</div>
              <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'1.7rem', fontWeight:900, color:'#f0ece4', marginBottom:12 }}>Fjalëkalimi u rivendos!</h1>
              <p style={{ fontSize:14, color:'rgba(240,236,228,0.5)', lineHeight:1.7, marginBottom:20 }}>Po ju ridrejtojmë tek faqja e hyrjes...</p>
              <div style={{ height:3, background:'rgba(240,236,228,0.08)', borderRadius:3, overflow:'hidden' }}>
                <div style={{ height:'100%', background:'linear-gradient(90deg,#22d3a5,#10b981)', borderRadius:3, animation:'barFill 3s linear forwards' }} />
              </div>
            </div>
          ) : (
            <>
              <div style={{ marginBottom:28 }}>
                <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'1.7rem', fontWeight:900, letterSpacing:'-0.03em', color:'#f0ece4', marginBottom:10, lineHeight:1.2 }}>Rivendos<br/>fjalëkalimin</h1>
                <p style={{ fontSize:14, color:'rgba(240,236,228,0.45)', lineHeight:1.7 }}>Zgjidh një fjalëkalim të ri të sigurt.</p>
              </div>

              {error&&(
                <div style={{ padding:'12px 16px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:12, marginBottom:18, fontSize:13, color:'#ef4444' }}>
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {/* Password */}
                <div style={{ position:'relative' }}>
                  <label style={{ position:'absolute', left:16, top:16, fontSize:14, color: focused==='pw'||pw ? '#e8621a' : 'rgba(240,236,228,0.4)', fontWeight:500, pointerEvents:'none', transition:'all 0.2s', transform: focused==='pw'||pw ? 'translateY(-22px) scale(0.82)' : 'translateY(0)', transformOrigin:'left', zIndex:1 }}>
                    Fjalëkalimi i ri
                  </label>
                  <input type={showPw?'text':'password'} value={pw} required
                    onChange={e=>setPw(e.target.value)}
                    onFocus={()=>setFocused('pw')} onBlur={()=>setFocused(null)}
                    style={{ width:'100%', padding:'20px 48px 8px 16px', background:'rgba(240,236,228,0.04)', border:`1px solid ${focused==='pw'?'#e8621a':'rgba(240,236,228,0.09)'}`, borderRadius:14, color:'#f0ece4', fontSize:15, fontFamily:'inherit', outline:'none', transition:'border-color 0.2s', boxSizing:'border-box' }}
                  />
                  <button type="button" onClick={()=>setShowPw(p=>!p)}
                    style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:18, color:'rgba(240,236,228,0.3)', padding:4 }}>
                    {showPw?'🙈':'👁'}
                  </button>
                </div>

                {/* Strength bar */}
                {pw.length>0&&(
                  <div>
                    <div style={{ height:4, background:'rgba(240,236,228,0.07)', borderRadius:4, overflow:'hidden', marginBottom:5 }}>
                      <div style={{ height:'100%', width:`${strength*25}%`, background:strengthCol, borderRadius:4, transition:'all 0.3s' }} />
                    </div>
                    <span style={{ fontSize:11, color:strengthCol, fontWeight:700 }}>{strengthLabel}</span>
                  </div>
                )}

                {/* Confirm */}
                <div style={{ position:'relative' }}>
                  <label style={{ position:'absolute', left:16, top:16, fontSize:14, color: focused==='pw2'||pw2 ? '#e8621a' : 'rgba(240,236,228,0.4)', fontWeight:500, pointerEvents:'none', transition:'all 0.2s', transform: focused==='pw2'||pw2 ? 'translateY(-22px) scale(0.82)' : 'translateY(0)', transformOrigin:'left', zIndex:1 }}>
                    Konfirmo fjalëkalimin
                  </label>
                  <input type={showPw?'text':'password'} value={pw2} required
                    onChange={e=>setPw2(e.target.value)}
                    onFocus={()=>setFocused('pw2')} onBlur={()=>setFocused(null)}
                    style={{ width:'100%', padding:'20px 16px 8px', background:'rgba(240,236,228,0.04)', border:`1px solid ${pw2.length>0?(match?'#22d3a5':'#ef4444'):focused==='pw2'?'#e8621a':'rgba(240,236,228,0.09)'}`, borderRadius:14, color:'#f0ece4', fontSize:15, fontFamily:'inherit', outline:'none', transition:'border-color 0.2s', boxSizing:'border-box' }}
                  />
                  {pw2.length>0&&<div style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', fontSize:16 }}>{match?'✅':'❌'}</div>}
                </div>

                <button type="submit" disabled={loading||!strong||!match}
                  style={{ padding:'15px', borderRadius:14, background: loading||!strong||!match ? 'rgba(240,236,228,0.07)' : 'linear-gradient(135deg,#e8621a,#ff7c35)', border:'none', color: loading||!strong||!match ? 'rgba(240,236,228,0.3)' : '#fff', fontFamily:"'Fraunces',serif", fontSize:'1rem', fontWeight:700, cursor: loading||!strong||!match ? 'not-allowed' : 'pointer', boxShadow: loading||!strong||!match ? 'none' : '0 6px 24px rgba(232,98,26,0.35)', transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
                  {loading?(<><div style={{ width:18, height:18, border:'2px solid rgba(240,236,228,0.2)', borderTop:'2px solid rgba(240,236,228,0.7)', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>Duke ruajtur...</>):'Ruaj fjalëkalimin →'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}