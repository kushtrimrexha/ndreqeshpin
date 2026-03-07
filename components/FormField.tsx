'use client'

interface FormFieldProps {
  label:       string
  name:        string
  value:       string
  onChange:    (val: string) => void
  type?:       'text' | 'textarea' | 'email' | 'tel' | 'url' | 'number'
  placeholder?: string
  hint?:       string
  required?:   boolean
  rows?:       number
  focused:     string | null
  onFocus:     (n: string) => void
  onBlur:      () => void
}

export default function FormField({
  label, name, value, onChange, type = 'text',
  placeholder, hint, required, rows = 4,
  focused, onFocus, onBlur,
}: FormFieldProps) {
  const isActive = focused === name
  const base: React.CSSProperties = {
    width: '100%', fontFamily: 'inherit', fontSize: 14,
    color: '#e8eaf0', outline: 'none',
    background: isActive ? 'rgba(232,98,26,0.05)' : 'rgba(255,255,255,0.04)',
    border: `1px solid ${isActive ? 'rgba(232,98,26,0.5)' : 'rgba(255,255,255,0.09)'}`,
    borderRadius: 11, padding: '12px 14px',
    transition: 'all 0.2s', boxSizing: 'border-box' as const,
  }

  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(232,234,240,0.4)', textTransform: 'uppercase' as const, letterSpacing: '0.07em', marginBottom: 7 }}>
        {label} {required && <span style={{ color: '#e8621a' }}>*</span>}
      </label>

      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          onFocus={() => onFocus(name)}
          onBlur={onBlur}
          style={{ ...base, resize: 'vertical' as const, minHeight: rows * 24 }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => onFocus(name)}
          onBlur={onBlur}
          style={base}
        />
      )}

      {hint && (
        <p style={{ fontSize: 11, color: 'rgba(232,234,240,0.3)', marginTop: 5 }}>{hint}</p>
      )}
    </div>
  )
}