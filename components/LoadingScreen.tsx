'use client'

import { useEffect, useState } from 'react'

interface Props {
  message?: string
  subtext?: string
}

export default function LoadingScreen({ message = 'Duke u ngarkuar...', subtext }: Props) {
  const [dots, setDots] = useState(0)

  useEffect(() => {
    const i = setInterval(() => setDots(p => (p + 1) % 4), 400)
    return () => clearInterval(i)
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#0a0908',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
      fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,900;1,9..144,300&family=DM+Sans:wght@400;600&display=swap');
        @keyframes logoSpin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes logoGlow { 0%,100%{box-shadow:0 0 20px rgba(232,98,26,0.3)} 50%{box-shadow:0 0 50px rgba(232,98,26,0.6),0 0 80px rgba(232,98,26,0.2)} }
        @keyframes barLoad  { 0%{width:0%} 60%{width:75%} 80%{width:85%} 95%{width:92%} 100%{width:100%} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>

      {/* Ambient glow */}
      <div style={{ position:'absolute', top:'40%', left:'50%', transform:'translate(-50%,-50%)', width:500, height:300, background:'radial-gradient(ellipse,rgba(232,98,26,0.08) 0%,transparent 70%)', pointerEvents:'none' }} />

      {/* Logo */}
      <div style={{ position:'relative', marginBottom:32, animation:'fadeUp 0.6s ease' }}>
        {/* Spinning ring */}
        <div style={{
          position: 'absolute', inset: -8,
          border: '2px solid transparent',
          borderTop: '2px solid rgba(232,98,26,0.5)',
          borderRadius: '50%',
          animation: 'logoSpin 1.2s linear infinite',
        }} />
        {/* Logo mark */}
        <div style={{
          width: 64, height: 64,
          background: 'linear-gradient(135deg,#e8621a,#ff8c4a)',
          borderRadius: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Fraunces',serif", fontWeight: 900, color: '#fff', fontSize: 28,
          animation: 'logoGlow 2s ease-in-out infinite',
        }}>N</div>
      </div>

      {/* Wordmark */}
      <div style={{ fontFamily:"'Fraunces',serif", fontSize: '1.5rem', fontWeight: 900, letterSpacing:'-0.04em', color:'#f0ece4', marginBottom: 32, animation:'fadeUp 0.6s ease 0.1s both' }}>
        Ndreqe<span style={{ color:'#e8621a' }}>Shpin</span>
      </div>

      {/* Progress bar */}
      <div style={{ width: 200, height: 2, background:'rgba(240,236,228,0.06)', borderRadius: 2, marginBottom: 20, overflow:'hidden', animation:'fadeUp 0.6s ease 0.2s both' }}>
        <div style={{ height:'100%', background:'linear-gradient(90deg,#e8621a,#ff8c4a)', borderRadius:2, animation:'barLoad 2s ease-out forwards' }} />
      </div>

      {/* Message */}
      <div style={{ fontSize: 13, color:'rgba(240,236,228,0.4)', fontWeight: 500, animation:'fadeUp 0.6s ease 0.3s both' }}>
        {message}{'·'.repeat(dots)}
      </div>
      {subtext && (
        <div style={{ fontSize: 11, color:'rgba(240,236,228,0.2)', marginTop:8, animation:'fadeUp 0.6s ease 0.4s both' }}>
          {subtext}
        </div>
      )}
    </div>
  )
}

/**
 * Inline spinner — use inside buttons or cards
 */
export function Spinner({ size = 20, color = '#e8621a' }: { size?: number; color?: string }) {
  return (
    <div style={{
      width: size, height: size,
      border: `2px solid ${color}20`,
      borderTop: `2px solid ${color}`,
      borderRadius: '50%',
      animation: 'logoSpin 0.8s linear infinite',
      flexShrink: 0,
    }} />
  )
}

/**
 * PageLoader — used while suspense loads
 */
export function PageLoader() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
        <Spinner size={32} />
        <div style={{ fontSize:13, color:'rgba(240,236,228,0.3)', fontFamily:"'DM Sans',sans-serif" }}>Duke u ngarkuar...</div>
      </div>
    </div>
  )
}