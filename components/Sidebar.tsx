'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'

type Role = 'client' | 'company' | 'worker' | 'admin'

interface SidebarProps {
  role:      Role
  userName:  string
  userId?:   string
  userCity?: string
  avatar?:   string
  package?:  string
}

const NAV: Record<Role, { icon: string; label: string; href: string; exact?: boolean }[]> = {
  client: [
    { icon: '⊞',  label: 'Dashboard',         href: '/client/dashboard',    exact: true },
    { icon: '📋', label: 'Aplikimet e mia',    href: '/client/applications'  },
    { icon: '💼', label: 'Ofertat',            href: '/client/offers'        },
    { icon: '💬', label: 'Mesazhet',           href: '/client/messages'      },
    { icon: '⭐', label: 'Vlerësimet',         href: '/client/reviews'       },
    { icon: '👤', label: 'Profili im',         href: '/client/profile'       },
  ],
  company: [
    { icon: '⊞',  label: 'Dashboard',         href: '/company/dashboard',   exact: true },
    { icon: '📋', label: 'Aplikimet',          href: '/company/applications' },
    { icon: '💼', label: 'Ofertat e mia',      href: '/company/offers'       },
    { icon: '💬', label: 'Mesazhet',           href: '/company/messages'     },
    { icon: '📊', label: 'Statistikat',        href: '/company/stats'        },
    { icon: '⭐', label: 'Vlerësimet',         href: '/company/reviews'      },
    { icon: '🏢', label: 'Profili i biznesit', href: '/company/profile'      },
  ],
  worker: [
    { icon: '⊞',  label: 'Dashboard',         href: '/worker/dashboard',    exact: true },
    { icon: '📋', label: 'Aplikimet',          href: '/worker/applications'  },
    { icon: '💼', label: 'Ofertat e mia',      href: '/worker/offers'        },
    { icon: '💬', label: 'Mesazhet',           href: '/worker/messages'      },
    { icon: '📊', label: 'Statistikat',        href: '/worker/stats'         },
    { icon: '⭐', label: 'Vlerësimet',         href: '/worker/reviews'       },
    { icon: '👤', label: 'Profili im',         href: '/worker/profile'       },
  ],
  admin: [
    { icon: '⊞',  label: 'Overview',          href: '/admin/dashboard',     exact: true },
    { icon: '🏢', label: 'Kompanitë',          href: '/admin/companies'      },
    { icon: '👥', label: 'Përdoruesit',        href: '/admin/users'          },
    { icon: '📋', label: 'Aplikimet',          href: '/admin/applications'   },
    { icon: '💼', label: 'Ofertat',            href: '/admin/offers'         },
    { icon: '📊', label: 'Statistikat',        href: '/admin/stats'          },
    { icon: '⚙️', label: 'Cilësimet',          href: '/admin/settings'       },
  ],
}

const ROLE_META: Record<Role, { label: string; color: string; bg: string }> = {
  client:  { label: 'Klient',  color: '#3b82f6', bg: 'rgba(59,130,246,0.12)'  },
  company: { label: 'Kompani', color: '#e8621a', bg: 'rgba(232,98,26,0.12)'   },
  worker:  { label: 'Punëtor', color: '#10b981', bg: 'rgba(16,185,129,0.12)'  },
  admin:   { label: 'Admin',   color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
}

const TYPE_ICON: Record<string, string> = {
  offer: '💼', message: '💬', review: '⭐', payment: '💎', system: '🔔',
}

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return 'tani'
  if (s < 3600) return `${Math.floor(s / 60)} min`
  if (s < 86400) return `${Math.floor(s / 3600)} orë`
  return `${Math.floor(s / 86400)} dit`
}

