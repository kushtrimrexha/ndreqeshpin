'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient }  from '@supabase/ssr'
import PageShell                from '@/components/PageShell'
import StatusBadge              from '@/components/StatusBadge'
import EmptyState               from '@/components/EmptyState'
import { useToast }             from '@/components/Toast'
import { KpiCard, TrendAreaChart, StatsPieChart, ActivityFeed } from '@/components/Analytics'
import { KpiSkeleton }          from '@/components/Skeleton'
import Link                     from 'next/link'

interface Profile { id:string; full_name:string; city:string; package_type:string; avatar_url?:string }
interface Worker  { id:string; profession:string; bio:string|null; is_available:boolean; rating_avg:number; total_reviews:number }
interface Application {
  id:string; title:string; description:string; city:string
  area_sqm:number|null; budget_min:number|null; budget_max:number|null
  offer_count:number; expires_at:string; created_at:string
  categories?:{name:string;icon:string}
}

function Countdown({ expiresAt }: { expiresAt: string }) {
  const calc = () => {
    const d = new Date(expiresAt).getTime() - Date.now()
    if (d <= 0) return { label:'Skaduar', urgent:false, expired:true }
    const h = Math.floor(d/3600000), m = Math.floor((d%3600000)/60000), s = Math.floor((d%60000)/1000)
    return { label:`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`, urgent:d<3*3600000, expired:false }
  }
  const [t, setT] = useState(calc)
  useEffect(() => { const i = setInterval(() => setT(calc()), 1000); return () => clearInterval(i) }, [expiresAt])
  const col = t.expired ? '#6b7280' : t.urgent ? '#ef4444' : '#10b981'
  return <span style={{ fontFamily:"'Fira Code',monospace", fontSize:11, fontWeight:700, color:col, background:`${col}12`, border:`1px solid ${col}30`, borderRadius:100, padding:'3px 9px', whiteSpace:'nowrap' }}>⏱ {t.label}</span>
}

