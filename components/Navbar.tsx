'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface NavbarProps {
  role:      'client' | 'company' | 'worker' | 'admin'
  userName:  string
  unread?:   number
}

const NAV_LINKS = {
  client: [
    { href: '/client/dashboard',      label: 'Dashboard',     icon: '⊞' },
    { href: '/client/applications',   label: 'Aplikimet',     icon: '📋' },
    { href: '/client/offers',         label: 'Ofertat',       icon: '💼' },
    { href: '/client/messages',       label: 'Mesazhet',      icon: '💬' },
  ],
  company: [
    { href: '/company/dashboard',     label: 'Dashboard',     icon: '⊞' },
    { href: '/company/applications',  label: 'Aplikimet',     icon: '📋' },
    { href: '/company/offers',        label: 'Ofertat e mia', icon: '💼' },
    { href: '/company/messages',      label: 'Mesazhet',      icon: '💬' },
    { href: '/company/stats',         label: 'Statistikat',   icon: '📊' },
  ],
  worker: [
    { href: '/worker/dashboard',      label: 'Dashboard',     icon: '⊞' },
    { href: '/worker/applications',   label: 'Aplikimet',     icon: '📋' },
    { href: '/worker/messages',       label: 'Mesazhet',      icon: '💬' },
  ],
  admin: [
    { href: '/admin/dashboard',       label: 'Dashboard',     icon: '⊞' },
    { href: '/admin/companies',       label: 'Kompanitë',     icon: '🏢' },
    { href: '/admin/users',           label: 'Përdoruesit',   icon: '👥' },
    { href: '/admin/applications',    label: 'Aplikimet',     icon: '📋' },
    { href: '/admin/stats',           label: 'Statistikat',   icon: '📊' },
  ],
}

export default function Navbar({ role, userName, unread = 0 }: NavbarProps) {
  const router   = useRouter()
  const pathname = usePathname()
  const [loggingOut, setLoggingOut] = useState(false)
  const [menuOpen,   setMenuOpen]   = useState(false)

  const links = NAV_LINKS[role] || []

  async function handleLogout() {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const roleLabel: Record<string, string> = {
    client:  'Klient',
    company: 'Kompani',
    worker:  'Punëtor',
    admin:   'Admin',
  }

  const roleColor: Record<string, string> = {
    client:  '#3b82f6',
    company: '#e8621a',
    worker:  '#10b981',
    admin:   '#a78bfa',
  }

  const initials = userName
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <nav style={{
      height: 58,
      background: '#0a0908',
      borderBottom: '1px solid rgba(240,236,228,0.07)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      flexShrink: 0,
    }}>

      {/* Left — Logo + Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>

        {/* Logo */}
        <Link href={`/${role}/dashboard`} style={{
          display: 'flex', alignItems: 'center', gap: 9,
          textDecoration: 'none',
        }}>
          <div style={{
            width: 30, height: 30,
            background: 'linear-gradient(135deg,#e8621a,#ff8c4a)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Fraunces',serif", fontWeight: 900,
            color: '#fff', fontSize: 15,
            boxShadow: '0 4px 12px rgba(232,98,26,0.3)',
          }}>N</div>
          <span style={{
            fontFamily: "'Fraunces',serif",
            fontWeight: 900, fontSize: 16,
            letterSpacing: '-0.02em', color: '#f0ece4',
          }}>
            Ndreqe <span style={{ color: '#e8621a' }}>Shpin</span>
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {links.map(link => {
            const active = pathname === link.href || pathname.startsWith(link.href + '/')
            return (
              <Link key={link.href} href={link.href} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 8,
                fontSize: 13, fontWeight: active ? 700 : 500,
                color: active ? '#f0ece4' : 'rgba(240,236,228,0.45)',
                background: active ? 'rgba(240,236,228,0.07)' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.15s',
              }}>
                <span style={{ fontSize: 14 }}>{link.icon}</span>
                {link.label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Right — Notifications + Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

        {/* Notifications */}
        <button style={{
          position: 'relative',
          width: 36, height: 36, borderRadius: 9,
          background: 'rgba(240,236,228,0.04)',
          border: '1px solid rgba(240,236,228,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: 16,
          transition: 'background 0.15s',
        }}>
          🔔
          {unread > 0 && (
            <div style={{
              position: 'absolute', top: -4, right: -4,
              width: 18, height: 18,
              background: '#e8621a', borderRadius: '50%',
              border: '2px solid #0a0908',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 800, color: '#fff',
            }}>
              {unread > 9 ? '9+' : unread}
            </div>
          )}
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: 'rgba(240,236,228,0.08)', margin: '0 4px' }} />

        {/* Profile dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '5px 5px 5px 10px', borderRadius: 10,
              background: 'rgba(240,236,228,0.04)',
              border: '1px solid rgba(240,236,228,0.08)',
              cursor: 'pointer', transition: 'background 0.15s',
            }}
          >
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#f0ece4', lineHeight: 1.2 }}>
                {userName.split(' ')[0]}
              </div>
              <div style={{ fontSize: 10, color: roleColor[role], lineHeight: 1.2, fontWeight: 600 }}>
                {roleLabel[role]}
              </div>
            </div>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: `linear-gradient(135deg,${roleColor[role]}cc,${roleColor[role]})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 800, color: '#fff',
            }}>
              {initials}
            </div>
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              width: 200,
              background: '#141310',
              border: '1px solid rgba(240,236,228,0.09)',
              borderRadius: 12,
              boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
              overflow: 'hidden',
              animation: 'fadeUp 0.15s ease',
              zIndex: 200,
            }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(240,236,228,0.07)' }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{userName}</div>
                <div style={{ fontSize: 11, color: 'rgba(240,236,228,0.4)', marginTop: 2 }}>{roleLabel[role]}</div>
              </div>
              {[
                { label: '👤 Profili im',      href: `/${role}/profile` },
                { label: '⚙️ Cilësimet',       href: `/${role}/settings` },
                { label: '💎 Paketa premium',  href: '/pricing' },
              ].map(item => (
                <Link key={item.href} href={item.href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'block', padding: '10px 14px',
                    fontSize: 13, color: 'rgba(240,236,228,0.65)',
                    borderBottom: '1px solid rgba(240,236,228,0.05)',
                    transition: 'background 0.1s',
                  }}
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                style={{
                  width: '100%', padding: '10px 14px',
                  background: 'none', border: 'none',
                  textAlign: 'left', fontSize: 13,
                  color: '#e8621a', cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                {loggingOut ? (
                  <>
                    <div style={{ width: 12, height: 12, border: '1.5px solid rgba(232,98,26,0.3)', borderTop: '1.5px solid #e8621a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    Duke dalë...
                  </>
                ) : '🚪 Dil nga llogaria'}
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}