'use client'

import { useState, useEffect } from 'react'
import Link                    from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import PageShell               from '@/components/PageShell'
import StatusBadge             from '@/components/StatusBadge'
import EmptyState              from '@/components/EmptyState'
import { useToast }            from '@/components/Toast'
import { ActivityFeed }        from '@/components/Analytics'

interface Profile  { id:string; full_name:string; city:string; package_type:string; avatar_url?:string }
interface Worker   { id:string; profession:string; bio?:string; is_available:boolean; rating_avg:number; total_reviews:number; skills?:string[] }
interface Application { id:string; title:string; description:string; city:string; area_sqm?:number; budget_min?:number; budget_max?:number; offer_count:number; expires_at:string; created_at:string; categories?:{name:string;icon:string} }
interface Stats    { totalOffers:number; acceptedOffers:number; pendingOffers:number; totalEarned:number; successRate:number }

interface Props {
  profile:      Profile
  worker:       Worker | null
  stats:        Stats
  recentOffers: any[]
  applications: Application[]
}

function Countdown({ expiresAt }: { expiresAt:string }) {
  const calc = () => {
    const d = new Date(expiresAt).getTime() - Date.now()
    if (d <= 0) return { label:'Skaduar', col:'#64748b', expired:true }
    const h=Math.floor(d/3600000), m=Math.floor((d%3600000)/60000), s=Math.floor((d%60000)/1000)
    return { label:`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`, col:d<3*3600000?'#ef4444':'#22d3a5', expired:false }
  }
  const [t,setT] = useState(calc)
  useEffect(() => { const i=setInterval(()=>setT(calc()),1000); return()=>clearInterval(i) }, [expiresAt])
  return <span style={{ fontFamily:'monospace', fontSize:11, fontWeight:700, color:t.col, background:`${t.col}12`, border:`1px solid ${t.col}25`, borderRadius:7, padding:'2px 8px' }}>⏱ {t.label}</span>
}

