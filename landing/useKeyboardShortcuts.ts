'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Role = 'client' | 'company' | 'worker' | 'admin'

const SHORTCUTS: Record<string, Record<string, string>> = {
  client: {
    'g d': '/client/dashboard',
    'g a': '/client/applications',
    'g o': '/client/offers',
    'g m': '/client/messages',
    'g r': '/client/reviews',
    'g p': '/client/profile',
    'c n': '/client/applications/new',
  },
  company: {
    'g d': '/company/dashboard',
    'g a': '/company/applications',
    'g o': '/company/offers',
    'g m': '/company/messages',
    'g s': '/company/stats',
    'g p': '/company/profile',
  },
  worker: {
    'g d': '/worker/dashboard',
    'g a': '/worker/applications',
    'g o': '/worker/offers',
    'g m': '/worker/messages',
    'g r': '/worker/reviews',
    'g p': '/worker/profile',
  },
  admin: {
    'g d': '/admin/dashboard',
    'g c': '/admin/companies',
    'g u': '/admin/users',
    'g a': '/admin/applications',
    'g s': '/admin/stats',
  },
}

/**
 * useKeyboardShortcuts — vim-like navigation shortcuts
 * 
 * Usage: add to any page or layout
 * 
 * Global shortcuts (all roles):
 *   Cmd/Ctrl+K → GlobalSearch
 *   Cmd/Ctrl+, → Settings
 *   Escape      → Close modals (handled per-component)
 * 
 * Navigation shortcuts (press g then key):
 *   g d → dashboard
 *   g a → applications
 *   g o → offers
 *   g m → messages
 *   g p → profile
 *   g s → stats (company/admin)
 *   c n → new application (client only)
 * 
 * Press ? to show shortcut list (not implemented here — add modal)
 */
export function useKeyboardShortcuts(role: Role) {
  const router = useRouter()

  useEffect(() => {
    let lastKey = ''
    let lastTime = 0

    function handler(e: KeyboardEvent) {
      // Don't trigger when typing in input/textarea
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).contentEditable === 'true') return

      // Cmd/Ctrl shortcuts handled elsewhere (GlobalSearch)
      if (e.metaKey || e.ctrlKey) return

      const now = Date.now()
      const combo = now - lastTime < 1000 ? `${lastKey} ${e.key}` : e.key
      lastKey = e.key
      lastTime = now

      const shortcuts = SHORTCUTS[role] || {}
      const dest = shortcuts[combo]
      if (dest) {
        router.push(dest)
        lastKey = ''
      }

      // Cmd+, → settings
      if (combo === ',') {
        router.push(`/${role}/settings`)
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [role, router])
}

/**
 * ShortcutsHint — small badge showing keyboard shortcut
 */
interface ShortcutsHintProps {
  keys: string[]
  label?: string
}

export function ShortcutsHint({ keys, label }: ShortcutsHintProps) {
  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
      {label && <span style={{ fontSize:11, color:'rgba(240,236,228,0.3)', marginRight:4 }}>{label}</span>}
      {keys.map((k, i) => (
        <kbd key={i} style={{
          padding:'2px 6px',
          background:'rgba(240,236,228,0.06)',
          border:'1px solid rgba(240,236,228,0.1)',
          borderBottom:'2px solid rgba(240,236,228,0.15)',
          borderRadius:5,
          fontSize:11,
          fontFamily:"'DM Sans',sans-serif",
          color:'rgba(240,236,228,0.4)',
          lineHeight:1.5,
        }}>{k}</kbd>
      ))}
    </div>
  )
}