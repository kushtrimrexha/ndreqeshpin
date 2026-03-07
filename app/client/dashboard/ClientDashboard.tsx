'use client'

import { useState, useEffect }  from 'react'
import { createBrowserClient }  from '@supabase/ssr'
import PageShell                from '@/components/PageShell'
import AcceptOfferModal         from '@/components/AcceptOfferModal'
import StatusBadge              from '@/components/StatusBadge'
import Avatar                   from '@/components/Avatar'
import EmptyState               from '@/components/EmptyState'
import { useToast }             from '@/components/Toast'
import { KpiSkeleton, OfferCardSkeleton } from '@/components/Skeleton'
import { KpiCard, TrendAreaChart, ActivityFeed } from '@/components/Analytics'
import Link                     from 'next/link'

interface Profile     { id:string; full_name:string; city:string; package_type:string; avatar_url?:string }
interface Application { id:string; title:string; city:string; status:string; offer_count:number; expires_at:string; created_at:string; categories?:{name:string;icon:string} }
interface Offer       { id:string; price:number; duration_days:number; description:string; status:string; created_at:string; companies:{business_name:string;rating_avg:number;is_verified:boolean} }

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function Countdown({ expiresAt }:{expiresAt:string}) {
  const calc=()=>{const diff=new Date(expiresAt).getTime()-Date.now();if(diff<=0)return{label:'Skaduar',col:'#64748b',expired:true};const h=Math.floor(diff/3600000),m=Math.floor((diff%3600000)/60000),s=Math.floor((diff%60000)/1000);return{label:`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`,col:diff<3*3600000?'#ef4444':'#22d3a5',expired:false}}
  const [t,setT]=useState(calc)
  useEffect(()=>{const i=setInterval(()=>setT(calc()),1000);return()=>clearInterval(i)},[expiresAt])
  return <span style={{fontFamily:"'Fira Code',monospace",fontSize:11,fontWeight:700,color:t.col,background:`${t.col}15`,border:`1px solid ${t.col}35`,borderRadius:8,padding:'3px 9px',whiteSpace:'nowrap'}}>⏱ {t.label}</span>
}

