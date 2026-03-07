'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  id: string; full_name: string; email: string; role: string
  created_at: string; package_type: string
  notification_prefs?: {
    email_offers?: boolean; email_messages?: boolean; email_reviews?: boolean
    push_offers?: boolean;  push_messages?: boolean;  push_reviews?: boolean
    weekly_digest?: boolean; marketing?: boolean
  }
}

interface Props { profile: Profile; userEmail: string }

type Tab = 'account' | 'password' | 'notifications' | 'privacy' | 'danger'

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'account',       icon: '👤', label: 'Llogaria' },
  { id: 'password',      icon: '🔒', label: 'Fjalëkalimi' },
  { id: 'notifications', icon: '🔔', label: 'Njoftimet' },
  { id: 'privacy',       icon: '🛡️',  label: 'Privatësia' },
  { id: 'danger',        icon: '⚠️',  label: 'Zona e rrezikshme' },
]

function Toast({ msg, type }: { msg: string; type: 'success'|'error' }) {
  return (
    <div style={{ position:'fixed', top:20, right:20, zIndex:700, padding:'14px 22px', borderRadius:13, fontSize:14, fontWeight:600, animation:'fadeUp 0.3s ease', boxShadow:'0 12px 40px rgba(0,0,0,0.4)', background: type==='success' ? 'rgba(34,211,165,0.1)' : 'rgba(239,68,68,0.1)', border:`1px solid ${type==='success' ? 'rgba(34,211,165,0.3)' : 'rgba(239,68,68,0.3)'}`, color: type==='success' ? '#22d3a5' : '#fca5a5' }}>
      {type==='success' ? '✓' : '⚠️'} {msg}
    </div>
  )
}

function SectionCard({ title, icon, children }: { title:string; icon:string; children:React.ReactNode }) {
  return (
    <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:'26px', marginBottom:16, animation:'fadeUp 0.4s ease' }}>
      <h3 style={{ fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:'1rem', marginBottom:22, display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ width:34, height:34, borderRadius:10, background:'rgba(232,98,26,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  )
}

function Toggle({ checked, onChange, label, desc }: { checked:boolean; onChange:(v:boolean)=>void; label:string; desc?:string }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
      <div>
        <div style={{ fontSize:14, fontWeight:600, marginBottom:desc?3:0 }}>{label}</div>
        {desc && <div style={{ fontSize:12, color:'rgba(232,234,240,0.4)' }}>{desc}</div>}
      </div>
      <button onClick={() => onChange(!checked)}
        style={{ width:46, height:26, borderRadius:13, background: checked ? '#e8621a' : 'rgba(255,255,255,0.1)', border:'none', cursor:'pointer', position:'relative' as const, transition:'all 0.25s', flexShrink:0 }}>
        <div style={{ width:20, height:20, borderRadius:'50%', background:'#fff', position:'absolute', top:3, left: checked ? 23 : 3, transition:'left 0.25s', boxShadow:'0 2px 6px rgba(0,0,0,0.3)' }} />
      </button>
    </div>
  )
}

function InputField({ label, type='text', value, onChange, placeholder, hint }: { label:string; type?:string; value:string; onChange:(v:string)=>void; placeholder?:string; hint?:string }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:'block', fontSize:11, fontWeight:700, color:'rgba(232,234,240,0.4)', textTransform:'uppercase' as const, letterSpacing:'0.07em', marginBottom:7 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ width:'100%', background: focused ? 'rgba(232,98,26,0.05)' : 'rgba(255,255,255,0.04)', border:`1px solid ${focused ? 'rgba(232,98,26,0.5)' : 'rgba(255,255,255,0.09)'}`, borderRadius:11, padding:'12px 14px', fontSize:14, color:'#e8eaf0', fontFamily:'inherit', outline:'none', transition:'all 0.2s', boxSizing:'border-box' as const }} />
      {hint && <p style={{ fontSize:11, color:'rgba(232,234,240,0.3)', marginTop:5 }}>{hint}</p>}
    </div>
  )
}

