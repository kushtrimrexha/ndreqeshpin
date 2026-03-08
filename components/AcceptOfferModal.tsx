'use client'

import { useState } from 'react'

interface Offer {
  id:string; price:number; duration_days:number; description:string|null
  companies?: { business_name:string; rating_avg:number; is_verified:boolean } | null
}
interface Application { id:string; title:string }

interface Props {
  offer:       Offer
  application: Application
  onClose:     () => void
  onAccepted:  () => void
}

export default function AcceptOfferModal({ offer, application, onClose, onAccepted }: Props) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [step,    setStep]    = useState<'confirm'|'success'>('confirm')

  const completionDate = new Date()
  completionDate.setDate(completionDate.getDate() + offer.duration_days)

  async function handleAccept() {
    setLoading(true); setError('')
    try {
      const res  = await fetch('/api/offers/accept', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId: offer.id, applicationId: application.id }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Gabim gjatë pranimit.'); return }
      setStep('success')
      setTimeout(onAccepted, 2200)
    } catch { setError('Problem me lidhjen. Provo sërish.') }
    finally  { setLoading(false) }
  }

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20, backdropFilter:'blur(12px)' }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:'100%', maxWidth:440, background:'#0d1117', border:'1px solid rgba(240,236,228,0.1)', borderRadius:22, fontFamily:"'DM Sans',sans-serif", color:'#e8eaf0', overflow:'hidden', animation:'slideUp 0.25s ease' }}>
        <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(20px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}} @keyframes spin{to{transform:rotate(360deg)}} @keyframes pop{0%{transform:scale(0)}60%{transform:scale(1.2)}100%{transform:scale(1)}}`}</style>

        {step === 'confirm' ? (
          <>
            {/* Header */}
            <div style={{ padding:'20px 24px', borderBottom:'1px solid rgba(240,236,228,0.07)' }}>
              <p style={{ fontSize:10, fontWeight:700, color:'rgba(240,236,228,0.3)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:6 }}>✅ Konfirmo Pranimin</p>
              <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:'1.05rem', fontWeight:900, lineHeight:1.3 }}>{application.title}</h3>
            </div>

            {/* Offer summary */}
            <div style={{ padding:'18px 24px', display:'flex', flexDirection:'column', gap:14 }}>
              {/* Company */}
              {offer.companies && (
                <div style={{ padding:'14px', background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:12, display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:42, height:42, borderRadius:12, background:'linear-gradient(135deg,#e8621a,#ff7c35)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:16, color:'#fff', flexShrink:0 }}>
                    {(offer.companies.business_name||'K').slice(0,2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
                      {offer.companies.business_name}
                      {offer.companies.is_verified && <span style={{ fontSize:10, color:'#22d3a5', background:'rgba(34,211,165,0.1)', border:'1px solid rgba(34,211,165,0.2)', borderRadius:5, padding:'1px 7px' }}>✓ Verified</span>}
                    </div>
                    {offer.companies.rating_avg > 0 && (
                      <div style={{ fontSize:12, color:'rgba(240,236,228,0.4)', display:'flex', alignItems:'center', gap:4 }}>
                        {'★'.repeat(Math.round(offer.companies.rating_avg))}{'☆'.repeat(5-Math.round(offer.companies.rating_avg))} <span>{offer.companies.rating_avg.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Key metrics */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
                {[
                  { icon:'💰', label:'Çmimi', value:`€${offer.price.toLocaleString()}`, color:'#22d3a5' },
                  { icon:'📅', label:'Kohëzgjatja', value:`${offer.duration_days} ditë`, color:'#3b82f6' },
                  { icon:'🏁', label:'Mbarim', value:completionDate.toLocaleDateString('sq-AL',{day:'numeric',month:'short'}), color:'#fbbf24' },
                ].map((m,i) => (
                  <div key={i} style={{ padding:'12px', background:'rgba(240,236,228,0.02)', border:`1px solid ${m.color}15`, borderRadius:11, textAlign:'center' }}>
                    <div style={{ fontSize:18, marginBottom:5 }}>{m.icon}</div>
                    <div style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:'1.05rem', color:m.color, marginBottom:2 }}>{m.value}</div>
                    <div style={{ fontSize:10, color:'rgba(240,236,228,0.35)' }}>{m.label}</div>
                  </div>
                ))}
              </div>

              {/* Description */}
              {offer.description && (
                <div style={{ padding:'12px 14px', background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.06)', borderRadius:11, borderLeft:'3px solid rgba(232,98,26,0.4)' }}>
                  <div style={{ fontSize:10, fontWeight:700, color:'rgba(240,236,228,0.3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>Mesazhi i kompanisë</div>
                  <p style={{ fontSize:12, color:'rgba(240,236,228,0.55)', lineHeight:1.65 }}>{offer.description}</p>
                </div>
              )}

              {/* Warning */}
              <div style={{ padding:'11px 14px', background:'rgba(251,191,36,0.04)', border:'1px solid rgba(251,191,36,0.15)', borderRadius:10, fontSize:12, color:'rgba(240,236,228,0.5)', lineHeight:1.6 }}>
                ⚠️ Duke pranuar ofertën, aplikimet e tjera do të mbyllen automatikisht.
              </div>

              {error && <div style={{ padding:'10px 14px', background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:10, fontSize:13, color:'#f87171' }}>⚠️ {error}</div>}

              {/* Actions */}
              <div style={{ display:'flex', gap:10, marginTop:4 }}>
                <button onClick={onClose} style={{ flex:1, padding:'12px', borderRadius:12, background:'rgba(240,236,228,0.05)', border:'1px solid rgba(240,236,228,0.1)', color:'rgba(240,236,228,0.6)', fontFamily:'inherit', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                  Anulo
                </button>
                <button onClick={handleAccept} disabled={loading} style={{ flex:2, padding:'12px', borderRadius:12, background:loading?'rgba(34,211,165,0.5)':'linear-gradient(135deg,#22d3a5,#10b981)', border:'none', color:'#fff', fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:'0.95rem', cursor:loading?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 4px 14px rgba(34,211,165,0.2)', transition:'all 0.2s' }}>
                  {loading ? <><div style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid #fff', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>Duke pranuar...</> : '✓ Prano Ofertën'}
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Success state */
          <div style={{ padding:'48px 24px', textAlign:'center' }}>
            <div style={{ fontSize:64, marginBottom:16, animation:'pop 0.5s ease' }}>🎉</div>
            <h3 style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:'1.4rem', marginBottom:8, color:'#22d3a5' }}>Oferta u pranua!</h3>
            <p style={{ fontSize:13, color:'rgba(240,236,228,0.5)', lineHeight:1.7 }}>Kompania do të njoftohet menjëherë dhe punët mund të fillojnë sipas planit.</p>
          </div>
        )}
      </div>
    </div>
  )
}