export default function Sidebar({ role, userName, userId, avatar, package: pkg = 'free' }: SidebarProps) {
  const router   = useRouter()
  const pathname = usePathname()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [collapsed,    setCollapsed]    = useState(false)
  const [mobileOpen,   setMobileOpen]   = useState(false)
  const [loggingOut,   setLoggingOut]   = useState(false)
  const [showProfile,  setShowProfile]  = useState(false)
  const [isMobile,     setIsMobile]     = useState(false)
  const [unread,       setUnread]       = useState(0)
  const [notifOpen,    setNotifOpen]    = useState(false)
  const [notifs,       setNotifs]       = useState<any[]>([])
  const [notifsLoaded, setNotifsLoaded] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  const meta      = ROLE_META[role]
  const navItems  = NAV[role] || []
  const isPremium = pkg === 'premium' || pkg === 'enterprise'
  const initials  = userName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)

  // ── Real-time unread count ──────────────────────────────────────
  useEffect(() => {
    if (!userId) return
    supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)
      .then(({ count }) => setUnread(count || 0))

    const channel = supabase
      .channel(`sidebar-notifs-${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => { setUnread(p => p + 1); setNotifs(p => [payload.new, ...p].slice(0, 20)) })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        () => supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('is_read', false).then(({ count }) => setUnread(count || 0)))
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  // Click outside to close notif panel
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function openNotifPanel() {
    const next = !notifOpen
    setNotifOpen(next)
    if (next && !notifsLoaded) {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(15)
      setNotifs(data || [])
      setNotifsLoaded(true)
    }
    if (next && unread > 0) {
      setTimeout(async () => {
        await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false)
        setUnread(0)
        setNotifs(p => p.map(n => ({ ...n, is_read: true })))
      }, 1500)
    }
  }

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  async function handleLogout() {
    setLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function isActiveRoute(item: { href: string; exact?: boolean }) {
    return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + '/')
  }

  const isCollapsed  = isMobile ? false : collapsed
  const sidebarWidth = isCollapsed ? 68 : 240

  const NotifPanel = () => (
    <div style={{ position: 'absolute', bottom: '110%', left: isCollapsed ? 'calc(100% + 8px)' : 0, right: 0, width: isCollapsed ? 300 : 'auto', minWidth: 280, background: '#111010', border: '1px solid rgba(240,236,228,0.1)', borderRadius: 14, boxShadow: '0 20px 40px rgba(0,0,0,0.6)', animation: 'slideUp 0.2s ease', zIndex: 500, overflow: 'hidden' }}>
      <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(240,236,228,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#f0ece4' }}>Njoftimet {unread > 0 && <span style={{ color: '#e8621a' }}>({unread})</span>}</span>
        <Link href={`/${role}/notifications`} onClick={() => setNotifOpen(false)} style={{ fontSize: 11, color: '#e8621a', textDecoration: 'none', fontWeight: 600 }}>Të gjitha →</Link>
      </div>
      <div style={{ maxHeight: 320, overflowY: 'auto' }}>
        {notifs.length === 0 ? (
          <div style={{ padding: '24px 14px', textAlign: 'center', color: 'rgba(240,236,228,0.3)', fontSize: 12 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🔔</div>Asnjë njoftim ende
          </div>
        ) : notifs.map((n: any) => (
          <div key={n.id}
            onClick={() => { if (n.link) router.push(n.link); setNotifOpen(false) }}
            style={{ padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'flex-start', background: n.is_read ? 'transparent' : 'rgba(232,98,26,0.05)', borderBottom: '1px solid rgba(240,236,228,0.04)', cursor: 'pointer', transition: 'background 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = n.is_read ? 'rgba(240,236,228,0.04)' : 'rgba(232,98,26,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = n.is_read ? 'transparent' : 'rgba(232,98,26,0.05)')}>
            <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{TYPE_ICON[n.type] || '🔔'}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#f0ece4', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title}</span>
                {!n.is_read && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#e8621a', flexShrink: 0 }} />}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(240,236,228,0.45)', lineHeight: 1.5 }}>{n.message}</div>
              <div style={{ fontSize: 10, color: 'rgba(240,236,228,0.25)', marginTop: 4 }}>{timeAgo(n.created_at)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const SidebarContent = () => (
    <aside style={{ width: sidebarWidth, height: '100%', background: '#0a0908', borderRight: isMobile ? 'none' : '1px solid rgba(240,236,228,0.07)', display: 'flex', flexDirection: 'column', transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)', fontFamily: "'DM Sans','Helvetica Neue',sans-serif", color: '#f0ece4', overflow: 'hidden', flexShrink: 0 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Fraunces:ital,wght@0,700;0,900;1,300&display=swap');
        @keyframes fadeIn  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes slideIn { from{transform:translateX(-100%)} to{transform:translateX(0)} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .sn-item { transition: all 0.15s !important; }
        .sn-item:hover { background: rgba(240,236,228,0.06) !important; color: #f0ece4 !important; }
        .sn-active { background: rgba(232,98,26,0.1) !important; color: #f0ece4 !important; border-left-color: #e8621a !important; }
        .sn-logout:hover { background: rgba(239,68,68,0.08) !important; color: #ef4444 !important; }
        .sn-btn:hover { background: rgba(240,236,228,0.06) !important; }
      `}</style>

      {/* LOGO */}
      <div style={{ height: 60, display: 'flex', alignItems: 'center', padding: isCollapsed ? '0 14px' : '0 16px', borderBottom: '1px solid rgba(240,236,228,0.07)', justifyContent: isCollapsed ? 'center' : 'space-between', flexShrink: 0 }}>
        <Link href={`/${role}/dashboard`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', overflow: 'hidden' }}>
          <div style={{ width: 32, height: 32, flexShrink: 0, background: 'linear-gradient(135deg,#e8621a,#ff8c4a)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Fraunces',serif", fontWeight: 900, color: '#fff', fontSize: 16, boxShadow: '0 4px 12px rgba(232,98,26,0.3)' }}>N</div>
          {!isCollapsed && <span style={{ fontFamily: "'Fraunces',serif", fontWeight: 900, fontSize: 16, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>Ndreqe <span style={{ color: '#e8621a' }}>Shpin</span></span>}
        </Link>
        {!isCollapsed && !isMobile && <button onClick={() => setCollapsed(true)} className="sn-btn" style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(240,236,228,0.04)', border: '1px solid rgba(240,236,228,0.08)', color: 'rgba(240,236,228,0.4)', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>◀</button>}
        {isMobile && <button onClick={() => setMobileOpen(false)} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(240,236,228,0.06)', border: '1px solid rgba(240,236,228,0.1)', color: 'rgba(240,236,228,0.6)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>}
      </div>
      {isCollapsed && !isMobile && <button onClick={() => setCollapsed(false)} className="sn-btn" style={{ margin: '10px auto 0', width: 36, height: 28, borderRadius: 7, background: 'rgba(240,236,228,0.04)', border: '1px solid rgba(240,236,228,0.08)', color: 'rgba(240,236,228,0.4)', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>▶</button>}

      {/* PROFILE CARD */}
      {!isCollapsed ? (
        <div style={{ margin: '12px 12px 4px', padding: '12px', background: 'rgba(240,236,228,0.03)', border: '1px solid rgba(240,236,228,0.07)', borderRadius: 14, cursor: 'pointer', flexShrink: 0 }} onClick={() => setShowProfile(p => !p)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {avatar ? <img src={avatar} alt="" style={{ width: 38, height: 38, borderRadius: 10, objectFit: 'cover', flexShrink: 0, border: `2px solid ${meta.color}40` }} /> : <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: `linear-gradient(135deg,${meta.color}cc,${meta.color})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff', boxShadow: `0 4px 12px ${meta.color}30` }}>{initials}</div>}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: meta.color, background: meta.bg, border: `1px solid ${meta.color}30`, borderRadius: 100, padding: '1px 7px' }}>{meta.label}</span>
                {isPremium && <span style={{ fontSize: 10 }}>💎</span>}
              </div>
            </div>
            <span style={{ fontSize: 10, color: 'rgba(240,236,228,0.3)', transition: 'transform 0.2s', transform: showProfile ? 'rotate(180deg)' : 'none' }}>▼</span>
          </div>
          {showProfile && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(240,236,228,0.07)', display: 'flex', flexDirection: 'column', gap: 2, animation: 'fadeIn 0.15s ease' }}>
              {[{ icon: '👤', label: 'Profili im', href: `/${role}/profile` }, { icon: '⚙️', label: 'Cilësimet', href: `/${role}/settings` }, { icon: '💎', label: 'Premium', href: '/pricing' }].map(item => (
                <Link key={item.href} href={item.href} onClick={() => setShowProfile(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRadius: 8, fontSize: 12, color: 'rgba(240,236,228,0.6)', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(240,236,228,0.06)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <span style={{ fontSize: 13 }}>{item.icon}</span>{item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '12px 0 4px' }}>
          {avatar ? <img src={avatar} alt="" style={{ width: 38, height: 38, borderRadius: 10, objectFit: 'cover', border: `2px solid ${meta.color}40` }} /> : <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg,${meta.color}cc,${meta.color})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff' }}>{initials}</div>}
        </div>
      )}

      {/* NAV */}
      <nav style={{ flex: 1, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto', overflowX: 'hidden' }}>
        {!isCollapsed && <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(240,236,228,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '6px 8px 4px', marginTop: 4 }}>Menuja</div>}
        {navItems.map(item => {
          const active = isActiveRoute(item)
          return (
            <Link key={item.href} href={item.href} title={isCollapsed ? item.label : undefined}
              className={`sn-item ${active ? 'sn-active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: isCollapsed ? '10px 0' : '10px 10px', justifyContent: isCollapsed ? 'center' : 'flex-start', borderRadius: 10, textDecoration: 'none', color: active ? '#f0ece4' : 'rgba(240,236,228,0.5)', fontWeight: active ? 700 : 500, fontSize: 13, position: 'relative', borderLeft: active ? '2px solid #e8621a' : '2px solid transparent' }}>
              {active && !isCollapsed && <div style={{ position: 'absolute', right: 10, width: 6, height: 6, borderRadius: '50%', background: '#e8621a' }} />}
              <span style={{ fontSize: 17, flexShrink: 0, width: 20, textAlign: 'center' }}>{item.icon}</span>
              {!isCollapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* BOTTOM */}
      <div style={{ padding: '10px', borderTop: '1px solid rgba(240,236,228,0.07)', display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
        {!isCollapsed && !isPremium && (
          <Link href="/pricing"
            style={{ display: 'block', padding: '12px 14px', background: 'linear-gradient(135deg,rgba(232,98,26,0.15),rgba(232,98,26,0.08))', border: '1px solid rgba(232,98,26,0.25)', borderRadius: 12, textDecoration: 'none', marginBottom: 4, transition: 'opacity 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f0ece4', marginBottom: 3 }}>💎 Kalo në Premium</div>
            <div style={{ fontSize: 11, color: 'rgba(240,236,228,0.45)', lineHeight: 1.5 }}>Aplikime të pakufizuara</div>
          </Link>
        )}

        {/* Notification button with dropdown */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button onClick={openNotifPanel} className="sn-btn"
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: isCollapsed ? '10px 0' : '10px 10px', justifyContent: isCollapsed ? 'center' : 'flex-start', borderRadius: 10, border: 'none', background: notifOpen ? 'rgba(240,236,228,0.07)' : 'transparent', color: 'rgba(240,236,228,0.5)', cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: 'inherit', transition: 'background 0.15s', position: 'relative' }}>
            <span style={{ fontSize: 17, flexShrink: 0, width: 20, textAlign: 'center', position: 'relative', display: 'inline-block' }}>
              🔔
              {unread > 0 && <span style={{ position: 'absolute', top: -4, right: -6, minWidth: 16, height: 16, background: '#e8621a', borderRadius: 100, fontSize: 9, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', animation: 'pulse 2s ease-in-out infinite', border: '2px solid #0a0908' }}>{unread > 9 ? '9+' : unread}</span>}
            </span>
            {!isCollapsed && <span style={{ flex: 1, textAlign: 'left' }}>Njoftimet</span>}
            {!isCollapsed && unread > 0 && <span style={{ background: '#e8621a', color: '#fff', fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 100 }}>{unread > 9 ? '9+' : unread}</span>}
          </button>
          {notifOpen && <NotifPanel />}
        </div>

        {/* Logout */}
        <button onClick={handleLogout} disabled={loggingOut} className="sn-logout"
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: isCollapsed ? '10px 0' : '10px 10px', justifyContent: isCollapsed ? 'center' : 'flex-start', borderRadius: 10, border: 'none', background: 'transparent', color: loggingOut ? 'rgba(240,236,228,0.3)' : 'rgba(240,236,228,0.45)', cursor: loggingOut ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 500, fontFamily: 'inherit', transition: 'all 0.15s' }}>
          {loggingOut
            ? <><div style={{ width: 16, height: 16, border: '2px solid rgba(240,236,228,0.15)', borderTop: '2px solid rgba(240,236,228,0.5)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />{!isCollapsed && <span>Duke dalë...</span>}</>
            : <><span style={{ fontSize: 17, flexShrink: 0, width: 20, textAlign: 'center' }}>🚪</span>{!isCollapsed && <span>Dil nga llogaria</span>}</>}
        </button>
      </div>
    </aside>
  )

  // MOBILE
  if (isMobile) {
    return (
      <>
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 56, background: 'rgba(10,9,8,0.97)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(240,236,228,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', zIndex: 200, fontFamily: "'DM Sans',sans-serif" }}>
          <button onClick={() => setMobileOpen(true)} style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(240,236,228,0.06)', border: '1px solid rgba(240,236,228,0.1)', color: 'rgba(240,236,228,0.7)', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>☰</button>
          <Link href={`/${role}/dashboard`} style={{ fontFamily: "'Fraunces',serif", fontWeight: 900, fontSize: 16, letterSpacing: '-0.02em', textDecoration: 'none', color: '#f0ece4' }}>Ndreqe<span style={{ color: '#e8621a' }}>Shpin</span></Link>
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button onClick={openNotifPanel} style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(240,236,228,0.06)', border: '1px solid rgba(240,236,228,0.1)', color: 'rgba(240,236,228,0.7)', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              🔔
              {unread > 0 && <div style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: '#e8621a', border: '2px solid #0a0908', animation: 'pulse 2s ease-in-out infinite' }} />}
            </button>
            {notifOpen && (
              <div style={{ position: 'fixed', top: 56, right: 8, left: 8, background: '#111010', border: '1px solid rgba(240,236,228,0.1)', borderRadius: 14, boxShadow: '0 20px 40px rgba(0,0,0,0.7)', animation: 'slideUp 0.2s ease', zIndex: 500, overflow: 'hidden' }}>
                <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(240,236,228,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#f0ece4' }}>Njoftimet</span>
                  <Link href={`/${role}/notifications`} onClick={() => setNotifOpen(false)} style={{ fontSize: 11, color: '#e8621a', textDecoration: 'none', fontWeight: 600 }}>Të gjitha →</Link>
                </div>
                <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                  {notifs.length === 0 ? (
                    <div style={{ padding: '24px 14px', textAlign: 'center', color: 'rgba(240,236,228,0.3)', fontSize: 12 }}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>🔔</div>Asnjë njoftim
                    </div>
                  ) : notifs.map((n: any) => (
                    <div key={n.id} onClick={() => { if (n.link) router.push(n.link); setNotifOpen(false) }}
                      style={{ padding: '10px 14px', display: 'flex', gap: 10, background: n.is_read ? 'transparent' : 'rgba(232,98,26,0.05)', borderBottom: '1px solid rgba(240,236,228,0.04)', cursor: 'pointer' }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{TYPE_ICON[n.type] || '🔔'}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#f0ece4', marginBottom: 2 }}>{n.title}</div>
                        <div style={{ fontSize: 11, color: 'rgba(240,236,228,0.45)' }}>{n.message}</div>
                        <div style={{ fontSize: 10, color: 'rgba(240,236,228,0.25)', marginTop: 4 }}>{timeAgo(n.created_at)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {mobileOpen && (
          <>
            <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 299, backdropFilter: 'blur(4px)' }} />
            <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 260, zIndex: 300, animation: 'slideIn 0.25s cubic-bezier(0.4,0,0.2,1)' }}>
              <SidebarContent />
            </div>
          </>
        )}
        <div style={{ height: 56, flexShrink: 0 }} />
      </>
    )
  }

  return <SidebarContent />
}