'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Sidebar from '@/components/Sidebar'

interface Profile { id: string; full_name: string; city: string; package_type: string }

const CATEGORIES = [
  { id: 'banjo',     name: 'Banjo & Sanitare',     icon: '🚿', desc: 'Kafelizhim, sanitar, hidraulikë' },
  { id: 'kuzhine',   name: 'Kuzhinë',               icon: '🍳', desc: 'Kabinete, sipërfaqe, instalime' },
  { id: 'ngjyrosje', name: 'Ngjyrosje & Suvatime',  icon: '🎨', desc: 'Brendshme dhe jashtme' },
  { id: 'dysheme',   name: 'Dysheme & Pllaka',       icon: '🪵', desc: 'Parket, pllaka, vinyl' },
  { id: 'elektrike', name: 'Elektrike',              icon: '⚡', desc: 'Instalim, panel, ndriçim' },
  { id: 'hidraulike',name: 'Hidraulikë',             icon: '🔧', desc: 'Tuba, radiatorë, bojler' },
  { id: 'ndertim',   name: 'Ndërtim & Strukturë',   icon: '🏗️', desc: 'Mure, shtylla, beton' },
  { id: 'dyer',      name: 'Dyer & Dritare',         icon: '🪟', desc: 'PVC, alumin, dru' },
  { id: 'fasada',    name: 'Fasadë & Eksterier',     icon: '🏠', desc: 'Izolim, suvatim, ngjyrosje' },
  { id: 'ngrohje',   name: 'Ngrohje & Klimë',        icon: '🌡️', desc: 'Central, kondicioner, panele' },
  { id: 'oborr',     name: 'Oborr & Rrethojë',       icon: '🌿', desc: 'Rregullim, gardh, kalldrëm' },
  { id: 'tjeter',    name: 'Tjetër',                 icon: '🔨', desc: 'Shërbime të tjera' },
]

const CITIES = ['Prishtinë','Prizren','Pejë','Gjakovë','Mitrovicë','Gjilan','Ferizaj','Vushtrri','Skenderaj','Lipjan','Podujevë','Klinë']

