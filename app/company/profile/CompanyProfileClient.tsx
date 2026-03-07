'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import ProfileShell from '@/components/ProfileShell'
import FormField    from '@/components/FormField'
import { useToast } from '@/components/Toast'

interface Profile { id:string; full_name:string; city:string; phone?:string; avatar_url?:string; package_type:string; created_at:string }
interface Company { id:string; business_name:string; description:string|null; website:string|null; is_verified:boolean; rating_avg:number; total_reviews:number; founded_year?:number; employee_count?:string }
interface Stats   { offers:number; accepted:number; applications:number }

const CITIES = ['Prishtinë','Prizren','Pejë','Gjakovë','Mitrovicë','Gjilan','Ferizaj','Vushtrri','Skenderaj','Lipjan','Podujevë','Klinë']
const SIZES   = ['1-5','6-20','21-50','51-100','100+']

export default function CompanyProfileClient({ profile, company, stats }: { profile:Profile; company:Company; stats:Stats }) {
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const toast    = useToast()

  const [form, setForm] = useState({
    full_name:      profile.full_name       || '',
    city:           profile.city            || '',
    phone:          profile.phone           || '',
    business_name:  company?.business_name  || '',
    description:    company?.description    || '',
    website:        company?.website        || '',
    founded_year:   company?.founded_year?.toString()  || '',
    employee_count: company?.employee_count || '',
  })
  const [avatar,  setAvatar]  = useState(profile.avatar_url || '')
  const [saving,  setSaving]  = useState(false)
  const [focused, setFocused] = useState<string|null>(null)

  const set = (k: string) => (v: string) => setForm(f => ({ ...f, [k]: v }))

  const isDirty =
    form.full_name     !== profile.full_name      ||
    form.city          !== profile.city           ||
    form.phone         !== (profile.phone||'')    ||
    form.business_name !== company?.business_name ||
    form.description   !== (company?.description||'') ||
    form.website       !== (company?.website||'') ||
    form.founded_year  !== (company?.founded_year?.toString()||'') ||
    form.employee_count !== (company?.employee_count||'')

  async function handleSave() {
    if (!form.business_name.trim()) { toast.error('Gabim','Emri i biznesit është i detyrueshëm.'); return }
    if (!form.city.trim())          { toast.error('Gabim','Qyteti është i detyrueshëm.'); return }
    setSaving(true)
    try {
      const [pRes] = await Promise.all([
        fetch('/api/profile/update', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ full_name:form.full_name, city:form.city, phone:form.phone }),
        }),
        supabase.from('companies').update({
          business_name:  form.business_name,
          description:    form.description,
          website:        form.website||null,
          founded_year:   form.founded_year ? parseInt(form.founded_year) : null,
          employee_count: form.employee_count||null,
        }).eq('profile_id', profile.id),
      ])
      if (!pRes.ok) { const d=await pRes.json(); toast.error('Gabim',d.error||'Provo sërish.'); return }
      toast.success('✓ Profili u ruajt!','Informacionet e kompanisë u përditësuan.')
    } catch { toast.error('Gabim','Problem me lidhjen.') }
    finally { setSaving(false) }
  }

  const acceptRate = stats.offers>0 ? Math.round((stats.accepted/stats.offers)*100) : 0

  return (
    <div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div style={{ marginBottom:28 }}>
        <p style={{ fontSize:11,fontWeight:700,color:'rgba(240,236,228,0.3)',textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:8 }}>Biznesi</p>
        <h1 style={{ fontFamily:"'Fraunces',serif",fontSize:'clamp(1.4rem,3vw,1.9rem)',fontWeight:900,letterSpacing:'-0.03em',marginBottom:6 }}>Profili i kompanisë</h1>
        <p style={{ fontSize:14,color:'rgba(240,236,228,0.45)' }}>Menaxho profilin dhe informacionet e biznesit tënd</p>
      </div>

      {/* Verification banner */}
      {!company?.is_verified&&(
        <div style={{ marginBottom:20,padding:'14px 20px',background:'rgba(251,191,36,0.06)',border:'1px solid rgba(251,191,36,0.2)',borderRadius:16,display:'flex',alignItems:'center',gap:12,animation:'fadeUp 0.4s ease' }}>
          <div style={{ width:10,height:10,borderRadius:'50%',background:'#fbbf24',boxShadow:'0 0 10px rgba(251,191,36,0.6)',flexShrink:0,animation:'pulse 2s infinite' }}/>
          <div>
            <div style={{ fontSize:13,fontWeight:700,color:'#fbbf24',marginBottom:2 }}>Kompania nuk është verifikuar ende</div>
            <div style={{ fontSize:12,color:'rgba(240,236,228,0.4)',lineHeight:1.5 }}>Administratori do ta verifikojë brenda 24 orësh. Pas verifikimit mund të dërgoni oferta.</div>
          </div>
          {company?.is_verified&&<span style={{ marginLeft:'auto',fontSize:18 }}>✅</span>}
        </div>
      )}

      {company?.is_verified&&(
        <div style={{ marginBottom:20,padding:'12px 20px',background:'rgba(34,211,165,0.05)',border:'1px solid rgba(34,211,165,0.2)',borderRadius:16,display:'flex',alignItems:'center',gap:10,animation:'fadeUp 0.4s ease' }}>
          <span style={{ fontSize:18 }}>✅</span>
          <div style={{ fontSize:13,fontWeight:700,color:'#22d3a5' }}>Kompani e verifikuar nga NdreqeShpin</div>
        </div>
      )}

      <ProfileShell
        userId={profile.id} fullName={form.business_name||form.full_name}
        city={form.city||profile.city} role="company"
        avatarUrl={avatar} joinedAt={profile.created_at}
        onAvatarUpdate={setAvatar}
        badge={company?.is_verified ? { label:'✓ Verified', col:'#22d3a5' } : profile.package_type!=='free' ? { label:'💎 Premium', col:'#fbbf24' } : null}
        stats={[
          { label:'Oferta dërguar',  val:stats.offers,    icon:'💼', col:'#e8621a' },
          { label:'Të pranuara',     val:stats.accepted,  icon:'✅', col:'#22d3a5' },
          { label:'Sukses rate',     val:`${acceptRate}%`,icon:'🎯', col:'#3b82f6' },
          { label:'Vlerësimet',      val:company?.rating_avg>0?`${company.rating_avg.toFixed(1)}★`:'—', icon:'⭐', col:'#fbbf24' },
        ]}>

        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Business Info */}
          <div style={{ background:'rgba(240,236,228,0.02)',border:'1px solid rgba(240,236,228,0.07)',borderRadius:18,padding:24 }}>
            <h2 style={{ fontFamily:"'Fraunces',serif",fontWeight:800,fontSize:'1.05rem',marginBottom:20,display:'flex',alignItems:'center',gap:10 }}>
              <span style={{ width:32,height:32,borderRadius:9,background:'rgba(232,98,26,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16 }}>🏢</span>
              Informacioni i biznesit
            </h2>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>
              <FormField label="Emri i biznesit" name="business_name" value={form.business_name} onChange={set('business_name')} required placeholder="p.sh. KonstrukSh sh.p.k" focused={focused} onFocus={setFocused} onBlur={()=>setFocused(null)} />
              <div>
                <label style={{ fontSize:12,fontWeight:600,color:'rgba(240,236,228,0.5)',display:'block',marginBottom:6 }}>Qyteti</label>
                <select value={form.city} onChange={e=>set('city')(e.target.value)}
                  style={{ width:'100%',padding:'12px 14px',background:'rgba(240,236,228,0.04)',border:'1px solid rgba(240,236,228,0.09)',borderRadius:12,color:'#f0ece4',fontFamily:'inherit',fontSize:14,outline:'none',cursor:'pointer' }}>
                  <option value="">Zgjedh qytetin</option>
                  {CITIES.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <FormField label="Kontakt / Emri" name="full_name" value={form.full_name} onChange={set('full_name')} placeholder="Personi kontaktues" focused={focused} onFocus={setFocused} onBlur={()=>setFocused(null)} />
              <FormField label="Telefoni" name="phone" type="tel" value={form.phone} onChange={set('phone')} placeholder="+383 44 123 456" focused={focused} onFocus={setFocused} onBlur={()=>setFocused(null)} />
              <FormField label="Website" name="website" value={form.website} onChange={set('website')} placeholder="https://kompania.com" hint="Opsionale — URL e plotë" focused={focused} onFocus={setFocused} onBlur={()=>setFocused(null)} />
              <FormField label="Viti i themelimit" name="founded_year" type="number" value={form.founded_year} onChange={set('founded_year')} placeholder="p.sh. 2015" focused={focused} onFocus={setFocused} onBlur={()=>setFocused(null)} />
              <div>
                <label style={{ fontSize:12,fontWeight:600,color:'rgba(240,236,228,0.5)',display:'block',marginBottom:6 }}>Nr. punonjësish</label>
                <select value={form.employee_count} onChange={e=>set('employee_count')(e.target.value)}
                  style={{ width:'100%',padding:'12px 14px',background:'rgba(240,236,228,0.04)',border:'1px solid rgba(240,236,228,0.09)',borderRadius:12,color:'#f0ece4',fontFamily:'inherit',fontSize:14,outline:'none',cursor:'pointer' }}>
                  <option value="">Zgjedh madhësinë</option>
                  {SIZES.map(s=><option key={s} value={s}>{s} punonjës</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ background:'rgba(240,236,228,0.02)',border:'1px solid rgba(240,236,228,0.07)',borderRadius:18,padding:24 }}>
            <h2 style={{ fontFamily:"'Fraunces',serif",fontWeight:800,fontSize:'1.05rem',marginBottom:20,display:'flex',alignItems:'center',gap:10 }}>
              <span style={{ width:32,height:32,borderRadius:9,background:'rgba(232,98,26,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16 }}>✍️</span>
              Rreth kompanisë
            </h2>
            <FormField label="Përshkrimi i kompanisë" name="description" value={form.description} onChange={set('description')} type="textarea" rows={5} placeholder="Përshkruaj shërbimet, eksperiencën dhe çfarë e bën kompaninë tuaj unike. Ky tekst shfaqet në profilin publik." hint={`${form.description.length}/800 karaktere`} focused={focused} onFocus={setFocused} onBlur={()=>setFocused(null)} />
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