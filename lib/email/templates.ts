// ─────────────────────────────────────────────
//  lib/email/templates.ts
//  HTML email templates for NdreqeShpin
// ─────────────────────────────────────────────

const BASE_STYLE = `
  font-family: 'Georgia', serif;
  background: #080b12;
  margin: 0; padding: 0;
`

const WRAPPER = (content: string) => `
<!DOCTYPE html>
<html lang="sq">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NdreqeShpin</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { background:#080b12; font-family:'DM Sans',Arial,sans-serif; color:#e8eaf0; }
    .wrapper { max-width:600px; margin:0 auto; background:#080b12; }
    .header  { background:linear-gradient(135deg,#0d1117,#111827); border-bottom:1px solid rgba(255,255,255,0.08); padding:28px 40px; }
    .logo    { font-family:Georgia,serif; font-size:22px; font-weight:900; letter-spacing:-0.03em; color:#e8eaf0; text-decoration:none; }
    .logo span{ color:#e8621a; }
    .body    { padding:44px 40px; }
    .footer  { background:#0d1117; border-top:1px solid rgba(255,255,255,0.07); padding:28px 40px; text-align:center; }
    .footer p{ font-size:12px; color:rgba(232,234,240,0.3); line-height:1.8; }
    .footer a{ color:rgba(232,234,240,0.4); text-decoration:none; }
    .btn     { display:inline-block; padding:14px 32px; border-radius:14px; background:linear-gradient(135deg,#e8621a,#ff7c35); color:#fff !important; font-family:Georgia,serif; font-size:16px; font-weight:700; text-decoration:none; letter-spacing:-0.01em; box-shadow:0 4px 20px rgba(232,98,26,0.35); }
    .btn-teal{ background:linear-gradient(135deg,#22d3a5,#10b981) !important; box-shadow:0 4px 20px rgba(34,211,165,0.3) !important; }
    .card    { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:24px; margin:20px 0; }
    .stat-row{ display:flex; gap:0; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:14px; overflow:hidden; margin:24px 0; }
    .stat    { flex:1; padding:20px; text-align:center; border-right:1px solid rgba(255,255,255,0.08); }
    .stat:last-child{ border-right:none; }
    .stat-num{ font-family:Georgia,serif; font-size:26px; font-weight:900; color:#e8621a; letter-spacing:-0.03em; }
    .stat-lbl{ font-size:11px; color:rgba(232,234,240,0.4); margin-top:4px; text-transform:uppercase; letter-spacing:0.06em; }
    h1 { font-family:Georgia,serif; font-size:28px; font-weight:900; letter-spacing:-0.03em; margin-bottom:12px; line-height:1.1; }
    h1 em { font-style:italic; color:#e8621a; }
    p  { font-size:15px; color:rgba(232,234,240,0.7); line-height:1.8; margin-bottom:16px; }
    .divider{ height:1px; background:rgba(255,255,255,0.07); margin:28px 0; }
    .tag { display:inline-block; padding:3px 12px; border-radius:7px; font-size:12px; font-weight:700; }
    .tag-green { background:rgba(34,211,165,0.1); color:#22d3a5; border:1px solid rgba(34,211,165,0.25); }
    .tag-orange{ background:rgba(232,98,26,0.1);  color:#e8621a; border:1px solid rgba(232,98,26,0.25); }
    .tag-blue  { background:rgba(96,165,250,0.1);  color:#60a5fa; border:1px solid rgba(96,165,250,0.25); }
    @media(max-width:600px){
      .header,.body,.footer{ padding:24px 20px; }
      .stat-row{ flex-direction:column; }
      .stat{ border-right:none; border-bottom:1px solid rgba(255,255,255,0.08); }
      .stat:last-child{ border-bottom:none; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <a href="https://ndreqeshpin.com" class="logo">Ndreqe<span>Shpin</span></a>
    </div>
    ${content}
    <div class="footer">
      <p>
        © 2025 NdreqeShpin · Kosovë 🇽🇰<br/>
        <a href="https://ndreqeshpin.com/settings">Çaktivizo njoftimet</a> · 
        <a href="https://ndreqeshpin.com/privacy">Politika e privatësisë</a>
      </p>
    </div>
  </div>
</body>
</html>
`

