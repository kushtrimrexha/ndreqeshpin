'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const FEATURES_FREE = [
  { t: 'Deri 3 aplikime / muaj',           a: true  },
  { t: 'Oferta të pakufizuara',             a: true  },
  { t: 'Chat me profesionistët',            a: true  },
  { t: 'Vlerëso pas çdo projekti',          a: true  },
  { t: 'Aplikime prioritare (first)',       a: false },
  { t: 'Statistika & raporte të avancuara', a: false },
  { t: 'Eksport CSV',                       a: false },
  { t: 'Mbështetje prioritare 24/7',        a: false },
]

const FEATURES_PRO = [
  { t: 'Aplikime & oferta të PAKUFIZUARA',  a: true },
  { t: 'Shfaqesh PRIORITAR tek klientët',   a: true },
  { t: 'Chat + foto & dokumente',           a: true },
  { t: 'Vlerëso dhe merr vlerësime VIP',    a: true },
  { t: 'Dashboard & statistika premium',    a: true },
  { t: 'Raporte & eksport CSV',             a: true },
  { t: 'Analizë çmimesh të tregut',         a: true },
  { t: 'Mbështetje prioritare 24/7',        a: true },
]

const FAQS = [
  { q: 'A mund ta anulez abonimin?',         a: 'Po, mund ta anulez në çdo moment nga Cilësimet. Nuk ka penalizime apo kosto shtesë.' },
  { q: 'Si funksionon pagesa?',              a: 'Pagesa bëhet me kartë (Visa, Mastercard) përmes Stripe — platformës më të sigurt të pagesave online. Të dhënat e kartës nuk ruhen tek ne.' },
  { q: 'A ka periudhë prove?',               a: 'Plani Falas është i disponueshëm gjithmonë. Mund ta provoni Premium 14 ditë falas për herën e parë.' },
  { q: 'Çfarë ndodh kur skadon abonimi?',    a: 'Llogaria juaj kalon automatikisht tek plani Falas. Të gjitha të dhënat dhe historiku ruhen.' },
  { q: 'A ofrohet çmim i veçantë për kompani?', a: 'Po, kemi plane speciale për kompani me shumë përdorues. Na kontaktoni direkt për çmim të personalizuar.' },
]

