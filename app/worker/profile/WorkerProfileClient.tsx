'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import ProfileShell from '@/components/ProfileShell'
import FormField    from '@/components/FormField'
import { useToast } from '@/components/Toast'

interface Profile { id:string; full_name:string; city:string; phone?:string; bio?:string; avatar_url?:string; package_type:string; created_at:string }
interface Worker  { id:string; profession:string; bio:string|null; is_available:boolean; rating_avg:number; total_reviews:number; experience_years?:number; skills?:string[] }
interface Stats   { offers:number; accepted:number; reviews:number }

const PROFESSIONS = ['Murator','Elektricist','Hidraulik','Suvaçi','Bojaxhi','Parketist','Pllakues','Marangoz','Instalues kuzhinash','Fasadist','Klimatizim','Tjetër']
const CITIES      = ['Prishtinë','Prizren','Pejë','Gjakovë','Mitrovicë','Gjilan','Ferizaj','Vushtrri','Skenderaj','Lipjan','Podujevë','Klinë']

export default function WorkerProfileClient({ profile, worker, stats }: { profile:Profile; worker:Worker; stats:Stats }) {
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const toast    = useToast()

  const [form, setForm] = useState({
    full_name:        profile.full_name       || '',
    city:             profile.city            || '',
    phone:            profile.phone           || '',
    profession:       worker?.profession      || '',
    bio:              worker?.bio             || '',
    experience_years: worker?.experience_years?.toString() || '',
    skills:           (worker?.skills||[]).join(', '),
    is_available:     worker?.is_available ?? true,
  })
  const [avatar,  setAvatar]  = useState(profile.avatar_url || '')
  const [saving,  setSaving]  = useState(false)
  const [focused, setFocused] = useState<string|null>(null)

  const set = (k: string) => (v: string|boolean) => setForm(f => ({ ...f, [k]: v }))

  const isDirty =
    form.full_name !== profile.full_name ||
    form.city !== profile.city ||
    form.phone !== (profile.phone||'') ||
    form.profession !== (worker?.profession||'') ||
    form.bio !== (worker?.bio||'') ||
    form.experience_years !== (worker?.experience_years?.toString()||'') ||
    form.skills !== ((worker?.skills||[]).join(', ')) ||
    form.is_available !== (worker?.is_available??true)

  async function handleSave() {
    if (!form.full_name.trim()) { toast.error('Gabim','Emri është i detyrueshëm.'); return }
    if (!form.city.trim())      { toast.error('Gabim','Qyteti është i detyrueshëm.'); return }
    setSaving(true)
    try {
      const [pRes, wRes] = await Promise.all([
        fetch('/api/profile/update', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ full_name:form.full_name, city:form.city, phone:form.phone }),
        }),
        supabase.from('workers').update({
          profession:      form.profession,
          bio:             form.bio,
          experience_years:form.experience_years ? parseInt(form.experience_years) : null,
          skills:          form.skills.split(',').map(s=>s.trim()).filter(Boolean),
          is_available:    form.is_available,
        }).eq('profile_id', profile.id),
      ])
      if (!pRes.ok) { const d=await pRes.json(); toast.error('Gabim',d.error||'Provo sërish.'); return }
      toast.success('✓ Profili u ruajt!','Të dhënat u përditësuan me sukses.')
    } catch { toast.error('Gabim','Problem me lidhjen.') }
    finally { setSaving(false) }
  }

  return (
    <div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div style={{ marginBottom:28 }}>
        <p style={{ fontSize:11,fontWeight:700,color:'rgba(240,236,228,0.3)',textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:8 }}>Llogaria</p>
        <h1 style={{ fontFamily:"'Fraunces',serif",fontSize:'clamp(1.4rem,3vw,1.9rem)',fontWeight:900,letterSpacing:'-0.03em',marginBottom:6 }}>Profili im</h1>
        <p style={{ fontSize:14,color:'rgba(240,236,228,0.45)' }}>Ndërtoji reputacionin tënd profesional</p>
      </div>

      <ProfileShell
        userId={profile.id} fullName={form.full_name||profile.full_name}
        city={form.city||profile.city} role="worker"
        avatarUrl={avatar} joinedAt={profile.created_at}
        onAvatarUpdate={setAvatar}
        badge={profile.package_type!=='free'?{label:'💎 Premium',col:'#fbbf24'}:null}
        stats={[
          { label:'Oferta dërguar', val:stats.offers,   icon:'💼', col:'#3b82f6' },
          { label:'Të pranuara',    val:stats.accepted,  icon:'✅', col:'#22d3a5' },
          { label:'Vlerësimet',     val:stats.reviews,   icon:'⭐', col:'#fbbf24' },
          { label:'Vlerësimi',      val:worker?.rating_avg>0?`${worker.rating_avg.toFixed(1)}★`:'—', icon:'📊', col:'#a78bfa' },
        ]}>

        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Availability toggle */}
          <div style={{ background:'rgba(240,236,228,0.02)', border:`1px solid ${form.is_available?'rgba(16,185,129,0.2)':'rgba(240,236,228,0.07)'}`, borderRadius:18, padding:20, display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
            <div>
              <div style={{ fontSize:14,fontWeight:700,marginBottom:4,display:'flex',alignItems:'center',gap:8 }}>
                <div style={{ width:8,height:8,borderRadius:'50%',background:form.is_available?'#10b981':'rgba(240,236,228,0.2)',boxShadow:form.is_available?'0 0 8px rgba(16,185,129,0.8)':'none' }}/>
                {form.is_available ? 'I disponueshëm' : 'Jo aktiv'}
              </div>
              <div style={{ fontSize:12,color:'rgba(240,236,228,0.4)',lineHeight:1.5 }}>
                {form.is_available ? 'Klientët mund të shohin profilin tënd' : 'Nuk do shfaqesh në kërkim'}
              </div>
            </div>
            <button onClick={()=>set('is_available')(!form.is_available)}
              style={{ width:52,height:28,borderRadius:20,border:'none',cursor:'pointer',transition:'all 0.25s',background:form.is_available?'#10b981':'rgba(240,236,228,0.12)',position:'relative',flexShrink:0 }}>
              <div style={{ position:'absolute',top:3,left:form.is_available?26:3,width:22,height:22,borderRadius:'50%',background:'#fff',transition:'left 0.25s',boxShadow:'0 1px 4px rgba(0,0,0,0.3)' }}/>
            </button>
          </div>

          {/* Personal info */}
          <div style={{ background:'rgba(240,236,228,0.02)',border:'1px solid rgba(240,236,228,0.07)',borderRadius:18,padding:24 }}>
            <h2 style={{ fontFamily:"'Fraunces',serif",fontWeight:800,fontSize:'1.05rem',marginBottom:20,display:'flex',alignItems:'center',gap:10 }}>
              <span style={{ width:32,height:32,borderRadius:9,background:'rgba(59,130,246,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16 }}>👤</span>
              Informacioni personal
            </h2>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>
              <FormField label="Emri i plotë" name="full_name" value={form.full_name} onChange={set('full_name') as any} required focused={focused} onFocus={setFocused} onBlur={()=>setFocused(null)} />
              <div>
                <label style={{ fontSize:12,fontWeight:600,color:'rgba(240,236,228,0.5)',display:'block',marginBottom:6 }}>Qyteti</label>
                <select value={form.city} onChange={e=>set('city')(e.target.value)}
                  style={{ width:'100%',padding:'12px 14px',background:'rgba(240,236,228,0.04)',border:'1px solid rgba(240,236,228,0.09)',borderRadius:12,color:'#f0ece4',fontFamily:'inherit',fontSize:14,outline:'none',cursor:'pointer' }}>
                  <option value="">Zgjedh qytetin</option>
                  {CITIES.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <FormField label="Telefoni" name="phone" type="tel" value={form.phone} onChange={set('phone') as any} placeholder="+383 44 123 456" focused={focused} onFocus={setFocused} onBlur={()=>setFocused(null)} />
              <div>
                <label style={{ fontSize:12,fontWeight:600,color:'rgba(240,236,228,0.5)',display:'block',marginBottom:6 }}>Profesioni</label>
                <select value={form.profession} onChange={e=>set('profession')(e.target.value)}
                  style={{ width:'100%',padding:'12px 14px',background:'rgba(240,236,228,0.04)',border:'1px solid rgba(240,236,228,0.09)',borderRadius:12,color:'#f0ece4',fontFamily:'inherit',fontSize:14,outline:'none',cursor:'pointer' }}>
                  <option value="">Zgjedh profesionin</option>
                  {PROFESSIONS.map(p=><option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <FormField label="Vite eksperiencë" name="experience_years" type="number" value={form.experience_years} onChange={set('experience_years') as any} placeholder="p.sh. 5" hint="Vite punë në fushën tënde" focused={focused} onFocus={setFocused} onBlur={()=>setFocused(null)} />
            </div>
          </div>

          {/* Skills + Bio */}
          <div style={{ background:'rgba(240,236,228,0.02)',border:'1px solid rgba(240,236,228,0.07)',borderRadius:18,padding:24 }}>
            <h2 style={{ fontFamily:"'Fraunces',serif",fontWeight:800,fontSize:'1.05rem',marginBottom:20,display:'flex',alignItems:'center',gap:10 }}>
              <span style={{ width:32,height:32,borderRadius:9,background:'rgba(59,130,246,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16 }}>🛠️</span>
              Aftësitë & Bio
            </h2>
            <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
              <FormField label="Aftësitë (të ndara me presje)" name="skills" value={form.skills} onChange={set('skills') as any} placeholder="p.sh. Muratim, Betonim, Pllakosje, Izolim" hint="Listoni aftësitë kryesore — do të shfaqen në profilin tuaj" focused={focused} onFocus={setFocused} onBlur={()=>setFocused(null)} />

              {/* Skills preview */}
              {form.skills&&(
                <div style={{ display:'flex',gap:6,flexWrap:'wrap' }}>
                  {form.skills.split(',').map(s=>s.trim()).filter(Boolean).map((s,i)=>(
                    <span key={i} style={{ fontSize:11,fontWeight:700,color:'#3b82f6',background:'rgba(59,130,246,0.1)',border:'1px solid rgba(59,130,246,0.2)',borderRadius:7,padding:'3px 10px' }}>{s}</span>
                  ))}
                </div>
              )}

              <FormField label="Bio profesionale" name="bio" value={form.bio} onChange={set('bio') as any} type="textarea" rows={4} placeholder="Shkruaj rreth eksperiencës, projekteve të kryera dhe çfarë të bën të veçantë..." hint={`${form.bio.length}/600 karaktere`} focused={focused} onFocus={setFocused} onBlur={()=>setFocused(null)} />
            </div>
          </div>

          {/* Save */}
          <div style={{ display:'flex',justifyContent:'flex-end',gap:10,alignItems:'center' }}>
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