'use client'

import { useState } from 'react'

interface Offer {
  id: string; price: number; duration_days: number
  description: string|null; status: string; created_at: string
  applications?: { id:string; title:string; city:string } | null
  companies?:   { id:string; business_name:string; is_verified:boolean } | null
  workers?:     { id:string; profiles?: { full_name:string } | null } | null
}

const ST: Record<string, { label:string; col:string }> = {
  pending:   { label:'Në pritje', col:'#fbbf24' },
  accepted:  { label:'Pranuar',   col:'#22d3a5' },
  rejected:  { label:'Refuzuar',  col:'#f87171' },
  withdrawn: { label:'Tërhequr',  col:'#64748b' },
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const days = Math.floor(diff / 86_400_000)
  if (days === 0) return 'Sot'
  if (days < 7)   return `${days}d`
  return `${Math.floor(days/30)||1}m`
}

export default function AdminOffersClient({ offers }: { offers: Offer[] }) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [type,   setType]   = useState<'all'|'company'|'worker'>('all')

  const filtered = offers
    .filter(o => status === 'all' || o.status === status)
    .filter(o => type   === 'all' || (type==='company' ? !!o.companies : !!o.workers))
    .filter(o => {
      const q = search.toLowerCase()
      return (
        (o.applications?.title || '').toLowerCase().includes(q) ||
        (o.companies?.business_name || '').toLowerCase().includes(q) ||
        (o.workers?.profiles?.full_name || '').toLowerCase().includes(q)
      )
    })

  const counts = {
    all:      offers.length,
    pending:  offers.filter(o=>o.status==='pending').length,
    accepted: offers.filter(o=>o.status==='accepted').length,
    rejected: offers.filter(o=>o.status==='rejected').length,
  }

  const totalAcceptedValue = offers
    .filter(o => o.status === 'accepted')
    .reduce((s,o) => s + o.price, 0)

  const avgPrice = offers.length > 0
    ? Math.round(offers.reduce((s,o) => s + o.price, 0) / offers.length) : 0

  return (
    <div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}} .off-row:hover{background:rgba(255,255,255,0.03)!important;}`}</style>

      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'1.9rem', fontWeight:900, letterSpacing:'-0.03em', marginBottom:6 }}>Ofertat</h1>
        <p style={{ fontSize:14, color:'rgba(232,234,240,0.45)' }}>
          {counts.accepted} pranuar · vlera totale €{totalAcceptedValue.toLocaleString()} · mesatare €{avgPrice.toLocaleString()}
        </p>
      </div>

      {/* KPI strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10, marginBottom:24 }}>
        {[
          { icon:'💼', label:'Gjithsej',   val:counts.all,                                            col:'#e8621a' },
          { icon:'⏳', label:'Në pritje',  val:counts.pending,                                        col:'#fbbf24' },
          { icon:'✅', label:'Pranuar',    val:counts.accepted,                                       col:'#22d3a5' },
          { icon:'💰', label:'Vlera pran.',val:`€${(totalAcceptedValue/1000).toFixed(1)}k`,           col:'#60a5fa' },
          { icon:'📊', label:'Mesatare',   val:`€${avgPrice.toLocaleString()}`,                       col:'#a78bfa' },
        ].map((s,i) => (
          <div key={i} style={{ padding:'16px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, animation:`fadeUp 0.4s ease ${i*0.07}s both` }}>
            <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:10 }}>
              <span>{s.icon}</span>
              <span style={{ fontSize:11, color:'rgba(232,234,240,0.4)' }}>{s.label}</span>
            </div>
            <div style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:'1.6rem', color:s.col, lineHeight:1 }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' as const }}>
        <div style={{ position:'relative' as const, flex:1, minWidth:200 }}>
          <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', opacity:0.35 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Kërko projekt, kompani, punëtor..."
            style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:11, padding:'10px 14px 10px 36px', fontSize:13, color:'#e8eaf0', fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }} />
        </div>
        <div style={{ display:'flex', gap:3, background:'rgba(255,255,255,0.04)', padding:3, borderRadius:11, border:'1px solid rgba(255,255,255,0.07)' }}>
          {(['all','pending','accepted','rejected'] as const).map(s => (
            <button key={s} onClick={() => setStatus(s)}
              style={{ padding:'7px 13px', borderRadius:9, border:'none', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', background:status===s ? '#e8621a' : 'transparent', color:status===s ? '#fff' : 'rgba(232,234,240,0.45)', transition:'all 0.2s', whiteSpace:'nowrap' as const }}>
              {{ all:'Të gjitha', pending:'Pritje', accepted:'Pranuar', rejected:'Refuzuar' }[s]} ({counts[s as keyof typeof counts] ?? offers.filter(o=>o.status===s).length})
            </button>
          ))}
        </div>
        <div style={{ display:'flex', gap:3, background:'rgba(255,255,255,0.04)', padding:3, borderRadius:11, border:'1px solid rgba(255,255,255,0.07)' }}>
          {(['all','company','worker'] as const).map(t => (
            <button key={t} onClick={() => setType(t)}
              style={{ padding:'7px 13px', borderRadius:9, border:'none', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', background:type===t ? '#a78bfa' : 'transparent', color:type===t ? '#fff' : 'rgba(232,234,240,0.45)', transition:'all 0.2s' }}>
              {{ all:'Të dyja', company:'🏢 Kompani', worker:'🔧 Punëtor' }[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, overflow:'hidden' }}>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1.5fr 90px 70px 90px 60px', gap:10, padding:'12px 20px', borderBottom:'1px solid rgba(255,255,255,0.07)', fontSize:11, fontWeight:700, color:'rgba(232,234,240,0.3)', textTransform:'uppercase' as const, letterSpacing:'0.07em' }}>
          <span>Projekti</span><span>Ofertues</span>
          <span style={{ textAlign:'center' as const }}>Çmimi</span>
          <span style={{ textAlign:'center' as const }}>Ditë</span>
          <span style={{ textAlign:'center' as const }}>Statusi</span>
          <span style={{ textAlign:'center' as const }}>Data</span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px', color:'rgba(232,234,240,0.3)' }}>
            <div style={{ fontSize:42, marginBottom:12 }}>💼</div>
            <div style={{ fontFamily:"'Fraunces',serif", fontWeight:800 }}>Nuk ka oferta</div>
          </div>
        ) : filtered.map((offer,i) => {
          const st     = ST[offer.status] || ST.pending
          const isComp = !!offer.companies
          const sender = isComp ? offer.companies!.business_name : offer.workers?.profiles?.full_name || 'Punëtor'
          return (
            <div key={offer.id} className="off-row"
              style={{ display:'grid', gridTemplateColumns:'2fr 1.5fr 90px 70px 90px 60px', gap:10, padding:'14px 20px', borderBottom: i < filtered.length-1 ? '1px solid rgba(255,255,255,0.05)' : 'none', alignItems:'center', transition:'background 0.15s', animation:`fadeUp 0.3s ease ${i*0.03}s both`, background: offer.status==='accepted' ? 'rgba(34,211,165,0.02)' : 'transparent' }}>

              <div style={{ minWidth:0 }}>
                <div style={{ fontWeight:700, fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' as const, marginBottom:3 }}>
                  {offer.applications?.title || '—'}
                </div>
                {offer.applications?.city && (
                  <div style={{ fontSize:11, color:'rgba(232,234,240,0.35)' }}>📍 {offer.applications.city}</div>
                )}
              </div>

              <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:0 }}>
                <div style={{ width:28, height:28, borderRadius:8, background: isComp ? 'linear-gradient(135deg,#e8621a,#ff7c35)' : 'linear-gradient(135deg,#10b981,#22d3a5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:'#fff', flexShrink:0 }}>
                  {sender.slice(0,2).toUpperCase()}
                </div>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' as const }}>{sender}</div>
                  <div style={{ fontSize:10, color: isComp ? '#e8621a' : '#22d3a5' }}>
                    {isComp ? '🏢' : '🔧'} {isComp ? 'Kompani' : 'Punëtor'}
                    {isComp && offer.companies!.is_verified && <span style={{ marginLeft:4, color:'#22d3a5' }}>✓</span>}
                  </div>
                </div>
              </div>

              <div style={{ textAlign:'center' as const }}>
                <span style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:'1.1rem', color:'#e8621a' }}>
                  €{offer.price.toLocaleString()}
                </span>
              </div>

              <div style={{ textAlign:'center' as const, fontSize:13, color:'rgba(232,234,240,0.55)' }}>
                {offer.duration_days}d
              </div>

              <div style={{ textAlign:'center' as const }}>
                <span style={{ fontSize:11, fontWeight:700, color:st.col, background:`${st.col}15`, border:`1px solid ${st.col}30`, borderRadius:8, padding:'4px 10px' }}>{st.label}</span>
              </div>

              <div style={{ textAlign:'center' as const, fontSize:11, color:'rgba(232,234,240,0.35)' }}>
                {timeAgo(offer.created_at)}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop:14, fontSize:12, color:'rgba(232,234,240,0.3)', textAlign:'center' as const }}>
        Duke shfaqur {filtered.length} nga {offers.length} oferta
      </div>
    </div>
  )
}