function StepBar({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 40 }}>
      {Array.from({ length: total }).map((_, i) => {
        const done   = i < current
        const active = i === current
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < total - 1 ? 1 : 0 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: done ? '#e8621a' : active ? 'rgba(232,98,26,0.15)' : 'rgba(255,255,255,0.05)',
              border: `2px solid ${done ? '#e8621a' : active ? 'rgba(232,98,26,0.6)' : 'rgba(255,255,255,0.1)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 800,
              color: done ? '#fff' : active ? '#e8621a' : 'rgba(232,234,240,0.3)',
              transition: 'all 0.3s',
            }}>
              {done ? '✓' : i + 1}
            </div>
            {i < total - 1 && (
              <div style={{ flex: 1, height: 2, background: done ? '#e8621a' : 'rgba(255,255,255,0.07)', transition: 'background 0.3s', margin: '0 6px' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(232,234,240,0.4)', textTransform: 'uppercase' as const, letterSpacing: '0.07em', marginBottom: 7 }}>
        {label}{required && <span style={{ color: '#e8621a', marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  )
}

function inputCss(focused: boolean): React.CSSProperties {
  return {
    width: '100%',
    background: focused ? 'rgba(232,98,26,0.05)' : 'rgba(255,255,255,0.04)',
    border: `1px solid ${focused ? 'rgba(232,98,26,0.5)' : 'rgba(255,255,255,0.09)'}`,
    borderRadius: 10, padding: '12px 14px', fontSize: 14,
    color: '#e8eaf0', fontFamily: 'inherit', outline: 'none',
    transition: 'all 0.2s', boxSizing: 'border-box' as const,
  }
}

export default function NewApplicationPage({ profile }: { profile: Profile }) {
  const router   = useRouter()
  const supabase = createClient()

  const [step,    setStep]    = useState(0)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [focused, setFocused] = useState<string | null>(null)

  const [categoryId,   setCategoryId]   = useState('')
  const [title,        setTitle]        = useState('')
  const [description,  setDescription]  = useState('')
  const [city,         setCity]         = useState(profile.city || '')
  const [areaSqm,      setAreaSqm]      = useState('')
  const [budgetMin,    setBudgetMin]     = useState('')
  const [budgetMax,    setBudgetMax]     = useState('')
  const [providerType, setProviderType] = useState<'company'|'worker'|'both'>('both')

  const selectedCat  = CATEGORIES.find(c => c.id === categoryId)
  const stepTitles   = ['Kategoria', 'Detajet', 'Buxheti', 'Konfirmo']

  function validateStep(): string {
    if (step === 0 && !categoryId)                    return 'Zgjedh një kategori.'
    if (step === 1 && title.trim().length < 5)        return 'Titulli duhet të ketë të paktën 5 karaktere.'
    if (step === 1 && description.trim().length < 20) return 'Përshkrimi duhet të ketë të paktën 20 karaktere.'
    if (step === 1 && !city)                          return 'Zgjedh qytetin.'
    if (step === 2 && budgetMin && budgetMax && Number(budgetMin) > Number(budgetMax))
      return 'Buxheti minimal nuk mund të jetë më i madh se maksimali.'
    return ''
  }

  function handleNext() {
    const err = validateStep()
    if (err) { setError(err); return }
    setError('')
    setStep(s => s + 1)
  }

  async function handleSubmit() {
    setLoading(true); setError('')

    const { data: catData } = await supabase
      .from('categories').select('id').eq('slug', categoryId).single()

    const { error: err } = await supabase.from('applications').insert({
      client_id:     profile.id,
      category_id:   catData?.id || null,
      title:         title.trim(),
      description:   description.trim(),
      city,
      area_sqm:      areaSqm   ? Number(areaSqm)   : null,
      budget_min:    budgetMin ? Number(budgetMin)  : null,
      budget_max:    budgetMax ? Number(budgetMax)  : null,
      provider_type: providerType,
      expires_at:    new Date(Date.now() + 24 * 3_600_000).toISOString(),
    })

    if (err) { setError(err.message); setLoading(false); return }
    router.push('/client/dashboard?success=1')
    router.refresh()
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080b12',
      color: '#e8eaf0',
      fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
      display: 'flex',   // ← FIX: flex layout si dashboardet
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900;1,9..144,400&display=swap');
        @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        * { box-sizing:border-box; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.08); border-radius:4px; }
        .cat-btn:hover  { border-color:rgba(232,98,26,0.4) !important; background:rgba(232,98,26,0.05) !important; }
        .back-btn:hover { color:rgba(232,234,240,0.7) !important; }
        select option   { background:#0e1219; color:#e8eaf0; }
      `}</style>

      {/* Sidebar */}
      <Sidebar role="client" userName={profile.full_name} package={profile.package_type} />

      {/* Main content — flex:1 ashtu si dashboardet */}
      <div style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>

        {/* Top bar */}
        <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(8,11,18,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 32px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16 }}>📋</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(232,234,240,0.6)' }}>Aplikim i Ri</span>
          </div>
          <span style={{ fontSize: 12, color: 'rgba(232,234,240,0.3)', fontWeight: 600 }}>
            Hapi {step + 1} / {stepTitles.length} — {stepTitles[step]}
          </span>
        </div>

        {/* Form container */}
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 32px 80px', animation: 'fadeUp 0.4s ease' }}>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <button onClick={() => step > 0 ? setStep(s => s - 1) : router.back()}
              className="back-btn"
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'rgba(232,234,240,0.4)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, marginBottom: 20, padding: 0, transition: 'color 0.2s' }}>
              ← Kthehu
            </button>
            <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 6 }}>
              Aplikim i <span style={{ color: '#e8621a', fontStyle: 'italic' }}>Ri</span>
            </h1>
            <p style={{ color: 'rgba(232,234,240,0.4)', fontSize: 14 }}>
              Posto projektin tënd dhe merr oferta brenda 24 orësh
            </p>
          </div>

          {/* Step bar */}
          <StepBar current={step} total={4} />

          {/* Error */}
          {error && (
            <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, fontSize: 13, color: '#fca5a5' }}>
              ⚠️ {error}
            </div>
          )}

          {/* ── STEP 0: Kategoria ─────────────── */}
          {step === 0 && (
            <div style={{ animation: 'slideIn 0.3s ease' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(175px,1fr))', gap: 10 }}>
                {CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => { setCategoryId(cat.id); setError('') }}
                    className="cat-btn"
                    style={{ padding: '16px 14px', borderRadius: 14, textAlign: 'left' as const, border: `1.5px solid ${categoryId === cat.id ? '#e8621a' : 'rgba(255,255,255,0.08)'}`, background: categoryId === cat.id ? 'rgba(232,98,26,0.08)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', position: 'relative' as const }}>
                    {categoryId === cat.id && (
                      <div style={{ position: 'absolute', top: 8, right: 8, width: 18, height: 18, background: '#e8621a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 800 }}>✓</div>
                    )}
                    <div style={{ fontSize: 26, marginBottom: 8 }}>{cat.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: categoryId === cat.id ? '#e8eaf0' : 'rgba(232,234,240,0.65)', marginBottom: 4 }}>{cat.name}</div>
                    <div style={{ fontSize: 11, color: 'rgba(232,234,240,0.35)', lineHeight: 1.4 }}>{cat.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 1: Detajet ───────────────── */}
          {step === 1 && (
            <div style={{ animation: 'slideIn 0.3s ease' }}>
              {selectedCat && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'rgba(232,98,26,0.07)', border: '1px solid rgba(232,98,26,0.2)', borderRadius: 12, marginBottom: 24 }}>
                  <span style={{ fontSize: 22 }}>{selectedCat.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{selectedCat.name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(232,234,240,0.4)' }}>{selectedCat.desc}</div>
                  </div>
                </div>
              )}
              <Field label="Titulli i projektit" required>
                <input value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="psh. Rregullim i plotë banjoje 8m²"
                  onFocus={() => setFocused('title')} onBlur={() => setFocused(null)}
                  style={inputCss(focused === 'title')} />
              </Field>
              <Field label="Përshkrimi i detajuar" required>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={5}
                  placeholder="Përshkruani çfarë dëshironi të bëhet. Sa më shumë detaje, aq oferta më të sakta..."
                  onFocus={() => setFocused('desc')} onBlur={() => setFocused(null)}
                  style={{ ...inputCss(focused === 'desc'), resize: 'vertical' as const, minHeight: 120 }} />
                <div style={{ fontSize: 11, color: description.length < 20 ? 'rgba(232,234,240,0.3)' : '#22d3a5', marginTop: 5, textAlign: 'right' as const }}>{description.length} karaktere</div>
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Qyteti" required>
                  <select value={city} onChange={e => setCity(e.target.value)}
                    onFocus={() => setFocused('city')} onBlur={() => setFocused(null)}
                    style={{ ...inputCss(focused === 'city'), appearance: 'none' as const, cursor: 'pointer' }}>
                    <option value="">Zgjedh qytetin...</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Sipërfaqja (m²)">
                  <input type="number" value={areaSqm} onChange={e => setAreaSqm(e.target.value)}
                    placeholder="psh. 15" min="1"
                    onFocus={() => setFocused('area')} onBlur={() => setFocused(null)}
                    style={inputCss(focused === 'area')} />
                </Field>
              </div>
            </div>
          )}

          {/* ── STEP 2: Buxheti ──────────────── */}
          {step === 2 && (
            <div style={{ animation: 'slideIn 0.3s ease' }}>
              <div style={{ marginBottom: 28, padding: '16px 18px', background: 'rgba(96,165,250,0.07)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: 14 }}>
                <div style={{ fontWeight: 700, color: '#93c5fd', marginBottom: 4 }}>💡 Këshillë</div>
                <p style={{ fontSize: 13, color: 'rgba(232,234,240,0.5)', lineHeight: 1.65 }}>Vendosja e buxhetit ndihmon kompanitë të dërgojnë oferta realiste. Nëse jeni fleksibël, mund ta lini bosh.</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <Field label="Buxheti minimal (€)">
                  <input type="number" value={budgetMin} onChange={e => setBudgetMin(e.target.value)}
                    placeholder="psh. 500" min="0"
                    onFocus={() => setFocused('bmin')} onBlur={() => setFocused(null)}
                    style={inputCss(focused === 'bmin')} />
                </Field>
                <Field label="Buxheti maksimal (€)">
                  <input type="number" value={budgetMax} onChange={e => setBudgetMax(e.target.value)}
                    placeholder="psh. 3000" min="0"
                    onFocus={() => setFocused('bmax')} onBlur={() => setFocused(null)}
                    style={inputCss(focused === 'bmax')} />
                </Field>
              </div>
              <Field label="Kush mund të ofertojë">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                  {([
                    { val: 'both',    icon: '🤝', label: 'Të dyja',  desc: 'Kompani & punëtorë' },
                    { val: 'company', icon: '🏢', label: 'Kompani',  desc: 'Vetëm kompani' },
                    { val: 'worker',  icon: '👷', label: 'Punëtorë', desc: 'Vetëm profesionistë' },
                  ] as const).map(opt => (
                    <button key={opt.val} type="button" onClick={() => setProviderType(opt.val)}
                      style={{ padding: '14px 10px', borderRadius: 12, textAlign: 'center' as const, border: `1.5px solid ${providerType === opt.val ? '#e8621a' : 'rgba(255,255,255,0.08)'}`, background: providerType === opt.val ? 'rgba(232,98,26,0.08)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                      <div style={{ fontSize: 22, marginBottom: 6 }}>{opt.icon}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: providerType === opt.val ? '#e8eaf0' : 'rgba(232,234,240,0.5)' }}>{opt.label}</div>
                      <div style={{ fontSize: 11, color: 'rgba(232,234,240,0.3)', marginTop: 3 }}>{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {/* ── STEP 3: Konfirmo ─────────────── */}
          {step === 3 && (
            <div style={{ animation: 'slideIn 0.3s ease' }}>
              <div style={{ padding: '22px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, marginBottom: 20 }}>
                <h3 style={{ fontFamily: "'Fraunces',serif", fontWeight: 800, fontSize: '1.1rem', marginBottom: 20 }}>Përmbledhja e aplikimit</h3>
                {[
                  { label: 'Kategoria',  val: selectedCat ? `${selectedCat.icon} ${selectedCat.name}` : '—' },
                  { label: 'Titulli',    val: title },
                  { label: 'Qyteti',     val: city },
                  { label: 'Sipërfaqja', val: areaSqm ? `${areaSqm} m²` : 'Nuk është vendosur' },
                  { label: 'Buxheti',    val: budgetMin || budgetMax ? `€${budgetMin || '0'} – €${budgetMax || '∞'}` : 'Fleksibël' },
                  { label: 'Ofertojnë',  val: { both: 'Kompani & Punëtorë', company: 'Vetëm kompani', worker: 'Vetëm punëtorë' }[providerType] },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', gap: 16 }}>
                    <span style={{ fontSize: 13, color: 'rgba(232,234,240,0.4)', flexShrink: 0 }}>{row.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, textAlign: 'right' as const }}>{row.val}</span>
                  </div>
                ))}
                <div style={{ marginTop: 16, padding: '14px', background: 'rgba(232,98,26,0.07)', border: '1px solid rgba(232,98,26,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 22 }}>⏱</span>
                  <div>
                    <div style={{ fontWeight: 700, color: '#e8621a', fontSize: 14, marginBottom: 2 }}>Afati 24 orë</div>
                    <div style={{ fontSize: 12, color: 'rgba(232,234,240,0.4)' }}>Pas postimit, kompanitë kanë 24 orë për të dërguar oferta.</div>
                  </div>
                </div>
              </div>
              <div style={{ padding: '16px 18px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(232,234,240,0.3)', textTransform: 'uppercase' as const, letterSpacing: '0.07em', marginBottom: 8 }}>Përshkrimi</div>
                <p style={{ fontSize: 14, color: 'rgba(232,234,240,0.6)', lineHeight: 1.75 }}>{description}</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', gap: 10, marginTop: 32 }}>
            {step > 0 && (
              <button onClick={() => { setError(''); setStep(s => s - 1) }}
                style={{ flex: 1, padding: '13px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(232,234,240,0.6)', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                ← Prapa
              </button>
            )}
            {step < 3 ? (
              <button onClick={handleNext}
                style={{ flex: 2, padding: '13px', borderRadius: 12, background: 'linear-gradient(135deg,#e8621a,#ff7c35)', border: 'none', color: '#fff', fontFamily: "'Fraunces',serif", fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 16px rgba(232,98,26,0.3)' }}>
                Vazhdo →
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading}
                style={{ flex: 2, padding: '13px', borderRadius: 12, background: loading ? 'rgba(232,98,26,0.5)' : 'linear-gradient(135deg,#e8621a,#ff7c35)', border: 'none', color: '#fff', fontFamily: "'Fraunces',serif", fontWeight: 800, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: loading ? 'none' : '0 4px 16px rgba(232,98,26,0.3)' }}>
                {loading
                  ? <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Duke postuar...</>
                  : '🚀 Posto Aplikimin'
                }
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}