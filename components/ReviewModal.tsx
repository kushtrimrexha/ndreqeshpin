'use client'

import { useState } from 'react'

interface ReviewModalProps {
  applicationId:    string
  applicationTitle: string
  revieweeId:       string
  revieweeName:     string
  revieweeType:     'company' | 'worker'
  onClose:          () => void
  onSuccess:        () => void
}

const LABELS = ['', 'Keq', 'Dobët', 'Mirë', 'Shumë mirë', 'Shkëlqyer']
const COLORS = ['', '#ef4444', '#f97316', '#fbbf24', '#22d3a5', '#10b981']

export default function ReviewModal({
  applicationId, applicationTitle, revieweeId, revieweeName,
  revieweeType, onClose, onSuccess,
}: ReviewModalProps) {
  const [rating,  setRating]  = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [step,    setStep]    = useState<'form'|'success'>('form')

  const active = hovered || rating
  const col    = COLORS[active] || '#fbbf24'

  async function handleSubmit() {
    if (!rating) { setError('Zgjidh numrin e yjeve.'); return }
    setLoading(true); setError('')
    try {
      const res  = await fetch('/api/reviews/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application_id: applicationId, reviewee_id: revieweeId, reviewee_type: revieweeType, rating, comment }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setStep('success')
      setTimeout(() => onSuccess(), 2000)
    } catch { setError('Problem me lidhjen.') }
    finally  { setLoading(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20, backdropFilter: 'blur(10px)' }}>
      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scaleIn { from{opacity:0;transform:scale(0.6)} to{opacity:1;transform:scale(1)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        .star-btn { transition: transform 0.15s ease; }
        .star-btn:hover { transform: scale(1.2); }
      `}</style>

      <div style={{ width: '100%', maxWidth: 460, background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, overflow: 'hidden', animation: 'fadeUp 0.25s ease', boxShadow: '0 40px 100px rgba(0,0,0,0.6)' }}>

        {step === 'success' ? (
          <div style={{ padding: '56px 40px', textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(251,191,36,0.1)', border: '2px solid rgba(251,191,36,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', animation: 'scaleIn 0.4s ease', fontSize: 38 }}>⭐</div>
            <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: '1.6rem', fontWeight: 900, marginBottom: 10 }}>Faleminderit!</h2>
            <p style={{ fontSize: 14, color: 'rgba(232,234,240,0.5)', lineHeight: 1.7 }}>
              Vlerësimi juaj u regjistrua me sukses për <strong style={{ color: '#e8eaf0' }}>{revieweeName}</strong>.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ padding: '22px 26px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: '1.15rem', fontWeight: 900, marginBottom: 4 }}>Vlerëso {revieweeType === 'company' ? 'kompaninë' : 'punëtorin'}</h3>
                <p style={{ fontSize: 13, color: 'rgba(232,234,240,0.45)' }}>{applicationTitle}</p>
              </div>
              <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(232,234,240,0.5)', cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            <div style={{ padding: '28px 26px' }}>
              {/* Company/Worker name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, padding: '14px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 13, background: 'linear-gradient(135deg,#e8621a,#ff7c35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: '#fff' }}>
                  {revieweeName.slice(0,2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{revieweeName}</div>
                  <div style={{ fontSize: 12, color: 'rgba(232,234,240,0.4)' }}>{revieweeType === 'company' ? '🏢 Kompani' : '🔧 Punëtor'}</div>
                </div>
              </div>

              {/* Stars */}
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(232,234,240,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Si e vlerëson punën?</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
                  {[1,2,3,4,5].map(s => (
                    <button key={s} className="star-btn"
                      onClick={() => setRating(s)}
                      onMouseEnter={() => setHovered(s)}
                      onMouseLeave={() => setHovered(0)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 40, lineHeight: 1, color: s <= active ? col : 'rgba(255,255,255,0.12)', filter: s <= active ? `drop-shadow(0 0 8px ${col}88)` : 'none', transition: 'all 0.15s' }}>
                      ★
                    </button>
                  ))}
                </div>
                {active > 0 && (
                  <div style={{ fontSize: 14, fontWeight: 700, color: col, animation: 'fadeUp 0.2s ease' }}>
                    {LABELS[active]}
                  </div>
                )}
              </div>

              {/* Comment */}
              <div style={{ marginBottom: 22 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(232,234,240,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
                  Koment <span style={{ color: 'rgba(232,234,240,0.25)', textTransform: 'none', letterSpacing: 0 }}>(opsional)</span>
                </label>
                <textarea
                  value={comment} onChange={e => setComment(e.target.value)}
                  placeholder="Çfarë të pëlqeu? Çfarë mund të përmirësohet?"
                  rows={3}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 11, padding: '12px 14px', fontSize: 14, color: '#e8eaf0', fontFamily: 'inherit', outline: 'none', resize: 'vertical' as const, boxSizing: 'border-box' as const, lineHeight: 1.6 }}
                />
                <div style={{ fontSize: 11, color: 'rgba(232,234,240,0.25)', textAlign: 'right', marginTop: 4 }}>{comment.length}/300</div>
              </div>

              {error && <div style={{ marginBottom: 16, padding: '11px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, fontSize: 13, color: '#fca5a5' }}>⚠️ {error}</div>}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(232,234,240,0.6)', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Anulo</button>
                <button onClick={handleSubmit} disabled={loading || !rating}
                  style={{ flex: 2, padding: '12px', borderRadius: 12, background: rating && !loading ? `linear-gradient(135deg,${col},${col}cc)` : 'rgba(255,255,255,0.07)', border: 'none', color: rating ? '#fff' : 'rgba(232,234,240,0.3)', fontFamily: "'Fraunces',serif", fontWeight: 800, fontSize: '0.95rem', cursor: rating && !loading ? 'pointer' : 'not-allowed', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {loading ? <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Duke dërguar...</> : `⭐ Dërgo vlerësimin`}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}