function SaveBtn({ loading, onClick, disabled, col='#e8621a', label='Ruaj ndryshimet' }: { loading:boolean; onClick:()=>void; disabled?:boolean; col?:string; label?:string }) {
  return (
    <button onClick={onClick} disabled={loading || disabled}
      style={{ padding:'11px 26px', borderRadius:12, background: loading||disabled ? 'rgba(255,255,255,0.07)' : `linear-gradient(135deg,${col},${col}cc)`, border:'none', color: loading||disabled ? 'rgba(232,234,240,0.35)' : '#fff', fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:'0.9rem', cursor: loading||disabled ? 'not-allowed' : 'pointer', transition:'all 0.2s', display:'flex', alignItems:'center', gap:8, boxShadow: loading||disabled ? 'none' : `0 4px 16px ${col}44` }}>
      {loading && <div style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid #fff', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />}
      {loading ? 'Duke ruajtur...' : label}
    </button>
  )
}

export default function SettingsClient({ profile, userEmail }: Props) {
  const router  = useRouter()
  const supabase = createClient()

  const [tab, setTab] = useState<Tab>('account')
  const [toast, setToast] = useState<{ msg:string; type:'success'|'error' } | null>(null)

  // Account
  const [currentEmail] = useState(userEmail)

  // Password
  const [curPwd,  setCurPwd]  = useState('')
  const [newPwd,  setNewPwd]  = useState('')
  const [confPwd, setConfPwd] = useState('')
  const [pwdLoad, setPwdLoad] = useState(false)

  // Email
  const [newEmail,   setNewEmail]   = useState('')
  const [emailPwd,   setEmailPwd]   = useState('')
  const [emailLoad,  setEmailLoad]  = useState(false)

  // Notifications
  const defaultPrefs = {
    email_offers: true, email_messages: true, email_reviews: true,
    push_offers:  true, push_messages:  true, push_reviews:  false,
    weekly_digest: false, marketing: false,
    ...profile.notification_prefs,
  }
  const [notifPrefs, setNotifPrefs] = useState(defaultPrefs)
  const [notifLoad,  setNotifLoad]  = useState(false)

  // Delete
  const [delPwd,    setDelPwd]    = useState('')
  const [delConfirm,setDelConfirm]= useState('')
  const [delLoad,   setDelLoad]   = useState(false)
  const [showDel,   setShowDel]   = useState(false)

  function showToast(msg: string, type: 'success'|'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  // ── PASSWORD ────────────────────────────────
  async function handlePassword() {
    if (!curPwd || !newPwd || !confPwd) { showToast('Plotëso të gjitha fushat.', 'error'); return }
    if (newPwd !== confPwd)             { showToast('Fjalëkalimet e reja nuk përputhen.', 'error'); return }
    if (newPwd.length < 8)              { showToast('Fjalëkalimi duhet të ketë të paktën 8 karaktere.', 'error'); return }
    setPwdLoad(true)
    const res = await fetch('/api/settings/password', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ currentPassword:curPwd, newPassword:newPwd }) })
    const data = await res.json()
    setPwdLoad(false)
    if (res.ok) { showToast('Fjalëkalimi u ndryshua me sukses!'); setCurPwd(''); setNewPwd(''); setConfPwd('') }
    else showToast(data.error, 'error')
  }

  // ── EMAIL ───────────────────────────────────
  async function handleEmail() {
    if (!newEmail || !emailPwd) { showToast('Plotëso të gjitha fushat.', 'error'); return }
    setEmailLoad(true)
    const res = await fetch('/api/settings/email', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ newEmail, password:emailPwd }) })
    const data = await res.json()
    setEmailLoad(false)
    if (res.ok) { showToast(data.message || 'Email-i u ndryshua!'); setNewEmail(''); setEmailPwd('') }
    else showToast(data.error, 'error')
  }

  // ── NOTIFICATIONS ───────────────────────────
  async function handleNotifications() {
    setNotifLoad(true)
    const res = await fetch('/api/settings/notifications', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(notifPrefs) })
    setNotifLoad(false)
    if (res.ok) showToast('Preferencat u ruajtën!')
    else showToast('Gabim gjatë ruajtjes.', 'error')
  }

  // ── DELETE ───────────────────────────────────
  async function handleDelete() {
    if (!delPwd || !delConfirm) { showToast('Plotëso të gjitha fushat.', 'error'); return }
    setDelLoad(true)
    const res = await fetch('/api/settings/delete-account', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ password:delPwd, confirmation:delConfirm }) })
    const data = await res.json()
    setDelLoad(false)
    if (res.ok) {
      await supabase.auth.signOut()
      router.push('/')
    } else showToast(data.error, 'error')
  }

  const pwdStrength = newPwd.length === 0 ? 0 : newPwd.length < 6 ? 1 : newPwd.length < 10 ? 2 : /[A-Z]/.test(newPwd) && /[0-9]/.test(newPwd) ? 4 : 3
  const pwdColors  = ['', '#ef4444', '#f97316', '#fbbf24', '#22d3a5']
  const pwdLabels  = ['', 'Shumë dobët', 'Dobët', 'Mirë', 'Shumë i fortë']

  return (
    <div>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
      `}</style>

      {toast && <Toast {...toast} />}

      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'1.9rem', fontWeight:900, letterSpacing:'-0.03em', marginBottom:6 }}>Cilësimet</h1>
        <p style={{ fontSize:14, color:'rgba(232,234,240,0.45)' }}>Menaxho llogarinë, sigurinë dhe preferencat</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'220px 1fr', gap:20, alignItems:'start' }}>

        {/* Sidebar tabs */}
        <div style={{ position:'sticky', top:80, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:18, overflow:'hidden' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'13px 18px', background: tab===t.id ? 'rgba(232,98,26,0.1)' : 'transparent', border:'none', borderLeft:`2px solid ${tab===t.id ? '#e8621a' : 'transparent'}`, color: tab===t.id ? '#e8eaf0' : 'rgba(232,234,240,0.5)', fontFamily:'inherit', fontSize:13, fontWeight: tab===t.id ? 700 : 500, cursor:'pointer', textAlign:'left' as const, transition:'all 0.2s' }}>
              <span style={{ fontSize:16 }}>{t.icon}</span>
              {t.label}
              {t.id === 'danger' && <span style={{ marginLeft:'auto', width:6, height:6, borderRadius:'50%', background:'#ef4444', flexShrink:0 }} />}
            </button>
          ))}

          {/* Profile info */}
          <div style={{ padding:'16px 18px', borderTop:'1px solid rgba(255,255,255,0.07)', marginTop:4 }}>
            <div style={{ fontSize:12, color:'rgba(232,234,240,0.35)', marginBottom:4 }}>Kyçur si</div>
            <div style={{ fontSize:13, fontWeight:700, marginBottom:2 }}>{profile.full_name}</div>
            <div style={{ fontSize:11, color:'rgba(232,234,240,0.4)' }}>{currentEmail}</div>
            <div style={{ marginTop:8, display:'inline-block', fontSize:10, fontWeight:700, color:'#e8621a', background:'rgba(232,98,26,0.1)', border:'1px solid rgba(232,98,26,0.2)', borderRadius:6, padding:'2px 9px' }}>
              {profile.package_type === 'free' ? 'Falas' : '💎 Premium'}
            </div>
          </div>
        </div>

        {/* Content */}
        <div>

          {/* ── ACCOUNT ── */}
          {tab === 'account' && (
            <div>
              <SectionCard title="Informacioni i llogarisë" icon="👤">
                <div style={{ display:'grid', gap:0 }}>
                  {[
                    { label:'Emri i plotë', val: profile.full_name },
                    { label:'Email aktual', val: currentEmail },
                    { label:'Roli',         val: profile.role.charAt(0).toUpperCase() + profile.role.slice(1) },
                    { label:'Anëtar që nga',val: new Date(profile.created_at).toLocaleDateString('sq-AL', { day:'numeric', month:'long', year:'numeric' }) },
                    { label:'Paketa',       val: profile.package_type === 'free' ? 'Falas' : 'Premium' },
                  ].map(r => (
                    <div key={r.label} style={{ display:'flex', justifyContent:'space-between', padding:'13px 0', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ fontSize:13, color:'rgba(232,234,240,0.45)' }}>{r.label}</span>
                      <span style={{ fontSize:13, fontWeight:600 }}>{r.val}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:16 }}>
                  <a href={`/${profile.role}/profile`}
                    style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'10px 20px', background:'linear-gradient(135deg,#e8621a,#ff7c35)', borderRadius:11, color:'#fff', fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:'0.88rem', textDecoration:'none', boxShadow:'0 4px 14px rgba(232,98,26,0.25)' }}>
                    ✏️ Edito profilin →
                  </a>
                </div>
              </SectionCard>

              <SectionCard title="Sesioni aktiv" icon="💻">
                <div style={{ padding:'16px 18px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:13, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:14, marginBottom:4 }}>Sesioni aktual</div>
                    <div style={{ fontSize:12, color:'rgba(232,234,240,0.4)' }}>Browser · Kyçur tani</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#22d3a5', fontWeight:700 }}>
                    <div style={{ width:7, height:7, borderRadius:'50%', background:'#22d3a5', boxShadow:'0 0 8px rgba(34,211,165,0.6)' }} /> Aktiv
                  </div>
                </div>
                <button
                  onClick={async () => { await supabase.auth.signOut(); router.push('/login') }}
                  style={{ marginTop:14, padding:'10px 20px', borderRadius:11, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(232,234,240,0.6)', fontFamily:'inherit', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                  Çkyçu nga llogaria →
                </button>
              </SectionCard>
            </div>
          )}

          {/* ── PASSWORD ── */}
          {tab === 'password' && (
            <SectionCard title="Ndrysho fjalëkalimin" icon="🔒">
              <InputField label="Fjalëkalimi aktual" type="password" value={curPwd} onChange={setCurPwd} placeholder="••••••••" />
              <InputField label="Fjalëkalimi i ri" type="password" value={newPwd} onChange={setNewPwd} placeholder="Minimum 8 karaktere" />

              {newPwd.length > 0 && (
                <div style={{ marginBottom:14 }}>
                  <div style={{ display:'flex', gap:4, marginBottom:6 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{ flex:1, height:4, borderRadius:2, background: i <= pwdStrength ? pwdColors[pwdStrength] : 'rgba(255,255,255,0.08)', transition:'background 0.3s' }} />
                    ))}
                  </div>
                  <span style={{ fontSize:11, color: pwdColors[pwdStrength], fontWeight:700 }}>{pwdLabels[pwdStrength]}</span>
                  <div style={{ fontSize:11, color:'rgba(232,234,240,0.3)', marginTop:4 }}>
                    {!/[A-Z]/.test(newPwd) && '· Shto shkronja të mëdha  '}
                    {!/[0-9]/.test(newPwd) && '· Shto numra  '}
                    {!/[^A-Za-z0-9]/.test(newPwd) && '· Shto simbole'}
                  </div>
                </div>
              )}

              <InputField label="Konfirmo fjalëkalimin e ri" type="password" value={confPwd} onChange={setConfPwd} placeholder="••••••••"
                hint={confPwd && newPwd !== confPwd ? '⚠️ Fjalëkalimet nuk përputhen' : confPwd && newPwd === confPwd ? '✓ Fjalëkalimet përputhen' : undefined} />
              <div style={{ display:'flex', justifyContent:'flex-end' }}>
                <SaveBtn loading={pwdLoad} onClick={handlePassword} label="Ndrysho fjalëkalimin" />
              </div>
            </SectionCard>
          )}

          {/* ── EMAIL ── (part of password tab) */}
          {tab === 'password' && (
            <SectionCard title="Ndrysho email-in" icon="📧">
              <div style={{ padding:'12px 16px', background:'rgba(96,165,250,0.07)', border:'1px solid rgba(96,165,250,0.2)', borderRadius:11, marginBottom:16, fontSize:13, color:'rgba(232,234,240,0.55)' }}>
                📧 Email aktual: <strong style={{ color:'#e8eaf0' }}>{currentEmail}</strong>
              </div>
              <InputField label="Email-i i ri" type="email" value={newEmail} onChange={setNewEmail} placeholder="emri@email.com" hint="Do të marrësh email konfirmimi." />
              <InputField label="Fjalëkalimi për konfirmim" type="password" value={emailPwd} onChange={setEmailPwd} placeholder="••••••••" />
              <div style={{ display:'flex', justifyContent:'flex-end' }}>
                <SaveBtn loading={emailLoad} onClick={handleEmail} label="Ndrysho email-in" />
              </div>
            </SectionCard>
          )}

          {/* ── NOTIFICATIONS ── */}
          {tab === 'notifications' && (
            <div>
              <SectionCard title="Njoftimet me Email" icon="📧">
                {[
                  { key:'email_offers',   label:'Oferta të reja',    desc:'Kur merr ofertë të re për aplikimin tënd' },
                  { key:'email_messages', label:'Mesazhe të reja',   desc:'Kur dikush të dërgon mesazh' },
                  { key:'email_reviews',  label:'Vlerësime të reja', desc:'Kur merr vlerësim të ri' },
                  { key:'weekly_digest',  label:'Raport javor',      desc:'Përmbledhje javore e aktivitetit tënd' },
                  { key:'marketing',      label:'Lajme & oferta',    desc:'Ofertat speciale dhe lajmet e platformës' },
                ].map(n => (
                  <Toggle key={n.key} checked={(notifPrefs as any)[n.key]} onChange={v => setNotifPrefs(p => ({...p, [n.key]:v}))} label={n.label} desc={n.desc} />
                ))}
              </SectionCard>

              <SectionCard title="Njoftimet Push (browser)" icon="🔔">
                {[
                  { key:'push_offers',   label:'Oferta të reja',  desc:'Njoftime në browser kur merr ofertë' },
                  { key:'push_messages', label:'Mesazhe',         desc:'Njoftime për mesazhe të pa-lexuara' },
                  { key:'push_reviews',  label:'Vlerësime',       desc:'Njoftime kur vlerësohesh' },
                ].map(n => (
                  <Toggle key={n.key} checked={(notifPrefs as any)[n.key]} onChange={v => setNotifPrefs(p => ({...p, [n.key]:v}))} label={n.label} desc={n.desc} />
                ))}
              </SectionCard>

              <div style={{ display:'flex', justifyContent:'flex-end' }}>
                <SaveBtn loading={notifLoad} onClick={handleNotifications} label="Ruaj preferencat" />
              </div>
            </div>
          )}

          {/* ── PRIVACY ── */}
          {tab === 'privacy' && (
            <div>
              <SectionCard title="Privatësia & Siguria" icon="🛡️">
                {[
                  { label:'Profili publik',           desc:'Klientët dhe kompanitë mund të shohin profilin tënd', defaultVal:true },
                  { label:'Shfaq numrin e telefonit', desc:'Vetëm pas pranimit të ofertës', defaultVal:false },
                  { label:'Shfaq vlerësimet',         desc:'Vlerësimet e marra janë të dukshme për të gjithë', defaultVal:true },
                ].map((p,i) => (
                  <Toggle key={i} checked={p.defaultVal} onChange={()=>{}} label={p.label} desc={p.desc} />
                ))}
              </SectionCard>

              <SectionCard title="Të dhënat e llogarisë" icon="📁">
                <p style={{ fontSize:13, color:'rgba(232,234,240,0.5)', lineHeight:1.7, marginBottom:18 }}>
                  Mund të kërkosh eksportim të të gjitha të dhënave tua në çdo kohë. Do të marrësh një email me lidhjen për shkarkimin brenda 24 orësh.
                </p>
                <button style={{ padding:'10px 20px', borderRadius:11, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(232,234,240,0.65)', fontFamily:'inherit', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                  📥 Eksporto të dhënat e mia
                </button>
              </SectionCard>

              <SectionCard title="Cookies & Tracking" icon="🍪">
                {[
                  { label:'Cookies thelbësor', desc:'Nevojshëm për funksionimin e platformës — nuk mund të çaktivizohen', defaultVal:true },
                  { label:'Cookies analitikë', desc:'Na ndihmojnë të kuptojmë si përdoret platforma', defaultVal:true },
                ].map((c,i) => (
                  <Toggle key={i} checked={c.defaultVal} onChange={()=>{}} label={c.label} desc={c.desc} />
                ))}
              </SectionCard>
            </div>
          )}

          {/* ── DANGER ZONE ── */}
          {tab === 'danger' && (
            <div>
              <div style={{ padding:'20px 22px', background:'rgba(239,68,68,0.05)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:18, marginBottom:16 }}>
                <div style={{ display:'flex', gap:12, alignItems:'flex-start', marginBottom:16 }}>
                  <span style={{ fontSize:26 }}>⚠️</span>
                  <div>
                    <div style={{ fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:'1.05rem', color:'#f87171', marginBottom:6 }}>Zona e rrezikshme</div>
                    <p style={{ fontSize:13, color:'rgba(232,234,240,0.5)', lineHeight:1.7 }}>Veprimet këtu janë të pakthyeshme. Lexo me kujdes para se të vazhdosh.</p>
                  </div>
                </div>
              </div>

              <SectionCard title="Fshi llogarinë" icon="🗑️">
                <p style={{ fontSize:13, color:'rgba(232,234,240,0.5)', lineHeight:1.75, marginBottom:20 }}>
                  Fshirja e llogarisë do të heqë të gjitha të dhënat tua përgjithmonë, duke përfshirë aplikimet, ofertat, mesazhet dhe vlerësimet. Ky veprim <strong style={{ color:'#f87171' }}>nuk mund të kthehet prapa</strong>.
                </p>

                {!showDel ? (
                  <button onClick={() => setShowDel(true)}
                    style={{ padding:'11px 22px', borderRadius:12, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', color:'#f87171', fontFamily:'inherit', fontSize:13, fontWeight:700, cursor:'pointer', transition:'all 0.2s' }}>
                    🗑️ Dua të fshij llogarinë time
                  </button>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:14, padding:'20px', background:'rgba(239,68,68,0.05)', border:'1px solid rgba(239,68,68,0.15)', borderRadius:14, animation:'fadeUp 0.3s ease' }}>
                    <InputField label="Fjalëkalimi për konfirmim" type="password" value={delPwd} onChange={setDelPwd} placeholder="••••••••" />
                    <div>
                      <label style={{ display:'block', fontSize:11, fontWeight:700, color:'rgba(232,234,240,0.4)', textTransform:'uppercase' as const, letterSpacing:'0.07em', marginBottom:7 }}>
                        Shkruaj <strong style={{ color:'#f87171' }}>FSHI LLOGARINË</strong> për të konfirmuar
                      </label>
                      <input value={delConfirm} onChange={e => setDelConfirm(e.target.value)}
                        placeholder="FSHI LLOGARINË"
                        style={{ width:'100%', background:'rgba(239,68,68,0.05)', border:`1px solid ${delConfirm === 'FSHI LLOGARINË' ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.09)'}`, borderRadius:11, padding:'12px 14px', fontSize:14, color:'#e8eaf0', fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }} />
                    </div>
                    <div style={{ display:'flex', gap:10 }}>
                      <button onClick={() => { setShowDel(false); setDelPwd(''); setDelConfirm('') }}
                        style={{ flex:1, padding:'11px', borderRadius:11, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', color:'rgba(232,234,240,0.6)', fontFamily:'inherit', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                        Anulo
                      </button>
                      <SaveBtn loading={delLoad} onClick={handleDelete}
                        disabled={delConfirm !== 'FSHI LLOGARINË' || !delPwd}
                        col="#ef4444" label="Fshi llogarinë përgjithmonë" />
                    </div>
                  </div>
                )}
              </SectionCard>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}