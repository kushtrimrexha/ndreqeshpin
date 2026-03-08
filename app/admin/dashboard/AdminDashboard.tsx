'use client'

import { useState }  from 'react'
import Link          from 'next/link'
import PageShell     from '@/components/PageShell'
import Avatar        from '@/components/Avatar'
import StatusBadge   from '@/components/StatusBadge'
import EmptyState    from '@/components/EmptyState'
import { useToast }  from '@/components/Toast'
import { KpiCard }   from '@/components/Analytics'

interface AdminProfile { id:string; full_name:string; package_type:string }
interface Company { id:string; business_name:string; is_verified:boolean; rating_avg:number; package_type:string; created_at:string; profiles?:{full_name:string;city:string;avatar_url?:string}|any }
interface User    { id:string; full_name:string; email?:string; role:string; city?:string; package_type:string; created_at:string }
interface Application { id:string; title:string; city:string; status:string; offer_count:number; created_at:string; profiles?:{full_name:string}|any }

interface Stats {
  totalUsers:number; totalCompanies:number; totalApplications:number; totalOffers:number
  totalReviews:number; verifiedCompanies:number; premiumUsers:number; newUsersWeek:number
}

interface Props {
  adminProfile:      AdminProfile
  initialCompanies:  Company[]
  initialUsers:      User[]
  recentApplications:Application[]
  stats:             Stats
}

const ROLE_META: Record<string,{label:string;col:string;icon:string}> = {
  client:  { label:'Klient',  col:'#60a5fa', icon:'👤' },
  company: { label:'Kompani', col:'#e8621a', icon:'🏢' },
  worker:  { label:'Punëtor', col:'#22d3a5', icon:'🔧' },
  admin:   { label:'Admin',   col:'#a78bfa', icon:'⚡' },
}

function timeAgo(d:string) {
  const diff=Date.now()-new Date(d).getTime(), days=Math.floor(diff/86400000)
  if(days===0)return'Sot'; if(days<7)return`${days}d`; if(days<30)return`${Math.floor(days/7)}j`; return`${Math.floor(days/30)}m`
}

