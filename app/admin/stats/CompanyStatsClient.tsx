'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient }  from '@supabase/ssr'
import PageShell                from '@/components/PageShell'
import { KpiCard, TrendAreaChart, StatsBarChart, StatsPieChart, ActivityFeed } from '@/components/Analytics'
import { KpiSkeleton }          from '@/components/Skeleton'

interface Props {
  companyProfile: { id:string; full_name:string; package_type:string }
  company:        { id:string; business_name:string; city:string; rating_avg:number; total_reviews:number }
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function CompanyStatsClient({ companyProfile, company }: Props) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [loading,    setLoading]    = useState(true)
  const [kpis,       setKpis]       = useState({ sent:0, accepted:0, pending:0, declined:0, revenue:0, avgPrice:0 })
  const [trend,      setTrend]      = useState<{label:string;value:number;value2:number}[]>([])
  const [priceTrend, setPriceTrend] = useState<{label:string;value:number}[]>([])
  const [statusPie,  setStatusPie]  = useState<{label:string;value:number;color:string}[]>([])
  const [activity,   setActivity]   = useState<any[]>([])
  const [topBudgets, setTopBudgets] = useState<{label:string;value:number}[]>([])

  useEffect(() => {
    async function load() {
      if (!company?.id) return
      setLoading(true)
      const now = new Date()

      const { data: offersData } = await supabase
        .from('offers')
        .select('id,price,status,created_at,applications(title,budget_max,city)')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false })

      const offers = offersData || []
      const accepted = offers.filter(o=>o.status==='accepted')
      const pending  = offers.filter(o=>o.status==='pending')
      const declined = offers.filter(o=>o.status==='declined'||o.status==='rejected')
      const revenue  = accepted.reduce((s,o)=>s+(o.price||0),0)
      const avgPrice = offers.length>0 ? Math.round(offers.reduce((s,o)=>s+(o.price||0),0)/offers.length) : 0

      setKpis({ sent:offers.length, accepted:accepted.length, pending:pending.length, declined:declined.length, revenue, avgPrice })

      // 6-month trend: sent vs accepted
      const t6 = Array.from({length:6},(_,i)=>{
        const d = new Date(now.getFullYear(), now.getMonth()-5+i, 1)
        const sent = offers.filter(o=>{const od=new Date(o.created_at);return od.getMonth()===d.getMonth()&&od.getFullYear()===d.getFullYear()}).length
        const acc  = accepted.filter(o=>{const od=new Date(o.created_at);return od.getMonth()===d.getMonth()&&od.getFullYear()===d.getFullYear()}).length
        return {label:MONTHS[d.getMonth()], value:sent, value2:acc}
      })
      setTrend(t6)

      // Average price trend
      const pTrend = Array.from({length:6},(_,i)=>{
        const d = new Date(now.getFullYear(), now.getMonth()-5+i, 1)
        const monthOffers = offers.filter(o=>{const od=new Date(o.created_at);return od.getMonth()===d.getMonth()&&od.getFullYear()===d.getFullYear()})
        const avg = monthOffers.length>0 ? Math.round(monthOffers.reduce((s,o)=>s+(o.price||0),0)/monthOffers.length) : 0
        return {label:MONTHS[d.getMonth()], value:avg}
      })
      setPriceTrend(pTrend)

      // Status pie
      setStatusPie([
        {label:'Pranuar',  value:accepted.length, color:'#22d3a5'},
        {label:'Në pritje', value:pending.length,  color:'#fbbf24'},
        {label:'Refuzuar', value:declined.length,  color:'#ef4444'},
      ].filter(d=>d.value>0))

      // Top budget applications we bid on
      const sorted = [...offers].sort((a:any,b:any)=>(b.applications?.budget_max||0)-(a.applications?.budget_max||0)).slice(0,6)
      setTopBudgets(sorted.map((o:any)=>({ label:o.applications?.title?.slice(0,18)||'—', value:o.applications?.budget_max||o.price||0 })))

      // Activity
      setActivity(offers.slice(0,5).map((o:any)=>({
        id:o.id,
        icon: o.status==='accepted'?'✅':o.status==='declined'?'❌':'💼',
        title: o.status==='accepted'?'Ofertë e pranuar!':'Ofertë e dërguar',
        description:`${o.applications?.title||'Aplikim'} — €${o.price?.toLocaleString()||0}`,
        time: new Date(o.created_at).toLocaleDateString('sq-AL'),
        color: o.status==='accepted'?'#22d3a5':o.status==='declined'?'#ef4444':'#e8621a',
      })))

      setLoading(false)
    }
    load()
  }, [company?.id])

  const acceptRate = kpis.sent > 0 ? Math.round((kpis.accepted/kpis.sent)*100) : 0

  return (
    <PageShell role="company" userName={companyProfile.full_name} userId={companyProfile.id}
      package={companyProfile.package_type} pageTitle="Statistikat" pageIcon="📊">

      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div style={{ marginBottom:28, animation:'fadeUp 0.5s ease' }}>
        <p style={{ fontSize:11, fontWeight:700, color:'rgba(240,236,228,0.3)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:8 }}>Performanca</p>
        <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(1.5rem,3vw,2rem)', fontWeight:900, letterSpacing:'-0.03em', lineHeight:1.1 }}>
          {company?.business_name} — <span style={{ color:'#e8621a', fontStyle:'italic' }}>statistikat</span>
        </h1>
      </div>

      {/* KPIs */}
      {loading ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:28 }}>
          {[1,2,3,4,5,6].map(i=><KpiSkeleton key={i}/>)}
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(165px,1fr))', gap:12, marginBottom:28 }}>
          <KpiCard title="Oferta dërguar"   value={kpis.sent}      icon="💼" color="#e8621a" />
          <KpiCard title="Të pranuara"       value={kpis.accepted}  icon="✅" color="#22d3a5" />
          <KpiCard title="Në pritje"          value={kpis.pending}   icon="⏳" color="#fbbf24" />
          <KpiCard title="Refuzuar"          value={kpis.declined}  icon="❌" color="#ef4444" />
          <KpiCard title="Të ardhura"        value={kpis.revenue}   icon="💰" color="#a78bfa" prefix="€" />
          <KpiCard title="Çmimi mesatar"     value={kpis.avgPrice}  icon="📊" color="#60a5fa" prefix="€" />
        </div>
      )}

      {/* Charts row 1 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
        <TrendAreaChart
          data={trend}
          title="📈 Dërguar vs Pranuar — 6 muaj"
          color="#e8621a"
          color2="#22d3a5"
          name="Dërguar"
          name2="Pranuar"
          height={200}
        />
        <StatsPieChart
          data={statusPie}
          title="📊 Statusi i ofertave"
          height={200}
        />
      </div>

      {/* Charts row 2 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:28 }}>
        <StatsBarChart
          data={priceTrend}
          title="💰 Çmimi mesatar — 6 muaj"
          color="#a78bfa"
          name="Çmimi (€)"
          prefix="€"
          height={180}
        />
        <ActivityFeed items={activity} title="🕐 Aktiviteti i fundit" />
      </div>

      {/* Highlight metrics */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
        {[
          { label:'Norma e pranimit', value:`${acceptRate}%`,          icon:'🎯', desc:'oferta të pranuara', color:'#22d3a5' },
          { label:'Vlerësimi mesatar', value: company?.rating_avg>0 ? `${company.rating_avg.toFixed(1)}★` : '—', icon:'⭐', desc:`nga ${company?.total_reviews||0} vlerësime`, color:'#fbbf24' },
          { label:'Të ardhura totale', value:`€${kpis.revenue.toLocaleString()}`,  icon:'💰', desc:'nga punët e pranuara', color:'#a78bfa' },
        ].map((m,i)=>(
          <div key={i} style={{ background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:16, padding:'24px', textAlign:'center' }}>
            <div style={{ fontSize:32, marginBottom:12 }}>{m.icon}</div>
            <div style={{ fontFamily:"'Fraunces',serif", fontSize:'2.2rem', fontWeight:900, color:m.color, lineHeight:1, marginBottom:8 }}>{m.value}</div>
            <div style={{ fontSize:13, fontWeight:700, color:'rgba(240,236,228,0.6)', marginBottom:4 }}>{m.label}</div>
            <div style={{ fontSize:11, color:'rgba(240,236,228,0.3)' }}>{m.desc}</div>
          </div>
        ))}
      </div>
    </PageShell>
  )
}