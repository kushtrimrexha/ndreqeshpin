'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient }  from '@supabase/ssr'
import PageShell                from '@/components/PageShell'
import { KpiCard, TrendAreaChart, StatsBarChart, StatsPieChart, ActivityFeed } from '@/components/Analytics'
import { KpiSkeleton }          from '@/components/Skeleton'

interface Props { adminProfile: { id:string; full_name:string; package_type:string } }

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function AdminStatsClient({ adminProfile }: Props) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [loading,     setLoading]     = useState(true)
  const [kpis,        setKpis]        = useState({ users:0, companies:0, apps:0, offers:0, revenue:0, premium:0, verified:0, reviews:0 })
  const [userTrend,   setUserTrend]   = useState<{label:string;value:number;value2:number}[]>([])
  const [offerTrend,  setOfferTrend]  = useState<{label:string;value:number}[]>([])
  const [cityData,    setCityData]    = useState<{label:string;value:number}[]>([])
  const [rolePie,     setRolePie]     = useState<{label:string;value:number;color:string}[]>([])
  const [activity,    setActivity]    = useState<any[]>([])

  useEffect(() => {
    async function load() {
      setLoading(true)
      const now = new Date()

      const [
        { count: totalUsers },
        { count: totalCompanies },
        { count: totalApps },
        { count: totalOffers },
        { count: premium },
        { count: verified },
        { count: reviews },
        { data: profilesData },
        { data: offersData },
        { data: appsData },
      ] = await Promise.all([
        supabase.from('profiles').select('*',{count:'exact',head:true}),
        supabase.from('companies').select('*',{count:'exact',head:true}),
        supabase.from('applications').select('*',{count:'exact',head:true}),
        supabase.from('offers').select('*',{count:'exact',head:true}),
        supabase.from('profiles').select('*',{count:'exact',head:true}).eq('package_type','premium'),
        supabase.from('companies').select('*',{count:'exact',head:true}).eq('is_verified',true),
        supabase.from('reviews').select('*',{count:'exact',head:true}),
        supabase.from('profiles').select('id,role,created_at'),
        supabase.from('offers').select('id,price,status,created_at'),
        supabase.from('applications').select('id,city,created_at'),
      ])

      const revenue = (offersData||[]).filter(o=>o.status==='accepted').reduce((s,o)=>s+(o.price||0),0)
      setKpis({ users:totalUsers||0, companies:totalCompanies||0, apps:totalApps||0, offers:totalOffers||0, revenue, premium:premium||0, verified:verified||0, reviews:reviews||0 })

      // 6-month user + offer trend
      const profiles = profilesData || []
      const offers   = offersData   || []
      const apps     = appsData     || []

      const trend = Array.from({length:6},(_,i)=>{
        const d = new Date(now.getFullYear(), now.getMonth()-5+i, 1)
        const label = MONTHS[d.getMonth()]
        const newUsers = profiles.filter(p=>{const pd=new Date(p.created_at);return pd.getMonth()===d.getMonth()&&pd.getFullYear()===d.getFullYear()}).length
        const newOffers = offers.filter(o=>{const od=new Date(o.created_at);return od.getMonth()===d.getMonth()&&od.getFullYear()===d.getFullYear()}).length
        return {label, value:newUsers, value2:newOffers}
      })
      setUserTrend(trend)

      // Offer trend
      const ofTrend = Array.from({length:6},(_,i)=>{
        const d = new Date(now.getFullYear(), now.getMonth()-5+i, 1)
        const count = offers.filter(o=>{const od=new Date(o.created_at);return od.getMonth()===d.getMonth()&&od.getFullYear()===d.getFullYear()}).length
        return {label:MONTHS[d.getMonth()], value:count}
      })
      setOfferTrend(ofTrend)

      // Top cities
      const cityCount: Record<string,number> = {}
      apps.forEach((a:any) => { if(a.city) cityCount[a.city]=(cityCount[a.city]||0)+1 })
      const cities = Object.entries(cityCount).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([label,value])=>({label,value}))
      setCityData(cities)

      // Role breakdown
      const roleCount: Record<string,number> = {client:0,company:0,worker:0,admin:0}
      profiles.forEach((p:any) => { if(roleCount[p.role]!==undefined) roleCount[p.role]++ })
      setRolePie([
        {label:'Klientë',  value:roleCount.client,  color:'#3b82f6'},
        {label:'Kompani',  value:roleCount.company, color:'#e8621a'},
        {label:'Punëtorë', value:roleCount.worker,  color:'#10b981'},
        {label:'Admin',    value:roleCount.admin,   color:'#a78bfa'},
      ].filter(d=>d.value>0))

      // Recent activity
      const recentOffers = offers.sort((a:any,b:any)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime()).slice(0,5)
      setActivity(recentOffers.map((o:any)=>({
        id:o.id,
        icon: o.status==='accepted'?'✅':o.status==='declined'?'❌':'💼',
        title: o.status==='accepted'?'Ofertë e pranuar':'Ofertë e re',
        description:`€${o.price?.toLocaleString()||0}`,
        time: new Date(o.created_at).toLocaleDateString('sq-AL'),
        color: o.status==='accepted'?'#10b981':o.status==='declined'?'#ef4444':'#e8621a',
      })))

      setLoading(false)
    }
    load()
  }, [])

  return (
    <PageShell role="admin" userName={adminProfile.full_name} userId={adminProfile.id}
      package={adminProfile.package_type} pageTitle="Statistikat Globale" pageIcon="📊">

      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div style={{ marginBottom:28, animation:'fadeUp 0.5s ease' }}>
        <p style={{ fontSize:11, fontWeight:700, color:'rgba(240,236,228,0.3)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:8 }}>Analitikë</p>
        <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(1.5rem,3vw,2rem)', fontWeight:900, letterSpacing:'-0.03em', lineHeight:1.1 }}>
          Statistikat e <span style={{ color:'#a78bfa', fontStyle:'italic' }}>platformës</span>
        </h1>
      </div>

      {/* KPI Row */}
      {loading ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:28 }}>
          {[1,2,3,4,5,6,7,8].map(i=><KpiSkeleton key={i}/>)}
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))', gap:12, marginBottom:28 }}>
          <KpiCard title="Përdorues total"  value={kpis.users}     icon="👥" color="#3b82f6"  changeLabel="regjistruar" />
          <KpiCard title="Kompani"          value={kpis.companies} icon="🏢" color="#e8621a"  changeLabel="aktive" />
          <KpiCard title="Aplikimet"        value={kpis.apps}      icon="📋" color="#10b981"  changeLabel="gjithsej" />
          <KpiCard title="Ofertat"          value={kpis.offers}    icon="💼" color="#fbbf24"  changeLabel="dërguar" />
          <KpiCard title="Të ardhura tot."  value={kpis.revenue}   icon="💰" color="#22d3a5"  prefix="€" changeLabel="nga ofertat e pranuara" />
          <KpiCard title="Premium"          value={kpis.premium}   icon="💎" color="#a78bfa"  changeLabel="abonentë" />
          <KpiCard title="Të verifikuara"   value={kpis.verified}  icon="✓"  color="#10b981"  changeLabel="kompani" />
          <KpiCard title="Vlerësimet"       value={kpis.reviews}   icon="⭐" color="#fbbf24"  changeLabel="total" />
        </div>
      )}

      {/* Main Charts */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
        <TrendAreaChart
          data={userTrend}
          title="📈 Regjistrime & Oferta — 6 muajt"
          color="#3b82f6"
          color2="#e8621a"
          name="Regjistrime"
          name2="Oferta"
          height={200}
        />
        <StatsPieChart
          data={rolePie}
          title="👥 Shpërndarje sipas roleve"
          height={200}
        />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:28 }}>
        <StatsBarChart
          data={cityData}
          title="🏙️ Top qytetet — aplikimet"
          color="#10b981"
          name="Aplikimet"
          height={180}
        />
        <ActivityFeed items={activity} title="⚡ Aktiviteti i fundit" />
      </div>

      {/* Highlight metrics */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
        {[
          {
            label:'Norma e pranimit',
            value: kpis.offers > 0 ? `${Math.round((kpis.apps/(kpis.offers||1))*100)}%` : '—',
            icon:'🎯',
            desc:'aplikime për ofertë',
            color:'#22d3a5',
          },
          {
            label:'Premium rate',
            value: kpis.users > 0 ? `${Math.round((kpis.premium/kpis.users)*100)}%` : '—',
            icon:'💎',
            desc:'e përdoruesve',
            color:'#a78bfa',
          },
          {
            label:'Verifikimi',
            value: kpis.companies > 0 ? `${Math.round((kpis.verified/kpis.companies)*100)}%` : '—',
            icon:'✓',
            desc:'e kompanive',
            color:'#10b981',
          },
        ].map((m,i)=>(
          <div key={i} style={{ background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:16, padding:'24px', textAlign:'center' }}>
            <div style={{ fontSize:32, marginBottom:12 }}>{m.icon}</div>
            <div style={{ fontFamily:"'Fraunces',serif", fontSize:'2.5rem', fontWeight:900, color:m.color, lineHeight:1, marginBottom:8 }}>{m.value}</div>
            <div style={{ fontSize:13, fontWeight:700, color:'rgba(240,236,228,0.6)', marginBottom:4 }}>{m.label}</div>
            <div style={{ fontSize:11, color:'rgba(240,236,228,0.3)' }}>{m.desc}</div>
          </div>
        ))}
      </div>
    </PageShell>
  )
}