// ── 1. WELCOME EMAIL ─────────────────────────────────────────────
export function welcomeEmail({ name, role }: { name: string; role: string }) {
  const roleLabel = { client:'Klient', company:'Kompani', worker:'Punëtor' }[role] || role
  const roleEmoji = { client:'🏠', company:'🏢', worker:'🔧' }[role] || '👤'
  const roleMsg   = {
    client:  'Tani mund të postosh projektin tënd dhe të marrësh oferta nga profesionistë të verifikuar brenda orëve.',
    company: 'Plotëso profilin e kompanisë dhe fillo të ofertosh për projekte tani. Mos harro të ngarkosh dokumentet për verifikim.',
    worker:  'Shto aftësitë dhe eksperiencën tënde në profil, pastaj fillo të aplikosh për projekte afër teje.',
  }[role] || ''

  return {
    subject: `Mirë se erdhe në NdreqeShpin, ${name}! 🎉`,
    html: WRAPPER(`
      <div class="body">
        <div style="text-align:center;margin-bottom:32px">
          <div style="font-size:52px;margin-bottom:16px">${roleEmoji}</div>
          <h1>Mirë se erdhe,<br/><em>${name}</em>!</h1>
          <span class="tag tag-orange">${roleLabel}</span>
        </div>

        <p>Llogaria jote u krijua me sukses. ${roleMsg}</p>

        <div class="card">
          <p style="font-size:13px;color:rgba(232,234,240,0.5);margin-bottom:16px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em">Hapat e ardhshëm</p>
          ${['Plotëso profilin tënd', 'Ngarko foto profili', role==='company'?'Dërgo dokumentet për verifikim':'Shto aftësitë dhe eksperiencën', role==='client'?'Posto projektin e parë':'Fillo të ofertosh'].map((s,i) => `
            <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
              <div style="width:24px;height:24px;border-radius:7px;background:rgba(232,98,26,0.12);color:#e8621a;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0">0${i+1}</div>
              <span style="font-size:14px">${s}</span>
            </div>
          `).join('')}
        </div>

        <div style="text-align:center;margin-top:32px">
          <a href="https://ndreqeshpin.com/${role}/dashboard" class="btn">Shko tek Dashboard →</a>
        </div>
      </div>
    `)
  }
}

// ── 2. NEW OFFER EMAIL (to client) ───────────────────────────────
export function newOfferEmail({ clientName, senderName, appTitle, price, durationDays, description, applicationId }: {
  clientName: string; senderName: string; appTitle: string
  price: number; durationDays: number; description?: string; applicationId: string
}) {
  return {
    subject: `💼 Ofertë e re për "${appTitle}" — €${price.toLocaleString()}`,
    html: WRAPPER(`
      <div class="body">
        <div style="margin-bottom:8px"><span class="tag tag-orange">💼 Ofertë e re</span></div>
        <h1>Ke marrë një<br/><em>ofertë të re</em>!</h1>
        <p>Personi <strong style="color:#e8eaf0">${senderName}</strong> dërgoi një ofertë për projektin tënd.</p>

        <div class="card">
          <p style="font-size:12px;color:rgba(232,234,240,0.4);margin-bottom:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em">Projekti</p>
          <p style="font-size:16px;font-weight:700;color:#e8eaf0;margin-bottom:0">${appTitle}</p>
        </div>

        <div class="stat-row">
          <div class="stat">
            <div class="stat-num">€${price.toLocaleString()}</div>
            <div class="stat-lbl">Çmimi total</div>
          </div>
          <div class="stat">
            <div class="stat-num">${durationDays}</div>
            <div class="stat-lbl">Ditë pune</div>
          </div>
        </div>

        ${description ? `
          <div class="card">
            <p style="font-size:12px;color:rgba(232,234,240,0.4);margin-bottom:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em">Përshkrimi i ofertës</p>
            <p style="margin-bottom:0">${description}</p>
          </div>
        ` : ''}

        <div class="divider"></div>
        <div style="text-align:center">
          <a href="https://ndreqeshpin.com/client/applications/${applicationId}" class="btn">Shiko & Prano Ofertën →</a>
          <p style="font-size:12px;color:rgba(232,234,240,0.35);margin-top:16px">Oferta skadon brenda 24 orëve nëse nuk pranohet.</p>
        </div>
      </div>
    `)
  }
}

