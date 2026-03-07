'use client'

import { useState } from 'react'
import ProfileShell from '@/components/ProfileShell'
import FormField    from '@/components/FormField'
import { useToast } from '@/components/Toast'
import Link         from 'next/link'

interface Profile { id:string; full_name:string; city:string; phone?:string; bio?:string; avatar_url?:string; package_type:string; created_at:string }
interface Stats   { applications:number; accepted:number }

const CITIES = ['Prishtinë','Prizren','Pejë','Gjakovë','Mitrovicë','Gjilan','Ferizaj','Vushtrri','Skenderaj','Lipjan','Podujevë','Klinë']

export default function ClientProfileClient({ profile, stats }: { profile:Profile; stats:Stats }) {
  const toast = useToast()

  const [form, setForm] = useState({
    full_name: profile.full_name || '',
    city:      profile.city      || '',
    phone:     profile.phone     || '',
    bio:       profile.bio       || '',
  })
  const [avatar,  setAvatar]  = useState(profile.avatar_url || '')
  const [saving,  setSaving]  = useState(false)
  const [focused, setFocused] = useState<string|null>(null)

  const set = (k: string) => (v: string) => setForm(f => ({ ...f, [k]: v }))

  const isDirty =
    form.full_name !== profile.full_name ||
    form.city      !== profile.city      ||
    form.phone     !== (profile.phone||'') ||
    form.bio       !== (profile.bio||'')

  async function handleSave() {
    if (!form.full_name.trim()) { toast.error('Gabim','Emri është i detyrueshëm.'); return }
    if (!form.city.trim())      { toast.error('Gabim','Qyteti është i detyrueshëm.'); return }
    setSaving(true)
    try {
      const res  = await fetch('/api/profile/update', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { toast.error('Gabim',data.error||'Provo sërish.'); return }
      toast.success('✓ Profili u ruajt!','Ndryshimet u ruajtën me sukses.')
    } catch { toast.error('Gabim','Problem me lidhjen.') }
    finally { setSaving(false) }
  }

  const isPremium = profile.package_type !== 'free'

  return (
    <div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.85)}}`}</style>

      <div style={{ marginBottom:28, animation:'fadeUp 0.5s ease' }}>
        <p style={{ fontSize:11,fontWeight:700,color:'rgba(240,236,228,0.3)',textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:8 }}>Llogaria</p>
        <h1 style={{ fontFamily:"'Fraunces',serif",fontSize:'clamp(1.4rem,3vw,1.9rem)',fontWeight:900,letterSpacing:'-0.03em',marginBottom:6 }}>Profili im</h1>
        <p style={{ fontSize:14,color:'rgba(240,236,228,0.45)' }}>Menaxho informacionin tënd personal</p>
      </div>

      {/* Premium banner */}
      {!isPremium&&(
        <div style={{ marginBottom:20,padding:'14px 20px',background:'rgba(232,98,26,0.06)',border:'1px solid rgba(232,98,26,0.15)',borderRadius:16,display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,animation:'fadeUp 0.5s ease 0.1s both' }}>
          <div style={{ display:'flex',alignItems:'center',gap:12 }}>
            <span style={{ fontSize:24 }}>💎</span>
            <div>
              <div style={{ fontSize:13,fontWeight:700,color:'#e8621a',marginBottom:2 }}>Upgrade në Premium</div>
              <div style={{ fontSize:12,color:'rgba(240,236,228,0.4)' }}>Aplikimet të pakufizuara + prioritet + analytics</div>
            </div>
          </div>
          <Link href="/pricing" style={{ padding:'8px 18px',borderRadius:10,background:'linear-gradient(135deg,#e8621a,#ff7c35)',color:'#fff',textDecoration:'none',fontSize:12,fontWeight:700,whiteSpace:'nowrap',boxShadow:'0 4px 12px rgba(232,98,26,0.3)' }}>
            Shiko planin →
          </Link>
        </div>
      )}

      <ProfileShell
        userId={profile.id} fullName={form.full_name||profile.full_name}
        city={form.city||profile.city} role="client"
        avatarUrl={avatar} joinedAt={profile.created_at}
        onAvatarUpdate={setAvatar}
        badge={isPremium ? { label:'💎 Premium', col:'#fbbf24' } : null}
        stats={[
          { label:'Aplikime',      val:stats.applications, icon:'📋', col:'#e8621a' },
          { label:'Të pranuara',   val:stats.accepted,     icon:'✅', col:'#22d3a5' },
          { label:'Paketa',        val:isPremium?'Premium':'Falas', icon:'💎', col:isPremium?'#fbbf24':'rgba(240,236,228,0.3)' },
        ]}>

        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Personal info */}
          <div style={{ background:'rgba(240,236,228,0.02)',border:'1px solid rgba(240,236,228,0.07)',borderRadius:18,padding:24 }}>
            <h2 style={{ fontFamily:"'Fraunces',serif",fontWeight:800,fontSize:'1.05rem',marginBottom:20,display:'flex',alignItems:'center',gap:10 }}>
              <span style={{ width:32,height:32,borderRadius:9,background:'rgba(96,165,250,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16 }}>👤</span>
              Informacioni personal
            </h2>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>
              <FormField label="Emri i plotë" name="full_name" value={form.full_name} onChange={set('full_name')} required placeholder="p.sh. Artan Krasniqi" focused={focused} onFocus={setFocused} onBlur={()=>setFocused(null)} />
              <div>
                <label style={{ fontSize:12,fontWeight:600,color:'rgba(240,236,228,0.5)',display:'block',marginBottom:6 }}>Qyteti</label>
                <select value={form.city} onChange={e=>set('city')(e.target.value)}
                  style={{ width:'100%',padding:'12px 14px',background:'rgba(240,236,228,0.04)',border:'1px solid rgba(240,236,228,0.09)',borderRadius:12,color:'#f0ece4',fontFamily:'inherit',fontSize:14,outline:'none',cursor:'pointer' }}>
                  <option value="">Zgjedh qytetin</option>
                  {CITIES.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <FormField label="Numri i telefonit" name="phone" value={form.phone} onChange={set('phone')} type="tel" placeholder="+383 44 123 456" hint="Vetëm për kompanitë e pranuara" focused={focused} onFocus={setFocused} onBlur={()=>setFocused(null)} />
            </div>
          </div>

          {/* Bio */}
          <div style={{ background:'rgba(240,236,228,0.02)',border:'1px solid rgba(240,236,228,0.07)',borderRadius:18,padding:24 }}>
            <h2 style={{ fontFamily:"'Fraunces',serif",fontWeight:800,fontSize:'1.05rem',marginBottom:20,display:'flex',alignItems:'center',gap:10 }}>
              <span style={{ width:32,height:32,borderRadius:9,background:'rgba(96,165,250,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16 }}>✍️</span>
              Rreth meje
            </h2>
            <FormField label="Bio" name="bio" value={form.bio} onChange={set('bio')} type="textarea" rows={4} placeholder="Shkruaj diçka rreth preferencave dhe stilit të jetesës — kjo ndihmon profesionistët të kuptojnë nevojat tuaja." hint={`${form.bio.length}/500 karaktere`} focused={focused} onFocus={setFocused} onBlur={()=>setFocused(null)} />
          </div>

          {/* Security */}
          <div style={{ background:'rgba(240,236,228,0.02)',border:'1px solid rgba(240,236,228,0.07)',borderRadius:18,padding:24 }}>
            <h2 style={{ fontFamily:"'Fraunces',serif",fontWeight:800,fontSize:'1.05rem',marginBottom:16,display:'flex',alignItems:'center',gap:10 }}>
              <span style={{ width:32,height:32,borderRadius:9,background:'rgba(96,165,250,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16 }}>🔒</span>
              Siguria
            </h2>
            <div style={{ padding:'14px 18px',background:'rgba(240,236,228,0.03)',border:'1px solid rgba(240,236,228,0.07)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'space-between',gap:12 }}>
              <div>
                <div style={{ fontWeight:600,fontSize:14,marginBottom:3 }}>Fjalëkalimi</div>
                <div style={{ fontSize:12,color:'rgba(240,236,228,0.4)' }}>Ndrysho fjalëkalimin e llogarisë tënde</div>
              </div>
              <Link href="/forgot-password" style={{ padding:'8px 16px',borderRadius:9,background:'rgba(240,236,228,0.06)',border:'1px solid rgba(240,236,228,0.1)',color:'rgba(240,236,228,0.7)',textDecoration:'none',fontSize:13,fontWeight:600,whiteSpace:'nowrap' }}>
                Ndrysho →
              </Link>
            </div>
          </div>

          {/* Save */}
          <div style={{ display:'flex',justifyContent:'flex-end',alignItems:'center',gap:10 }}>
            <button onClick={handleSave} disabled={saving||!isDirty}
              style={{ padding:'12px 28px',borderRadius:12,background:isDirty&&!saving?'linear-gradient(135deg,#e8621a,#ff7c35)':'rgba(240,236,228,0.07)',border:'none',color:isDirty&&!saving?'#fff':'rgba(240,236,228,0.35)',fontFamily:"'Fraunces',serif",fontWeight:800,fontSize:'0.95rem',cursor:isDirty&&!saving?'pointer':'not-allowed',transition:'all 0.2s',display:'flex',alignItems:'center',gap:8,boxShadow:isDirty&&!saving?'0 4px 16px rgba(232,98,26,0.25)':'none' }}>
              {saving?(<><div style={{ width:14,height:14,border:'2px solid rgba(255,255,255,0.3)',borderTop:'2px solid #fff',borderRadius:'50%',animation:'spin 0.8s linear infinite' }}/>Duke ruajtur...</>):'Ruaj ndryshimet →'}
            </button>
          </div>
        </div>
      </ProfileShell>
    </div>
  )
}