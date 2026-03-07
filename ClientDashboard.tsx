'use client'

import { useState, useEffect } from 'react'
import { createClient }        from '@/lib/supabase/client'
import Navbar                  from '@/components/Navbar'
import Link                    from 'next/link'

// ─── TYPES ────────────────────────────────────────────────────────────────
interface Profile {
  id:           string
  full_name:    string
  city:         string
  role:         string
  package_type: string
}

interface Application {
  id:           string
  title:        string
  city:         string
  status:       string
  offer_count:  number
  expires_at:   string
  created_at:   string
  categories?:  { name: string; icon: string }
}

interface Offer {
  id:            string
  price:         number
  duration_days: number
  description:   string
  status:        string
  created_at:    string
  companies: {
    business_name: string
    rating_avg:    number
    is_verified:   boolean
  }
}

// ─── COUNTDOWN ────────────────────────────────────────────────────────────
function Countdown({ expiresAt }: { expiresAt: string }) {
  const calc = () => {
    const diff = new Date(expiresAt).getTime() - Date.now()
    if (diff <= 0) return { h: '00', m: '00', s: '00', expired: true, urgent: false }
    const h = Math.floor(diff / 3_600_000)
    const m = Math.floor((diff % 3_600_000) / 60_000)
    const s = Math.floor((diff % 60_000) / 1_000)
    return {
      h: String(h).padStart(2, '0'),
      m: String(m).padStart(2, '0'),
      s: String(s).padStart(2, '0'),
      expired: false,
      urgent: diff < 3 * 3_600_000,
    }
  }

  const [t, setT] = useState(calc)
  useEffect(() => {
    const i = setInterval(() => setT(calc()), 1000)
    return () => clearInterval(i)
  }, [expiresAt])

  const color = t.expired ? '#6b7280' : t.urgent ? '#ef4444' : '#10b981'
  const bg    = t.expired ? 'rgba(107,114,128,0.08)' : t.urgent ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)'
  const bdr   = t.expired ? 'rgba(107,114,128,0.2)'  : t.urgent ? 'rgba(239,68,68,0.25)'  : 'rgba(16,185,129,0.2)'

  return (
    <span style={{
      fontFamily: "'Fira Code',monospace",
      fontSize: 12, fontWeight: 700,
      color, background: bg,
      border: `1px solid ${bdr}`,
      borderRadius: 100, padding: '3px 10px',
      display: 'inline-flex', alignItems: 'center', gap: 5,
      animation: t.urgent && !t.expired ? 'countdown-pulse 2s ease infinite' : 'none',
    }}>
      ⏱ {t.expired ? 'Skaduar' : `${t.h}:${t.m}:${t.s}`}
    </span>
  )
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    active:    { label: 'Aktiv',    color: '#10b981', bg: 'rgba(16,185,129,0.08)'  },
    accepted:  { label: 'Pranuar',  color: '#3b82f6', bg: 'rgba(59,130,246,0.08)'  },
    expired:   { label: 'Skaduar',  color: '#6b7280', bg: 'rgba(107,114,128,0.08)' },
    cancelled: { label: 'Anuluar',  color: '#ef4444', bg: 'rgba(239,68,68,0.08)'   },
  }
  const s = map[status] || map.expired
  return (
    <span style={{
      fontSize: 11, fontWeight: 700,
      color: s.color, background: s.bg,
      border: `1px solid ${s.color}30`,
      borderRadius: 100, padding: '3px 10px',
    }}>
      {s.label}
    </span>
  )
}

// ─── SKELETON ─────────────────────────────────────────────────────────────
function Skeleton({ w = '100%', h = 16, r = 8 }: { w?: string; h?: number; r?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'rgba(240,236,228,0.05)',
      animation: 'pulse 1.5s ease infinite',
    }} />
  )
}