// ── 3. OFFER ACCEPTED EMAIL (to company/worker) ──────────────────
export function offerAcceptedEmail({ senderName, clientName, appTitle, price, durationDays, applicationId }: {
  senderName: string; clientName: string; appTitle: string
  price: number; durationDays: number; applicationId: string
}) {
  return {
    subject: `🎉 Oferta jote u pranua! — ${appTitle}`,
    html: WRAPPER(`
      <div class="body">
        <div style="text-align:center;margin-bottom:28px">
          <div style="font-size:52px;margin-bottom:16px">🎉</div>
          <span class="tag tag-green">✓ Oferta u pranua</span>
          <h1 style="margin-top:16px">Urime,<br/><em>${senderName}</em>!</h1>
        </div>

        <p>Klienti <strong style="color:#e8eaf0">${clientName}</strong> pranoi ofertën tënde. Mund të fillosh të komunikosh direkt dhe të planifikosh projektin.</p>

        <div class="stat-row">
          <div class="stat">
            <div class="stat-num">€${price.toLocaleString()}</div>
            <div class="stat-lbl">Vlera e kontratës</div>
          </div>
          <div class="stat">
            <div class="stat-num">${durationDays}d</div>
            <div class="stat-lbl">Kohëzgjatja</div>
          </div>
        </div>

        <div class="card">
          <p style="font-size:12px;color:rgba(232,234,240,0.4);margin-bottom:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em">Projekti</p>
          <p style="font-size:16px;font-weight:700;color:#e8eaf0;margin-bottom:0">${appTitle}</p>
        </div>

        <div class="divider"></div>
        <div style="text-align:center">
          <a href="https://ndreqeshpin.com/company/messages" class="btn btn-teal">Hap Konversacionin →</a>
        </div>
      </div>
    `)
  }
}

// ── 4. COMPANY VERIFIED EMAIL ────────────────────────────────────
export function companyVerifiedEmail({ ownerName, businessName }: { ownerName: string; businessName: string }) {
  return {
    subject: `✅ ${businessName} u verifikua! Fillo të ofertosh tani.`,
    html: WRAPPER(`
      <div class="body">
        <div style="text-align:center;margin-bottom:28px">
          <div style="font-size:52px;margin-bottom:16px">✅</div>
          <span class="tag tag-green">Kompani e verifikuar</span>
          <h1 style="margin-top:16px">Komapania jote<br/><em>u verifikua</em>!</h1>
        </div>

        <p>Pershin <strong style="color:#e8eaf0">${ownerName}</strong>, komapania <strong style="color:#e8eaf0">${businessName}</strong> kaloi me sukses procesin e verifikimit dhe tani shfaqet me shenjën <span style="color:#22d3a5;font-weight:700">✓ Verified</span> tek të gjithë klientët.</p>

        <div class="card">
          <p style="font-size:13px;color:rgba(232,234,240,0.5);margin-bottom:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em">Çfarë hapet tani</p>
          ${['Oferto pa limit për çdo aplikim aktiv','Shfaqesh si kompani e verifikuar tek klientët','Merr vlerësime pas çdo projekti','Statistika të detajuara të performancës'].map(f => `
            <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
              <span style="color:#22d3a5;font-weight:800;font-size:13px">✓</span>
              <span style="font-size:14px">${f}</span>
            </div>
          `).join('')}
        </div>

        <div class="divider"></div>
        <div style="text-align:center">
          <a href="https://ndreqeshpin.com/company/applications" class="btn">Shiko Aplikimet Aktive →</a>
        </div>
      </div>
    `)
  }
}

// ── 5. NEW REVIEW EMAIL ──────────────────────────────────────────
export function newReviewEmail({ receiverName, reviewerName, rating, comment, role }: {
  receiverName: string; reviewerName: string; rating: number; comment?: string; role: string
}) {
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating)
  const ratingLabel = ['','Keq','Dobët','Mirë','Shumë mirë','Shkëlqyer'][rating] || ''
  const dashPath = `/${role}`

  return {
    subject: `⭐ Ke marrë vlerësim ${rating}/5 nga ${reviewerName}`,
    html: WRAPPER(`
      <div class="body">
        <div style="text-align:center;margin-bottom:28px">
          <div style="font-size:48px;letter-spacing:4px;margin-bottom:16px">${stars}</div>
          <span class="tag tag-blue">${rating}/5 — ${ratingLabel}</span>
          <h1 style="margin-top:16px">Ke marrë një<br/><em>vlerësim të ri</em>!</h1>
        </div>

        <p>Klienti <strong style="color:#e8eaf0">${reviewerName}</strong> të vlerësoi pas projektit të fundit.</p>

        ${comment ? `
          <div class="card" style="border-left:3px solid #fbbf24">
            <p style="font-size:12px;color:rgba(232,234,240,0.4);margin-bottom:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em">Komenti</p>
            <p style="font-style:italic;font-family:Georgia,serif;font-size:16px;color:#e8eaf0;margin-bottom:0">"${comment}"</p>
          </div>
        ` : ''}

        <div class="divider"></div>
        <div style="text-align:center">
          <a href="https://ndreqeshpin.com${dashPath}/reviews" class="btn">Shiko të gjitha vlerësimet →</a>
        </div>
      </div>
    `)
  }
}

