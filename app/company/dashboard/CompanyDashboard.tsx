'use client'

import { useState, useEffect } from 'react'
import Link                    from 'next/link'
import PageShell               from '@/components/PageShell'
import StatusBadge             from '@/components/StatusBadge'
import EmptyState              from '@/components/EmptyState'
import { useToast }            from '@/components/Toast'
import OfferModal              from '@/components/OfferModal'
import { KpiCard, ActivityFeed } from '@/components/Analytics'

interface Profile { id:string; full_name:string; city:string; package_type:string; avatar_url?:string }
interface Company { id:string; business_name:string; is_verified:boolean; rating_avg:number }
interface Application { id:string; title:string; city:string; status:string; offer_count:number; budget_min?:number; budget_max?:number; expires_at:string; created_at:string; categories?:{name:string;icon:string} }
interface Stats { totalOffers:number; acceptedOffers:number; pendingOffers:number; totalApplications:number; activeApplications:number; totalEarned:number; rating:number; totalReviews:number; successRate:number }
interface Review { id:string; rating:number; comment?:string; created_at:string; profiles?:{full_name:string;avatar_url?:string}|any }

interface Props {
  profile:            Profile
  company:            Company
  stats:              Stats
  recentOffers:       any[]
  recentApplications: Application[]
  reviews:            Review[]
}

function Countdown({ expiresAt }: { expiresAt:string }) {
  const calc = () => {
    const d = new Date(expiresAt).getTime() - Date.now()
    if (d <= 0) return { label:'Skaduar', col:'#64748b', expired:true }
    const h = Math.floor(d/3600000), m = Math.floor((d%3600000)/60000), s = Math.floor((d%60000)/1000)
    const urgent = d < 3*3600000
    return { label:`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`, col:urgent?'#ef4444':'#22d3a5', expired:false }
  }
  const [t, setT] = useState(calc)
  useEffect(() => { const i=setInterval(()=>setT(calc()),1000); return()=>clearInterval(i) }, [expiresAt])
  return <span style={{ fontFamily:'monospace', fontSize:11, fontWeight:700, color:t.col, background:`${t.col}12`, border:`1px solid ${t.col}25`, borderRadius:7, padding:'2px 8px' }}>⏱ {t.label}</span>
}

function Stars({ r }: { r:number }) {
  return (
    <span>
      {[1,2,3,4,5].map(s => <span key={s} style={{ color:s<=Math.round(r)?'#fbbf24':'rgba(255,255,255,0.1)', fontSize:12 }}>★</span>)}
      <span style={{ fontSize:11, color:'rgba(240,236,228,0.4)', marginLeft:4 }}>{r>0?r.toFixed(1):'-'}</span>
    </span>
  )
}