// ─── MAIN ─────────────────────────────────────────────────────────────────
export default function ClientDashboard({ profile }: { profile: Profile }) {
  const supabase = createClient()

  const [activeTab,     setActiveTab]     = useState<'active' | 'accepted' | 'expired'>('active')
  const [applications,  setApplications]  = useState<Application[]>([])
  const [selectedApp,   setSelectedApp]   = useState<Application | null>(null)
  const [offers,        setOffers]        = useState<Offer[]>([])
  const [loadingApps,   setLoadingApps]   = useState(true)
  const [loadingOffers, setLoadingOffers] = useState(false)
  const [notifications, setNotifications] = useState(0)

  // ── Ngarko aplikimet ────────────────────────
  useEffect(() => {
    async function loadApps() {
      setLoadingApps(true)
      const { data } = await supabase
        .from('applications')
        .select('*, categories(name, icon)')
        .eq('client_id', profile.id)
        .eq('status', activeTab)
        .order('created_at', { ascending: false })
        .limit(20)

      setApplications(data || [])
      setSelectedApp(null)
      setOffers([])
      setLoadingApps(false)
    }
    loadApps()
  }, [activeTab, profile.id])

  // ── Ngarko ofertat e aplikimit të zgjedhur ──
  useEffect(() => {
    if (!selectedApp) return
    async function loadOffers() {
      setLoadingOffers(true)
      const { data } = await supabase
        .from('offers')
        .select('*, companies(business_name, rating_avg, is_verified)')
        .eq('application_id', selectedApp!.id)
        .order('created_at', { ascending: false })
      setOffers(data || [])
      setLoadingOffers(false)
    }
    loadOffers()
  }, [selectedApp])

  // ── Ngarko unread notifications ─────────────
  useEffect(() => {
    supabase
      .from('notifications')
      .select('id', { count: 'exact' })
      .eq('user_id', profile.id)
      .eq('is_read', false)
      .then(({ count }) => setNotifications(count || 0))
  }, [profile.id])

  const isPremium = profile.package_type === 'premium' || profile.package_type === 'enterprise'

  return (
    <div style={{ minHeight: '100vh', background: '#0f0e0c', color: '#f0ece4', fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
      <Navbar role="client" userName={profile.full_name} unread={notifications} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>

        {/* ── Header ──────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36 }}>
          <div>
            <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 6 }}>
              Mirëmëngjes, <span style={{ color: '#e8621a', fontStyle: 'italic' }}>{profile.full_name.split(' ')[0]}</span>
            </h1>
            <p style={{ color: 'rgba(240,236,228,0.45)', fontSize: 14 }}>
              {isPremium ? '💎 Paketa Premium' : '🆓 Paketa Falas'} ·{' '}
              <span style={{ color: 'rgba(240,236,228,0.3)' }}>{profile.city}</span>
            </p>
          </div>

          <Link href="/client/applications/new" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#e8621a', color: '#fff',
            fontFamily: "'Fraunces',serif", fontWeight: 800,
            fontSize: '0.95rem', padding: '12px 22px',
            borderRadius: 12, textDecoration: 'none',
            boxShadow: '0 4px 16px rgba(232,98,26,0.3)',
            transition: 'all 0.2s',
          }}>
            + Aplikim i Ri
          </Link>
        </div>

        {/* ── Stats ───────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 32 }}>
          {[
            { label: 'Aplikime aktive',  val: applications.filter(a => a.status === 'active').length,   icon: '📋', color: '#e8621a' },
            { label: 'Oferta totale',    val: applications.reduce((s, a) => s + a.offer_count, 0),      icon: '💼', color: '#3b82f6' },
            { label: 'Projekte pranuar', val: applications.filter(a => a.status === 'accepted').length, icon: '✅', color: '#10b981' },
            { label: 'Paketa',           val: isPremium ? 'Premium' : 'Falas',                          icon: '💎', color: isPremium ? '#f59e0b' : 'rgba(240,236,228,0.4)' },
          ].map((s, i) => (
            <div key={i} style={{
              padding: '18px 20px',
              background: 'rgba(240,236,228,0.03)',
              border: '1px solid rgba(240,236,228,0.07)',
              borderRadius: 16,
              position: 'relative', overflow: 'hidden',
              animation: `fadeUp 0.4s ease ${i * 0.06}s both`,
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: s.color }} />
              <div style={{ fontSize: 26, marginBottom: 10 }}>{s.icon}</div>
              <div style={{ fontFamily: "'Fraunces',serif", fontSize: '1.8rem', fontWeight: 900, color: s.color, lineHeight: 1, marginBottom: 4 }}>{s.val}</div>
              <div style={{ fontSize: 12, color: 'rgba(240,236,228,0.4)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Main Grid ───────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 20 }}>

          {/* LEFT: Application List */}
          <div style={{
            background: 'rgba(240,236,228,0.02)',
            border: '1px solid rgba(240,236,228,0.07)',
            borderRadius: 18, overflow: 'hidden',
          }}>

            {/* Tabs */}
            <div style={{ padding: '16px 16px 0', borderBottom: '1px solid rgba(240,236,228,0.07)' }}>
              <div style={{ display: 'flex', gap: 2, marginBottom: 0 }}>
                {([
                  { id: 'active',   label: 'Aktive' },
                  { id: 'accepted', label: 'Pranuar' },
                  { id: 'expired',  label: 'Skaduar' },
                ] as const).map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    style={{
                      padding: '8px 14px', fontSize: 13, fontWeight: 700,
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontFamily: 'inherit', borderRadius: '8px 8px 0 0',
                      color: activeTab === tab.id ? '#f0ece4' : 'rgba(240,236,228,0.4)',
                      borderBottom: activeTab === tab.id ? '2px solid #e8621a' : '2px solid transparent',
                      transition: 'all 0.15s',
                    }}>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 320px)' }}>
              {loadingApps ? (
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[1,2,3].map(i => (
                    <div key={i} style={{ padding: 14, border: '1px solid rgba(240,236,228,0.07)', borderRadius: 12 }}>
                      <Skeleton h={15} w="70%" />
                      <div style={{ marginTop: 8 }}><Skeleton h={11} w="50%" /></div>
                    </div>
                  ))}
                </div>
              ) : applications.length === 0 ? (
                <div style={{ padding: '50px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: 48, marginBottom: 14 }}>📭</div>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>
                    {activeTab === 'active' ? 'Nuk ke aplikime aktive' : 'Nuk ka të dhëna'}
                  </div>
                  <p style={{ fontSize: 13, color: 'rgba(240,236,228,0.4)', lineHeight: 1.6 }}>
                    {activeTab === 'active' ? 'Posto projektin tënd dhe merr oferta brenda 24 orësh.' : ''}
                  </p>
                  {activeTab === 'active' && (
                    <Link href="/client/applications/new" style={{
                      display: 'inline-block', marginTop: 16,
                      background: '#e8621a', color: '#fff',
                      fontWeight: 700, fontSize: 13,
                      padding: '10px 20px', borderRadius: 10,
                      textDecoration: 'none',
                    }}>
                      + Posto tani
                    </Link>
                  )}
                </div>
              ) : (
                <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {applications.map(app => (
                    <button key={app.id}
                      onClick={() => setSelectedApp(app)}
                      style={{
                        width: '100%', textAlign: 'left', cursor: 'pointer',
                        padding: '14px 14px',
                        background: selectedApp?.id === app.id ? 'rgba(232,98,26,0.07)' : 'rgba(240,236,228,0.02)',
                        border: `1px solid ${selectedApp?.id === app.id ? 'rgba(232,98,26,0.3)' : 'rgba(240,236,228,0.07)'}`,
                        borderRadius: 12, fontFamily: 'inherit',
                        transition: 'all 0.15s',
                      }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#f0ece4', lineHeight: 1.3, flex: 1, marginRight: 8 }}>
                          {app.title}
                        </div>
                        <StatusBadge status={app.status} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' as const }}>
                        <span style={{ fontSize: 12, color: 'rgba(240,236,228,0.4)' }}>📍 {app.city}</span>
                        <span style={{ fontSize: 12, color: 'rgba(240,236,228,0.4)' }}>💼 {app.offer_count} oferta</span>
                      </div>
                      {app.status === 'active' && (
                        <div style={{ marginTop: 10 }}>
                          <Countdown expiresAt={app.expires_at} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Offers Panel */}
          <div style={{
            background: 'rgba(240,236,228,0.02)',
            border: '1px solid rgba(240,236,228,0.07)',
            borderRadius: 18, overflow: 'hidden',
          }}>
            {!selectedApp ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 40, textAlign: 'center', color: 'rgba(240,236,228,0.35)' }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>👆</div>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>
                  Zgjedh një aplikim
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.6, maxWidth: 260 }}>
                  Klikoni mbi një aplikim në listë për të parë ofertat e pranuara
                </p>
              </div>
            ) : (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

                {/* Offer panel header */}
                <div style={{ padding: '20px 22px', borderBottom: '1px solid rgba(240,236,228,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: '1.1rem', fontWeight: 800, marginBottom: 4 }}>
                      {selectedApp.title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <StatusBadge status={selectedApp.status} />
                      {selectedApp.status === 'active' && <Countdown expiresAt={selectedApp.expires_at} />}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(240,236,228,0.4)', textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: '#f0ece4' }}>{selectedApp.offer_count}</div>
                    <div>oferta</div>
                  </div>
                </div>

                {/* Offers list */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {loadingOffers ? (
                    [1,2].map(i => (
                      <div key={i} style={{ padding: 18, border: '1px solid rgba(240,236,228,0.07)', borderRadius: 14 }}>
                        <Skeleton h={14} w="60%" />
                        <div style={{ marginTop: 10 }}><Skeleton h={11} w="40%" /></div>
                      </div>
                    ))
                  ) : offers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '50px 20px', color: 'rgba(240,236,228,0.35)' }}>
                      <div style={{ fontSize: 48, marginBottom: 14 }}>⏳</div>
                      <div style={{ fontWeight: 700, marginBottom: 6 }}>Duke pritur oferta...</div>
                      <p style={{ fontSize: 13, lineHeight: 1.6 }}>Kompanitë janë njoftuar. Oferta do të vijnë brenda 24 orësh.</p>
                    </div>
                  ) : (
                    offers.map((offer, i) => (
                      <div key={offer.id} style={{
                        padding: '18px 20px',
                        background: i === 0 ? 'rgba(232,98,26,0.05)' : 'rgba(240,236,228,0.02)',
                        border: `1px solid ${i === 0 ? 'rgba(232,98,26,0.2)' : 'rgba(240,236,228,0.07)'}`,
                        borderRadius: 14,
                        animation: `fadeUp 0.3s ease ${i * 0.07}s both`,
                        position: 'relative' as const,
                      }}>

                        {/* Best offer badge */}
                        {i === 0 && offers.length > 1 && (
                          <div style={{
                            position: 'absolute', top: -1, right: 14,
                            background: '#e8621a', color: '#fff',
                            fontSize: 10, fontWeight: 800,
                            padding: '3px 10px', borderRadius: '0 0 8px 8px',
                            letterSpacing: '0.05em',
                          }}>
                            ★ REKOMANDUAR
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                              {offer.companies.business_name}
                              {offer.companies.is_verified && (
                                <span style={{ fontSize: 10, background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 100, padding: '2px 7px', fontWeight: 700 }}>✓ Verified</span>
                              )}
                            </div>
                            <div style={{ display: 'flex', gap: 3 }}>
                              {[1,2,3,4,5].map(s => (
                                <span key={s} style={{ fontSize: 11, color: s <= Math.round(offer.companies.rating_avg) ? '#f59e0b' : 'rgba(240,236,228,0.15)' }}>★</span>
                              ))}
                              <span style={{ fontSize: 11, color: 'rgba(240,236,228,0.4)', marginLeft: 4 }}>{offer.companies.rating_avg.toFixed(1)}</span>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontFamily: "'Fraunces',serif", fontSize: '1.6rem', fontWeight: 900, color: '#e8621a', lineHeight: 1 }}>
                              €{offer.price.toLocaleString()}
                            </div>
                            <div style={{ fontSize: 12, color: 'rgba(240,236,228,0.4)', marginTop: 2 }}>{offer.duration_days} ditë punë</div>
                          </div>
                        </div>

                        <p style={{ fontSize: 13, color: 'rgba(240,236,228,0.55)', lineHeight: 1.65, marginBottom: 16 }}>
                          {offer.description}
                        </p>

                        {selectedApp.status === 'active' && (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button style={{
                              flex: 1, padding: '10px', borderRadius: 10,
                              background: '#e8621a', border: 'none',
                              color: '#fff', fontFamily: "'Fraunces',serif",
                              fontWeight: 800, fontSize: '0.9rem',
                              cursor: 'pointer', transition: 'all 0.2s',
                            }}>
                              ✓ Prano Ofertën
                            </button>
                            <button style={{
                              padding: '10px 16px', borderRadius: 10,
                              background: 'rgba(240,236,228,0.05)',
                              border: '1px solid rgba(240,236,228,0.1)',
                              color: 'rgba(240,236,228,0.6)',
                              fontFamily: 'inherit', fontSize: 13,
                              cursor: 'pointer',
                            }}>
                              💬 Chat
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}