// ── 6. NEW MESSAGE NOTIFICATION ──────────────────────────────────
export function newMessageEmail({ receiverName, senderName, preview, role }: {
  receiverName: string; senderName: string; preview: string; role: string
}) {
  return {
    subject: `💬 Mesazh i ri nga ${senderName}`,
    html: WRAPPER(`
      <div class="body">
        <div style="margin-bottom:8px"><span class="tag tag-blue">💬 Mesazh i ri</span></div>
        <h1>Ke një mesazh<br/>nga <em>${senderName}</em></h1>
        <p>Klikohu më poshtë për të lexuar dhe për t'u përgjigjur direkt nga platforma.</p>

        <div class="card" style="border-left:3px solid #60a5fa">
          <p style="font-size:12px;color:rgba(232,234,240,0.4);margin-bottom:8px">${senderName} shkroi:</p>
          <p style="font-style:italic;color:#e8eaf0;margin-bottom:0">"${preview.length > 120 ? preview.slice(0,120)+'...' : preview}"</p>
        </div>

        <div style="text-align:center;margin-top:28px">
          <a href="https://ndreqeshpin.com/${role}/messages" class="btn">Përgjigju tani →</a>
        </div>
      </div>
    `)
  }
}

// ── 7. PREMIUM ACTIVATED EMAIL ───────────────────────────────────
export function premiumActivatedEmail({ name, planType }: { name: string; planType: string }) {
  return {
    subject: `💎 Premium u aktivizua! Mirë se erdhe në NdreqeShpin Pro`,
    html: WRAPPER(`
      <div class="body">
        <div style="text-align:center;margin-bottom:28px">
          <div style="font-size:52px;margin-bottom:16px">💎</div>
          <span class="tag tag-orange">Premium ${planType === 'yearly' ? 'Vjetor' : 'Mujor'}</span>
          <h1 style="margin-top:16px">Mirë se erdhe<br/>tek <em>Premium</em>!</h1>
        </div>

        <p>Faleminderit <strong style="color:#e8eaf0">${name}</strong>! Abonimi yt Premium u aktivizua me sukses. Tani ke qasje të plotë në të gjitha funksionet.</p>

        <div class="card">
          <p style="font-size:13px;color:rgba(232,234,240,0.5);margin-bottom:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em">Çfarë ke tani</p>
          ${['Aplikime & oferta të PAKUFIZUARA','Shfaqesh si prioritar tek klientët','Dashboard dhe statistika të avancuara','Raporte CSV dhe eksporte','Mbështetje prioritare 24/7'].map(f => `
            <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
              <span style="color:#e8621a;font-weight:800;font-size:13px">✓</span>
              <span style="font-size:14px">${f}</span>
            </div>
          `).join('')}
        </div>

        <div class="divider"></div>
        <div style="text-align:center">
          <a href="https://ndreqeshpin.com/pricing" class="btn">Menaxho abonimin →</a>
        </div>
      </div>
    `)
  }
}

// ── 8. PASSWORD RESET ────────────────────────────────────────────
export function passwordResetEmail({ name, resetLink }: { name: string; resetLink: string }) {
  return {
    subject: `🔒 Rivendos fjalëkalimin tënd — NdreqeShpin`,
    html: WRAPPER(`
      <div class="body">
        <div style="text-align:center;margin-bottom:28px">
          <div style="font-size:48px;margin-bottom:16px">🔒</div>
          <h1>Rivendos<br/><em>fjalëkalimin</em></h1>
        </div>

        <p>Pershin <strong style="color:#e8eaf0">${name}</strong>, morëm një kërkesë për rivendosjen e fjalëkalimit të llogarisë sate.</p>

        <div class="card" style="text-align:center;border-color:rgba(232,98,26,0.2)">
          <p style="margin-bottom:20px">Klikoni butonin më poshtë për të vendosur fjalëkalim të ri. Lidhja skadon pas <strong style="color:#e8eaf0">1 ore</strong>.</p>
          <a href="${resetLink}" class="btn">Rivendos Fjalëkalimin →</a>
        </div>

        <div class="divider"></div>
        <p style="font-size:13px;color:rgba(232,234,240,0.4)">Nëse nuk e kërkuat këtë, injoroni këtë email. Fjalëkalimi juaj mbetet i pandryshuar.</p>
      </div>
    `)
  }
}