export default function CompanyDashboard({ profile, company, stats, recentOffers, recentApplications, reviews }: Props) {
  const toast       = useToast()
  const [offerApp,  setOfferApp]  = useState<Application|null>(null)
  const [search,    setSearch]    = useState('')
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Mirëmëngjes' : hour < 17 ? 'Mirëdita' : 'Mirëmbrëma'

  const filteredApps = recentApplications.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.city.toLowerCase().includes(search.toLowerCase())
  )

  const activity = [
    ...recentOffers.slice(0,3).map((o:any) => ({
      id:o.id, icon:o.status==='accepted'?'✅':'💼',
      title:o.status==='accepted'?'Ofertë e pranuar':'Ofertë e dërguar',
      description:`${o.applications?.title||'Projekt'} — €${(o.price||0).toLocaleString()}`,
      time:new Date(o.created_at).toLocaleDateString('sq-AL'), color:o.status==='accepted'?'#22d3a5':'#e8621a',
    })),
    ...reviews.slice(0,2).map(r => ({
      id:r.id, icon:'⭐', title:`Vlerësim ${r.rating}★`,
      description:(r.profiles as any)?.full_name||'Klient', time:new Date(r.created_at).toLocaleDateString('sq-AL'), color:'#fbbf24',
    })),
  ].sort((a,b) => 0)

  return (
    <PageShell role="company" userName={profile.full_name} userId={profile.id} package={profile.package_type} pageTitle="Dashboard" pageIcon="🏢">
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.5} }
        .app-card:hover   { border-color:rgba(240,236,228,0.14)!important; transform:translateY(-1px); }
        .app-card         { transition:all 0.2s; }
        .quick-link:hover { border-color:rgba(240,236,228,0.14)!important; transform:translateY(-2px); box-shadow:0 4px 20px rgba(0,0,0,0.2); }
        .quick-link       { transition:all 0.2s; }
        .offer-btn:hover  { opacity:.9!important; transform:translateY(-1px); }
      `}</style>

      {/* Greeting */}
      <div style={{ marginBottom:28, animation:'fadeUp 0.5s ease' }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
          <div>
            <p style={{ fontSize:11, fontWeight:700, color:'rgba(240,236,228,0.3)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:8 }}>
              {greeting},{' '}
              <span style={{ color:'#e8621a' }}>{company.business_name || profile.full_name}</span>
            </p>
            <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(1.6rem,3vw,2.2rem)', fontWeight:900, letterSpacing:'-0.03em', lineHeight:1.1, marginBottom:8 }}>
              Pasqyra e <span style={{ color:'#e8621a', fontStyle:'italic' }}>biznesit</span>
            </h1>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
              {company.is_verified ? (
                <span style={{ fontSize:11, fontWeight:700, color:'#22d3a5', background:'rgba(34,211,165,0.08)', border:'1px solid rgba(34,211,165,0.2)', borderRadius:20, padding:'3px 12px' }}>✓ Kompani e verifikuar</span>
              ) : (
                <span style={{ fontSize:11, fontWeight:700, color:'#fbbf24', background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.2)', borderRadius:20, padding:'3px 12px' }}>⏳ Verifikimi në pritje</span>
              )}
              {stats.rating > 0 && <span style={{ fontSize:11, color:'rgba(240,236,228,0.4)' }}>⭐ {stats.rating.toFixed(1)} ({stats.totalReviews} reviews)</span>}
            </div>
          </div>
          <Link href="/company/applications"
            style={{ padding:'12px 22px', borderRadius:13, background:'linear-gradient(135deg,#e8621a,#ff7c35)', color:'#fff', fontFamily:"'Fraunces',serif", fontWeight:700, fontSize:'0.9rem', textDecoration:'none', boxShadow:'0 4px 20px rgba(232,98,26,0.3)', transition:'all 0.2s', whiteSpace:'nowrap', display:'inline-flex', alignItems:'center', gap:8 }}>
            🔍 Gjej projekte →
          </Link>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(155px,1fr))', gap:12, marginBottom:28 }}>
        {[
          { icon:'💼', label:'Ofertat dërguar', val:stats.totalOffers,    col:'#e8621a' },
          { icon:'✅', label:'Të pranuara',      val:stats.acceptedOffers, col:'#22d3a5' },
          { icon:'⏳', label:'Në pritje',        val:stats.pendingOffers,  col:'#fbbf24' },
          { icon:'🎯', label:'Sukses',           val:`${stats.successRate}%`,col:'#60a5fa' },
          { icon:'💰', label:'Të ardhura',       val:`€${stats.totalEarned.toLocaleString()}`,col:'#22d3a5' },
          { icon:'🔥', label:'Projekte aktive',  val:stats.activeApplications,col:'#f87171' },
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

      {/* Main grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:16, marginBottom:24, alignItems:'start' }}>

        {/* Left: Active Applications */}
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <div>
              <h2 style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:'1.1rem', marginBottom:3 }}>🔥 Projekte aktive</h2>
              <p style={{ fontSize:12, color:'rgba(240,236,228,0.4)' }}>{stats.activeApplications} disponueshme</p>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:8, top:'50%', transform:'translateY(-50%)', fontSize:12, opacity:.3 }}>🔍</span>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Kërko..."
                  style={{ padding:'7px 10px 7px 26px', background:'rgba(240,236,228,0.04)', border:'1px solid rgba(240,236,228,0.08)', borderRadius:9, fontSize:12, color:'#f0ece4', fontFamily:'inherit', outline:'none', width:150 }}/>
              </div>
            </div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {filteredApps.length === 0 ? (
              <EmptyState icon="📋" title="Nuk ka projekte" message="Nuk ka aplikime aktive për momentin." size="sm"/>
            ) : filteredApps.map((app,i) => (
              <div key={app.id} className="app-card"
                style={{ padding:'16px 18px', background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:14, animation:`fadeUp 0.3s ease ${i*0.05}s both` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, marginBottom:10 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    {app.categories && <span style={{ fontSize:10, color:'rgba(240,236,228,0.35)', display:'block', marginBottom:3 }}>{app.categories.icon} {app.categories.name}</span>}
                    <div style={{ fontSize:13, fontWeight:700, color:'#f0ece4', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{app.title}</div>
                  </div>
                  {(app.budget_max||0)>0 && <div style={{ fontFamily:"'Fraunces',serif", fontSize:'1.05rem', fontWeight:900, color:'#e8621a', flexShrink:0 }}>€{(app.budget_max||0).toLocaleString()}</div>}
                </div>
                <div style={{ display:'flex', gap:10, alignItems:'center', justifyContent:'space-between', flexWrap:'wrap' }}>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <span style={{ fontSize:11, color:'rgba(240,236,228,0.35)' }}>📍 {app.city}</span>
                    <span style={{ fontSize:11, color:'rgba(240,236,228,0.3)' }}>💼 {app.offer_count} oferta</span>
                    <Countdown expiresAt={app.expires_at}/>
                  </div>
                  <button className="offer-btn" onClick={() => setOfferApp(app)}
                    style={{ fontSize:11, fontWeight:800, color:'#fff', background:'linear-gradient(135deg,#e8621a,#ff7c35)', padding:'6px 16px', borderRadius:9, border:'none', cursor:'pointer', fontFamily:'inherit', boxShadow:'0 2px 10px rgba(232,98,26,0.3)', transition:'all 0.2s' }}>
                    Dërgo ofertë →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* Activity */}
          <ActivityFeed items={activity} title="⚡ Aktiviteti i fundit"/>

          {/* Recent reviews */}
          {reviews.length > 0 && (
            <div style={{ background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:16, overflow:'hidden' }}>
              <div style={{ padding:'13px 16px', borderBottom:'1px solid rgba(240,236,228,0.06)', fontSize:13, fontWeight:700, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span>⭐ Vlerësimet e fundit</span>
                <Link href="/company/reviews" style={{ fontSize:11, color:'#e8621a', textDecoration:'none', fontWeight:700 }}>Shiko →</Link>
              </div>
              {reviews.slice(0,3).map((r,i) => (
                <div key={r.id} style={{ padding:'12px 16px', borderBottom:i<2?'1px solid rgba(240,236,228,0.04)':'none' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <span style={{ fontSize:12, fontWeight:600 }}>{(r.profiles as any)?.full_name||'Klient'}</span>
                    <Stars r={r.rating}/>
                  </div>
                  {r.comment && <p style={{ fontSize:12, color:'rgba(240,236,228,0.4)', lineHeight:1.5, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.comment}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Recent offers */}
          {recentOffers.length > 0 && (
            <div style={{ background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:16, overflow:'hidden' }}>
              <div style={{ padding:'13px 16px', borderBottom:'1px solid rgba(240,236,228,0.06)', fontSize:13, fontWeight:700, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span>💼 Ofertat e fundit</span>
                <Link href="/company/offers" style={{ fontSize:11, color:'#e8621a', textDecoration:'none', fontWeight:700 }}>Shiko →</Link>
              </div>
              {recentOffers.slice(0,4).map((o:any,i:number) => (
                <div key={o.id} style={{ padding:'11px 16px', borderBottom:i<3?'1px solid rgba(240,236,228,0.04)':'none', display:'flex', justifyContent:'space-between', alignItems:'center', gap:10 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{o.applications?.title||'—'}</div>
                    <div style={{ fontSize:11, color:'rgba(240,236,228,0.35)' }}>{o.duration_days}d punë</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontFamily:"'Fraunces',serif", fontWeight:900, color:'#e8621a', fontSize:'0.95rem' }}>€{(o.price||0).toLocaleString()}</div>
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
            { href:'/company/applications', icon:'📋', label:'Aplikimet',   desc:'Gjej projekte' },
            { href:'/company/offers',       icon:'💼', label:'Ofertat',     desc:'Menaxho bids' },
            { href:'/company/messages',     icon:'💬', label:'Mesazhet',    desc:'Komuniko' },
            { href:'/company/stats',        icon:'📊', label:'Statistikat', desc:'Analytics' },
            { href:'/company/reviews',      icon:'⭐', label:'Vlerësimet',  desc:'Reputacioni' },
            { href:'/company/profile',      icon:'🏢', label:'Profili',     desc:'Edito' },
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

      {/* Offer Modal */}
      {offerApp && (
        <OfferModal
          application={offerApp as any}
          companyId={''} 
          onClose={() => setOfferApp(null)}
          onSuccess={() => { setOfferApp(null); toast.success('Oferta u dërgua! 🎉', 'Klienti do të njoftohet.') }}
        />
      )}
    </PageShell>
  )
}