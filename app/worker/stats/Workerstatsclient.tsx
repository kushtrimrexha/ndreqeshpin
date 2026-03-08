'use client'

import { KpiCard, TrendAreaChart, StatsBarChart, StatsPieChart, ActivityFeed, MetricBar } from '@/components/Analytics'

interface Props {
  workerName:    string
  offers:        any[]
  reviews:       any[]
  monthlyData:   { label:string; earned:number; sent:number }[]
  statusCounts:  Record<string,number>
  stats: {
    totalOffers:number; acceptedOffers:number; pendingOffers:number
    totalEarned:number; avgPrice:number; successRate:number
    ratingAvg:number; totalReviews:number
  }
  ratingBreakdown: { r:number; count:number }[]
}

function Stars({ rating, size=14 }: { rating:number; size?:number }) {
  return (
    <div style={{ display:'flex', gap:2 }}>
      {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize:size, color:s<=Math.round(rating)?'#fbbf24':'rgba(240,236,228,0.12)', lineHeight:1 }}>★</span>)}
    </div>
  )
}

export default function WorkerStatsClient({ workerName, offers, reviews, monthlyData, stats, ratingBreakdown }: Props) {

  const earningsTrend = monthlyData.map(m => ({ label:m.label, value:m.earned }))
  const activityTrend = monthlyData.map(m => ({ label:m.label, value:m.sent }))

  const statusPie = [
    { label:'Pranuar',  value:stats.acceptedOffers, color:'#22d3a5' },
    { label:'Në pritje',value:stats.pendingOffers,  color:'#fbbf24' },
    { label:'Tjetër',   value:stats.totalOffers - stats.acceptedOffers - stats.pendingOffers, color:'rgba(240,236,228,0.3)' },
  ].filter(d=>d.value>0)

  const activityFeed = offers.slice(0,5).map((o:any) => ({
    id:    o.id,
    icon:  o.status==='accepted'?'✅':o.status==='pending'?'⏳':'❌',
    title: o.status==='accepted'?'Ofertë e pranuar':o.status==='pending'?'Ofertë në pritje':'Ofertë e refuzuar',
    description:`${o.applications?.title||'Projekt'} · €${(o.price||0).toLocaleString()}${o.applications?.city?` · ${o.applications.city}`:''}`,
    time:  new Date(o.created_at).toLocaleDateString('sq-AL',{day:'numeric',month:'short'}),
    color: o.status==='accepted'?'#22d3a5':o.status==='pending'?'#fbbf24':'#f87171',
  }))

  const totalRatings = ratingBreakdown.reduce((s,r)=>s+r.count,0)

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @media(max-width:900px){.sg2{grid-template-columns:1fr!important}}
        @media(max-width:600px){.kg{grid-template-columns:1fr 1fr!important}}
      `}</style>

      {/* Header */}
      <div style={{ animation:'fadeUp 0.4s ease' }}>
        <p style={{ fontSize:11, fontWeight:700, color:'rgba(240,236,228,0.3)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:8 }}>Analitikë</p>
        <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(1.4rem,3vw,1.9rem)', fontWeight:900, letterSpacing:'-0.03em', lineHeight:1.1 }}>
          Statistikat e <span style={{ color:'#10b981', fontStyle:'italic' }}>{workerName.split(' ')[0]}</span>
        </h1>
      </div>

      {/* KPIs */}
      <div className="kg" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:12 }}>
        <KpiCard title="Ofertat gjithsej"  value={stats.totalOffers}    icon="💼" color="#10b981"/>
        <KpiCard title="Të pranuara"        value={stats.acceptedOffers} icon="✅" color="#22d3a5"/>
        <KpiCard title="Të ardhura"         value={stats.totalEarned}    icon="💰" color="#fbbf24" prefix="€" subtitle={`Mesatarja €${stats.avgPrice}`}/>
        <KpiCard title="Norma suksesit"     value={`${stats.successRate}%`} icon="🎯" color="#e8621a"/>
        <KpiCard title="Vlerësimet"         value={stats.totalReviews}   icon="⭐" color="#f59e0b"/>
        <KpiCard title="Nota mesatare"      value={stats.ratingAvg>0?stats.ratingAvg.toFixed(1):'—'} icon="🏆" color="#a78bfa" suffix={stats.ratingAvg>0?'/5':''}/>
      </div>

      {/* Charts */}
      <div className="sg2" style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:14 }}>
        <TrendAreaChart data={earningsTrend} title="💰 Të ardhura mujore (€)" color="#10b981" prefix="€" name="Të ardhura" height={210}/>
        <StatsPieChart data={statusPie} title="📊 Statusi i ofertave" height={210}/>
      </div>

      <div className="sg2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        <StatsBarChart data={activityTrend} title="📈 Oferta dërguar mujore" color="#22d3a5" name="Oferta" height={180}/>
        <ActivityFeed items={activityFeed} title="⚡ Ofertat e fundit"/>
      </div>

      {/* Rating breakdown */}
      {stats.totalReviews > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <div style={{ padding:'20px 22px', background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:18 }}>
            <div style={{ fontSize:13, fontWeight:700, color:'rgba(240,236,228,0.6)', marginBottom:16 }}>⭐ Shpërndarje e vlerësimeve</div>
            <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:18 }}>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:'2.5rem', color:'#fbbf24', lineHeight:1 }}>{stats.ratingAvg.toFixed(1)}</div>
                <Stars rating={stats.ratingAvg} size={16}/>
                <div style={{ fontSize:11, color:'rgba(240,236,228,0.35)', marginTop:4 }}>{stats.totalReviews} vlerësime</div>
              </div>
              <div style={{ flex:1, display:'flex', flexDirection:'column', gap:6 }}>
                {[5,4,3,2,1].map(r => {
                  const cnt = ratingBreakdown.find(x=>x.r===r)?.count||0
                  const pct = totalRatings>0?Math.round((cnt/totalRatings)*100):0
                  return (
                    <div key={r} style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:11, color:'rgba(240,236,228,0.5)', width:20, flexShrink:0 }}>{r}★</span>
                      <div style={{ flex:1, height:4, background:'rgba(240,236,228,0.08)', borderRadius:10 }}>
                        <div style={{ height:'100%', width:`${pct}%`, background:'#fbbf24', borderRadius:10, transition:'width 1s ease' }}/>
                      </div>
                      <span style={{ fontSize:11, color:'rgba(240,236,228,0.35)', width:26, textAlign:'right' }}>{pct}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Recent reviews */}
          <div style={{ background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:18, overflow:'hidden' }}>
            <div style={{ padding:'14px 20px', borderBottom:'1px solid rgba(240,236,228,0.07)', fontSize:13, fontWeight:700, color:'rgba(240,236,228,0.6)' }}>💬 Vlerësimet e fundit</div>
            <div style={{ maxHeight:240, overflowY:'auto' }}>
              {reviews.slice(0,4).map((rv:any,i:number) => (
                <div key={rv.id} style={{ padding:'12px 20px', borderBottom:i<3?'1px solid rgba(240,236,228,0.05)':'none' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <div style={{ fontSize:12, fontWeight:700 }}>{rv.reviewer?.full_name||'Anonim'}</div>
                    <Stars rating={rv.rating} size={11}/>
                  </div>
                  {rv.comment && <p style={{ fontSize:12, color:'rgba(240,236,228,0.5)', lineHeight:1.6 }}>{rv.comment}</p>}
                  {rv.application?.title && <div style={{ fontSize:11, color:'rgba(240,236,228,0.3)', marginTop:4 }}>📋 {rv.application.title}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Performance metrics */}
      <div style={{ padding:'20px 22px', background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:18 }}>
        <div style={{ fontSize:13, fontWeight:700, color:'rgba(240,236,228,0.6)', marginBottom:16 }}>🏆 Performanca juaj</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <MetricBar label="Norma suksesit"  value={stats.successRate}  color="#22d3a5" icon="🎯"/>
          <MetricBar label="Nota mesatare"   value={stats.ratingAvg>0?(stats.ratingAvg/5)*100:0} color="#fbbf24" icon="⭐" suffix={`/5 (${stats.ratingAvg.toFixed(1)})`}/>
        </div>
      </div>
    </div>
  )
}