import Link from 'next/link'

export default function PricingPage() {
  const plans = [
    {
      name: 'Falas', price: '0', period: '/muaj',
      color: 'rgba(232,234,240,0.5)', bg: 'rgba(255,255,255,0.03)',
      border: 'rgba(255,255,255,0.09)', badge: null,
      cta: 'Fillo falas', ctaHref: '/register',
      features: [
        { text: '3 aplikime në muaj',        ok: true  },
        { text: '5 oferta për aplikim',       ok: true  },
        { text: 'Chat bazik',                 ok: true  },
        { text: 'Profil standard',            ok: true  },
        { text: 'Aplikime të pakufizuara',    ok: false },
        { text: 'Badge i verifikuar',         ok: false },
        { text: 'Prioritet në listë',         ok: false },
        { text: 'Analitikë e avancuar',       ok: false },
        { text: 'Mbështetje prioritare',      ok: false },
      ],
    },
    {
      name: 'Premium', price: '19', period: '/muaj',
      color: '#e8621a', bg: 'rgba(232,98,26,0.07)',
      border: 'rgba(232,98,26,0.35)', badge: '⭐ Më i popullarit',
      cta: 'Fillo 7 ditë falas', ctaHref: '/register?plan=premium',
      features: [
        { text: 'Aplikime të pakufizuara',    ok: true },
        { text: 'Oferta të pakufizuara',       ok: true },
        { text: 'Chat me foto & dokumente',    ok: true },
        { text: 'Profil i avancuar',           ok: true },
        { text: 'Badge i verifikuar 💎',       ok: true },
        { text: 'Prioritet në listë',          ok: true },
        { text: 'Analitikë e avancuar',        ok: true },
        { text: 'Mbështetje prioritare 24/7',  ok: true },
        { text: 'Eksport raporte CSV',         ok: true },
      ],
    },
    {
      name: 'Biznes', price: '49', period: '/muaj',
      color: '#a78bfa', bg: 'rgba(167,139,250,0.06)',
      border: 'rgba(167,139,250,0.25)', badge: null,
      cta: 'Na kontaktoni', ctaHref: 'mailto:hello@ndreqeshpin.com',
      features: [
        { text: 'Gjithçka nga Premium',        ok: true },
        { text: 'Deri 5 llogari punonjësish',  ok: true },
        { text: 'Dashboard i dedikuar',        ok: true },
        { text: 'API access',                  ok: true },
        { text: 'Integrim me sisteme ERP',     ok: true },
        { text: 'SLA 99.9% uptime',            ok: true },
        { text: 'Onboarding i dedikuar',       ok: true },
        { text: 'Fatura mujore/vjetore',       ok: true },
        { text: 'Menaxher llogarie personal',  ok: true },
      ],
    },
  ]

  const faq = [
    { q: 'A mund ta ndryshoj planin pas regjistrimit?', a: 'Po, mund ta upgrade-osh ose downgrade-osh planin në çdo kohë nga cilësimet e llogarisë.' },
    { q: 'Si funksionon periudha 7 ditë falas?', a: 'Pas regjistrimit me planin Premium, ke 7 ditë falas pa nevojë për kartë krediti. Pas kësaj periudhe, llogaria kthehet automatikisht në planin Falas.' },
    { q: 'A ka kontratë afatgjatë?', a: 'Jo. Mund të anulosh abonimin në çdo kohë pa penalizim. Paguan vetëm për muajin aktual.' },
    { q: 'Çfarë ndodh me aplikimet nëse downgrade-oj?', a: 'Aplikimet ekzistuese mbeten aktive. Vetëm aplikimet e reja do të kufizohen sipas planit të ri.' },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900;1,9..144,400&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.4} }
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.08); border-radius:4px; }
        .plan-card:hover { transform: translateY(-4px); }
        .cta-btn:hover   { opacity:.88; transform:translateY(-1px); }
        .faq-item:hover  { border-color:rgba(255,255,255,0.12) !important; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#080b12', color: '#e8eaf0', fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>

        {/* Navbar */}
        <nav style={{ height: 60, borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', position: 'sticky', top: 0, background: 'rgba(8,11,18,0.9)', backdropFilter: 'blur(12px)', zIndex: 100 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#e8621a,#ff7c35)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Fraunces',serif", fontWeight: 900, color: '#fff', fontSize: 16, boxShadow: '0 4px 12px rgba(232,98,26,0.3)' }}>N</div>
            <span style={{ fontFamily: "'Fraunces',serif", fontWeight: 900, fontSize: 16, letterSpacing: '-0.02em' }}>Ndreqe <span style={{ color: '#e8621a' }}>Shpin</span></span>
          </Link>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/login" style={{ padding: '8px 18px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(232,234,240,0.65)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Kyçu</Link>
            <Link href="/register" style={{ padding: '8px 18px', borderRadius: 9, background: '#e8621a', color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 12px rgba(232,98,26,0.3)' }}>Regjistrohu falas</Link>
          </div>
        </nav>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 24px 80px' }}>

          {/* Hero */}
          <div style={{ textAlign: 'center', marginBottom: 64, animation: 'fadeUp 0.5s ease' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 700, color: '#e8621a', background: 'rgba(232,98,26,0.1)', border: '1px solid rgba(232,98,26,0.25)', borderRadius: 100, padding: '5px 16px', marginBottom: 24, letterSpacing: '0.06em' }}>
              💎 Planet e çmimeve
            </div>
            <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 18, lineHeight: 1.1 }}>
              Zgjedh planin e duhur<br />
              <span style={{ color: '#e8621a', fontStyle: 'italic' }}>për biznesin tënd.</span>
            </h1>
            <p style={{ fontSize: 16, color: 'rgba(232,234,240,0.5)', lineHeight: 1.75, maxWidth: 500, margin: '0 auto' }}>
              Fillo falas dhe upgrade-o kur të duash. Pa kontratë, pa surpriza.
            </p>
          </div>

          {/* Plans */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 80 }}>
            {plans.map((plan, i) => (
              <div key={plan.name} className="plan-card"
                style={{ padding: '32px 28px', background: plan.bg, border: `1.5px solid ${plan.border}`, borderRadius: 22, position: 'relative' as const, display: 'flex', flexDirection: 'column', transition: 'all 0.25s', animation: `fadeUp 0.5s ease ${i * 0.1}s both`, boxShadow: i === 1 ? `0 16px 48px rgba(232,98,26,0.12)` : 'none' }}>

                {plan.badge && (
                  <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#e8621a,#ff7c35)', color: '#fff', fontSize: 11, fontWeight: 800, padding: '4px 18px', borderRadius: 100, whiteSpace: 'nowrap' as const, boxShadow: '0 4px 16px rgba(232,98,26,0.4)', letterSpacing: '0.04em' }}>
                    {plan.badge}
                  </div>
                )}

                <div style={{ marginBottom: 28 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: plan.color, marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>{plan.name}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontFamily: "'Fraunces',serif", fontSize: '3rem', fontWeight: 900, color: '#e8eaf0', lineHeight: 1 }}>€{plan.price}</span>
                    <span style={{ fontSize: 14, color: 'rgba(232,234,240,0.4)' }}>{plan.period}</span>
                  </div>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: f.ok ? `${plan.color === 'rgba(232,234,240,0.5)' ? '#22d3a5' : plan.color}20` : 'rgba(255,255,255,0.05)', border: `1px solid ${f.ok ? (plan.color === 'rgba(232,234,240,0.5)' ? '#22d3a5' : plan.color) + '40' : 'rgba(255,255,255,0.08)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 10, color: f.ok ? (plan.color === 'rgba(232,234,240,0.5)' ? '#22d3a5' : plan.color) : 'rgba(232,234,240,0.2)' }}>{f.ok ? '✓' : '×'}</span>
                      </div>
                      <span style={{ fontSize: 13, color: f.ok ? 'rgba(232,234,240,0.8)' : 'rgba(232,234,240,0.3)', fontWeight: f.ok ? 500 : 400 }}>{f.text}</span>
                    </div>
                  ))}
                </div>

                <Link href={plan.ctaHref} className="cta-btn"
                  style={{ display: 'block', width: '100%', padding: '13px', borderRadius: 13, background: i === 1 ? 'linear-gradient(135deg,#e8621a,#ff7c35)' : i === 2 ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.07)', border: i === 2 ? '1px solid rgba(167,139,250,0.3)' : 'none', color: '#fff', fontFamily: "'Fraunces',serif", fontWeight: 800, fontSize: '0.95rem', textDecoration: 'none', textAlign: 'center' as const, cursor: 'pointer', transition: 'all 0.2s', boxShadow: i === 1 ? '0 4px 20px rgba(232,98,26,0.3)' : 'none' }}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* Feature comparison note */}
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 100 }}>
              <span style={{ fontSize: 18 }}>🔒</span>
              <span style={{ fontSize: 13, color: 'rgba(232,234,240,0.55)' }}>Pagesat bëhen nëpërmjet <strong style={{ color: '#e8eaf0' }}>Stripe</strong> — SSL i enkriptuar, 100% i sigurt</span>
            </div>
          </div>

          {/* FAQ */}
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.03em', textAlign: 'center', marginBottom: 36 }}>
              Pyetje të <span style={{ color: '#e8621a', fontStyle: 'italic' }}>shpeshta</span>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {faq.map((item, i) => (
                <div key={i} className="faq-item"
                  style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, transition: 'border-color 0.2s', animation: `fadeUp 0.4s ease ${i * 0.07}s both` }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: '#e8eaf0' }}>{item.q}</div>
                  <p style={{ fontSize: 13, color: 'rgba(232,234,240,0.5)', lineHeight: 1.7 }}>{item.a}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: "'Fraunces',serif", fontWeight: 700, fontSize: 14 }}>Ndreqe <span style={{ color: '#e8621a' }}>Shpin</span></span>
          <span style={{ fontSize: 12, color: 'rgba(232,234,240,0.3)' }}>© 2026 · Të gjitha të drejtat e rezervuara</span>
          <Link href="/" style={{ fontSize: 12, color: 'rgba(232,234,240,0.4)', textDecoration: 'none' }}>← Kthehu në kryefaqe</Link>
        </div>
      </div>
    </>
  )
}