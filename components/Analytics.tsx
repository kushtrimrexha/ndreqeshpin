'use client'

import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, RadialBarChart, RadialBar,
  FunnelChart, Funnel, LabelList
} from 'recharts'
import { useState } from 'react'

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, prefix = '', suffix = '' }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#141210', border:'1px solid rgba(240,236,228,0.12)', borderRadius:10, padding:'10px 14px', fontFamily:"'DM Sans',sans-serif", boxShadow:'0 8px 24px rgba(0,0,0,0.4)' }}>
      {label && <div style={{ fontSize:11, color:'rgba(240,236,228,0.4)', marginBottom:6, fontWeight:600 }}>{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ fontSize:13, color:p.color||'#f0ece4', fontWeight:700 }}>
          {p.name && <span style={{ color:'rgba(240,236,228,0.5)', fontWeight:500, marginRight:6 }}>{p.name}:</span>}
          {prefix}{typeof p.value === 'number' ? p.value.toLocaleString('sq-AL') : p.value}{suffix}
        </div>
      ))}
    </div>
  )
}

// ── KPI Card ─────────────────────────────────────────────────────────────────
interface KpiCardProps {
  title:       string
  value:       number | string
  icon:        string
  color?:      string
  change?:     number        // percentage change e.g. 12.5
  changeLabel?:string
  prefix?:     string
  suffix?:     string
  subtitle?:   string
  onClick?:    () => void
}

