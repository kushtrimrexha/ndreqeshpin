'use client'

import { useState }   from 'react'
import OfferModal      from '@/components/OfferModal'

interface Application {
  id: string; title: string; description: string; city: string
  area_sqm: number | null; budget_min: number | null; budget_max: number | null
  offer_count: number; expires_at: string; created_at: string; provider_type: string
  categories?: { name: string; icon: string }
  profiles?:   { full_name: string; city: string }
}
interface Company { id: string; business_name: string; is_verified: boolean; package_type: string }

function Countdown({ expiresAt }: { expiresAt: string }) {
  const [t, setT] = useState(() => {
    const diff = new Date(expiresAt).getTime() - Date.now()
    if (diff <= 0) return { label: 'Skaduar', col: '#64748b' }
    const h = Math.floor(diff / 3_600_000)
    const m = Math.floor((diff % 3_600_000) / 60_000)
    return { label: `${h}h ${m}m`, col: diff < 3 * 3_600_000 ? '#ef4444' : '#22d3a5' }
  })
  return <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: t.col, background: `${t.col}15`, border: `1px solid ${t.col}30`, borderRadius: 7, padding: '3px 9px' }}>⏱ {t.label}</span>
}

export default function CompanyApplicationsClient({ applications, offeredSet, company }: {
  applications: Application[]; offeredSet: string[]; company: Company
}) {
  const [search,   setSearch]   = useState('')
  const [category, setCategory] = useState('all')
  const [modal,    setModal]    = useState<Application | null>(null)
  const [offered,  setOffered]  = useState<Set<string>>(new Set(offeredSet))
  const [toast,    setToast]    = useState('')

  const categories = Array.from(new Set(applications.map(a => a.categories?.name).filter(Boolean)))

  const filtered = applications
    .filter(a => category === 'all' || a.categories?.name === category)
    .filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.city.toLowerCase().includes(search.toLowerCase()))

  function handleOfferSuccess() {
    if (!modal) return
    setOffered(prev => new Set([...prev, modal.id]))
    setModal(null)
    setToast('Oferta u dërgua me sukses! 🎉')
    setTimeout(() => setToast(''), 4000)
  }

  return (
    <div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}} .app-card:hover{border-color:rgba(255,255,255,0.14)!important;transform:translateY(-2px);}`}</style>

      {toast && (
        <div style={{ position:'fixed', top:20, right:20, zIndex:600, background:'rgba(34,211,165,0.1)', border:'1px solid rgba(34,211,165,0.3)', color:'#22d3a5', padding:'14px 22px', borderRadius:13, fontSize:14, fontWeight:600, animation:'fadeUp 0.3s ease' }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'1.9rem', fontWeight:900, letterSpacing:'-0.03em', marginBottom:6 }}>Aplikimet aktive</h1>
        <p style={{ fontSize:14, color:'rgba(232,234,240,0.45)' }}>{filtered.length} projekte aktive — dërgo ofertë dhe fito projektin</p>
      </div>

      {/* Search + filter */}
      <div style={{ display:'flex', gap:10, marginBottom:24, flexWrap:'wrap' as const }}>
        <div style={{ flex:1, minWidth:200, position:'relative' as const }}>
          <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', opacity:0.4 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Kërko titull ose qytet..."
            style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:11, padding:'10px 14px 10px 36px', fontSize:13, color:'#e8eaf0', fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }} />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)}
          style={{ padding:'10px 14px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:11, fontSize:13, color:'#e8eaf0', fontFamily:'inherit', outline:'none', cursor:'pointer' }}>
          <option value="all">Të gjitha kategoritë</option>
          {categories.map(c => <option key={c} value={c!}>{c}</option>)}
        </select>
      </div>

      {/* Unverified warning */}
      {!company.is_verified && (
        <div style={{ marginBottom:24, padding:'16px 20px', background:'rgba(251,191,36,0.07)', border:'1px solid rgba(251,191,36,0.2)', borderRadius:14, display:'flex', alignItems:'center', gap:14 }}>
          <span style={{ fontSize:24 }}>⏳</span>
          <div>
            <div style={{ fontWeight:700, color:'#fbbf24', marginBottom:3 }}>Kompania nuk është verifikuar ende</div>
            <p style={{ fontSize:13, color:'rgba(232,234,240,0.5)', lineHeight:1.6 }}>Pasi administratori të verifikojë kompaninë tuaj, mund të dërgoni oferta.</p>
          </div>
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'80px 20px', color:'rgba(232,234,240,0.3)' }}>
          <div style={{ fontSize:52, marginBottom:16 }}>📭</div>
          <div style={{ fontFamily:"'Fraunces',serif", fontSize:'1.1rem', fontWeight:800 }}>Nuk ka aplikime aktive</div>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))', gap:14 }}>
          {filtered.map((app, i) => {
            const hasOffered = offered.has(app.id)
            return (
              <div key={app.id} className="app-card"
                style={{ padding:'22px', background:'rgba(255,255,255,0.02)', border:`1px solid ${hasOffered ? 'rgba(34,211,165,0.2)' : 'rgba(255,255,255,0.08)'}`, borderRadius:18, display:'flex', flexDirection:'column', transition:'all 0.2s', animation:`fadeUp 0.4s ease ${i*0.05}s both`, position:'relative' as const }}>

                {hasOffered && (
                  <div style={{ position:'absolute', top:14, right:14, fontSize:10, fontWeight:800, color:'#22d3a5', background:'rgba(34,211,165,0.1)', border:'1px solid rgba(34,211,165,0.25)', borderRadius:6, padding:'3px 9px' }}>✓ KE OFERTUAR</div>
                )}

                <div style={{ marginBottom:12 }}>
                  {app.categories && <span style={{ fontSize:11, color:'rgba(232,234,240,0.4)', display:'block', marginBottom:5 }}>{app.categories.icon} {app.categories.name}</span>}
                  <h3 style={{ fontWeight:700, fontSize:15, lineHeight:1.35, marginBottom:8, paddingRight: hasOffered ? 100 : 0 }}>{app.title}</h3>
                  <Countdown expiresAt={app.expires_at} />
                </div>

                <p style={{ fontSize:13, color:'rgba(232,234,240,0.5)', lineHeight:1.7, marginBottom:14, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' as any, overflow:'hidden' }}>
                  {app.description}
                </p>

                <div style={{ display:'flex', gap:14, flexWrap:'wrap' as const, marginBottom:14 }}>
                  {[
                    { i:'📍', v: app.city },
                    app.area_sqm   ? { i:'📐', v:`${app.area_sqm} m²` }              : null,
                    app.budget_max ? { i:'💰', v:`deri €${app.budget_max.toLocaleString()}` } : null,
                    { i:'💼', v:`${app.offer_count} oferta` },
                  ].filter(Boolean).map((m,j) => (
                    <span key={j} style={{ fontSize:12, color:'rgba(232,234,240,0.4)' }}>{m!.i} {m!.v}</span>
                  ))}
                </div>

                {app.profiles && (
                  <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 0', borderTop:'1px solid rgba(255,255,255,0.05)', marginBottom:14 }}>
                    <div style={{ width:26, height:26, borderRadius:'50%', background:'linear-gradient(135deg,#60a5fa,#818cf8)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800, color:'#fff' }}>
                      {app.profiles.full_name.slice(0,2).toUpperCase()}
                    </div>
                    <span style={{ fontSize:12, color:'rgba(232,234,240,0.45)' }}>{app.profiles.full_name} · {app.profiles.city}</span>
                  </div>
                )}

                <button
                  onClick={() => company.is_verified && !hasOffered ? setModal(app) : null}
                  disabled={!company.is_verified || hasOffered}
                  style={{ width:'100%', padding:'12px', borderRadius:12, background: hasOffered ? 'rgba(34,211,165,0.08)' : company.is_verified ? 'linear-gradient(135deg,#e8621a,#ff7c35)' : 'rgba(255,255,255,0.05)', border: hasOffered ? '1px solid rgba(34,211,165,0.2)' : 'none', color: hasOffered ? '#22d3a5' : company.is_verified ? '#fff' : 'rgba(232,234,240,0.3)', fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:'0.9rem', cursor: company.is_verified && !hasOffered ? 'pointer' : 'not-allowed', transition:'all 0.2s', marginTop:'auto', boxShadow: company.is_verified && !hasOffered ? '0 4px 16px rgba(232,98,26,0.25)' : 'none' }}>
                  {hasOffered ? '✓ Oferta u dërgua' : company.is_verified ? 'Dërgo Ofertë →' : 'Prit verifikimin'}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {modal && (
        <OfferModal
          app={modal as any}
          companyId={company.id}
          onClose={() => setModal(null)}
          onSuccess={handleOfferSuccess}
        />
      )}
    </div>
  )
}