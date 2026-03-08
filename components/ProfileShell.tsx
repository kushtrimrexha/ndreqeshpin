'use client'

import { useState, useRef } from 'react'
import { createClient }      from '@/lib/supabase/client'

interface ProfileShellProps {
  userId:      string
  fullName:    string
  city:        string
  role:        string
  avatarUrl?:  string | null
  joinedAt:    string
  stats?:      { label: string; val: string | number; icon: string; col: string }[]
  badge?:      { label: string; col: string } | null
  children:    React.ReactNode
  onAvatarUpdate?: (url: string) => void
}

const ROLE_COL: Record<string, string> = {
  client:  '#60a5fa',
  company: '#e8621a',
  worker:  '#22d3a5',
  admin:   '#a78bfa',
}

export default function ProfileShell({
  userId, fullName, city, role, avatarUrl, joinedAt,
  stats = [], badge, children, onAvatarUpdate,
}: ProfileShellProps) {
  const supabase       = createClient()
  const fileRef        = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [avatar,    setAvatar]    = useState(avatarUrl || '')
  const col = ROLE_COL[role] || '#e8621a'

  const initials = (fullName || '?').split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 3 * 1024 * 1024) { alert('Foto max 3MB'); return }

    setUploading(true)
    try {
      const ext  = file.name.split('.').pop()
      const path = `avatars/${userId}.${ext}`

      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })

      if (upErr) throw upErr

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path)

      // Update profile
      await fetch('/api/profile/update', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ avatar_url: publicUrl }),
      })

      setAvatar(publicUrl)
      onAvatarUpdate?.(publicUrl)
    } catch (err: any) {
      alert('Gabim gjatë ngarkimit: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, alignItems: 'start' }}>

      {/* ── LEFT — Avatar + info ─────────── */}
      <div style={{ position: 'sticky', top: 80 }}>

        {/* Avatar card */}
        <div style={{ padding: '28px 24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, textAlign: 'center', marginBottom: 12 }}>

          {/* Avatar */}
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
            <div style={{ width: 96, height: 96, borderRadius: '50%', background: avatar ? 'transparent' : `linear-gradient(135deg,${col}cc,${col})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 900, color: '#fff', overflow: 'hidden', border: `3px solid ${col}40`, boxShadow: `0 0 24px ${col}25` }}>
              {avatar
                ? <img src={avatar} alt={fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials
              }
            </div>

            {/* Upload button */}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              style={{ position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderRadius: '50%', background: col, border: '2px solid #080b12', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
              {uploading ? (
                <div style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              ) : '📷'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
          </div>

          <div style={{ fontFamily: "'Fraunces',serif", fontWeight: 900, fontSize: '1.2rem', marginBottom: 6 }}>{fullName}</div>
          <div style={{ fontSize: 13, color: 'rgba(232,234,240,0.5)', marginBottom: 12 }}>📍 {city || 'Kosovë'}</div>

          {badge && (
            <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, color: badge.col, background: `${badge.col}15`, border: `1px solid ${badge.col}30`, borderRadius: 100, padding: '4px 14px', marginBottom: 8 }}>
              {badge.label}
            </span>
          )}

          <div style={{ fontSize: 11, color: 'rgba(232,234,240,0.3)', marginTop: 8 }}>
            Anëtar që nga {(() => { if (!joinedAt) return '—'; const d = new Date(joinedAt); const months = ['Janar','Shkurt','Mars','Prill','Maj','Qershor','Korrik','Gusht','Shtator','Tetor','Nëntor','Dhjetor']; return `${months[d.getMonth()]} ${d.getFullYear()}` })()}
          </div>
        </div>

        {/* Stats */}
        {stats.length > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, overflow: 'hidden' }}>
            {stats.map((s, i) => (
              <div key={i} style={{ padding: '14px 20px', borderBottom: i < stats.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 16 }}>{s.icon}</span>
                  <span style={{ fontSize: 13, color: 'rgba(232,234,240,0.5)' }}>{s.label}</span>
                </div>
                <span style={{ fontFamily: "'Fraunces',serif", fontWeight: 900, fontSize: '1.1rem', color: s.col }}>{s.val}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── RIGHT — Content ──────────────── */}
      <div>{children}</div>
    </div>
  )
}