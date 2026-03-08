'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface Notification {
  id: string; type: string; title: string; message: string
  is_read: boolean; created_at: string; data?: string
}
interface Props { initialNotifications: Notification[]; userId?: string }

const TYPE_META: Record<string, { icon: string; col: string; bg: string }> = {
  offer_accepted:     { icon: '✅', col: '#22d3a5', bg: 'rgba(34,211,165,0.08)'  },
  offer_rejected:     { icon: '❌', col: '#f87171', bg: 'rgba(248,113,113,0.08)' },
  new_offer:          { icon: '💼', col: '#e8621a', bg: 'rgba(232,98,26,0.08)'   },
  account_verified:   { icon: '🏆', col: '#fbbf24', bg: 'rgba(251,191,36,0.08)'  },
  account_unverified: { icon: '⚠️', col: '#f87171', bg: 'rgba(248,113,113,0.08)' },
  new_message:        { icon: '💬', col: '#60a5fa', bg: 'rgba(96,165,250,0.08)'  },
  new_review:         { icon: '⭐', col: '#fbbf24', bg: 'rgba(251,191,36,0.08)'  },
  new_application:    { icon: '📋', col: '#a78bfa', bg: 'rgba(167,139,250,0.08)' },
  welcome:            { icon: '👋', col: '#22d3a5', bg: 'rgba(34,211,165,0.08)'  },
  default:            { icon: '🔔', col: '#a78bfa', bg: 'rgba(167,139,250,0.08)' },
}

function timeAgo(d: string) {
  const diff  = Date.now() - new Date(d).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins  < 1)  return 'Tani'
  if (mins  < 60) return `${mins} min më parë`
  if (hours < 24) return `${hours} orë më parë`
  if (days  < 7)  return `${days} ditë më parë`
  return new Date(d).toLocaleDateString('sq-AL', { day:'numeric', month:'long' })
}

function groupByDay(notifs: Notification[]) {
  const groups: { label: string; items: Notification[] }[] = []
  notifs.forEach(n => {
    const d    = new Date(n.created_at)
    const now  = new Date()
    const diff = Math.floor((now.getTime() - d.getTime()) / 86_400_000)
    const label = diff === 0 ? 'Sot' : diff === 1 ? 'Dje' : d.toLocaleDateString('sq-AL', { weekday:'long', day:'numeric', month:'long' })
    const last  = groups[groups.length - 1]
    if (last && last.label === label) last.items.push(n)
    else groups.push({ label, items: [n] })
  })
  return groups
}