export default function WorkerDashboard({ profile, worker, stats, recentOffers, applications }: Props) {
  const supabase  = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const toast     = useToast()
  const [avail,   setAvail]   = useState(worker?.is_available ?? true)
  const [saving,  setSaving]  = useState(false)
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState<'all'|'budget'|'nearby'>('all')

  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Mirëmëngjes' : hour < 17 ? 'Mirëdita' : 'Mirëmbrëma'

  async function toggleAvailability() {
    setSaving(true)
    const newVal = !avail
    setAvail(newVal)
    try {
      if (worker?.id) {
        await supabase.from('workers').update({ is_available:newVal }).eq('id', worker.id)
        toast.success(newVal ? '✅ Je disponueshëm!' : '🔴 Je jo-disponueshëm', newVal ? 'Klientët mund t\'të gjejnë.' : 'Nuk do të marrësh oferta.')
      }
    } finally { setSaving(false) }
  }

  const activity = recentOffers.slice(0,5).map((o:any) => ({
    id:o.id,
    icon:o.status==='accepted'?'✅':o.status==='pending'?'⏳':'❌',
    title:o.status==='accepted'?'Ofertë e pranuar!':o.status==='pending'?'Ofertë dërguar':'Ofertë refuzuar',
    description:`${o.applications?.title||'Projekt'} — €${(o.price||0).toLocaleString()}`,
    time:new Date(o.created_at).toLocaleDateString('sq-AL'), color:o.status==='accepted'?'#22d3a5':o.status==='pending'?'#fbbf24':'#f87171',
  }))

  const filteredApps = applications
    .filter(a => !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.city.toLowerCase().includes(search.toLowerCase()))
    .filter(a => {
      if (filter === 'budget') return (a.budget_max||0) > 0
      if (filter === 'nearby') return a.city === profile.city
      return true
    })

  return (
    <PageShell role="worker" userName={profile.full_name} userId={profile.id} package={profile.package_type} pageTitle="Dashboard" pageIcon="🔧">
      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow    { 0%,100%{box-shadow:0 0 0 0 rgba(34,211,165,0.4)} 50%{box-shadow:0 0 0 6px rgba(34,211,165,0)} }
        .app-card:hover    { border-color:rgba(240,236,228,0.14)!important; transform:translateY(-1px); box-shadow:0 4px 20px rgba(0,0,0,0.15); }
        .app-card          { transition:all 0.2s; }
        .quick-link:hover  { border-color:rgba(240,236,228,0.14)!important; transform:translateY(-2px); }
        .quick-link        { transition:all 0.2s; }
        .offer-btn:hover   { transform:translateY(-1px); box-shadow:0 4px 14px rgba(59,130,246,0.35)!important; }
      `}</style>

      {/* Header with greeting + availability */}
      <div style={{ marginBottom:28, animation:'fadeUp 0.5s ease' }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
          <div>
            <p style={{ fontSize:11, fontWeight:700, color:'rgba(240,236,228,0.3)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:8 }}>
              {greeting}, <span style={{ color:'#10b981' }}>{profile.full_name.split(' ')[0]}</span>
            </p>
            <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(1.6rem,3vw,2.2rem)', fontWeight:900, letterSpacing:'-0.03em', lineHeight:1.1, marginBottom:8 }}>
              Pasqyra juaj <span style={{ color:'#10b981', fontStyle:'italic' }}>profesionale</span>
            </h1>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
              {worker?.profession && <span style={{ fontSize:12, color:'rgba(240,236,228,0.5)' }}>🔧 {worker.profession}</span>}
              {worker?.rating_avg && worker.rating_avg > 0 && <span style={{ fontSize:12, color:'rgba(240,236,228,0.5)' }}>⭐ {worker.rating_avg.toFixed(1)} ({worker.total_reviews} reviews)</span>}
              <span style={{ fontSize:12, color:'rgba(240,236,228,0.5)' }}>📍 {profile.city}</span>
            </div>
          </div>

          {/* Availability toggle */}
          <div style={{ padding:'14px 18px', background:'rgba(240,236,228,0.02)', border:`1px solid ${avail?'rgba(34,211,165,0.2)':'rgba(240,236,228,0.08)'}`, borderRadius:14, display:'flex', alignItems:'center', gap:14 }}>
            <div>
              <div style={{ fontSize:12, fontWeight:700, marginBottom:2 }}>Disponueshmëria</div>
              <div style={{ fontSize:11, color:avail?'#22d3a5':'rgba(240,236,228,0.35)' }}>
                {avail ? '🟢 Po marr punë' : '🔴 Jo disponueshëm'}
              </div>
            </div>
            <button onClick={toggleAvailability} disabled={saving}
              style={{ width:48, height:26, borderRadius:13, border:'none', background:avail?'#22d3a5':'rgba(240,236,228,0.1)', cursor:'pointer', position:'relative', transition:'all 0.3s', flexShrink:0, boxShadow:avail?'0 0 12px rgba(34,211,165,0.4)':'none' }}>
              <div style={{ width:20, height:20, borderRadius:'50%', background:'#fff', position:'absolute', top:3, left:avail?24:3, transition:'left 0.3s', boxShadow:'0 1px 4px rgba(0,0,0,0.3)' }}/>
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(155px,1fr))', gap:12, marginBottom:28 }}>
        {[
          { icon:'💼', label:'Ofertat dërguar', val:stats.totalOffers,    col:'#10b981' },
          { icon:'✅', label:'Të pranuara',      val:stats.acceptedOffers, col:'#22d3a5' },
          { icon:'⏳', label:'Në pritje',        val:stats.pendingOffers,  col:'#fbbf24' },
          { icon:'🎯', label:'Sukses',           val:`${stats.successRate}%`,col:'#60a5fa' },
          { icon:'💰', label:'Fituar',           val:`€${stats.totalEarned.toLocaleString()}`,col:'#22d3a5' },
          { icon:'⭐', label:'Rating',           val:worker?.rating_avg&&worker.rating_avg>0?`${worker.rating_avg.toFixed(1)}★`:'—',col:'#fbbf24' },
        ].map((kpi,i) => (
          <div key={i} style={{ padding:'16px 18px', background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:16, animation:`fadeUp 0.4s ease ${i*0.06}s both` }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
              <span style={{ fontSize:16 }}>{kpi.icon}</span>
              <span style={{ fontSize:11, color:'rgba(240,236,228,0.4)', fontWeight:600 }}>{kpi.label}</span>
            </div>
            <div style={{ fontFamily:"'Fraunces',serif", fontSize:'1.65rem', fontWeight:900, color:kpi.col, lineHeight:1 }}>{kpi.val}</div>
          </div>
        ))}
      </div>

      {/* Skills */}
      {worker?.skills && worker.skills.length > 0 && (
        <div style={{ marginBottom:20, padding:'14px 18px', background:'rgba(16,185,129,0.03)', border:'1px solid rgba(16,185,129,0.12)', borderRadius:14, display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
          <span style={{ fontSize:12, fontWeight:700, color:'rgba(240,236,228,0.5)', whiteSpace:'nowrap' }}>🛠 Aftësitë tuaja:</span>
          {worker.skills.map(s => (
            <span key={s} style={{ fontSize:11, color:'#10b981', background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.18)', borderRadius:7, padding:'3px 10px', fontWeight:600 }}>{s}</span>
          ))}
          <Link href="/worker/profile" style={{ marginLeft:'auto', fontSize:11, color:'rgba(240,236,228,0.4)', textDecoration:'none', fontWeight:600 }}>Edito →</Link>
        </div>
      )}

      {/* Main grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 310px', gap:16, marginBottom:24, alignItems:'start' }}>

        {/* Left: Active applications */}
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, flexWrap:'wrap', gap:10 }}>
            <div>
              <h2 style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:'1.1rem', marginBottom:3 }}>🔥 Projekte disponueshme</h2>
              <p style={{ fontSize:12, color:'rgba(240,236,228,0.4)' }}>{applications.length} aktive</p>
            </div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:8, top:'50%', transform:'translateY(-50%)', fontSize:11, opacity:.3 }}>🔍</span>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Kërko..."
                  style={{ padding:'7px 10px 7px 24px', background:'rgba(240,236,228,0.04)', border:'1px solid rgba(240,236,228,0.08)', borderRadius:9, fontSize:12, color:'#f0ece4', fontFamily:'inherit', outline:'none', width:140 }}/>
              </div>
              <div style={{ display:'flex', gap:3, background:'rgba(240,236,228,0.04)', padding:3, borderRadius:9, border:'1px solid rgba(240,236,228,0.07)' }}>
                {(['all','budget','nearby'] as const).map(f => (
                  <button key={f} onClick={()=>setFilter(f)}
                    style={{ padding:'5px 10px', borderRadius:7, border:'none', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit', background:filter===f?'#10b981':'transparent', color:filter===f?'#fff':'rgba(240,236,228,0.4)', transition:'all 0.15s', whiteSpace:'nowrap' }}>
                    {f==='all'?'Të gjitha':f==='budget'?'💰 Budget':'📍 Afër'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {filteredApps.length === 0 ? (
              <EmptyState icon="📋" title="Nuk ka projekte" message={search?'Provo kërkim tjetër.':'Nuk ka aplikime aktive.'} size="sm"/>
            ) : filteredApps.map((app,i) => (
              <div key={app.id} className="app-card"
                style={{ padding:'16px 18px', background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:14, animation:`fadeUp 0.3s ease ${i*0.04}s both` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, marginBottom:10 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    {app.categories && <span style={{ fontSize:10, color:'rgba(240,236,228,0.3)', display:'block', marginBottom:3 }}>{app.categories.icon} {app.categories.name}</span>}
                    <div style={{ fontSize:13, fontWeight:700, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{app.title}</div>
                    {app.description && <p style={{ fontSize:11, color:'rgba(240,236,228,0.35)', marginTop:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{app.description}</p>}
                  </div>
                  {(app.budget_max||0)>0 && (
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div style={{ fontFamily:"'Fraunces',serif", fontWeight:900, color:'#10b981', fontSize:'1.05rem' }}>€{(app.budget_max||0).toLocaleString()}</div>
                      {app.budget_min && <div style={{ fontSize:10, color:'rgba(240,236,228,0.3)' }}>nga €{app.budget_min.toLocaleString()}</div>}
                    </div>
                  )}
                </div>
                <div style={{ display:'flex', gap:10, alignItems:'center', justifyContent:'space-between', flexWrap:'wrap' }}>
                  <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                    <span style={{ fontSize:11, color:'rgba(240,236,228,0.35)' }}>📍 {app.city}</span>
                    {app.area_sqm && <span style={{ fontSize:11, color:'rgba(240,236,228,0.3)' }}>📐 {app.area_sqm}m²</span>}
                    <span style={{ fontSize:11, color:'rgba(240,236,228,0.3)' }}>💼 {app.offer_count} oferta</span>
                    <Countdown expiresAt={app.expires_at}/>
                  </div>
                  <Link href={`/worker/offers?apply=${app.id}`} className="offer-btn"
                    style={{ fontSize:11, fontWeight:800, color:'#fff', background:'linear-gradient(135deg,#10b981,#22d3a5)', padding:'6px 16px', borderRadius:9, textDecoration:'none', boxShadow:'0 2px 10px rgba(16,185,129,0.3)', transition:'all 0.2s', whiteSpace:'nowrap' }}>
                    Dërgo ofertë →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* Profile completion */}
          {(!worker?.bio || !worker?.skills?.length) && (
            <div style={{ padding:'16px', background:'rgba(251,191,36,0.05)', border:'1px solid rgba(251,191,36,0.15)', borderRadius:14 }}>
              <div style={{ fontSize:13, fontWeight:700, marginBottom:8, display:'flex', alignItems:'center', gap:8 }}>
                ⚠️ Plotëso profilin
              </div>
              <p style={{ fontSize:12, color:'rgba(240,236,228,0.5)', lineHeight:1.6, marginBottom:10 }}>Profili i plotë të jep 3x më shumë oferta.</p>
              <Link href="/worker/profile"
                style={{ fontSize:12, fontWeight:700, color:'#fbbf24', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:5 }}>
                Plotëso profilin →
              </Link>
            </div>
          )}

          <ActivityFeed items={activity} title="⚡ Aktiviteti im" />

          {/* Recent offers summary */}
          {recentOffers.length > 0 && (
            <div style={{ background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:16, overflow:'hidden' }}>
              <div style={{ padding:'13px 16px', borderBottom:'1px solid rgba(240,236,228,0.06)', fontSize:13, fontWeight:700, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span>💼 Ofertat e fundit</span>
                <Link href="/worker/offers" style={{ fontSize:11, color:'#10b981', textDecoration:'none', fontWeight:700 }}>Shiko →</Link>
              </div>
              {recentOffers.slice(0,4).map((o:any,i:number) => (
                <div key={o.id} style={{ padding:'11px 16px', borderBottom:i<3?'1px solid rgba(240,236,228,0.04)':'none', display:'flex', justifyContent:'space-between', alignItems:'center', gap:10 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{o.applications?.title||'—'}</div>
                    <div style={{ fontSize:11, color:'rgba(240,236,228,0.35)' }}>📍 {o.applications?.city||'—'}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontFamily:"'Fraunces',serif", fontWeight:900, color:'#10b981', fontSize:'0.95rem' }}>€{(o.price||0).toLocaleString()}</div>
                    <StatusBadge status={o.status} size="xs"/>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div>
        <p style={{ fontSize:11, fontWeight:700, color:'rgba(240,236,228,0.3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:14 }}>Aksesi i shpejtë</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(155px,1fr))', gap:10 }}>
          {[
            { href:'/worker/applications', icon:'📋', label:'Aplikimet',   desc:'Gjej punë' },
            { href:'/worker/offers',       icon:'💼', label:'Ofertat',     desc:'Menaxho bids' },
            { href:'/worker/messages',     icon:'💬', label:'Mesazhet',    desc:'Komuniko' },
            { href:'/worker/reviews',      icon:'⭐', label:'Vlerësimet',  desc:'Reputacioni yt' },
            { href:'/worker/profile',      icon:'👤', label:'Profili',     desc:'Edito profilin' },
            { href:'/pricing',             icon:'💎', label:'Premium',     desc:'Shiko më shumë punë' },
          ].map(item => (
            <Link key={item.href} href={item.href} className="quick-link"
              style={{ padding:'16px', background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:14, textDecoration:'none', display:'block' }}>
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