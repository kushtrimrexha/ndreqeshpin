import Link from 'next/link'

export default function LandingPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Fraunces:ital,wght@0,700;0,900;1,300;1,400&display=swap');
        @keyframes fadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes shimmer  { 0%{background-position:200% center} 100%{background-position:-200% center} }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0f0e0c', color: '#f0ece4', fontFamily: "'DM Sans','Helvetica Neue',sans-serif", overflowX: 'hidden' }}>

        {/* ── NAVBAR ──────────────────────────── */}
        <nav style={{ height: 62, borderBottom: '1px solid rgba(240,236,228,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', position: 'sticky', top: 0, background: 'rgba(15,14,12,0.9)', backdropFilter: 'blur(12px)', zIndex: 100 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#e8621a,#ff8c4a)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Fraunces',serif", fontWeight: 900, color: '#fff', fontSize: 17, boxShadow: '0 4px 14px rgba(232,98,26,0.35)' }}>N</div>
            <span style={{ fontFamily: "'Fraunces',serif", fontWeight: 900, fontSize: 18, letterSpacing: '-0.02em' }}>
              Ndreqe <span style={{ color: '#e8621a' }}>Shpin</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/login" style={{ padding: '8px 18px', borderRadius: 9, border: '1px solid rgba(240,236,228,0.12)', color: 'rgba(240,236,228,0.7)', fontSize: 13, fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s' }}>
              Kyçu
            </Link>
            <Link href="/register" style={{ padding: '8px 18px', borderRadius: 9, background: '#e8621a', color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 12px rgba(232,98,26,0.3)' }}>
              Fillo falas →
            </Link>
          </div>
        </nav>

        {/* ── HERO ────────────────────────────── */}
        <section style={{ maxWidth: 900, margin: '0 auto', padding: '100px 24px 80px', textAlign: 'center', position: 'relative' }}>

          {/* Background glow */}
          <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 300, background: 'radial-gradient(ellipse,rgba(232,98,26,0.1) 0%,transparent 70%)', pointerEvents: 'none' }} />

          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 16px', background: 'rgba(232,98,26,0.1)', border: '1px solid rgba(232,98,26,0.25)', borderRadius: 100, fontSize: 12, fontWeight: 700, color: '#e8621a', marginBottom: 28, animation: 'fadeUp 0.5s ease' }}>
            🚀 Platforma #1 e Renovimit në Kosovë
          </div>

          <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(2.8rem,6vw,5rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.04em', marginBottom: 24, animation: 'fadeUp 0.5s ease 0.1s both' }}>
            Renovimi i shtëpisë,<br />
            <span style={{ color: '#e8621a', fontStyle: 'italic' }}>i thjeshtë si kurrë.</span>
          </h1>

          <p style={{ fontSize: 'clamp(1rem,2vw,1.2rem)', color: 'rgba(240,236,228,0.55)', lineHeight: 1.8, maxWidth: 560, margin: '0 auto 44px', animation: 'fadeUp 0.5s ease 0.2s both' }}>
            Posto projektin tënd, merr oferta nga kompanitë më të mira të Kosovës brenda <strong style={{ color: '#f0ece4' }}>24 orësh</strong>, dhe fillo renovimin me besim të plotë.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeUp 0.5s ease 0.3s both' }}>
            <Link href="/register" style={{ padding: '15px 32px', borderRadius: 13, background: '#e8621a', color: '#fff', fontFamily: "'Fraunces',serif", fontWeight: 800, fontSize: '1.05rem', textDecoration: 'none', boxShadow: '0 8px 24px rgba(232,98,26,0.35)', letterSpacing: '-0.01em', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Posto projektin tënd 🏗️
            </Link>
            <Link href="/register?role=company" style={{ padding: '15px 32px', borderRadius: 13, background: 'rgba(240,236,228,0.06)', border: '1px solid rgba(240,236,228,0.12)', color: '#f0ece4', fontWeight: 700, fontSize: '1rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Regjistro kompaninë →
            </Link>
          </div>

          {/* Social proof */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginTop: 44, animation: 'fadeUp 0.5s ease 0.4s both' }}>
            <div style={{ display: 'flex' }}>
              {['#3b82f6','#10b981','#e8621a','#a78bfa','#f59e0b'].map((c, i) => (
                <div key={i} style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg,${c},${c}cc)`, border: '2px solid #0f0e0c', marginLeft: i > 0 ? -8 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff' }}>
                  {['AK','BL','CK','DM','ER'][i]}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(240,236,228,0.5)' }}>
              <strong style={{ color: '#f0ece4' }}>500+</strong> klientë e besojnë platformën
            </div>
            <div style={{ display: 'flex', gap: 2 }}>
              {[1,2,3,4,5].map(i => <span key={i} style={{ color: '#f59e0b', fontSize: 14 }}>★</span>)}
            </div>
          </div>
        </section>

        {/* ── STATS BAR ───────────────────────── */}
        <section style={{ borderTop: '1px solid rgba(240,236,228,0.06)', borderBottom: '1px solid rgba(240,236,228,0.06)', padding: '32px 48px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0 }}>
            {[
              { val: '24h',    label: 'Koha mesatare për ofertë' },
              { val: '500+',   label: 'Kompani të verifikuara' },
              { val: '2,400+', label: 'Projekte të përfunduara' },
              { val: '98%',    label: 'Klientë të kënaqur' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '0 20px', borderRight: i < 3 ? '1px solid rgba(240,236,228,0.07)' : 'none' }}>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: '2.2rem', fontWeight: 900, color: '#e8621a', marginBottom: 6 }}>{s.val}</div>
                <div style={{ fontSize: 13, color: 'rgba(240,236,228,0.45)', lineHeight: 1.5 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ────────────────────── */}
        <section style={{ maxWidth: 900, margin: '0 auto', padding: '90px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#e8621a', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>Si funksionon</div>
            <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 900, letterSpacing: '-0.03em' }}>
              Nga ideja tek realizimi,<br />
              <span style={{ color: '#e8621a', fontStyle: 'italic' }}>në 4 hapa.</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
            {[
              { step: '01', icon: '📋', title: 'Posto projektin', desc: 'Plotëso formularin me detajet e renovimit tënd. Shto foto, vendos buxhetin dhe zgjidh kategorinë.', color: '#e8621a' },
              { step: '02', icon: '💼', title: 'Merr oferta',     desc: 'Brenda 24 orësh kompanitë e verifikuara dërgojnë ofertat e tyre me çmim, kohëzgjatje dhe përshkrim.', color: '#3b82f6' },
              { step: '03', icon: '⚖️', title: 'Krahaso & zgjidh', desc: 'Krahaso ofertat sipas çmimit, vlerësimit dhe afatit. Algoritmi ynë sugjeron ofertën më të mirë.', color: '#10b981' },
              { step: '04', icon: '🏗️', title: 'Fillo projektin', desc: 'Prano ofertën, komuniko direkt me kompaninë nëpërmjet chat dhe fillo renovimin tënd.', color: '#a78bfa' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '28px', background: 'rgba(240,236,228,0.02)', border: '1px solid rgba(240,236,228,0.07)', borderRadius: 20, display: 'flex', gap: 18, alignItems: 'flex-start' }}>
                <div style={{ width: 52, height: 52, background: `${s.color}14`, border: `1px solid ${s.color}25`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{s.icon}</div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontFamily: "'Fraunces',serif", fontSize: 11, fontWeight: 900, color: `${s.color}99`, letterSpacing: '0.05em' }}>{s.step}</span>
                    <h3 style={{ fontWeight: 800, fontSize: 16 }}>{s.title}</h3>
                  </div>
                  <p style={{ fontSize: 13, color: 'rgba(240,236,228,0.5)', lineHeight: 1.75 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CATEGORIES ──────────────────────── */}
        <section style={{ borderTop: '1px solid rgba(240,236,228,0.06)', padding: '80px 24px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#e8621a', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>Kategoritë</div>
              <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 900, letterSpacing: '-0.03em' }}>
                Çdo lloj renovimi,<br /><span style={{ color: '#e8621a', fontStyle: 'italic' }}>një platformë.</span>
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 10 }}>
              {[
                { icon: '🚿', name: 'Banjo' },
                { icon: '🍳', name: 'Kuzhinë' },
                { icon: '🎨', name: 'Ngjyrosje' },
                { icon: '🪵', name: 'Dysheme' },
                { icon: '⚡', name: 'Elektrike' },
                { icon: '🔧', name: 'Hidraulikë' },
                { icon: '🏗️', name: 'Ndërtim' },
                { icon: '🪟', name: 'Dyer & Dritare' },
                { icon: '🏠', name: 'Fasadë' },
                { icon: '🌡️', name: 'Ngrohje & Klimë' },
                { icon: '🌿', name: 'Oborr' },
                { icon: '🔨', name: 'Të tjera' },
              ].map((cat, i) => (
                <Link key={i} href="/register" style={{ padding: '18px 14px', background: 'rgba(240,236,228,0.02)', border: '1px solid rgba(240,236,228,0.07)', borderRadius: 14, textAlign: 'center', textDecoration: 'none', transition: 'all 0.2s', display: 'block' }}>
                  <div style={{ fontSize: 26, marginBottom: 8 }}>{cat.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(240,236,228,0.7)' }}>{cat.name}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ────────────────────── */}
        <section style={{ maxWidth: 900, margin: '0 auto', padding: '80px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#e8621a', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>Vlerësimet</div>
            <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 900, letterSpacing: '-0.03em' }}>
              Çfarë thonë <span style={{ color: '#e8621a', fontStyle: 'italic' }}>klientët tanë</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            {[
              { name: 'Ardita Krasniqi', city: 'Prishtinë', project: 'Banjo 8m²',      text: 'Brenda 6 orësh mora 4 oferta shumë të mira. E zgjodha kompaninë me çmim të arsyeshëm dhe punë cilësore.', stars: 5, color: '#3b82f6' },
              { name: 'Blerim Morina',   city: 'Prizren',   project: 'Ngjyrosje saloni', text: 'Sistem shumë i lehtë për t\'u përdorur. Nuk besoja se do të gjeja kompani kaq shpejt dhe me çmim kaq të mirë.', stars: 5, color: '#10b981' },
              { name: 'Cana Gashi',      city: 'Pejë',      project: 'Kuzhinë e re',    text: 'Krahaso ofertat ishte super i lehtë. Morra 3 oferta dhe zgjodha të mirën. Punët mbaruan në kohë.', stars: 5, color: '#a78bfa' },
            ].map((t, i) => (
              <div key={i} style={{ padding: '22px', background: 'rgba(240,236,228,0.02)', border: '1px solid rgba(240,236,228,0.07)', borderRadius: 18 }}>
                <div style={{ display: 'flex', gap: 3, marginBottom: 14 }}>
                  {[1,2,3,4,5].map(s => <span key={s} style={{ color: '#f59e0b', fontSize: 14 }}>★</span>)}
                </div>
                <p style={{ fontSize: 13, color: 'rgba(240,236,228,0.6)', lineHeight: 1.75, marginBottom: 18, fontStyle: 'italic' }}>
                  "{t.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg,${t.color},${t.color}cc)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff' }}>
                    {t.name.slice(0,2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: 'rgba(240,236,228,0.4)' }}>{t.city} · {t.project}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ─────────────────────────────── */}
        <section style={{ padding: '80px 24px', borderTop: '1px solid rgba(240,236,228,0.06)' }}>
          <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center', padding: '56px 48px', background: 'rgba(232,98,26,0.07)', border: '1px solid rgba(232,98,26,0.2)', borderRadius: 28, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 0%, rgba(232,98,26,0.15) 0%, transparent 60%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 16 }}>
                Gati të fillosh?
              </h2>
              <p style={{ fontSize: 15, color: 'rgba(240,236,228,0.55)', lineHeight: 1.75, marginBottom: 36, maxWidth: 420, margin: '0 auto 36px' }}>
                Regjistrohu falas dhe posto projektin tënd të parë. Kompanitë do të kontaktojnë brenda 24 orësh.
              </p>
              <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '15px 36px', borderRadius: 13, background: '#e8621a', color: '#fff', fontFamily: "'Fraunces',serif", fontWeight: 800, fontSize: '1.05rem', textDecoration: 'none', boxShadow: '0 8px 28px rgba(232,98,26,0.4)', letterSpacing: '-0.01em' }}>
                Fillo falas sot →
              </Link>
            </div>
          </div>
        </section>

        {/* ── FOOTER ──────────────────────────── */}
        <footer style={{ borderTop: '1px solid rgba(240,236,228,0.06)', padding: '32px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, background: 'linear-gradient(135deg,#e8621a,#ff8c4a)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Fraunces',serif", fontWeight: 900, color: '#fff', fontSize: 13 }}>N</div>
            <span style={{ fontFamily: "'Fraunces',serif", fontWeight: 700, fontSize: 15 }}>Ndreqe Shpin</span>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(240,236,228,0.3)' }}>© 2026 Ndreqe Shpin. Të gjitha të drejtat e rezervuara.</div>
          <div style={{ display: 'flex', gap: 16 }}>
            {['Kushtet', 'Privatësia', 'Kontakt'].map(l => (
              <a key={l} href="#" style={{ fontSize: 12, color: 'rgba(240,236,228,0.4)', textDecoration: 'none' }}>{l}</a>
            ))}
          </div>
        </footer>
      </div>
    </>
  )
}