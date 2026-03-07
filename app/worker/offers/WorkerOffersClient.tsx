'use client'

import { useState } from 'react'

interface Offer {
  id: string; price: number; duration_days: number
  description: string; status: string; created_at: string
  applications: {
    id: string; title: string; city: string; status: string
    profiles: { full_name: string } | null
  } | null
}

const STATUS: Record<string, { label:string; col:string; bg:string }> = {
  pending:   { label:'Në pritje', col:'#fbbf24', bg:'rgba(251,191,36,0.08)' },
  accepted:  { label:'Pranuar',   col:'#22d3a5', bg:'rgba(34,211,165,0.08)' },
  rejected:  { label:'Refuzuar',  col:'#f87171', bg:'rgba(248,113,113,0.08)' },
  withdrawn: { label:'Tërhequr',  col:'#64748b', bg:'rgba(100,116,139,0.08)' },
}

export default function WorkerOffersClient({ offers }: { offers: Offer[] }) {
  const [filter, setFilter] = useState<'all'|'pending'|'accepted'|'rejected'>('all')
  const [search, setSearch] = useState('')

  const filtered = offers
    .filter(o => filter === 'all' || o.status === filter)
    .filter(o => o.applications?.title.toLowerCase().includes(search.toLowerCase()) || false)

  const counts = {
    all:      offers.length,
    pending:  offers.filter(o => o.status === 'pending').length,
    accepted: offers.filter(o => o.status === 'accepted').length,
    rejected: offers.filter(o => o.status === 'rejected').length,
  }

  const totalEarned = offers.filter(o => o.status === 'accepted').reduce((s,o) => s + o.price, 0)
  const successRate = offers.length > 0 ? Math.round((counts.accepted / offers.length) * 100) : 0

  return (
    <div>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .offer-row:hover{background:rgba(255,255,255,0.04)!important;}
      `}</style>

      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'1.9rem', fontWeight:900, letterSpacing:'-0.03em', marginBottom:6 }}>Ofertat e mia</h1>
        <p style={{ fontSize:14, color:'rgba(232,234,240,0.45)' }}>Gjurmo çdo ofertë të dërguar</p>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:28 }}>
        {[
          { icon:'💼', label:'Gjithsej',    val: offers.length,     col:'#10b981' },
          { icon:'⏳', label:'Në pritje',   val: counts.pending,    col:'#fbbf24' },
          { icon:'✅', label:'Pranuar',     val: counts.accepted,   col:'#22d3a5' },
          { icon:'📊', label:'Sukses rate', val:`${successRate}%`,  col:'#60a5fa' },
        ].map((s,i) => (
          <div key={i} style={{ padding:'18px 20px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, animation:`fadeUp 0.4s ease ${i*0.07}s both` }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
              <span style={{ fontSize:16 }}>{s.icon}</span>
              <span style={{ fontSize:12, color:'rgba(232,234,240,0.45)' }}>{s.label}</span>
            </div>
            <div style={{ fontFamily:"'Fraunces',serif", fontSize:'1.8rem', fontWeight:900, color:s.col, lineHeight:1 }}>{s.val}</div>
          </div>
        ))}
      </div>

      {totalEarned > 0 && (
        <div style={{ marginBottom:24, padding:'18px 22px', background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:16, display:'flex', alignItems:'center', gap:16 }}>
          <div style={{ fontSize:32 }}>💰</div>
          <div>
            <div style={{ fontSize:12, color:'rgba(232,234,240,0.45)', marginBottom:4 }}>Të ardhura totale nga ofertat e pranuara</div>
            <div style={{ fontFamily:"'Fraunces',serif", fontSize:'2rem', fontWeight:900, color:'#22d3a5' }}>€{totalEarned.toLocaleString()}</div>
          </div>
        </div>
      )}

      {/* Filters + Search */}
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' as const, alignItems:'center' }}>
        <div style={{ display:'flex', gap:4, background:'rgba(255,255,255,0.04)', padding:4, borderRadius:12, border:'1px solid rgba(255,255,255,0.07)' }}>
          {(['all','pending','accepted','rejected'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding:'7px 14px', borderRadius:9, border:'none', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', background:filter===f ? '#10b981' : 'transparent', color:filter===f ? '#fff' : 'rgba(232,234,240,0.45)', transition:'all 0.2s', whiteSpace:'nowrap' as const }}>
              {{ all:'Të gjitha', pending:'Pritje', accepted:'Pranuar', rejected:'Refuzuar' }[f]} ({counts[f]})
            </button>
          ))}
        </div>
        <div style={{ flex:1, minWidth:180, position:'relative' as const }}>
          <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', opacity:0.35, fontSize:13 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Kërko projekt..."
            style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:'9px 12px 9px 32px', fontSize:13, color:'#e8eaf0', fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'80px 20px', color:'rgba(232,234,240,0.3)' }}>
          <div style={{ fontSize:52, marginBottom:16 }}>📭</div>
          <div style={{ fontFamily:"'Fraunces',serif", fontSize:'1.1rem', fontWeight:800, marginBottom:8 }}>Nuk ka oferta</div>
          <p style={{ fontSize:13, lineHeight:1.7 }}>Shko tek Aplikimet dhe dërgo ofertën e parë.</p>
        </div>
      ) : (
        <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:18, overflow:'hidden' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 100px 90px 90px 110px', gap:12, padding:'12px 20px', borderBottom:'1px solid rgba(255,255,255,0.07)', fontSize:11, fontWeight:700, color:'rgba(232,234,240,0.3)', textTransform:'uppercase' as const, letterSpacing:'0.07em' }}>
            <span>Projekti</span>
            <span style={{ textAlign:'center' as const }}>Çmimi</span>
            <span style={{ textAlign:'center' as const }}>Kohëzgjatja</span>
            <span style={{ textAlign:'center' as const }}>Statusi</span>
            <span style={{ textAlign:'right' as const }}>Data</span>
          </div>
          {filtered.map((o, i) => {
            const st = STATUS[o.status] || STATUS.pending
            return (
              <div key={o.id} className="offer-row"
                style={{ display:'grid', gridTemplateColumns:'1fr 100px 90px 90px 110px', gap:12, padding:'16px 20px', borderBottom: i < filtered.length-1 ? '1px solid rgba(255,255,255,0.05)' : 'none', alignItems:'center', transition:'background 0.15s', animation:`fadeUp 0.3s ease ${i*0.04}s both`, background: o.status==='accepted' ? 'rgba(34,211,165,0.03)' : 'transparent' }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:14, marginBottom:3 }}>{o.applications?.title || '—'}</div>
                  <div style={{ fontSize:12, color:'rgba(232,234,240,0.4)', display:'flex', gap:10 }}>
                    {o.applications?.profiles?.full_name && <span>👤 {o.applications.profiles.full_name}</span>}
                    {o.applications?.city && <span>📍 {o.applications.city}</span>}
                  </div>
                </div>
                <div style={{ textAlign:'center' as const }}>
                  <span style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:'1.1rem', color:'#10b981' }}>€{o.price.toLocaleString()}</span>
                </div>
                <div style={{ textAlign:'center' as const, fontSize:13, color:'rgba(232,234,240,0.55)' }}>{o.duration_days}d</div>
                <div style={{ textAlign:'center' as const }}>
                  <span style={{ fontSize:11, fontWeight:700, color:st.col, background:st.bg, border:`1px solid ${st.col}30`, borderRadius:7, padding:'4px 10px' }}>{st.label}</span>
                </div>
                <div style={{ textAlign:'right' as const, fontSize:12, color:'rgba(232,234,240,0.35)' }}>
                  {new Date(o.created_at).toLocaleDateString('sq-AL', { day:'numeric', month:'short' })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}