export default function WorkerDashboard({ profile, worker }: { profile: Profile; worker: Worker }) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const toast = useToast()

  const [apps,          setApps]          = useState<Application[]>([])
  const [loading,       setLoading]       = useState(true)
  const [available,     setAvailable]     = useState(worker?.is_available ?? true)
  const [togglingAvail, setTogglingAvail] = useState(false)
  const [stats,         setStats]         = useState({ sent:0, accepted:0, pending:0, earnings:0 })
  const [chartData,     setChartData]     = useState<{label:string;value:number}[]>([])
  const [activity,      setActivity]      = useState<any[]>([])
  const [filterCity,    setFilterCity]    = useState<'all'|'mine'>('all')

  const isPremium = profile.package_type !== 'free'

  useEffect(() => {
    async function load() {
      setLoading(true)

      // Applications in worker's city + all
      const query = supabase.from('applications')
        .select('*, categories(name,icon)')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(30)

      const { data: appsData } = await query
      setApps(appsData || [])

      // Worker's own offers
      const { data: offersData } = await supabase
        .from('offers')
        .select('id, price, status, created_at, applications(title)')
        .eq('worker_id', worker?.id)
        .order('created_at', { ascending: false })

      const offers = offersData || []
      const accepted = offers.filter(o => o.status === 'accepted')
      const pending  = offers.filter(o => o.status === 'pending')
      const earnings = accepted.reduce((s, o) => s + (o.price || 0), 0)
      setStats({ sent: offers.length, accepted: accepted.length, pending: pending.length, earnings })

      // Monthly trend
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
      const now = new Date()
      const trend = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
        const count = offers.filter(o => {
          const od = new Date(o.created_at)
          return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear()
        }).length
        return { label: months[d.getMonth()], value: count }
      })
      setChartData(trend)

      // Activity from recent offers
      const act = offers.slice(0, 5).map((o: any) => ({
        id: o.id,
        icon: o.status === 'accepted' ? '✅' : o.status === 'declined' ? '❌' : '💼',
        title: o.status === 'accepted' ? 'Ofertë e pranuar!' : 'Ofertë e dërguar',
        description: `${o.applications?.title || 'Aplikim'} — €${o.price?.toLocaleString() || 0}`,
        time: new Date(o.created_at).toLocaleDateString('sq-AL'),
        color: o.status === 'accepted' ? '#10b981' : o.status === 'declined' ? '#ef4444' : '#3b82f6',
      }))
      setActivity(act)

      setLoading(false)
    }
    load()
  }, [worker?.id])

  async function toggleAvailability() {
    setTogglingAvail(true)
    const next = !available
    const { error } = await supabase.from('workers').update({ is_available: next }).eq('id', worker?.id)
    if (error) { toast.error('Gabim', 'Provo sërish.'); setTogglingAvail(false); return }
    setAvailable(next)
    setTogglingAvail(false)
    toast.success(
      next ? '✅ Tani je i disponueshëm!' : '⏸ Disponueshmëria u çaktivizua',
      next ? 'Klientët mund të shohin profilin tënd dhe të dërgojnë oferta.' : 'Nuk do të shfaqesh në rezultate kërkimi.'
    )
  }

  const filteredApps = filterCity === 'mine'
    ? apps.filter(a => a.city?.toLowerCase() === profile.city?.toLowerCase())
    : apps

  return (
    <PageShell role="worker" userName={profile.full_name} userId={profile.id}
      avatar={profile.avatar_url} package={profile.package_type}
      pageTitle="Dashboard" pageIcon="⊞"
      actions={
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          {/* Availability Toggle */}
          <button onClick={toggleAvailability} disabled={togglingAvail}
            style={{
              display:'flex', alignItems:'center', gap:8, padding:'8px 16px',
              borderRadius:10, border:'none', cursor: togglingAvail ? 'not-allowed' : 'pointer',
              fontFamily:'inherit', fontSize:13, fontWeight:700, transition:'all 0.2s',
              background: available ? 'rgba(16,185,129,0.12)' : 'rgba(240,236,228,0.06)',
              color: available ? '#10b981' : 'rgba(240,236,228,0.4)',
              boxShadow: available ? '0 0 0 1px rgba(16,185,129,0.25)' : '0 0 0 1px rgba(240,236,228,0.1)',
            }}>
            <div style={{
              width:8, height:8, borderRadius:'50%',
              background: available ? '#10b981' : 'rgba(240,236,228,0.25)',
              boxShadow: available ? '0 0 8px rgba(16,185,129,0.8)' : 'none',
              animation: available ? 'pulse 2s infinite' : 'none',
            }} />
            {togglingAvail ? 'Duke ndryshuar...' : available ? 'I disponueshëm' : 'Jo aktiv'}
          </button>
          <Link href="/worker/offers" style={{ display:'inline-flex', alignItems:'center', gap:7, background:'linear-gradient(135deg,#3b82f6,#6366f1)', color:'#fff', fontWeight:700, fontSize:13, padding:'9px 20px', borderRadius:11, textDecoration:'none', boxShadow:'0 4px 16px rgba(59,130,246,0.3)' }}>
            💼 Ofertat e mia
          </Link>
        </div>
      }>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .app-card { transition: all 0.2s !important; }
        .app-card:hover { border-color: rgba(59,130,246,0.35) !important; transform: translateY(-2px); background: rgba(59,130,246,0.04) !important; }
        .quick-link:hover { border-color: rgba(59,130,246,0.25) !important; transform: translateY(-2px); }
        .offer-btn:hover { opacity: 0.85 !important; transform: translateY(-1px); }
        @media(max-width:900px) { .worker-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* Greeting */}
      <div style={{ marginBottom:28, animation:'fadeUp 0.5s ease' }}>
        <p style={{ fontSize:11, fontWeight:700, color:'rgba(240,236,228,0.3)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:8 }}>
          {worker?.profession || 'Punëtor profesionist'}
        </p>
        <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(1.5rem,3vw,2rem)', fontWeight:900, letterSpacing:'-0.03em', lineHeight:1.1, marginBottom:10 }}>
          {profile.full_name.split(' ')[0]}, <span style={{ color:'#3b82f6', fontStyle:'italic' }}>çfarë punon sot?</span>
        </h1>
        <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
          <span style={{ fontSize:12, color:'rgba(240,236,228,0.4)' }}>📍 {profile.city}</span>
          <StatusBadge status={available ? 'active' : 'inactive'} size="xs" />
          {isPremium && <StatusBadge status="premium" size="xs" />}
          {worker?.rating_avg > 0 && (
            <span style={{ fontSize:12, color:'#fbbf24', fontWeight:700 }}>★ {worker.rating_avg.toFixed(1)} ({worker.total_reviews} vlerësime)</span>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:28 }}>
          {[1,2,3,4].map(i => <KpiSkeleton key={i} />)}
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:12, marginBottom:28 }}>
          <KpiCard title="Oferta dërguar" value={stats.sent}     icon="💼" color="#3b82f6" change={stats.sent > 3 ? 8 : undefined} />
          <KpiCard title="Të pranuara"    value={stats.accepted}  icon="✅" color="#10b981" change={stats.accepted > 0 ? 15 : undefined} />
          <KpiCard title="Në pritje"       value={stats.pending}   icon="⏳" color="#fbbf24" />
          <KpiCard title="Të ardhura"      value={stats.earnings}  icon="💰" color="#a78bfa" prefix="€" changeLabel="nga punët" />
        </div>
      )}

      {/* Charts */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:24 }}>
        <TrendAreaChart data={chartData} title="📈 Aktiviteti — 6 muajt e fundit" color="#3b82f6" name="Oferta" height={180} />
        {stats.sent > 0 ? (
          <StatsPieChart
            data={[
              { label:'Pranuar',  value: stats.accepted,                                          color:'#10b981' },
              { label:'Në pritje', value: stats.pending,                                           color:'#fbbf24' },
              { label:'Refuzuar', value: stats.sent - stats.accepted - stats.pending,              color:'#ef4444' },
            ].filter(d => d.value > 0)}
            title="📊 Statusi i ofertave" height={180}
          />
        ) : (
          <div style={{ background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <EmptyState icon="📊" title="Ende pa të dhëna" message="Dërgoni oferta për të parë statistikat" size="sm" />
          </div>
        )}
      </div>

      {/* Applications + Activity */}
      <div className="worker-grid" style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:14, marginBottom:28 }}>

        {/* Available applications */}
        <div style={{ background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:16, overflow:'hidden' }}>
          <div style={{ padding:'14px 20px', borderBottom:'1px solid rgba(240,236,228,0.07)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
            <span style={{ fontSize:13, fontWeight:700, color:'#f0ece4', opacity:0.7 }}>📋 Aplikimet aktive</span>
            <div style={{ display:'flex', gap:4 }}>
              {(['all','mine'] as const).map(f => (
                <button key={f} onClick={() => setFilterCity(f)}
                  style={{ padding:'5px 12px', borderRadius:8, border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:11, fontWeight:700, background: filterCity===f ? '#3b82f6' : 'rgba(240,236,228,0.06)', color: filterCity===f ? '#fff' : 'rgba(240,236,228,0.4)', transition:'all 0.15s' }}>
                  {f === 'all' ? '🌍 Të gjitha' : `📍 ${profile.city}`}
                </button>
              ))}
            </div>
          </div>
          <div style={{ padding:12, display:'flex', flexDirection:'column', gap:8, maxHeight:400, overflowY:'auto' }}>
            {loading ? [1,2,3].map(i => (
              <div key={i} style={{ padding:14, border:'1px solid rgba(240,236,228,0.06)', borderRadius:12, display:'flex', flexDirection:'column', gap:8 }}>
                <div style={{ height:13, borderRadius:5, background:'rgba(240,236,228,0.06)', width:'70%' }} />
                <div style={{ height:11, borderRadius:5, background:'rgba(240,236,228,0.04)', width:'50%' }} />
              </div>
            )) : filteredApps.length === 0 ? (
              <EmptyState icon="📭" title="Asnjë aplikim" message="Nuk ka aplikime aktive për momentin." size="sm" />
            ) : filteredApps.map((app, i) => (
              <div key={app.id} className="app-card"
                style={{ padding:'14px 16px', background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:12, animation:`fadeUp 0.3s ease ${i*0.05}s both`, cursor:'default' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10, marginBottom:8 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    {app.categories && <span style={{ fontSize:10, color:'rgba(240,236,228,0.35)', display:'block', marginBottom:3 }}>{app.categories.icon} {app.categories.name}</span>}
                    <div style={{ fontSize:13, fontWeight:700, color:'#f0ece4', lineHeight:1.3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{app.title}</div>
                  </div>
                  {app.budget_max && app.budget_max > 0 && (
                    <div style={{ fontFamily:"'Fraunces',serif", fontSize:'1.1rem', fontWeight:900, color:'#3b82f6', whiteSpace:'nowrap', flexShrink:0 }}>€{app.budget_max.toLocaleString()}</div>
                  )}
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'center', justifyContent:'space-between', flexWrap:'wrap' }}>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <span style={{ fontSize:11, color:'rgba(240,236,228,0.35)' }}>📍 {app.city}</span>
                    <Countdown expiresAt={app.expires_at} />
                  </div>
                  <Link href={`/worker/offers?apply=${app.id}`}
                    className="offer-btn"
                    style={{ fontSize:11, fontWeight:700, color:'#fff', background:'linear-gradient(135deg,#3b82f6,#6366f1)', padding:'5px 14px', borderRadius:8, textDecoration:'none', transition:'all 0.2s', boxShadow:'0 2px 8px rgba(59,130,246,0.3)' }}>
                    Apliko →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity */}
        <ActivityFeed items={activity} title="🕐 Aktiviteti im" />
      </div>

      {/* Quick links */}
      <div>
        <p style={{ fontSize:11, fontWeight:700, color:'rgba(240,236,228,0.3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:14 }}>Aksesi i shpejtë</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:10 }}>
          {[
            { href:'/worker/applications', icon:'📋', label:'Aplikimet',   desc:'Gjej punë' },
            { href:'/worker/offers',       icon:'💼', label:'Ofertat',     desc:'Menaxho bids' },
            { href:'/worker/messages',     icon:'💬', label:'Mesazhet',    desc:'Komuniko' },
            { href:'/worker/reviews',      icon:'⭐', label:'Vlerësimet',  desc:'Reputacioni yt' },
            { href:'/worker/profile',      icon:'👤', label:'Profili',     desc:'Edito profilin' },
            { href:'/pricing',             icon:'💎', label:'Premium',     desc:'Shiko më shumë punë' },
          ].map(item => (
            <Link key={item.href} href={item.href} className="quick-link"
              style={{ padding:'16px', background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:14, textDecoration:'none', transition:'all 0.2s', display:'block' }}>
              <div style={{ fontSize:22, marginBottom:8 }}>{item.icon}</div>
              <div style={{ fontSize:13, fontWeight:700, color:'#f0ece4', marginBottom:3 }}>{item.label}</div>
              <div style={{ fontSize:11, color:'rgba(240,236,228,0.35)' }}>{item.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </PageShell>
  )
}