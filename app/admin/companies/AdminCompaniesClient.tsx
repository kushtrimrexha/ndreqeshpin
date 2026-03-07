'use client'

import { useState } from 'react'

interface Company {
  id: string; business_name: string; description: string | null
  website: string | null; is_verified: boolean; rating_avg: number
  created_at: string; package_type: string
  profiles: { id: string; full_name: string; email: string; city: string; phone?: string; avatar_url?: string; created_at: string } | null
}
interface OfferCounts { [companyId: string]: { total: number; accepted: number } }

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const days = Math.floor(diff / 86_400_000)
  if (days === 0) return 'Sot'
  if (days < 7)   return `${days} ditë më parë`
  if (days < 30)  return `${Math.floor(days/7)} javë më parë`
  return `${Math.floor(days/30)} muaj më parë`
}

function Stars({ r }: { r: number }) {
  return <span>{[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= Math.round(r) ? '#fbbf24' : 'rgba(255,255,255,0.1)', fontSize:12 }}>★</span>)}<span style={{ fontSize:11, color:'rgba(232,234,240,0.35)', marginLeft:4 }}>{r > 0 ? r.toFixed(1) : '—'}</span></span>
}

export default function AdminCompaniesClient({ companies, offerCounts }: { companies: Company[]; offerCounts: OfferCounts }) {
  const [search,   setSearch]   = useState('')
  const [filter,   setFilter]   = useState<'all'|'verified'|'pending'|'premium'>('all')
  const [loading,  setLoading]  = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [local,    setLocal]    = useState<Company[]>(companies)
  const [toast,    setToast]    = useState<{ msg: string; type: 'success'|'error' } | null>(null)

  function showToast(msg: string, type: 'success'|'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  async function toggleVerify(company: Company) {
    setLoading(company.id)
    try {
      const res = await fetch('/api/admin/verify-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: company.id, verified: !company.is_verified }),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || 'Gabim.', 'error'); return }
      setLocal(prev => prev.map(c => c.id === company.id ? { ...c, is_verified: !c.is_verified } : c))
      showToast(company.is_verified ? 'Verifikimi u hoq.' : `${company.business_name} u verifikua! ✓`)
    } catch { showToast('Problem me lidhjen.', 'error') }
    finally  { setLoading(null) }
  }

  const filtered = local
    .filter(c =>
      (filter === 'all') ||
      (filter === 'verified' && c.is_verified) ||
      (filter === 'pending'  && !c.is_verified) ||
      (filter === 'premium'  && c.package_type !== 'free')
    )
    .filter(c =>
      c.business_name.toLowerCase().includes(search.toLowerCase()) ||
      (c.profiles?.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.profiles?.city  || '').toLowerCase().includes(search.toLowerCase())
    )

  const counts = {
    all:      local.length,
    verified: local.filter(c => c.is_verified).length,
    pending:  local.filter(c => !c.is_verified).length,
    premium:  local.filter(c => c.package_type !== 'free').length,
  }

  return (
    <div>
      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        .co-row:hover { background:rgba(255,255,255,0.03)!important; }
        .expand-btn:hover { color:#e8eaf0!important; }
      `}</style>

      {toast && (
        <div style={{ position:'fixed', top:20, right:20, zIndex:700, padding:'14px 22px', borderRadius:13, fontSize:14, fontWeight:600, animation:'fadeUp 0.3s ease', boxShadow:'0 12px 40px rgba(0,0,0,0.5)', background: toast.type==='success' ? 'rgba(34,211,165,0.1)' : 'rgba(239,68,68,0.1)', border:`1px solid ${toast.type==='success' ? 'rgba(34,211,165,0.3)' : 'rgba(239,68,68,0.3)'}`, color: toast.type==='success' ? '#22d3a5' : '#fca5a5' }}>
          {toast.type==='success' ? '✓' : '⚠️'} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28, flexWrap:'wrap' as const, gap:16 }}>
        <div>
          <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'1.9rem', fontWeight:900, letterSpacing:'-0.03em', marginBottom:6 }}>Kompanitë</h1>
          <p style={{ fontSize:14, color:'rgba(232,234,240,0.45)' }}>{counts.pending} kompani presin verifikim · {counts.verified} të verifikuara</p>
        </div>
        {counts.pending > 0 && (
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 18px', background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.25)', borderRadius:14 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:'#fbbf24', boxShadow:'0 0 10px rgba(251,191,36,0.6)', animation:'pulse 2s infinite' }} />
            <span style={{ fontSize:13, fontWeight:700, color:'#fbbf24' }}>{counts.pending} kompani presin verifikim</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' as const }}>
        <div style={{ position:'relative' as const, flex:1, minWidth:220 }}>
          <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', opacity:0.35 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Kërko kompani, email, qytet..."
            style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:11, padding:'10px 14px 10px 36px', fontSize:13, color:'#e8eaf0', fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }} />
        </div>
        <div style={{ display:'flex', gap:3, background:'rgba(255,255,255,0.04)', padding:3, borderRadius:11, border:'1px solid rgba(255,255,255,0.07)' }}>
          {(['all','verified','pending','premium'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding:'7px 14px', borderRadius:9, border:'none', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', background:filter===f ? '#e8621a' : 'transparent', color:filter===f ? '#fff' : 'rgba(232,234,240,0.45)', transition:'all 0.2s', whiteSpace:'nowrap' as const }}>
              {{ all:'Të gjitha', verified:'Verified', pending:'Pritje', premium:'Premium' }[f]} ({counts[f]})
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, overflow:'hidden' }}>
        {/* Head */}
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 80px 80px 100px 140px', gap:12, padding:'12px 20px', borderBottom:'1px solid rgba(255,255,255,0.07)', fontSize:11, fontWeight:700, color:'rgba(232,234,240,0.3)', textTransform:'uppercase' as const, letterSpacing:'0.07em' }}>
          <span>Kompania</span>
          <span>Kontakti</span>
          <span style={{ textAlign:'center' as const }}>Oferta</span>
          <span style={{ textAlign:'center' as const }}>Vlerësim</span>
          <span style={{ textAlign:'center' as const }}>Statusi</span>
          <span style={{ textAlign:'center' as const }}>Veprime</span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px', color:'rgba(232,234,240,0.3)' }}>
            <div style={{ fontSize:42, marginBottom:12 }}>🏢</div>
            <div style={{ fontFamily:"'Fraunces',serif", fontWeight:800 }}>Nuk ka kompani</div>
          </div>
        ) : filtered.map((co, i) => {
          const oCount = offerCounts[co.id] || { total:0, accepted:0 }
          const rate   = oCount.total > 0 ? Math.round((oCount.accepted/oCount.total)*100) : 0
          const isOpen = expanded === co.id

          return (
            <div key={co.id} style={{ borderBottom: i < filtered.length-1 ? '1px solid rgba(255,255,255,0.05)' : 'none', animation:`fadeUp 0.3s ease ${i*0.04}s both` }}>
              {/* Main row */}
              <div className="co-row" style={{ display:'grid', gridTemplateColumns:'2fr 1fr 80px 80px 100px 140px', gap:12, padding:'16px 20px', alignItems:'center', transition:'background 0.15s', cursor:'default', background: co.is_verified ? 'transparent' : 'rgba(251,191,36,0.02)' }}>
                {/* Company info */}
                <div style={{ display:'flex', gap:12, alignItems:'center', minWidth:0 }}>
                  <div style={{ width:44, height:44, borderRadius:14, background:`linear-gradient(135deg,${co.is_verified ? '#e8621a' : '#64748b'},${co.is_verified ? '#ff7c35' : '#475569'})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:900, color:'#fff', flexShrink:0, boxShadow: co.is_verified ? '0 4px 14px rgba(232,98,26,0.25)' : 'none' }}>
                    {co.business_name.slice(0,2).toUpperCase()}
                  </div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:14, marginBottom:3, display:'flex', alignItems:'center', gap:7 }}>
                      <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' as const }}>{co.business_name}</span>
                      {co.package_type !== 'free' && <span style={{ fontSize:10, fontWeight:800, color:'#fbbf24', background:'rgba(251,191,36,0.12)', border:'1px solid rgba(251,191,36,0.25)', borderRadius:6, padding:'1px 7px', flexShrink:0 }}>💎</span>}
                    </div>
                    <div style={{ fontSize:11, color:'rgba(232,234,240,0.35)', display:'flex', gap:8 }}>
                      {co.profiles?.city && <span>📍 {co.profiles.city}</span>}
                      <span>🕐 {timeAgo(co.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div style={{ minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' as const }}>{co.profiles?.full_name || '—'}</div>
                  <div style={{ fontSize:11, color:'rgba(232,234,240,0.35)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' as const }}>{co.profiles?.email || '—'}</div>
                </div>

                {/* Offers */}
                <div style={{ textAlign:'center' as const }}>
                  <div style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:'1.1rem', color:'#e8621a' }}>{oCount.total}</div>
                  <div style={{ fontSize:10, color:'rgba(232,234,240,0.35)' }}>{rate}% sukses</div>
                </div>

                {/* Rating */}
                <div style={{ textAlign:'center' as const }}>
                  <Stars r={co.rating_avg} />
                </div>

                {/* Status */}
                <div style={{ textAlign:'center' as const }}>
                  {co.is_verified
                    ? <span style={{ fontSize:11, fontWeight:700, color:'#22d3a5', background:'rgba(34,211,165,0.1)', border:'1px solid rgba(34,211,165,0.25)', borderRadius:8, padding:'4px 12px' }}>✓ Verified</span>
                    : <span style={{ fontSize:11, fontWeight:700, color:'#fbbf24', background:'rgba(251,191,36,0.1)', border:'1px solid rgba(251,191,36,0.25)', borderRadius:8, padding:'4px 12px' }}>⏳ Pritje</span>
                  }
                </div>

                {/* Actions */}
                <div style={{ display:'flex', gap:6, justifyContent:'center', alignItems:'center' }}>
                  <button onClick={() => toggleVerify(co)} disabled={loading === co.id}
                    style={{ padding:'7px 13px', borderRadius:9, border:'none', fontFamily:'inherit', fontSize:12, fontWeight:700, cursor: loading===co.id ? 'not-allowed' : 'pointer', transition:'all 0.2s', background: co.is_verified ? 'rgba(248,113,113,0.1)' : 'rgba(34,211,165,0.12)', color: co.is_verified ? '#f87171' : '#22d3a5', border: `1px solid ${co.is_verified ? 'rgba(248,113,113,0.25)' : 'rgba(34,211,165,0.25)'}` as any, display:'flex', alignItems:'center', gap:5 }}>
                    {loading === co.id
                      ? <div style={{ width:11, height:11, border:'2px solid rgba(255,255,255,0.2)', borderTop:'2px solid currentColor', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
                      : co.is_verified ? '✕ Hiq' : '✓ Verifiko'
                    }
                  </button>
                  <button className="expand-btn" onClick={() => setExpanded(isOpen ? null : co.id)}
                    style={{ width:30, height:30, borderRadius:8, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', color:'rgba(232,234,240,0.4)', cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }}>▾</button>
                </div>
              </div>

              {/* Expanded details */}
              {isOpen && (
                <div style={{ padding:'0 20px 20px', background:'rgba(255,255,255,0.01)', borderTop:'1px solid rgba(255,255,255,0.05)', animation:'fadeUp 0.25s ease' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, paddingTop:16 }}>
                    {[
                      { label:'Email',     val: co.profiles?.email || '—' },
                      { label:'Telefon',   val: co.profiles?.phone || '—' },
                      { label:'Website',   val: co.website || '—' },
                      { label:'Paketa',    val: co.package_type === 'free' ? 'Falas' : '💎 Premium' },
                      { label:'Oferta',    val: `${oCount.total} total · ${oCount.accepted} pranuar` },
                      { label:'Regjistruar', val: new Date(co.created_at).toLocaleDateString('sq-AL', { day:'numeric', month:'long', year:'numeric' }) },
                    ].map((d,j) => (
                      <div key={j} style={{ padding:'12px 14px', background:'rgba(255,255,255,0.03)', borderRadius:10 }}>
                        <div style={{ fontSize:10, fontWeight:700, color:'rgba(232,234,240,0.35)', textTransform:'uppercase' as const, letterSpacing:'0.07em', marginBottom:5 }}>{d.label}</div>
                        <div style={{ fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' as const }}>{d.val}</div>
                      </div>
                    ))}
                  </div>
                  {co.description && (
                    <div style={{ marginTop:12, padding:'12px 14px', background:'rgba(255,255,255,0.03)', borderRadius:10 }}>
                      <div style={{ fontSize:10, fontWeight:700, color:'rgba(232,234,240,0.35)', textTransform:'uppercase' as const, letterSpacing:'0.07em', marginBottom:6 }}>Përshkrimi</div>
                      <p style={{ fontSize:13, color:'rgba(232,234,240,0.55)', lineHeight:1.7 }}>{co.description}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}