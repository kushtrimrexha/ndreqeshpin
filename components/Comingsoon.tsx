'use client'

interface ComingSoonProps {
  icon:     string
  heading:  string
  subtext:  string
  color:    string
  features?: string[]
}

export default function ComingSoon({ icon, heading, subtext, color, features }: ComingSoonProps) {
  const defaultFeatures: Record<string, string[]> = {
    '💼': ['Shiko të gjitha ofertat', 'Krahaso çmimet', 'Prano ose refuzo', 'Historiku i plotë'],
    '💬': ['Chat në kohë reale', 'Dërgo foto & dokumente', 'Njoftimet e mesazheve', 'Historiku i bisedave'],
    '⭐': ['Vlerëso me yje', 'Lë komente', 'Shiko vlerësimet e marra', 'Eksporto raportet'],
    '👤': ['Edito emrin & qytetin', 'Ndrysho fjalëkalimin', 'Foto profili', 'Privatësia'],
    '🔔': ['Njoftimet e reja', 'Shëno si të lexuara', 'Filtro sipas tipit', 'Cilësimet'],
    '📋': ['Filtro sipas kategorisë', 'Kërko me tekst', 'Sorto sipas çmimit', 'Shiko detajet'],
    '📊': ['Grafikë mujore', 'Krahasim periudhash', 'Eksporto CSV', 'KPI të biznesit'],
    '🏢': ['Emri & logo', 'Përshkrimi i biznesit', 'Kategoritë e shërbimit', 'Portfolio'],
  }

  const featureList = features || defaultFeatures[icon] || ['Funksionalitet i avancuar', 'UI intuitive', 'Në ndërtim e sipër']

  return (
    <div style={{ maxWidth: 680, margin: '60px auto', textAlign: 'center', padding: '0 20px' }}>

      {/* Icon circle */}
      <div style={{
        width: 90, height: 90, borderRadius: 26,
        background: `${color}12`,
        border: `1.5px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 42, margin: '0 auto 28px',
        boxShadow: `0 0 40px ${color}15`,
      }}>
        {icon}
      </div>

      {/* Badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
        textTransform: 'uppercase' as const,
        color, background: `${color}12`,
        border: `1px solid ${color}25`,
        borderRadius: 100, padding: '4px 14px',
        marginBottom: 20,
      }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, animation: 'pulse 2s ease infinite' }} />
        Në ndërtim
      </div>

      <h1 style={{
        fontFamily: "'Fraunces',serif",
        fontSize: 'clamp(1.6rem,3vw,2.2rem)',
        fontWeight: 900, letterSpacing: '-0.03em',
        marginBottom: 14, lineHeight: 1.2,
      }}>
        {heading}
      </h1>

      <p style={{
        fontSize: 15, color: 'rgba(232,234,240,0.5)',
        lineHeight: 1.75, marginBottom: 44, maxWidth: 460, margin: '0 auto 44px',
      }}>
        {subtext}. Ky seksion është duke u zhvilluar dhe do të jetë i disponueshëm së shpejti.
      </p>

      {/* Features grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(2,1fr)',
        gap: 10, marginBottom: 44, maxWidth: 480, margin: '0 auto 44px',
      }}>
        {featureList.map((f, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '13px 16px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 12, textAlign: 'left' as const,
            animation: `fadeUp 0.4s ease ${i * 0.07}s both`,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: 'rgba(232,234,240,0.65)', fontWeight: 500 }}>{f}</span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ maxWidth: 320, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(232,234,240,0.35)', textTransform: 'uppercase' as const, letterSpacing: '0.07em' }}>Progresi i zhvillimit</span>
          <span style={{ fontSize: 11, fontWeight: 700, color }}>65%</span>
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: '65%', background: `linear-gradient(90deg,${color},${color}88)`, borderRadius: 2, transition: 'width 1.5s ease' }} />
        </div>
      </div>
    </div>
  )
}