'use client'

import { useState, useEffect } from 'react'
import { createClient }         from '@/lib/supabase/client'
import Sidebar                  from '@/components/Sidebar'

interface Profile { id: string; full_name: string; city: string; package_type: string }
interface Company { id: string; business_name: string; is_verified: boolean; rating_avg: number; package_type: string }
interface Application {
  id: string; title: string; description: string; city: string
  area_sqm: number | null; budget_min: number | null; budget_max: number | null
  offer_count: number; expires_at: string; created_at: string
  categories?: { name: string; icon: string }
  profiles?:   { full_name: string; city: string }
}
interface MyOffer {
  id: string; price: number; duration_days: number
  description: string; status: string; created_at: string
  applications: { title: string; profiles: { full_name: string } }
}
interface Stats { total: number; accepted: number; pending: number; revenue: number }

// ─── COUNTDOWN ────────────────────────────────────────────────────────────
function Countdown({ expiresAt }: { expiresAt: string }) {
  const calc = () => {
    const diff = new Date(expiresAt).getTime() - Date.now()
    if (diff <= 0) return { label: 'Skaduar', expired: true, urgent: false }
    const h = Math.floor(diff / 3_600_000)
    const m = Math.floor((diff % 3_600_000) / 60_000)
    const s = Math.floor((diff % 60_000) / 1_000)
    return { label: `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`, expired: false, urgent: diff < 3 * 3_600_000 }
  }
  const [t, setT] = useState(calc)
  useEffect(() => { const i = setInterval(() => setT(calc()), 1000); return () => clearInterval(i) }, [expiresAt])
  const color = t.expired ? '#6b7280' : t.urgent ? '#ef4444' : '#10b981'
  return (
    <span style={{ fontFamily: "'Fira Code',monospace", fontSize: 11, fontWeight: 700, color, background: `${color}12`, border: `1px solid ${color}30`, borderRadius: 100, padding: '3px 9px', whiteSpace: 'nowrap' as const }}>
      ⏱ {t.label}
    </span>
  )
}

