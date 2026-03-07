'use client'

interface AvatarProps {
  name:        string
  src?:        string | null
  size?:       number
  borderRadius?: number
  color?:      string
  showOnline?:  boolean
}

const COLORS = ['#e8621a','#22d3a5','#60a5fa','#a78bfa','#fbbf24','#f472b6','#34d399']

function colorFromName(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return COLORS[Math.abs(hash) % COLORS.length]
}

export default function Avatar({ name, src, size = 40, borderRadius, color, showOnline }: AvatarProps) {
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2)
  const bg       = color || colorFromName(name)
  const br       = borderRadius ?? size * 0.3

  return (
    <div style={{ position:'relative', flexShrink:0, width:size, height:size }}>
      {src ? (
        <img src={src} alt={name} style={{ width:size, height:size, borderRadius:br, objectFit:'cover', display:'block' }} />
      ) : (
        <div style={{ width:size, height:size, borderRadius:br, background:`linear-gradient(135deg,${bg}cc,${bg})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*0.35, fontWeight:800, color:'#fff', boxShadow:`0 4px 12px ${bg}30`, fontFamily:"'DM Sans',sans-serif" }}>
          {initials}
        </div>
      )}
      {showOnline && (
        <div style={{ position:'absolute', bottom:1, right:1, width:size*0.24, height:size*0.24, borderRadius:'50%', background:'#22d3a5', border:`${size*0.06}px solid #080b12` }} />
      )}
    </div>
  )
}