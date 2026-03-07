'use client'

interface Company { business_name:string; rating_avg:number; is_verified:boolean; package_type:string }
interface Stats   { totalOffers:number; acceptedOffers:number; pendingOffers:number; totalRevenue:number; successRate:number }
interface Offer   { id:string; price:number; status:string; created_at:string; applications:{title:string;city:string}|null }
interface Review  { rating:number; created_at:string }

function StatCard({ icon, label, value, col, sub }: { icon:string; label:string; value:string|number; col:string; sub?:string }) {
  return (
    <div style={{ padding:'22px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:18, animation:'fadeUp 0.4s ease both' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
        <div style={{ width:38, height:38, borderRadius:11, background:`${col}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{icon}</div>
        <span style={{ fontSize:12, color:'rgba(232,234,240,0.45)', fontWeight:600 }}>{label}</span>
      </div>
      <div style={{ fontFamily:"'Fraunces',serif", fontSize:'2.2rem', fontWeight:900, color:col, lineHeight:1, marginBottom:sub?6:0 }}>{value}</div>
      {sub && <div style={{ fontSize:12, color:'rgba(232,234,240,0.35)', marginTop:6 }}>{sub}</div>}
    </div>
  )
}

function MiniBar({ val, max, col }: { val:number; max:number; col:string }) {
  const pct = max > 0 ? (val/max)*100 : 0
  return (
    <div style={{ flex:1, height:6, background:'rgba(255,255,255,0.06)', borderRadius:3, overflow:'hidden' }}>
      <div style={{ height:'100%', width:`${pct}%`, background:col, borderRadius:3, transition:'width 1.2s ease' }} />
    </div>
  )
}

export default function CompanyStatsClient({ company, stats, recentOffers, reviews }: {
  company:Company; stats:Stats; recentOffers:Offer[]; reviews:Review[]
}) {
  const rejectedOffers = stats.totalOffers - stats.acceptedOffers - stats.pendingOffers

  // Rating breakdown
  const ratingBreak = [5,4,3,2,1].map(s => ({
    star: s,
    count: reviews.filter(r => r.rating === s).length,
    col: s>=4 ? '#22d3a5' : s===3 ? '#fbbf24' : '#f87171',
  }))

  // Monthly offers — last 6 months
  const months: Record<string, { sent:number; won:number }> = {}
  const now = new Date()
  for (let i=5; i>=0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth()-i, 1)
    const key = d.toLocaleDateString('sq-AL', { month:'short', year:'2-digit' })
    months[key] = { sent:0, won:0 }
  }
  recentOffers.forEach(o => {
    const key = new Date(o.created_at).toLocaleDateString('sq-AL', { month:'short', year:'2-digit' })
    if (months[key]) {
      months[key].sent++
      if (o.status === 'accepted') months[key].won++
    }
  })
  const maxMonth = Math.max(...Object.values(months).map(m => m.sent), 1)

  return (
    <div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'1.9rem', fontWeight:900, letterSpacing:'-0.03em', marginBottom:6 }}>Statistikat</h1>
        <p style={{ fontSize:14, color:'rgba(232,234,240,0.45)' }}>Performanca e {company.business_name}</p>
      </div>

      {/* Main stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
        <StatCard icon="💼" label="Oferta gjithsej"  value={stats.totalOffers}   col="#e8621a" />
        <StatCard icon="✅" label="Projektet fituar" value={stats.acceptedOffers} col="#22d3a5" />
        <StatCard icon="📊" label="Shkalla sukses"   value={`${stats.successRate}%`} col="#60a5fa" sub={`${stats.pendingOffers} në pritje`} />
        <StatCard icon="💰" label="Të ardhura"       value={`€${stats.totalRevenue.toLocaleString()}`} col="#fbbf24" sub="nga ofertat e pranuara" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>

        {/* Offer breakdown donut-style */}
        <div style={{ padding:'24px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:18 }}>
          <h3 style={{ fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:'1rem', marginBottom:20 }}>📊 Breakdown i ofertave</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {[
              { label:'Pranuar',  count:stats.acceptedOffers, col:'#22d3a5' },
              { label:'Në pritje',count:stats.pendingOffers,  col:'#fbbf24' },
              { label:'Refuzuar', count:rejectedOffers,        col:'#f87171' },
            ].map((r,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontSize:12, color:'rgba(232,234,240,0.5)', minWidth:70 }}>{r.label}</span>
                <MiniBar val={r.count} max={stats.totalOffers} col={r.col} />
                <span style={{ fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:'1rem', color:r.col, minWidth:28, textAlign:'right' as const }}>{r.count}</span>
              </div>
            ))}
          </div>

          {/* Success rate circle */}
          <div style={{ marginTop:24, display:'flex', alignItems:'center', gap:16, padding:'16px', background:'rgba(255,255,255,0.03)', borderRadius:12 }}>
            <div style={{ width:64, height:64, borderRadius:'50%', background:`conic-gradient(#22d3a5 ${stats.successRate*3.6}deg, rgba(255,255,255,0.06) 0deg)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <div style={{ width:50, height:50, borderRadius:'50%', background:'#080b12', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:'1rem', color:'#22d3a5' }}>{stats.successRate}%</div>
            </div>
            <div>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:3 }}>Shkalla e suksesit</div>
              <div style={{ fontSize:12, color:'rgba(232,234,240,0.4)', lineHeight:1.6 }}>{stats.acceptedOffers} nga {stats.totalOffers} oferta u pranuan</div>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div style={{ padding:'24px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:18 }}>
          <h3 style={{ fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:'1rem', marginBottom:20 }}>⭐ Vlerësimet</h3>
          {reviews.length === 0 ? (
            <div style={{ textAlign:'center', padding:'40px 0', color:'rgba(232,234,240,0.3)' }}>
              <div style={{ fontSize:36, marginBottom:10 }}>⭐</div>
              <div style={{ fontSize:13 }}>Nuk ka vlerësime ende</div>
            </div>
          ) : (
            <>
              <div style={{ textAlign:'center', marginBottom:20 }}>
                <div style={{ fontFamily:"'Fraunces',serif", fontSize:'3.5rem', fontWeight:900, color:'#fbbf24', lineHeight:1 }}>{company.rating_avg.toFixed(1)}</div>
                <div style={{ display:'flex', justifyContent:'center', gap:3, margin:'8px 0' }}>
                  {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize:20, color: s<=Math.round(company.rating_avg) ? '#fbbf24' : 'rgba(255,255,255,0.1)' }}>★</span>)}
                </div>
                <div style={{ fontSize:13, color:'rgba(232,234,240,0.4)' }}>{reviews.length} vlerësime</div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {ratingBreak.map(r => (
                  <div key={r.star} style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:11, color:'rgba(232,234,240,0.45)', minWidth:24 }}>{r.star}★</span>
                    <MiniBar val={r.count} max={reviews.length} col={r.col} />
                    <span style={{ fontSize:11, color:'rgba(232,234,240,0.4)', minWidth:20, textAlign:'right' as const }}>{r.count}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Monthly chart */}
      <div style={{ padding:'24px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:18, marginBottom:16 }}>
        <h3 style={{ fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:'1rem', marginBottom:24 }}>📈 Aktiviteti — 6 muajt e fundit</h3>
        <div style={{ display:'flex', alignItems:'flex-end', gap:12, height:120 }}>
          {Object.entries(months).map(([month, data], i) => (
            <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
              <div style={{ width:'100%', display:'flex', flexDirection:'column', justifyContent:'flex-end', height:90, gap:3 }}>
                {/* Won bar */}
                <div style={{ width:'100%', height:Math.max(data.won/maxMonth*90, data.won>0?4:0), background:'linear-gradient(to top,#22d3a5,rgba(34,211,165,0.5))', borderRadius:'4px 4px 0 0', transition:'height 1s ease', minHeight:0 }} />
                {/* Sent bar */}
                <div style={{ width:'100%', height:Math.max((data.sent-data.won)/maxMonth*90, 0), background:'rgba(232,98,26,0.3)', borderRadius: data.won>0 ? '0' : '4px 4px 0 0', transition:'height 1s ease', minHeight:0 }} />
              </div>
              <span style={{ fontSize:10, color:'rgba(232,234,240,0.35)', fontWeight:600 }}>{month}</span>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', gap:20, marginTop:14, justifyContent:'center' }}>
          {[{ col:'#22d3a5', label:'Pranuar' }, { col:'rgba(232,98,26,0.5)', label:'Dërguar' }].map((l,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'rgba(232,234,240,0.45)' }}>
              <div style={{ width:10, height:10, borderRadius:2, background:l.col }} />{l.label}
            </div>
          ))}
        </div>
      </div>

      {/* Recent offers table */}
      <div style={{ padding:'24px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:18 }}>
        <h3 style={{ fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:'1rem', marginBottom:20 }}>🕐 Ofertat e fundit</h3>
        {recentOffers.length === 0 ? (
          <div style={{ textAlign:'center', padding:'30px 0', color:'rgba(232,234,240,0.3)', fontSize:13 }}>Nuk ka oferta ende</div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {recentOffers.map((o,i) => {
              const stCol = { accepted:'#22d3a5', pending:'#fbbf24', rejected:'#f87171' }[o.status] || '#64748b'
              return (
                <div key={o.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 16px', background:'rgba(255,255,255,0.02)', borderRadius:12, animation:`fadeUp 0.3s ease ${i*0.04}s both` }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:13 }}>{o.applications?.title || '—'}</div>
                    <div style={{ fontSize:11, color:'rgba(232,234,240,0.4)' }}>{o.applications?.city} · {new Date(o.created_at).toLocaleDateString('sq-AL')}</div>
                  </div>
                  <div style={{ fontFamily:"'Fraunces',serif", fontWeight:800, color:'#e8621a' }}>€{o.price.toLocaleString()}</div>
                  <span style={{ fontSize:11, fontWeight:700, color:stCol, background:`${stCol}15`, border:`1px solid ${stCol}30`, borderRadius:7, padding:'3px 10px' }}>
                    {{ accepted:'Pranuar', pending:'Pritje', rejected:'Refuzuar' }[o.status] || o.status}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}