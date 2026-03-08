'use client'

import { useState, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import ProfileShell from '@/components/ProfileShell'
import FormField    from '@/components/FormField'
import { useToast } from '@/components/Toast'

interface Profile { id:string; full_name:string; city:string; phone?:string; bio?:string; avatar_url?:string; package_type:string; created_at:string }
interface Company { id:string; business_name:string; description:string|null; website:string|null; is_verified:boolean; rating_avg:number; total_reviews:number }
interface Stats   { totalOffers:number; acceptedOffers:number }

const CITIES      = ['Prishtinë','Prizren','Pejë','Gjakovë','Mitrovicë','Gjilan','Ferizaj','Vushtrri','Skenderaj','Lipjan','Podujevë','Klinë']
const SPECIALTIES = ['Konstruksion','Renovim i plotë','Banjë & Sanitare','Kuzhinë','Elektrike','Hidraulikë','Ngjyrosje','Dysheme','Fasadë','Ngrohje & Klimë','Dyer & Dritare','Tjetër']

function completionPct(form: any, company: Company) {
  const items = [
    { done: !!form.business_name,                                            label: 'Emri i biznesit' },
    { done: !!form.city,                                                     label: 'Qyteti' },
    { done: !!form.phone,                                                    label: 'Telefoni' },
    { done: !!form.description && form.description.length > 40,             label: 'Përshkrim i biznesit' },
    { done: !!form.website,                                                  label: 'Faqja web' },
    { done: form.specialties.split(',').filter((s:string)=>s.trim()).length >= 2, label: 'Min 2 specialitete' },
    { done: company.is_verified,                                             label: 'Verifikimi i kompanisë' },
  ]
  return { pct: Math.round((items.filter(i=>i.done).length / items.length) * 100), items }
}

export default function CompanyProfileClient({ profile, company, stats }: { profile:Profile; company:Company; stats:Stats }) {
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const toast    = useToast()
  const fileRef  = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    full_name:    profile.full_name       || '',
    business_name:company.business_name   || '',
    city:         profile.city            || '',
    phone:        profile.phone           || '',
    description:  company.description     || '',
    website:      company.website         || '',
    specialties:  '',
  })
  const [avatar,    setAvatar]    = useState(profile.avatar_url || '')
  const [focused,   setFocused]   = useState<string|null>(null)
  const [saving,    setSaving]    = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dirty,     setDirty]     = useState(false)
  const [activeTab, setActiveTab] = useState<'info'|'specialties'|'preview'>('info')
  const [specInput, setSpecInput] = useState('')

  function set<K extends keyof typeof form>(key: K) {
    return (val: typeof form[K]) => { setForm(p=>({...p,[key]:val})); setDirty(true) }
  }

  const completion     = completionPct(form, company)
  const successRate    = stats.totalOffers>0 ? Math.round((stats.acceptedOffers/stats.totalOffers)*100) : 0
  const specialtyList  = form.specialties.split(',').map(s=>s.trim()).filter(Boolean)

  function addSpec(s: string) {
    const t = s.trim()
    if (!t || specialtyList.includes(t)) return
    set('specialties')([...specialtyList, t].join(', '))
    setSpecInput('')
  }
  function removeSpec(s: string) {
    set('specialties')(specialtyList.filter(x=>x!==s).join(', '))
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 3_000_000) { toast.error('Skedari shumë i madh', 'Max 3MB'); return }
    setUploading(true)
    try {
      const ext  = file.name.split('.').pop()
      const path = `avatars/${profile.id}.${ext}`
      const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      if (error) throw error
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', profile.id)
      setAvatar(data.publicUrl + '?t=' + Date.now())
      toast.success('Logo u ndryshua! 📸')
    } catch { toast.error('Gabim', 'Foto nuk u ngarku') }
    finally   { setUploading(false) }
  }

  async function handleSave() {
    if (!form.business_name.trim()) { toast.error('Emri i biznesit është i detyrueshëm'); return }
    setSaving(true)
    try {
      const [profRes, compRes] = await Promise.all([
        supabase.from('profiles').update({ full_name:form.full_name.trim(), city:form.city, phone:form.phone||null }).eq('id', profile.id),
        supabase.from('companies').update({ business_name:form.business_name.trim(), description:form.description||null, website:form.website||null }).eq('id', company.id),
      ])
      if (profRes.error || compRes.error) throw new Error('DB error')
      toast.success('Profili u ruajt! ✓', 'Ndryshimet u aplikuan.')
      setDirty(false)
    } catch { toast.error('Gabim', 'Provo sërish.') }
    finally   { setSaving(false) }
  }

  const TABS = [
    { id:'info',        label:'Informacioni', icon:'🏢' },
    { id:'specialties', label:'Specialitetet', icon:'⚙️' },
    { id:'preview',     label:'Preview',       icon:'👁' },
  ]

  return (
    <div>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        .spec-chip:hover .remove-spec { opacity:1!important; }
        .sug:hover { background:rgba(240,236,228,0.08)!important; color:#f0ece4!important; }
        .tab-btn:hover { color:rgba(240,236,228,0.8)!important; }
      `}</style>

      <ProfileShell
        name={form.business_name || company.business_name}
        subtitle={`Kompani · ${form.city || profile.city}`}
        city={form.city}
        avatar={avatar}
        onAvatarClick={() => fileRef.current?.click()}
        rating={company.rating_avg}
        reviewCount={company.total_reviews}
        isVerified={company.is_verified}
        badge={company.is_verified ? { label:'Kompani e verifikuar', color:'#22d3a5' } : { label:'Verifikimi në pritje', color:'#fbbf24' }}
        stats={[
          { label:'Ofertat',   value:stats.totalOffers },
          { label:'Pranuar',   value:stats.acceptedOffers },
          { label:'Sukses',    value:`${successRate}%` },
        ]}
      />

      <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display:'none' }}/>

      {/* Completion bar */}
      <div style={{ marginBottom:24, padding:'16px 20px', background:'rgba(240,236,228,0.02)', border:`1px solid ${completion.pct===100?'rgba(34,211,165,0.2)':'rgba(240,236,228,0.08)'}`, borderRadius:16, animation:'fadeUp 0.4s ease 0.05s both' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <div>
            <span style={{ fontSize:13, fontWeight:700 }}>Plotësia e profilit </span>
            <span style={{ fontSize:13, fontWeight:900, color:completion.pct===100?'#22d3a5':completion.pct>60?'#fbbf24':'#f87171' }}>{completion.pct}%</span>
          </div>
          {!company.is_verified && (
            <span style={{ fontSize:11, color:'#fbbf24', background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.2)', borderRadius:6, padding:'3px 10px' }}>⏳ Prit verifikimin nga admin</span>
          )}
        </div>
        <div style={{ height:6, background:'rgba(240,236,228,0.08)', borderRadius:10, overflow:'hidden', marginBottom:10 }}>
          <div style={{ height:'100%', width:`${completion.pct}%`, background:completion.pct===100?'linear-gradient(90deg,#22d3a5,#10b981)':completion.pct>60?'linear-gradient(90deg,#fbbf24,#f59e0b)':'linear-gradient(90deg,#f87171,#ef4444)', borderRadius:10, transition:'width 1s ease' }}/>
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {completion.items.map((item,i) => (
            <span key={i} style={{ fontSize:10, fontWeight:700, color:item.done?'#22d3a5':'rgba(240,236,228,0.35)', background:item.done?'rgba(34,211,165,0.06)':'rgba(240,236,228,0.03)', border:`1px solid ${item.done?'rgba(34,211,165,0.15)':'rgba(240,236,228,0.08)'}`, borderRadius:6, padding:'3px 9px' }}>
              {item.done?'✓ ':''}{item.label}
            </span>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, background:'rgba(240,236,228,0.04)', padding:4, borderRadius:14, border:'1px solid rgba(240,236,228,0.07)', marginBottom:20 }}>
        {TABS.map(t => (
          <button key={t.id} className="tab-btn" onClick={() => setActiveTab(t.id as any)}
            style={{ flex:1, padding:'10px 16px', borderRadius:11, border:'none', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', background:activeTab===t.id?'rgba(240,236,228,0.1)':'transparent', color:activeTab===t.id?'#f0ece4':'rgba(240,236,228,0.45)', transition:'all 0.2s' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── INFO TAB ── */}
      {activeTab === 'info' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16, animation:'fadeUp 0.3s ease' }}>

          <div style={{ background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:16, padding:'20px 22px' }}>
            <h2 style={{ fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:'1rem', marginBottom:18, display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ width:30, height:30, borderRadius:9, background:'rgba(232,98,26,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>🏢</span>
              Informacioni i biznesit
            </h2>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <FormField label="Emri i biznesit" name="business_name" value={form.business_name} onChange={set('business_name') as any} required focused={focused} onFocus={setFocused} onBlur={()=>setFocused(null)} />
              <FormField label="Emri i kontaktit" name="full_name" value={form.full_name} onChange={set('full_name') as any} required focused={focused} onFocus={setFocused} onBlur={()=>setFocused(null)} />
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:'rgba(240,236,228,0.5)', display:'block', marginBottom:6 }}>Qyteti</label>
                <select value={form.city} onChange={e => { set('city')(e.target.value); setDirty(true) }}
                  style={{ width:'100%', padding:'12px 14px', background:'rgba(240,236,228,0.04)', border:'1px solid rgba(240,236,228,0.09)', borderRadius:12, color:'#f0ece4', fontFamily:'inherit', fontSize:14, outline:'none', cursor:'pointer' }}>
                  <option value="">Zgjedh qytetin</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <FormField label="Telefoni" name="phone" type="tel" value={form.phone||''} onChange={set('phone') as any} placeholder="+383 44 123 456" focused={focused} onFocus={setFocused} onBlur={()=>setFocused(null)} />
              <div style={{ gridColumn:'1/-1' }}>
                <FormField label="Faqja web (opsionale)" name="website" value={form.website||''} onChange={set('website') as any} placeholder="https://kompania-juaj.com" focused={focused} onFocus={setFocused} onBlur={()=>setFocused(null)} />
              </div>
            </div>
          </div>

          <div style={{ background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:16, padding:'20px 22px' }}>
            <h2 style={{ fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:'1rem', marginBottom:18, display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ width:30, height:30, borderRadius:9, background:'rgba(96,165,250,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>📋</span>
              Përshkrimi i biznesit
            </h2>
            <FormField label="Përshkrim" name="description" value={form.description||''} onChange={set('description') as any} type="textarea" rows={5} placeholder="Përshkruani historikun e kompanisë, shërbimet kryesore, vlerat dhe çfarë ju dallon nga konkurrenca..." hint={`${(form.description||'').length}/800 karaktere`} focused={focused} onFocus={setFocused} onBlur={()=>setFocused(null)} />
          </div>
        </div>
      )}

      {/* ── SPECIALTIES TAB ── */}
      {activeTab === 'specialties' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16, animation:'fadeUp 0.3s ease' }}>
          <div style={{ background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:16, padding:'20px 22px' }}>
            <h2 style={{ fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:'1rem', marginBottom:6, display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ width:30, height:30, borderRadius:9, background:'rgba(232,98,26,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>⚙️</span>
              Specialitetet e kompanisë
            </h2>
            <p style={{ fontSize:12, color:'rgba(240,236,228,0.4)', marginBottom:18, lineHeight:1.6 }}>Zgjidhni ose shtoni specialitetet tuaja — ndihmojnë klientët t'ju gjejnë.</p>

            {specialtyList.length > 0 && (
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
                {specialtyList.map(s => (
                  <span key={s} className="spec-chip" style={{ fontSize:12, fontWeight:700, color:'#e8621a', background:'rgba(232,98,26,0.08)', border:'1px solid rgba(232,98,26,0.2)', borderRadius:8, padding:'5px 12px', display:'flex', alignItems:'center', gap:6 }}>
                    {s}
                    <button className="remove-spec" onClick={() => removeSpec(s)}
                      style={{ opacity:0, background:'none', border:'none', color:'#f87171', cursor:'pointer', fontSize:12, padding:0, lineHeight:1, transition:'opacity 0.15s' }}>✕</button>
                  </span>
                ))}
              </div>
            )}

            <div style={{ display:'flex', gap:8, marginBottom:16 }}>
              <input value={specInput} onChange={e => setSpecInput(e.target.value)}
                onKeyDown={e => { if (e.key==='Enter') { e.preventDefault(); addSpec(specInput) } }}
                placeholder="Shto specialitet..."
                style={{ flex:1, padding:'10px 14px', background:'rgba(240,236,228,0.04)', border:'1px solid rgba(240,236,228,0.09)', borderRadius:11, fontSize:13, color:'#f0ece4', fontFamily:'inherit', outline:'none' }}/>
              <button onClick={() => addSpec(specInput)}
                style={{ padding:'10px 18px', borderRadius:11, background:'rgba(232,98,26,0.1)', border:'1px solid rgba(232,98,26,0.25)', color:'#e8621a', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s', whiteSpace:'nowrap' }}>
                + Shto
              </button>
            </div>

            <div>
              <p style={{ fontSize:11, fontWeight:700, color:'rgba(240,236,228,0.3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:10 }}>Kategoritë e disponueshme</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:8 }}>
                {SPECIALTIES.filter(s => !specialtyList.includes(s)).map(s => (
                  <button key={s} className="sug" onClick={() => addSpec(s)}
                    style={{ padding:'10px 14px', borderRadius:10, background:'rgba(240,236,228,0.04)', border:'1px solid rgba(240,236,228,0.08)', color:'rgba(240,236,228,0.55)', fontFamily:'inherit', fontSize:12, fontWeight:600, cursor:'pointer', transition:'all 0.15s', textAlign:'left' }}>
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PREVIEW TAB ── */}
      {activeTab === 'preview' && (
        <div style={{ animation:'fadeUp 0.3s ease' }}>
          <div style={{ padding:'12px 16px', background:'rgba(251,191,36,0.05)', border:'1px solid rgba(251,191,36,0.15)', borderRadius:12, marginBottom:16, fontSize:12, color:'rgba(240,236,228,0.5)' }}>
            👁 Kështu shfaqeni tek klientët
          </div>
          <div style={{ padding:'28px', background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.1)', borderRadius:22 }}>
            <div style={{ display:'flex', gap:18, alignItems:'flex-start', marginBottom:20 }}>
              <div style={{ width:64, height:64, borderRadius:18, background:'linear-gradient(135deg,#e8621a,#ff7c35)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:24, color:'#fff', flexShrink:0, overflow:'hidden' }}>
                {avatar ? <img src={avatar} style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : (form.business_name||'K').slice(0,2).toUpperCase()}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4, flexWrap:'wrap' }}>
                  <h2 style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:'1.25rem', letterSpacing:'-0.02em' }}>{form.business_name || 'Emri i biznesit'}</h2>
                  {company.is_verified && <span style={{ fontSize:10, fontWeight:700, color:'#22d3a5', background:'rgba(34,211,165,0.1)', border:'1px solid rgba(34,211,165,0.2)', borderRadius:20, padding:'2px 10px' }}>✓ Verified</span>}
                </div>
                <div style={{ display:'flex', gap:12, fontSize:12, color:'rgba(240,236,228,0.4)', marginBottom:8 }}>
                  {form.city && <span>📍 {form.city}</span>}
                  {form.website && <span>🌐 {form.website.replace('https://','')}</span>}
                  {company.rating_avg > 0 && <span>⭐ {company.rating_avg.toFixed(1)}</span>}
                </div>
              </div>
              <div style={{ display:'flex', gap:20, flexShrink:0 }}>
                {[{l:'Ofertat',v:stats.totalOffers},{l:'Sukses',v:`${successRate}%`}].map((s,i)=>(
                  <div key={i} style={{ textAlign:'center' }}>
                    <div style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:'1.3rem', color:'#e8621a' }}>{s.v}</div>
                    <div style={{ fontSize:10, color:'rgba(240,236,228,0.35)' }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
            {form.description && <p style={{ fontSize:13, color:'rgba(240,236,228,0.55)', lineHeight:1.75, padding:'14px 16px', background:'rgba(240,236,228,0.03)', borderRadius:12, borderLeft:'3px solid rgba(232,98,26,0.3)', marginBottom:16 }}>{form.description}</p>}
            {specialtyList.length > 0 && (
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {specialtyList.map(s => (
                  <span key={s} style={{ fontSize:11, fontWeight:700, color:'#e8621a', background:'rgba(232,98,26,0.08)', border:'1px solid rgba(232,98,26,0.18)', borderRadius:7, padding:'4px 12px' }}>{s}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Save */}
      <div style={{ display:'flex', justifyContent:'flex-end', gap:12, alignItems:'center', marginTop:20, paddingTop:20, borderTop:'1px solid rgba(240,236,228,0.06)' }}>
        {dirty && <span style={{ fontSize:12, color:'rgba(240,236,228,0.35)' }}>● Ka ndryshime të paruajtura</span>}
        <button onClick={handleSave} disabled={saving||!dirty}
          style={{ padding:'12px 28px', borderRadius:13, background:dirty&&!saving?'linear-gradient(135deg,#e8621a,#ff7c35)':'rgba(240,236,228,0.07)', border:'none', color:dirty&&!saving?'#fff':'rgba(240,236,228,0.3)', fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:'0.95rem', cursor:dirty&&!saving?'pointer':'not-allowed', transition:'all 0.2s', display:'flex', alignItems:'center', gap:8, boxShadow:dirty&&!saving?'0 4px 16px rgba(232,98,26,0.25)':'none' }}>
          {saving ? (<><div style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid #fff', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>Duke ruajtur...</>) : 'Ruaj ndryshimet →'}
        </button>
      </div>
    </div>
  )
}