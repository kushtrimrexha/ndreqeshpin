'use client'

import { useState } from 'react'
import ReviewModal  from '@/components/ReviewModal'

interface Review {
  id: string; rating: number; comment: string | null; created_at: string
  reviewer?: { full_name: string; avatar_url?: string }
  reviewee?: { full_name: string }
  application?: { title: string }
}
interface PendingProject {
  id: string; title: string; city: string; accepted_at: string
  company_profile_id: string; company_name: string
  already_reviewed: boolean
}

interface Props {
  userId:          string
  userRole:        'client' | 'company' | 'worker'
  receivedReviews: Review[]
  pendingProjects: PendingProject[]  // vetëm për client
  ratingAvg:       number
  ratingCount:     number
}

function Stars({ rating, size = 16, col = '#fbbf24' }: { rating: number; size?: number; col?: string }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(s => (
        <span key={s} style={{ fontSize: size, color: s <= Math.round(rating) ? col : 'rgba(255,255,255,0.1)', lineHeight: 1 }}>★</span>
      ))}
    </div>
  )
}

function RatingBar({ label, count, total, col }: { label: string; count: number; total: number; col: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 12, color: 'rgba(232,234,240,0.5)', minWidth: 40 }}>{label}</span>
      <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: col, borderRadius: 3, transition: 'width 1s ease' }} />
      </div>
      <span style={{ fontSize: 12, color: 'rgba(232,234,240,0.4)', minWidth: 28, textAlign: 'right' as const }}>{count}</span>
    </div>
  )
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const days = Math.floor(diff / 86_400_000)
  if (days < 1)  return 'Sot'
  if (days < 7)  return `${days} ditë më parë`
  if (days < 30) return `${Math.floor(days/7)} javë më parë`
  return new Date(d).toLocaleDateString('sq-AL', { month: 'long', year: 'numeric' })
}

