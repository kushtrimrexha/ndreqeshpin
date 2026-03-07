'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

type Role = 'client' | 'company' | 'worker' | 'admin'

interface SidebarProps {
  role:      Role
  userName:  string
  userCity?: string
  unread?:   number
  package?:  string
}

const NAV: Record<Role, { icon: string; label: string; href: string }[]> = {
  client: [
    { icon: '⊞',  label: 'Dashboard',        href: '/client/dashboard'      },
    { icon: '📋', label: 'Aplikimet e mia',   href: '/client/applications'   },
    { icon: '💼', label: 'Ofertat',           href: '/client/offers'         },
    { icon: '💬', label: 'Mesazhet',          href: '/client/messages'       },
    { icon: '⭐', label: 'Vlerësimet',        href: '/client/reviews'        },
    { icon: '👤', label: 'Profili im',        href: '/client/profile'        },
  ],
  company: [
    { icon: '⊞',  label: 'Dashboard',        href: '/company/dashboard'     },
    { icon: '📋', label: 'Aplikimet',         href: '/company/applications'  },
    { icon: '💼', label: 'Ofertat e mia',     href: '/company/offers'        },
    { icon: '💬', label: 'Mesazhet',          href: '/company/messages'      },
    { icon: '📊', label: 'Statistikat',       href: '/company/stats'         },
    { icon: '🏢', label: 'Profili i biznesit',href: '/company/profile'       },
  ],
  worker: [
    { icon: '⊞',  label: 'Dashboard',        href: '/worker/dashboard'      },
    { icon: '📋', label: 'Aplikimet',         href: '/worker/applications'   },
    { icon: '💼', label: 'Ofertat e mia',     href: '/worker/offers'         },
    { icon: '💬', label: 'Mesazhet',          href: '/worker/messages'       },
    { icon: '⭐', label: 'Vlerësimet',        href: '/worker/reviews'        },
    { icon: '👤', label: 'Profili im',        href: '/worker/profile'        },
  ],
  admin: [
    { icon: '⊞',  label: 'Overview',         href: '/admin/dashboard'       },
    { icon: '🏢', label: 'Kompanitë',         href: '/admin/companies'       },
    { icon: '👥', label: 'Përdoruesit',       href: '/admin/users'           },
    { icon: '📋', label: 'Aplikimet',         href: '/admin/applications'    },
    { icon: '💼', label: 'Ofertat',           href: '/admin/offers'          },
    { icon: '📊', label: 'Statistikat',       href: '/admin/stats'           },
    { icon: '⚙️', label: 'Cilësimet',         href: '/admin/settings'        },
  ],
}

