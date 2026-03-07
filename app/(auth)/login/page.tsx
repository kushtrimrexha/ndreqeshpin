'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function LoginPage() {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [focused, setFocused] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form     = e.currentTarget
    const email    = (form.elements.namedItem('email')    as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value

    const supabase = createClient()

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Email ose fjalëkalimi është gabim.')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    const redirectMap: Record<string, string> = {
      client:  '/client/dashboard',
      company: '/company/dashboard',
      worker:  '/worker/dashboard',
      admin:   '/admin/dashboard',
    }

    router.push(redirectMap[profile?.role || 'client'])
    router.refresh()
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Fraunces:ital,wght@0,700;0,900;1,300&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0f0e0c; }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes shimmer { 0%,100%{opacity:0.5} 50%{opacity:1} }
        input::placeholder { color: rgba(240,236,228,0.2); }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #1a1917 inset !important;
          -webkit-text-fill-color: #f0ece4 !important;
        }
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

        {/* Background effects */}
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

          {/* Main headline */}
          <div>
            <div style={{ fontSize: 72, fontFamily: "'Fraunces',serif", fontStyle: 'italic', color: 'rgba(232,98,26,0.1)', lineHeight: 1, marginBottom: -16, marginLeft: -4 }}>"</div>
            <h1 style={{
              fontFamily: "'Fraunces',serif",
              fontSize: 'clamp(2rem,3.2vw,2.6rem)',
              fontWeight: 900, lineHeight: 1.18,
              letterSpacing: '-0.03em',
              marginBottom: 20,
            }}>
              Projekti yt i ëndrrave<br />
              <span style={{ color: '#e8621a', fontStyle: 'italic' }}>fillon këtu.</span>
            </h1>
            <p style={{ color: 'rgba(240,236,228,0.45)', fontSize: 15, lineHeight: 1.8, maxWidth: 380, marginBottom: 40 }}>
              Lidhu me kompanitë më të mira të ndërtimit në Kosovë. Prano oferta brenda 24 orësh dhe zgjidh me besim të plotë.
            </p>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, maxWidth: 380 }}>
              {[
                { val: '24h',  label: 'Oferta brenda' },
                { val: '500+', label: 'Kompani aktive' },
                { val: '98%',  label: 'Klientë të kënaqur' },
              ].map((s, i) => (
                <div key={i} style={{
                  padding: '16px 14px',
                  background: 'rgba(240,236,228,0.03)',
                  border: '1px solid rgba(240,236,228,0.07)',
                  borderRadius: 14,
                }}>
                  <div style={{ fontFamily: "'Fraunces',serif", fontSize: '1.5rem', fontWeight: 900, color: '#e8621a', marginBottom: 4 }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: 'rgba(240,236,228,0.4)', lineHeight: 1.4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div style={{
            padding: '18px 20px',
            background: 'rgba(240,236,228,0.03)',
            border: '1px solid rgba(240,236,228,0.07)',
            borderRadius: 16, maxWidth: 400,
          }}>
            <div style={{ display: 'flex', gap: 3, marginBottom: 10 }}>
              {[1,2,3,4,5].map(i => <span key={i} style={{ color: '#f59e0b', fontSize: 13 }}>★</span>)}
            </div>
            <p style={{ fontSize: 13, color: 'rgba(240,236,228,0.55)', lineHeight: 1.75, marginBottom: 14, fontStyle: 'italic' }}>
              "Brenda 6 orësh mora 4 oferta. Zgjodha kompaninë me çmimin më të mirë dhe punën e kreu brenda 10 ditësh."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff', flexShrink: 0 }}>AK</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Ardita Krasniqi</div>
                <div style={{ fontSize: 11, color: 'rgba(240,236,228,0.4)' }}>Prishtinë — Rregullim banjoje</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ────────────────────────── */}
        <div style={{
          width: 460,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '48px 48px',
          animation: 'fadeUp 0.5s ease 0.1s both',
        }}>

          {/* Tab switcher */}
          <div style={{
            display: 'flex', gap: 4,
            background: 'rgba(240,236,228,0.04)',
            padding: 4, borderRadius: 12,
            border: '1px solid rgba(240,236,228,0.07)',
            marginBottom: 40,
          }}>
            <div style={{ flex: 1, padding: '10px', borderRadius: 9, background: '#e8621a', textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>
              Kyçu
            </div>
            <Link href="/register" style={{ flex: 1, padding: '10px', borderRadius: 9, textAlign: 'center', fontSize: 13, fontWeight: 700, color: 'rgba(240,236,228,0.45)', textDecoration: 'none', display: 'block' }}>
              Regjistrohu
            </Link>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: '1.9rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 8 }}>
              Mirë se <span style={{ color: '#e8621a', fontStyle: 'italic' }}>erdhe</span> sërish
            </h2>
            <p style={{ color: 'rgba(240,236,228,0.45)', fontSize: 14, lineHeight: 1.6 }}>
              Kyçu për të vazhduar me projektet tua
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, fontSize: 13, color: '#fca5a5' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>

            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(240,236,228,0.45)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 7 }}>
                Email <span style={{ color: '#e8621a' }}>*</span>
              </label>
              <input
                name="email" type="email" required
                placeholder="emri@email.com"
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                style={{
                  width: '100%',
                  background: 'rgba(240,236,228,0.04)',
                  border: `1px solid ${focused === 'email' ? 'rgba(232,98,26,0.5)' : 'rgba(240,236,228,0.1)'}`,
                  borderRadius: 10, padding: '12px 14px', fontSize: 14,
                  color: '#f0ece4', fontFamily: 'inherit', outline: 'none',
                  transition: 'border-color 0.2s',
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 8 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(240,236,228,0.45)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 7 }}>
                Fjalëkalimi <span style={{ color: '#e8621a' }}>*</span>
              </label>
              <input
                name="password" type="password" required
                placeholder="••••••••"
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                style={{
                  width: '100%',
                  background: 'rgba(240,236,228,0.04)',
                  border: `1px solid ${focused === 'password' ? 'rgba(232,98,26,0.5)' : 'rgba(240,236,228,0.1)'}`,
                  borderRadius: 10, padding: '12px 14px', fontSize: 14,
                  color: '#f0ece4', fontFamily: 'inherit', outline: 'none',
                  transition: 'border-color 0.2s',
                }}
              />
            </div>

            <div style={{ textAlign: 'right', marginBottom: 28 }}>
              <button type="button" style={{ fontSize: 12, color: '#e8621a', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                Harrova fjalëkalimin
              </button>
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
                transition: 'all 0.2s',
                letterSpacing: '-0.01em',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 10,
              }}
            >
              {loading ? (
                <>
                  <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Duke u kyçur...
                </>
              ) : 'Kyçu →'}
            </button>
          </form>

          {/* Switch to register */}
          <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid rgba(240,236,228,0.07)', textAlign: 'center' }}>
            <span style={{ fontSize: 13, color: 'rgba(240,236,228,0.4)' }}>Nuk ke llogari? </span>
            <Link href="/register" style={{ fontSize: 13, color: '#e8621a', fontWeight: 700, textDecoration: 'none' }}>
              Regjistrohu falas
            </Link>
          </div>

          {/* Footer links */}
          <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center', gap: 20 }}>
            {['Kushtet', 'Privatësia', 'Ndihma'].map(l => (
              <button key={l} style={{ fontSize: 11, color: 'rgba(240,236,228,0.3)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>{l}</button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}