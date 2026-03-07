'use client'

import { useState } from 'react'

interface App {
  id: string; title: string; city: string
  budget_min: number | null; budget_max: number | null
  area_sqm: number | null; description: string
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
  const [focused,      setFocused]      = useState<string | null>(null)
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')

  async function handleSend() {
    if (!price || !durationDays) { setError('Çmimi dhe kohëzgjatja janë të detyrueshme.'); return }
    if (Number(price) <= 0)      { setError('Çmimi duhet të jetë pozitiv.'); return }
    if (Number(durationDays) <= 0) { setError('Kohëzgjatja duhet të jetë të paktën 1 ditë.'); return }

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
          description:    description.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Gabim gjatë dërgimit.'); return }
      onSuccess()
    } catch { setError('Problem me lidhjen.') }
    finally  { setLoading(false) }
  }

  const css = (name: string): React.CSSProperties => ({
    width: '100%',
    background: focused === name ? 'rgba(232,98,26,0.05)' : 'rgba(255,255,255,0.04)',
    border: `1px solid ${focused === name ? 'rgba(232,98,26,0.5)' : 'rgba(255,255,255,0.09)'}`,
    borderRadius: 10, padding: '11px 14px', fontSize: 14,
    color: '#e8eaf0', fontFamily: 'inherit', outline: 'none',
    transition: 'all 0.2s', boxSizing: 'border-box' as const,
  })

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.82)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999, padding:20, backdropFilter:'blur(10px)' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
      `}</style>

      <div style={{ width:'100%', maxWidth:500, background:'#0d1117', border:'1px solid rgba(255,255,255,0.1)', borderRadius:22, overflow:'hidden', animation:'fadeUp 0.25s ease', boxShadow:'0 40px 100px rgba(0,0,0,0.6)' }}>

        {/* Header */}
        <div style={{ padding:'20px 24px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:'1.15rem', fontWeight:900, marginBottom:4 }}>Dërgo Ofertë</h3>
            <p style={{ fontSize:13, color:'rgba(232,234,240,0.45)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' as const, maxWidth:340 }}>{app.title}</p>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:9, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(232,234,240,0.5)', cursor:'pointer', fontSize:15, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>

        <div style={{ padding:'24px' }}>

          {/* Project info */}
          <div style={{ display:'flex', gap:16, marginBottom:22, padding:'12px 16px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12 }}>
            <div style={{ fontSize:12, color:'rgba(232,234,240,0.45)', display:'flex', gap:16, flexWrap:'wrap' as const }}>
              <span>📍 {app.city}</span>
              {app.area_sqm   && <span>📐 {app.area_sqm}m²</span>}
              {app.budget_max && <span>💰 Buxheti: deri €{app.budget_max.toLocaleString()}</span>}
            </div>
          </div>

          {/* Price + Duration */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
            <div>
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:'rgba(232,234,240,0.4)', textTransform:'uppercase' as const, letterSpacing:'0.07em', marginBottom:7 }}>
                Çmimi total (€) <span style={{ color:'#e8621a' }}>*</span>
              </label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)}
                placeholder="psh. 1500" min="0"
                onFocus={() => setFocused('price')} onBlur={() => setFocused(null)}
                style={css('price')} />
              {app.budget_max && (
                <p style={{ fontSize:11, color:'rgba(232,234,240,0.3)', marginTop:5 }}>Buxheti i klientit: deri €{app.budget_max.toLocaleString()}</p>
              )}
            </div>
            <div>
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:'rgba(232,234,240,0.4)', textTransform:'uppercase' as const, letterSpacing:'0.07em', marginBottom:7 }}>
                Ditë pune <span style={{ color:'#e8621a' }}>*</span>
              </label>
              <input type="number" value={durationDays} onChange={e => setDurationDays(e.target.value)}
                placeholder="psh. 5" min="1"
                onFocus={() => setFocused('days')} onBlur={() => setFocused(null)}
                style={css('days')} />
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom:20 }}>
            <label style={{ display:'block', fontSize:11, fontWeight:700, color:'rgba(232,234,240,0.4)', textTransform:'uppercase' as const, letterSpacing:'0.07em', marginBottom:7 }}>
              Përshkrimi i ofertës <span style={{ color:'rgba(232,234,240,0.25)', textTransform:'none' as const, letterSpacing:0 }}>(opsional)</span>
            </label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Çfarë përfshin çmimi? Materialet? Garancia? Sa punëtorë do të punojnë?"
              rows={4}
              onFocus={() => setFocused('desc')} onBlur={() => setFocused(null)}
              style={{ ...css('desc'), resize:'vertical' as const, minHeight:100, lineHeight:1.6 }} />
          </div>

          {error && (
            <div style={{ marginBottom:16, padding:'11px 14px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:10, fontSize:13, color:'#fca5a5' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={onClose}
              style={{ flex:1, padding:'12px', borderRadius:12, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(232,234,240,0.6)', fontFamily:'inherit', fontSize:13, fontWeight:600, cursor:'pointer' }}>
              Anulo
            </button>
            <button onClick={handleSend} disabled={loading}
              style={{ flex:2, padding:'12px', borderRadius:12, background: loading ? 'rgba(232,98,26,0.5)' : 'linear-gradient(135deg,#e8621a,#ff7c35)', border:'none', color:'#fff', fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:'0.95rem', cursor: loading ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow: loading ? 'none' : '0 4px 16px rgba(232,98,26,0.25)', transition:'all 0.2s' }}>
              {loading
                ? <><div style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid #fff', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />Duke dërguar...</>
                : '🚀 Dërgo Ofertën'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}