'use client'

type Status =
  | 'pending' | 'active' | 'in_progress' | 'completed' | 'cancelled' | 'rejected'
  | 'accepted' | 'declined' | 'open' | 'closed'
  | 'verified' | 'unverified'
  | 'free' | 'premium'
  | 'monthly' | 'yearly'
  | string

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending:     { label:'⏳ Në pritje',    color:'#fbbf24', bg:'rgba(251,191,36,0.1)',  border:'rgba(251,191,36,0.25)' },
  active:      { label:'✅ Aktiv',        color:'#22d3a5', bg:'rgba(34,211,165,0.1)',  border:'rgba(34,211,165,0.25)' },
  open:        { label:'🟢 Hapur',        color:'#22d3a5', bg:'rgba(34,211,165,0.1)',  border:'rgba(34,211,165,0.25)' },
  in_progress: { label:'🔄 Në progres',   color:'#60a5fa', bg:'rgba(96,165,250,0.1)',  border:'rgba(96,165,250,0.25)' },
  completed:   { label:'🏁 Përfunduar',   color:'#a78bfa', bg:'rgba(167,139,250,0.1)', border:'rgba(167,139,250,0.25)' },
  accepted:    { label:'✅ Pranuar',      color:'#22d3a5', bg:'rgba(34,211,165,0.1)',  border:'rgba(34,211,165,0.25)' },
  cancelled:   { label:'❌ Anuluar',      color:'#f87171', bg:'rgba(248,113,113,0.1)', border:'rgba(248,113,113,0.25)' },
  rejected:    { label:'❌ Refuzuar',     color:'#f87171', bg:'rgba(248,113,113,0.1)', border:'rgba(248,113,113,0.25)' },
  declined:    { label:'↩️ Refuzuar',     color:'rgba(232,234,240,0.4)', bg:'rgba(255,255,255,0.05)', border:'rgba(255,255,255,0.1)' },
  closed:      { label:'🔒 Mbyllur',      color:'rgba(232,234,240,0.4)', bg:'rgba(255,255,255,0.05)', border:'rgba(255,255,255,0.1)' },
  verified:    { label:'✓ Verifikuar',   color:'#22d3a5', bg:'rgba(34,211,165,0.1)',  border:'rgba(34,211,165,0.25)' },
  unverified:  { label:'⏳ Pavarifkuar', color:'#fbbf24', bg:'rgba(251,191,36,0.1)',  border:'rgba(251,191,36,0.25)' },
  premium:     { label:'💎 Premium',     color:'#e8621a', bg:'rgba(232,98,26,0.1)',   border:'rgba(232,98,26,0.25)' },
  free:        { label:'🆓 Falas',       color:'rgba(232,234,240,0.5)', bg:'rgba(255,255,255,0.05)', border:'rgba(255,255,255,0.1)' },
  monthly:     { label:'📅 Mujor',       color:'#60a5fa', bg:'rgba(96,165,250,0.1)',  border:'rgba(96,165,250,0.25)' },
  yearly:      { label:'📆 Vjetor',      color:'#22d3a5', bg:'rgba(34,211,165,0.1)',  border:'rgba(34,211,165,0.25)' },
}

export default function StatusBadge({ status, size = 'sm' }: { status: Status; size?: 'xs' | 'sm' | 'md' }) {
  const map = STATUS_MAP[status] || { label: status, color:'rgba(232,234,240,0.4)', bg:'rgba(255,255,255,0.05)', border:'rgba(255,255,255,0.1)' }
  const fontSize = size === 'xs' ? 10 : size === 'sm' ? 11 : 13
  const padding  = size === 'xs' ? '2px 7px' : size === 'sm' ? '3px 10px' : '5px 14px'
  return (
    <span style={{ display:'inline-block', padding, borderRadius:100, fontSize, fontWeight:700, letterSpacing:'0.02em', color:map.color, background:map.bg, border:`1px solid ${map.border}`, whiteSpace:'nowrap', fontFamily:"'DM Sans',sans-serif" }}>
      {map.label}
    </span>
  )
}