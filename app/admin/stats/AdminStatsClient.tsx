'use client'

import { useState } from 'react'
import { KpiCard, TrendAreaChart, StatsBarChart, StatsPieChart, TrendLineChart, ActivityFeed, MetricBar } from '@/components/Analytics'

interface Stats {
  totalUsers:number; totalCompanies:number; totalApplications:number
  totalOffers:number; totalReviews:number; activeApplications:number
  acceptedOffers:number; verifiedCompanies:number
  newUsersMonth:number; newAppsMonth:number; newOffersWeek:number
  successRate:number; premiumUsers:number
}

interface Props {
  stats:                Stats
  recentUsers:          any[]
  recentApps:           any[]
  monthlyRegistrations: Record<string, number>
  cityBreakdown?:       Record<string, number>
}

export default function AdminStatsClient({ stats, recentUsers, recentApps, monthlyRegistrations, cityBreakdown = {} }: Props) {
  const [chartMode, setChartMode] = useState<'registrations'|'activity'>('registrations')

  const trendData = Object.entries(monthlyRegistrations).map(([label, value]) => ({ label, value }))

  const cityData = Object.entries(cityBreakdown)
    .sort((a,b) => b[1]-a[1])
    .slice(0,6)
    .map(([label, value]) => ({ label, value }))

  const activityFeed = [
    ...recentUsers.slice(0,3).map((u:any) => ({
      id:    u.id,
      icon:  u.role==='company'?'🏢':u.role==='worker'?'🔧':'👤',
      title: 'Regjistrim i ri',
      description:`${u.full_name} — ${u.role}${u.city?` · ${u.city}`:''}`,
      time:  new Date(u.created_at).toLocaleDateString('sq-AL'),
      color: u.role==='company'?'#e8621a':u.role==='worker'?'#10b981':'#3b82f6',
    })),
    ...recentApps.slice(0,2).map((a:any) => ({
      id:    a.id,
      icon:  '📋',
      title: 'Aplikim i ri',
      description:`${a.title} — ${a.city||''}`,
      time:  new Date(a.created_at).toLocaleDateString('sq-AL'),
      color: '#a78bfa',
    })),
  ]

  const rolePie = [
    { label:'Klientë',  value: Math.max(0, stats.totalUsers - stats.totalCompanies - Math.round(stats.totalUsers*0.3)), color:'#3b82f6' },
    { label:'Kompani',  value: stats.totalCompanies, color:'#e8621a' },
    { label:'Punëtorë', value: Math.round(stats.totalUsers*0.3), color:'#10b981' },
  ].filter(d => d.value > 0)

  const packagePie = [
    { label:'Falas',   value: Math.max(0, stats.totalUsers - (stats.premiumUsers||0)), color:'rgba(240,236,228,0.3)' },
    { label:'Premium', value: stats.premiumUsers||0, color:'#a78bfa' },
  ].filter(d => d.value > 0)

  const platformHealth = [
    { icon:'✓', label:'Verifikimi i kompanive', value:stats.totalCompanies>0?Math.round((stats.verifiedCompanies/stats.totalCompanies)*100):0, color:'#22d3a5' },
    { icon:'💎', label:'Konvertim Premium',       value:stats.totalUsers>0?Math.round(((stats.premiumUsers||0)/stats.totalUsers)*100):0, color:'#a78bfa' },
    { icon:'🎯', label:'Norma suksesit',           value:stats.successRate, color:'#e8621a' },
    { icon:'📈', label:'Rritja mujore',             value:stats.totalUsers>0?Math.round((stats.newUsersMonth/stats.totalUsers)*100):0, color:'#3b82f6' },
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @media(max-width:900px){ .sg2{grid-template-columns:1fr!important} }
        @media(max-width:600px){ .kg{grid-template-columns:1fr 1fr!important} }
        .tab-b:hover { color:rgba(240,236,228,0.8)!important }
      `}</style>

      {/* Header */}
      <div style={{ animation:'fadeUp 0.4s ease' }}>
        <p style={{ fontSize:11, fontWeight:700, color:'rgba(240,236,228,0.3)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:8 }}>Analitikë</p>
        <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(1.5rem,3vw,2rem)', fontWeight:900, letterSpacing:'-0.03em', lineHeight:1.1 }}>
          Statistikat e <span style={{ color:'#a78bfa', fontStyle:'italic' }}>platformës</span>
        </h1>
      </div>

      {/* KPIs */}
      <div className="kg" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(155px,1fr))', gap:12 }}>
        <KpiCard title="Përdorues"          value={stats.totalUsers}         icon="👥" color="#3b82f6"  subtitle={`+${stats.newUsersMonth} këtë muaj`}/>
        <KpiCard title="Kompani"             value={stats.totalCompanies}      icon="🏢" color="#e8621a"  subtitle={`${stats.verifiedCompanies} verified`}/>
        <KpiCard title="Aplikimet"           value={stats.totalApplications}   icon="📋" color="#10b981"  subtitle={`${stats.activeApplications} aktive`}/>
        <KpiCard title="Ofertat"             value={stats.totalOffers}         icon="💼" color="#fbbf24"  subtitle={`+${stats.newOffersWeek} kjo javë`}/>
        <KpiCard title="Të pranuara"         value={stats.acceptedOffers}      icon="✅" color="#22d3a5"/>
        <KpiCard title="Vlerësimet"          value={stats.totalReviews}        icon="⭐" color="#f59e0b"/>
        <KpiCard title="Premium"             value={stats.premiumUsers||0}     icon="💎" color="#a78bfa"/>
        <KpiCard title="Norma suksesit"      value={`${stats.successRate}%`}   icon="🎯" color="#60a5fa"/>
      </div>

      {/* Platform health */}
      <div style={{ padding:'20px 22px', background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.08)', borderRadius:18 }}>
        <div style={{ fontSize:13, fontWeight:700, color:'rgba(240,236,228,0.6)', marginBottom:18 }}>📊 Shëndeti i platformës</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          {platformHealth.map((m,i) => (
            <MetricBar key={i} label={m.label} value={m.value} color={m.color} icon={m.icon}/>
          ))}
        </div>
      </div>

      {/* Main charts */}
      <div className="sg2" style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:14 }}>
        <div>
          {/* Chart toggle */}
          <div style={{ display:'flex', gap:4, background:'rgba(240,236,228,0.04)', padding:3, borderRadius:10, marginBottom:14, width:'fit-content' }}>
            {([['registrations','Regjistrime'],['activity','Aktivitet']] as const).map(([k,l]) => (
              <button key={k} className="tab-b" onClick={() => setChartMode(k)}
                style={{ padding:'6px 14px', borderRadius:8, border:'none', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit', background:chartMode===k?'rgba(240,236,228,0.1)':'transparent', color:chartMode===k?'#f0ece4':'rgba(240,236,228,0.4)', transition:'all 0.2s' }}>{l}
              </button>
            ))}
          </div>
          <TrendAreaChart data={trendData} title="📈 Regjistrime — 6 muajt e fundit" color="#3b82f6" name="Përdorues" height={210}/>
        </div>
        <StatsPieChart data={rolePie} title="👥 Shpërndarje sipas roleve" height={210}/>
      </div>

      <div className="sg2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        {cityData.length > 0 && <StatsBarChart data={cityData} title="📍 Shpërndarje sipas qyteteve" color="#e8621a" height={180}/>}
        <StatsPieChart data={packagePie} title="💎 Paketa Falas vs Premium" height={180}/>
      </div>

      {/* Highlight tiles */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
        {[
          { label:'Norma suksesit', value:`${stats.successRate}%`, icon:'🎯', desc:'oferta të pranuara', color:'#22d3a5' },
          { label:'Verifikimi',     value:stats.totalCompanies>0?`${Math.round((stats.verifiedCompanies/stats.totalCompanies)*100)}%`:'—', icon:'✓', desc:'e kompanive', color:'#10b981' },
          { label:'Aktive tani',    value:stats.activeApplications, icon:'🔥', desc:'aplikime aktive', color:'#e8621a' },
        ].map((m,i) => (
          <div key={i} style={{ background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:16, padding:24, textAlign:'center', animation:`fadeUp 0.4s ease ${i*0.1}s both` }}>
            <div style={{ fontSize:30, marginBottom:10 }}>{m.icon}</div>
            <div style={{ fontFamily:"'Fraunces',serif", fontSize:'2rem', fontWeight:900, color:m.color, lineHeight:1, marginBottom:6 }}>{typeof m.value==='number'?m.value.toLocaleString('sq-AL'):m.value}</div>
            <div style={{ fontSize:13, fontWeight:700, color:'rgba(240,236,228,0.55)', marginBottom:3 }}>{m.label}</div>
            <div style={{ fontSize:11, color:'rgba(240,236,228,0.3)' }}>{m.desc}</div>
          </div>
        ))}
      </div>

      {/* Activity + Recent users */}
      <div className="sg2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        <ActivityFeed items={activityFeed} title="⚡ Aktiviteti i fundit"/>
        {recentUsers.length > 0 && (
          <div style={{ background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:16, overflow:'hidden' }}>
            <div style={{ padding:'14px 20px', borderBottom:'1px solid rgba(240,236,228,0.07)', fontSize:13, fontWeight:700, color:'rgba(240,236,228,0.6)' }}>👥 Regjistrimet e fundit</div>
            {recentUsers.slice(0,6).map((u:any,i:number) => (
              <div key={u.id} style={{ display:'grid', gridTemplateColumns:'1fr 100px 90px', gap:8, padding:'11px 20px', borderBottom:i<5?'1px solid rgba(240,236,228,0.05)':'none', alignItems:'center', animation:`fadeUp 0.3s ease ${i*0.04}s both` }}>
                <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                  <div style={{ width:30, height:30, borderRadius:9, background:u.role==='company'?'rgba(232,98,26,0.15)':u.role==='worker'?'rgba(16,185,129,0.15)':'rgba(59,130,246,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:u.role==='company'?'#e8621a':u.role==='worker'?'#10b981':'#3b82f6', flexShrink:0 }}>
                    {(u.full_name||'U').slice(0,2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize:12, fontWeight:700 }}>{u.full_name}</div>
                    {u.city&&<div style={{ fontSize:10, color:'rgba(240,236,228,0.35)' }}>📍 {u.city}</div>}
                  </div>
                </div>
                <div style={{ fontSize:10, fontWeight:700, color:u.role==='company'?'#e8621a':u.role==='worker'?'#10b981':'#3b82f6', background:u.role==='company'?'rgba(232,98,26,0.1)':u.role==='worker'?'rgba(16,185,129,0.1)':'rgba(59,130,246,0.1)', borderRadius:6, padding:'2px 8px', textAlign:'center' }}>
                  {u.role==='company'?'🏢':u.role==='worker'?'🔧':'👤'} {u.role}
                </div>
                <div style={{ fontSize:10, color:'rgba(240,236,228,0.3)', textAlign:'right' }}>
                  {new Date(u.created_at).toLocaleDateString('sq-AL',{day:'numeric',month:'short'})}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}