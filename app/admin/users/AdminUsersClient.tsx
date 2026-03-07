'use client'

import { useState } from 'react'

interface User {
  id: string; full_name: string; email: string; role: string
  city: string; phone?: string; package_type: string; created_at: string; avatar_url?: string
}

const ROLES = ['client','company','worker','admin']
const ROLE_STYLE: Record<string, { col:string; label:string; icon:string }> = {
  client:  { col:'#60a5fa', label:'Klient',  icon:'👤' },
  company: { col:'#e8621a', label:'Kompani', icon:'🏢' },
  worker:  { col:'#22d3a5', label:'Punëtor', icon:'🔧' },
  admin:   { col:'#a78bfa', label:'Admin',   icon:'⚡' },
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const days = Math.floor(diff / 86_400_000)
  if (days === 0) return 'Sot'
  if (days < 7)   return `${days}d më parë`
  if (days < 30)  return `${Math.floor(days/7)}j më parë`
  return `${Math.floor(days/30)}m më parë`
}

export default function AdminUsersClient({ users, currentAdminId }: { users: User[]; currentAdminId: string }) {
  const [search,    setSearch]    = useState('')
  const [roleFilter,setRoleFilter]= useState('all')
  const [pkgFilter, setPkgFilter] = useState('all')
  const [loading,   setLoading]   = useState<string | null>(null)
  const [local,     setLocal]     = useState<User[]>(users)
  const [toast,     setToast]     = useState<{ msg:string; type:'success'|'error' } | null>(null)
  const [selected,  setSelected]  = useState<Set<string>>(new Set())
  const [editRole,  setEditRole]  = useState<string | null>(null)

  function showToast(msg: string, type: 'success'|'error' = 'success') {
    setToast({ msg, type }); setTimeout(() => setToast(null), 4000)
  }

  async function changeRole(userId: string, newRole: string) {
    if (userId === currentAdminId && newRole !== 'admin') {
      showToast('Nuk mund ta ndryshosh rolin tënd.', 'error'); return
    }
    setLoading(userId)
    try {
      const res  = await fetch('/api/admin/update-role', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ userId, role: newRole }),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || 'Gabim.', 'error'); return }
      setLocal(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
      setEditRole(null)
      showToast(`Roli u ndryshua në ${ROLE_STYLE[newRole]?.label}!`)
    } catch { showToast('Problem me lidhjen.', 'error') }
    finally  { setLoading(null) }
  }

  const filtered = local
    .filter(u => roleFilter === 'all' || u.role === roleFilter)
    .filter(u => pkgFilter  === 'all' || (pkgFilter === 'premium' ? u.package_type !== 'free' : u.package_type === 'free'))
    .filter(u =>
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.city || '').toLowerCase().includes(search.toLowerCase())
    )

  const roleCounts: Record<string, number> = { all: local.length }
  ROLES.forEach(r => { roleCounts[r] = local.filter(u => u.role === r).length })

  return (
    <div>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        .user-row:hover   { background:rgba(255,255,255,0.03)!important; }
      `}</style>

      {toast && (
        <div style={{ position:'fixed', top:20, right:20, zIndex:700, padding:'14px 22px', borderRadius:13, fontSize:14, fontWeight:600, animation:'fadeUp 0.3s ease', boxShadow:'0 12px 40px rgba(0,0,0,0.5)', background: toast.type==='success' ? 'rgba(34,211,165,0.1)' : 'rgba(239,68,68,0.1)', border:`1px solid ${toast.type==='success' ? 'rgba(34,211,165,0.3)' : 'rgba(239,68,68,0.3)'}`, color: toast.type==='success' ? '#22d3a5' : '#fca5a5' }}>
          {toast.type==='success' ? '✓' : '⚠️'} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'1.9rem', fontWeight:900, letterSpacing:'-0.03em', marginBottom:6 }}>Përdoruesit</h1>
        <p style={{ fontSize:14, color:'rgba(232,234,240,0.45)' }}>{local.length} përdorues gjithsej · {local.filter(u=>u.package_type!=='free').length} premium</p>
      </div>

      {/* Role stat pills */}
      <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' as const }}>
        {[{ key:'all', label:'Të gjithë', col:'#e8621a' }, ...ROLES.map(r => ({ key:r, ...ROLE_STYLE[r] }))].map(r => (
          <button key={r.key} onClick={() => setRoleFilter(r.key)}
            style={{ padding:'8px 16px', borderRadius:10, border:`1px solid ${roleFilter===r.key ? r.col : 'rgba(255,255,255,0.08)'}`, background: roleFilter===r.key ? `${r.col}18` : 'rgba(255,255,255,0.03)', color: roleFilter===r.key ? r.col : 'rgba(232,234,240,0.45)', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s', display:'flex', alignItems:'center', gap:6 }}>
            {'icon' in r && r.icon} {r.label} <span style={{ opacity:0.6 }}>({roleCounts[r.key] || 0})</span>
          </button>
        ))}
        <div style={{ marginLeft:'auto', display:'flex', gap:6 }}>
          {[{ k:'all', l:'Të gjitha paketa' },{ k:'premium', l:'💎 Premium' },{ k:'free', l:'Falas' }].map(p => (
            <button key={p.k} onClick={() => setPkgFilter(p.k)}
              style={{ padding:'8px 14px', borderRadius:10, border:`1px solid ${pkgFilter===p.k ? '#fbbf24' : 'rgba(255,255,255,0.08)'}`, background: pkgFilter===p.k ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.03)', color: pkgFilter===p.k ? '#fbbf24' : 'rgba(232,234,240,0.4)', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s' }}>
              {p.l}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div style={{ position:'relative' as const, marginBottom:20 }}>
        <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', opacity:0.35 }}>🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Kërko emër, email, qytet..."
          style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:11, padding:'10px 14px 10px 36px', fontSize:13, color:'#e8eaf0', fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }} />
      </div>

      {/* Table */}
      <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, overflow:'hidden' }}>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1.2fr 100px 100px 120px', gap:12, padding:'12px 20px', borderBottom:'1px solid rgba(255,255,255,0.07)', fontSize:11, fontWeight:700, color:'rgba(232,234,240,0.3)', textTransform:'uppercase' as const, letterSpacing:'0.07em' }}>
          <span>Përdoruesi</span><span>Kontakti</span>
          <span style={{ textAlign:'center' as const }}>Paketa</span>
          <span style={{ textAlign:'center' as const }}>Anëtar që</span>
          <span style={{ textAlign:'center' as const }}>Roli</span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px', color:'rgba(232,234,240,0.3)' }}>
            <div style={{ fontSize:42, marginBottom:12 }}>👥</div>
            <div style={{ fontFamily:"'Fraunces',serif", fontWeight:800 }}>Nuk ka përdorues</div>
          </div>
        ) : filtered.map((user, i) => {
          const rs      = ROLE_STYLE[user.role] || ROLE_STYLE.client
          const isMe    = user.id === currentAdminId
          const editing = editRole === user.id

          return (
            <div key={user.id} className="user-row"
              style={{ display:'grid', gridTemplateColumns:'2fr 1.2fr 100px 100px 120px', gap:12, padding:'14px 20px', borderBottom: i < filtered.length-1 ? '1px solid rgba(255,255,255,0.05)' : 'none', alignItems:'center', transition:'background 0.15s', animation:`fadeUp 0.3s ease ${i*0.03}s both`, background: isMe ? 'rgba(167,139,250,0.03)' : 'transparent' }}>

              {/* User */}
              <div style={{ display:'flex', gap:11, alignItems:'center', minWidth:0 }}>
                <div style={{ width:40, height:40, borderRadius:13, background:`linear-gradient(135deg,${rs.col},${rs.col}99)`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:14, color:'#fff', flexShrink:0 }}>
                  {user.full_name.slice(0,2).toUpperCase()}
                </div>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:13, display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
                    <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' as const }}>{user.full_name}</span>
                    {isMe && <span style={{ fontSize:9, fontWeight:800, color:'#a78bfa', background:'rgba(167,139,250,0.15)', border:'1px solid rgba(167,139,250,0.25)', borderRadius:5, padding:'1px 6px', flexShrink:0 }}>TU</span>}
                    {user.package_type !== 'free' && <span style={{ fontSize:9, color:'#fbbf24', flexShrink:0 }}>💎</span>}
                  </div>
                  {user.city && <div style={{ fontSize:11, color:'rgba(232,234,240,0.35)' }}>📍 {user.city}</div>}
                </div>
              </div>

              {/* Contact */}
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:12, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' as const, color:'rgba(232,234,240,0.7)' }}>{user.email}</div>
                {user.phone && <div style={{ fontSize:11, color:'rgba(232,234,240,0.35)', marginTop:2 }}>📞 {user.phone}</div>}
              </div>

              {/* Package */}
              <div style={{ textAlign:'center' as const }}>
                <span style={{ fontSize:11, fontWeight:700, color: user.package_type !== 'free' ? '#fbbf24' : 'rgba(232,234,240,0.4)', background: user.package_type !== 'free' ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.04)', border:`1px solid ${user.package_type !== 'free' ? 'rgba(251,191,36,0.25)' : 'rgba(255,255,255,0.08)'}`, borderRadius:7, padding:'3px 10px' }}>
                  {user.package_type !== 'free' ? '💎 Premium' : 'Falas'}
                </span>
              </div>

              {/* Date */}
              <div style={{ textAlign:'center' as const, fontSize:12, color:'rgba(232,234,240,0.4)' }}>
                {timeAgo(user.created_at)}
              </div>

              {/* Role editor */}
              <div style={{ display:'flex', justifyContent:'center' }}>
                {editing ? (
                  <div style={{ display:'flex', flexDirection:'column', gap:4, position:'relative', zIndex:10 } as any}>
                    {ROLES.map(r => (
                      <button key={r} onClick={() => changeRole(user.id, r)} disabled={loading === user.id}
                        style={{ padding:'5px 12px', borderRadius:7, border:`1px solid ${ROLE_STYLE[r].col}30`, background: user.role === r ? `${ROLE_STYLE[r].col}18` : 'rgba(255,255,255,0.04)', color: user.role === r ? ROLE_STYLE[r].col : 'rgba(232,234,240,0.6)', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit', textAlign:'left' as const, display:'flex', alignItems:'center', gap:5 }}>
                        {ROLE_STYLE[r].icon} {ROLE_STYLE[r].label}
                        {user.role === r && <span style={{ marginLeft:'auto', fontSize:9 }}>✓</span>}
                      </button>
                    ))}
                    <button onClick={() => setEditRole(null)} style={{ padding:'4px', borderRadius:6, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.04)', color:'rgba(232,234,240,0.4)', fontSize:11, cursor:'pointer', fontFamily:'inherit' }}>✕ Mbyll</button>
                  </div>
                ) : (
                  <button onClick={() => !isMe && setEditRole(user.id)} disabled={isMe}
                    style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:9, border:`1px solid ${rs.col}30`, background:`${rs.col}12`, color:rs.col, fontSize:11, fontWeight:700, cursor: isMe ? 'not-allowed' : 'pointer', fontFamily:'inherit', transition:'all 0.2s', opacity: loading===user.id ? 0.5 : 1 }}>
                    {loading === user.id
                      ? <div style={{ width:10, height:10, border:'2px solid rgba(255,255,255,0.2)', borderTop:'2px solid currentColor', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
                      : rs.icon
                    }
                    {rs.label}
                    {!isMe && <span style={{ opacity:0.5, fontSize:9 }}>▾</span>}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer count */}
      <div style={{ marginTop:14, fontSize:12, color:'rgba(232,234,240,0.3)', textAlign:'center' as const }}>
        Duke shfaqur {filtered.length} nga {local.length} përdorues
      </div>
    </div>
  )
}