export default function PricingClient({ isPremium, userRole }: { isPremium: boolean; userRole: string }) {
  const router = useRouter()
  const [billing, setBilling]     = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading]     = useState<string | null>(null)
  const [openFaq,  setOpenFaq]    = useState<number | null>(null)

  const price    = billing === 'yearly' ? 7.99 : 9.99
  const yearSave = Math.round(100 - (7.99 / 9.99) * 100)

  async function handleCheckout(planType: 'monthly' | 'yearly') {
    setLoading(planType)
    try {
      const res  = await fetch('/api/stripe/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ planType }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert(data.error || 'Gabim gjatë procesimit. Provo sërish.')
    } catch {
      alert('Gabim rrjeti. Kontrollo lidhjen dhe provo sërish.')
    } finally {
      setLoading(null)
    }
  }

  async function handlePortal() {
    setLoading('portal')
    try {
      const res  = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;0,9..144,900;1,9..144,300&family=DM+Sans:wght@300;400;500;600&display=swap');
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
        :root{--bg:#080b12;--s:rgba(255,255,255,0.03);--b:rgba(255,255,255,0.08);--t:#e8eaf0;--m:rgba(232,234,240,0.45);--o:#e8621a;--g:#22d3a5}
        body{background:var(--bg);color:var(--t);font-family:'DM Sans',sans-serif}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
      `}</style>

      <div style={{ minHeight:'100vh', background:'var(--bg)', paddingTop:80 }}>

        {/* ── HERO ─────────────────────────── */}
        <div style={{ textAlign:'center', padding:'72px 24px 56px', position:'relative', overflow:'hidden' }}>
          {/* glow */}
          <div style={{ position:'absolute', top:'30%', left:'50%', transform:'translateX(-50%)', width:700, height:400, background:'radial-gradient(ellipse,rgba(232,98,26,0.1),transparent 70%)', pointerEvents:'none' }} />

          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 16px 6px 8px', borderRadius:50, border:'1px solid rgba(34,211,165,0.25)', background:'rgba(34,211,165,0.06)', fontSize:12, fontWeight:600, color:'var(--g)', marginBottom:32, animation:'fadeUp 0.7s ease both' }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--g)', boxShadow:'0 0 8px rgba(34,211,165,0.8)', animation:'pulse 2s infinite' }} />
            Transparent. Pa komisione të fshehura.
          </div>

          <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(2.8rem,6vw,5rem)', fontWeight:900, letterSpacing:'-0.04em', lineHeight:1, marginBottom:16, animation:'fadeUp 0.7s ease 0.1s both', position:'relative', zIndex:1 }}>
            Çmimi i <em style={{ fontStyle:'italic', color:'var(--o)' }}>thjeshtë</em><br/>dhe transparent
          </h1>
          <p style={{ fontSize:17, color:'var(--m)', maxWidth:460, margin:'0 auto 40px', lineHeight:1.8, animation:'fadeUp 0.7s ease 0.2s both', position:'relative', zIndex:1 }}>
            Fillo falas. Upgrade kur të jesh gati. Anulo kurrë.
          </p>

          {/* Billing toggle */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:0, background:'rgba(255,255,255,0.04)', border:'1px solid var(--b)', borderRadius:14, padding:4, animation:'fadeUp 0.7s ease 0.3s both', position:'relative', zIndex:1 }}>
            {(['monthly','yearly'] as const).map(b => (
              <button key={b} onClick={() => setBilling(b)} style={{ padding:'10px 24px', borderRadius:11, border:'none', fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600, cursor:'pointer', transition:'all 0.2s', background: billing===b ? 'linear-gradient(135deg,var(--o),#ff7c35)' : 'transparent', color: billing===b ? '#fff' : 'var(--m)', boxShadow: billing===b ? '0 4px 16px rgba(232,98,26,0.3)' : 'none', display:'flex', alignItems:'center', gap:8 }}>
                {b==='monthly' ? 'Mujor' : 'Vjetor'}
                {b==='yearly' && <span style={{ fontSize:10, fontWeight:800, background:'rgba(34,211,165,0.15)', color:'var(--g)', border:'1px solid rgba(34,211,165,0.3)', borderRadius:6, padding:'1px 7px' }}>-{yearSave}%</span>}
              </button>
            ))}
          </div>
        </div>

        {/* ── CARDS ────────────────────────── */}
        <div style={{ maxWidth:860, margin:'0 auto', padding:'0 24px 80px', display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:16, animation:'fadeUp 0.7s ease 0.4s both' }}>

          {/* FREE */}
          <div style={{ padding:'40px 36px', borderRadius:24, border:'1px solid var(--b)', background:'var(--s)', position:'relative' }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--m)', marginBottom:14 }}>Falas</div>
            <div style={{ fontFamily:"'Fraunces',serif", fontSize:'3.8rem', fontWeight:900, letterSpacing:'-0.05em', lineHeight:1, marginBottom:4 }}>0</div>
            <div style={{ fontSize:13, color:'var(--m)', marginBottom:32 }}>Gjithmonë falas — pa kartë</div>
            <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:12, marginBottom:32 }}>
              {FEATURES_FREE.map((f,i) => (
                <li key={i} style={{ display:'flex', alignItems:'center', gap:10, fontSize:14, color: f.a ? 'var(--t)' : 'rgba(232,234,240,0.25)' }}>
                  <span style={{ fontWeight:800, fontSize:12, color: f.a ? 'var(--g)' : 'rgba(232,234,240,0.18)', flexShrink:0 }}>{f.a ? '✓' : '✕'}</span>
                  {f.t}
                </li>
              ))}
            </ul>
            {isPremium ? (
              <div style={{ display:'block', width:'100%', padding:13, borderRadius:13, background:'rgba(255,255,255,0.04)', border:'1px solid var(--b)', color:'var(--m)', fontSize:14, fontWeight:600, textAlign:'center' }}>Plan aktual: Premium</div>
            ) : (
              <button onClick={() => router.push(`/${userRole}/dashboard`)} style={{ display:'block', width:'100%', padding:13, borderRadius:13, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'var(--t)', fontFamily:"'Fraunces',serif", fontSize:'0.95rem', fontWeight:700, cursor:'pointer', transition:'all 0.2s' }}>
                Vazhdo falas →
              </button>
            )}
          </div>

          {/* PREMIUM */}
          <div style={{ padding:'40px 36px', borderRadius:24, border:'1px solid rgba(232,98,26,0.35)', background:'rgba(232,98,26,0.04)', position:'relative' }}>
            {/* Recommended badge */}
            <div style={{ position:'absolute', top:-13, left:'50%', transform:'translateX(-50%)', fontSize:10, fontWeight:800, letterSpacing:'0.1em', color:'var(--o)', background:'var(--bg)', border:'1px solid rgba(232,98,26,0.3)', borderRadius:50, padding:'4px 18px', whiteSpace:'nowrap' }}>
              💎 RECOMMENDED
            </div>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--o)', marginBottom:14 }}>Premium</div>
            <div style={{ display:'flex', alignItems:'flex-end', gap:2, marginBottom:4 }}>
              <div style={{ fontFamily:"'Fraunces',serif", fontSize:'3.8rem', fontWeight:900, letterSpacing:'-0.05em', lineHeight:1, color:'var(--o)' }}>
                <sup style={{ fontSize:'1.6rem', verticalAlign:'super' }}>€</sup>{price}
              </div>
              <div style={{ fontSize:14, color:'var(--m)', marginBottom:10, marginLeft:4 }}>/ muaj</div>
            </div>
            {billing === 'yearly' && (
              <div style={{ fontSize:12, color:'var(--g)', fontWeight:700, marginBottom:4 }}>
                = €{(price*12).toFixed(2)} / vit — kursen €{((9.99-price)*12).toFixed(2)}
              </div>
            )}
            <div style={{ fontSize:13, color:'var(--m)', marginBottom:32 }}>
              {billing === 'yearly' ? 'Faturim vjetor · anulohet kurrë' : 'Faturim mujor · anulohet kurrë'}
            </div>
            <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:12, marginBottom:32 }}>
              {FEATURES_PRO.map((f,i) => (
                <li key={i} style={{ display:'flex', alignItems:'center', gap:10, fontSize:14, color:'var(--t)' }}>
                  <span style={{ fontWeight:800, fontSize:12, color:'var(--g)', flexShrink:0 }}>✓</span>
                  {f.t}
                </li>
              ))}
            </ul>
            {isPremium ? (
              <button onClick={handlePortal} disabled={loading==='portal'} style={{ display:'block', width:'100%', padding:13, borderRadius:13, background:'linear-gradient(135deg,var(--o),#ff7c35)', border:'none', color:'#fff', fontFamily:"'Fraunces',serif", fontSize:'0.95rem', fontWeight:700, cursor:'pointer', boxShadow:'0 4px 20px rgba(232,98,26,0.3)', transition:'all 0.2s', opacity: loading==='portal' ? 0.7 : 1 }}>
                {loading==='portal' ? 'Duke hapur...' : 'Menaxho abonimin →'}
              </button>
            ) : (
              <button onClick={() => handleCheckout(billing)} disabled={!!loading} style={{ display:'block', width:'100%', padding:13, borderRadius:13, background:'linear-gradient(135deg,var(--o),#ff7c35)', border:'none', color:'#fff', fontFamily:"'Fraunces',serif", fontSize:'0.95rem', fontWeight:700, cursor:'pointer', boxShadow:'0 4px 20px rgba(232,98,26,0.3)', transition:'all 0.2s', opacity: loading ? 0.7 : 1 }}>
                {loading === billing ? '⏳ Duke procesuar...' : `Fillo Premium ${billing==='yearly'?'Vjetor':'Mujor'} →`}
              </button>
            )}
          </div>
        </div>

        {/* ── TRUST BADGES ─────────────────── */}
        <div style={{ maxWidth:860, margin:'0 auto 80px', padding:'0 24px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
            {[
              { icon:'🔒', title:'Pagesa e sigurt', desc:'256-bit SSL encryption përmes Stripe — standarti i industrisë' },
              { icon:'❌', title:'Anulohet kurrë', desc:'Asnjë kontratë. Anulo kurrë nga Cilësimet, pa telefonata' },
              { icon:'🇽🇰', title:'Bërë në Kosovë', desc:'Platforma lokale me mbështetje në gjuhën shqipe' },
            ].map((b,i) => (
              <div key={i} style={{ padding:'28px 24px', borderRadius:18, border:'1px solid var(--b)', background:'var(--s)', textAlign:'center' }}>
                <div style={{ fontSize:32, marginBottom:12 }}>{b.icon}</div>
                <div style={{ fontFamily:"'Fraunces',serif", fontSize:'1.1rem', fontWeight:800, letterSpacing:'-0.02em', marginBottom:8 }}>{b.title}</div>
                <div style={{ fontSize:13, color:'var(--m)', lineHeight:1.7 }}>{b.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQ ──────────────────────────── */}
        <div style={{ maxWidth:680, margin:'0 auto 100px', padding:'0 24px' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--o)', marginBottom:14, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              <span style={{ display:'block', width:24, height:1, background:'var(--o)' }} />
              FAQ
              <span style={{ display:'block', width:24, height:1, background:'var(--o)' }} />
            </div>
            <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:'2.2rem', fontWeight:900, letterSpacing:'-0.04em' }}>Pyetje të shpeshta</h2>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {FAQS.map((faq,i) => (
              <div key={i} style={{ border:'1px solid var(--b)', borderRadius:16, overflow:'hidden', transition:'border-color 0.2s', borderColor: openFaq===i ? 'rgba(232,98,26,0.3)' : 'var(--b)' }}>
                <button onClick={() => setOpenFaq(openFaq===i ? null : i)} style={{ width:'100%', padding:'20px 24px', background:'transparent', border:'none', color:'var(--t)', fontFamily:"'DM Sans',sans-serif", fontSize:15, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
                  {faq.q}
                  <span style={{ color:'var(--o)', fontSize:20, transition:'transform 0.2s', transform: openFaq===i ? 'rotate(45deg)' : 'none', flexShrink:0 }}>+</span>
                </button>
                {openFaq===i && (
                  <div style={{ padding:'0 24px 20px', fontSize:14, color:'var(--m)', lineHeight:1.8, borderTop:'1px solid var(--b)' }}>
                    <div style={{ paddingTop:16 }}>{faq.a}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── BOTTOM CTA ───────────────────── */}
        <div style={{ margin:'0 48px 80px', borderRadius:28, padding:'64px', background:'linear-gradient(135deg,rgba(232,98,26,0.1),rgba(232,98,26,0.04) 50%,rgba(34,211,165,0.05))', border:'1px solid rgba(232,98,26,0.2)', textAlign:'center', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:-80, left:'50%', transform:'translateX(-50%)', width:500, height:300, background:'radial-gradient(ellipse,rgba(232,98,26,0.12),transparent 70%)', pointerEvents:'none' }} />
          <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(2rem,4vw,3rem)', fontWeight:900, letterSpacing:'-0.04em', lineHeight:1, marginBottom:14, position:'relative', zIndex:1 }}>
            Gati të <em style={{ fontStyle:'italic', color:'var(--o)' }}>fillosh</em>?
          </h2>
          <p style={{ fontSize:16, color:'var(--m)', maxWidth:380, margin:'0 auto 32px', lineHeight:1.75, position:'relative', zIndex:1 }}>
            Regjistrohu falas dhe fillo të marrësh oferta sot.
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap', position:'relative', zIndex:1 }}>
            <button onClick={() => handleCheckout(billing)} disabled={!!loading} style={{ padding:'14px 32px', borderRadius:14, background:'linear-gradient(135deg,var(--o),#ff7c35)', border:'none', color:'#fff', fontFamily:"'Fraunces',serif", fontSize:'1rem', fontWeight:700, cursor:'pointer', boxShadow:'0 6px 24px rgba(232,98,26,0.35)', transition:'all 0.2s' }}>
              Fillo Premium tani →
            </button>
            <button onClick={() => router.push(`/${userRole}/dashboard`)} style={{ padding:'14px 32px', borderRadius:14, border:'1px solid var(--b)', background:'rgba(255,255,255,0.04)', color:'var(--t)', fontFamily:"'DM Sans',sans-serif", fontSize:15, fontWeight:600, cursor:'pointer', transition:'all 0.2s' }}>
              Vazhdo me planin Falas
            </button>
          </div>
        </div>

      </div>
    </>
  )
}