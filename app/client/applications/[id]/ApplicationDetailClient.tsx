'use client'

import { useState }     from 'react'
import Link             from 'next/link'
import AcceptOfferModal from '@/components/AcceptOfferModal'

interface Offer {
  id: string; price: number; duration_days: number
  description: string | null; status: string; created_at: string
  companies?: {
    id: string; business_name: string; is_verified: boolean; rating_avg: number; profile_id: string
    profiles?: { full_name: string; avatar_url?: string }
  } | null
  workers?: {
    id: string; bio?: string; skills?: string[]; rating_avg: number; experience_years?: number
    profiles?: { full_name: string; avatar_url?: string }
  } | null
}

interface Application {
  id: string; title: string; description: string; city: string
  area_sqm: number | null; budget_min: number | null; budget_max: number | null
  status: string; offer_count: number; provider_type: string
  expires_at: string; created_at: string
  categories?: { name: string; icon: string }
  profiles?:   { full_name: string; city: string; avatar_url?: string }
}

const STATUS_COL: Record<string, string> = {
  active:   '#22d3a5', accepted: '#60a5fa',
  expired:  '#64748b', cancelled: '#f87171',
}
const OFFER_STATUS: Record<string, { label: string; col: string }> = {
  pending:  { label: 'Në pritje', col: '#fbbf24' },
  accepted: { label: 'Pranuar',   col: '#22d3a5' },
  rejected: { label: 'Refuzuar',  col: '#f87171' },
}

function Stars({ r }: { r: number }) {
  return (
    <span>
      {[1,2,3,4,5].map(s => (
        <span key={s} style={{ color: s <= Math.round(r) ? '#fbbf24' : 'rgba(255,255,255,0.12)', fontSize: 13 }}>★</span>
      ))}
      <span style={{ fontSize: 11, color: 'rgba(232,234,240,0.4)', marginLeft: 4 }}>{r > 0 ? r.toFixed(1) : 'N/A'}</span>
    </span>
  )
}

function timeLeft(exp: string) {
  const diff = new Date(exp).getTime() - Date.now()
  if (diff <= 0) return { label: 'Skaduar', col: '#64748b' }
  const h = Math.floor(diff / 3_600_000)
  const m = Math.floor((diff % 3_600_000) / 60_000)
  return { label: `${h}h ${m}m`, col: diff < 3 * 3_600_000 ? '#ef4444' : '#22d3a5' }
}

