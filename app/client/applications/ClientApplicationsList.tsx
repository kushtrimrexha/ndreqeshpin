'use client'

import { useState } from 'react'
import Link          from 'next/link'
import { useEffect } from 'react'

interface Application {
  id: string; title: string; city: string; status: string
  offer_count: number; expires_at: string; created_at: string
  categories?: { name: string; icon: string }
}

function Countdown({ expiresAt }: { expiresAt: string }) {
  const calc = () => {
    const diff = new Date(expiresAt).getTime() - Date.now()
    if (diff <= 0) return { label: 'Skaduar', col: '#64748b' }
    const h = Math.floor(diff / 3_600_000)
    const m = Math.floor((diff % 3_600_000) / 60_000)
    const s = Math.floor((diff % 60_000) / 1_000)
    const col = diff < 3 * 3_600_000 ? '#ef4444' : '#22d3a5'
    return { label: `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`, col }
  }
  const [t, setT] = useState(calc)
  useEffect(() => { const i = setInterval(() => setT(calc()), 1000); return () => clearInterval(i) }, [expiresAt])
  return <span style={{ fontFamily: "'Fira Code',monospace", fontSize: 12, fontWeight: 700, color: t.col }}>⏱ {t.label}</span>
}

const STATUS_MAP: Record<string, { label: string; col: string }> = {
  active:    { label: 'Aktiv',   col: '#22d3a5' },
  accepted:  { label: 'Pranuar', col: '#60a5fa' },
  expired:   { label: 'Skaduar', col: '#64748b' },
  cancelled: { label: 'Anuluar', col: '#f87171' },
}

export default function ClientApplicationsList({ applications }: { applications: Application[] }) {
  const [filter, setFilter] = useState<'all'|'active'|'accepted'|'expired'>('all')
  const [search, setSearch] = useState('')

  const filtered = applications
    .filter(a => filter === 'all' || a.status === filter)
    .filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.city.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 6 }}>Aplikimet e mia</h1>
          <p style={{ fontSize: 14, color: 'rgba(232,234,240,0.45)' }}>{applications.length} aplikime gjithsej</p>
        </div>
        <Link href="/client/applications/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'linear-gradient(135deg,#e8621a,#ff7c35)', color: '#fff', fontWeight: 700, fontSize: 13, padding: '10px 20px', borderRadius: 11, textDecoration: 'none', boxShadow: '0 4px 16px rgba(232,98,26,0.3)' }}>
          + Aplikim i Ri
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' as const }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' as const }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, opacity: 0.4 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Kërko sipas titullit ose qytetit..."
            style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 11, padding: '10px 14px 10px 36px', fontSize: 13, color: '#e8eaf0', fontFamily: 'inherit', outline: 'none' }} />
        </div>
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', padding: 4, borderRadius: 11, border: '1px solid rgba(255,255,255,0.07)' }}>
          {(['all','active','accepted','expired'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '7px 14px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', background: filter === f ? '#e8621a' : 'transparent', color: filter === f ? '#fff' : 'rgba(232,234,240,0.45)', transition: 'all 0.2s' }}>
              {{ all: 'Të gjitha', active: 'Aktive', accepted: 'Pranuar', expired: 'Skaduar' }[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'rgba(232,234,240,0.3)' }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>📭</div>
          <div style={{ fontFamily: "'Fraunces',serif", fontSize: '1.1rem', fontWeight: 800, marginBottom: 8 }}>Nuk ka aplikime</div>
          <p style={{ fontSize: 13, lineHeight: 1.65 }}>Nuk u gjet asnjë aplikim me filtrat e zgjedhura.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 100px 90px 140px 80px', gap: 12, padding: '8px 18px', fontSize: 11, fontWeight: 700, color: 'rgba(232,234,240,0.3)', textTransform: 'uppercase' as const, letterSpacing: '0.07em' }}>
            <span>Projekti</span><span>Kategoria</span><span>Qyteti</span><span>Oferta</span><span>Skadimi</span><span>Statusi</span>
          </div>

          {filtered.map((app, i) => {
            const st = STATUS_MAP[app.status] || STATUS_MAP.expired
            return (
              <Link key={app.id} href={`/client/applications/${app.id}`}
                style={{ display: 'grid', gridTemplateColumns: '1fr 120px 100px 90px 140px 80px', gap: 12, padding: '16px 18px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, textDecoration: 'none', alignItems: 'center', transition: 'all 0.15s', animation: `fadeUp 0.3s ease ${i * 0.04}s both` }}
              >
                <span style={{ fontWeight: 700, fontSize: 14, color: '#e8eaf0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{app.title}</span>
                <span style={{ fontSize: 12, color: 'rgba(232,234,240,0.5)' }}>{app.categories ? `${app.categories.icon} ${app.categories.name}` : '—'}</span>
                <span style={{ fontSize: 13, color: 'rgba(232,234,240,0.5)' }}>📍 {app.city}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: app.offer_count > 0 ? '#e8621a' : 'rgba(232,234,240,0.4)' }}>{app.offer_count}</span>
                {app.status === 'active' ? <Countdown expiresAt={app.expires_at} /> : <span style={{ fontSize: 12, color: 'rgba(232,234,240,0.35)' }}>{new Date(app.expires_at).toLocaleDateString('sq-AL')}</span>}
                <span style={{ fontSize: 11, fontWeight: 700, color: st.col, background: `${st.col}15`, border: `1px solid ${st.col}35`, borderRadius: 6, padding: '3px 9px', textAlign: 'center' as const }}>{st.label}</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}