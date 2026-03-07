'use client'

import { useState } from 'react'
import SettingsClient from '@/components/SettingsClient'

interface Profile { id:string; full_name:string; role:string; created_at:string; package_type:string; notification_prefs?:any }

const PLATFORM_CONFIG = [
  {
    section: '🌐 Platforma',
    items: [
      { key:'maintenance_mode',     label:'Modaliteti mirëmbajtje',   desc:'Bloko hyrjen e përdoruesve gjatë mirëmbajtjes',   type:'toggle',  val:false },
      { key:'registration_open',    label:'Regjistrime hapur',         desc:'Lejo regjistrime të reja të llogarive',           type:'toggle',  val:true  },
      { key:'auto_expire_hours',    label:'Skadim automatik (orë)',    desc:'Sa orë para skadimit të aplikimeve aktive',       type:'number',  val:'24'  },
      { key:'max_offers_per_app',   label:'Maks oferta / aplikim',    desc:'Numri maksimal i ofertave për çdo aplikim',       type:'number',  val:'10'  },
    ]
  },
  {
    section: '💎 Paketa Premium',
    items: [
      { key:'premium_price_month',  label:'Çmimi mujor (€)',           desc:'Kostoja e abonimit mujor Premium',                type:'number',  val:'9.99' },
      { key:'premium_price_year',   label:'Çmimi vjetor (€)',          desc:'Kostoja e abonimit vjetor Premium',               type:'number',  val:'89.99'},
      { key:'premium_max_offers',   label:'Maks oferta premium / ditë',desc:'Numri ofertave ditore për llogaritë premium',     type:'number',  val:'50'  },
      { key:'free_max_offers',      label:'Maks oferta falas / ditë',  desc:'Numri ofertave ditore për llogaritë falas',       type:'number',  val:'3'   },
    ]
  },
  {
    section: '📧 Email & Njoftimet',
    items: [
      { key:'email_notifications',  label:'Njoftimet me email',        desc:'Dërgimi i emaileve automatike tek përdoruesit',   type:'toggle',  val:true  },
      { key:'admin_alerts',         label:'Alarme admin',              desc:'Njoftime për veprime që kërkojnë vëmendje',       type:'toggle',  val:true  },
      { key:'welcome_email',        label:'Email mirëseardhje',        desc:'Dërgo email tek çdo përdorues i ri',              type:'toggle',  val:true  },
    ]
  },
  {
    section: '🛡️ Siguria',
    items: [
      { key:'require_email_verify', label:'Kërko verifikim emaili',    desc:'Përdoruesit duhet të verifikojnë emailin',        type:'toggle',  val:true  },
      { key:'session_timeout_days', label:'Skadim sesioni (ditë)',     desc:'Sa ditë mbetet aktiv sesioni pa hyrje',           type:'number',  val:'30'  },
      { key:'max_login_attempts',   label:'Maks tentativa hyrjeje',   desc:'Pas kësaj blloko IP-në për 1 orë',               type:'number',  val:'5'   },
    ]
  },
]

type Tab = 'personal' | 'platform'