export default function AdminDashboard({ adminProfile, initialCompanies, initialUsers, recentApplications, stats }: Props) {
  const toast        = useToast()
  const [tab,        setTab]        = useState<'overview'|'companies'|'users'|'apps'>('overview')
  const [companies,  setCompanies]  = useState<Company[]>(initialCompanies)
  const [search,     setSearch]     = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [loadingId,  setLoadingId]  = useState<string|null>(null)

  const verifyPct = stats.totalCompanies > 0 ? Math.round((stats.verifiedCompanies/stats.totalCompanies)*100) : 0
  const premiumPct = stats.totalUsers > 0 ? Math.round((stats.premiumUsers/stats.totalUsers)*100) : 0

  async function toggleVerify(company: Company) {
    setLoadingId(company.id)
    try {
      const res  = await fetch('/api/admin/verify-company', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({company_id:company.id, is_verified:!company.is_verified}) })
      const data = await res.json()
      if (!res.ok) { toast.error('Gabim', data.error); return }
      setCompanies(prev => prev.map(c => c.id===company.id ? {...c, is_verified:!c.is_verified} : c))
      company.is_verified
        ? toast.info(`"${company.business_name}" u çverifikua.`)
        : toast.success(`"${company.business_name}" u verifikua! 🏆`)
    } finally { setLoadingId(null) }
  }

  async function updateRole(userId: string, newRole: string) {
    const res = await fetch('/api/admin/update-role', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_id:userId, role:newRole}) })
    if (res.ok) toast.success('Roli u ndryshua!', `Useri tani është ${newRole}`) 
    else toast.error('Gabim', 'Nuk u ndryshua roli')
  }

  const filteredCompanies = companies.filter(c => c.business_name.toLowerCase().includes(search.toLowerCase()) || (c.profiles as any)?.city?.toLowerCase().includes(search.toLowerCase()))
  const filteredUsers     = initialUsers.filter(u =>
    (u.full_name||'').toLowerCase().includes(search.toLowerCase()) &&
    (roleFilter==='all' || u.role===roleFilter)
  )

  const TABS = [
    { id:'overview',  label:'Pasqyra',  icon:'📊' },
    { id:'companies', label:'Kompanit', icon:'🏢', count:companies.length },
    { id:'users',     label:'Userët',   icon:'👥', count:initialUsers.length },
    { id:'apps',      label:'Aplikime', icon:'📋', count:recentApplications.length },
  ]

  return (
    <PageShell role="admin" userName={adminProfile.full_name} userId={adminProfile.id} package={adminProfile.package_type} pageTitle="Dashboard" pageIcon="⚡">
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.5} }
        .admin-row:hover  { background:rgba(240,236,228,0.04)!important; }
        .admin-row        { transition:background 0.15s; }
        .tab-btn:hover    { color:rgba(240,236,228,0.8)!important; }
        .verify-btn:hover { opacity:.88!important; transform:translateY(-1px); }
      `}</style>

      {/* Global KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(155px,1fr))', gap:12, marginBottom:28 }}>
        {[
          { title:'Përdorues',     value:stats.totalUsers,        icon:'👥', color:'#60a5fa', label:`+${stats.newUsersWeek} këtë javë`  },
          { title:'Kompani',       value:stats.totalCompanies,    icon:'🏢', color:'#e8621a', label:`${verifyPct}% të verifikuara`        },
          { title:'Aplikime',      value:stats.totalApplications, icon:'📋', color:'#22d3a5', label:'projekte totale'                    },
          { title:'Oferta',        value:stats.totalOffers,       icon:'💼', color:'#fbbf24', label:'bids dërguar'                       },
          { title:'Reviews',       value:stats.totalReviews,      icon:'⭐', color:'#fbbf24', label:'vlerësime'                          },
          { title:'Premium',       value:stats.premiumUsers,      icon:'💎', color:'#a78bfa', label:`${premiumPct}% e bazës`             },
          { title:'Të verifikuara',value:stats.verifiedCompanies, icon:'✅', color:'#22d3a5', label:'kompani aktive'                     },
          { title:'Kjo javë',      value:stats.newUsersWeek,      icon:'🔥', color:'#f87171', label:'regjistrime të reja'                },
        ].map((kpi,i) => (
          <div key={i} style={{ padding:'16px 18px', background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:16, animation:`fadeUp 0.4s ease ${i*0.05}s both` }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
              <span style={{ fontSize:16 }}>{kpi.icon}</span>
              <span style={{ fontSize:11, color:'rgba(240,236,228,0.4)', fontWeight:600 }}>{kpi.title}</span>
            </div>
            <div style={{ fontFamily:"'Fraunces',serif", fontSize:'1.7rem', fontWeight:900, color:kpi.color, lineHeight:1, marginBottom:6 }}>{kpi.value.toLocaleString()}</div>
            <div style={{ fontSize:11, color:'rgba(240,236,228,0.3)' }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Platform health bar */}
      <div style={{ marginBottom:24, padding:'18px 22px', background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:16, animation:'fadeUp 0.5s ease 0.1s both' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <div style={{ fontSize:13, fontWeight:700 }}>🏥 Shëndeti i platformës</div>
          <div style={{ fontSize:12, color:'rgba(240,236,228,0.4)' }}>Live</div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
          {[
            { label:'Kompani aktive',    val:verifyPct,  col:'#e8621a' },
            { label:'Userë premium',     val:premiumPct, col:'#a78bfa' },
            { label:'Oferta/Aplikime',   val:stats.totalApplications>0?Math.min(100,Math.round((stats.totalOffers/stats.totalApplications)*100)):0, col:'#22d3a5' },
            { label:'Sukses overall',    val:stats.totalOffers>0?Math.min(100,Math.round((stats.totalReviews/stats.totalOffers)*80)):0, col:'#fbbf24' },
          ].map((m,i) => (
            <div key={i}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'rgba(240,236,228,0.45)', marginBottom:5 }}>
                <span>{m.label}</span><span style={{ fontWeight:700, color:m.col }}>{m.val}%</span>
              </div>
              <div style={{ height:5, background:'rgba(240,236,228,0.06)', borderRadius:10, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${m.val}%`, background:m.col, borderRadius:10, transition:'width 1s ease', boxShadow:`0 0 8px ${m.col}60` }}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, background:'rgba(240,236,228,0.04)', padding:4, borderRadius:14, border:'1px solid rgba(240,236,228,0.07)', marginBottom:20, overflowX:'auto' }}>
        {TABS.map(t => (
          <button key={t.id} className="tab-btn" onClick={() => setTab(t.id as any)}
            style={{ padding:'9px 18px', borderRadius:11, border:'none', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', background:tab===t.id?'rgba(240,236,228,0.1)':'transparent', color:tab===t.id?'#f0ece4':'rgba(240,236,228,0.4)', transition:'all 0.2s', display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap' }}>
            {t.icon} {t.label}
            {t.count !== undefined && <span style={{ fontSize:11, fontWeight:800, background:'rgba(240,236,228,0.1)', borderRadius:20, padding:'1px 8px', color:'rgba(240,236,228,0.5)' }}>{t.count}</span>}
          </button>
        ))}
      </div>

      {/* Search (shared) */}
      {tab !== 'overview' && (
        <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
          <div style={{ flex:1, minWidth:200, position:'relative' }}>
            <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', opacity:0.35, fontSize:13 }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Kërko..."
              style={{ width:'100%', background:'rgba(240,236,228,0.04)', border:'1px solid rgba(240,236,228,0.08)', borderRadius:10, padding:'9px 12px 9px 30px', fontSize:13, color:'#f0ece4', fontFamily:'inherit', outline:'none', boxSizing:'border-box' }}/>
          </div>
          {tab === 'users' && (
            <div style={{ display:'flex', gap:4, background:'rgba(240,236,228,0.04)', padding:4, borderRadius:10, border:'1px solid rgba(240,236,228,0.07)' }}>
              {['all','client','company','worker','admin'].map(r => (
                <button key={r} onClick={() => setRoleFilter(r)}
                  style={{ padding:'6px 12px', borderRadius:8, border:'none', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit', background:roleFilter===r?'#e8621a':'transparent', color:roleFilter===r?'#fff':'rgba(240,236,228,0.45)', transition:'all 0.2s', whiteSpace:'nowrap' }}>
                  {r==='all'?'Të gjitha':ROLE_META[r]?.icon+' '+ROLE_META[r]?.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── OVERVIEW TAB ── */}
      {tab === 'overview' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          {/* Recent registrations */}
          <div style={{ background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:16, overflow:'hidden' }}>
            <div style={{ padding:'14px 18px', borderBottom:'1px solid rgba(240,236,228,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:13, fontWeight:700 }}>👥 Regjistrime të reja</span>
              <Link href="#" onClick={() => setTab('users')} style={{ fontSize:11, color:'#e8621a', fontWeight:700, textDecoration:'none' }}>Shiko të gjitha</Link>
            </div>
            {initialUsers.slice(0,6).map((u,i) => {
              const rm = ROLE_META[u.role] || ROLE_META.client
              return (
                <div key={u.id} className="admin-row" style={{ padding:'12px 18px', borderBottom:i<5?'1px solid rgba(240,236,228,0.04)':'none', display:'flex', gap:10, alignItems:'center', animation:`fadeUp 0.3s ease ${i*0.05}s both` }}>
                  <Avatar name={u.full_name||'U'} size={34} borderRadius={10}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.full_name||'Pa emër'}</div>
                    <div style={{ fontSize:11, color:'rgba(240,236,228,0.35)' }}>📍 {u.city||'—'} · {timeAgo(u.created_at)}</div>
                  </div>
                  <span style={{ fontSize:10, fontWeight:800, color:rm.col, background:`${rm.col}12`, border:`1px solid ${rm.col}25`, borderRadius:6, padding:'2px 8px', whiteSpace:'nowrap' }}>{rm.icon} {rm.label}</span>
                </div>
              )
            })}
          </div>

          {/* Recent applications */}
          <div style={{ background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:16, overflow:'hidden' }}>
            <div style={{ padding:'14px 18px', borderBottom:'1px solid rgba(240,236,228,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:13, fontWeight:700 }}>📋 Aplikimet e fundit</span>
              <Link href="#" onClick={() => setTab('apps')} style={{ fontSize:11, color:'#e8621a', fontWeight:700, textDecoration:'none' }}>Shiko të gjitha</Link>
            </div>
            {recentApplications.slice(0,6).map((a,i) => (
              <div key={a.id} className="admin-row" style={{ padding:'12px 18px', borderBottom:i<5?'1px solid rgba(240,236,228,0.04)':'none', display:'flex', gap:10, alignItems:'center', animation:`fadeUp 0.3s ease ${i*0.05}s both` }}>
                <div style={{ width:34, height:34, borderRadius:10, background:'rgba(34,211,165,0.1)', border:'1px solid rgba(34,211,165,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>📋</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.title}</div>
                  <div style={{ fontSize:11, color:'rgba(240,236,228,0.35)' }}>📍 {a.city} · {a.offer_count} oferta · {timeAgo(a.created_at)}</div>
                </div>
                <StatusBadge status={a.status} size="xs"/>
              </div>
            ))}
          </div>

          {/* Quick links */}
          <div style={{ gridColumn:'1/-1', display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:10 }}>
            {[
              { href:'/admin/companies',    icon:'🏢', label:'Menaxho kompanit',     desc:'Verifiko & moderо' },
              { href:'/admin/users',        icon:'👥', label:'Menaxho userët',        desc:'Ndrysho role' },
              { href:'/admin/applications', icon:'📋', label:'Të gjitha aplikimet',   desc:'Monitorim i plotë' },
              { href:'/admin/offers',       icon:'💼', label:'Të gjitha ofertat',     desc:'Shiko trendet' },
              { href:'/admin/stats',        icon:'📊', label:'Statistikat globale',   desc:'Analytics avancuar' },
              { href:'/admin/settings',     icon:'⚙️', label:'Cilësimet e sistemit',  desc:'Konfigurim' },
            ].map(item => (
              <Link key={item.href} href={item.href}
                style={{ padding:'16px', background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:14, textDecoration:'none', transition:'all 0.2s', display:'block' }}
                onMouseEnter={e=>(e.currentTarget.style.borderColor='rgba(240,236,228,0.14)')}
                onMouseLeave={e=>(e.currentTarget.style.borderColor='rgba(240,236,228,0.07)')}>
                <div style={{ fontSize:22, marginBottom:8 }}>{item.icon}</div>
                <div style={{ fontSize:13, fontWeight:700, color:'#f0ece4', marginBottom:3 }}>{item.label}</div>
                <div style={{ fontSize:11, color:'rgba(240,236,228,0.3)' }}>{item.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── COMPANIES TAB ── */}
      {tab === 'companies' && (
        <div>
          <div style={{ marginBottom:10, fontSize:12, color:'rgba(240,236,228,0.35)' }}>{filteredCompanies.length} kompani</div>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 120px 100px 110px 130px', gap:12, padding:'8px 16px', fontSize:10, fontWeight:700, color:'rgba(240,236,228,0.25)', textTransform:'uppercase', letterSpacing:'0.07em', borderBottom:'1px solid rgba(240,236,228,0.05)', marginBottom:4 }}>
            <span>Kompania</span><span style={{textAlign:'center'}}>Plani</span><span style={{textAlign:'center'}}>Rating</span><span style={{textAlign:'center'}}>Statusi</span><span style={{textAlign:'center'}}>Veprimi</span>
          </div>
          {filteredCompanies.length === 0 ? <EmptyState icon="🔍" title="Nuk u gjet" message="Provo kërkim tjetër." size="sm"/> : (
            filteredCompanies.map((c,i) => (
              <div key={c.id} className="admin-row" style={{ display:'grid', gridTemplateColumns:'2fr 120px 100px 110px 130px', gap:12, padding:'13px 16px', borderBottom:`1px solid rgba(240,236,228,0.05)`, alignItems:'center', animation:`fadeUp 0.3s ease ${i*0.04}s both` }}>
                <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                  <Avatar name={c.business_name||'K'} size={36} borderRadius={10}/>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, display:'flex', alignItems:'center', gap:6 }}>
                      {c.business_name}
                      {c.is_verified && <span style={{ fontSize:9, color:'#22d3a5', background:'rgba(34,211,165,0.1)', border:'1px solid rgba(34,211,165,0.2)', borderRadius:5, padding:'2px 6px', fontWeight:800 }}>✓ VER</span>}
                    </div>
                    <div style={{ fontSize:11, color:'rgba(240,236,228,0.35)' }}>📍 {(c.profiles as any)?.city||'—'} · {timeAgo(c.created_at)}</div>
                  </div>
                </div>
                <div style={{ textAlign:'center' }}>
                  <span style={{ fontSize:10, fontWeight:800, color:c.package_type==='premium'?'#a78bfa':'rgba(240,236,228,0.4)', background:c.package_type==='premium'?'rgba(167,139,250,0.1)':'rgba(240,236,228,0.04)', borderRadius:6, padding:'3px 10px', border:`1px solid ${c.package_type==='premium'?'rgba(167,139,250,0.2)':'rgba(240,236,228,0.07)'}` }}>
                    {c.package_type==='premium'?'💎 Premium':'⚪ Falas'}
                  </span>
                </div>
                <div style={{ textAlign:'center', fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:'1rem', color:'#fbbf24' }}>
                  {c.rating_avg > 0 ? `★ ${c.rating_avg.toFixed(1)}` : '—'}
                </div>
                <div style={{ textAlign:'center' }}>
                  <span style={{ fontSize:10, fontWeight:800, padding:'3px 10px', borderRadius:6, background:c.is_verified?'rgba(34,211,165,0.1)':'rgba(251,191,36,0.08)', color:c.is_verified?'#22d3a5':'#fbbf24', border:`1px solid ${c.is_verified?'rgba(34,211,165,0.2)':'rgba(251,191,36,0.2)'}` }}>
                    {c.is_verified ? '✅ Verifikuar' : '⏳ Pritje'}
                  </span>
                </div>
                <div style={{ textAlign:'center' }}>
                  <button className="verify-btn" onClick={() => toggleVerify(c)} disabled={loadingId===c.id}
                    style={{ padding:'7px 14px', borderRadius:9, border:'none', fontSize:11, fontWeight:800, cursor:'pointer', fontFamily:'inherit', background:c.is_verified?'rgba(248,113,113,0.1)':'rgba(34,211,165,0.1)', color:c.is_verified?'#f87171':'#22d3a5', border:`1px solid ${c.is_verified?'rgba(248,113,113,0.2)':'rgba(34,211,165,0.2)'}`, transition:'all 0.2s', whiteSpace:'nowrap' }}>
                    {loadingId===c.id ? '...' : c.is_verified ? '✕ Çverifiko' : '✓ Verifiko'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── USERS TAB ── */}
      {tab === 'users' && (
        <div>
          <div style={{ marginBottom:10, fontSize:12, color:'rgba(240,236,228,0.35)' }}>{filteredUsers.length} përdorues</div>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 90px 100px 80px 100px', gap:12, padding:'8px 16px', fontSize:10, fontWeight:700, color:'rgba(240,236,228,0.25)', textTransform:'uppercase', letterSpacing:'0.07em', borderBottom:'1px solid rgba(240,236,228,0.05)', marginBottom:4 }}>
            <span>Useri</span><span style={{textAlign:'center'}}>Roli</span><span style={{textAlign:'center'}}>Plani</span><span style={{textAlign:'center'}}>Datë</span><span style={{textAlign:'center'}}>Ndrysho rol</span>
          </div>
          {filteredUsers.length===0 ? <EmptyState icon="👥" title="Nuk u gjet" message="Provo kërkim tjetër." size="sm"/> : (
            filteredUsers.map((u,i) => {
              const rm = ROLE_META[u.role] || ROLE_META.client
              return (
                <div key={u.id} className="admin-row" style={{ display:'grid', gridTemplateColumns:'2fr 90px 100px 80px 100px', gap:12, padding:'12px 16px', borderBottom:'1px solid rgba(240,236,228,0.04)', alignItems:'center', animation:`fadeUp 0.3s ease ${i*0.04}s both` }}>
                  <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                    <Avatar name={u.full_name||'U'} size={34} borderRadius={10}/>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600 }}>{u.full_name||'Pa emër'}</div>
                      <div style={{ fontSize:11, color:'rgba(240,236,228,0.35)' }}>📍 {u.city||'—'}</div>
                    </div>
                  </div>
                  <div style={{ textAlign:'center' }}>
                    <span style={{ fontSize:10, fontWeight:800, color:rm.col, background:`${rm.col}12`, border:`1px solid ${rm.col}25`, borderRadius:6, padding:'2px 8px' }}>{rm.icon} {rm.label}</span>
                  </div>
                  <div style={{ textAlign:'center' }}>
                    <span style={{ fontSize:10, fontWeight:700, color:u.package_type==='premium'?'#a78bfa':'rgba(240,236,228,0.35)', background:u.package_type==='premium'?'rgba(167,139,250,0.08)':'transparent', borderRadius:6, padding:'2px 8px' }}>
                      {u.package_type==='premium'?'💎 Premium':'⚪ Falas'}
                    </span>
                  </div>
                  <div style={{ textAlign:'center', fontSize:11, color:'rgba(240,236,228,0.35)' }}>{timeAgo(u.created_at)}</div>
                  <div style={{ textAlign:'center' }}>
                    <select defaultValue={u.role} onChange={e => updateRole(u.id, e.target.value)}
                      style={{ padding:'5px 8px', background:'rgba(240,236,228,0.05)', border:'1px solid rgba(240,236,228,0.1)', borderRadius:8, fontSize:11, color:'rgba(240,236,228,0.65)', fontFamily:'inherit', outline:'none', cursor:'pointer' }}>
                      {['client','company','worker','admin'].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* ── APPS TAB ── */}
      {tab === 'apps' && (
        <div>
          <div style={{ marginBottom:10, fontSize:12, color:'rgba(240,236,228,0.35)' }}>{recentApplications.length} aplikime të fundit</div>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 100px 70px 90px 80px', gap:12, padding:'8px 16px', fontSize:10, fontWeight:700, color:'rgba(240,236,228,0.25)', textTransform:'uppercase', letterSpacing:'0.07em', borderBottom:'1px solid rgba(240,236,228,0.05)', marginBottom:4 }}>
            <span>Projekti</span><span>Klienti</span><span style={{textAlign:'center'}}>Oferta</span><span style={{textAlign:'center'}}>Statusi</span><span style={{textAlign:'right'}}>Data</span>
          </div>
          {recentApplications.filter(a=>(a.title+'').toLowerCase().includes(search.toLowerCase())).map((a,i) => (
            <div key={a.id} className="admin-row" style={{ display:'grid', gridTemplateColumns:'2fr 100px 70px 90px 80px', gap:12, padding:'12px 16px', borderBottom:'1px solid rgba(240,236,228,0.04)', alignItems:'center', animation:`fadeUp 0.3s ease ${i*0.04}s both` }}>
              <div>
                <div style={{ fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.title}</div>
                <div style={{ fontSize:11, color:'rgba(240,236,228,0.35)' }}>📍 {a.city}</div>
              </div>
              <div style={{ fontSize:12, color:'rgba(240,236,228,0.5)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{(a.profiles as any)?.full_name||'—'}</div>
              <div style={{ textAlign:'center', fontFamily:"'Fraunces',serif", fontWeight:900, color:'#e8621a' }}>{a.offer_count}</div>
              <div style={{ textAlign:'center' }}><StatusBadge status={a.status} size="xs"/></div>
              <div style={{ textAlign:'right', fontSize:11, color:'rgba(240,236,228,0.35)' }}>{timeAgo(a.created_at)}</div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  )
}