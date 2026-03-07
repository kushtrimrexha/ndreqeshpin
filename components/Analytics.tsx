'use client'

import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

// ── Custom Tooltip ──────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, prefix = '', suffix = '' }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#141210', border: '1px solid rgba(240,236,228,0.12)', borderRadius: 10, padding: '10px 14px', fontFamily: "'DM Sans',sans-serif", boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
      {label && <div style={{ fontSize: 11, color: 'rgba(240,236,228,0.4)', marginBottom: 6, fontWeight: 600 }}>{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ fontSize: 13, color: p.color || '#f0ece4', fontWeight: 700 }}>
          {p.name && <span style={{ color: 'rgba(240,236,228,0.5)', fontWeight: 500, marginRight: 6 }}>{p.name}:</span>}
          {prefix}{typeof p.value === 'number' ? p.value.toLocaleString('sq-AL') : p.value}{suffix}
        </div>
      ))}
    </div>
  )
}

// ── Area Chart (Trend) ──────────────────────────────────────────────────────
interface AreaChartProps {
  data: { label: string; value: number; value2?: number }[]
  title: string
  color?: string
  color2?: string
  prefix?: string
  suffix?: string
  height?: number
  name?: string
  name2?: string
}

export function TrendAreaChart({ data, title, color = '#e8621a', color2, prefix = '', suffix = '', height = 200, name, name2 }: AreaChartProps) {
  const chartData = data.map(d => ({ name: d.label, [name || 'Vlera']: d.value, ...(d.value2 !== undefined ? { [name2 || 'Vlera2']: d.value2 } : {}) }))
  return (
    <div style={{ background: 'rgba(240,236,228,0.02)', border: '1px solid rgba(240,236,228,0.07)', borderRadius: 16, padding: '20px 20px 12px', fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#f0ece4', marginBottom: 16, opacity: 0.7 }}>{title}</div>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
            {color2 && (
              <linearGradient id={`grad-${color2.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color2} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color2} stopOpacity={0} />
              </linearGradient>
            )}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(240,236,228,0.05)" />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'rgba(240,236,228,0.3)', fontFamily: "'DM Sans',sans-serif" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: 'rgba(240,236,228,0.3)', fontFamily: "'DM Sans',sans-serif" }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip prefix={prefix} suffix={suffix} />} />
          <Area type="monotone" dataKey={name || 'Vlera'} stroke={color} strokeWidth={2} fill={`url(#grad-${color.replace('#', '')})`} dot={false} activeDot={{ r: 5, fill: color, stroke: '#0a0908', strokeWidth: 2 }} />
          {color2 && name2 && <Area type="monotone" dataKey={name2} stroke={color2} strokeWidth={2} fill={`url(#grad-${color2.replace('#', '')})`} dot={false} activeDot={{ r: 5, fill: color2, stroke: '#0a0908', strokeWidth: 2 }} />}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Bar Chart ───────────────────────────────────────────────────────────────
interface BarChartProps {
  data: { label: string; value: number; value2?: number }[]
  title: string
  color?: string
  color2?: string
  prefix?: string
  suffix?: string
  height?: number
  name?: string
  name2?: string
}

export function StatsBarChart({ data, title, color = '#e8621a', color2, prefix = '', suffix = '', height = 200, name, name2 }: BarChartProps) {
  const chartData = data.map(d => ({ name: d.label, [name || 'Vlera']: d.value, ...(d.value2 !== undefined ? { [name2 || 'Vlera2']: d.value2 } : {}) }))
  return (
    <div style={{ background: 'rgba(240,236,228,0.02)', border: '1px solid rgba(240,236,228,0.07)', borderRadius: 16, padding: '20px 20px 12px', fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#f0ece4', marginBottom: 16, opacity: 0.7 }}>{title}</div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }} barSize={color2 ? 10 : 16}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(240,236,228,0.05)" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'rgba(240,236,228,0.3)', fontFamily: "'DM Sans',sans-serif" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: 'rgba(240,236,228,0.3)', fontFamily: "'DM Sans',sans-serif" }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip prefix={prefix} suffix={suffix} />} cursor={{ fill: 'rgba(240,236,228,0.03)' }} />
          <Bar dataKey={name || 'Vlera'} fill={color} radius={[4, 4, 0, 0]} />
          {color2 && name2 && <Bar dataKey={name2} fill={color2} radius={[4, 4, 0, 0]} />}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Pie / Donut Chart ───────────────────────────────────────────────────────
interface PieChartProps {
  data: { label: string; value: number; color?: string }[]
  title: string
  height?: number
  donut?: boolean
}

const DEFAULT_COLORS = ['#e8621a', '#3b82f6', '#10b981', '#a78bfa', '#f59e0b', '#ec4899']

export function StatsPieChart({ data, title, height = 200, donut = true }: PieChartProps) {
  const chartData = data.map(d => ({ name: d.label, value: d.value }))
  const total = data.reduce((s, d) => s + d.value, 0)
  return (
    <div style={{ background: 'rgba(240,236,228,0.02)', border: '1px solid rgba(240,236,228,0.07)', borderRadius: 16, padding: '20px 20px 12px', fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#f0ece4', marginBottom: 16, opacity: 0.7 }}>{title}</div>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" innerRadius={donut ? height * 0.25 : 0} outerRadius={height * 0.38} dataKey="value" paddingAngle={2}>
            {chartData.map((_, i) => <Cell key={i} fill={data[i].color || DEFAULT_COLORS[i % DEFAULT_COLORS.length]} stroke="transparent" />)}
          </Pie>
          <Tooltip content={({ active, payload }: any) => {
            if (!active || !payload?.length) return null
            const item = payload[0]
            const pct = total > 0 ? Math.round((item.value / total) * 100) : 0
            return (
              <div style={{ background: '#141210', border: '1px solid rgba(240,236,228,0.12)', borderRadius: 10, padding: '10px 14px', fontFamily: "'DM Sans',sans-serif" }}>
                <div style={{ fontSize: 12, color: item.payload.fill, fontWeight: 700 }}>{item.name}</div>
                <div style={{ fontSize: 13, color: '#f0ece4', fontWeight: 700 }}>{item.value.toLocaleString('sq-AL')} <span style={{ fontSize: 11, opacity: 0.5 }}>({pct}%)</span></div>
              </div>
            )
          }} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: 'rgba(240,236,228,0.5)', fontFamily: "'DM Sans',sans-serif", paddingTop: 8 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Mini Sparkline ──────────────────────────────────────────────────────────
interface SparklineProps {
  data: number[]
  color?: string
  height?: number
  width?: number | string
}

export function Sparkline({ data, color = '#e8621a', height = 40, width = '100%' }: SparklineProps) {
  const chartData = data.map((v, i) => ({ i, v }))
  return (
    <ResponsiveContainer width={width} height={height}>
      <LineChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ── KPI Card with Sparkline ─────────────────────────────────────────────────
interface KpiCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: string
  color?: string
  sparkline?: number[]
  prefix?: string
  suffix?: string
  onClick?: () => void
}

export function KpiCard({ title, value, change, changeLabel, icon, color = '#e8621a', sparkline, prefix = '', suffix = '', onClick }: KpiCardProps) {
  const isPositive = change !== undefined && change >= 0
  return (
    <div onClick={onClick}
      style={{ background: 'rgba(240,236,228,0.02)', border: '1px solid rgba(240,236,228,0.07)', borderRadius: 16, padding: '18px 20px', cursor: onClick ? 'pointer' : 'default', transition: 'border-color 0.2s', fontFamily: "'DM Sans',sans-serif" }}
      onMouseEnter={e => onClick && (e.currentTarget.style.borderColor = `${color}40`)}
      onMouseLeave={e => onClick && (e.currentTarget.style.borderColor = 'rgba(240,236,228,0.07)')}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{icon}</div>
        {change !== undefined && (
          <span style={{ fontSize: 11, fontWeight: 700, color: isPositive ? '#10b981' : '#ef4444', background: isPositive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${isPositive ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`, borderRadius: 100, padding: '2px 8px' }}>
            {isPositive ? '↑' : '↓'} {Math.abs(change)}%
          </span>
        )}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: '#f0ece4', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 6 }}>
        {prefix}{typeof value === 'number' ? value.toLocaleString('sq-AL') : value}{suffix}
      </div>
      <div style={{ fontSize: 12, color: 'rgba(240,236,228,0.4)', fontWeight: 500 }}>{title}</div>
      {changeLabel && <div style={{ fontSize: 11, color: 'rgba(240,236,228,0.25)', marginTop: 2 }}>{changeLabel}</div>}
      {sparkline && sparkline.length > 1 && (
        <div style={{ marginTop: 12, opacity: 0.6 }}>
          <Sparkline data={sparkline} color={color} height={36} />
        </div>
      )}
    </div>
  )
}

// ── Activity Feed ───────────────────────────────────────────────────────────
interface ActivityItem {
  id: string
  icon: string
  title: string
  description: string
  time: string
  color?: string
}

export function ActivityFeed({ items, title = 'Aktiviteti i fundit' }: { items: ActivityItem[]; title?: string }) {
  return (
    <div style={{ background: 'rgba(240,236,228,0.02)', border: '1px solid rgba(240,236,228,0.07)', borderRadius: 16, padding: '20px', fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#f0ece4', marginBottom: 16, opacity: 0.7 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {items.map((item, i) => (
          <div key={item.id} style={{ display: 'flex', gap: 12, paddingBottom: i < items.length - 1 ? 14 : 0, marginBottom: i < items.length - 1 ? 14 : 0, borderBottom: i < items.length - 1 ? '1px solid rgba(240,236,228,0.05)' : 'none' }}>
            <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: `${item.color || '#e8621a'}18`, border: `1px solid ${item.color || '#e8621a'}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{item.icon}</div>
              {i < items.length - 1 && <div style={{ width: 1, flex: 1, background: 'rgba(240,236,228,0.05)', marginTop: 6 }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#f0ece4', marginBottom: 2 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: 'rgba(240,236,228,0.4)', lineHeight: 1.5 }}>{item.description}</div>
              <div style={{ fontSize: 11, color: 'rgba(240,236,228,0.25)', marginTop: 4 }}>{item.time}</div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(240,236,228,0.25)', fontSize: 13 }}>Asnjë aktivitet ende</div>
        )}
      </div>
    </div>
  )
}