export default function AdminSettingsClient({ profile, userEmail }: { profile:Profile; userEmail:string }) {
  const [tab,     setTab]     = useState<Tab>('personal')
  const [configs, setConfigs] = useState<Record<string, any>>(() => {
    const initial: Record<string,any> = {}
    PLATFORM_CONFIG.forEach(s => s.items.forEach(item => { initial[item.key] = item.val }))
    return initial
  })
  const [saving,  setSaving]  = useState(false)
  const [toast,   setToast]   = useState<{ msg:string; type:'success'|'error' } | null>(null)

  function showToast(msg: string, type: 'success'|'error' = 'success') {
    setToast({ msg, type }); setTimeout(() => setToast(null), 4000)
  }

  async function savePlatformConfig() {
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    setSaving(false)
    showToast('Konfigurimi i platformës u ruajt!')
  }

  return (
    <div>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
      `}</style>

      {toast && (
        <div style={{ position:'fixed', top:20, right:20, zIndex:700, padding:'14px 22px', borderRadius:13, fontSize:14, fontWeight:600, animation:'fadeUp 0.3s ease', boxShadow:'0 12px 40px rgba(0,0,0,0.5)', background: toast.type==='success' ? 'rgba(34,211,165,0.1)' : 'rgba(239,68,68,0.1)', border:`1px solid ${toast.type==='success' ? 'rgba(34,211,165,0.3)' : 'rgba(239,68,68,0.3)'}`, color: toast.type==='success' ? '#22d3a5' : '#fca5a5' }}>
          {toast.type==='success' ? '✓' : '⚠️'} {toast.msg}
        </div>
      )}

      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'1.9rem', fontWeight:900, letterSpacing:'-0.03em', marginBottom:6 }}>Cilësimet</h1>
        <p style={{ fontSize:14, color:'rgba(232,234,240,0.45)' }}>Llogaria personale & konfigurimi i platformës</p>
      </div>

      {/* Top tab switcher */}
      <div style={{ display:'inline-flex', gap:4, background:'rgba(255,255,255,0.04)', padding:4, borderRadius:14, border:'1px solid rgba(255,255,255,0.08)', marginBottom:28 }}>
        {([
          { id:'personal', label:'👤 Llogaria ime' },
          { id:'platform', label:'⚙️ Platforma' },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding:'10px 22px', borderRadius:11, border:'none', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', background:tab===t.id ? '#e8621a' : 'transparent', color:tab===t.id ? '#fff' : 'rgba(232,234,240,0.5)', transition:'all 0.2s', boxShadow: tab===t.id ? '0 4px 14px rgba(232,98,26,0.3)' : 'none' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Personal settings — reuse SettingsClient */}
      {tab === 'personal' && (
        <SettingsClient profile={profile as any} userEmail={userEmail} />
      )}

      {/* Platform config */}
      {tab === 'platform' && (
        <div>
          {/* Warning banner */}
          <div style={{ padding:'14px 18px', background:'rgba(251,191,36,0.07)', border:'1px solid rgba(251,191,36,0.2)', borderRadius:14, display:'flex', gap:12, alignItems:'center', marginBottom:24, animation:'fadeUp 0.3s ease' }}>
            <span style={{ fontSize:20 }}>⚠️</span>
            <p style={{ fontSize:13, color:'rgba(232,234,240,0.6)', lineHeight:1.6 }}>
              Ndryshimet e konfigurimit të platformës ndikojnë të gjithë përdoruesit. Veproni me kujdes.
            </p>
          </div>

          {PLATFORM_CONFIG.map((section, si) => (
            <div key={si} style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:'24px', marginBottom:16, animation:`fadeUp 0.4s ease ${si*0.08}s both` }}>
              <h3 style={{ fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:'1rem', marginBottom:20 }}>{section.section}</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
                {section.items.map((item, ii) => (
                  <div key={item.key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0', borderBottom: ii < section.items.length-1 ? '1px solid rgba(255,255,255,0.05)' : 'none', gap:16 }}>
                    <div>
                      <div style={{ fontWeight:600, fontSize:14, marginBottom:3 }}>{item.label}</div>
                      <div style={{ fontSize:12, color:'rgba(232,234,240,0.4)' }}>{item.desc}</div>
                    </div>
                    {item.type === 'toggle' ? (
                      <button onClick={() => setConfigs(prev => ({...prev, [item.key]: !prev[item.key]}))}
                        style={{ width:46, height:26, borderRadius:13, background: configs[item.key] ? '#e8621a' : 'rgba(255,255,255,0.1)', border:'none', cursor:'pointer', position:'relative' as const, transition:'background 0.25s', flexShrink:0 }}>
                        <div style={{ width:20, height:20, borderRadius:'50%', background:'#fff', position:'absolute', top:3, left: configs[item.key] ? 23 : 3, transition:'left 0.25s', boxShadow:'0 2px 6px rgba(0,0,0,0.3)' }} />
                      </button>
                    ) : (
                      <input type="number" value={configs[item.key]}
                        onChange={e => setConfigs(prev => ({...prev, [item.key]: e.target.value}))}
                        style={{ width:90, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:9, padding:'8px 12px', fontSize:14, color:'#e8eaf0', fontFamily:'inherit', outline:'none', textAlign:'right' as const, flexShrink:0 }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Save platform config */}
          <div style={{ display:'flex', justifyContent:'flex-end', gap:12, marginTop:8 }}>
            <button onClick={() => setConfigs(() => {
              const r: Record<string,any> = {}
              PLATFORM_CONFIG.forEach(s => s.items.forEach(item => { r[item.key] = item.val }))
              return r
            })} style={{ padding:'11px 22px', borderRadius:12, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(232,234,240,0.55)', fontFamily:'inherit', fontSize:13, fontWeight:600, cursor:'pointer' }}>
              Reseto vlerat
            </button>
            <button onClick={savePlatformConfig} disabled={saving}
              style={{ padding:'11px 26px', borderRadius:12, background: saving ? 'rgba(232,98,26,0.4)' : 'linear-gradient(135deg,#e8621a,#ff7c35)', border:'none', color:'#fff', fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:'0.9rem', cursor: saving ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', gap:8, boxShadow: saving ? 'none' : '0 4px 16px rgba(232,98,26,0.3)' }}>
              {saving && <div style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid #fff', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />}
              {saving ? 'Duke ruajtur...' : '💾 Ruaj konfigurimin'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}