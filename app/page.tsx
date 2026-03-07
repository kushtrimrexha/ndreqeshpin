import Link from 'next/link'

export default function LandingPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;0,9..144,900;1,9..144,300;1,9..144,700&family=DM+Sans:wght@300;400;500;600&display=swap');
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
        :root{--bg:#080b12;--surface:rgba(255,255,255,0.03);--border:rgba(255,255,255,0.08);--text:#e8eaf0;--muted:rgba(232,234,240,0.45);--orange:#e8621a;--teal:#22d3a5;--blue:#60a5fa}
        html{scroll-behavior:smooth}
        body{background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;overflow-x:hidden}
        body::before{content:'';position:fixed;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");pointer-events:none;z-index:0;opacity:0.4}
        .nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:0 48px;height:72px;display:flex;align-items:center;justify-content:space-between;background:rgba(8,11,18,0.85);backdrop-filter:blur(20px);border-bottom:1px solid var(--border)}
        .nav-logo{font-family:'Fraunces',serif;font-size:1.4rem;font-weight:900;letter-spacing:-0.04em;text-decoration:none;color:var(--text);display:flex;align-items:center;gap:10px}
        .nav-logo span{color:var(--orange)}
        .nav-links{display:flex;align-items:center;gap:32px;list-style:none}
        .nav-links a{font-size:14px;font-weight:500;color:var(--muted);text-decoration:none;transition:color 0.2s}
        .nav-links a:hover{color:var(--text)}
        .btn-ghost{padding:9px 20px;border-radius:11px;border:1px solid var(--border);background:transparent;color:var(--muted);font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;text-decoration:none;transition:all 0.2s;display:inline-block}
        .btn-ghost:hover{border-color:rgba(255,255,255,0.18);color:var(--text);background:rgba(255,255,255,0.04)}
        .btn-primary{padding:10px 22px;border-radius:11px;background:linear-gradient(135deg,var(--orange),#ff7c35);border:none;color:#fff;font-family:'Fraunces',serif;font-size:14px;font-weight:700;cursor:pointer;text-decoration:none;box-shadow:0 4px 20px rgba(232,98,26,0.3);transition:all 0.2s;letter-spacing:-0.01em;display:inline-block}
        .btn-primary:hover{transform:translateY(-1px);box-shadow:0 8px 30px rgba(232,98,26,0.4)}
        .hero{position:relative;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:120px 24px 80px;overflow:hidden}
        .hero::after{content:'';position:absolute;top:20%;left:50%;transform:translateX(-50%);width:800px;height:500px;background:radial-gradient(ellipse at center,rgba(232,98,26,0.12) 0%,transparent 70%);pointer-events:none}
        .hero-badge{display:inline-flex;align-items:center;gap:8px;padding:6px 16px 6px 8px;border-radius:50px;border:1px solid rgba(34,211,165,0.25);background:rgba(34,211,165,0.06);font-size:12px;font-weight:600;color:var(--teal);margin-bottom:36px;letter-spacing:0.02em;position:relative;z-index:1;animation:fadeUp 0.8s ease both}
        .hero-badge-dot{width:6px;height:6px;border-radius:50%;background:var(--teal);box-shadow:0 0 8px rgba(34,211,165,0.8);animation:pulse 2s infinite}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.6;transform:scale(0.8)}}
        .hero-title{font-family:'Fraunces',serif;font-size:clamp(3.2rem,7.5vw,6.5rem);font-weight:900;letter-spacing:-0.04em;line-height:0.95;margin-bottom:28px;position:relative;z-index:1;animation:fadeUp 0.8s ease 0.1s both}
        .hero-title em{font-style:italic;color:var(--orange)}
        .hero-title .outline{-webkit-text-stroke:1.5px rgba(232,234,240,0.25);color:transparent}
        .hero-sub{font-size:clamp(1rem,2vw,1.15rem);color:var(--muted);max-width:520px;line-height:1.8;margin-bottom:44px;font-weight:400;position:relative;z-index:1;animation:fadeUp 0.8s ease 0.2s both}
        .hero-actions{display:flex;gap:12px;align-items:center;justify-content:center;flex-wrap:wrap;position:relative;z-index:1;animation:fadeUp 0.8s ease 0.3s both}
        .btn-hero{padding:16px 36px;border-radius:16px;background:linear-gradient(135deg,var(--orange),#ff7c35);border:none;color:#fff;font-family:'Fraunces',serif;font-size:1.05rem;font-weight:700;cursor:pointer;text-decoration:none;box-shadow:0 8px 32px rgba(232,98,26,0.35);transition:all 0.25s;letter-spacing:-0.02em;display:inline-flex;align-items:center;gap:8px}
        .btn-hero:hover{transform:translateY(-3px);box-shadow:0 16px 48px rgba(232,98,26,0.45)}
        .btn-hero-ghost{padding:15px 32px;border-radius:16px;border:1px solid var(--border);background:var(--surface);color:var(--text);font-family:'DM Sans',sans-serif;font-size:15px;font-weight:600;cursor:pointer;text-decoration:none;transition:all 0.2s;backdrop-filter:blur(10px);display:inline-block}
        .btn-hero-ghost:hover{border-color:rgba(255,255,255,0.2);background:rgba(255,255,255,0.06)}
        .hero-stats{display:flex;margin-top:72px;position:relative;z-index:1;animation:fadeUp 0.8s ease 0.4s both;border:1px solid var(--border);border-radius:20px;background:var(--surface);backdrop-filter:blur(20px);overflow:hidden}
        .hero-stat{padding:24px 40px;text-align:center;border-right:1px solid var(--border)}
        .hero-stat:last-child{border-right:none}
        .hero-stat-num{font-family:'Fraunces',serif;font-size:2.2rem;font-weight:900;color:var(--text);letter-spacing:-0.04em;line-height:1;margin-bottom:6px}
        .hero-stat-num span{color:var(--orange)}
        .hero-stat-label{font-size:12px;color:var(--muted);font-weight:500;letter-spacing:0.03em;text-transform:uppercase}
        .marquee-wrap{overflow:hidden;border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:18px 0;background:rgba(232,98,26,0.03);position:relative;z-index:1}
        .marquee-track{display:flex;gap:48px;animation:marquee 22s linear infinite;width:max-content}
        @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .marquee-item{display:flex;align-items:center;gap:10px;font-size:12px;font-weight:600;color:var(--muted);white-space:nowrap;letter-spacing:0.06em;text-transform:uppercase}
        .marquee-dot{width:4px;height:4px;border-radius:50%;background:var(--orange);opacity:0.5}
        .section{padding:120px 48px;max-width:1200px;margin:0 auto;position:relative;z-index:1}
        .section-label{display:inline-flex;align-items:center;gap:8px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--orange);margin-bottom:18px}
        .section-label::before{content:'';display:block;width:24px;height:1px;background:var(--orange)}
        .section-title{font-family:'Fraunces',serif;font-size:clamp(2rem,4vw,3.2rem);font-weight:900;letter-spacing:-0.04em;line-height:1;margin-bottom:18px}
        .section-title em{font-style:italic;color:var(--orange)}
        .section-sub{font-size:15px;color:var(--muted);line-height:1.8;max-width:480px;margin-bottom:56px}
        .steps{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;background:var(--border);border-radius:24px;overflow:hidden}
        .step{background:var(--bg);padding:48px 36px;position:relative;transition:background 0.3s}
        .step:hover{background:rgba(255,255,255,0.02)}
        .step-num{font-family:'Fraunces',serif;font-size:5rem;font-weight:900;color:rgba(255,255,255,0.04);letter-spacing:-0.05em;line-height:1;position:absolute;top:20px;right:28px}
        .step-icon{width:52px;height:52px;border-radius:16px;background:rgba(232,98,26,0.1);border:1px solid rgba(232,98,26,0.2);display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:22px}
        .step h3{font-family:'Fraunces',serif;font-size:1.35rem;font-weight:800;letter-spacing:-0.03em;margin-bottom:12px}
        .step p{font-size:14px;color:var(--muted);line-height:1.8}
        .features-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
        .feature-card{padding:34px;border-radius:20px;border:1px solid var(--border);background:var(--surface);transition:all 0.3s;position:relative;overflow:hidden}
        .feature-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(232,98,26,0.5),transparent);opacity:0;transition:opacity 0.3s}
        .feature-card:hover{border-color:rgba(232,98,26,0.2);background:rgba(232,98,26,0.03);transform:translateY(-4px)}
        .feature-card:hover::before{opacity:1}
        .feature-card.large{grid-column:span 2;display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center}
        .feature-icon{width:52px;height:52px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:20px}
        .feature-card h3{font-family:'Fraunces',serif;font-size:1.25rem;font-weight:800;letter-spacing:-0.03em;margin-bottom:10px}
        .feature-card p{font-size:14px;color:var(--muted);line-height:1.8}
        .feature-tags{display:flex;gap:6px;flex-wrap:wrap;margin-top:16px}
        .feature-tag{padding:3px 11px;border-radius:6px;font-size:11px;font-weight:700;letter-spacing:0.02em;border:1px solid}
        .roles-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
        .role-card{padding:40px 32px;border-radius:22px;border:1px solid var(--border);background:var(--surface);text-align:center;position:relative;overflow:hidden;transition:all 0.35s}
        .role-card:hover{transform:translateY(-8px);border-color:rgba(255,255,255,0.15)}
        .role-card.featured{border-color:rgba(232,98,26,0.3);background:rgba(232,98,26,0.04)}
        .role-card.featured::after{content:'POPULAR';position:absolute;top:18px;right:18px;font-size:9px;font-weight:800;letter-spacing:0.1em;color:var(--orange);background:rgba(232,98,26,0.15);border:1px solid rgba(232,98,26,0.3);border-radius:6px;padding:3px 8px}
        .role-emoji{font-size:2.8rem;margin-bottom:18px;display:block}
        .role-card h3{font-family:'Fraunces',serif;font-size:1.4rem;font-weight:900;letter-spacing:-0.03em;margin-bottom:10px}
        .role-card p{font-size:13px;color:var(--muted);line-height:1.8;margin-bottom:24px}
        .role-features{list-style:none;text-align:left;display:flex;flex-direction:column;gap:9px;margin-bottom:28px}
        .role-features li{display:flex;align-items:center;gap:9px;font-size:13px;color:var(--muted);font-weight:500}
        .role-features li::before{content:'✓';width:17px;height:17px;border-radius:5px;background:rgba(34,211,165,0.12);color:var(--teal);font-size:9px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .role-btn{display:block;width:100%;padding:12px;border-radius:12px;text-decoration:none;font-family:'Fraunces',serif;font-weight:700;font-size:0.9rem;letter-spacing:-0.01em;transition:all 0.2s;text-align:center}
        .testimonials{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
        .testimonial{padding:30px;border-radius:20px;border:1px solid var(--border);background:var(--surface);transition:all 0.3s}
        .testimonial:hover{border-color:rgba(255,255,255,0.14);transform:translateY(-4px)}
        .testimonial-stars{display:flex;gap:2px;margin-bottom:14px}
        .testimonial-stars span{color:#fbbf24;font-size:13px}
        .testimonial-text{font-size:14px;color:var(--text);line-height:1.85;margin-bottom:20px;font-style:italic;font-family:'Fraunces',serif;font-weight:300}
        .testimonial-author{display:flex;align-items:center;gap:11px}
        .testimonial-avatar{width:38px;height:38px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;color:#fff;flex-shrink:0}
        .testimonial-name{font-weight:700;font-size:13px;margin-bottom:2px}
        .testimonial-role{font-size:11px;color:var(--muted)}
        .pricing-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;max-width:780px;margin:0 auto}
        .pricing-card{padding:40px 36px;border-radius:22px;border:1px solid var(--border);background:var(--surface);position:relative;transition:all 0.3s}
        .pricing-card.pro{border-color:rgba(232,98,26,0.35);background:rgba(232,98,26,0.04)}
        .pricing-card.pro::before{content:'💎 RECOMMENDED';position:absolute;top:-12px;left:50%;transform:translateX(-50%);font-size:10px;font-weight:800;letter-spacing:0.1em;color:var(--orange);background:var(--bg);border:1px solid rgba(232,98,26,0.3);border-radius:50px;padding:4px 16px;white-space:nowrap}
        .pricing-name{font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--muted);margin-bottom:16px}
        .pricing-price{font-family:'Fraunces',serif;font-size:3.8rem;font-weight:900;letter-spacing:-0.05em;line-height:1;margin-bottom:6px}
        .pricing-price sup{font-size:1.6rem;vertical-align:super;font-weight:700}
        .pricing-period{font-size:13px;color:var(--muted);margin-bottom:32px}
        .pricing-features{list-style:none;display:flex;flex-direction:column;gap:12px;margin-bottom:32px}
        .pricing-features li{display:flex;align-items:center;gap:10px;font-size:13px;color:var(--muted)}
        .pricing-features li.active{color:var(--text)}
        .check{color:var(--teal);font-weight:800}
        .cross{color:rgba(232,234,240,0.18)}
        .cta-banner{margin:0 48px 120px;border-radius:32px;padding:80px;background:linear-gradient(135deg,rgba(232,98,26,0.12) 0%,rgba(232,98,26,0.04) 50%,rgba(34,211,165,0.06) 100%);border:1px solid rgba(232,98,26,0.2);text-align:center;position:relative;overflow:hidden;z-index:1}
        .cta-banner::before{content:'';position:absolute;top:-100px;left:50%;transform:translateX(-50%);width:600px;height:400px;background:radial-gradient(ellipse,rgba(232,98,26,0.15),transparent 70%);pointer-events:none}
        .cta-banner h2{font-family:'Fraunces',serif;font-size:clamp(2.2rem,5vw,4rem);font-weight:900;letter-spacing:-0.04em;line-height:1;margin-bottom:18px;position:relative;z-index:1}
        .cta-banner h2 em{font-style:italic;color:var(--orange)}
        .cta-banner p{font-size:16px;color:var(--muted);max-width:440px;margin:0 auto 36px;line-height:1.75;position:relative;z-index:1}
        .footer{border-top:1px solid var(--border);padding:48px;display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:48px;position:relative;z-index:1}
        .footer-logo{font-family:'Fraunces',serif;font-size:1.3rem;font-weight:900;letter-spacing:-0.04em;margin-bottom:12px;color:var(--text)}
        .footer-logo span{color:var(--orange)}
        .footer-desc{font-size:13px;color:var(--muted);line-height:1.8;max-width:240px}
        .footer-col h4{font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted);margin-bottom:16px}
        .footer-col a{display:block;font-size:13px;color:rgba(232,234,240,0.45);text-decoration:none;margin-bottom:9px;transition:color 0.2s}
        .footer-col a:hover{color:var(--text)}
        .footer-bottom{border-top:1px solid var(--border);padding:22px 48px;display:flex;justify-content:space-between;align-items:center;font-size:13px;color:rgba(232,234,240,0.28);position:relative;z-index:1}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @media(max-width:768px){
          .nav{padding:0 20px}
          .nav-links{display:none}
          .section{padding:72px 20px}
          .steps{grid-template-columns:1fr}
          .features-grid{grid-template-columns:1fr}
          .feature-card.large{grid-column:span 1;grid-template-columns:1fr}
          .roles-grid{grid-template-columns:1fr}
          .testimonials{grid-template-columns:1fr}
          .pricing-grid{grid-template-columns:1fr}
          .hero-stats{flex-direction:column}
          .hero-stat{border-right:none;border-bottom:1px solid var(--border)}
          .cta-banner{margin:0 20px 72px;padding:44px 28px}
          .footer{grid-template-columns:1fr 1fr;padding:40px 20px;gap:32px}
          .footer-bottom{flex-direction:column;gap:8px;padding:20px;text-align:center}
        }
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <a href="/" className="nav-logo">Ndreqe<span>Shpin</span></a>
        <ul className="nav-links">
          <li><a href="#si-funksionon">Si funksionon</a></li>
          <li><a href="#karakteristikat">Karakteristikat</a></li>
          <li><a href="#cmimi">Çmimi</a></li>
        </ul>
        <div style={{ display:'flex', gap:10 }}>
          <Link href="/login"    className="btn-ghost">Hyr</Link>
          <Link href="/register" className="btn-primary">Fillo falas →</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-badge">
          <div className="hero-badge-dot" />
          Platforma #1 për renovime shtëpiake në Kosovë
        </div>
        <h1 className="hero-title">
          Gjej <em>profesionistë</em><br/>
          <span className="outline">të besueshëm</span><br/>
          për shtëpinë tënde
        </h1>
        <p className="hero-sub">
          Posto projektin tënd — kompani dhe punëtorë të verifikuar dërgojnë oferta brenda orëve. Ti zgjedh. Ti vendos.
        </p>
        <div className="hero-actions">
          <Link href="/register" className="btn-hero">Fillo tani — falas →</Link>
          <a href="#si-funksionon" className="btn-hero-ghost">Shih si funksionon</a>
        </div>
        <div className="hero-stats">
          {[
            { num:'2,400', suf:'+', label:'Projekte të kryera' },
            { num:'380',   suf:'+', label:'Kompani të verifikuara' },
            { num:'98',    suf:'%', label:'Klientë të kënaqur' },
            { num:'24',    suf:'h', label:'Oferta mesatarisht' },
          ].map((s,i) => (
            <div key={i} className="hero-stat">
              <div className="hero-stat-num">{s.num}<span>{s.suf}</span></div>
              <div className="hero-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee-wrap">
        <div className="marquee-track">
          {[...Array(2)].map((_,ri) =>
            ['Rinovime Tavan','Hidroizolim','Instalime Elektrike','Suvatim & Tullë','Ngrohje & Oxhak','Dyer & Dritare','Bojatisje','Keramisë & Pllaka','Çati & Kulm','Sanitari','Dysheme & Parket'].map((t,i) => (
              <div key={`${ri}-${i}`} className="marquee-item"><div className="marquee-dot" />{t}</div>
            ))
          )}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section className="section" id="si-funksionon">
        <div className="section-label">Si funksionon</div>
        <h2 className="section-title">Tre hapa drejt<br/><em>projektit perfekt</em></h2>
        <p className="section-sub">Procesi ynë është i thjeshtë, i shpejtë dhe transparent. Pa ndërmjetës, pa komisione të fshehura.</p>
        <div className="steps">
          {[
            { icon:'📋', n:'01', title:'Posto projektin',  desc:'Përshkruaj çfarë dëshiron — rinovim dhome, hidroizolim, instalime apo çdo punë tjetër. Mjafton 2 minuta.' },
            { icon:'💼', n:'02', title:'Merr oferta',      desc:'Kompani dhe punëtorë të verifikuar dërgojnë ofertat me çmim, kohëzgjatje dhe garanci. Ti krahason të gjitha.' },
            { icon:'✅', n:'03', title:'Zgjidh & Fillo',   desc:'Prano ofertën më të mirë, komuniko direkt dhe ndiq progresin e projektit hap pas hapi.' },
          ].map((s,i) => (
            <div key={i} className="step">
              <div className="step-num">{s.n}</div>
              <div className="step-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="section" id="karakteristikat" style={{ paddingTop:0 }}>
        <div className="section-label">Karakteristikat</div>
        <h2 className="section-title">Gjithçka që<br/><em>të nevojitet</em></h2>
        <p className="section-sub">Platforma e ndërtuar me kujdes për çdo palë — klientë, kompani dhe punëtorë të lirë.</p>
        <div className="features-grid">
          {/* Large card */}
          <div className="feature-card large">
            <div>
              <div className="feature-icon" style={{ background:'rgba(34,211,165,0.1)', border:'1px solid rgba(34,211,165,0.2)' }}>🛡️</div>
              <h3>Verifikim i rreptë</h3>
              <p>Çdo kompani kalon procesin tonë manual. Dokumenta biznesi, licenca dhe historiku i punëve — gjithçka kontrollohet përpara se të lejojmë ofertimin.</p>
              <div className="feature-tags">
                {['Dokumente biznesi','Licenca profesionale','Historiku i punëve','Vlerësim real'].map(t => (
                  <span key={t} className="feature-tag" style={{ color:'var(--teal)', borderColor:'rgba(34,211,165,0.25)', background:'rgba(34,211,165,0.06)', fontSize:11 }}>{t}</span>
                ))}
              </div>
            </div>
            <div style={{ background:'rgba(34,211,165,0.04)', borderRadius:18, border:'1px solid rgba(34,211,165,0.1)', padding:28, display:'flex', flexDirection:'column', gap:14 }}>
              {[{ n:'KonstrukSh sh.p.k', r:4.9, j:127 },{ n:'Blerim Krasniqi', r:4.7, j:43 },{ n:'AlbaRenov Group', r:4.8, j:89 }].map((c,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:11, padding:'13px 16px', background:'rgba(255,255,255,0.03)', borderRadius:13, border:'1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ width:38, height:38, borderRadius:11, background:'linear-gradient(135deg,#e8621a,#ff7c35)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:13, color:'#fff', flexShrink:0 }}>{c.n.slice(0,2).toUpperCase()}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:13, marginBottom:2 }}>{c.n}</div>
                    <div style={{ fontSize:11, color:'rgba(232,234,240,0.4)' }}>{c.j} projekte</div>
                  </div>
                  <div style={{ textAlign:'right' as const }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'#fbbf24' }}>★ {c.r}</div>
                    <div style={{ fontSize:10, color:'var(--teal)', fontWeight:700 }}>✓ Verified</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Small cards */}
          {[
            { icon:'💬', col:'#60a5fa', bg:'rgba(96,165,250,0.1)', br:'rgba(96,165,250,0.2)', title:'Chat në kohë reale', desc:'Komuniko direkt. Dërgo foto, specifika teknike dhe mbaj historikun në një vend.', tags:['Mesazhe të shpejta','Foto & dokumente','Historiku i plotë'] },
            { icon:'⭐', col:'#fbbf24', bg:'rgba(251,191,36,0.1)', br:'rgba(251,191,36,0.2)', title:'Vlerësime autentike', desc:'Pas çdo projekti klientët vlerësojnë. Vetëm ata që kanë paguar mund të shkruajnë.', tags:['Vlerësim 1-5 yje','Komente të detajuara','Transparencë totale'] },
            { icon:'📊', col:'#a78bfa', bg:'rgba(167,139,250,0.1)', br:'rgba(167,139,250,0.2)', title:'Dashboard i plotë', desc:'Gjurmo çdo projekt, ofertë dhe pagesë. Statistika live për kompani dhe punëtorë.', tags:['Statistika live','Historiku projekteve','Raporte'] },
            { icon:'🔔', col:'#22d3a5', bg:'rgba(34,211,165,0.1)', br:'rgba(34,211,165,0.2)', title:'Njoftime në çast', desc:'Asnjë ofertë nuk humbet. Push dhe email të mbajnë të informuar gjithmonë.', tags:['Njoftime push','Email alerts','Historiku njoftimeve'] },
          ].map((f,i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon" style={{ background:f.bg, border:`1px solid ${f.br}` }}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
              <div className="feature-tags">
                {f.tags.map(t => <span key={t} className="feature-tag" style={{ color:f.col, borderColor:`${f.col}30`, background:`${f.col}10`, fontSize:11 }}>{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ROLES */}
      <section className="section" style={{ paddingTop:0 }}>
        <div className="section-label">Për kë</div>
        <h2 className="section-title">Platforma për<br/><em>të gjithë</em></h2>
        <p className="section-sub">Qoftë klient, kompani apo punëtor — NdreqeShpin funksionon për ty.</p>
        <div className="roles-grid">
          {[
            { emoji:'🏠', title:'Klientë', sub:'Gjej profesionistin perfekt', desc:'Posto projektin tënd falas dhe merr oferta nga profesionistë të verifikuar brenda 24 orëve.', features:['Posto projekt falas','Krahaso oferta & çmime','Chat direkt me profesionistët','Vlerëso punën pas kryerjes'], btn:'Posto projektin →', btnS:{ background:'linear-gradient(135deg,#e8621a,#ff7c35)', color:'#fff', border:'none', boxShadow:'0 4px 20px rgba(232,98,26,0.3)' }, feat:true },
            { emoji:'🏢', title:'Kompani', sub:'Rrit biznesin tënd', desc:'Apliko për projekte të reja çdo ditë. Ndërtoji reputacionin online dhe rrit xhiron.', features:['Shfletoni aplikimet aktive','Dërgoni oferta profesionale','Menaxhoni projektet nga dashboard','Statistika & raporte të detajuara'], btn:'Regjistro kompaninë →', btnS:{ background:'rgba(255,255,255,0.05)', color:'var(--text)', border:'1px solid rgba(255,255,255,0.12)' }, feat:false },
            { emoji:'🔧', title:'Punëtorë', sub:'Gjej punë afër teje', desc:'Shfaq aftësitë dhe eksperiencën tënde. Merr punë të pavarura dhe ndërtoji karrierën.', features:['Profil me portfolio dhe skills','Apliko për projekte freelance','Paguhu direkt & me siguri','Vlerësime që ndërtojnë reputacion'], btn:'Krijo profilin →', btnS:{ background:'rgba(34,211,165,0.08)', color:'var(--teal)', border:'1px solid rgba(34,211,165,0.25)' }, feat:false },
          ].map((r,i) => (
            <div key={i} className={`role-card${r.feat?' featured':''}`}>
              <span className="role-emoji">{r.emoji}</span>
              <h3>{r.title}</h3>
              <p style={{ fontSize:11, color:'var(--orange)', fontWeight:700, marginBottom:8, letterSpacing:'0.05em', textTransform:'uppercase' as const }}>{r.sub}</p>
              <p>{r.desc}</p>
              <ul className="role-features">{r.features.map(f => <li key={f}>{f}</li>)}</ul>
              <Link href="/register" className="role-btn" style={r.btnS as any}>{r.btn}</Link>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section" style={{ paddingTop:0 }}>
        <div className="section-label">Vlerësimet</div>
        <h2 className="section-title">Çfarë thonë<br/><em>klientët tanë</em></h2>
        <div className="testimonials">
          {[
            { text:'"NdreqeShpin e bëri procesin shumë të lehtë. Mora 5 oferta brenda 3 orëve dhe çmimi ishte shumë më i mirë nga çfarë prisja."', name:'Arben Gashi', role:'Klient · Prishtinë', in:'AG', col:'#60a5fa' },
            { text:'"Si kompani, kemi trefishuar projektet tona që nga regjistrimi. Platforma na jep ekspozurë direkte te klientët e duhur."', name:'KonstrukSh sh.p.k', role:'Kompani Ndërtimi · Prizren', in:'KS', col:'#e8621a' },
            { text:'"Tani kam projekte konstante, paguhem me siguri dhe klientët shohin portofolin tim. Më ka ndryshuar jetën profesionale."', name:'Florim Berisha', role:'Punëtor i Pavarur · Pejë', in:'FB', col:'#22d3a5' },
          ].map((t,i) => (
            <div key={i} className="testimonial">
              <div className="testimonial-stars">{[1,2,3,4,5].map(s => <span key={s}>★</span>)}</div>
              <p className="testimonial-text">{t.text}</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar" style={{ background:`linear-gradient(135deg,${t.col},${t.col}99)` }}>{t.in}</div>
                <div><div className="testimonial-name">{t.name}</div><div className="testimonial-role">{t.role}</div></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="section" id="cmimi" style={{ paddingTop:0, textAlign:'center' as const }}>
        <div className="section-label" style={{ justifyContent:'center' }}>Çmimi</div>
        <h2 className="section-title">Transparent.<br/><em>Pa surpriza.</em></h2>
        <p className="section-sub" style={{ margin:'0 auto 56px' }}>Fillo falas. Upgrade kur të jesh gati.</p>
        <div className="pricing-grid">
          {[
            { name:'Falas', price:0, period:'gjithmonë falas', features:[
                { t:'Deri 3 aplikime / muaj',    a:true },
                { t:'Oferta të pakufizuara',      a:true },
                { t:'Chat me profesionistët',     a:true },
                { t:'Vlerëso pas projektit',      a:true },
                { t:'Aplikime prioritare',        a:false},
                { t:'Statistika të avancuara',    a:false},
              ], btn:'Fillo falas', btnS:{ background:'rgba(255,255,255,0.06)', color:'var(--text)', border:'1px solid rgba(255,255,255,0.12)' }, pro:false },
            { name:'Premium', price:9.99, period:'/ muaj · anulohet kurrë', features:[
                { t:'Aplikime të PAKUFIZUARA',    a:true },
                { t:'Shfaqen si prioritare',       a:true },
                { t:'Chat + foto & dokumente',    a:true },
                { t:'Dashboard & statistika pro', a:true },
                { t:'Raporte & eksporte CSV',     a:true },
                { t:'Mbështetje prioritare 24/7', a:true },
              ], btn:'Fillo Premium', btnS:{ background:'linear-gradient(135deg,#e8621a,#ff7c35)', color:'#fff', border:'none', boxShadow:'0 4px 20px rgba(232,98,26,0.3)' }, pro:true },
          ].map((p,i) => (
            <div key={i} className={`pricing-card${p.pro?' pro':''}`}>
              <div className="pricing-name">{p.name}</div>
              <div className="pricing-price" style={{ color:p.pro?'var(--orange)':'var(--text)' }}>
                {p.price===0 ? '0' : <><sup>€</sup>{p.price}</>}
              </div>
              <div className="pricing-period">{p.price===0 ? 'Falas' : `€${p.price}`} {p.period}</div>
              <ul className="pricing-features">
                {p.features.map((f,j) => (
                  <li key={j} className={f.a?'active':''}>
                    <span className={f.a?'check':'cross'}>{f.a?'✓':'✕'}</span>{f.t}
                  </li>
                ))}
              </ul>
              <Link href="/register" style={{ display:'block', padding:'13px', borderRadius:12, textDecoration:'none', fontFamily:'Fraunces,serif', fontWeight:700, fontSize:'0.92rem', textAlign:'center' as const, transition:'all 0.2s', ...p.btnS as any }}>{p.btn} →</Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="cta-banner">
        <h2>Gati të <em>fillosh</em>?<br/>Regjistrohu sot.</h2>
        <p>Bashkohu me mbi 2,400 projekte të kryera me sukses. Pa risk, pa kosto fillestare.</p>
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap', position:'relative', zIndex:1 }}>
          <Link href="/register" className="btn-hero">Fillo falas tani →</Link>
          <Link href="/login" className="btn-hero-ghost">Kam llogari</Link>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <div>
          <div className="footer-logo">Ndreqe<span>Shpin</span></div>
          <p className="footer-desc">Platforma nr.1 për gjetjen e profesionistëve të besuar për çdo punë shtëpiake në Kosovë.</p>
        </div>
        {[
          { title:'Platforma', links:[['Si funksionon','#si-funksionon'],['Çmimi','#cmimi'],['Karakteristikat','#karakteristikat']] },
          { title:'Llogaria',  links:[['Regjistrohu','/register'],['Hyr','/login'],['Premium','/pricing']] },
          { title:'Kompania',  links:[['Rreth nesh','#'],['Privatësia','#'],['Kushtet','#']] },
        ].map((col,i) => (
          <div key={i} className="footer-col">
            <h4>{col.title}</h4>
            {col.links.map(([l,h]) => <a key={l} href={h}>{l}</a>)}
          </div>
        ))}
      </footer>
      <div className="footer-bottom">
        <span>© 2025 NdreqeShpin. Të gjitha të drejtat e rezervuara.</span>
        <span>Bërë me ❤️ në Kosovë 🇽🇰</span>
      </div>
    </>
  )
}