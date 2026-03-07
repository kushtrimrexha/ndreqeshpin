'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

type Role = 'client' | 'company' | 'worker'

const CITIES = [
  'Prishtinë','Prizren','Pejë','Gjakovë',
  'Mitrovicë','Gjilan','Ferizaj','Vushtrri',
  'Skenderaj','Lipjan','Podujevë','Klinë',
]

const ROLES = [
  { value: 'client'  as Role, icon: '🏠', label: 'Klient',  desc: 'Kërko shërbime renovimi', color: '#3b82f6' },
  { value: 'company' as Role, icon: '🏢', label: 'Kompani', desc: 'Ofro shërbime & puno',    color: '#e8621a' },
  { value: 'worker'  as Role, icon: '👷', label: 'Punëtor', desc: 'Profesionist individual',  color: '#10b981' },
]

function InputField({
  label, name, type = 'text', placeholder,
  required = false, focused, onFocus, onBlur,
}: {
  label: string; name: string; type?: string
  placeholder?: string; required?: boolean
  focused: boolean; onFocus: () => void; onBlur: () => void
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display: 'block', fontSize: 11, fontWeight: 700,
        color: 'rgba(240,236,228,0.45)', textTransform: 'uppercase',
        letterSpacing: '0.07em', marginBottom: 7,
      }}>
        {label}{required && <span style={{ color: '#e8621a', marginLeft: 3 }}>*</span>}
      </label>
      <input
        name={name} type={type} placeholder={placeholder}
        required={required} onFocus={onFocus} onBlur={onBlur}
        style={{
          width: '100%',
          background: focused ? 'rgba(232,98,26,0.04)' : 'rgba(240,236,228,0.04)',
          border: `1px solid ${focused ? 'rgba(232,98,26,0.5)' : 'rgba(240,236,228,0.1)'}`,
          borderRadius: 10, padding: '12px 14px', fontSize: 14,
          color: '#f0ece4', fontFamily: 'inherit', outline: 'none',
          transition: 'all 0.2s', boxSizing: 'border-box' as const,
        }}
      />
    </div>
  )
}

function SelectField({
  label, name, options, required = false, focused, onFocus, onBlur,
}: {
  label: string; name: string; options: string[]
  required?: boolean; focused: boolean; onFocus: () => void; onBlur: () => void
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display: 'block', fontSize: 11, fontWeight: 700,
        color: 'rgba(240,236,228,0.45)', textTransform: 'uppercase',
        letterSpacing: '0.07em', marginBottom: 7,
      }}>
        {label}{required && <span style={{ color: '#e8621a', marginLeft: 3 }}>*</span>}
      </label>
      <select
        name={name} required={required} onFocus={onFocus} onBlur={onBlur}
        style={{
          width: '100%',
          background: focused ? 'rgba(232,98,26,0.04)' : 'rgba(240,236,228,0.04)',
          border: `1px solid ${focused ? 'rgba(232,98,26,0.5)' : 'rgba(240,236,228,0.1)'}`,
          borderRadius: 10, padding: '12px 14px', fontSize: 14,
          color: '#f0ece4', fontFamily: 'inherit', outline: 'none',
          transition: 'all 0.2s', boxSizing: 'border-box' as const,
          appearance: 'none' as const, cursor: 'pointer',
        }}
      >
        <option value="" style={{ background: '#1a1917' }}>Zgjedh qytetin...</option>
        {options.map(o => (
          <option key={o} value={o} style={{ background: '#1a1917' }}>{o}</option>
        ))}
      </select>
    </div>
  )
}