export default function NotificationsClient({ initialNotifications, userId }: Props) {
  const supabase   = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [notifs,   setNotifs]   = useState<Notification[]>(initialNotifications)
  const [filter,   setFilter]   = useState<'all'|'unread'|string>('all')
  const [loading,  setLoading]  = useState<string | null>(null)
  const [newPulse, setNewPulse] = useState(false)

  // Real-time new notifications
  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel('notifications-page')
      .on('postgres_changes', { event:'INSERT', schema:'public', table:'notifications', filter:`user_id=eq.${userId}` },
        (payload) => {
          setNotifs(prev => [payload.new as Notification, ...prev])
          setNewPulse(true)
          setTimeout(() => setNewPulse(false), 3000)
        })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId])

  const unreadCount = notifs.filter(n => !n.is_read).length
  const types       = Array.from(new Set(notifs.map(n => n.type))).filter(Boolean)

  const filtered = notifs.filter(n => {
    if (filter === 'unread') return !n.is_read
    if (filter !== 'all')    return n.type === filter
    return true
  })

  const groups = groupByDay(filtered)

  async function markRead(id: string) {
    setLoading(id)
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    await fetch('/api/notifications/read', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ids:[id] }) })
    setLoading(null)
  }

  async function markAllRead() {
    setLoading('all')
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })))
    await fetch('/api/notifications/read', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ all:true }) })
    setLoading(null)
  }

  async function deleteNotif(id: string) {
    setNotifs(prev => prev.filter(n => n.id !== id))
    await supabase.from('notifications').delete().eq('id', id)
  }

  return (
    <div>
      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes pulse   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.85)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
        @keyframes glow    { 0%,100%{box-shadow:0 0 0 0 rgba(232,98,26,0.4)} 50%{box-shadow:0 0 0 8px rgba(232,98,26,0)} }
        .notif-card:hover .notif-actions { opacity:1!important; }
        .notif-card:hover { border-color:rgba(240,236,228,0.12)!important; }
        .del-btn:hover { color:#f87171!important; background:rgba(248,113,113,0.1)!important; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28, animation:'fadeUp 0.5s ease' }}>
        <div>
          <p style={{ fontSize:11, fontWeight:700, color:'rgba(240,236,228,0.3)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:8 }}>Qendra e njoftimeve</p>
          <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(1.4rem,3vw,1.9rem)', fontWeight:900, letterSpacing:'-0.03em', marginBottom:8, display:'flex', alignItems:'center', gap:12 }}>
            Njoftimet
            {unreadCount > 0 && (
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:800, color:'#e8621a', background:'rgba(232,98,26,0.12)', border:'1px solid rgba(232,98,26,0.25)', borderRadius:20, padding:'3px 12px', animation: newPulse ? 'glow 0.6s ease' : 'none' }}>
                {unreadCount} të reja
              </span>
            )}
          </h1>
          <p style={{ fontSize:14, color:'rgba(240,236,228,0.4)' }}>{notifs.length} njoftime gjithsej</p>
        </div>

        {unreadCount > 0 && (
          <button onClick={markAllRead} disabled={loading === 'all'}
            style={{ padding:'10px 18px', borderRadius:11, background:'rgba(240,236,228,0.05)', border:'1px solid rgba(240,236,228,0.1)', color:'rgba(240,236,228,0.6)', fontFamily:'inherit', fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:7, transition:'all 0.2s', whiteSpace:'nowrap' }}>
            {loading === 'all'
              ? <><div style={{ width:12, height:12, border:'2px solid rgba(255,255,255,0.2)', borderTop:'2px solid #fff', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>Duke shënuar...</>
              : '✓ Shëno të gjitha si të lexuara'}
          </button>
        )}
      </div>

      {/* ── Filter bar ── */}
      <div style={{ display:'flex', gap:8, marginBottom:24, flexWrap:'wrap', animation:'fadeUp 0.5s ease 0.1s both' }}>
        <div style={{ display:'flex', gap:4, background:'rgba(240,236,228,0.04)', padding:4, borderRadius:12, border:'1px solid rgba(240,236,228,0.07)' }}>
          {(['all','unread'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding:'8px 16px', borderRadius:9, border:'none', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', background:filter===f?'#e8621a':'transparent', color:filter===f?'#fff':'rgba(240,236,228,0.45)', transition:'all 0.2s', whiteSpace:'nowrap' }}>
              {f === 'all' ? `Të gjitha (${notifs.length})` : `Të palexuara (${unreadCount})`}
            </button>
          ))}
        </div>

        {/* Type filters */}
        <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
          {types.slice(0,5).map(t => {
            const m = TYPE_META[t] || TYPE_META.default
            return (
              <button key={t} onClick={() => setFilter(filter === t ? 'all' : t)}
                style={{ padding:'8px 14px', borderRadius:9, border:`1px solid ${filter===t ? m.col : 'rgba(240,236,228,0.07)'}`, background:filter===t ? `${m.col}15` : 'rgba(240,236,228,0.03)', color:filter===t ? m.col : 'rgba(240,236,228,0.4)', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:5 }}>
                {m.icon} {t.replace(/_/g,' ')}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Stats row ── */}
      {notifs.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:10, marginBottom:24, animation:'fadeUp 0.5s ease 0.15s both' }}>
          {[
            { icon:'🔔', label:'Gjithsej',     val:notifs.length,    col:'#a78bfa' },
            { icon:'📭', label:'Të palexuara', val:unreadCount,      col:'#e8621a' },
            { icon:'✅', label:'Të lexuara',   val:notifs.length - unreadCount, col:'#22d3a5' },
          ].map((s,i) => (
            <div key={i} style={{ padding:'14px 18px', background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:14 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                <span style={{ fontSize:16 }}>{s.icon}</span>
                <span style={{ fontSize:11, color:'rgba(240,236,228,0.4)', fontWeight:600 }}>{s.label}</span>
              </div>
              <div style={{ fontFamily:"'Fraunces',serif", fontSize:'1.6rem', fontWeight:900, color:s.col, lineHeight:1 }}>{s.val}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Notification groups ── */}
      {filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'80px 20px', animation:'fadeUp 0.5s ease' }}>
          <div style={{ width:80, height:80, borderRadius:24, background:'rgba(240,236,228,0.03)', border:'1px solid rgba(240,236,228,0.07)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:40, margin:'0 auto 20px' }}>🔔</div>
          <div style={{ fontFamily:"'Fraunces',serif", fontSize:'1.2rem', fontWeight:900, marginBottom:10 }}>
            {filter === 'unread' ? 'Asgjë pa lexuar!' : 'Nuk ka njoftime'}
          </div>
          <p style={{ fontSize:13, color:'rgba(240,236,228,0.35)', lineHeight:1.7 }}>
            {filter === 'unread' ? 'Të gjitha njoftimet janë lexuar. Bravo! 🎉' : 'Njoftimet do të shfaqen këtu automatikisht.'}
          </p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
          {groups.map((group, gi) => (
            <div key={group.label} style={{ animation:`fadeUp 0.4s ease ${gi * 0.05}s both` }}>
              {/* Day label */}
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                <span style={{ fontSize:11, fontWeight:800, color:'rgba(240,236,228,0.3)', textTransform:'uppercase', letterSpacing:'0.1em', whiteSpace:'nowrap' }}>{group.label}</span>
                <div style={{ flex:1, height:1, background:'rgba(240,236,228,0.06)' }}/>
                <span style={{ fontSize:11, color:'rgba(240,236,228,0.2)', whiteSpace:'nowrap' }}>{group.items.length}</span>
              </div>

              {/* Items */}
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {group.items.map((n, i) => {
                  const meta = TYPE_META[n.type] || TYPE_META.default
                  return (
                    <div key={n.id} className="notif-card"
                      style={{ padding:'16px 20px', background:n.is_read ? 'rgba(240,236,228,0.02)' : meta.bg, border:`1px solid ${n.is_read ? 'rgba(240,236,228,0.07)' : `${meta.col}25`}`, borderRadius:16, display:'flex', alignItems:'flex-start', gap:14, position:'relative', transition:'all 0.2s', animation:`slideIn 0.3s ease ${i * 0.04}s both` }}>

                      {/* Unread indicator */}
                      {!n.is_read && (
                        <div style={{ position:'absolute', top:18, right:18, width:8, height:8, borderRadius:'50%', background:meta.col, boxShadow:`0 0 8px ${meta.col}`, animation:'pulse 2s ease infinite' }}/>
                      )}

                      {/* Icon */}
                      <div style={{ width:44, height:44, borderRadius:13, background:`${meta.col}15`, border:`1px solid ${meta.col}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
                        {meta.icon}
                      </div>

                      {/* Content */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:700, fontSize:14, marginBottom:5, color:n.is_read ? 'rgba(240,236,228,0.7)' : '#f0ece4' }}>{n.title}</div>
                        <p style={{ fontSize:13, color:'rgba(240,236,228,0.5)', lineHeight:1.65, marginBottom:8 }}>{n.message}</p>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <span style={{ fontSize:11, color:'rgba(240,236,228,0.3)', fontWeight:600 }}>🕐 {timeAgo(n.created_at)}</span>
                          {!n.is_read && (
                            <span style={{ fontSize:11, fontWeight:700, color:meta.col, background:`${meta.col}12`, borderRadius:20, padding:'2px 8px' }}>E re</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="notif-actions" style={{ display:'flex', gap:4, flexShrink:0, opacity:0, transition:'opacity 0.2s' }}>
                        {!n.is_read && (
                          <button onClick={() => markRead(n.id)} disabled={loading === n.id}
                            style={{ padding:'6px 12px', borderRadius:8, background:'rgba(240,236,228,0.06)', border:'1px solid rgba(240,236,228,0.1)', color:'rgba(240,236,228,0.5)', fontFamily:'inherit', fontSize:11, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.15s' }}>
                            {loading === n.id ? '...' : '✓ Lexo'}
                          </button>
                        )}
                        <button onClick={() => deleteNotif(n.id)} className="del-btn"
                          style={{ width:30, height:30, borderRadius:8, background:'rgba(240,236,228,0.04)', border:'1px solid rgba(240,236,228,0.08)', color:'rgba(240,236,228,0.3)', fontFamily:'inherit', fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s' }}>
                          ×
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}