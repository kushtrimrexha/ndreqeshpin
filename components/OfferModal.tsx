'use client'

import { useState } from 'react'

interface App {
  id:string; title:string; city:string
  budget_min:number|null; budget_max:number|null
  area_sqm:number|null; description:string
}

interface Props {
  app:       App
  companyId: string
  onClose:   () => void
  onSuccess: () => void
}

export default function OfferModal({ app, companyId, onClose, onSuccess }: Props) {
  const [price,        setPrice]        = useState(app.budget_max ? String(Math.round(app.budget_max * 0.85)) : '')
  const [durationDays, setDurationDays] = useState('')
  const [description,  setDescription]  = useState('')
  const [milestones,   setMilestones]   = useState([{ label:'', pct:100 }])
  const [showMiles,    setShowMiles]     = useState(false)
  const [focused,      setFocused]      = useState<string|null>(null)
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')

  const numPrice = Number(price)
  const pricePct  = app.budget_max && numPrice > 0 ? Math.round((numPrice / app.budget_max) * 100) : null
  const isOver    = app.budget_max && numPrice > app.budget_max
  const isGood    = app.budget_max && numPrice <= app.budget_max * 0.9

  function updateMilestone(i: number, key: 'label'|'pct', val: string|number) {
    setMilestones(m => m.map((x,j) => j===i ? {...x,[key]:val} : x))
  }
  function addMilestone() { setMilestones(m => [...m, { label:'', pct:0 }]) }
  function removeMilestone(i: number) { setMilestones(m => m.filter((_,j) => j!==i)) }

  async function handleSend() {
    if (!price || !durationDays)      { setError('Çmimi dhe kohëzgjatja janë të detyrueshme.'); return }
    if (Number(price) <= 0)           { setError('Çmimi duhet të jetë pozitiv.'); return }
    if (Number(durationDays) <= 0)    { setError('Kohëzgjatja duhet të jetë 1+ ditë.'); return }
    if (!description.trim())          { setError('Mesazhi për klientin është i detyrueshëm.'); return }

    setLoading(true); setError('')
    try {
      const res  = await fetch('/api/offers/create', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: app.id,
          company_id:     companyId,
          price:          Number(price),
          duration_days:  Number(durationDays),
          description:    description.trim(),
          ...(showMiles && milestones.some(m=>m.label) ? { milestones } : {}),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Gabim gjatë dërgimit.'); return }
      onSuccess()
    } catch { setError('Problem me lidhjen. Provo sërish.') }
    finally  { setLoading(false) }
  }

  const inp = (name: string): React.CSSProperties => ({
    width:'100%', background:focused===name?'rgba(232,98,26,0.05)':'rgba(255,255,255,0.03)',
    border:`1px solid ${focused===name?'rgba(232,98,26,0.5)':'rgba(255,255,255,0.08)'}`,
    borderRadius:10, padding:'11px 14px', fontSize:14, color:'#e8eaf0',
    fontFamily:'inherit', outline:'none', transition:'all 0.2s', boxSizing:'border-box' as const,
  })

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20, backdropFilter:'blur(12px)' }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:'100%', maxWidth:560, maxHeight:'90vh', overflowY:'auto', background:'#0d1117', border:'1px solid rgba(240,236,228,0.1)', borderRadius:22, fontFamily:"'DM Sans',sans-serif", color:'#e8eaf0', animation:'slideUp 0.25s ease' }}>
        <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(20px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>

        {/* Header */}
        <div style={{ padding:'20px 24px', borderBottom:'1px solid rgba(240,236,228,0.07)', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <p style={{ fontSize:10, fontWeight:700, color:'rgba(240,236,228,0.3)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:5 }}>💼 Dërgo Ofertë</p>
            <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:'1.1rem', fontWeight:900, lineHeight:1.3, marginBottom:4 }}>{app.title}</h3>
            <div style={{ display:'flex', gap:10, fontSize:11, color:'rgba(240,236,228,0.4)' }}>
              <span>📍 {app.city}</span>
              {app.area_sqm && <span>📐 {app.area_sqm}m²</span>}
            </div>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:9, background:'rgba(240,236,228,0.06)', border:'1px solid rgba(240,236,228,0.1)', color:'rgba(240,236,228,0.5)', cursor:'pointer', fontSize:15, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>✕</button>
        </div>

        {/* Budget info */}
        {(app.budget_min || app.budget_max) && (
          <div style={{ padding:'10px 24px', background:'rgba(240,236,228,0.02)', borderBottom:'1px solid rgba(240,236,228,0.06)', display:'flex', gap:20 }}>
            {app.budget_min && <div><div style={{ fontSize:10, color:'rgba(240,236,228,0.35)', marginBottom:2 }}>BUXHETI MIN</div><div style={{ fontSize:13, fontWeight:700, color:'#22d3a5' }}>€{app.budget_min.toLocaleString()}</div></div>}
            {app.budget_max && <div><div style={{ fontSize:10, color:'rgba(240,236,228,0.35)', marginBottom:2 }}>BUXHETI MAX</div><div style={{ fontSize:13, fontWeight:700, color:'#e8621a' }}>€{app.budget_max.toLocaleString()}</div></div>}
          </div>
        )}

        {/* Body */}
        <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>
          {error && <div style={{ padding:'10px 14px', background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:10, fontSize:13, color:'#f87171' }}>⚠️ {error}</div>}

          {/* Price + Duration */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:'rgba(240,236,228,0.4)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6 }}>Çmimi total (€) *</label>
              <input type="number" value={price} onChange={e=>setPrice(e.target.value)} placeholder={app.budget_max?`Sugjerim: €${Math.round(app.budget_max*0.85).toLocaleString()}`:'p.sh. 1200'} min="1" style={inp('price')} onFocus={()=>setFocused('price')} onBlur={()=>setFocused(null)}/>
            </div>
            <div>
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:'rgba(240,236,228,0.4)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6 }}>Ditë punë *</label>
              <input type="number" value={durationDays} onChange={e=>setDurationDays(e.target.value)} placeholder="p.sh. 7" min="1" style={inp('dur')} onFocus={()=>setFocused('dur')} onBlur={()=>setFocused(null)}/>
            </div>
          </div>

          {/* Price intelligence */}
          {pricePct !== null && numPrice > 0 && (
            <div style={{ padding:'12px 16px', background:isGood?'rgba(34,211,165,0.04)':isOver?'rgba(248,113,113,0.04)':'rgba(251,191,36,0.04)', border:`1px solid ${isGood?'rgba(34,211,165,0.15)':isOver?'rgba(248,113,113,0.15)':'rgba(251,191,36,0.15)'}`, borderRadius:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <span style={{ fontSize:12, fontWeight:700, color:isGood?'#22d3a5':isOver?'#f87171':'#fbbf24' }}>
                  {isGood ? `✓ ${Math.round((1-numPrice/app.budget_max!)*100)}% nën buxhetin e klientit` : isOver ? `⚠ ${Math.round((numPrice/app.budget_max!-1)*100)}% mbi buxhetin` : '◎ Brenda buxhetit'}
                </span>
                <span style={{ fontSize:11, color:'rgba(240,236,228,0.35)' }}>{pricePct}% e buxhetit</span>
              </div>
              <div style={{ height:4, background:'rgba(240,236,228,0.08)', borderRadius:10 }}>
                <div style={{ height:'100%', width:`${Math.min(120,pricePct)}%`, background:isGood?'#22d3a5':isOver?'#f87171':'#fbbf24', borderRadius:10, transition:'width 0.4s ease' }}/>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label style={{ display:'block', fontSize:11, fontWeight:700, color:'rgba(240,236,228,0.4)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6 }}>Mesazhi për klientin *</label>
            <textarea value={description} onChange={e=>setDescription(e.target.value)} rows={4} placeholder="Përshkruani qasjen tuaj, eksperiencën e ngjashme, dhe çfarë përfshin çmimi juaj. Klientët preferojnë oferta të detajuara..." style={{...inp('desc'),resize:'vertical',minHeight:90}} onFocus={()=>setFocused('desc')} onBlur={()=>setFocused(null)}/>
            <div style={{ fontSize:11, color:'rgba(240,236,228,0.3)', marginTop:4 }}>{description.length}/600 karaktere</div>
          </div>

          {/* Milestones toggle */}
          <div>
            <button onClick={() => setShowMiles(p=>!p)}
              style={{ width:'100%', padding:'10px 16px', borderRadius:11, background:'rgba(240,236,228,0.03)', border:'1px solid rgba(240,236,228,0.08)', color:'rgba(240,236,228,0.5)', fontFamily:'inherit', fontSize:12, fontWeight:700, cursor:'pointer', transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span>📅 Shto etapa punës <span style={{ fontSize:10, fontWeight:500 }}>(opsionale)</span></span>
              <span style={{ transition:'transform 0.2s', transform:showMiles?'rotate(180deg)':'none' }}>▾</span>
            </button>
            {showMiles && (
              <div style={{ marginTop:10, padding:'14px', background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:12, display:'flex', flexDirection:'column', gap:10 }}>
                {milestones.map((m,i) => (
                  <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 80px auto', gap:8, alignItems:'center' }}>
                    <input value={m.label} onChange={e=>updateMilestone(i,'label',e.target.value)} placeholder={`Etapa ${i+1} (p.sh. Përgatitja)`}
                      style={{ padding:'8px 12px', background:'rgba(240,236,228,0.04)', border:'1px solid rgba(240,236,228,0.08)', borderRadius:9, fontSize:12, color:'#f0ece4', fontFamily:'inherit', outline:'none' }}/>
                    <div style={{ position:'relative' }}>
                      <input type="number" value={m.pct} onChange={e=>updateMilestone(i,'pct',Number(e.target.value))} min="0" max="100" placeholder="%"
                        style={{ width:'100%', padding:'8px 28px 8px 12px', background:'rgba(240,236,228,0.04)', border:'1px solid rgba(240,236,228,0.08)', borderRadius:9, fontSize:12, color:'#f0ece4', fontFamily:'inherit', outline:'none' }}/>
                      <span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', fontSize:11, color:'rgba(240,236,228,0.4)' }}>%</span>
                    </div>
                    <button onClick={()=>removeMilestone(i)} style={{ width:30, height:30, borderRadius:8, background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.15)', color:'#f87171', cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
                  </div>
                ))}
                <button onClick={addMilestone} style={{ padding:'8px', borderRadius:9, background:'transparent', border:'1px dashed rgba(240,236,228,0.15)', color:'rgba(240,236,228,0.4)', fontFamily:'inherit', fontSize:12, cursor:'pointer' }}>+ Shto etapë</button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display:'flex', gap:10, marginTop:4 }}>
            <button onClick={onClose} style={{ flex:1, padding:'12px', borderRadius:12, background:'rgba(240,236,228,0.05)', border:'1px solid rgba(240,236,228,0.1)', color:'rgba(240,236,228,0.6)', fontFamily:'inherit', fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.2s' }}>Anulo</button>
            <button onClick={handleSend} disabled={loading} style={{ flex:2, padding:'12px', borderRadius:12, background:loading?'rgba(232,98,26,0.5)':'linear-gradient(135deg,#e8621a,#ff7c35)', border:'none', color:'#fff', fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:'0.95rem', cursor:loading?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 4px 14px rgba(232,98,26,0.25)', transition:'all 0.2s' }}>
              {loading ? <><div style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid #fff', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>Duke dërguar...</> : '🚀 Dërgo Ofertën'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}