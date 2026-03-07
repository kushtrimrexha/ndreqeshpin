'use client'

import Link from 'next/link'

interface PremiumGateProps {
  title?:    string
  message?:  string
  feature?:  string
  children?: React.ReactNode
  compact?:  boolean
  onClose?:  () => void
}

export default function PremiumGate({
  title   = '💎 Funksion Premium',
  message = 'Ky funksion është i disponueshëm vetëm për abonentët Premium.',
  feature,
  children,
  compact = false,
  onClose,
}: PremiumGateProps) {

  const FEATURES = [
    { icon:'📋', label:'Aplikime të pakufizuara' },
    { icon:'⭐', label:'Prioritet në rezultate' },
    { icon:'📊', label:'Analytics të avancuara' },
    { icon:'💬', label:'Chat + foto & dokumente' },
    { icon:'📈', label:'Raporte & eksporte CSV'  },
    { icon:'🎯', label:'Mbështetje prioritare'   },
  ]

  if (compact) {
    return (
      <div style={{
        padding: '14px 18px',
        background: 'linear-gradient(135deg,rgba(232,98,26,0.08),rgba(232,98,26,0.04))',
        border: '1px solid rgba(232,98,26,0.2)',
        borderRadius: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        fontFamily: "'DM Sans',sans-serif",
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:20 }}>💎</span>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:'#f0ece4' }}>{title}</div>
            {feature && <div style={{ fontSize:11, color:'rgba(240,236,228,0.45)' }}>kërkon: {feature}</div>}
          </div>
        </div>
        <Link href="/pricing" style={{ padding:'8px 16px', background:'linear-gradient(135deg,#e8621a,#ff7c35)', borderRadius:10, textDecoration:'none', color:'#fff', fontSize:12, fontWeight:700, whiteSpace:'nowrap' }}>
          Upgrade →
        </Link>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(16px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes shimmer { 0%{opacity:0.5;transform:translateX(-100%)} 100%{opacity:0;transform:translateX(100%)} }
      `}</style>

      {/* Overlay */}
      {onClose && (
        <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', zIndex:498, backdropFilter:'blur(6px)', animation:'fadeIn 0.2s ease' }} />
      )}

      {/* Modal */}
      <div style={{
        position: onClose ? 'fixed' : 'relative',
        ...(onClose ? { top:'50%', left:'50%', transform:'translate(-50%,-50%)', zIndex:499 } : {}),
        width: onClose ? 'min(460px,calc(100vw - 32px))' : '100%',
        background: '#111010',
        border: '1px solid rgba(232,98,26,0.2)',
        borderRadius: 20,
        overflow: 'hidden',
        animation: 'slideUp 0.3s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: '0 32px 64px rgba(0,0,0,0.6)',
        fontFamily: "'DM Sans',sans-serif",
      }}>
        {/* Header gradient */}
        <div style={{ padding:'32px 32px 24px', background:'linear-gradient(160deg,rgba(232,98,26,0.12),rgba(232,98,26,0.04))', position:'relative', overflow:'hidden' }}>
          {/* Shimmer effect */}
          <div style={{ position:'absolute', top:0, left:0, right:0, bottom:0, background:'linear-gradient(90deg,transparent,rgba(240,236,228,0.04),transparent)', animation:'shimmer 3s ease-in-out infinite', pointerEvents:'none' }} />

          {onClose && (
            <button onClick={onClose} style={{ position:'absolute', top:16, right:16, width:32, height:32, borderRadius:8, background:'rgba(240,236,228,0.08)', border:'none', cursor:'pointer', color:'rgba(240,236,228,0.5)', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
          )}

          <div style={{ fontSize:40, marginBottom:16, lineHeight:1 }}>💎</div>
          <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:'1.5rem', fontWeight:900, letterSpacing:'-0.03em', color:'#f0ece4', marginBottom:10, lineHeight:1.2 }}>{title}</h2>
          <p style={{ fontSize:14, color:'rgba(240,236,228,0.5)', lineHeight:1.7 }}>{message}</p>
        </div>

        {/* Features */}
        <div style={{ padding:'20px 32px' }}>
          <div style={{ fontSize:11, fontWeight:700, color:'rgba(240,236,228,0.3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:14 }}>
            Çfarë përfshihet në Premium
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:24 }}>
            {FEATURES.map(f => (
              <div key={f.label} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'rgba(240,236,228,0.6)' }}>
                <span style={{ fontSize:15 }}>{f.icon}</span>
                {f.label}
              </div>
            ))}
          </div>

          {/* Price teaser */}
          <div style={{ padding:'14px 16px', background:'rgba(232,98,26,0.06)', border:'1px solid rgba(232,98,26,0.15)', borderRadius:12, marginBottom:16, display:'flex', alignItems:'baseline', gap:8 }}>
            <span style={{ fontFamily:"'Fraunces',serif", fontSize:'2rem', fontWeight:900, color:'#e8621a', lineHeight:1 }}>€9.99</span>
            <span style={{ fontSize:13, color:'rgba(240,236,228,0.4)' }}>/ muaj · anulim në çdo kohë</span>
          </div>

          {/* CTA */}
          <Link href="/pricing" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'14px', borderRadius:13, background:'linear-gradient(135deg,#e8621a,#ff7c35)', textDecoration:'none', color:'#fff', fontFamily:"'Fraunces',serif", fontSize:'1rem', fontWeight:700, boxShadow:'0 6px 24px rgba(232,98,26,0.35)', transition:'all 0.2s', marginBottom:10 }}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 12px 32px rgba(232,98,26,0.45)'}}
            onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 6px 24px rgba(232,98,26,0.35)'}}>
            💎 Shiko planet Premium →
          </Link>

          {onClose && (
            <button onClick={onClose} style={{ width:'100%', padding:'10px', borderRadius:10, border:'none', background:'rgba(240,236,228,0.04)', color:'rgba(240,236,228,0.4)', fontFamily:'inherit', fontSize:13, cursor:'pointer' }}>
              Jo tani
            </button>
          )}
        </div>

        {children}
      </div>
    </>
  )
}