export default function RegisterPage() {
  const router    = useRouter()
  const [role,    setRole]    = useState<Role>('client')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [focused, setFocused] = useState<string | null>(null)
  const [agreed,  setAgreed]  = useState(false)

  const focus = (name: string) => () => setFocused(name)
  const blur  = () => setFocused(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (!agreed) {
      setError('Duhet të pranosh kushtet e shërbimit.')
      return
    }

    setLoading(true)

    const form          = e.currentTarget
    const email         = (form.elements.namedItem('email')         as HTMLInputElement).value
    const password      = (form.elements.namedItem('password')      as HTMLInputElement).value
    const full_name     = (form.elements.namedItem('full_name')     as HTMLInputElement).value
    const city          = (form.elements.namedItem('city')          as HTMLSelectElement).value
    const phone         = (form.elements.namedItem('phone')         as HTMLInputElement).value
    const business_name = role === 'company'
      ? (form.elements.namedItem('business_name') as HTMLInputElement)?.value
      : null

    if (password.length < 8) {
      setError('Fjalëkalimi duhet të ketë të paktën 8 karaktere.')
      setLoading(false)
      return
    }

    try {
      // 1. Regjistro tek API
      const res = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password, full_name, role, city, phone, business_name }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Ndodhi një gabim. Provo sërish.')
        setLoading(false)
        return
      }

      // 2. Kyç automatikisht
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

      if (signInError) {
        setError('Llogaria u krijua por kyçja dështoi. Provo të kyçesh manualisht.')
        setLoading(false)
        return
      }

      // 3. Ridirektoje
      const redirectMap: Record<Role, string> = {
        client:  '/client/dashboard',
        company: '/company/dashboard',
        worker:  '/worker/dashboard',
      }

      router.push(redirectMap[role])
      router.refresh()

    } catch {
      setError('Ndodhi një gabim. Kontrollo lidhjen me internet.')
      setLoading(false)
    }
  }

  const selectedRole = ROLES.find(r => r.value === role)!

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Fraunces:ital,wght@0,700;0,900;1,300&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0f0e0c; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        input::placeholder, textarea::placeholder { color: rgba(240,236,228,0.2); }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #1a1917 inset !important;
          -webkit-text-fill-color: #f0ece4 !important;
        }
        select option { background: #1a1917; color: #f0ece4; }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: '#0f0e0c',
        color: '#f0ece4',
        fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Background */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 15% 50%, rgba(232,98,26,0.07) 0%, transparent 55%), radial-gradient(circle at 85% 20%, rgba(59,130,246,0.04) 0%, transparent 45%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(240,236,228,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(240,236,228,0.015) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

        {/* ── LEFT PANEL ─────────────────────────── */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px 56px',
          borderRight: '1px solid rgba(240,236,228,0.06)',
          position: 'relative',
          animation: 'fadeUp 0.6s ease',
        }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42, height: 42,
              background: 'linear-gradient(135deg,#e8621a,#ff8c4a)',
              borderRadius: 11,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Fraunces',serif", fontWeight: 900, color: '#fff', fontSize: 20,
              boxShadow: '0 8px 24px rgba(232,98,26,0.3)',
            }}>N</div>
            <div>
              <div style={{ fontFamily: "'Fraunces',serif", fontWeight: 900, fontSize: 19, letterSpacing: '-0.02em' }}>Ndreqe Shpin</div>
              <div style={{ fontSize: 10, color: 'rgba(240,236,228,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 1 }}>Platforma e Renovimit</div>
            </div>
          </div>

          {/* How it works */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(240,236,228,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 28 }}>
              Si funksionon
            </div>

            {[
              { step: '01', title: 'Posto projektin',    desc: 'Plotëso formularin me detajet e renovimit tënd. Shto foto dhe buxhetin.',          icon: '📋' },
              { step: '02', title: 'Merr oferta',        desc: 'Brenda 24 orësh kompanitë e verifikuara dërgojnë ofertat e tyre.',                  icon: '💼' },
              { step: '03', title: 'Krahaso & zgjidh',   desc: 'Krahaso çmimet, afatet dhe vlerësimet. Zgjedh ofertën më të mirë.',                  icon: '⚖️' },
              { step: '04', title: 'Fillo projektin',    desc: 'Komuniko direkt me kompaninë dhe fillo renovimin.',                                  icon: '🏗️' },
            ].map((s, i) => (
              <div key={i} style={{
                display: 'flex', gap: 16, marginBottom: 24,
                opacity: 1, animation: `fadeUp 0.5s ease ${i * 0.08}s both`,
              }}>
                <div style={{ flexShrink: 0 }}>
                  <div style={{
                    width: 40, height: 40,
                    background: 'rgba(232,98,26,0.1)',
                    border: '1px solid rgba(232,98,26,0.2)',
                    borderRadius: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18,
                  }}>{s.icon}</div>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontFamily: "'Fraunces',serif", fontWeight: 900, color: 'rgba(232,98,26,0.6)', letterSpacing: '0.05em' }}>{s.step}</span>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{s.title}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'rgba(240,236,228,0.4)', lineHeight: 1.65 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '12px 18px',
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: 12,
          }}>
            <span style={{ color: '#10b981', fontSize: 18 }}>🛡️</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981' }}>Kompani të verifikuara</div>
              <div style={{ fontSize: 11, color: 'rgba(240,236,228,0.35)' }}>Çdo kompani kalon verifikim manual</div>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ────────────────────────── */}
        <div style={{
          width: 500,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '40px 48px',
          overflowY: 'auto',
          animation: 'fadeUp 0.5s ease 0.1s both',
        }}>

          {/* Tab switcher */}
          <div style={{
            display: 'flex', gap: 4,
            background: 'rgba(240,236,228,0.04)',
            padding: 4, borderRadius: 12,
            border: '1px solid rgba(240,236,228,0.07)',
            marginBottom: 36,
          }}>
            <Link href="/login" style={{
              flex: 1, padding: '10px', borderRadius: 9,
              textAlign: 'center', fontSize: 13, fontWeight: 700,
              color: 'rgba(240,236,228,0.45)', textDecoration: 'none', display: 'block',
            }}>
              Kyçu
            </Link>
            <div style={{
              flex: 1, padding: '10px', borderRadius: 9,
              background: '#e8621a', textAlign: 'center',
              fontSize: 13, fontWeight: 700, color: '#fff',
            }}>
              Regjistrohu
            </div>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: '1.85rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 8 }}>
              Krijo <span style={{ color: '#e8621a', fontStyle: 'italic' }}>llogarinë</span>
            </h2>
            <p style={{ color: 'rgba(240,236,228,0.45)', fontSize: 14, lineHeight: 1.6 }}>
              Zgjidh rolin tënd dhe fillo brenda 2 minutave — falas
            </p>
          </div>

          {/* Role selector */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(240,236,228,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              Unë jam
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {ROLES.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  style={{
                    padding: '14px 10px',
                    borderRadius: 12,
                    border: `1.5px solid ${role === r.value ? r.color : 'rgba(240,236,228,0.08)'}`,
                    background: role === r.value ? `${r.color}12` : 'rgba(240,236,228,0.02)',
                    cursor: 'pointer', fontFamily: 'inherit',
                    textAlign: 'center', transition: 'all 0.2s',
                    position: 'relative' as const,
                  }}
                >
                  {role === r.value && (
                    <div style={{
                      position: 'absolute', top: 7, right: 7,
                      width: 16, height: 16, background: r.color,
                      borderRadius: '50%', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: 9, color: '#fff', fontWeight: 800,
                    }}>✓</div>
                  )}
                  <div style={{ fontSize: 22, marginBottom: 5 }}>{r.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: role === r.value ? '#f0ece4' : 'rgba(240,236,228,0.5)', marginBottom: 3 }}>{r.label}</div>
                  <div style={{ fontSize: 10, color: role === r.value ? r.color : 'rgba(240,236,228,0.28)', lineHeight: 1.3 }}>{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ marginBottom: 18, padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, fontSize: 13, color: '#fca5a5' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>

            <InputField label="Emri i plotë" name="full_name" placeholder="Ardita Krasniqi" required focused={focused === 'full_name'} onFocus={focus('full_name')} onBlur={blur} />

            {role === 'company' && (
              <InputField label="Emri i biznesit" name="business_name" placeholder="Konstruksioni Ahmeti SH.P.K" required focused={focused === 'business_name'} onFocus={focus('business_name')} onBlur={blur} />
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <SelectField label="Qyteti" name="city" options={CITIES} required focused={focused === 'city'} onFocus={focus('city')} onBlur={blur} />
              <InputField label="Telefoni" name="phone" type="tel" placeholder="+383 4X XXX" focused={focused === 'phone'} onFocus={focus('phone')} onBlur={blur} />
            </div>

            <InputField label="Email" name="email" type="email" placeholder="emri@email.com" required focused={focused === 'email'} onFocus={focus('email')} onBlur={blur} />
            <InputField label="Fjalëkalimi" name="password" type="password" placeholder="Minimum 8 karaktere" required focused={focused === 'password'} onFocus={focus('password')} onBlur={blur} />

            {/* Terms */}
            <div style={{
              display: 'flex', gap: 10, alignItems: 'flex-start',
              marginBottom: 22, marginTop: 4, padding: '12px 14px',
              background: 'rgba(240,236,228,0.03)',
              border: '1px solid rgba(240,236,228,0.07)',
              borderRadius: 10, cursor: 'pointer',
            }} onClick={() => setAgreed(!agreed)}>
              <div style={{
                width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1,
                border: `1.5px solid ${agreed ? '#e8621a' : 'rgba(240,236,228,0.2)'}`,
                background: agreed ? '#e8621a' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s', cursor: 'pointer',
              }}>
                {agreed && <span style={{ color: '#fff', fontSize: 11, fontWeight: 800 }}>✓</span>}
              </div>
              <span style={{ fontSize: 12, color: 'rgba(240,236,228,0.45)', lineHeight: 1.65 }}>
                Pajtohem me{' '}
                <span style={{ color: '#e8621a' }}>Kushtet e Shërbimit</span>
                {' '}dhe{' '}
                <span style={{ color: '#e8621a' }}>Politikën e Privatësisë</span>
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? 'rgba(232,98,26,0.55)' : '#e8621a',
                border: 'none', color: '#fff',
                fontFamily: "'Fraunces',serif",
                fontSize: '1.05rem', fontWeight: 800,
                padding: '14px', borderRadius: 12,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s', letterSpacing: '-0.01em',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 10,
              }}
            >
              {loading ? (
                <>
                  <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Duke u regjistruar...
                </>
              ) : `Krijo llogari si ${selectedRole.label} →`}
            </button>
          </form>

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(240,236,228,0.07)', textAlign: 'center' }}>
            <span style={{ fontSize: 13, color: 'rgba(240,236,228,0.4)' }}>Ke llogari? </span>
            <Link href="/login" style={{ fontSize: 13, color: '#e8621a', fontWeight: 700, textDecoration: 'none' }}>
              Kyçu
            </Link>
          </div>

          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 20 }}>
            {['Kushtet', 'Privatësia', 'Ndihma'].map(l => (
              <button key={l} style={{ fontSize: 11, color: 'rgba(240,236,228,0.3)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>{l}</button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}