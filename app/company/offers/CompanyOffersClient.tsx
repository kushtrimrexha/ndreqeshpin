'use client'

import { useState } from 'react'
import Link         from 'next/link'
import StatusBadge  from '@/components/StatusBadge'
import EmptyState   from '@/components/EmptyState'
import OfferModal   from '@/components/OfferModal'
import { useToast } from '@/components/Toast'
import { TrendAreaChart, StatsPieChart } from '@/components/Analytics'

interface Offer {
  id:string; price:number; duration_days:number; description:string
  status:string; created_at:string
  applications:{id:string;title:string;city:string;status:string;profiles?:{full_name:string}|null}|null
}
interface Props { offers: Offer[]; companyId?: string }

const STATUS_META: Record<string,{label:string;col:string;bg:string;icon:string}> = {
  pending:  { label:'Në pritje', col:'#fbbf24', bg:'rgba(251,191,36,0.08)',  icon:'⏳' },
  accepted: { label:'Pranuar',   col:'#22d3a5', bg:'rgba(34,211,165,0.08)', icon:'✅' },
  rejected: { label:'Refuzuar',  col:'#f87171', bg:'rgba(248,113,113,0.08)',icon:'❌' },
}

export default function CompanyOffersClient({ offers, companyId }: Props) {
  const toast    = useToast()
  const [filter, setFilter]  = useState<'all'|'pending'|'accepted'|'rejected'>('all')
  const [search, setSearch]  = useState('')
  const [sort,   setSort]    = useState<'date'|'price'>('date')
  const [expand, setExpand]  = useState<string|null>(null)

  const counts = {
    all:      offers.length,
    pending:  offers.filter(o => o.status==='pending').length,
    accepted: offers.filter(o => o.status==='accepted').length,
    rejected: offers.filter(o => o.status==='rejected').length,
  }

  const totalEarned  = offers.filter(o => o.status==='accepted').reduce((s,o) => s+o.price, 0)
  const pendingValue = offers.filter(o => o.status==='pending').reduce((s,o) => s+o.price, 0)
  const successRate  = offers.length > 0 ? Math.round((counts.accepted/offers.length)*100) : 0
  const avgPrice     = offers.length > 0 ? Math.round(offers.reduce((s,o)=>s+o.price,0)/offers.length) : 0

  // Monthly trend
  const now = new Date()
  const trendMap: Record<string,number> = {}
  for (let i=5; i>=0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth()-i, 1)
    trendMap[d.toLocaleDateString('sq-AL',{month:'short',year:'2-digit'})] = 0
  }
  offers.forEach(o => {
    try {
      const key = new Date(o.created_at).toLocaleDateString('sq-AL',{month:'short',year:'2-digit'})
      if (key in trendMap) trendMap[key]++
    } catch {}
  })
  const trendData = Object.entries(trendMap).map(([label,value]) => ({ label, value }))

  // Status pie
  const pieData = [
    { label:'Pranuar', value:counts.accepted, color:'#22d3a5' },
    { label:'Pritje',  value:counts.pending,  color:'#fbbf24' },
    { label:'Refuzuar',value:counts.rejected, color:'#f87171' },
  ].filter(d => d.value > 0)

  const filtered = offers
    .filter(o => filter==='all' || o.status===filter)
    .filter(o => !search || (o.applications?.title||'').toLowerCase().includes(search.toLowerCase()) || (o.applications?.city||'').toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => sort==='price' ? b.price-a.price : new Date(b.created_at).getTime()-new Date(a.created_at).getTime())

  return (
    <div>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .offer-row:hover { background:rgba(240,236,228,0.05)!important; transform:translateX(2px); }
        .offer-row { transition:all 0.15s ease; cursor:pointer; }
        .expand-row { animation:fadeUp 0.2s ease; }
        .sort-btn:hover { color:rgba(240,236,228,0.8)!important; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom:28, animation:'fadeUp 0.5s ease' }}>
        <p style={{ fontSize:11, fontWeight:700, color:'rgba(240,236,228,0.3)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:8 }}>Gjurmim ofertash</p>
        <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(1.6rem,3vw,2rem)', fontWeight:900, letterSpacing:'-0.03em', marginBottom:6 }}>
          Ofertat <span style={{ color:'#e8621a', fontStyle:'italic' }}>e dërguara</span>
        </h1>
        <p style={{ fontSize:14, color:'rgba(240,236,228,0.4)' }}>{offers.length} oferta · {successRate}% sukses</p>
      </div>

      {/* KPI grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(155px,1fr))', gap:12, marginBottom:24 }}>
        {[
          { icon:'💼', label:'Gjithsej',        val:offers.length,                       col:'#e8621a' },
          { icon:'⏳', label:'Në pritje',        val:counts.pending,                      col:'#fbbf24' },
          { icon:'✅', label:'Pranuar',           val:counts.accepted,                     col:'#22d3a5' },
          { icon:'🎯', label:'Sukses',            val:`${successRate}%`,                   col:'#60a5fa' },
          { icon:'💰', label:'Të ardhura',        val:`€${totalEarned.toLocaleString()}`,  col:'#22d3a5' },
          { icon:'⚡', label:'Vlerë në pritje',  val:`€${pendingValue.toLocaleString()}`, col:'#fbbf24' },
        ].map((kpi,i) => (
          <div key={i} style={{ padding:'16px 18px', background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:16, animation:`fadeUp 0.4s ease ${i*0.06}s both` }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
              <span style={{ fontSize:16 }}>{kpi.icon}</span>
              <span style={{ fontSize:11, color:'rgba(240,236,228,0.4)', fontWeight:600 }}>{kpi.label}</span>
            </div>
            <div style={{ fontFamily:"'Fraunces',serif", fontSize:'1.6rem', fontWeight:900, color:kpi.col, lineHeight:1 }}>{kpi.val}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      {offers.length > 2 && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:24 }}>
          <TrendAreaChart data={trendData} title="📈 Ofertat dërguar — 6 muajt" color="#e8621a" name="Oferta" height={160} />
          {pieData.length > 1 && <StatsPieChart data={pieData} title="🎯 Shpërndarje statusi" height={160} />}
        </div>
      )}

      {/* Filters */}
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ display:'flex', gap:4, background:'rgba(240,236,228,0.04)', padding:4, borderRadius:12, border:'1px solid rgba(240,236,228,0.07)' }}>
          {(['all','pending','accepted','rejected'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding:'7px 12px', borderRadius:9, border:'none', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', background:filter===f?'#e8621a':'transparent', color:filter===f?'#fff':'rgba(240,236,228,0.45)', transition:'all 0.2s', whiteSpace:'nowrap' }}>
              {({all:'Të gjitha',pending:'Pritje',accepted:'Pranuar',rejected:'Refuzuar'} as Record<string,string>)[f]} ({counts[f as keyof typeof counts]})
            </button>
          ))}
        </div>
        <div style={{ flex:1, minWidth:180, position:'relative' }}>
          <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', opacity:0.35, fontSize:13 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Kërko projekt ose qytet..."
            style={{ width:'100%', background:'rgba(240,236,228,0.04)', border:'1px solid rgba(240,236,228,0.08)', borderRadius:10, padding:'9px 12px 9px 32px', fontSize:13, color:'#f0ece4', fontFamily:'inherit', outline:'none', boxSizing:'border-box' }}/>
        </div>
        <div style={{ display:'flex', gap:4 }}>
          {(['date','price'] as const).map(s => (
            <button key={s} className="sort-btn" onClick={() => setSort(s)}
              style={{ padding:'8px 14px', borderRadius:9, border:`1px solid ${sort===s?'rgba(240,236,228,0.15)':'rgba(240,236,228,0.07)'}`, background:sort===s?'rgba(240,236,228,0.08)':'transparent', color:sort===s?'rgba(240,236,228,0.8)':'rgba(240,236,228,0.35)', fontFamily:'inherit', fontSize:12, fontWeight:700, cursor:'pointer', transition:'all 0.2s' }}>
              {s==='date'?'🕐 Data':'💰 Çmimi'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState icon="📭" title="Nuk ka oferta" message="Shko tek Aplikimet dhe dërgo ofertën e parë." size="lg" action={{label:'Aplikimet aktive →', href:'/company/applications'}} />
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 110px 80px 100px 110px', gap:12, padding:'8px 18px', fontSize:10, fontWeight:700, color:'rgba(240,236,228,0.25)', textTransform:'uppercase', letterSpacing:'0.08em', borderBottom:'1px solid rgba(240,236,228,0.05)' }}>
            <span>Projekti</span><span style={{textAlign:'center'}}>Çmimi</span><span style={{textAlign:'center'}}>Ditë</span><span style={{textAlign:'center'}}>Statusi</span><span style={{textAlign:'right'}}>Data</span>
          </div>

          {filtered.map((o,i) => {
            const sm      = STATUS_META[o.status] || STATUS_META.pending
            const isOpen  = expand === o.id
            return (
              <div key={o.id}>
                <div className="offer-row" onClick={() => setExpand(isOpen ? null : o.id)}
                  style={{ display:'grid', gridTemplateColumns:'1fr 110px 80px 100px 110px', gap:12, padding:'15px 18px', background:o.status==='accepted'?'rgba(34,211,165,0.03)':isOpen?'rgba(240,236,228,0.03)':'rgba(240,236,228,0.015)', border:`1px solid ${isOpen?'rgba(240,236,228,0.12)':o.status==='accepted'?'rgba(34,211,165,0.1)':'rgba(240,236,228,0.06)'}`, borderRadius:isOpen?'14px 14px 0 0':14, alignItems:'center', opacity:o.status==='rejected'?0.55:1, animation:`fadeUp 0.3s ease ${i*0.04}s both` }}>

                  <div style={{ minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:13, color:'#f0ece4', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:3 }}>
                      {o.applications?.title || '—'}
                    </div>
                    <div style={{ display:'flex', gap:10, fontSize:11, color:'rgba(240,236,228,0.35)' }}>
                      {o.applications?.profiles?.full_name && <span>👤 {o.applications.profiles.full_name}</span>}
                      {o.applications?.city && <span>📍 {o.applications.city}</span>}
                    </div>
                  </div>
                  <div style={{ textAlign:'center', fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:'1.1rem', color:'#e8621a' }}>€{o.price.toLocaleString()}</div>
                  <div style={{ textAlign:'center', fontSize:13, color:'rgba(240,236,228,0.5)', fontWeight:600 }}>{o.duration_days}d</div>
                  <div style={{ textAlign:'center' }}>
                    <span style={{ fontSize:10, fontWeight:800, padding:'4px 10px', borderRadius:7, background:sm.bg, color:sm.col, border:`1px solid ${sm.col}25`, whiteSpace:'nowrap' }}>
                      {sm.icon} {sm.label}
                    </span>
                  </div>
                  <div style={{ textAlign:'right', fontSize:11, color:'rgba(240,236,228,0.3)' }}>
                    {new Date(o.created_at).toLocaleDateString('sq-AL',{day:'numeric',month:'short'})}
                  </div>
                </div>

                {/* Expandable description */}
                {isOpen && o.description && (
                  <div className="expand-row" style={{ padding:'14px 20px', background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.08)', borderTop:'none', borderRadius:'0 0 14px 14px' }}>
                    <p style={{ fontSize:13, color:'rgba(240,236,228,0.55)', lineHeight:1.75 }}>💬 {o.description}</p>
                    {o.applications?.id && (
                      <Link href={`/company/applications`} style={{ display:'inline-flex', alignItems:'center', gap:6, marginTop:10, fontSize:12, color:'#e8621a', fontWeight:700, textDecoration:'none', padding:'6px 14px', border:'1px solid rgba(232,98,26,0.25)', borderRadius:8, background:'rgba(232,98,26,0.06)' }}>
                        Shiko projektin →
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {filtered.length > 0 && (
        <div style={{ marginTop:20, padding:'14px 20px', background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.06)', borderRadius:12, display:'flex', gap:24, flexWrap:'wrap', fontSize:13, color:'rgba(240,236,228,0.35)', animation:'fadeUp 0.4s ease 0.3s both' }}>
          <span>📊 {filtered.length} rezultate</span>
          <span>💵 Mesatare: <strong style={{color:'#e8621a'}}>€{avgPrice.toLocaleString()}</strong></span>
          {filter==='accepted' && <span>💰 Total: <strong style={{color:'#22d3a5'}}>€{filtered.reduce((s,o)=>s+o.price,0).toLocaleString()}</strong></span>}
        </div>
      )}
    </div>
  )
}