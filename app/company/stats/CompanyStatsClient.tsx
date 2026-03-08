'use client'

import { useState } from 'react'
import { KpiCard, TrendAreaChart, StatsBarChart, StatsPieChart, ActivityFeed } from '@/components/Analytics'

interface Stats {
  totalOffers:number; acceptedOffers:number; pendingOffers:number; rejectedOffers:number
  totalApplications:number; activeApplications:number
  avgPrice:number; totalEarnings:number
  rating:number; totalReviews:number; successRate:number
}
interface Props {
  stats:          Stats
  recentOffers:   any[]
  monthlyOffers:  Record<string,number>
  cityBreakdown:  Record<string,number>
}

export default function CompanyStatsClient({ stats, recentOffers, monthlyOffers, cityBreakdown }: Props) {

  const trendData = Object.entries(monthlyOffers).map(([label,value]) => ({ label, value }))
  const cityData  = Object.entries(cityBreakdown).slice(0,6).map(([label,value],i) => ({
    label, value, color:['#e8621a','#22d3a5','#3b82f6','#fbbf24','#a78bfa','#f87171'][i]
  }))

  const activityFeed = recentOffers.slice(0,6).map((o:any) => ({
    id: o.id,
    icon: o.status==='accepted'?'✅':o.status==='pending'?'⏳':'❌',
    title: o.status==='accepted' ? 'Ofertë e pranuar!' : 'Ofertë e dërguar',
    description: `${o.applications?.title||'Projekt'} — €${(o.price||0).toLocaleString()}`,
    time: new Date(o.created_at).toLocaleDateString('sq-AL'),
    color: o.status==='accepted'?'#22d3a5':o.status==='pending'?'#e8621a':'#6b7280',
  }))

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @media(max-width:900px){ .stats-2col{grid-template-columns:1fr!important} }
        @media(max-width:600px){ .kpi-grid{grid-template-columns:1fr 1fr!important} }
      `}</style>

      {/* Header */}
      <div style={{ animation:'fadeUp 0.5s ease' }}>
        <p style={{ fontSize:11,fontWeight:700,color:'rgba(240,236,228,0.3)',textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:8 }}>Analitikë biznesi</p>
        <h1 style={{ fontFamily:"'Fraunces',serif",fontSize:'clamp(1.5rem,3vw,2rem)',fontWeight:900,letterSpacing:'-0.03em',lineHeight:1.1 }}>
          Statistikat e <span style={{ color:'#e8621a',fontStyle:'italic' }}>kompanisë</span>
        </h1>
      </div>

      {/* KPIs */}
      <div className="kpi-grid" style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(165px,1fr))',gap:12 }}>
        <KpiCard title="Ofertat dërguar"  value={stats.totalOffers}    icon="💼" color="#e8621a"  changeLabel="gjithsej" />
        <KpiCard title="Të pranuara"      value={stats.acceptedOffers} icon="✅" color="#22d3a5"  changeLabel="oferta" />
        <KpiCard title="Norma suksesit"   value={`${stats.successRate}%`} icon="🎯" color="#3b82f6" changeLabel="pranuar" />
        <KpiCard title="Të ardhura"       value={`€${stats.totalEarnings.toLocaleString()}`} icon="💰" color="#fbbf24" changeLabel="totale" />
        <KpiCard title="Çmimi mesatar"    value={`€${Math.round(stats.avgPrice).toLocaleString()}`} icon="📊" color="#a78bfa" changeLabel="për projekt" />
        <KpiCard title="Vlerësimi"        value={stats.totalReviews>0?`${stats.rating.toFixed(1)}★`:'—'} icon="⭐" color="#fbbf24" changeLabel={`nga ${stats.totalReviews} reviews`} />
      </div>

      {/* Charts row 1 */}
      <div className="stats-2col" style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>
        <TrendAreaChart data={trendData} title="📈 Ofertat — 6 muajt e fundit" color="#e8621a" name="Oferta" height={200} />
        <StatsPieChart  data={cityData}  title="📍 Projektet sipas qytetit" height={200} />
      </div>

      {/* Charts row 2 */}
      <div className="stats-2col" style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>
        <StatsBarChart data={trendData} title="📊 Volumet mujore" color="#22d3a5" name="Oferta" height={180} />
        <ActivityFeed items={activityFeed} title="⚡ Aktiviteti i fundit" />
      </div>

      {/* Highlights */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14 }}>
        {[
          { label:'Norma e suksesit', value:`${stats.successRate}%`,            icon:'🎯', desc:'oferta të pranuara',    color:'#22d3a5' },
          { label:'Në pritje',         value:stats.pendingOffers,               icon:'⏳', desc:'oferta pa përgjigje',   color:'#fbbf24' },
          { label:'Aplikime aktive',   value:stats.activeApplications,          icon:'🔥', desc:'projekte të hapura',    color:'#e8621a' },
        ].map((m,i) => (
          <div key={i} style={{ background:'rgba(240,236,228,0.02)',border:'1px solid rgba(240,236,228,0.07)',borderRadius:16,padding:24,textAlign:'center',animation:`fadeUp 0.4s ease ${i*0.1}s both` }}>
            <div style={{ fontSize:32,marginBottom:12 }}>{m.icon}</div>
            <div style={{ fontFamily:"'Fraunces',serif",fontSize:'2.2rem',fontWeight:900,color:m.color,lineHeight:1,marginBottom:8 }}>{m.value}</div>
            <div style={{ fontSize:13,fontWeight:700,color:'rgba(240,236,228,0.6)',marginBottom:4 }}>{m.label}</div>
            <div style={{ fontSize:11,color:'rgba(240,236,228,0.3)' }}>{m.desc}</div>
          </div>
        ))}
      </div>

      {/* Recent offers table */}
      {recentOffers.length > 0 && (
        <div style={{ background:'rgba(240,236,228,0.02)',border:'1px solid rgba(240,236,228,0.07)',borderRadius:16,overflow:'hidden' }}>
          <div style={{ padding:'14px 20px',borderBottom:'1px solid rgba(240,236,228,0.07)',fontSize:13,fontWeight:700,color:'rgba(240,236,228,0.6)' }}>
            💼 Ofertat e fundit
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 100px 90px 100px',gap:12,padding:'8px 20px',fontSize:10,fontWeight:700,color:'rgba(240,236,228,0.25)',textTransform:'uppercase',letterSpacing:'0.07em',borderBottom:'1px solid rgba(240,236,228,0.05)' }}>
            <span>Projekti</span><span style={{textAlign:'center'}}>Çmimi</span><span style={{textAlign:'center'}}>Ditë</span><span style={{textAlign:'center'}}>Statusi</span>
          </div>
          {recentOffers.slice(0,8).map((o:any,i:number) => (
            <div key={o.id} style={{ display:'grid',gridTemplateColumns:'1fr 100px 90px 100px',gap:12,padding:'12px 20px',borderBottom:i<7?'1px solid rgba(240,236,228,0.04)':'none',alignItems:'center',animation:`fadeUp 0.3s ease ${i*0.04}s both`,background:o.status==='accepted'?'rgba(34,211,165,0.03)':'transparent' }}>
              <div style={{ fontSize:13,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{o.applications?.title||'—'}</div>
              <div style={{ textAlign:'center',fontFamily:"'Fraunces',serif",fontWeight:900,fontSize:'1rem',color:'#e8621a' }}>€{(o.price||0).toLocaleString()}</div>
              <div style={{ textAlign:'center',fontSize:12,color:'rgba(240,236,228,0.5)' }}>{o.duration_days}d</div>
              <div style={{ textAlign:'center' }}>
                <span style={{ fontSize:10,fontWeight:800,padding:'3px 9px',borderRadius:6,background:o.status==='accepted'?'rgba(34,211,165,0.1)':o.status==='pending'?'rgba(251,191,36,0.1)':'rgba(248,113,113,0.1)',color:o.status==='accepted'?'#22d3a5':o.status==='pending'?'#fbbf24':'#f87171',border:`1px solid ${o.status==='accepted'?'rgba(34,211,165,0.2)':o.status==='pending'?'rgba(251,191,36,0.2)':'rgba(248,113,113,0.2)'}` }}>
                  {o.status==='accepted'?'✅ Pranuar':o.status==='pending'?'⏳ Pritje':'❌ Refuzuar'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}