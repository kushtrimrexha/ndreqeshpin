'use client'

import { useState } from 'react'

interface Application {
  id: string; title: string; description: string; city: string
  area_sqm: number|null; budget_min: number|null; budget_max: number|null
  offer_count: number; expires_at: string; created_at: string
  categories?: { name:string; icon:string }
  profiles?:   { full_name:string; city:string }
}
interface Worker { id:string; skills?:string[]; hourly_rate?:number; is_available?:boolean }

interface OfferFormData { price: string; duration_days: string; description: string }

export default function WorkerApplicationsClient({ applications, offeredSet, worker }: {
  applications: Application[]; offeredSet: string[]; worker: Worker|null
}) {
  const [search,   setSearch]   = useState('')
  const [offered,  setOffered]  = useState<Set<string>>(new Set(offeredSet))
  const [modal,    setModal]    = useState<Application|null>(null)
  const [form,     setForm]     = useState<OfferFormData>({ price:'', duration_days:'', description:'' })
  const [sending,  setSending]  = useState(false)
  const [error,    setError]    = useState('')
  const [toast,    setToast]    = useState('')
  const [focused,  setFocused]  = useState<string|null>(null)

  const filtered = applications.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.city.toLowerCase().includes(search.toLowerCase())
  )

  function openModal(app: Application) {
    setForm({ price: worker?.hourly_rate ? String(worker.hourly_rate * 8) : '', duration_days:'', description:'' })
    setError('')
    setModal(app)
  }

  async function handleSendOffer() {
    if (!form.price || !form.duration_days) { setError('Çmimi dhe kohëzgjatja janë të detyrueshme.'); return }
    if (!worker?.id) { setError('Profili i punëtorit nuk u gjet.'); return }
    setSending(true); setError('')
    try {
      const res = await fetch('/api/offers/create', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          application_id: modal!.id,
          worker_id:      worker.id,
          price:          Number(form.price),
          duration_days:  Number(form.duration_days),
          description:    form.description,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Gabim gjatë dërgimit.'); return }
      setOffered(prev => new Set([...prev, modal!.id]))
      setModal(null)
      setToast('Oferta u dërgua me sukses! 🎉')
      setTimeout(() => setToast(''), 4000)
    } catch { setError('Problem me lidhjen.') }
    finally { setSending(false) }
  }

  const css = (name: string): React.CSSProperties => ({
    width:'100%', background: focused===name ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.04)',
    border:`1px solid ${focused===name ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.09)'}`,
    borderRadius:10, padding:'11px 14px', fontSize:14, color:'#e8eaf0',
    fontFamily:'inherit', outline:'none', transition:'all 0.2s', boxSizing:'border-box' as const,
  })

  return (
    <div>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .app-card:hover{border-color:rgba(255,255,255,0.14)!important;transform:translateY(-2px);}
      `}</style>

      {toast && (
        <div style={{ position:'fixed', top:20, right:20, zIndex:600, background:'rgba(34,211,165,0.1)', border:'1px solid rgba(34,211,165,0.3)', color:'#22d3a5', padding:'14px 22px', borderRadius:13, fontSize:14, fontWeight:600, animation:'fadeUp 0.3s ease' }}>{toast}</div>
      )}

      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'1.9rem', fontWeight:900, letterSpacing:'-0.03em', marginBottom:6 }}>Aplikimet aktive</h1>
        <p style={{ fontSize:14, color:'rgba(232,234,240,0.45)' }}>{filtered.length} projekte disponibël — dërgo ofertën tënde</p>
      </div>

      {!worker?.is_available && (
        <div style={{ marginBottom:24, padding:'14px 20px', background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.18)', borderRadius:14, display:'flex', gap:12, alignItems:'center' }}>
          <span style={{ fontSize:22 }}>⚠️</span>
          <div>
            <div style={{ fontWeight:700, color:'#f87171', marginBottom:2 }}>Je shënuar si jo i disponueshëm</div>
            <p style={{ fontSize:13, color:'rgba(232,234,240,0.45)' }}>Ndrysho statusin tek Profili → I disponueshëm për të marrë punë.</p>
          </div>
        </div>
      )}

      <div style={{ position:'relative' as const, marginBottom:24 }}>
        <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', opacity:0.35, fontSize:13 }}>🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Kërko titull ose qytet..."
          style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:11, padding:'10px 14px 10px 36px', fontSize:13, color:'#e8eaf0', fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }} />
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'80px 20px', color:'rgba(232,234,240,0.3)' }}>
          <div style={{ fontSize:52, marginBottom:16 }}>📭</div>
          <div style={{ fontFamily:"'Fraunces',serif", fontSize:'1.1rem', fontWeight:800 }}>Nuk ka aplikime aktive</div>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:14 }}>
          {filtered.map((app, i) => {
            const hasOffered = offered.has(app.id)
            const expires    = new Date(app.expires_at).getTime() - Date.now()
            const expLabel   = expires > 0 ? `${Math.floor(expires/3_600_000)}h ${Math.floor((expires%3_600_000)/60_000)}m` : 'Skaduar'
            const expCol     = expires <= 0 ? '#64748b' : expires < 3*3_600_000 ? '#ef4444' : '#22d3a5'
            return (
              <div key={app.id} className="app-card"
                style={{ padding:'22px', background:'rgba(255,255,255,0.02)', border:`1px solid ${hasOffered ? 'rgba(34,211,165,0.2)' : 'rgba(255,255,255,0.08)'}`, borderRadius:18, display:'flex', flexDirection:'column', transition:'all 0.2s', animation:`fadeUp 0.4s ease ${i*0.05}s both`, position:'relative' as const }}>

                {hasOffered && (
                  <div style={{ position:'absolute', top:14, right:14, fontSize:10, fontWeight:800, color:'#22d3a5', background:'rgba(34,211,165,0.1)', border:'1px solid rgba(34,211,165,0.25)', borderRadius:6, padding:'3px 9px' }}>✓ KE OFERTUAR</div>
                )}

                <div style={{ marginBottom:10 }}>
                  {app.categories && <span style={{ fontSize:11, color:'rgba(232,234,240,0.4)', display:'block', marginBottom:5 }}>{app.categories.icon} {app.categories.name}</span>}
                  <h3 style={{ fontWeight:700, fontSize:15, lineHeight:1.35, marginBottom:8, paddingRight: hasOffered ? 100 : 0 }}>{app.title}</h3>
                  <span style={{ fontFamily:'monospace', fontSize:11, fontWeight:700, color:expCol, background:`${expCol}15`, border:`1px solid ${expCol}30`, borderRadius:7, padding:'3px 9px' }}>⏱ {expLabel}</span>
                </div>

                <p style={{ fontSize:13, color:'rgba(232,234,240,0.5)', lineHeight:1.7, marginBottom:12, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' as any, overflow:'hidden' }}>
                  {app.description}
                </p>

                <div style={{ display:'flex', gap:12, flexWrap:'wrap' as const, marginBottom:14 }}>
                  <span style={{ fontSize:12, color:'rgba(232,234,240,0.4)' }}>📍 {app.city}</span>
                  {app.area_sqm   && <span style={{ fontSize:12, color:'rgba(232,234,240,0.4)' }}>📐 {app.area_sqm}m²</span>}
                  {app.budget_max && <span style={{ fontSize:12, color:'rgba(232,234,240,0.4)' }}>💰 deri €{app.budget_max.toLocaleString()}</span>}
                  <span style={{ fontSize:12, color:'rgba(232,234,240,0.4)' }}>💼 {app.offer_count} oferta</span>
                </div>

                {app.profiles && (
                  <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 0', borderTop:'1px solid rgba(255,255,255,0.05)', marginBottom:14 }}>
                    <div style={{ width:24, height:24, borderRadius:'50%', background:'linear-gradient(135deg,#60a5fa,#818cf8)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:800, color:'#fff' }}>
                      {app.profiles.full_name.slice(0,2).toUpperCase()}
                    </div>
                    <span style={{ fontSize:12, color:'rgba(232,234,240,0.4)' }}>{app.profiles.full_name}</span>
                  </div>
                )}

                <button onClick={() => !hasOffered ? openModal(app) : null} disabled={hasOffered}
                  style={{ width:'100%', padding:'11px', borderRadius:12, background: hasOffered ? 'rgba(34,211,165,0.08)' : 'linear-gradient(135deg,#10b981,#22d3a5)', border: hasOffered ? '1px solid rgba(34,211,165,0.2)' : 'none', color: hasOffered ? '#22d3a5' : '#fff', fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:'0.9rem', cursor: hasOffered ? 'not-allowed' : 'pointer', transition:'all 0.2s', marginTop:'auto', boxShadow: hasOffered ? 'none' : '0 4px 16px rgba(16,185,129,0.25)' }}>
                  {hasOffered ? '✓ Oferta u dërgua' : 'Dërgo Ofertë →'}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Offer Modal */}
      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999, padding:20, backdropFilter:'blur(10px)' }}>
          <div style={{ width:'100%', maxWidth:480, background:'#0d1117', border:'1px solid rgba(255,255,255,0.1)', borderRadius:22, overflow:'hidden', animation:'fadeUp 0.25s ease', boxShadow:'0 40px 100px rgba(0,0,0,0.6)' }}>
            <div style={{ padding:'20px 24px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:'1.1rem', fontWeight:900, marginBottom:4 }}>Dërgo Ofertë</h3>
                <p style={{ fontSize:13, color:'rgba(232,234,240,0.45)' }}>{modal.title}</p>
              </div>
              <button onClick={() => setModal(null)} style={{ width:30, height:30, borderRadius:8, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', color:'rgba(232,234,240,0.5)', cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
            </div>
            <div style={{ padding:'22px 24px' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
                <div>
                  <label style={{ display:'block', fontSize:11, fontWeight:700, color:'rgba(232,234,240,0.4)', textTransform:'uppercase' as const, letterSpacing:'0.07em', marginBottom:7 }}>Çmimi (€) <span style={{ color:'#10b981' }}>*</span></label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({...f, price:e.target.value}))}
                    placeholder="psh. 250" min="0"
                    onFocus={() => setFocused('price')} onBlur={() => setFocused(null)}
                    style={css('price')} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:11, fontWeight:700, color:'rgba(232,234,240,0.4)', textTransform:'uppercase' as const, letterSpacing:'0.07em', marginBottom:7 }}>Ditë pune <span style={{ color:'#10b981' }}>*</span></label>
                  <input type="number" value={form.duration_days} onChange={e => setForm(f => ({...f, duration_days:e.target.value}))}
                    placeholder="psh. 3" min="1"
                    onFocus={() => setFocused('days')} onBlur={() => setFocused(null)}
                    style={css('days')} />
                </div>
              </div>
              <div style={{ marginBottom:20 }}>
                <label style={{ display:'block', fontSize:11, fontWeight:700, color:'rgba(232,234,240,0.4)', textTransform:'uppercase' as const, letterSpacing:'0.07em', marginBottom:7 }}>Përshkrimi i ofertës</label>
                <textarea value={form.description} onChange={e => setForm(f => ({...f, description:e.target.value}))}
                  placeholder="Përshkruaj punën, materialet, dhe çfarë ofron..."
                  rows={3}
                  onFocus={() => setFocused('desc')} onBlur={() => setFocused(null)}
                  style={{ ...css('desc'), resize:'vertical' as const }} />
              </div>

              {error && <div style={{ marginBottom:14, padding:'10px 14px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:10, fontSize:13, color:'#fca5a5' }}>⚠️ {error}</div>}

              <div style={{ display:'flex', gap:10 }}>
                <button onClick={() => setModal(null)} style={{ flex:1, padding:'12px', borderRadius:11, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', color:'rgba(232,234,240,0.55)', fontFamily:'inherit', fontSize:13, fontWeight:600, cursor:'pointer' }}>Anulo</button>
                <button onClick={handleSendOffer} disabled={sending}
                  style={{ flex:2, padding:'12px', borderRadius:11, background: sending ? 'rgba(16,185,129,0.4)' : 'linear-gradient(135deg,#10b981,#22d3a5)', border:'none', color:'#fff', fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:'0.95rem', cursor: sending ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 4px 14px rgba(16,185,129,0.25)' }}>
                  {sending ? <><div style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid #fff', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />Duke dërguar...</> : '🚀 Dërgo Ofertën'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}