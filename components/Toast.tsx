'use client'

import { useState, useEffect, createContext, useContext, useCallback, useRef } from 'react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id:      string
  type:    ToastType
  title:   string
  message?: string
  duration?: number
}

interface ToastContextValue {
  toast: (t: Omit<Toast, 'id'>) => void
  success: (title: string, message?: string) => void
  error:   (title: string, message?: string) => void
  info:    (title: string, message?: string) => void
  warning: (title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const ICONS: Record<ToastType, string> = {
  success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️',
}
const COLORS: Record<ToastType, { border: string; bg: string; icon: string }> = {
  success: { border:'rgba(34,211,165,0.3)',  bg:'rgba(34,211,165,0.06)',  icon:'#22d3a5' },
  error:   { border:'rgba(248,113,113,0.3)', bg:'rgba(248,113,113,0.06)', icon:'#f87171' },
  info:    { border:'rgba(96,165,250,0.3)',  bg:'rgba(96,165,250,0.06)',  icon:'#60a5fa' },
  warning: { border:'rgba(251,191,36,0.3)',  bg:'rgba(251,191,36,0.06)',  icon:'#fbbf24' },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<(Toast & { removing?: boolean })[]>([])

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, removing: true } : t))
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 320)
  }, [])

  const add = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev.slice(-4), { ...t, id }])
    setTimeout(() => remove(id), t.duration ?? 4000)
  }, [remove])

  const ctx: ToastContextValue = {
    toast:   add,
    success: (title, message) => add({ type:'success', title, message }),
    error:   (title, message) => add({ type:'error',   title, message }),
    info:    (title, message) => add({ type:'info',    title, message }),
    warning: (title, message) => add({ type:'warning', title, message }),
  }

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <style>{`
        @keyframes toastIn  { from{opacity:0;transform:translateY(16px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes toastOut { from{opacity:1;transform:translateY(0) scale(1)} to{opacity:0;transform:translateY(16px) scale(0.96)} }
      `}</style>
      <div style={{ position:'fixed', bottom:24, right:24, zIndex:9999, display:'flex', flexDirection:'column', gap:10, pointerEvents:'none', maxWidth:360 }}>
        {toasts.map(t => {
          const col = COLORS[t.type]
          return (
            <div key={t.id} style={{ background:'rgba(13,17,23,0.96)', backdropFilter:'blur(20px)', border:`1px solid ${col.border}`, borderRadius:16, padding:'14px 18px', display:'flex', alignItems:'flex-start', gap:12, pointerEvents:'all', cursor:'pointer', boxShadow:'0 8px 32px rgba(0,0,0,0.4)', animation: t.removing ? 'toastOut 0.3s ease forwards' : 'toastIn 0.3s ease' }}
              onClick={() => remove(t.id)}>
              <div style={{ width:32, height:32, borderRadius:10, background:col.bg, border:`1px solid ${col.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, flexShrink:0 }}>{ICONS[t.type]}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:700, color:'#e8eaf0', marginBottom: t.message ? 3 : 0, fontFamily:"'DM Sans',sans-serif" }}>{t.title}</div>
                {t.message && <div style={{ fontSize:12, color:'rgba(232,234,240,0.55)', lineHeight:1.6, fontFamily:"'DM Sans',sans-serif" }}>{t.message}</div>}
              </div>
              <span style={{ fontSize:16, color:'rgba(232,234,240,0.3)', flexShrink:0, marginTop:-1 }}>×</span>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}