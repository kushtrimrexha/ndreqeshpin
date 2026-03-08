'use client'

import { useState } from 'react'
import { KpiCard, TrendAreaChart, StatsBarChart, StatsPieChart, ActivityFeed } from '@/components/Analytics'

interface Stats {
  totalUsers: number; totalCompanies: number; totalApplications: number
  totalOffers: number; totalReviews: number; activeApplications: number
  acceptedOffers: number; verifiedCompanies: number
  newUsersMonth: number; newAppsMonth: number; newOffersWeek: number
  successRate: number
}

interface Props {
  stats:                Stats
  recentUsers:          any[]
  recentApps:           any[]
  monthlyRegistrations: Record<string, number>
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function AdminStatsClient({ stats, recentUsers, recentApps, monthlyRegistrations }: Props) {

  const trendData = Object.entries(monthlyRegistrations).map(([label, value]) => ({ label, value }))

  const activityFeed = [
    ...recentUsers.slice(0, 3).map((u: any) => ({
      id: u.id,
      icon: u.role === 'company' ? '🏢' : u.role === 'worker' ? '🔧' : '👤',
      title: 'Regjistrim i ri',
      description: `${u.full_name} — ${u.role}${u.city ? ` · ${u.city}` : ''}`,
      time: new Date(u.created_at).toLocaleDateString('sq-AL'),
      color: u.role === 'company' ? '#e8621a' : u.role === 'worker' ? '#10b981' : '#3b82f6',
    })),
    ...recentApps.slice(0, 2).map((a: any) => ({
      id: a.id,
      icon: '📋',
      title: 'Aplikim i ri',
      description: `${a.title} — ${a.city || ''}`,
      time: new Date(a.created_at).toLocaleDateString('sq-AL'),
      color: '#a78bfa',
    })),
  ].sort((a, b) => 0)

  const rolePie = [
    { label: 'Klientë',  value: Math.max(0, stats.totalUsers - stats.totalCompanies - Math.round(stats.totalUsers * 0.3)), color: '#3b82f6' },
    { label: 'Kompani',  value: stats.totalCompanies, color: '#e8621a' },
    { label: 'Punëtorë', value: Math.round(stats.totalUsers * 0.3), color: '#10b981' },
  ].filter(d => d.value > 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @media(max-width:900px){ .stats-grid-2{ grid-template-columns:1fr !important } }
        @media(max-width:600px){ .kpi-grid{ grid-template-columns:1fr 1fr !important } }
      `}</style>

      {/* ── Header ── */}
      <div style={{ animation: 'fadeUp 0.5s ease' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(240,236,228,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Analitikë</p>
        <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          Statistikat e <span style={{ color: '#a78bfa', fontStyle: 'italic' }}>platformës</span>
        </h1>
      </div>

      {/* ── KPI Cards ── */}
      <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 12 }}>
        <KpiCard title="Përdorues total"  value={stats.totalUsers}         icon="👥" color="#3b82f6"  changeLabel="regjistruar" />
        <KpiCard title="Kompani"           value={stats.totalCompanies}      icon="🏢" color="#e8621a"  changeLabel="aktive" />
        <KpiCard title="Aplikimet"         value={stats.totalApplications}   icon="📋" color="#10b981"  changeLabel="gjithsej" />
        <KpiCard title="Ofertat"           value={stats.totalOffers}         icon="💼" color="#fbbf24"  changeLabel="dërguar" />
        <KpiCard title="Të pranuara"       value={stats.acceptedOffers}      icon="✅" color="#22d3a5"  changeLabel="oferta" />
        <KpiCard title="Të verifikuara"    value={stats.verifiedCompanies}   icon="✓"  color="#10b981"  changeLabel="kompani" />
        <KpiCard title="Regjistrime/muaj" value={stats.newUsersMonth}       icon="📈" color="#a78bfa"  changeLabel="këtë muaj" />
        <KpiCard title="Norma suksesit"    value={`${stats.successRate}%`}   icon="🎯" color="#60a5fa"  changeLabel="oferta pranuar" />
      </div>

      {/* ── Charts Row 1 ── */}
      <div className="stats-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <TrendAreaChart
          data={trendData}
          title="📈 Regjistrime — 6 muajt e fundit"
          color="#3b82f6"
          name="Regjistrime"
          height={200}
        />
        <StatsPieChart
          data={rolePie}
          title="👥 Shpërndarje sipas roleve"
          height={200}
        />
      </div>

      {/* ── Charts Row 2 ── */}
      <div className="stats-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <StatsBarChart
          data={trendData}
          title="📊 Regjistrime mujore"
          color="#a78bfa"
          name="Përdorues"
          height={180}
        />
        <ActivityFeed items={activityFeed} title="⚡ Aktiviteti i fundit" />
      </div>

      {/* ── Highlight Metrics ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        {[
          { label: 'Norma suksesit',   value: `${stats.successRate}%`,          icon: '🎯', desc: 'oferta të pranuara',   color: '#22d3a5' },
          { label: 'Verifikimi',        value: stats.totalCompanies > 0 ? `${Math.round((stats.verifiedCompanies / stats.totalCompanies) * 100)}%` : '—', icon: '✓', desc: 'e kompanive', color: '#10b981' },
          { label: 'Aktive tani',       value: stats.activeApplications,          icon: '🔥', desc: 'aplikime aktive',       color: '#e8621a' },
        ].map((m, i) => (
          <div key={i} style={{ background: 'rgba(240,236,228,0.02)', border: '1px solid rgba(240,236,228,0.07)', borderRadius: 16, padding: 24, textAlign: 'center', animation: `fadeUp 0.4s ease ${i * 0.1}s both` }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>{m.icon}</div>
            <div style={{ fontFamily: "'Fraunces',serif", fontSize: '2.2rem', fontWeight: 900, color: m.color, lineHeight: 1, marginBottom: 8 }}>{m.value}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(240,236,228,0.6)', marginBottom: 4 }}>{m.label}</div>
            <div style={{ fontSize: 11, color: 'rgba(240,236,228,0.3)' }}>{m.desc}</div>
          </div>
        ))}
      </div>

      {/* ── Recent Users Table ── */}
      {recentUsers.length > 0 && (
        <div style={{ background: 'rgba(240,236,228,0.02)', border: '1px solid rgba(240,236,228,0.07)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(240,236,228,0.07)', fontSize: 13, fontWeight: 700, color: 'rgba(240,236,228,0.6)' }}>
            👥 Regjistrimet e fundit
          </div>
          {recentUsers.map((u: any, i: number) => (
            <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 120px', gap: 12, padding: '12px 20px', borderBottom: i < recentUsers.length - 1 ? '1px solid rgba(240,236,228,0.05)' : 'none', alignItems: 'center', animation: `fadeUp 0.3s ease ${i * 0.04}s both` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: u.role === 'company' ? 'rgba(232,98,26,0.15)' : u.role === 'worker' ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: u.role === 'company' ? '#e8621a' : u.role === 'worker' ? '#10b981' : '#3b82f6', flexShrink: 0 }}>
                  {(u.full_name || 'U').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#f0ece4' }}>{u.full_name}</div>
                  {u.city && <div style={{ fontSize: 11, color: 'rgba(240,236,228,0.35)' }}>📍 {u.city}</div>}
                </div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: u.role === 'company' ? '#e8621a' : u.role === 'worker' ? '#10b981' : '#3b82f6', background: u.role === 'company' ? 'rgba(232,98,26,0.1)' : u.role === 'worker' ? 'rgba(16,185,129,0.1)' : 'rgba(59,130,246,0.1)', borderRadius: 7, padding: '3px 10px', textAlign: 'center' }}>
                {u.role === 'company' ? '🏢 Kompani' : u.role === 'worker' ? '🔧 Punëtor' : '👤 Klient'}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(240,236,228,0.35)', textAlign: 'right' }}>
                {new Date(u.created_at).toLocaleDateString('sq-AL', { day: 'numeric', month: 'short' })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}