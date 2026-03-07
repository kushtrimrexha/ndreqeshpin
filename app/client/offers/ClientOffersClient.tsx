'use client'

import { useState }      from 'react'
import Link              from 'next/link'
import AcceptOfferModal  from '@/components/AcceptOfferModal'

interface Offer {
  id: string; price: number; duration_days: number
  description: string; status: string; created_at: string
  applications: { id: string; title: string; city: string; status: string }
  companies:    { id: string; business_name: string; is_verified: boolean; rating_avg: number } | null
}

const STATUS: Record<string, { label: string; col: string }> = {
  pending:   { label: 'Në pritje',  col: '#fbbf24' },
  accepted:  { label: 'Pranuar',    col: '#22d3a5' },
  rejected:  { label: 'Refuzuar',   col: '#f87171' },
  withdrawn: { label: 'Tërhequr',   col: '#64748b' },
}

export default function ClientOffersClient({ offers }: { offers: Offer[] }) {
  const [filter,       setFilter]       = useState<'all'|'pending'|'accepted'|'rejected'>('all')
  const [acceptModal,  setAcceptModal]  = useState<Offer | null>(null)
  const [localOffers,  setLocalOffers]  = useState<Offer[]>(offers)
  const [toast,        setToast]        = useState('')

  const filtered = localOffers.filter(o => filter === 'all' || o.status === filter)

  // Group by application
  const grouped = filtered.reduce<Record<string, { appTitle: string; appId: string; appCity: string; appStatus: string; offers: Offer[] }>>((acc, o) => {
    const key = o.applications.id
    if (!acc[key]) acc[key] = { appTitle: o.applications.title, appId: o.applications.id, appCity: o.applications.city, appStatus: o.applications.status, offers: [] }
    acc[key].offers.push(o)
    return acc
  }, {})

  function handleAcceptSuccess(offerId: string) {
    setAcceptModal(null)
    setLocalOffers(prev => prev.map(o =>
      o.id === offerId ? { ...o, status: 'accepted' } :
      o.applications.id === prev.find(x => x.id === offerId)?.applications.id ? { ...o, status: 'rejected' } : o
    ))
    setToast('Oferta u pranua me sukses! 🎉')
    setTimeout(() => setToast(''), 4000)
  }

  const counts = {
    all:      localOffers.length,
    pending:  localOffers.filter(o => o.status === 'pending').length,
    accepted: localOffers.filter(o => o.status === 'accepted').length,
    rejected: localOffers.filter(o => o.status === 'rejected').length,
  }

  return (
    <div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 600, background: 'rgba(34,211,165,0.1)', border: '1px solid rgba(34,211,165,0.3)', color: '#22d3a5', padding: '14px 22px', borderRadius: 13, fontSize: 14, fontWeight: 600, boxShadow: '0 12px 40px rgba(0,0,0,0.4)', animation: 'fadeUp 0.3s ease' }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: '1.9rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 6 }}>Ofertat e mia</h1>
        <p style={{ fontSize: 14, color: 'rgba(232,234,240,0.45)' }}>{localOffers.length} oferta gjithsej nga kompanitë</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', padding: 4, borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)', alignSelf: 'flex-start', display: 'inline-flex', marginBottom: 28 }}>
        {(['all','pending','accepted','rejected'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '8px 16px', borderRadius: 9, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', background: filter === f ? '#e8621a' : 'transparent', color: filter === f ? '#fff' : 'rgba(232,234,240,0.45)', transition: 'all 0.2s', whiteSpace: 'nowrap' as const }}>
            {{ all: 'Të gjitha', pending: 'Në pritje', accepted: 'Pranuar', rejected: 'Refuzuar' }[f]} ({counts[f]})
          </button>
        ))}
      </div>

      {/* Empty */}
      {Object.keys(grouped).length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'rgba(232,234,240,0.3)' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>💼</div>
          <div style={{ fontFamily: "'Fraunces',serif", fontSize: '1.1rem', fontWeight: 800, marginBottom: 8 }}>Nuk ka oferta</div>
          <p style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>Posto një aplikim dhe merr oferta nga kompanitë.</p>
          <Link href="/client/applications/new" style={{ display: 'inline-block', padding: '11px 24px', background: 'linear-gradient(135deg,#e8621a,#ff7c35)', color: '#fff', borderRadius: 12, fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>+ Aplikim i Ri</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {Object.values(grouped).map((group, gi) => (
            <div key={group.appId} style={{ animation: `fadeUp 0.4s ease ${gi * 0.07}s both` }}>

              {/* Application header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, padding: '14px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{group.appTitle}</div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'rgba(232,234,240,0.45)' }}>
                    <span>📍 {group.appCity}</span>
                    <span>💼 {group.offers.length} oferta</span>
                    <span style={{ color: group.appStatus === 'active' ? '#22d3a5' : group.appStatus === 'accepted' ? '#60a5fa' : '#64748b', fontWeight: 700 }}>
                      ● {group.appStatus === 'active' ? 'Aktiv' : group.appStatus === 'accepted' ? 'Pranuar' : 'Skaduar'}
                    </span>
                  </div>
                </div>
                <Link href={`/client/applications/${group.appId}`}
                  style={{ fontSize: 12, color: '#e8621a', fontWeight: 700, textDecoration: 'none', padding: '7px 14px', border: '1px solid rgba(232,98,26,0.3)', borderRadius: 9, background: 'rgba(232,98,26,0.08)' }}>
                  Shiko →
                </Link>
              </div>

              {/* Offers list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 12, borderLeft: '2px solid rgba(255,255,255,0.06)' }}>
                {group.offers.map((offer, oi) => {
                  const st = STATUS[offer.status] || STATUS.pending
                  const canAccept = offer.status === 'pending' && group.appStatus === 'active'
                  return (
                    <div key={offer.id}
                      style={{ padding: '18px 20px', background: offer.status === 'accepted' ? 'rgba(34,211,165,0.05)' : 'rgba(255,255,255,0.02)', border: `1px solid ${offer.status === 'accepted' ? 'rgba(34,211,165,0.2)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 14, opacity: offer.status === 'rejected' ? 0.5 : 1, animation: `fadeUp 0.3s ease ${oi * 0.05}s both` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: offer.description ? 12 : 0 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <span style={{ fontWeight: 700, fontSize: 14 }}>{offer.companies?.business_name || 'Kompani'}</span>
                            {offer.companies?.is_verified && <span style={{ fontSize: 10, background: 'rgba(34,211,165,0.1)', color: '#22d3a5', border: '1px solid rgba(34,211,165,0.2)', borderRadius: 6, padding: '2px 8px', fontWeight: 700 }}>✓ Verified</span>}
                          </div>
                          <div style={{ display: 'flex', gap: 2, marginBottom: 4 }}>
                            {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: 12, color: s <= Math.round(offer.companies?.rating_avg || 0) ? '#fbbf24' : 'rgba(255,255,255,0.1)' }}>★</span>)}
                            <span style={{ fontSize: 11, color: 'rgba(232,234,240,0.35)', marginLeft: 4 }}>{(offer.companies?.rating_avg || 0).toFixed(1)}</span>
                          </div>
                          <div style={{ fontSize: 12, color: 'rgba(232,234,240,0.4)' }}>🕐 {offer.duration_days} ditë punë · {new Date(offer.created_at).toLocaleDateString('sq-AL')}</div>
                        </div>
                        <div style={{ textAlign: 'right' as const, flexShrink: 0 }}>
                          <div style={{ fontFamily: "'Fraunces',serif", fontSize: '1.8rem', fontWeight: 900, color: '#e8621a', lineHeight: 1 }}>€{offer.price.toLocaleString()}</div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: st.col, background: `${st.col}15`, border: `1px solid ${st.col}30`, borderRadius: 6, padding: '3px 10px', display: 'inline-block', marginTop: 6 }}>{st.label}</span>
                        </div>
                      </div>
                      {offer.description && (
                        <p style={{ fontSize: 13, color: 'rgba(232,234,240,0.5)', lineHeight: 1.7, marginBottom: canAccept ? 14 : 0 }}>{offer.description}</p>
                      )}
                      {canAccept && (
                        <button onClick={() => setAcceptModal(offer)}
                          style={{ padding: '10px 20px', borderRadius: 11, background: 'linear-gradient(135deg,#22d3a5,#10b981)', border: 'none', color: '#fff', fontFamily: "'Fraunces',serif", fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(34,211,165,0.25)', transition: 'all 0.2s' }}>
                          ✓ Prano Ofertën
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {acceptModal && (
        <AcceptOfferModal
          offer={acceptModal as any}
          applicationId={acceptModal.applications.id}
          applicationTitle={acceptModal.applications.title}
          onClose={() => setAcceptModal(null)}
          onSuccess={handleAcceptSuccess}
        />
      )}
    </div>
  )
}