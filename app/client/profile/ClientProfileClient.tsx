'use client'

import { useState, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import ProfileShell from '@/components/ProfileShell'
import FormField    from '@/components/FormField'
import { useToast } from '@/components/Toast'

interface Profile { id:string; full_name:string; city:string; phone?:string; bio?:string; avatar_url?:string; package_type:string; created_at:string }
interface Stats   { totalApplications:number; acceptedApplications:number; totalOffers:number }

const CITIES = ['Prishtinë','Prizren','Pejë','Gjakovë','Mitrovicë','Gjilan','Ferizaj','Vushtrri','Skenderaj','Lipjan','Podujevë','Klinë']

export default function ClientProfileClient({ profile, stats }: { profile:Profile; stats:Stats }) {
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const toast    = useToast()
  const fileRef  = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    full_name: profile.full_name || '',
    city:      profile.city      || '',
    phone:     profile.phone     || '',
    bio:       profile.bio       || '',
  })
  const [avatar,  setAvatar]  = useState(profile.avatar_url || '')
  const [focused, setFocused] = useState<string|null>(null)
  const [saving,  setSaving]  = useState(false)
  const [dirty,   setDirty]   = useState(false)

  function set<K extends keyof typeof form>(key: K) {
    return (val: typeof form[K]) => { setForm(p=>({...p,[key]:val})); setDirty(true) }
  }

  const completion = [
    { done:!!form.full_name,           label:'Emri i plotë' },
    { done:!!form.city,                label:'Qyteti' },
    { done:!!form.phone,               label:'Telefoni' },
    { done:!!form.bio&&form.bio.length>20, label:'Prezantimi' },
    { done:!!avatar,                   label:'Foto profili' },
  ]
  const completionPct = Math.round((completion.filter(c=>c.done).length / completion.length) * 100)
  const memberSince   = new Date(profile.created_at).toLocaleDateString('sq-AL', { month:'long', year:'numeric' })

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 3_000_000) { toast.error('Skedari shumë i madh', 'Max 3MB'); return }
    try {
      const ext  = file.name.split('.').pop()
      const path = `avatars/${profile.id}.${ext}`
      await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', profile.id)
      setAvatar(data.publicUrl + '?t=' + Date.now())
      toast.success('Foto u ndryshua! 📸')
    } catch { toast.error('Gabim', 'Provo sërish.') }
  }

  async function handleSave() {
    if (!form.full_name.trim()) { toast.error('Emri është i detyrueshëm'); return }
    setSaving(true)
    try {
      const { error } = await supabase.from('profiles').update({ full_name:form.full_name.trim(), city:form.city, phone:form.phone||null, bio:form.bio||null }).eq('id', profile.id)
      if (error) throw error
      toast.success('Profili u ruajt! ✓')
      setDirty(false)
    } catch { toast.error('Gabim', 'Provo sërish.') }
    finally   { setSaving(false) }
  }

  return (
    <div>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
      `}</style>

      <ProfileShell
        name={form.full_name || profile.full_name}
        subtitle={`Klient · anëtar që ${memberSince}`}
        city={form.city}
        avatar={avatar}
        onAvatarClick={() => fileRef.current?.click()}
        badge={profile.package_type==='premium' ? { label:'💎 Premium', color:'#a78bfa' } : { label:'Plan Falas', color:'rgba(240,236,228,0.4)' }}
        stats={[
          { label:'Aplikimet',  value:stats.totalApplications },
          { label:'Pranuar',    value:stats.acceptedApplications },
          { label:'Ofertat',    value:stats.totalOffers },
        ]}
      />

      <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display:'none' }}/>

      {/* Completion bar */}
      <div style={{ marginBottom:24, padding:'16px 20px', background:'rgba(240,236,228,0.02)', border:`1px solid ${completionPct===100?'rgba(34,211,165,0.2)':'rgba(240,236,228,0.08)'}`, borderRadius:16, animation:'fadeUp 0.4s ease 0.05s both' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <span style={{ fontSize:13, fontWeight:700 }}>Plotësia e profilit <span style={{ color:completionPct===100?'#22d3a5':completionPct>60?'#fbbf24':'#f87171' }}>{completionPct}%</span></span>
          {completionPct<100 && <span style={{ fontSize:11, color:'rgba(240,236,228,0.4)' }}>Profili i plotë rrit besimin tek profesionistët</span>}
        </div>
        <div style={{ height:5, background:'rgba(240,236,228,0.08)', borderRadius:10, overflow:'hidden', marginBottom:10 }}>
          <div style={{ height:'100%', width:`${completionPct}%`, background:completionPct===100?'linear-gradient(90deg,#22d3a5,#10b981)':completionPct>60?'linear-gradient(90deg,#fbbf24,#f59e0b)':'linear-gradient(90deg,#f87171,#ef4444)', borderRadius:10, transition:'width 1s ease' }}/>
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {completion.map((item,i) => (
            <span key={i} style={{ fontSize:10, fontWeight:700, color:item.done?'#22d3a5':'rgba(240,236,228,0.35)', background:item.done?'rgba(34,211,165,0.06)':'rgba(240,236,228,0.03)', border:`1px solid ${item.done?'rgba(34,211,165,0.15)':'rgba(240,236,228,0.08)'}`, borderRadius:6, padding:'3px 9px' }}>
              {item.done?'✓ ':''}{item.label}
            </span>
          ))}
        </div>
      </div>

      {/* Form */}
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

        <div style={{ background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:16, padding:'20px 22px', animation:'fadeUp 0.4s ease 0.1s both' }}>
          <h2 style={{ fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:'1rem', marginBottom:18, display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ width:30, height:30, borderRadius:9, background:'rgba(59,130,246,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>👤</span>
            Informacioni personal
          </h2>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <FormField label="Emri i plotë" name="full_name" value={form.full_name} onChange={set('full_name') as any} required focused={focused} onFocus={setFocused} onBlur={()=>setFocused(null)} />
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:'rgba(240,236,228,0.5)', display:'block', marginBottom:6 }}>Qyteti</label>
              <select value={form.city} onChange={e => { set('city')(e.target.value); setDirty(true) }}
                style={{ width:'100%', padding:'12px 14px', background:'rgba(240,236,228,0.04)', border:'1px solid rgba(240,236,228,0.09)', borderRadius:12, color:'#f0ece4', fontFamily:'inherit', fontSize:14, outline:'none', cursor:'pointer' }}>
                <option value="">Zgjedh qytetin</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ gridColumn:'1/-1' }}>
              <FormField label="Telefoni (opsional)" name="phone" type="tel" value={form.phone||''} onChange={set('phone') as any} placeholder="+383 44 123 456" focused={focused} onFocus={setFocused} onBlur={()=>setFocused(null)} />
            </div>
          </div>
        </div>

        <div style={{ background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:16, padding:'20px 22px', animation:'fadeUp 0.4s ease 0.15s both' }}>
          <h2 style={{ fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:'1rem', marginBottom:18, display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ width:30, height:30, borderRadius:9, background:'rgba(96,165,250,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>📝</span>
            Prezantimi (opsional)
          </h2>
          <FormField label="Disa fjalë për veten" name="bio" value={form.bio||''} onChange={set('bio') as any} type="textarea" rows={4} placeholder="Përshkruajeni shkurt kush jeni dhe çfarë lloj projektesh jeni duke kërkuar..." hint={`${(form.bio||'').length}/400 karaktere`} focused={focused} onFocus={setFocused} onBlur={()=>setFocused(null)} />
        </div>

        {/* Account info card */}
        <div style={{ background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:16, padding:'18px 22px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:14, animation:'fadeUp 0.4s ease 0.2s both' }}>
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:'rgba(240,236,228,0.4)', marginBottom:4 }}>Anëtarë që</div>
            <div style={{ fontSize:14, fontWeight:700 }}>{memberSince}</div>
          </div>
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:'rgba(240,236,228,0.4)', marginBottom:4 }}>Paketa</div>
            <span style={{ fontSize:13, fontWeight:700, color:profile.package_type==='premium'?'#a78bfa':'rgba(240,236,228,0.5)', background:profile.package_type==='premium'?'rgba(167,139,250,0.1)':'transparent', padding:profile.package_type==='premium'?'3px 10px':0, borderRadius:7 }}>
              {profile.package_type==='premium'?'💎 Premium':'Plan Falas'}
            </span>
          </div>
          <a href="/pricing" style={{ fontSize:12, color:'#e8621a', fontWeight:700, textDecoration:'none', padding:'8px 16px', border:'1px solid rgba(232,98,26,0.3)', borderRadius:9, background:'rgba(232,98,26,0.06)', transition:'all 0.2s' }}>
            {profile.package_type==='premium'?'Menaxho paketën':'🚀 Kalo Premium →'}
          </a>
        </div>
      </div>

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