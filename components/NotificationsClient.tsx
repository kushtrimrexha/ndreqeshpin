'use client'

import { useState } from 'react'

interface Notification {
  id: string; type: string; title: string; message: string
  is_read: boolean; created_at: string; data?: string
}

interface Props {
  initialNotifications: Notification[]
}

const TYPE_META: Record<string, { icon: string; col: string }> = {
  offer_accepted:    { icon: '✅', col: '#22d3a5' },
  offer_rejected:    { icon: '❌', col: '#f87171' },
  new_offer:         { icon: '💼', col: '#e8621a' },
  account_verified:  { icon: '🏆', col: '#fbbf24' },
  account_unverified:{ icon: '⚠️', col: '#f87171' },
  new_message:       { icon: '💬', col: '#60a5fa' },
  new_review:        { icon: '⭐', col: '#fbbf24' },
  default:           { icon: '🔔', col: '#a78bfa' },
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins  < 1)  return 'Tani'
  if (mins  < 60) return `${mins} min më parë`
  if (hours < 24) return `${hours} orë më parë`
  if (days  < 7)  return `${days} ditë më parë`
  return new Date(dateStr).toLocaleDateString('sq-AL')
}

export default function NotificationsClient({ initialNotifications }: Props) {
  const [notifs,  setNotifs]  = useState<Notification[]>(initialNotifications)
  const [filter,  setFilter]  = useState<'all'|'unread'>('all')
  const [loading, setLoading] = useState<string | null>(null)

  const unreadCount = notifs.filter(n => !n.is_read).length
  const filtered    = filter === 'unread' ? notifs.filter(n => !n.is_read) : notifs

  async function markRead(id: string) {
    setLoading(id)
    await fetch('/api/notifications/read', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: [id] }) })
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    setLoading(null)
  }

  async function markAllRead() {
    setLoading('all')
    await fetch('/api/notifications/read', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ all: true }) })
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })))
    setLoading(null)
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: '1.9rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 6 }}>Njoftimet</h1>
          <p style={{ fontSize: 14, color: 'rgba(232,234,240,0.45)' }}>
            {unreadCount > 0 ? <><span style={{ color: '#e8621a', fontWeight: 700 }}>{unreadCount} të palexuara</span> · {notifs.length} gjithsej</> : `${notifs.length} njoftime gjithsej`}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} disabled={loading === 'all'}
            style={{ padding: '9px 18px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(232,234,240,0.65)', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
            {loading === 'all' ? <><div style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.2)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Duke shënuar...</> : '✓ Shëno të gjitha si të lexuara'}
          </button>
        )}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', padding: 4, borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)', alignSelf: 'flex-start', display: 'inline-flex', marginBottom: 24 }}>
        {(['all','unread'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '8px 18px', borderRadius: 9, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', background: filter === f ? '#e8621a' : 'transparent', color: filter === f ? '#fff' : 'rgba(232,234,240,0.45)', transition: 'all 0.2s' }}>
            {f === 'all' ? `Të gjitha (${notifs.length})` : `Të palexuara (${unreadCount})`}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'rgba(232,234,240,0.3)' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🔔</div>
          <div style={{ fontFamily: "'Fraunces',serif", fontSize: '1.1rem', fontWeight: 800, marginBottom: 8 }}>Nuk ka njoftime</div>
          <p style={{ fontSize: 13, lineHeight: 1.65 }}>{filter === 'unread' ? 'Të gjitha njoftimet janë lexuar.' : 'Nuk ke njoftime ende.'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((n, i) => {
            const meta = TYPE_META[n.type] || TYPE_META.default
            return (
              <div key={n.id}
                style={{ padding: '18px 20px', background: n.is_read ? 'rgba(255,255,255,0.02)' : 'rgba(232,98,26,0.05)', border: `1px solid ${n.is_read ? 'rgba(255,255,255,0.07)' : 'rgba(232,98,26,0.18)'}`, borderRadius: 16, display: 'flex', alignItems: 'flex-start', gap: 16, animation: `fadeUp 0.3s ease ${i * 0.03}s both`, transition: 'all 0.2s', position: 'relative' as const }}>

                {/* Unread dot */}
                {!n.is_read && <div style={{ position: 'absolute', top: 20, right: 20, width: 8, height: 8, borderRadius: '50%', background: '#e8621a', boxShadow: '0 0 8px rgba(232,98,26,0.6)' }} />}

                {/* Icon */}
                <div style={{ width: 44, height: 44, borderRadius: 13, background: `${meta.col}15`, border: `1px solid ${meta.col}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {meta.icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 5, color: n.is_read ? 'rgba(232,234,240,0.8)' : '#e8eaf0' }}>{n.title}</div>
                  <p style={{ fontSize: 13, color: 'rgba(232,234,240,0.5)', lineHeight: 1.65, marginBottom: 10 }}>{n.message}</p>
                  <div style={{ fontSize: 11, color: 'rgba(232,234,240,0.3)', fontWeight: 600 }}>{timeAgo(n.created_at)}</div>
                </div>

                {/* Mark read */}
                {!n.is_read && (
                  <button onClick={() => markRead(n.id)} disabled={loading === n.id}
                    style={{ padding: '7px 14px', borderRadius: 9, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(232,234,240,0.5)', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' as const }}>
                    {loading === n.id ? '...' : '✓ Lexo'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}