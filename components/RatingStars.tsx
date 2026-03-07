'use client'

import { useState } from 'react'

interface RatingStarsProps {
  value?:     number
  onChange?:  (rating: number) => void
  readonly?:  boolean
  size?:      number
  color?:     string
  showLabel?: boolean
  total?:     number
}

const LABELS = ['', 'Shumë keq', 'Keq', 'Mesatar', 'Mirë', 'Shkëlqyeshëm']

export function RatingStars({
  value = 0,
  onChange,
  readonly = false,
  size = 24,
  color = '#fbbf24',
  showLabel = false,
  total,
}: RatingStarsProps) {
  const [hover, setHover] = useState(0)

  const display = readonly ? value : (hover || value)

  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
      <div style={{ display:'flex', gap:2 }}>
        {[1, 2, 3, 4, 5].map(star => {
          const filled = star <= display
          const half   = !filled && star - 0.5 <= display

          return (
            <button key={star} type="button"
              disabled={readonly}
              onMouseEnter={() => !readonly && setHover(star)}
              onMouseLeave={() => !readonly && setHover(0)}
              onClick={() => !readonly && onChange?.(star)}
              style={{
                background: 'none', border: 'none',
                cursor: readonly ? 'default' : 'pointer',
                padding: 0, lineHeight: 1,
                fontSize: size, color,
                opacity: filled ? 1 : 0.2,
                transition: 'all 0.1s',
                transform: (!readonly && hover === star) ? 'scale(1.2)' : 'scale(1)',
              }}>
              ★
            </button>
          )
        })}
      </div>

      {showLabel && !readonly && hover > 0 && (
        <span style={{ fontSize:12, color:'rgba(240,236,228,0.6)', fontWeight:600, fontFamily:"'DM Sans',sans-serif", minWidth:100 }}>
          {LABELS[hover]}
        </span>
      )}

      {readonly && value > 0 && (
        <span style={{ fontSize: size * 0.55, color:'rgba(240,236,228,0.5)', fontWeight:700, fontFamily:"'DM Sans',sans-serif" }}>
          {value.toFixed(1)}{total !== undefined ? ` (${total})` : ''}
        </span>
      )}
    </div>
  )
}

/**
 * RatingDisplay — compact inline stars for cards
 */
export function RatingDisplay({ value, count, size = 14 }: { value: number; count?: number; size?: number }) {
  if (!value || value === 0) return null
  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
      <span style={{ fontSize: size, color:'#fbbf24', lineHeight:1 }}>★</span>
      <span style={{ fontSize: size * 0.85, fontWeight:700, color:'rgba(240,236,228,0.7)', fontFamily:"'DM Sans',sans-serif", lineHeight:1 }}>
        {value.toFixed(1)}
      </span>
      {count !== undefined && (
        <span style={{ fontSize: size * 0.8, color:'rgba(240,236,228,0.3)', fontFamily:"'DM Sans',sans-serif" }}>
          ({count})
        </span>
      )}
    </div>
  )
}

/**
 * RatingBar — horizontal breakdown bar (like Amazon)
 */
export function RatingBreakdown({ distribution }: { distribution: Record<number, number> }) {
  const total = Object.values(distribution).reduce((s, v) => s + v, 0)

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6, fontFamily:"'DM Sans',sans-serif" }}>
      {[5, 4, 3, 2, 1].map(star => {
        const count = distribution[star] || 0
        const pct   = total > 0 ? (count / total) * 100 : 0
        return (
          <div key={star} style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:11, color:'rgba(240,236,228,0.4)', width:8, textAlign:'right', flexShrink:0 }}>{star}</span>
            <span style={{ fontSize:12, color:'#fbbf24', lineHeight:1, flexShrink:0 }}>★</span>
            <div style={{ flex:1, height:6, background:'rgba(240,236,228,0.06)', borderRadius:3, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${pct}%`, background:'linear-gradient(90deg,#fbbf24,#f59e0b)', borderRadius:3, transition:'width 0.6s ease' }} />
            </div>
            <span style={{ fontSize:11, color:'rgba(240,236,228,0.3)', width:20, textAlign:'right', flexShrink:0 }}>{count}</span>
          </div>
        )
      })}
    </div>
  )
}