'use client'

import { useState } from 'react'

interface Offer {
  id: string; price: number; duration_days: number; description: string
  companies?: { business_name?: string; full_name?: string; rating_avg?: number; is_verified?: boolean } | null
  profiles?:  { full_name?: string; rating_avg?: number } | null
}

interface Props {
  offer:            Offer
  applicationId:    string
  applicationTitle: string
  onClose:          () => void
  onSuccess:        (offerId: string) => void
}

export default function AcceptOfferModal({ offer, applicationId, applicationTitle, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [step,    setStep]    = useState<'confirm' | 'success'>('confirm')

  const senderName = offer.companies?.business_name || offer.companies?.full_name || offer.profiles?.full_name || 'Profesionist'

  async function handleAccept() {
    setLoading(true); setError('')
    try {
      const res  = await fetch('/api/offers/accept', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ offer_id: offer.id }) })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Gabim gjatë pranimit.'); return }
      setStep('success')
    } catch { setError('Gabim rrjeti. Provo sërish.') }
    finally   { setLoading(false) }
  }

  return (
    <>
      <style>{`
        @keyframes modalIn { from{opacity:0;transform:scale(0.95) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes confetti{ 0%{opacity:1;transform:translateY(0) rotate(0)} 100%{opacity:0;transform:translateY(-80px) rotate(360deg)} }
      `}</style>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
        <div onClick={e => e.stopPropagation()} style={{ background:'#0d1117', border:'1px solid rgba(255,255,255,0.1)', borderRadius:24, padding:32, width:'100%', maxWidth:460, animation:'modalIn 0.22s ease', fontFamily:"'DM Sans',sans-serif", color:'#e8eaf0' }}>

          {step === 'confirm' ? (
            <>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
                <div style={{ fontFamily:"'Fraunces',serif", fontSize:'1.35rem', fontWeight:900, letterSpacing:'-0.03em' }}>Prano ofertën</div>
                <button onClick={onClose} style={{ width:32, height:32, borderRadius:9, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', color:'rgba(232,234,240,0.5)', cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
              </div>

              {/* Offer details */}
              <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:20, marginBottom:20 }}>
                <div style={{ fontSize:12, color:'rgba(232,234,240,0.4)', marginBottom:6, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em' }}>Projekti</div>
                <div style={{ fontWeight:700, fontSize:15, marginBottom:16 }}>{applicationTitle}</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  {[['Ofertues', senderName],['Çmimi', `€${offer.price.toLocaleString()}`],['Kohëzgjatja', `${offer.duration_days} ditë`]].map(([l,v]) => (
                    <div key={l} style={{ background:'rgba(255,255,255,0.03)', borderRadius:10, padding:'12px 14px' }}>
                      <div style={{ fontSize:11, color:'rgba(232,234,240,0.4)', marginBottom:4, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>{l}</div>
                      <div style={{ fontSize:14, fontWeight:700 }}>{v}</div>
                    </div>
                  ))}
                </div>
                {offer.description && (
                  <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid rgba(255,255,255,0.07)' }}>
                    <div style={{ fontSize:11, color:'rgba(232,234,240,0.4)', marginBottom:6, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>Përshkrimi</div>
                    <div style={{ fontSize:13, color:'rgba(232,234,240,0.65)', lineHeight:1.75 }}>{offer.description}</div>
                  </div>
                )}
              </div>

              <div style={{ background:'rgba(251,191,36,0.06)', border:'1px solid rgba(251,191,36,0.2)', borderRadius:12, padding:'12px 16px', marginBottom:22, fontSize:13, color:'rgba(251,191,36,0.9)', lineHeight:1.6 }}>
                ⚠️ Pasi të pranosh, oferta bëhet aktive dhe të gjitha ofertat e tjera refuzohen automatikisht.
              </div>

              {error && <div style={{ background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:10, padding:'10px 14px', fontSize:13, color:'#f87171', marginBottom:16 }}>{error}</div>}

              <div style={{ display:'flex', gap:10 }}>
                <button onClick={onClose} disabled={loading} style={{ flex:1, padding:'12px', borderRadius:12, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', color:'rgba(232,234,240,0.7)', fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600, cursor:'pointer' }}>Anulo</button>
                <button onClick={handleAccept} disabled={loading} style={{ flex:2, padding:'12px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#22d3a5,#10b981)', color:'#fff', fontFamily:"'Fraunces',serif", fontSize:15, fontWeight:700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 4px 16px rgba(34,211,165,0.25)' }}>
                  {loading ? <><div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid #fff', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />Duke pranuar...</> : '✅ Prano Ofertën'}
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign:'center', padding:'16px 0' }}>
              <div style={{ fontSize:56, marginBottom:16, animation:'confetti 0.8s ease' }}>🎉</div>
              <div style={{ fontFamily:"'Fraunces',serif", fontSize:'1.6rem', fontWeight:900, letterSpacing:'-0.04em', marginBottom:10 }}>Oferta u pranua!</div>
              <div style={{ fontSize:14, color:'rgba(232,234,240,0.55)', lineHeight:1.75, maxWidth:320, margin:'0 auto 28px' }}>Profesionisti u njoftua. Fillo bisedën nga seksioni i Mesazheve.</div>
              <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
                <a href="/client/messages" style={{ padding:'12px 24px', borderRadius:12, background:'linear-gradient(135deg,#60a5fa,#3b82f6)', color:'#fff', fontFamily:"'Fraunces',serif", fontWeight:700, fontSize:14, textDecoration:'none' }}>💬 Hap Mesazhet</a>
                <button onClick={() => onSuccess(offer.id)} style={{ padding:'12px 24px', borderRadius:12, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', color:'rgba(232,234,240,0.7)', fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600, cursor:'pointer' }}>Mbyll</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}