'use client'

import { useState } from 'react'

interface ConfirmModalProps {
  title:       string
  message:     string
  confirmText?: string
  cancelText?:  string
  danger?:      boolean
  onConfirm:   () => Promise<void> | void
  onClose:     () => void
}

export default function ConfirmModal({
  title, message, confirmText = 'Konfirmo', cancelText = 'Anulo',
  danger = false, onConfirm, onClose,
}: ConfirmModalProps) {
  const [loading, setLoading] = useState(false)

  async function handle() {
    setLoading(true)
    try { await onConfirm() }
    finally { setLoading(false) }
  }

  return (
    <>
      <style>{`
        @keyframes modalIn { from{opacity:0;transform:scale(0.95) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
      `}</style>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(6px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
        <div onClick={e => e.stopPropagation()} style={{ background:'#0d1117', border:'1px solid rgba(255,255,255,0.1)', borderRadius:22, padding:32, width:'100%', maxWidth:420, animation:'modalIn 0.2s ease', fontFamily:"'DM Sans',sans-serif", color:'#e8eaf0' }}>
          <div style={{ width:52, height:52, borderRadius:16, background: danger ? 'rgba(248,113,113,0.1)' : 'rgba(232,98,26,0.1)', border:`1px solid ${danger ? 'rgba(248,113,113,0.25)' : 'rgba(232,98,26,0.25)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, marginBottom:18 }}>
            {danger ? '⚠️' : '❓'}
          </div>
          <div style={{ fontFamily:"'Fraunces',serif", fontSize:'1.3rem', fontWeight:800, letterSpacing:'-0.03em', marginBottom:10 }}>{title}</div>
          <div style={{ fontSize:14, color:'rgba(232,234,240,0.6)', lineHeight:1.75, marginBottom:28 }}>{message}</div>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={onClose} disabled={loading} style={{ flex:1, padding:'11px', borderRadius:12, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', color:'rgba(232,234,240,0.7)', fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600, cursor:'pointer' }}>
              {cancelText}
            </button>
            <button onClick={handle} disabled={loading} style={{ flex:1, padding:'11px', borderRadius:12, border:'none', background: danger ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'linear-gradient(135deg,#e8621a,#ff7c35)', color:'#fff', fontFamily:"'Fraunces',serif", fontSize:14, fontWeight:700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              {loading ? <><div style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid #fff', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />Duke procesuar...</> : confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}