export function KpiCard({ title, value, icon, color = '#e8621a', change, changeLabel, prefix = '', suffix = '', subtitle, onClick }: KpiCardProps) {
  const isPositive = change !== undefined && change >= 0
  return (
    <div onClick={onClick}
      style={{ background:'rgba(240,236,228,0.02)', border:`1px solid ${color}18`, borderRadius:16, padding:'18px 20px', position:'relative', overflow:'hidden', transition:'all 0.2s', cursor:onClick?'pointer':'default', fontFamily:"'DM Sans',sans-serif" }}
      onMouseEnter={e => { if (onClick) { (e.currentTarget as HTMLElement).style.background = `${color}08`; (e.currentTarget as HTMLElement).style.borderColor = `${color}30` } }}
      onMouseLeave={e => { if (onClick) { (e.currentTarget as HTMLElement).style.background = 'rgba(240,236,228,0.02)'; (e.currentTarget as HTMLElement).style.borderColor = `${color}18` } }}>
      {/* Glow blob */}
      <div style={{ position:'absolute', top:-30, right:-20, width:90, height:90, background:color, opacity:0.04, borderRadius:'50%', filter:'blur(25px)', pointerEvents:'none' }}/>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
        <div style={{ width:36, height:36, borderRadius:11, background:`${color}14`, border:`1px solid ${color}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17 }}>{icon}</div>
        {change !== undefined && (
          <span style={{ fontSize:11, fontWeight:700, color:isPositive?'#22d3a5':'#f87171', background:isPositive?'rgba(34,211,165,0.08)':'rgba(248,113,113,0.08)', border:`1px solid ${isPositive?'rgba(34,211,165,0.2)':'rgba(248,113,113,0.2)'}`, borderRadius:6, padding:'2px 7px' }}>
            {isPositive?'↑':'↓'} {Math.abs(change)}%
          </span>
        )}
      </div>
      <div style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(1.3rem,2.5vw,1.8rem)', fontWeight:900, color, lineHeight:1, marginBottom:6, letterSpacing:'-0.02em' }}>
        {prefix}{typeof value === 'number' ? value.toLocaleString('sq-AL') : value}{suffix}
      </div>
      <div style={{ fontSize:12, fontWeight:600, color:'rgba(240,236,228,0.45)', marginBottom:changeLabel?2:0 }}>{title}</div>
      {changeLabel && <div style={{ fontSize:11, color:'rgba(240,236,228,0.3)' }}>{changeLabel}</div>}
      {subtitle && <div style={{ fontSize:11, color:'rgba(240,236,228,0.3)', marginTop:2 }}>{subtitle}</div>}
    </div>
  )
}

// ── Area Chart ────────────────────────────────────────────────────────────────
interface AreaChartProps {
  data:    { label:string; value:number; value2?:number }[]
  title:   string
  color?:  string
  color2?: string
  prefix?: string
  suffix?: string
  height?: number
  name?:   string
  name2?:  string
}

export function TrendAreaChart({ data, title, color = '#e8621a', color2, prefix = '', suffix = '', height = 200, name, name2 }: AreaChartProps) {
  const chartData = data.map(d => ({ name: d.label, [name||'Vlera']: d.value, ...(d.value2 !== undefined ? { [name2||'Vlera2']: d.value2 } : {}) }))
  return (
    <div style={{ background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:16, padding:'20px 20px 12px', fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ fontSize:13, fontWeight:700, color:'rgba(240,236,228,0.6)', marginBottom:16 }}>{title}</div>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top:4, right:4, bottom:0, left:-20 }}>
          <defs>
            <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
            {color2 && (
              <linearGradient id={`grad-${color2.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={color2} stopOpacity={0.25}/>
                <stop offset="95%" stopColor={color2} stopOpacity={0}/>
              </linearGradient>
            )}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(240,236,228,0.05)" vertical={false}/>
          <XAxis dataKey="name" tick={{ fontSize:11, fill:'rgba(240,236,228,0.3)', fontFamily:"'DM Sans'" }} axisLine={false} tickLine={false}/>
          <YAxis tick={{ fontSize:10, fill:'rgba(240,236,228,0.25)' }} axisLine={false} tickLine={false}/>
          <Tooltip content={<CustomTooltip prefix={prefix} suffix={suffix}/>}/>
          <Area type="monotone" dataKey={name||'Vlera'} stroke={color} strokeWidth={2} fill={`url(#grad-${color.replace('#','')})`} dot={false} activeDot={{ r:4, fill:color, strokeWidth:0 }}/>
          {color2 && <Area type="monotone" dataKey={name2||'Vlera2'} stroke={color2} strokeWidth={2} fill={`url(#grad-${color2.replace('#','')})`} dot={false} activeDot={{ r:4, fill:color2, strokeWidth:0 }}/>}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Bar Chart ─────────────────────────────────────────────────────────────────
interface BarChartProps {
  data:    { label:string; value:number; value2?:number }[]
  title:   string
  color?:  string
  color2?: string
  height?: number
  name?:   string
  name2?:  string
}

export function StatsBarChart({ data, title, color = '#e8621a', color2, height = 180, name, name2 }: BarChartProps) {
  const chartData = data.map(d => ({ name:d.label, [name||'Vlera']:d.value, ...(d.value2!==undefined?{[name2||'Vlera2']:d.value2}:{}) }))
  return (
    <div style={{ background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:16, padding:'20px 20px 12px' }}>
      <div style={{ fontSize:13, fontWeight:700, color:'rgba(240,236,228,0.6)', marginBottom:16 }}>{title}</div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData} margin={{ top:0, right:4, bottom:0, left:-20 }} barSize={color2?10:16}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(240,236,228,0.05)" vertical={false}/>
          <XAxis dataKey="name" tick={{ fontSize:11, fill:'rgba(240,236,228,0.3)', fontFamily:"'DM Sans'" }} axisLine={false} tickLine={false}/>
          <YAxis tick={{ fontSize:10, fill:'rgba(240,236,228,0.25)' }} axisLine={false} tickLine={false}/>
          <Tooltip content={<CustomTooltip/>}/>
          <Bar dataKey={name||'Vlera'} fill={color} radius={[4,4,0,0]}/>
          {color2 && <Bar dataKey={name2||'Vlera2'} fill={color2} radius={[4,4,0,0]}/>}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Pie / Donut Chart ─────────────────────────────────────────────────────────
interface PieChartProps {
  data:   { label:string; value:number; color:string }[]
  title:  string
  height?: number
  donut?: boolean
}

export function StatsPieChart({ data, title, height = 200, donut = true }: PieChartProps) {
  const [active, setActive] = useState<number|null>(null)
  const total = data.reduce((s,d) => s+d.value, 0)
  return (
    <div style={{ background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:16, padding:'20px 20px 12px' }}>
      <div style={{ fontSize:13, fontWeight:700, color:'rgba(240,236,228,0.6)', marginBottom:8 }}>{title}</div>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <ResponsiveContainer width="55%" height={height}>
          <PieChart>
            <Pie data={data.map(d=>({name:d.label,value:d.value,color:d.color}))} cx="50%" cy="50%" outerRadius={donut?70:75} innerRadius={donut?45:0} dataKey="value" strokeWidth={0}
              onMouseEnter={(_,i) => setActive(i)} onMouseLeave={() => setActive(null)}>
              {data.map((d,i) => <Cell key={i} fill={d.color} opacity={active===null||active===i?1:0.4}/>)}
            </Pie>
            <Tooltip formatter={(val:any,name:any) => [`${val} (${total>0?Math.round(val/total*100):0}%)`, name]}/>
          </PieChart>
        </ResponsiveContainer>
        <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8 }}>
          {data.map((d,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:8, cursor:'default', opacity:active===null||active===i?1:0.4, transition:'opacity 0.15s' }}
              onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:d.color, flexShrink:0 }}/>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:11, fontWeight:700, color:'#f0ece4' }}>{d.label}</div>
                <div style={{ fontSize:10, color:'rgba(240,236,228,0.35)' }}>{d.value} · {total>0?Math.round(d.value/total*100):0}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Line Chart ────────────────────────────────────────────────────────────────
interface LineChartProps {
  data:    { label:string; value:number; value2?:number }[]
  title:   string
  color?:  string
  color2?: string
  name?:   string
  name2?:  string
  height?: number
  prefix?: string
  suffix?: string
}

export function TrendLineChart({ data, title, color = '#e8621a', color2, name, name2, height = 200, prefix = '', suffix = '' }: LineChartProps) {
  const chartData = data.map(d => ({ name:d.label, [name||'Vlera']:d.value, ...(d.value2!==undefined?{[name2||'Vlera2']:d.value2}:{}) }))
  return (
    <div style={{ background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:16, padding:'20px 20px 12px' }}>
      <div style={{ fontSize:13, fontWeight:700, color:'rgba(240,236,228,0.6)', marginBottom:16 }}>{title}</div>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top:4, right:4, bottom:0, left:-20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(240,236,228,0.05)" vertical={false}/>
          <XAxis dataKey="name" tick={{ fontSize:11, fill:'rgba(240,236,228,0.3)', fontFamily:"'DM Sans'" }} axisLine={false} tickLine={false}/>
          <YAxis tick={{ fontSize:10, fill:'rgba(240,236,228,0.25)' }} axisLine={false} tickLine={false}/>
          <Tooltip content={<CustomTooltip prefix={prefix} suffix={suffix}/>}/>
          <Line type="monotone" dataKey={name||'Vlera'} stroke={color} strokeWidth={2} dot={{ r:3, fill:color, strokeWidth:0 }} activeDot={{ r:5 }}/>
          {color2 && <Line type="monotone" dataKey={name2||'Vlera2'} stroke={color2} strokeWidth={2} dot={{ r:3, fill:color2, strokeWidth:0 }} activeDot={{ r:5 }}/>}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Radial Progress Chart ─────────────────────────────────────────────────────
interface RadialProps {
  data:   { label:string; value:number; max:number; color:string }[]
  title:  string
  height?: number
}

export function RadialProgress({ data, title, height = 180 }: RadialProps) {
  const chartData = data.map(d => ({ name:d.label, value:Math.round((d.value/d.max)*100), fill:d.color }))
  return (
    <div style={{ background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:16, padding:'20px 20px 12px' }}>
      <div style={{ fontSize:13, fontWeight:700, color:'rgba(240,236,228,0.6)', marginBottom:8 }}>{title}</div>
      <div style={{ display:'flex', gap:12, alignItems:'center' }}>
        <ResponsiveContainer width="55%" height={height}>
          <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="100%" data={chartData} startAngle={180} endAngle={0}>
            <RadialBar background={{ fill:'rgba(240,236,228,0.04)' }} dataKey="value" cornerRadius={4}/>
            <Tooltip formatter={(v:any) => [`${v}%`]}/>
          </RadialBarChart>
        </ResponsiveContainer>
        <div style={{ display:'flex', flexDirection:'column', gap:10, flex:1 }}>
          {data.map((d,i) => (
            <div key={i}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontSize:11, fontWeight:700, color:'rgba(240,236,228,0.6)' }}>{d.label}</span>
                <span style={{ fontSize:11, fontWeight:700, color:d.color }}>{d.value}/{d.max}</span>
              </div>
              <div style={{ height:4, background:'rgba(240,236,228,0.08)', borderRadius:10 }}>
                <div style={{ height:'100%', width:`${Math.min(100,Math.round((d.value/d.max)*100))}%`, background:d.color, borderRadius:10, transition:'width 1s ease' }}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Activity Feed ─────────────────────────────────────────────────────────────
interface FeedItem { id:string; icon:string; title:string; description:string; time:string; color:string }

export function ActivityFeed({ items, title = '⚡ Aktiviteti i fundit' }: { items:FeedItem[]; title?:string }) {
  return (
    <div style={{ background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:16, overflow:'hidden' }}>
      <div style={{ padding:'14px 18px', borderBottom:'1px solid rgba(240,236,228,0.07)', fontSize:13, fontWeight:700, color:'rgba(240,236,228,0.6)' }}>{title}</div>
      <div>
        {items.length === 0 ? (
          <div style={{ padding:'24px', textAlign:'center', fontSize:13, color:'rgba(240,236,228,0.3)' }}>Nuk ka aktivitet ende.</div>
        ) : items.map((item, i) => (
          <div key={item.id+i} style={{ display:'flex', gap:12, padding:'12px 18px', borderBottom:i<items.length-1?'1px solid rgba(240,236,228,0.04)':'none', alignItems:'flex-start' }}>
            <div style={{ width:32, height:32, borderRadius:10, background:`${item.color}14`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, flexShrink:0 }}>{item.icon}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:12, fontWeight:700, color:'#f0ece4', marginBottom:2 }}>{item.title}</div>
              <div style={{ fontSize:11, color:'rgba(240,236,228,0.4)', lineHeight:1.5, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.description}</div>
            </div>
            <div style={{ fontSize:10, color:'rgba(240,236,228,0.3)', flexShrink:0, paddingTop:2 }}>{item.time}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Metric Progress Bar ───────────────────────────────────────────────────────
interface MetricBarProps {
  label:  string
  value:  number  // 0-100
  color?: string
  icon?:  string
  suffix?: string
}

export function MetricBar({ label, value, color = '#e8621a', icon, suffix = '%' }: MetricBarProps) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
      {icon && <span style={{ fontSize:16, flexShrink:0 }}>{icon}</span>}
      <div style={{ flex:1 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
          <span style={{ fontSize:12, fontWeight:600, color:'rgba(240,236,228,0.5)' }}>{label}</span>
          <span style={{ fontSize:12, fontWeight:700, color }}>{Math.round(value)}{suffix}</span>
        </div>
        <div style={{ height:5, background:'rgba(240,236,228,0.08)', borderRadius:10, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${Math.min(100,value)}%`, background:`linear-gradient(90deg,${color},${color}bb)`, borderRadius:10, transition:'width 1.2s ease' }}/>
        </div>
      </div>
    </div>
  )
}

// ── Skeleton Variants ─────────────────────────────────────────────────────────
export function KpiSkeleton({ count = 4 }: { count?:number }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:`repeat(${count},1fr)`, gap:12 }}>
      {Array.from({length:count}).map((_,i) => (
        <div key={i} className="skeleton" style={{ height:110, borderRadius:16 }}/>
      ))}
    </div>
  )
}

export function OfferCardSkeleton({ count = 3 }: { count?:number }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      {Array.from({length:count}).map((_,i) => (
        <div key={i} className="skeleton" style={{ height:72, borderRadius:14 }}/>
      ))}
    </div>
  )
}