'use client'

import { useState } from 'react'

interface Application {
  id: string; title: string; description: string; city: string
  area_sqm: number|null; budget_min: number|null; budget_max: number|null
  status: string; provider_type: string; offer_count: number
  expires_at: string; created_at: string
  categories?: { name:string; icon:string }
  profiles?:   { full_name:string; email:string; city:string } | null
}

const ST: Record<string, { label:string; col:string }> = {
  active:    { label:'Aktiv',   col:'#22d3a5' },
  accepted:  { label:'Pranuar', col:'#60a5fa' },
  expired:   { label:'Skaduar', col:'#64748b' },
  cancelled: { label:'Anuluar', col:'#f87171' },
}

function timeLeft(exp: string) {
  const diff = new Date(exp).getTime() - Date.now()
  if (diff <= 0) return null
  const h = Math.floor(diff / 3_600_000)
  const m = Math.floor((diff % 3_600_000) / 60_000)
  return `${h}h ${m}m`
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const days = Math.floor(diff / 86_400_000)
  if (days === 0) return 'Sot'
  if (days < 7)   return `${days}d më parë`
  return `${Math.floor(days/30) || 1}m më parë`
}

export default function AdminApplicationsClient({ applications }: { applications: Application[] }) {
  const [search,   setSearch]   = useState('')
  const [status,   setStatus]   = useState('all')
  const [expanded, setExpanded] = useState<string|null>(null)

  const filtered = applications
    .filter(a => status === 'all' || a.status === status)
    .filter(a =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.city.toLowerCase().includes(search.toLowerCase()) ||
      (a.profiles?.full_name||'').toLowerCase().includes(search.toLowerCase())
    )

  const counts = {
    all:      applications.length,
    active:   applications.filter(a=>a.status==='active').length,
    accepted: applications.filter(a=>a.status==='accepted').length,
    expired:  applications.filter(a=>a.status==='expired').length,
  }

  const totalBudget = applications
    .filter(a => a.budget_max)
    .reduce((s,a) => s + (a.budget_max||0), 0)

  return (
    <div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}} .app-row:hover{background:rgba(255,255,255,0.03)!important;}`}</style>

      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'1.9rem', fontWeight:900, letterSpacing:'-0.03em', marginBottom:6 }}>Aplikimet</h1>
        <p style={{ fontSize:14, color:'rgba(232,234,240,0.45)' }}>
          {counts.active} aktive · buxhet total deri €{totalBudget.toLocaleString()}
        </p>
      </div>

      {/* Summary pills */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:24 }}>
        {[
          { label:'Gjithsej',   val:counts.all,      col:'#e8621a' },
          { label:'Aktive',     val:counts.active,   col:'#22d3a5' },
          { label:'Të pranuara',val:counts.accepted, col:'#60a5fa' },
          { label:'Skaduara',   val:counts.expired,  col:'#64748b' },
        ].map((s,i) => (
          <button key={i} onClick={() => setStatus(i===0?'all':['all','active','accepted','expired'][i])}
            style={{ padding:'16px 18px', background:'rgba(255,255,255,0.02)', border:`1px solid ${s.col}25`, borderRadius:16, cursor:'pointer', fontFamily:'inherit', textAlign:'left' as const, transition:'all 0.2s', animation:`fadeUp 0.4s ease ${i*0.07}s both` }}>
            <div style={{ fontFamily:"'Fraunces',serif", fontSize:'2rem', fontWeight:900, color:s.col, lineHeight:1, marginBottom:4 }}>{s.val}</div>
            <div style={{ fontSize:12, color:'rgba(232,234,240,0.45)' }}>{s.label}</div>
          </button>
        ))}
      </div>

      {/* Search + filter */}
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' as const }}>
        <div style={{ position:'relative' as const, flex:1, minWidth:200 }}>
          <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', opacity:0.35 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Kërko titull, qytet, klient..."
            style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:11, padding:'10px 14px 10px 36px', fontSize:13, color:'#e8eaf0', fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }} />
        </div>
        <div style={{ display:'flex', gap:3, background:'rgba(255,255,255,0.04)', padding:3, borderRadius:11, border:'1px solid rgba(255,255,255,0.07)' }}>
          {(['all','active','accepted','expired','cancelled'] as const).map(s => (
            <button key={s} onClick={() => setStatus(s)}
              style={{ padding:'7px 13px', borderRadius:9, border:'none', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', background:status===s ? '#e8621a' : 'transparent', color:status===s ? '#fff' : 'rgba(232,234,240,0.45)', transition:'all 0.2s', whiteSpace:'nowrap' as const }}>
              {{ all:'Të gjitha', active:'Aktive', accepted:'Pranuar', expired:'Skaduar', cancelled:'Anuluar' }[s]} {s!=='all'&&`(${applications.filter(a=>a.status===s).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, overflow:'hidden' }}>
        <div style={{ display:'grid', gridTemplateColumns:'2.5fr 1fr 70px 70px 90px 80px', gap:10, padding:'12px 20px', borderBottom:'1px solid rgba(255,255,255,0.07)', fontSize:11, fontWeight:700, color:'rgba(232,234,240,0.3)', textTransform:'uppercase' as const, letterSpacing:'0.07em' }}>
          <span>Projekti</span><span>Klienti</span>
          <span style={{ textAlign:'center' as const }}>Buxheti</span>
          <span style={{ textAlign:'center' as const }}>Oferta</span>
          <span style={{ textAlign:'center' as const }}>Statusi</span>
          <span style={{ textAlign:'center' as const }}>Data</span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px', color:'rgba(232,234,240,0.3)' }}>
            <div style={{ fontSize:42, marginBottom:12 }}>📭</div>
            <div style={{ fontFamily:"'Fraunces',serif", fontWeight:800 }}>Nuk ka aplikime</div>
          </div>
        ) : filtered.map((app,i) => {
          const st    = ST[app.status] || ST.expired
          const tl    = app.status === 'active' ? timeLeft(app.expires_at) : null
          const isExp = expanded === app.id
          return (
            <div key={app.id} style={{ borderBottom: i < filtered.length-1 ? '1px solid rgba(255,255,255,0.05)' : 'none', animation:`fadeUp 0.3s ease ${i*0.03}s both` }}>
              <div className="app-row" style={{ display:'grid', gridTemplateColumns:'2.5fr 1fr 70px 70px 90px 80px', gap:10, padding:'15px 20px', alignItems:'center', transition:'background 0.15s', cursor:'pointer' }} onClick={() => setExpanded(isExp ? null : app.id)}>

                <div style={{ minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:4 }}>
                    {app.categories && <span style={{ fontSize:12 }}>{app.categories.icon}</span>}
                    <span style={{ fontWeight:700, fontSize:14, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' as const }}>{app.title}</span>
                  </div>
                  <div style={{ display:'flex', gap:10, fontSize:11, color:'rgba(232,234,240,0.4)' }}>
                    <span>📍 {app.city}</span>
                    {app.area_sqm && <span>📐 {app.area_sqm}m²</span>}
                    {tl && <span style={{ color: Number(tl.split('h')[0]) < 3 ? '#ef4444' : '#22d3a5' }}>⏱ {tl}</span>}
                  </div>
                </div>

                <div style={{ minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' as const }}>{app.profiles?.full_name || '—'}</div>
                  <div style={{ fontSize:11, color:'rgba(232,234,240,0.35)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' as const }}>{app.profiles?.city || ''}</div>
                </div>

                <div style={{ textAlign:'center' as const }}>
                  {app.budget_max
                    ? <span style={{ fontSize:12, fontWeight:700, color:'#e8621a' }}>€{app.budget_max.toLocaleString()}</span>
                    : <span style={{ fontSize:12, color:'rgba(232,234,240,0.3)' }}>—</span>
                  }
                </div>

                <div style={{ textAlign:'center' as const }}>
                  <span style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:'1.2rem', color: app.offer_count > 0 ? '#fbbf24' : 'rgba(232,234,240,0.3)' }}>{app.offer_count}</span>
                </div>

                <div style={{ textAlign:'center' as const }}>
                  <span style={{ fontSize:11, fontWeight:700, color:st.col, background:`${st.col}15`, border:`1px solid ${st.col}30`, borderRadius:8, padding:'4px 10px' }}>{st.label}</span>
                </div>

                <div style={{ textAlign:'center' as const, fontSize:11, color:'rgba(232,234,240,0.35)' }}>
                  {timeAgo(app.created_at)}
                  <div style={{ fontSize:10, color:'rgba(232,234,240,0.2)', marginTop:2 }}>{isExp ? '▲' : '▼'}</div>
                </div>
              </div>

              {isExp && (
                <div style={{ padding:'0 20px 18px', borderTop:'1px solid rgba(255,255,255,0.05)', background:'rgba(255,255,255,0.01)', animation:'fadeUp 0.2s ease' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, paddingTop:16, marginBottom:12 }}>
                    {[
                      { l:'Klienti',       v: app.profiles?.full_name || '—' },
                      { l:'Email',         v: app.profiles?.email     || '—' },
                      { l:'Lloji',         v: { worker:'Punëtor', company:'Kompani', both:'Të dyja' }[app.provider_type] || app.provider_type },
                      { l:'Buxheti',       v: app.budget_max ? `€${(app.budget_min||0).toLocaleString()} – €${app.budget_max.toLocaleString()}` : '—' },
                    ].map((d,j) => (
                      <div key={j} style={{ padding:'10px 14px', background:'rgba(255,255,255,0.03)', borderRadius:10 }}>
                        <div style={{ fontSize:10, fontWeight:700, color:'rgba(232,234,240,0.3)', textTransform:'uppercase' as const, letterSpacing:'0.07em', marginBottom:5 }}>{d.l}</div>
                        <div style={{ fontSize:13, fontWeight:600 }}>{d.v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding:'12px 14px', background:'rgba(255,255,255,0.03)', borderRadius:10 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:'rgba(232,234,240,0.3)', textTransform:'uppercase' as const, letterSpacing:'0.07em', marginBottom:6 }}>Përshkrimi</div>
                    <p style={{ fontSize:13, color:'rgba(232,234,240,0.55)', lineHeight:1.7 }}>{app.description}</p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ marginTop:14, fontSize:12, color:'rgba(232,234,240,0.3)', textAlign:'center' as const }}>
        Duke shfaqur {filtered.length} nga {applications.length} aplikime
      </div>
    </div>
  )
}