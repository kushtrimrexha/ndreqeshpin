'use client'

import { useState } from 'react'
import Sidebar       from '@/components/Sidebar'

interface AdminProfile { id: string; full_name: string; package_type: string }
interface Company {
  id: string; business_name: string; is_verified: boolean
  rating_avg: number; package_type: string; created_at: string
  profiles?: { full_name: string; city: string; created_at: string }
}
interface User {
  id: string; full_name: string; city: string; role: string
  package_type: string; created_at: string
}

interface Props {
  adminProfile:       AdminProfile
  initialCompanies:   Company[]
  initialUsers:       User[]
  totalApplications:  number
  totalOffers:        number
}

const ROLES = ['client', 'company', 'worker', 'admin']
const ROLE_META: Record<string, { label: string; col: string }> = {
  client:  { label: 'Klient',  col: '#60a5fa' },
  company: { label: 'Kompani', col: '#e8621a' },
  worker:  { label: 'Punëtor', col: '#22d3a5' },
  admin:   { label: 'Admin',   col: '#a78bfa' },
}

export default function AdminDashboard({
  adminProfile, initialCompanies, initialUsers,
  totalApplications, totalOffers,
}: Props) {
  const [tab,       setTab]       = useState<'overview'|'companies'|'users'>('overview')
  const [companies, setCompanies] = useState<Company[]>(initialCompanies)
  const [users,     setUsers]     = useState<User[]>(initialUsers)
  const [search,    setSearch]    = useState('')
  const [toast,     setToast]     = useState<{ msg: string; ok: boolean } | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 4000)
  }

  // ── Verify / unverify company ─────────────
  async function toggleVerify(company: Company) {
    setLoadingId(company.id)
    try {
      const res = await fetch('/api/admin/verify-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: company.id, is_verified: !company.is_verified }),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error, false); return }
      setCompanies(prev => prev.map(c => c.id === company.id ? { ...c, is_verified: !c.is_verified } : c))
      showToast(company.is_verified ? `"${company.business_name}" u çverifikua.` : `"${company.business_name}" u verifikua! ✅`)
    } catch {
      showToast('Gabim lidhje.', false)
    } finally {
      setLoadingId(null)
    }
  }

  // ── Update user role ──────────────────────
  async function updateRole(user: User, newRole: string) {
    setLoadingId(user.id)
    try {
      const res = await fetch('/api/admin/update-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, role: newRole }),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error, false); return }
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u))
      showToast(`Roli i "${user.full_name}" u ndryshua në ${newRole}. ✅`)
    } catch {
      showToast('Gabim lidhje.', false)
    } finally {
      setLoadingId(null)
    }
  }

  const filteredCompanies = companies.filter(c =>
    c.business_name.toLowerCase().includes(search.toLowerCase()) ||
    c.profiles?.full_name.toLowerCase().includes(search.toLowerCase())
  )

  const filteredUsers = users.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.city?.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    totalUsers:     users.length,
    totalCompanies: companies.length,
    verified:       companies.filter(c => c.is_verified).length,
    pending:        companies.filter(c => !c.is_verified).length,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080b12', color: '#e8eaf0', fontFamily: "'DM Sans','Helvetica Neue',sans-serif", display: 'flex' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.4} }
        * { box-sizing:border-box; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.08); border-radius:4px; }
        .row:hover { background:rgba(255,255,255,0.04) !important; }
        .verify-btn:hover { opacity:.85 !important; }
        select option { background:#1a1f2e; color:#e8eaf0; }
      `}</style>

      <Sidebar role="admin" userName={adminProfile.full_name} package={adminProfile.package_type} />

      <div style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>

        {/* Toast */}
        {toast && (
          <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 600, background: toast.ok ? 'rgba(34,211,165,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${toast.ok ? 'rgba(34,211,165,0.3)' : 'rgba(239,68,68,0.3)'}`, color: toast.ok ? '#22d3a5' : '#f87171', padding: '14px 22px', borderRadius: 13, fontSize: 14, fontWeight: 600, boxShadow: '0 12px 40px rgba(0,0,0,0.4)', animation: 'fadeUp 0.3s ease' }}>
            {toast.msg}
          </div>
        )}

        {/* Top bar */}
        <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(8,11,18,0.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 32px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#a78bfa', boxShadow: '0 0 8px #a78bfa' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(232,234,240,0.6)' }}>Admin Panel</span>
          </div>

          {/* Tab switcher */}
          <div style={{ display: 'flex', gap: 3, background: 'rgba(255,255,255,0.05)', padding: 4, borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)' }}>
            {([['overview','📊 Overview'],['companies','🏢 Kompanitë'],['users','👥 Përdoruesit']] as const).map(([id, label]) => (
              <button key={id} onClick={() => { setTab(id); setSearch('') }}
                style={{ padding: '8px 16px', borderRadius: 9, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', background: tab === id ? '#a78bfa' : 'transparent', color: tab === id ? '#fff' : 'rgba(232,234,240,0.45)', transition: 'all 0.2s' }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: '32px 32px 48px' }}>

          {/* Header */}
          <div style={{ marginBottom: 32, animation: 'fadeUp 0.4s ease' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(232,234,240,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Administrator</p>
            <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 6 }}>
              Paneli i <span style={{ color: '#a78bfa', fontStyle: 'italic' }}>Kontrollit</span>
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(232,234,240,0.4)' }}>Menaxho kompanitë, rolet dhe platformën</p>
          </div>

          {/* ── OVERVIEW ────────────────────── */}
          {tab === 'overview' && (
            <div style={{ animation: 'fadeUp 0.4s ease' }}>
              {/* Stats grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 32 }}>
                {[
                  { label: 'Përdorues total',   val: stats.totalUsers,     icon: '👥', col: '#60a5fa' },
                  { label: 'Kompani',            val: stats.totalCompanies, icon: '🏢', col: '#e8621a' },
                  { label: 'Aplikimet',          val: totalApplications,    icon: '📋', col: '#22d3a5' },
                  { label: 'Ofertat',            val: totalOffers,          icon: '💼', col: '#fbbf24' },
                ].map((s, i) => (
                  <div key={i} style={{ padding: '22px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, position: 'relative', overflow: 'hidden', animation: `fadeUp 0.4s ease ${i * 0.07}s both` }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${s.col},${s.col}44)` }} />
                    <div style={{ fontSize: 26, marginBottom: 12 }}>{s.icon}</div>
                    <div style={{ fontFamily: "'Fraunces',serif", fontSize: '2.2rem', fontWeight: 900, color: s.col, lineHeight: 1, marginBottom: 6 }}>{s.val}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(232,234,240,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Pending verifications alert */}
              {stats.pending > 0 && (
                <div style={{ padding: '18px 22px', background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 16, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(251,191,36,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>⏳</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: '#fbbf24', marginBottom: 4 }}>{stats.pending} kompani presin verifikim</div>
                    <p style={{ fontSize: 13, color: 'rgba(232,234,240,0.5)', lineHeight: 1.6 }}>Shko tek "Kompanitë" për të verifikuar apo refuzuar kërkesat e reja.</p>
                  </div>
                  <button onClick={() => setTab('companies')}
                    style={{ padding: '9px 18px', borderRadius: 10, background: '#fbbf24', border: 'none', color: '#000', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
                    Shiko →
                  </button>
                </div>
              )}

              {/* Role breakdown */}
              <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18 }}>
                <h3 style={{ fontFamily: "'Fraunces',serif", fontWeight: 800, fontSize: '1.05rem', marginBottom: 20 }}>Përdorues sipas rolit</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                  {ROLES.map(role => {
                    const count = users.filter(u => u.role === role).length
                    const meta  = ROLE_META[role]
                    const pct   = users.length > 0 ? Math.round((count / users.length) * 100) : 0
                    return (
                      <div key={role} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${meta.col}25`, borderRadius: 14 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: meta.col, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>{meta.label}</div>
                        <div style={{ fontFamily: "'Fraunces',serif", fontSize: '1.8rem', fontWeight: 900, color: meta.col, lineHeight: 1, marginBottom: 10 }}>{count}</div>
                        <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2 }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: meta.col, borderRadius: 2, transition: 'width 1s ease' }} />
                        </div>
                        <div style={{ fontSize: 11, color: 'rgba(232,234,240,0.35)', marginTop: 5 }}>{pct}%</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── COMPANIES ───────────────────── */}
          {tab === 'companies' && (
            <div style={{ animation: 'fadeUp 0.4s ease' }}>
              {/* Search + stats */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1, position: 'relative' as const }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>🔍</span>
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Kërko kompani..."
                    style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 11, padding: '10px 14px 10px 36px', fontSize: 13, color: '#e8eaf0', fontFamily: 'inherit', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[{ l: 'Total', v: stats.totalCompanies, c: '#e8eaf0' }, { l: 'Verifikuar', v: stats.verified, c: '#22d3a5' }, { l: 'Në pritje', v: stats.pending, c: '#fbbf24' }].map(s => (
                    <div key={s.l} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, textAlign: 'center' as const }}>
                      <div style={{ fontFamily: "'Fraunces',serif", fontWeight: 900, fontSize: '1.2rem', color: s.c }}>{s.v}</div>
                      <div style={{ fontSize: 11, color: 'rgba(232,234,240,0.4)' }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Table header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 120px 100px 140px', gap: 12, padding: '8px 18px', fontSize: 11, fontWeight: 700, color: 'rgba(232,234,240,0.3)', textTransform: 'uppercase' as const, letterSpacing: '0.07em', marginBottom: 6 }}>
                <span>Kompania</span><span>Pronari</span><span>Paketa</span><span>Statusi</span><span>Veprimi</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filteredCompanies.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(232,234,240,0.3)' }}>
                    <div style={{ fontSize: 44, marginBottom: 12 }}>🏢</div>
                    <div style={{ fontWeight: 700 }}>Nuk u gjet asnjë kompani</div>
                  </div>
                ) : filteredCompanies.map((company, i) => (
                  <div key={company.id} className="row"
                    style={{ display: 'grid', gridTemplateColumns: '1fr 160px 120px 100px 140px', gap: 12, padding: '16px 18px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${!company.is_verified ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 14, alignItems: 'center', animation: `fadeUp 0.3s ease ${i * 0.04}s both`, transition: 'background 0.15s' }}>

                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{company.business_name}</div>
                      <div style={{ fontSize: 12, color: 'rgba(232,234,240,0.4)' }}>
                        📅 {new Date(company.created_at).toLocaleDateString('sq-AL')}
                        {company.rating_avg > 0 && ` · ⭐ ${company.rating_avg.toFixed(1)}`}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{company.profiles?.full_name || '—'}</div>
                      <div style={{ fontSize: 11, color: 'rgba(232,234,240,0.4)' }}>{company.profiles?.city || ''}</div>
                    </div>

                    <span style={{ fontSize: 11, fontWeight: 700, color: company.package_type !== 'free' ? '#fbbf24' : 'rgba(232,234,240,0.4)', background: company.package_type !== 'free' ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${company.package_type !== 'free' ? 'rgba(251,191,36,0.25)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 6, padding: '3px 10px', display: 'inline-block' }}>
                      {company.package_type !== 'free' ? '💎 Premium' : '🆓 Falas'}
                    </span>

                    <span style={{ fontSize: 11, fontWeight: 700, color: company.is_verified ? '#22d3a5' : '#fbbf24', background: company.is_verified ? 'rgba(34,211,165,0.1)' : 'rgba(251,191,36,0.1)', border: `1px solid ${company.is_verified ? 'rgba(34,211,165,0.25)' : 'rgba(251,191,36,0.25)'}`, borderRadius: 6, padding: '4px 10px', display: 'inline-block' }}>
                      {company.is_verified ? '✓ Verifikuar' : '⏳ Në pritje'}
                    </span>

                    <button className="verify-btn"
                      onClick={() => toggleVerify(company)}
                      disabled={loadingId === company.id}
                      style={{ padding: '9px 16px', borderRadius: 10, border: 'none', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, cursor: loadingId === company.id ? 'not-allowed' : 'pointer', background: company.is_verified ? 'rgba(239,68,68,0.12)' : 'rgba(34,211,165,0.12)', color: company.is_verified ? '#f87171' : '#22d3a5', border: `1px solid ${company.is_verified ? 'rgba(239,68,68,0.25)' : 'rgba(34,211,165,0.25)'}`, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {loadingId === company.id ? (
                        <div style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.2)', borderTop: '2px solid currentColor', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      ) : company.is_verified ? '✕ Hiq verifikimin' : '✓ Verifiko'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── USERS ───────────────────────── */}
          {tab === 'users' && (
            <div style={{ animation: 'fadeUp 0.4s ease' }}>
              <div style={{ position: 'relative' as const, marginBottom: 20 }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>🔍</span>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Kërko sipas emrit ose qytetit..."
                  style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 11, padding: '10px 14px 10px 36px', fontSize: 13, color: '#e8eaf0', fontFamily: 'inherit', outline: 'none' }} />
              </div>

              {/* Table header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px 150px', gap: 12, padding: '8px 18px', fontSize: 11, fontWeight: 700, color: 'rgba(232,234,240,0.3)', textTransform: 'uppercase' as const, letterSpacing: '0.07em', marginBottom: 6 }}>
                <span>Përdoruesi</span><span>Qyteti</span><span>Regjistrimi</span><span>Roli</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filteredUsers.map((user, i) => {
                  const meta = ROLE_META[user.role] || ROLE_META.client
                  return (
                    <div key={user.id} className="row"
                      style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px 150px', gap: 12, padding: '14px 18px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, alignItems: 'center', animation: `fadeUp 0.3s ease ${i * 0.03}s both`, transition: 'background 0.15s' }}>

                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{user.full_name}</div>
                        <div style={{ fontSize: 11, color: 'rgba(232,234,240,0.35)', fontFamily: 'monospace' }}>{user.id.slice(0,16)}…</div>
                      </div>

                      <span style={{ fontSize: 13, color: 'rgba(232,234,240,0.5)' }}>📍 {user.city || '—'}</span>

                      <span style={{ fontSize: 12, color: 'rgba(232,234,240,0.4)' }}>
                        {new Date(user.created_at).toLocaleDateString('sq-AL')}
                      </span>

                      {/* Role selector */}
                      <div style={{ position: 'relative' as const }}>
                        <select
                          value={user.role}
                          disabled={loadingId === user.id}
                          onChange={e => updateRole(user, e.target.value)}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: 10, background: `${meta.col}15`, border: `1px solid ${meta.col}40`, color: meta.col, fontSize: 12, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', outline: 'none', appearance: 'none' as const }}>
                          {ROLES.map(r => (
                            <option key={r} value={r}>{ROLE_META[r].label}</option>
                          ))}
                        </select>
                        {loadingId === user.id && (
                          <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 12, height: 12, border: '2px solid rgba(255,255,255,0.2)', borderTop: `2px solid ${meta.col}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}