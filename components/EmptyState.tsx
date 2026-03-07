'use client'

interface EmptyStateProps {
  icon:       string
  title:      string
  message:    string
  action?:    { label: string; href?: string; onClick?: () => void }
  size?:      'sm' | 'md' | 'lg'
}

export default function EmptyState({ icon, title, message, action, size = 'md' }: EmptyStateProps) {
  const sizes = {
    sm: { icon: 36, iconBox: 64,  title: '1.1rem', msg: 13, pad: '40px 24px' },
    md: { icon: 44, iconBox: 80,  title: '1.3rem', msg: 14, pad: '64px 32px' },
    lg: { icon: 52, iconBox: 96,  title: '1.6rem', msg: 15, pad: '80px 40px' },
  }[size]

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:sizes.pad, textAlign:'center' }}>
      <div style={{ width:sizes.iconBox, height:sizes.iconBox, borderRadius:sizes.iconBox*0.28, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:sizes.icon, marginBottom:20 }}>
        {icon}
      </div>
      <div style={{ fontFamily:"'Fraunces',serif", fontSize:sizes.title, fontWeight:800, letterSpacing:'-0.03em', color:'#e8eaf0', marginBottom:8 }}>
        {title}
      </div>
      <div style={{ fontSize:sizes.msg, color:'rgba(232,234,240,0.45)', lineHeight:1.75, maxWidth:320, marginBottom: action ? 24 : 0 }}>
        {message}
      </div>
      {action && (
        action.href ? (
          <a href={action.href} style={{ padding:'11px 24px', borderRadius:12, background:'linear-gradient(135deg,#e8621a,#ff7c35)', color:'#fff', fontFamily:"'Fraunces',serif", fontWeight:700, fontSize:14, textDecoration:'none', boxShadow:'0 4px 16px rgba(232,98,26,0.3)', display:'inline-block', transition:'all 0.2s' }}>
            {action.label}
          </a>
        ) : (
          <button onClick={action.onClick} style={{ padding:'11px 24px', borderRadius:12, background:'linear-gradient(135deg,#e8621a,#ff7c35)', color:'#fff', fontFamily:"'Fraunces',serif", fontWeight:700, fontSize:14, border:'none', cursor:'pointer', boxShadow:'0 4px 16px rgba(232,98,26,0.3)', transition:'all 0.2s' }}>
            {action.label}
          </button>
        )
      )}
    </div>
  )
}