// ─── OFFER MODAL ──────────────────────────────────────────────────────────
function OfferModal({ app, companyId, onClose, onSuccess }: { app: Application; companyId: string; onClose: () => void; onSuccess: () => void }) {
  const supabase = createClient()
  const [price,    setPrice]    = useState('')
  const [duration, setDuration] = useState('')
  const [desc,     setDesc]     = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [focused,  setFocused]  = useState<string | null>(null)

  const inp = (n: string): React.CSSProperties => ({
    width: '100%', background: focused === n ? 'rgba(232,98,26,0.04)' : 'rgba(240,236,228,0.04)',
    border: `1px solid ${focused === n ? 'rgba(232,98,26,0.5)' : 'rgba(240,236,228,0.1)'}`,
    borderRadius: 10, padding: '11px 14px', fontSize: 14,
    color: '#f0ece4', fontFamily: 'inherit', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' as const,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!price || !duration || !desc) { setError('Të gjitha fushat janë të detyrueshme.'); return }
    if (Number(price) <= 0)           { setError('Çmimi duhet të jetë pozitiv.'); return }
    if (desc.length < 30)             { setError('Përshkrimi duhet të ketë min 30 karaktere.'); return }
    setLoading(true)
    const { error: err } = await supabase.from('offers').insert({ application_id: app.id, company_id: companyId, provider_type: 'company', price: Number(price), duration_days: Number(duration), description: desc })
    if (err) { setError(err.message); setLoading(false); return }
    onSuccess()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20, backdropFilter: 'blur(6px)' }}>
      <div style={{ width: '100%', maxWidth: 520, background: '#141310', border: '1px solid rgba(240,236,228,0.1)', borderRadius: 22, overflow: 'hidden', animation: 'fadeUp 0.2s ease' }}>
        <div style={{ padding: '22px 26px', borderBottom: '1px solid rgba(240,236,228,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: '1.2rem', fontWeight: 900, marginBottom: 4 }}>Dërgo Ofertë</h3>
            <p style={{ fontSize: 13, color: 'rgba(240,236,228,0.45)', lineHeight: 1.5 }}>{app.title}</p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(240,236,228,0.06)', border: '1px solid rgba(240,236,228,0.1)', color: 'rgba(240,236,228,0.55)', cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
        <div style={{ padding: '12px 26px', background: 'rgba(240,236,228,0.02)', borderBottom: '1px solid rgba(240,236,228,0.06)', display: 'flex', gap: 24 }}>
          {[{ l: '📍', v: app.city }, { l: '📐', v: app.area_sqm ? `${app.area_sqm} m²` : 'N/A' }, { l: '💰', v: app.budget_max ? `deri €${app.budget_max.toLocaleString()}` : 'Fleksibël' }].map(s => (
            <div key={s.l}><div style={{ fontSize: 11, color: 'rgba(240,236,228,0.3)', marginBottom: 2 }}>{s.l}</div><div style={{ fontSize: 13, fontWeight: 600 }}>{s.v}</div></div>
          ))}
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '22px 26px' }}>
          {error && <div style={{ marginBottom: 16, padding: '11px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, fontSize: 13, color: '#fca5a5' }}>⚠️ {error}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(240,236,228,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Çmimi (€) *</label>
              <input type="number" placeholder="3200" min="1" value={price} onChange={e => setPrice(e.target.value)} style={inp('price')} onFocus={() => setFocused('price')} onBlur={() => setFocused(null)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(240,236,228,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Ditë punë *</label>
              <input type="number" placeholder="14" min="1" value={duration} onChange={e => setDuration(e.target.value)} style={inp('duration')} onFocus={() => setFocused('duration')} onBlur={() => setFocused(null)} />
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(240,236,228,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Përshkrimi i ofertës *</label>
            <textarea placeholder="Çfarë përfshin oferta juaj, materialet, etapat..." value={desc} onChange={e => setDesc(e.target.value)} rows={4} onFocus={() => setFocused('desc')} onBlur={() => setFocused(null)} style={{ ...inp('desc'), resize: 'vertical' as const, minHeight: 100 }} />
            <div style={{ fontSize: 11, color: desc.length < 30 ? 'rgba(240,236,228,0.3)' : '#10b981', marginTop: 5, textAlign: 'right' }}>{desc.length}/30 min</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 11, background: 'rgba(240,236,228,0.05)', border: '1px solid rgba(240,236,228,0.1)', color: 'rgba(240,236,228,0.6)', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Anulo</button>
            <button type="submit" disabled={loading} style={{ flex: 2, padding: '12px', borderRadius: 11, background: loading ? 'rgba(232,98,26,0.5)' : '#e8621a', border: 'none', color: '#fff', fontFamily: "'Fraunces',serif", fontWeight: 800, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading ? <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Duke dërguar...</> : 'Dërgo Ofertën →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── MAIN ─────────────────────────────────────────────────────────────────
export default function CompanyDashboard({ profile, company }: { profile: Profile; company: Company }) {
  const supabase = createClient()
  const [tab,           setTab]           = useState<'browse'|'offers'|'stats'>('browse')
  const [applications,  setApplications]  = useState<Application[]>([])
  const [myOffers,      setMyOffers]      = useState<MyOffer[]>([])
  const [stats,         setStats]         = useState<Stats | null>(null)
  const [loading,       setLoading]       = useState(true)
  const [offerModal,    setOfferModal]    = useState<Application | null>(null)
  const [notifications, setNotifications] = useState(0)
  const [toast,         setToast]         = useState('')

  useEffect(() => {
    setLoading(true)
    if (tab === 'browse') {
      supabase.from('applications').select('*, categories(name,icon), profiles!client_id(full_name,city)').eq('status','active').order('created_at',{ascending:false}).limit(30)
        .then(({ data }) => { setApplications(data || []); setLoading(false) })
    }
    if (tab === 'offers') {
      supabase.from('offers').select('*, applications(title, profiles!client_id(full_name))').eq('company_id', company.id).order('created_at',{ascending:false})
        .then(({ data }) => { setMyOffers(data || []); setLoading(false) })
    }
    if (tab === 'stats') {
      supabase.from('offers').select('id,status,price').eq('company_id', company.id)
        .then(({ data }) => {
          const all = data || []
          const acc = all.filter(o => o.status === 'accepted')
          setStats({ total: all.length, accepted: acc.length, pending: all.filter(o => o.status === 'pending').length, revenue: acc.reduce((s,o) => s + Number(o.price), 0) })
          setLoading(false)
        })
    }
  }, [tab, company.id])

  useEffect(() => {
    supabase.from('notifications').select('id',{count:'exact'}).eq('user_id',profile.id).eq('is_read',false).then(({count}) => setNotifications(count || 0))
  }, [profile.id])

  function handleOfferSuccess() {
    setOfferModal(null)
    setToast('Oferta u dërgua me sukses! 🎉')
    setTimeout(() => setToast(''), 4000)
  }

  const statusColors: Record<string, string> = { pending: '#f59e0b', accepted: '#10b981', rejected: '#ef4444', withdrawn: '#6b7280' }
  const statusLabels: Record<string, string> = { pending: 'Në pritje', accepted: 'Pranuar', rejected: 'Refuzuar', withdrawn: 'Tërhequr' }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0e0c', color: '#f0ece4', fontFamily: "'DM Sans','Helvetica Neue',sans-serif", display: 'flex' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .app-card:hover  { border-color: rgba(240,236,228,0.15) !important; }
        .tab-btn:hover   { color: #f0ece4 !important; }
        .offer-row:hover { background: rgba(240,236,228,0.04) !important; }
      `}</style>

      <Sidebar role="company" userName={profile.full_name} unread={notifications} package={company.package_type} />

      <div style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>

        {toast && (
          <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 500, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', padding: '13px 20px', borderRadius: 12, fontSize: 14, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.3)', animation: 'fadeUp 0.3s ease' }}>
            {toast}
          </div>
        )}

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 28px' }}>

          {/* ── HEADER ──────────────────────── */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, animation: 'fadeUp 0.4s ease' }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(240,236,228,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Dashboard</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: '1.9rem', fontWeight: 900, letterSpacing: '-0.03em' }}>{company.business_name}</h1>
                {company.is_verified && <span style={{ fontSize: 11, background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 100, padding: '4px 12px', fontWeight: 700 }}>✓ Verified</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, color: 'rgba(240,236,228,0.4)' }}>⭐ {company.rating_avg.toFixed(1)}</span>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(240,236,228,0.2)', display: 'inline-block' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: company.package_type !== 'free' ? '#f59e0b' : 'rgba(240,236,228,0.4)', background: company.package_type !== 'free' ? 'rgba(245,158,11,0.1)' : 'rgba(240,236,228,0.05)', border: `1px solid ${company.package_type !== 'free' ? 'rgba(245,158,11,0.25)' : 'rgba(240,236,228,0.08)'}`, borderRadius: 100, padding: '2px 10px' }}>
                  {company.package_type !== 'free' ? '💎 Premium' : '🆓 Falas'}
                </span>
              </div>
            </div>

            {/* Tab switcher */}
            <div style={{ display: 'flex', gap: 3, background: 'rgba(240,236,228,0.04)', padding: 4, borderRadius: 13, border: '1px solid rgba(240,236,228,0.07)' }}>
              {([['browse','📋 Aplikimet'],['offers','💼 Ofertat e mia'],['stats','📊 Statistikat']] as const).map(([id, label]) => (
                <button key={id} onClick={() => setTab(id)} style={{ padding: '9px 18px', borderRadius: 10, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', background: tab === id ? '#e8621a' : 'transparent', color: tab === id ? '#fff' : 'rgba(240,236,228,0.5)', transition: 'all 0.2s' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Verification warning */}
          {!company.is_verified && (
            <div style={{ marginBottom: 28, padding: '16px 20px', background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 24 }}>⏳</span>
              <div>
                <div style={{ fontWeight: 700, color: '#f59e0b', marginBottom: 3 }}>Llogaria në pritje verifikimi</div>
                <p style={{ fontSize: 13, color: 'rgba(240,236,228,0.5)', lineHeight: 1.6 }}>Ekipi ynë po verifikon kompaninë tuaj. Zakonisht zgjat 24–48 orë. Pas verifikimit mund të dërgoni oferta.</p>
              </div>
            </div>
          )}

          {/* ── TAB: BROWSE ─────────────────── */}
          {tab === 'browse' && (
            loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 14 }}>
                {[1,2,3,4].map(i => <div key={i} style={{ padding: 22, background: 'rgba(240,236,228,0.03)', border: '1px solid rgba(240,236,228,0.07)', borderRadius: 16 }}><div style={{ height: 15, background: 'rgba(240,236,228,0.06)', borderRadius: 6, marginBottom: 10, width: '70%', animation: 'pulse 1.5s ease infinite' }} /><div style={{ height: 11, background: 'rgba(240,236,228,0.04)', borderRadius: 4, width: '50%', animation: 'pulse 1.5s ease infinite' }} /></div>)}
              </div>
            ) : applications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 20px', color: 'rgba(240,236,228,0.3)' }}>
                <div style={{ fontSize: 52, marginBottom: 16 }}>📭</div>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: '1.2rem', fontWeight: 800, marginBottom: 8 }}>Nuk ka aplikime aktive</div>
                <p style={{ fontSize: 14, lineHeight: 1.65 }}>Momentalisht nuk ka projekte aktive. Kthehu më vonë.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 14 }}>
                {applications.map((app, i) => (
                  <div key={app.id} className="app-card" style={{ padding: '20px', background: 'rgba(240,236,228,0.02)', border: '1px solid rgba(240,236,228,0.08)', borderRadius: 18, display: 'flex', flexDirection: 'column', animation: `fadeUp 0.4s ease ${i * 0.05}s both`, transition: 'border-color 0.2s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div style={{ flex: 1, marginRight: 10 }}>
                        {app.categories && <div style={{ fontSize: 11, color: 'rgba(240,236,228,0.4)', marginBottom: 4 }}>{app.categories.icon} {app.categories.name}</div>}
                        <h3 style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.35 }}>{app.title}</h3>
                      </div>
                      <Countdown expiresAt={app.expires_at} />
                    </div>
                    <p style={{ fontSize: 13, color: 'rgba(240,236,228,0.5)', lineHeight: 1.65, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>{app.description}</p>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' as const, marginBottom: 12 }}>
                      {[{ i: '📍', v: app.city }, app.area_sqm ? { i: '📐', v: `${app.area_sqm} m²` } : null, app.budget_max ? { i: '💰', v: `deri €${app.budget_max.toLocaleString()}` } : null, { i: '💼', v: `${app.offer_count} oferta` }].filter(Boolean).map((m, j) => (
                        <span key={j} style={{ fontSize: 12, color: 'rgba(240,236,228,0.45)' }}>{m!.i} {m!.v}</span>
                      ))}
                    </div>
                    {app.profiles && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', borderTop: '1px solid rgba(240,236,228,0.06)', marginBottom: 14 }}>
                        <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#fff' }}>{app.profiles.full_name.slice(0,2).toUpperCase()}</div>
                        <span style={{ fontSize: 12, color: 'rgba(240,236,228,0.5)' }}>{app.profiles.full_name}</span>
                      </div>
                    )}
                    <button onClick={() => company.is_verified ? setOfferModal(app) : null} disabled={!company.is_verified}
                      style={{ width: '100%', padding: '12px', borderRadius: 11, background: company.is_verified ? '#e8621a' : 'rgba(240,236,228,0.06)', border: 'none', color: company.is_verified ? '#fff' : 'rgba(240,236,228,0.3)', fontFamily: "'Fraunces',serif", fontWeight: 800, fontSize: '0.9rem', cursor: company.is_verified ? 'pointer' : 'not-allowed', transition: 'all 0.2s', marginTop: 'auto' }}>
                      {company.is_verified ? 'Dërgo Ofertë →' : 'Prit verifikimin'}
                    </button>
                  </div>
                ))}
              </div>
            )
          )}

          {/* ── TAB: MY OFFERS ──────────────── */}
          {tab === 'offers' && (
            loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[1,2,3].map(i => <div key={i} style={{ height: 80, background: 'rgba(240,236,228,0.03)', border: '1px solid rgba(240,236,228,0.07)', borderRadius: 14, animation: 'pulse 1.5s ease infinite' }} />)}
              </div>
            ) : myOffers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 20px', color: 'rgba(240,236,228,0.3)' }}>
                <div style={{ fontSize: 52, marginBottom: 16 }}>💼</div>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: '1.2rem', fontWeight: 800, marginBottom: 8 }}>Nuk ke oferta ende</div>
                <p style={{ fontSize: 14, lineHeight: 1.65 }}>Shko tek "Aplikimet" dhe dërgo ofertën tënde të parë.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {myOffers.map((o, i) => {
                  const sc = statusColors[o.status] || '#6b7280'
                  const sl = statusLabels[o.status] || o.status
                  return (
                    <div key={o.id} className="offer-row" style={{ padding: '18px 22px', background: 'rgba(240,236,228,0.02)', border: '1px solid rgba(240,236,228,0.07)', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 16, animation: `fadeUp 0.3s ease ${i * 0.05}s both`, transition: 'background 0.15s' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{o.applications?.title}</div>
                        <div style={{ fontSize: 13, color: 'rgba(240,236,228,0.45)' }}>👤 {o.applications?.profiles?.full_name} · 📅 {new Date(o.created_at).toLocaleDateString('sq-AL')}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: "'Fraunces',serif", fontSize: '1.4rem', fontWeight: 900, color: '#e8621a' }}>€{Number(o.price).toLocaleString()}</div>
                        <div style={{ fontSize: 12, color: 'rgba(240,236,228,0.4)' }}>{o.duration_days} ditë</div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: sc, background: `${sc}12`, border: `1px solid ${sc}30`, borderRadius: 100, padding: '4px 12px', whiteSpace: 'nowrap' as const }}>{sl}</span>
                    </div>
                  )
                })}
              </div>
            )
          )}

          {/* ── TAB: STATS ──────────────────── */}
          {tab === 'stats' && (
            loading || !stats ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
                {[1,2,3,4].map(i => <div key={i} style={{ height: 120, background: 'rgba(240,236,228,0.03)', border: '1px solid rgba(240,236,228,0.07)', borderRadius: 16, animation: 'pulse 1.5s ease infinite' }} />)}
              </div>
            ) : (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
                  {[
                    { l: 'Oferta totale',  v: stats.total,                          icon: '📤', c: '#3b82f6' },
                    { l: 'Të pranuara',    v: stats.accepted,                        icon: '✅', c: '#10b981' },
                    { l: 'Në pritje',      v: stats.pending,                         icon: '⏳', c: '#f59e0b' },
                    { l: 'Të ardhura',     v: `€${stats.revenue.toLocaleString()}`,  icon: '💰', c: '#e8621a' },
                  ].map((s, i) => (
                    <div key={i} style={{ padding: '22px', background: 'rgba(240,236,228,0.02)', border: '1px solid rgba(240,236,228,0.07)', borderRadius: 18, position: 'relative', overflow: 'hidden', animation: `fadeUp 0.4s ease ${i * 0.07}s both` }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: s.c }} />
                      <div style={{ fontSize: 28, marginBottom: 12 }}>{s.icon}</div>
                      <div style={{ fontFamily: "'Fraunces',serif", fontSize: '1.9rem', fontWeight: 900, color: s.c, lineHeight: 1, marginBottom: 6 }}>{s.v}</div>
                      <div style={{ fontSize: 12, color: 'rgba(240,236,228,0.4)' }}>{s.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '24px', background: 'rgba(240,236,228,0.02)', border: '1px solid rgba(240,236,228,0.07)', borderRadius: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <span style={{ fontWeight: 700 }}>Shkalla e suksesit</span>
                    <span style={{ fontFamily: "'Fraunces',serif", fontWeight: 900, color: '#10b981', fontSize: '1.3rem' }}>
                      {stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0}%
                    </span>
                  </div>
                  <div style={{ height: 8, background: 'rgba(240,236,228,0.07)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0}%`, background: 'linear-gradient(90deg,#10b981,#34d399)', borderRadius: 4, transition: 'width 1s ease' }} />
                  </div>
                </div>
              </div>
            )
          )}

        </div>
      </div>

      {offerModal && (
        <OfferModal app={offerModal} companyId={company.id} onClose={() => setOfferModal(null)} onSuccess={handleOfferSuccess} />
      )}
    </div>
  )
}