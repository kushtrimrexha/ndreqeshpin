'use client'

// ── Generic skeleton block ────────────────────────────────────────
export function Skeleton({ width = '100%', height = 20, borderRadius = 8, style = {} }: {
  width?: string | number; height?: number; borderRadius?: number; style?: React.CSSProperties
}) {
  return (
    <div className="skeleton" style={{ width, height, borderRadius, flexShrink:0, ...style }} />
  )
}

// ── KPI card skeleton ─────────────────────────────────────────────
export function KpiSkeleton() {
  return (
    <div style={{ padding:22, background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, display:'flex', flexDirection:'column', gap:12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <Skeleton width={44} height={44} borderRadius={13} />
        <Skeleton width={48} height={22} borderRadius={7} />
      </div>
      <Skeleton width={80} height={38} borderRadius={8} />
      <Skeleton width={120} height={14} borderRadius={6} />
    </div>
  )
}

// ── Table row skeleton ────────────────────────────────────────────
export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_,i) => (
        <td key={i} style={{ padding:'16px 20px' }}>
          <Skeleton width={i === 0 ? '80%' : '60%'} height={14} />
        </td>
      ))}
    </tr>
  )
}

// ── Card skeleton ─────────────────────────────────────────────────
export function CardSkeleton() {
  return (
    <div style={{ padding:24, background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, display:'flex', flexDirection:'column', gap:14 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <Skeleton width={44} height={44} borderRadius={12} />
        <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8 }}>
          <Skeleton width="60%" height={14} />
          <Skeleton width="40%" height={12} />
        </div>
      </div>
      <Skeleton height={12} />
      <Skeleton width="80%" height={12} />
      <div style={{ display:'flex', gap:8, marginTop:4 }}>
        <Skeleton width={70} height={28} borderRadius={8} />
        <Skeleton width={70} height={28} borderRadius={8} />
      </div>
    </div>
  )
}

// ── Offer card skeleton ───────────────────────────────────────────
export function OfferCardSkeleton() {
  return (
    <div style={{ padding:24, background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          <Skeleton width={48} height={48} borderRadius={14} />
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <Skeleton width={140} height={14} />
            <Skeleton width={90} height={12} />
          </div>
        </div>
        <Skeleton width={60} height={24} borderRadius={8} />
      </div>
      <Skeleton height={12} style={{ marginBottom:8 }} />
      <Skeleton width="70%" height={12} style={{ marginBottom:16 }} />
      <div style={{ display:'flex', gap:10 }}>
        <Skeleton width={100} height={36} borderRadius={10} />
        <Skeleton width={80} height={36} borderRadius={10} />
      </div>
    </div>
  )
}

// ── Dashboard skeleton (KPI grid) ─────────────────────────────────
export function DashboardSkeleton({ kpis = 4 }: { kpis?: number }) {
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:`repeat(${kpis},1fr)`, gap:16, marginBottom:24 }}>
        {Array.from({ length: kpis }).map((_,i) => <KpiSkeleton key={i} />)}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  )
}