export default function ClientDashboard({profile}:{profile:Profile}) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const toast = useToast()

  const [tab,          setTab]          = useState<'active'|'accepted'|'expired'>('active')
  const [apps,         setApps]         = useState<Application[]>([])
  const [allApps,      setAllApps]      = useState<Application[]>([])
  const [sel,          setSel]          = useState<Application|null>(null)
  const [offers,       setOffers]       = useState<Offer[]>([])
  const [loadApps,     setLoadApps]     = useState(true)
  const [loadOffers,   setLoadOffers]   = useState(false)
  const [kpiLoading,   setKpiLoading]   = useState(true)
  const [acceptModal,  setAcceptModal]  = useState<Offer|null>(null)
  const [stats,        setStats]        = useState({active:0,totalOffers:0,accepted:0,pendingOffers:0})
  const [trend,        setTrend]        = useState<{label:string;value:number}[]>([])
  const [activity,     setActivity]     = useState<any[]>([])

  // Load KPIs + trend once
  useEffect(()=>{
    async function loadKpis(){
      setKpiLoading(true)
      const now = new Date()
      const {data:appsData} = await supabase.from('applications').select('id,status,offer_count,created_at').eq('client_id',profile.id)
      const all = appsData||[]
      setAllApps(all as any)

      const {data:offersData} = await supabase.from('offers').select('id,status,price,created_at,applications(title)').eq('client_id',profile.id).order('created_at',{ascending:false})
      const offs = offersData||[]

      setStats({
        active: all.filter((a:any)=>a.status==='active').length,
        totalOffers: all.reduce((s:number,a:any)=>s+(a.offer_count||0),0),
        accepted: all.filter((a:any)=>a.status==='accepted').length,
        pendingOffers: offs.filter((o:any)=>o.status==='pending').length,
      })

      // 6-month trend: applications posted
      const t6 = Array.from({length:6},(_,i)=>{
        const d = new Date(now.getFullYear(), now.getMonth()-5+i, 1)
        const count = all.filter((a:any)=>{const ad=new Date(a.created_at);return ad.getMonth()===d.getMonth()&&ad.getFullYear()===d.getFullYear()}).length
        return {label:MONTHS[d.getMonth()], value:count}
      })
      setTrend(t6)

      // Activity from recent offers received
      setActivity(offs.slice(0,5).map((o:any)=>({
        id:o.id,
        icon: o.status==='accepted'?'✅':o.status==='pending'?'💼':'❌',
        title: o.status==='accepted'?'Ofertë e pranuar!':'Ofertë e re',
        description: `${(o.applications as any)?.title||'Aplikim'} — €${o.price?.toLocaleString()||0}`,
        time: new Date(o.created_at).toLocaleDateString('sq-AL'),
        color: o.status==='accepted'?'#22d3a5':o.status==='pending'?'#e8621a':'#6b7280',
      })))

      setKpiLoading(false)
    }
    loadKpis()
  },[profile.id])

  // Load apps by tab
  useEffect(()=>{
    setLoadApps(true); setSel(null); setOffers([])
    supabase.from('applications').select('*,categories(name,icon)').eq('client_id',profile.id).eq('status',tab).order('created_at',{ascending:false}).limit(20)
      .then(({data})=>{setApps(data||[]);setLoadApps(false)})
  },[tab,profile.id])

  // Load offers for selected app
  useEffect(()=>{
    if(!sel)return; setLoadOffers(true)
    supabase.from('offers').select('*,companies(business_name,rating_avg,is_verified)').eq('application_id',sel.id).order('price',{ascending:true})
      .then(({data})=>{setOffers(data||[]);setLoadOffers(false)})
  },[sel])

  function handleAcceptSuccess(offerId:string){
    setAcceptModal(null)
    toast.success('🎉 Oferta u pranua!','Kompania do të njoftohet. Fillo bisedën nga Mesazhet.')
    setOffers(prev=>prev.map(o=>o.id===offerId?{...o,status:'accepted'}:{...o,status:'declined'}))
    setApps(prev=>prev.filter(a=>a.id!==sel?.id))
    setSel(null)
    setStats(prev=>({...prev,active:Math.max(0,prev.active-1),accepted:prev.accepted+1}))
  }

  const isPremium = profile.package_type!=='free'

  return (
    <PageShell role="client" userName={profile.full_name} userId={profile.id}
      avatar={profile.avatar_url} package={profile.package_type}
      pageTitle="Dashboard" pageIcon="⊞"
      actions={
        <Link href="/client/applications/new"
          style={{display:'inline-flex',alignItems:'center',gap:7,background:'linear-gradient(135deg,#e8621a,#ff7c35)',color:'#fff',fontWeight:700,fontSize:13,padding:'9px 20px',borderRadius:11,textDecoration:'none',boxShadow:'0 4px 16px rgba(232,98,26,0.3)',transition:'all 0.2s'}}
          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform='translateY(-1px)';(e.currentTarget as HTMLElement).style.boxShadow='0 8px 24px rgba(232,98,26,0.4)'}}
          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform='';(e.currentTarget as HTMLElement).style.boxShadow='0 4px 16px rgba(232,98,26,0.3)'}}>
          ✚ Aplikim i Ri
        </Link>
      }>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@700&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.85)}}
        .app-row:hover{background:rgba(240,236,228,0.04)!important;border-color:rgba(240,236,228,0.12)!important}
        .app-row-sel{background:rgba(232,98,26,0.08)!important;border-color:rgba(232,98,26,0.35)!important}
        .offer-card{transition:all 0.2s}
        .offer-card:hover{border-color:rgba(240,236,228,0.14)!important;transform:translateY(-2px)}
        .accept-btn:hover{opacity:.88!important;transform:translateY(-1px);box-shadow:0 8px 28px rgba(34,211,165,0.35)!important}
        .quick-link:hover{border-color:rgba(232,98,26,0.25)!important;background:rgba(232,98,26,0.04)!important;transform:translateY(-2px)}
        @media(max-width:900px){.dash-grid{grid-template-columns:1fr!important}.offers-panel{display:none!important}}
        @media(max-width:700px){.chart-row{grid-template-columns:1fr!important}}
      `}</style>

      {/* ── Greeting ─────────────────────────────── */}
      <div style={{marginBottom:28,animation:'fadeUp 0.5s ease'}}>
        <p style={{fontSize:11,fontWeight:700,color:'rgba(240,236,228,0.3)',textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:8}}>
          {new Date().getHours()<12?'Mirëmëngjes':'Mirë se erdhe'}
        </p>
        <h1 style={{fontFamily:"'Fraunces',serif",fontSize:'clamp(1.5rem,3vw,2.1rem)',fontWeight:900,letterSpacing:'-0.03em',lineHeight:1.1,marginBottom:10}}>
          {profile.full_name.split(' ')[0]},{' '}
          <span style={{color:'#e8621a',fontStyle:'italic'}}>çfarë renovon sot?</span>
        </h1>
        <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
          <span style={{fontSize:12,color:'rgba(240,236,228,0.4)'}}>📍 {profile.city}</span>
          <StatusBadge status={isPremium?'premium':'free'} size="xs"/>
          {stats.pendingOffers>0&&(
            <span style={{fontSize:11,fontWeight:700,color:'#fbbf24',background:'rgba(251,191,36,0.1)',border:'1px solid rgba(251,191,36,0.25)',borderRadius:20,padding:'3px 10px',display:'flex',alignItems:'center',gap:5}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:'#fbbf24',boxShadow:'0 0 6px rgba(251,191,36,0.8)',display:'inline-block',animation:'pulse 2s infinite'}}/>
              {stats.pendingOffers} oferta pa vendosur
            </span>
          )}
        </div>
      </div>

      {/* ── KPI Cards ────────────────────────────── */}
      {kpiLoading?(
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:28}}>
          {[1,2,3,4].map(i=><KpiSkeleton key={i}/>)}
        </div>
      ):(
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(175px,1fr))',gap:12,marginBottom:28}}>
          <KpiCard title="Aktive"          value={stats.active}        icon="📋" color="#e8621a" changeLabel="aplikime" />
          <KpiCard title="Oferta total"    value={stats.totalOffers}   icon="💼" color="#3b82f6" changeLabel="të pranuara" />
          <KpiCard title="Të pranuara"     value={stats.accepted}      icon="✅" color="#22d3a5" changeLabel="projekte" />
          <KpiCard title="Paketa"          value={isPremium?'💎 Premium':'Falas'} icon={isPremium?'💎':'🆓'} color={isPremium?'#fbbf24':'rgba(240,236,228,0.3)'} />
        </div>
      )}

      {/* ── Charts Row ───────────────────────────── */}
      <div className="chart-row" style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:14,marginBottom:24}}>
        <TrendAreaChart
          data={trend}
          title="📈 Aplikimet e postuara — 6 muajt e fundit"
          color="#e8621a"
          name="Aplikime"
          height={170}
        />
        <ActivityFeed items={activity} title="🕐 Aktiviteti i fundit" />
      </div>

      {/* ── Main Panel: Apps + Offers ────────────── */}
      <div className="dash-grid" style={{display:'grid',gridTemplateColumns:'290px 1fr',gap:16,alignItems:'start',marginBottom:32}}>

        {/* LEFT — Applications */}
        <div style={{background:'rgba(240,236,228,0.02)',border:'1px solid rgba(240,236,228,0.07)',borderRadius:18,overflow:'hidden',position:'sticky',top:70}}>
          <div style={{display:'flex',padding:'10px 10px 0',gap:2,borderBottom:'1px solid rgba(240,236,228,0.06)'}}>
            {(['active','accepted','expired'] as const).map(t=>(
              <button key={t} onClick={()=>setTab(t)}
                style={{flex:1,padding:'8px 4px',fontSize:11,fontWeight:700,background:'none',border:'none',cursor:'pointer',fontFamily:'inherit',color:tab===t?'#f0ece4':'rgba(240,236,228,0.35)',borderBottom:`2px solid ${tab===t?'#e8621a':'transparent'}`,transition:'all 0.15s',marginBottom:-1,borderRadius:'6px 6px 0 0'}}>
                {{'active':'Aktive','accepted':'Pranuar','expired':'Skaduar'}[t]}
              </button>
            ))}
          </div>
          <div style={{padding:8,display:'flex',flexDirection:'column',gap:5,maxHeight:'calc(100vh - 300px)',overflowY:'auto'}}>
            {loadApps ? [1,2,3].map(i=>(
              <div key={i} style={{padding:14,border:'1px solid rgba(240,236,228,0.06)',borderRadius:12,display:'flex',flexDirection:'column',gap:8}}>
                <div style={{height:13,borderRadius:5,background:'rgba(240,236,228,0.06)',width:'70%'}}/>
                <div style={{height:11,borderRadius:5,background:'rgba(240,236,228,0.04)',width:'50%'}}/>
              </div>
            )) : apps.length===0 ? (
              <div style={{padding:'40px 12px',textAlign:'center'}}>
                <div style={{fontSize:36,marginBottom:10}}>📭</div>
                <div style={{fontSize:12,fontWeight:700,color:'rgba(240,236,228,0.4)',marginBottom:8}}>Nuk ka aplikime</div>
                {tab==='active'&&<Link href="/client/applications/new" style={{fontSize:12,color:'#e8621a',textDecoration:'none',fontWeight:700}}>✚ Posto tani</Link>}
              </div>
            ) : apps.map(app=>(
              <button key={app.id} onClick={()=>setSel(app)}
                className={`app-row ${sel?.id===app.id?'app-row-sel':''}`}
                style={{width:'100%',textAlign:'left',padding:'12px',background:sel?.id===app.id?'rgba(232,98,26,0.08)':'rgba(240,236,228,0.02)',border:`1px solid ${sel?.id===app.id?'rgba(232,98,26,0.3)':'rgba(240,236,228,0.07)'}`,borderRadius:12,cursor:'pointer',fontFamily:'inherit',transition:'all 0.15s'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:6,marginBottom:7}}>
                  <span style={{fontSize:13,fontWeight:700,color:'#f0ece4',lineHeight:1.3,flex:1,overflow:'hidden',textOverflow:'ellipsis',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical' as any}}>{app.title}</span>
                  <StatusBadge status={app.status} size="xs"/>
                </div>
                <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
                  <span style={{fontSize:11,color:'rgba(240,236,228,0.38)'}}>📍{app.city}</span>
                  <span style={{fontSize:11,color:app.offer_count>0?'#e8621a':'rgba(240,236,228,0.35)',fontWeight:700}}>💼{app.offer_count}</span>
                </div>
                {app.status==='active'&&<div style={{marginTop:8}}><Countdown expiresAt={app.expires_at}/></div>}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT — Offers Panel */}
        <div className="offers-panel" style={{background:'rgba(240,236,228,0.02)',border:'1px solid rgba(240,236,228,0.07)',borderRadius:18,overflow:'hidden',minHeight:420}}>
          {!sel ? (
            <EmptyState icon="👈" title="Zgjedh një aplikim" message="Klikoni mbi një aplikim nga lista majtas për të parë ofertat." size="md"/>
          ) : (
            <div>
              {/* App header */}
              <div style={{padding:'20px 24px',borderBottom:'1px solid rgba(240,236,228,0.06)',background:'rgba(240,236,228,0.01)'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12}}>
                  <div style={{flex:1,minWidth:0}}>
                    {sel.categories&&<span style={{fontSize:11,color:'rgba(240,236,228,0.4)',display:'block',marginBottom:4}}>{sel.categories.icon} {sel.categories.name}</span>}
                    <h2 style={{fontFamily:"'Fraunces',serif",fontWeight:800,fontSize:'1.05rem',lineHeight:1.3,marginBottom:10,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{sel.title}</h2>
                    <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
                      <StatusBadge status={sel.status}/>
                      {sel.status==='active'&&<Countdown expiresAt={sel.expires_at}/>}
                    </div>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <div style={{fontFamily:"'Fraunces',serif",fontSize:'2.2rem',fontWeight:900,color:'#e8621a',lineHeight:1}}>{sel.offer_count}</div>
                    <div style={{fontSize:11,color:'rgba(240,236,228,0.35)',marginTop:2}}>oferta</div>
                    <Link href={`/client/applications/${sel.id}`} style={{fontSize:11,color:'#e8621a',textDecoration:'none',fontWeight:700,display:'block',marginTop:6}}>Shiko →</Link>
                  </div>
                </div>
              </div>

              {/* Offers */}
              <div style={{padding:'16px 20px',display:'flex',flexDirection:'column',gap:12}}>
                {loadOffers ? [1,2].map(i=><OfferCardSkeleton key={i}/>) :
                 offers.length===0 ? (
                  <EmptyState icon="⏳" title="Duke pritur oferta..." message="Kompanitë do të dërgojnë oferta brenda 24 orësh." size="sm"/>
                 ) : offers.map((offer,i)=>{
                  const isAccepted = offer.status==='accepted'
                  const isDeclined = offer.status==='declined'||offer.status==='rejected'
                  const canAccept  = sel.status==='active'&&offer.status==='pending'
                  const isBest     = i===0&&offer.status==='pending'&&offers.length>1

                  return (
                    <div key={offer.id} className="offer-card"
                      style={{padding:20,background:isAccepted?'rgba(34,211,165,0.05)':isBest?'rgba(232,98,26,0.04)':'rgba(240,236,228,0.02)',border:`1px solid ${isAccepted?'rgba(34,211,165,0.25)':isBest?'rgba(232,98,26,0.18)':'rgba(240,236,228,0.07)'}`,borderRadius:16,position:'relative',opacity:isDeclined?.45:1,animation:`fadeUp 0.3s ease ${i*0.06}s both`}}>

                      {isBest&&<div style={{position:'absolute',top:-1,right:16,background:'linear-gradient(135deg,#e8621a,#ff7c35)',color:'#fff',fontSize:9,fontWeight:800,padding:'3px 10px',borderRadius:'0 0 9px 9px',letterSpacing:'0.06em'}}>★ OFERTA MË E MIRË</div>}
                      {isAccepted&&<div style={{position:'absolute',top:-1,right:16,background:'linear-gradient(135deg,#22d3a5,#10b981)',color:'#fff',fontSize:9,fontWeight:800,padding:'3px 10px',borderRadius:'0 0 9px 9px',letterSpacing:'0.06em'}}>✓ PRANUAR</div>}

                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                        <div style={{display:'flex',gap:11,alignItems:'center'}}>
                          <Avatar name={offer.companies.business_name} size={40} borderRadius={12}/>
                          <div>
                            <div style={{fontWeight:700,fontSize:14,marginBottom:4,display:'flex',alignItems:'center',gap:7}}>
                              {offer.companies.business_name}
                              {offer.companies.is_verified&&<span style={{fontSize:9,background:'rgba(34,211,165,0.1)',color:'#22d3a5',border:'1px solid rgba(34,211,165,0.2)',borderRadius:5,padding:'2px 7px',fontWeight:800}}>✓ Verified</span>}
                            </div>
                            <div style={{display:'flex',gap:1,alignItems:'center'}}>
                              {[1,2,3,4,5].map(s=><span key={s} style={{fontSize:12,color:s<=Math.round(offer.companies.rating_avg||0)?'#fbbf24':'rgba(255,255,255,0.1)'}}>★</span>)}
                              <span style={{fontSize:11,color:'rgba(240,236,228,0.35)',marginLeft:5}}>{(offer.companies.rating_avg||0).toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                        <div style={{textAlign:'right',flexShrink:0}}>
                          <div style={{fontFamily:"'Fraunces',serif",fontSize:'1.8rem',fontWeight:900,color:'#e8621a',lineHeight:1}}>€{offer.price.toLocaleString()}</div>
                          <div style={{fontSize:11,color:'rgba(240,236,228,0.4)',marginTop:2}}>🕐 {offer.duration_days} ditë</div>
                        </div>
                      </div>

                      {offer.description&&<p style={{fontSize:13,color:'rgba(240,236,228,0.55)',lineHeight:1.75,marginBottom:canAccept?14:0,borderTop:'1px solid rgba(240,236,228,0.05)',paddingTop:10}}>{offer.description}</p>}

                      {canAccept&&(
                        <div style={{display:'flex',gap:8,marginTop:4}}>
                          <button className="accept-btn" onClick={()=>setAcceptModal(offer)}
                            style={{flex:1,padding:'11px',borderRadius:11,background:'linear-gradient(135deg,#22d3a5,#10b981)',border:'none',color:'#fff',fontFamily:"'Fraunces',serif",fontWeight:800,fontSize:'0.9rem',cursor:'pointer',transition:'all 0.2s',boxShadow:'0 4px 14px rgba(34,211,165,0.2)'}}>
                            ✓ Prano Ofertën
                          </button>
                          <Link href="/client/messages"
                            style={{padding:'11px 16px',borderRadius:11,background:'rgba(240,236,228,0.05)',border:'1px solid rgba(240,236,228,0.1)',color:'rgba(240,236,228,0.6)',fontSize:16,textDecoration:'none',display:'flex',alignItems:'center',justifyContent:'center'}}>
                            💬
                          </Link>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Quick Links ──────────────────────────── */}
      <div>
        <p style={{fontSize:11,fontWeight:700,color:'rgba(240,236,228,0.3)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:14}}>Aksesi i shpejtë</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:10}}>
          {[
            {href:'/client/applications/new',icon:'✚',label:'Aplikim i Ri',  desc:'Posto projekt'},
            {href:'/client/applications',     icon:'📋',label:'Aplikimet',    desc:'Shiko historikun'},
            {href:'/client/offers',           icon:'💼',label:'Ofertat',      desc:'Krahaso & prano'},
            {href:'/client/messages',         icon:'💬',label:'Mesazhet',     desc:'Komuniko direkt'},
            {href:'/client/reviews',          icon:'⭐',label:'Vlerësimet',   desc:'Jep feedback'},
            {href:'/pricing',                 icon:'💎',label:'Premium',      desc:'Çlockoje më shumë'},
          ].map(item=>(
            <Link key={item.href} href={item.href} className="quick-link"
              style={{padding:'16px',background:'rgba(240,236,228,0.02)',border:'1px solid rgba(240,236,228,0.07)',borderRadius:14,textDecoration:'none',transition:'all 0.2s',display:'block'}}>
              <div style={{fontSize:22,marginBottom:8}}>{item.icon}</div>
              <div style={{fontSize:13,fontWeight:700,color:'#f0ece4',marginBottom:3}}>{item.label}</div>
              <div style={{fontSize:11,color:'rgba(240,236,228,0.35)'}}>{item.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      {acceptModal&&sel&&(
        <AcceptOfferModal offer={acceptModal} applicationId={sel.id} applicationTitle={sel.title} onClose={()=>setAcceptModal(null)} onSuccess={handleAcceptSuccess}/>
      )}
    </PageShell>
  )
}