export default function ReviewsClient({ userId, userRole, receivedReviews, pendingProjects, ratingAvg, ratingCount }: Props) {
  const [tab,          setTab]          = useState<'received'|'give'>(userRole === 'client' ? 'give' : 'received')
  const [modal,        setModal]        = useState<PendingProject | null>(null)
  const [reviewed,     setReviewed]     = useState<Set<string>>(new Set(pendingProjects.filter(p => p.already_reviewed).map(p => p.id)))
  const [localReviews, setLocalReviews] = useState<Review[]>(receivedReviews)

  // Rating breakdown
  const breakdown = [5,4,3,2,1].map(s => ({
    label: `${s} ★`,
    count: localReviews.filter(r => r.rating === s).length,
    col: s >= 4 ? '#22d3a5' : s === 3 ? '#fbbf24' : '#f87171',
  }))

  const pending  = pendingProjects.filter(p => !reviewed.has(p.id))
  const done     = pendingProjects.filter(p =>  reviewed.has(p.id))

  function handleReviewSuccess() {
    if (!modal) return
    setReviewed(prev => new Set([...prev, modal.id]))
    setModal(null)
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: '1.9rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 6 }}>Vlerësimet</h1>
        <p style={{ fontSize: 14, color: 'rgba(232,234,240,0.45)' }}>
          {userRole === 'client' ? 'Vlerëso kompanitë me të cilat ke punuar' : 'Shiko çfarë thonë klientët për punën tënde'}
        </p>
      </div>

      {/* Rating summary — vetëm për company/worker */}
      {userRole !== 'client' && ratingCount > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16, marginBottom: 28, padding: '26px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, animation: 'fadeUp 0.4s ease' }}>
          <div style={{ textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.07)', paddingRight: 20 }}>
            <div style={{ fontFamily: "'Fraunces',serif", fontSize: '4rem', fontWeight: 900, color: '#fbbf24', lineHeight: 1, marginBottom: 10 }}>{ratingAvg.toFixed(1)}</div>
            <Stars rating={ratingAvg} size={22} />
            <div style={{ fontSize: 13, color: 'rgba(232,234,240,0.4)', marginTop: 10 }}>{ratingCount} vlerësime</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center', paddingLeft: 4 }}>
            {breakdown.map(b => <RatingBar key={b.label} {...b} total={ratingCount} />)}
          </div>
        </div>
      )}

      {/* Tabs — vetëm për client */}
      {userRole === 'client' && (
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', padding: 4, borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)', alignSelf: 'flex-start', display: 'inline-flex', marginBottom: 24 }}>
          {([['give', `📝 Jep vlerësim (${pending.length})`], ['received', `⭐ Të marra (${localReviews.length})`]] as const).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '8px 18px', borderRadius: 9, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', background: tab === t ? '#e8621a' : 'transparent', color: tab === t ? '#fff' : 'rgba(232,234,240,0.45)', transition: 'all 0.2s' }}>
              {label}
            </button>
          ))}
        </div>
      )}

      {/* ── TAB: GIVE REVIEW (client only) ── */}
      {userRole === 'client' && tab === 'give' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {pending.length === 0 && done.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: 'rgba(232,234,240,0.3)' }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>📋</div>
              <div style={{ fontFamily: "'Fraunces',serif", fontSize: '1.1rem', fontWeight: 800, marginBottom: 8 }}>Nuk ka projekte të pranuara</div>
              <p style={{ fontSize: 13, lineHeight: 1.7 }}>Pas pranimit të një oferte do të mundesh të vlerësosh kompaninë.</p>
            </div>
          )}

          {pending.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(232,234,240,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Presin vlerësimin tënd — {pending.length}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {pending.map((p, i) => (
                  <div key={p.id}
                    style={{ padding: '20px 22px', background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.18)', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 16, animation: `fadeUp 0.3s ease ${i * 0.06}s both` }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#e8621a,#ff7c35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 17, color: '#fff', flexShrink: 0 }}>
                      {p.company_name.slice(0,2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{p.title}</div>
                      <div style={{ fontSize: 12, color: 'rgba(232,234,240,0.45)', display: 'flex', gap: 10 }}>
                        <span>🏢 {p.company_name}</span>
                        <span>📅 {new Date(p.accepted_at).toLocaleDateString('sq-AL')}</span>
                      </div>
                    </div>
                    <button onClick={() => setModal(p)}
                      style={{ padding: '10px 20px', borderRadius: 11, background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', border: 'none', color: '#000', fontFamily: "'Fraunces',serif", fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer', flexShrink: 0, boxShadow: '0 4px 14px rgba(251,191,36,0.3)', transition: 'all 0.2s' }}>
                      ⭐ Vlerëso
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {done.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(232,234,240,0.25)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, marginTop: 8 }}>Të vlerësuara tashmë — {done.length}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {done.map((p, i) => (
                  <div key={p.id}
                    style={{ padding: '16px 22px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 14, opacity: 0.55, animation: `fadeUp 0.3s ease ${i * 0.04}s both` }}>
                    <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: 'rgba(232,234,240,0.4)', flexShrink: 0 }}>
                      {p.company_name.slice(0,2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'rgba(232,234,240,0.6)', marginBottom: 2 }}>{p.title}</div>
                      <div style={{ fontSize: 11, color: 'rgba(232,234,240,0.35)' }}>🏢 {p.company_name}</div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#22d3a5', background: 'rgba(34,211,165,0.1)', border: '1px solid rgba(34,211,165,0.2)', borderRadius: 8, padding: '4px 12px' }}>✓ Vlerësuar</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── RECEIVED REVIEWS ─────────────── */}
      {(userRole !== 'client' || tab === 'received') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {localReviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: 'rgba(232,234,240,0.3)' }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>⭐</div>
              <div style={{ fontFamily: "'Fraunces',serif", fontSize: '1.1rem', fontWeight: 800, marginBottom: 8 }}>
                {userRole === 'client' ? 'Nuk ke marrë vlerësime' : 'Nuk ke vlerësime ende'}
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.7 }}>Vlerësimet do të shfaqen pasi klientët të vlerësojnë punën tënde.</p>
            </div>
          ) : (
            localReviews.map((r, i) => (
              <div key={r.id}
                style={{ padding: '22px 24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, animation: `fadeUp 0.35s ease ${i * 0.06}s both` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 13, background: 'linear-gradient(135deg,#60a5fa,#818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15, color: '#fff' }}>
                      {(r.reviewer?.full_name || 'K').slice(0,2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{r.reviewer?.full_name || 'Klient anonim'}</div>
                      <Stars rating={r.rating} size={15} />
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' as const }}>
                    <div style={{ fontFamily: "'Fraunces',serif", fontWeight: 900, fontSize: '1.6rem', color: r.rating >= 4 ? '#22d3a5' : r.rating === 3 ? '#fbbf24' : '#f87171', lineHeight: 1 }}>{r.rating}.0</div>
                    <div style={{ fontSize: 11, color: 'rgba(232,234,240,0.35)', marginTop: 3 }}>{timeAgo(r.created_at)}</div>
                  </div>
                </div>

                {r.application && (
                  <div style={{ fontSize: 12, color: 'rgba(232,234,240,0.4)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(232,234,240,0.2)', display: 'inline-block' }} />
                    Projekti: {r.application.title}
                  </div>
                )}

                {r.comment && (
                  <p style={{ fontSize: 14, color: 'rgba(232,234,240,0.65)', lineHeight: 1.75, fontStyle: 'italic', borderLeft: '2px solid rgba(251,191,36,0.3)', paddingLeft: 14 }}>
                    "{r.comment}"
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Review Modal */}
      {modal && (
        <ReviewModal
          applicationId={modal.id}
          applicationTitle={modal.title}
          revieweeId={modal.company_profile_id}
          revieweeName={modal.company_name}
          revieweeType="company"
          onClose={() => setModal(null)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  )
}