const ROLE_META: Record<Role, { label: string; color: string; bg: string }> = {
  client:  { label: 'Klient',  color: '#3b82f6', bg: 'rgba(59,130,246,0.12)'  },
  company: { label: 'Kompani', color: '#e8621a', bg: 'rgba(232,98,26,0.12)'   },
  worker:  { label: 'Punëtor', color: '#10b981', bg: 'rgba(16,185,129,0.12)'  },
  admin:   { label: 'Admin',   color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
}

export default function Sidebar({ role, userName, unread = 0, package: pkg = 'free' }: SidebarProps) {
  const router   = useRouter()
  const pathname = usePathname()
  const [collapsed,   setCollapsed]   = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [loggingOut,  setLoggingOut]  = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [isMobile,    setIsMobile]    = useState(false)

  const meta      = ROLE_META[role]
  const navItems  = NAV[role] || []
  const isPremium = pkg === 'premium' || pkg === 'enterprise'
  const initials  = userName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Close mobile on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  async function handleLogout() {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isCollapsed = isMobile ? false : collapsed
  const sidebarWidth = isCollapsed ? 68 : 240

  const SidebarContent = () => (
    <aside style={{
      width: sidebarWidth,
      height: '100%',
      background: '#0a0908',
      borderRight: isMobile ? 'none' : '1px solid rgba(240,236,228,0.07)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
      fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
      color: '#f0ece4',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Fraunces:ital,wght@0,700;0,900;1,300&display=swap');
        @keyframes fadeIn  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes slideIn { from{transform:translateX(-100%)} to{transform:translateX(0)} }
        .s-nav-item { transition: all 0.15s !important; }
        .s-nav-item:hover { background: rgba(240,236,228,0.06) !important; color: #f0ece4 !important; }
        .s-nav-active { background: rgba(232,98,26,0.1) !important; color: #f0ece4 !important; border-left-color: #e8621a !important; }
        .s-logout:hover { background: rgba(239,68,68,0.08) !important; color: #ef4444 !important; }
        .s-collapse:hover { background: rgba(240,236,228,0.08) !important; }
        .s-upgrade:hover { opacity:0.85 !important; }
        .s-profile-link:hover { background: rgba(240,236,228,0.06) !important; }
      `}</style>

      {/* ── LOGO ─────────────────────────── */}
      <div style={{ height:60, display:'flex', alignItems:'center', padding: isCollapsed ? '0 14px' : '0 16px', borderBottom:'1px solid rgba(240,236,228,0.07)', justifyContent: isCollapsed ? 'center' : 'space-between', flexShrink:0 }}>
        <Link href={`/${role}/dashboard`} style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none', overflow:'hidden' }}>
          <div style={{ width:32, height:32, flexShrink:0, background:'linear-gradient(135deg,#e8621a,#ff8c4a)', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Fraunces',serif", fontWeight:900, color:'#fff', fontSize:16, boxShadow:'0 4px 12px rgba(232,98,26,0.3)' }}>N</div>
          {!isCollapsed && <span style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:16, letterSpacing:'-0.02em', whiteSpace:'nowrap' }}>Ndreqe <span style={{ color:'#e8621a' }}>Shpin</span></span>}
        </Link>
        {!isCollapsed && !isMobile && (
          <button onClick={() => setCollapsed(true)} className="s-collapse" style={{ width:28, height:28, borderRadius:7, background:'rgba(240,236,228,0.04)', border:'1px solid rgba(240,236,228,0.08)', color:'rgba(240,236,228,0.4)', cursor:'pointer', fontSize:11, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>◀</button>
        )}
        {isMobile && (
          <button onClick={() => setMobileOpen(false)} style={{ width:32, height:32, borderRadius:8, background:'rgba(240,236,228,0.06)', border:'1px solid rgba(240,236,228,0.1)', color:'rgba(240,236,228,0.6)', cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        )}
      </div>

      {/* Expand btn when collapsed desktop */}
      {isCollapsed && !isMobile && (
        <button onClick={() => setCollapsed(false)} className="s-collapse" style={{ margin:'10px auto 0', width:36, height:28, borderRadius:7, background:'rgba(240,236,228,0.04)', border:'1px solid rgba(240,236,228,0.08)', color:'rgba(240,236,228,0.4)', cursor:'pointer', fontSize:11, display:'flex', alignItems:'center', justifyContent:'center' }}>▶</button>
      )}

      {/* ── PROFILE CARD ─────────────────── */}
      {!isCollapsed && (
        <div style={{ margin:'12px 12px 4px', padding:'12px', background:'rgba(240,236,228,0.03)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:14, cursor:'pointer', flexShrink:0 }}
          onClick={() => setShowProfile(p => !p)}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:38, height:38, borderRadius:10, flexShrink:0, background:`linear-gradient(135deg,${meta.color}cc,${meta.color})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:800, color:'#fff', boxShadow:`0 4px 12px ${meta.color}30` }}>{initials}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:700, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{userName}</div>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:2 }}>
                <span style={{ fontSize:10, fontWeight:700, color:meta.color, background:meta.bg, border:`1px solid ${meta.color}30`, borderRadius:100, padding:'1px 7px' }}>{meta.label}</span>
                {isPremium && <span style={{ fontSize:10 }}>💎</span>}
              </div>
            </div>
            <span style={{ fontSize:10, color:'rgba(240,236,228,0.3)', transition:'transform 0.2s', display:'block', transform: showProfile ? 'rotate(180deg)' : 'none' }}>▼</span>
          </div>
          {showProfile && (
            <div style={{ marginTop:10, paddingTop:10, borderTop:'1px solid rgba(240,236,228,0.07)', display:'flex', flexDirection:'column', gap:2, animation:'fadeIn 0.15s ease' }}>
              {[{ icon:'👤', label:'Profili im', href:`/${role}/profile` },{ icon:'⚙️', label:'Cilësimet', href:`/${role}/settings` },{ icon:'💎', label:'Premium', href:'/pricing' }].map(item => (
                <Link key={item.href} href={item.href} className="s-profile-link" onClick={() => setShowProfile(false)}
                  style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 8px', borderRadius:8, fontSize:12, color:'rgba(240,236,228,0.6)', textDecoration:'none', borderRadius:8 }}>
                  <span style={{ fontSize:13 }}>{item.icon}</span>{item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
      {isCollapsed && (
        <div style={{ display:'flex', justifyContent:'center', margin:'12px 0 4px' }}>
          <div style={{ width:38, height:38, borderRadius:10, background:`linear-gradient(135deg,${meta.color}cc,${meta.color})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:800, color:'#fff' }}>{initials}</div>
        </div>
      )}

      {/* ── NAV ──────────────────────────── */}
      <nav style={{ flex:1, padding:'8px 10px', display:'flex', flexDirection:'column', gap:2, overflowY:'auto', overflowX:'hidden' }}>
        {!isCollapsed && <div style={{ fontSize:10, fontWeight:700, color:'rgba(240,236,228,0.25)', textTransform:'uppercase', letterSpacing:'0.1em', padding:'6px 8px 4px', marginTop:4 }}>Menuja</div>}
        {navItems.map(item => {
          const isActive   = pathname === item.href || pathname.startsWith(item.href + '/')
          const isMessages = item.href.includes('messages')
          return (
            <Link key={item.href} href={item.href} title={isCollapsed ? item.label : undefined}
              className={`s-nav-item ${isActive ? 's-nav-active' : ''}`}
              style={{ display:'flex', alignItems:'center', gap:10, padding: isCollapsed ? '10px 0' : '10px 10px', justifyContent: isCollapsed ? 'center' : 'flex-start', borderRadius:10, textDecoration:'none', color: isActive ? '#f0ece4' : 'rgba(240,236,228,0.5)', fontWeight: isActive ? 700 : 500, fontSize:13, position:'relative', borderLeft: isActive ? '2px solid #e8621a' : '2px solid transparent' }}>
              {isActive && !isCollapsed && <div style={{ position:'absolute', right:10, width:6, height:6, borderRadius:'50%', background:'#e8621a' }} />}
              <span style={{ fontSize:17, flexShrink:0, width:20, textAlign:'center' }}>{item.icon}</span>
              {!isCollapsed && <span style={{ whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', flex:1 }}>{item.label}</span>}
              {!isCollapsed && isMessages && unread > 0 && <span style={{ background:'#e8621a', color:'#fff', fontSize:10, fontWeight:800, padding:'1px 6px', borderRadius:100, minWidth:18, textAlign:'center', flexShrink:0 }}>{unread > 9 ? '9+' : unread}</span>}
              {isCollapsed && isMessages && unread > 0 && <div style={{ position:'absolute', top:6, right:6, width:8, height:8, borderRadius:'50%', background:'#e8621a' }} />}
            </Link>
          )
        })}
      </nav>

      {/* ── BOTTOM ───────────────────────── */}
      <div style={{ padding:'10px', borderTop:'1px solid rgba(240,236,228,0.07)', display:'flex', flexDirection:'column', gap:6, flexShrink:0 }}>
        {!isCollapsed && !isPremium && (
          <Link href="/pricing" className="s-upgrade" style={{ display:'block', padding:'12px 14px', background:'linear-gradient(135deg,rgba(232,98,26,0.15),rgba(232,98,26,0.08))', border:'1px solid rgba(232,98,26,0.25)', borderRadius:12, textDecoration:'none', marginBottom:4 }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#f0ece4', marginBottom:3 }}>💎 Kalo në Premium</div>
            <div style={{ fontSize:11, color:'rgba(240,236,228,0.45)', lineHeight:1.5 }}>Aplikime të pakufizuara</div>
          </Link>
        )}
        <Link href={`/${role}/notifications`} className="s-nav-item"
          style={{ display:'flex', alignItems:'center', gap:10, padding: isCollapsed ? '10px 0' : '10px 10px', justifyContent: isCollapsed ? 'center' : 'flex-start', borderRadius:10, textDecoration:'none', color:'rgba(240,236,228,0.5)', fontSize:13, fontWeight:500, position:'relative' }}>
          <span style={{ fontSize:17, flexShrink:0, width:20, textAlign:'center' }}>🔔</span>
          {!isCollapsed && <span style={{ flex:1 }}>Njoftimet</span>}
          {unread > 0 && !isCollapsed && <span style={{ background:'#e8621a', color:'#fff', fontSize:10, fontWeight:800, padding:'1px 6px', borderRadius:100 }}>{unread > 9 ? '9+' : unread}</span>}
          {unread > 0 && isCollapsed && <div style={{ position:'absolute', top:6, right:6, width:8, height:8, borderRadius:'50%', background:'#e8621a' }} />}
        </Link>
        <button onClick={handleLogout} disabled={loggingOut} className="s-logout"
          style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding: isCollapsed ? '10px 0' : '10px 10px', justifyContent: isCollapsed ? 'center' : 'flex-start', borderRadius:10, border:'none', background:'transparent', color: loggingOut ? 'rgba(240,236,228,0.3)' : 'rgba(240,236,228,0.45)', cursor: loggingOut ? 'not-allowed' : 'pointer', fontSize:13, fontWeight:500, fontFamily:'inherit' }}>
          {loggingOut ? <><div style={{ width:16, height:16, border:'2px solid rgba(240,236,228,0.15)', borderTop:'2px solid rgba(240,236,228,0.5)', borderRadius:'50%', animation:'spin 0.8s linear infinite', flexShrink:0 }} />{!isCollapsed && <span>Duke dalë...</span>}</> : <><span style={{ fontSize:17, flexShrink:0, width:20, textAlign:'center' }}>🚪</span>{!isCollapsed && <span>Dil nga llogaria</span>}</>}
        </button>
      </div>
    </aside>
  )

  if (isMobile) {
    return (
      <>
        {/* Mobile topbar */}
        <div style={{ position:'fixed', top:0, left:0, right:0, height:56, background:'rgba(10,9,8,0.95)', backdropFilter:'blur(16px)', borderBottom:'1px solid rgba(240,236,228,0.07)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 16px', zIndex:200, fontFamily:"'DM Sans',sans-serif" }}>
          <button onClick={() => setMobileOpen(true)} style={{ width:38, height:38, borderRadius:10, background:'rgba(240,236,228,0.06)', border:'1px solid rgba(240,236,228,0.1)', color:'rgba(240,236,228,0.7)', cursor:'pointer', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center' }}>☰</button>
          <Link href={`/${role}/dashboard`} style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:16, letterSpacing:'-0.02em', textDecoration:'none', color:'#f0ece4' }}>Ndreqe<span style={{ color:'#e8621a' }}>Shpin</span></Link>
          <Link href={`/${role}/notifications`} style={{ width:38, height:38, borderRadius:10, background:'rgba(240,236,228,0.06)', border:'1px solid rgba(240,236,228,0.1)', display:'flex', alignItems:'center', justifyContent:'center', textDecoration:'none', fontSize:18, position:'relative' }}>
            🔔
            {unread > 0 && <div style={{ position:'absolute', top:6, right:6, width:8, height:8, borderRadius:'50%', background:'#e8621a' }} />}
          </Link>
        </div>

        {/* Mobile drawer overlay */}
        {mobileOpen && (
          <>
            <div onClick={() => setMobileOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:299, backdropFilter:'blur(4px)' }} />
            <div style={{ position:'fixed', top:0, left:0, bottom:0, width:260, zIndex:300, animation:'slideIn 0.25s cubic-bezier(0.4,0,0.2,1)' }}>
              <SidebarContent />
            </div>
          </>
        )}

        {/* Spacer for topbar */}
        <div style={{ height:56, flexShrink:0 }} />
      </>
    )
  }

  return <SidebarContent />
}