export default function ApplicationDetailClient({ application, offers, profileId }: {
  application: Application; offers: Offer[]; profileId: string
}) {
  const [localOffers, setLocalOffers] = useState<Offer[]>(offers)
  const [acceptModal, setAcceptModal] = useState<Offer | null>(null)
  const [tab,         setTab]         = useState<'all'|'pending'|'accepted'>('all')
  const [toast,       setToast]       = useState('')
  const [sort,        setSort]        = useState<'price'|'rating'|'date'>('date')

  const timer = timeLeft(application.expires_at)
  const pending  = localOffers.filter(o => o.status === 'pending')
  const accepted = localOffers.find(o => o.status === 'accepted')

  const filtered = localOffers
    .filter(o => tab === 'all' || o.status === tab)
    .sort((a, b) => {
      if (sort === 'price')  return a.price - b.price
      if (sort === 'rating') {
        const ra = a.companies?.rating_avg || a.workers?.rating_avg || 0
        const rb = b.companies?.rating_avg || b.workers?.rating_avg || 0
        return rb - ra
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  function handleAcceptSuccess(offerId: string) {
    setAcceptModal(null)
    setLocalOffers(prev => prev.map(o =>
      o.id === offerId ? { ...o, status: 'accepted' } :
      o.applications?.id === application.id && o.status === 'pending' ? { ...o, status: 'rejected' } : o
    ))
    setToast('Oferta u pranua me sukses! 🎉')
    setTimeout(() => setToast(''), 4000)
  }

  const statusLabel = { active:'Aktiv', accepted:'Pranuar', expired:'Skaduar', cancelled:'Anuluar' }

  return (
    <div>
      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scaleIn { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
        .offer-card:hover  { border-color:rgba(255,255,255,0.15)!important; transform:translateY(-2px); }
      `}</style>

      {toast && (
        <div style={{ position:'fixed', top:20, right:20, zIndex:600, background:'rgba(34,211,165,0.1)', border:'1px solid rgba(34,211,165,0.3)', color:'#22d3a5', padding:'14px 22px', borderRadius:13, fontSize:14, fontWeight:600, animation:'fadeUp 0.3s ease', boxShadow:'0 12px 40px rgba(0,0,0,0.4)' }}>
          {toast}
        </div>
      )}

      {/* Back */}
      <Link href="/client/applications" style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:13, color:'rgba(232,234,240,0.4)', textDecoration:'none', marginBottom:20, fontWeight:600 }}>
        ← Kthehu tek aplikimet
      </Link>

      {/* ── APPLICATION HEADER ─────────────── */}
      <div style={{ padding:'28px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:22, marginBottom:20, animation:'fadeUp 0.4s ease' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:20, marginBottom:20 }}>
          <div style={{ flex:1 }}>
            {application.categories && (
              <span style={{ fontSize:11, color:'rgba(232,234,240,0.4)', display:'inline-flex', alignItems:'center', gap:5, marginBottom:10, background:'rgba(255,255,255,0.05)', padding:'4px 12px', borderRadius:7 }}>
                {application.categories.icon} {application.categories.name}
              </span>
            )}
            <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'1.7rem', fontWeight:900, letterSpacing:'-0.03em', marginBottom:12 }}>{application.title}</h1>
            <div style={{ display:'flex', gap:14, flexWrap:'wrap' as const }}>
              {[
                { i:'📍', v: application.city },
                application.area_sqm   ? { i:'📐', v:`${application.area_sqm}m²` } : null,
                application.budget_min || application.budget_max ? { i:'💰', v:`€${application.budget_min||0} – €${application.budget_max||'∞'}` } : null,
                { i:'📅', v: new Date(application.created_at).toLocaleDateString('sq-AL', { day:'numeric', month:'long', year:'numeric' }) },
              ].filter(Boolean).map((m,i) => (
                <span key={i} style={{ fontSize:13, color:'rgba(232,234,240,0.5)' }}>{m!.i} {m!.v}</span>
              ))}
            </div>
          </div>

          {/* Status + Timer */}
          <div style={{ textAlign:'right' as const, flexShrink:0 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:13, fontWeight:700, color: STATUS_COL[application.status] || '#64748b', background:`${STATUS_COL[application.status] || '#64748b'}15`, border:`1px solid ${STATUS_COL[application.status] || '#64748b'}30`, borderRadius:10, padding:'6px 14px', marginBottom:8 }}>
              ● {statusLabel[application.status as keyof typeof statusLabel] || application.status}
            </div>
            {application.status === 'active' && (
              <div style={{ display:'block', fontSize:12, fontWeight:700, color:timer.col, marginTop:4 }}>⏱ {timer.label} mbetur</div>
            )}
          </div>
        </div>

        {/* Description */}
        <div style={{ padding:'16px 18px', background:'rgba(255,255,255,0.03)', borderRadius:14, borderLeft:'3px solid rgba(232,98,26,0.4)' }}>
          <p style={{ fontSize:14, color:'rgba(232,234,240,0.65)', lineHeight:1.8 }}>{application.description}</p>
        </div>
      </div>

      {/* ── ACCEPTED OFFER BANNER ──────────── */}
      {accepted && (
        <div style={{ padding:'22px 24px', background:'rgba(34,211,165,0.06)', border:'1px solid rgba(34,211,165,0.25)', borderRadius:18, marginBottom:20, display:'flex', alignItems:'center', gap:18, animation:'scaleIn 0.4s ease' }}>
          <div style={{ width:52, height:52, borderRadius:15, background:'rgba(34,211,165,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, flexShrink:0 }}>✅</div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:800, fontSize:16, color:'#22d3a5', marginBottom:4 }}>Ofertë e pranuar!</div>
            <div style={{ fontSize:14, color:'rgba(232,234,240,0.6)' }}>
              <strong style={{ color:'#e8eaf0' }}>{accepted.companies?.business_name || accepted.workers?.profiles?.full_name}</strong>
              {' '}· €{accepted.price.toLocaleString()} · {accepted.duration_days} ditë
            </div>
          </div>
          <Link href="/client/messages"
            style={{ padding:'10px 20px', borderRadius:11, background:'rgba(34,211,165,0.15)', border:'1px solid rgba(34,211,165,0.3)', color:'#22d3a5', fontWeight:700, fontSize:13, textDecoration:'none' }}>
            💬 Dërgo mesazh →
          </Link>
        </div>
      )}

      {/* ── OFFERS SECTION ─────────────────── */}
      <div>
        {/* Header + controls */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18, gap:12, flexWrap:'wrap' as const }}>
          <div>
            <h2 style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:'1.2rem', marginBottom:4 }}>
              Ofertat e pranuara
            </h2>
            <p style={{ fontSize:13, color:'rgba(232,234,240,0.4)' }}>
              {localOffers.length} oferta gjithsej · {pending.length} në pritje
            </p>
          </div>

          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            {/* Sort */}
            <select value={sort} onChange={e => setSort(e.target.value as any)}
              style={{ padding:'8px 12px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:10, fontSize:12, color:'rgba(232,234,240,0.7)', fontFamily:'inherit', outline:'none', cursor:'pointer' }}>
              <option value="date">Rendit: Të reja</option>
              <option value="price">Rendit: Çmimi ↑</option>
              <option value="rating">Rendit: Vlerësimi ↓</option>
            </select>

            {/* Tab filter */}
            <div style={{ display:'flex', gap:3, background:'rgba(255,255,255,0.04)', padding:3, borderRadius:10, border:'1px solid rgba(255,255,255,0.07)' }}>
              {(['all','pending','accepted'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  style={{ padding:'6px 13px', borderRadius:8, border:'none', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit', background:tab===t ? '#e8621a' : 'transparent', color:tab===t ? '#fff' : 'rgba(232,234,240,0.4)', transition:'all 0.2s' }}>
                  {{ all:'Të gjitha', pending:'Pritje', accepted:'Pranuar' }[t]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Offers */}
        {filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 20px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:20, color:'rgba(232,234,240,0.3)' }}>
            <div style={{ fontSize:52, marginBottom:16 }}>📭</div>
            <div style={{ fontFamily:"'Fraunces',serif", fontSize:'1.1rem', fontWeight:800, marginBottom:8 }}>
              {localOffers.length === 0 ? 'Nuk ka oferta ende' : 'Nuk ka oferta për këtë filtër'}
            </div>
            <p style={{ fontSize:13, lineHeight:1.7 }}>
              {localOffers.length === 0 ? 'Oferta do të arrijnë brenda 24 orësh.' : 'Ndrysho filtrin për të parë të tjera.'}
            </p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {filtered.map((offer, i) => {
              const isComp   = !!offer.companies
              const name     = isComp ? offer.companies!.business_name : offer.workers?.profiles?.full_name || 'Punëtor'
              const rating   = isComp ? offer.companies!.rating_avg    : offer.workers?.rating_avg || 0
              const verified = isComp && offer.companies!.is_verified
              const skills   = offer.workers?.skills || []
              const st       = OFFER_STATUS[offer.status] || OFFER_STATUS.pending
              const isAccepted = offer.status === 'accepted'
              const canAccept  = offer.status === 'pending' && application.status === 'active'
              const initials   = name.slice(0,2).toUpperCase()

              return (
                <div key={offer.id} className="offer-card"
                  style={{ padding:'24px', background: isAccepted ? 'rgba(34,211,165,0.04)' : 'rgba(255,255,255,0.02)', border:`1px solid ${isAccepted ? 'rgba(34,211,165,0.25)' : 'rgba(255,255,255,0.09)'}`, borderRadius:18, transition:'all 0.2s', animation:`fadeUp 0.35s ease ${i*0.06}s both`, opacity: offer.status === 'rejected' ? 0.45 : 1 }}>

                  <div style={{ display:'flex', gap:16, alignItems:'flex-start' }}>
                    {/* Avatar */}
                    <div style={{ width:52, height:52, borderRadius:15, background: isComp ? 'linear-gradient(135deg,#e8621a,#ff7c35)' : 'linear-gradient(135deg,#10b981,#22d3a5)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:18, color:'#fff', flexShrink:0, boxShadow: isComp ? '0 4px 16px rgba(232,98,26,0.25)' : '0 4px 16px rgba(16,185,129,0.25)' }}>
                      {initials}
                    </div>

                    {/* Info */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5, flexWrap:'wrap' as const }}>
                        <span style={{ fontWeight:800, fontSize:16 }}>{name}</span>
                        {verified && <span style={{ fontSize:10, fontWeight:700, color:'#22d3a5', background:'rgba(34,211,165,0.1)', border:'1px solid rgba(34,211,165,0.25)', borderRadius:6, padding:'2px 8px' }}>✓ Verified</span>}
                        <span style={{ fontSize:10, fontWeight:700, color: isComp ? '#e8621a' : '#22d3a5', background: isComp ? 'rgba(232,98,26,0.1)' : 'rgba(16,185,129,0.1)', borderRadius:6, padding:'2px 8px' }}>
                          {isComp ? '🏢 Kompani' : '🔧 Punëtor'}
                        </span>
                      </div>

                      <div style={{ marginBottom:8 }}><Stars r={rating} /></div>

                      {offer.workers?.experience_years && (
                        <div style={{ fontSize:12, color:'rgba(232,234,240,0.4)', marginBottom:6 }}>
                          🏆 {offer.workers.experience_years} vite eksperience
                        </div>
                      )}

                      {skills.length > 0 && (
                        <div style={{ display:'flex', gap:5, flexWrap:'wrap' as const, marginBottom:8 }}>
                          {skills.slice(0,4).map(s => (
                            <span key={s} style={{ fontSize:11, color:'rgba(34,211,165,0.8)', background:'rgba(34,211,165,0.08)', border:'1px solid rgba(34,211,165,0.18)', borderRadius:6, padding:'2px 9px' }}>{s}</span>
                          ))}
                          {skills.length > 4 && <span style={{ fontSize:11, color:'rgba(232,234,240,0.35)' }}>+{skills.length-4}</span>}
                        </div>
                      )}

                      {offer.description && (
                        <p style={{ fontSize:13, color:'rgba(232,234,240,0.55)', lineHeight:1.7, marginTop:8, padding:'12px 14px', background:'rgba(255,255,255,0.03)', borderRadius:10, borderLeft:'2px solid rgba(255,255,255,0.1)' }}>
                          {offer.description}
                        </p>
                      )}
                    </div>

                    {/* Price + Action */}
                    <div style={{ textAlign:'right' as const, flexShrink:0 }}>
                      <div style={{ fontFamily:"'Fraunces',serif", fontSize:'2rem', fontWeight:900, color:'#e8621a', lineHeight:1, marginBottom:4 }}>
                        €{offer.price.toLocaleString()}
                      </div>
                      <div style={{ fontSize:12, color:'rgba(232,234,240,0.4)', marginBottom:10 }}>
                        🕐 {offer.duration_days} ditë
                      </div>
                      <span style={{ display:'inline-block', fontSize:11, fontWeight:700, color:st.col, background:`${st.col}15`, border:`1px solid ${st.col}30`, borderRadius:8, padding:'4px 12px', marginBottom:12 }}>
                        {st.label}
                      </span>
                      <div style={{ fontSize:11, color:'rgba(232,234,240,0.3)' }}>
                        {new Date(offer.created_at).toLocaleDateString('sq-AL', { day:'numeric', month:'short' })}
                      </div>

                      {canAccept && (
                        <button onClick={() => setAcceptModal(offer)}
                          style={{ marginTop:12, padding:'10px 20px', borderRadius:11, background:'linear-gradient(135deg,#22d3a5,#10b981)', border:'none', color:'#fff', fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:'0.88rem', cursor:'pointer', boxShadow:'0 4px 14px rgba(34,211,165,0.3)', transition:'all 0.2s', display:'block', width:'100%' }}>
                          ✓ Prano
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Accept Modal */}
      {acceptModal && (
        <AcceptOfferModal
          offer={acceptModal as any}
          applicationId={application.id}
          applicationTitle={application.title}
          onClose={() => setAcceptModal(null)}
          onSuccess={handleAcceptSuccess}
        />
      )}
    </div>
  )
}