'use client'

import { useState, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import ProfileShell from '@/components/ProfileShell'
import FormField    from '@/components/FormField'
import { useToast } from '@/components/Toast'

interface Profile { id:string; full_name:string; city:string; phone?:string; bio?:string; avatar_url?:string; package_type:string; created_at:string }
interface Worker  { id:string; profession:string; bio:string|null; is_available:boolean; rating_avg:number; total_reviews:number; experience_years?:number; skills?:string[] }
interface Stats   { totalOffers:number; acceptedOffers:number; reviews?:number }

const PROFESSIONS = ['Murator','Elektricist','Hidraulik','Suvaçi','Bojaxhi','Parketist','Pllakues','Marangoz','Instalues kuzhinash','Fasadist','Klimatizim','Tjetër']
const CITIES      = ['Prishtinë','Prizren','Pejë','Gjakovë','Mitrovicë','Gjilan','Ferizaj','Vushtrri','Skenderaj','Lipjan','Podujevë','Klinë']

const ALL_SKILLS = ['Muratim','Betonim','Suvatim','Pllakosje','Parketim','Bojaxhillëk','Hidraulikë','Elektricitet','Klimatizim','Izolim termi','Fasadë','Gipsi','Alumin & PVC','Marangozi','Skulpturë druri']

function completionPct(form: any, worker: any): { pct: number; items: {done:boolean;label:string}[] } {
  const items = [
    { done: !!form.full_name,        label: 'Emri i plotë' },
    { done: !!form.city,             label: 'Qyteti' },
    { done: !!form.phone,            label: 'Numri i telefonit' },
    { done: !!form.profession,       label: 'Profesioni' },
    { done: !!form.bio && form.bio.length > 40, label: 'Bio (min 40 karaktere)' },
    { done: form.skills.split(',').filter((s:string)=>s.trim()).length >= 3, label: 'Min 3 aftësi' },
    { done: !!form.experience_years, label: 'Vite eksperience' },
  ]
  const done = items.filter(i => i.done).length
  return { pct: Math.round((done / items.length) * 100), items }
}

export default function WorkerProfileClient({ profile, worker, stats }: { profile:Profile; worker:Worker|null; stats:Stats }) {
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const toast    = useToast()
  const fileRef  = useRef<HTMLInputElement>(null)

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
  const [avatar,      setAvatar]      = useState(profile.avatar_url || '')
  const [focused,     setFocused]     = useState<string|null>(null)
  const [saving,      setSaving]      = useState(false)
  const [uploading,   setUploading]   = useState(false)
  const [dirty,       setDirty]       = useState(false)
  const [activeTab,   setActiveTab]   = useState<'info'|'skills'|'preview'>('info')
  const [skillInput,  setSkillInput]  = useState('')

  function set<K extends keyof typeof form>(key: K) {
    return (val: typeof form[K]) => { setForm(p => ({...p, [key]: val})); setDirty(true) }
  }

  const completion = completionPct(form, worker)
  const successRate = stats.totalOffers > 0 ? Math.round((stats.acceptedOffers/stats.totalOffers)*100) : 0
  const skillsList  = form.skills.split(',').map(s=>s.trim()).filter(Boolean)

  function addSkill(s: string) {
    const t = s.trim()
    if (!t || skillsList.includes(t)) return
    set('skills')([...skillsList, t].join(', '))
    setSkillInput('')
  }
  function removeSkill(s: string) {
    set('skills')(skillsList.filter(x => x !== s).join(', '))
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 3_000_000) { toast.error('Skedari shumë i madh','Max 3MB'); return }
    setUploading(true)
    try {
      const ext  = file.name.split('.').pop()
      const path = `avatars/${profile.id}.${ext}`
      const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      if (error) throw error
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', profile.id)
      setAvatar(data.publicUrl + '?t=' + Date.now())
      toast.success('Foto u ndryshua! 📸')
    } catch { toast.error('Gabim', 'Foto nuk u ngarku') }
    finally   { setUploading(false) }
  }

  async function handleSave() {
    if (!form.full_name.trim()) { toast.error('Emri është i detyrueshëm'); return }
    setSaving(true)
    try {
      const skills = skillsList
      const [profRes, workerRes] = await Promise.all([
        supabase.from('profiles').update({ full_name:form.full_name.trim(), city:form.city, phone:form.phone||null, bio:form.bio||null }).eq('id', profile.id),
        worker?.id ? supabase.from('workers').update({ profession:form.profession, bio:form.bio||null, experience_years:form.experience_years?Number(form.experience_years):null, skills, is_available:form.is_available }).eq('id', worker.id) : Promise.resolve({ error: null }),
      ])
      if (profRes.error || (workerRes as any).error) throw new Error('DB error')
      toast.success('Profili u ruajt! ✓', 'Ndryshimet u aplikuan.')
      setDirty(false)
    } catch { toast.error('Gabim', 'Provo sërish.') }
    finally   { setSaving(false) }
  }

  const TABS = [
    { id:'info',    label:'Informacioni', icon:'👤' },
    { id:'skills',  label:'Aftësitë',     icon:'🛠' },
    { id:'preview', label:'Preview',      icon:'👁' },
  ]

  return (
    <div>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes fill   { from{width:0} to{width:var(--target-width)} }
        .skill-chip:hover .remove-skill { opacity:1!important; }
        .suggestion:hover { background:rgba(240,236,228,0.08)!important; color:#f0ece4!important; }
        .tab-btn:hover    { color:rgba(240,236,228,0.8)!important; }
      `}</style>

      <ProfileShell
        name={form.full_name || profile.full_name}
        subtitle={form.profession || 'Punëtor'}
        city={form.city}
        avatar={avatar}
        onAvatarClick={() => fileRef.current?.click()}
        rating={worker?.rating_avg}
        reviewCount={worker?.total_reviews}
        isVerified={false}
        badge={form.is_available ? { label:'Disponueshëm', color:'#10b981' } : { label:'Jo aktiv', color:'#64748b' }}
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
          {completion.pct<100 && (
            <span style={{ fontSize:11, color:'rgba(240,236,228,0.4)' }}>
              {completion.items.filter(i=>!i.done).length} gjë ende mangut
            </span>
          )}
        </div>
        <div style={{ height:6, background:'rgba(240,236,228,0.08)', borderRadius:10, overflow:'hidden', marginBottom:10 }}>
          <div style={{ height:'100%', width:`${completion.pct}%`, background:completion.pct===100?'linear-gradient(90deg,#22d3a5,#10b981)':completion.pct>60?'linear-gradient(90deg,#fbbf24,#f59e0b)':'linear-gradient(90deg,#f87171,#ef4444)', borderRadius:10, transition:'width 1s ease' }}/>
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {completion.items.map((item,i) => (
            <span key={i} style={{ fontSize:10, fontWeight:700, color:item.done?'#22d3a5':'rgba(240,236,228,0.35)', background:item.done?'rgba(34,211,165,0.06)':'rgba(240,236,228,0.03)', border:`1px solid ${item.done?'rgba(34,211,165,0.15)':'rgba(240,236,228,0.08)'}`, borderRadius:6, padding:'3px 9px', display:'flex', alignItems:'center', gap:4 }}>
              {item.done?'✓':''} {item.label}
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

          {/* Availability */}
          <div style={{ padding:'18px 20px', background:'rgba(240,236,228,0.02)', border:`1px solid ${form.is_available?'rgba(16,185,129,0.2)':'rgba(240,236,228,0.08)'}`, borderRadius:16, display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
            <div>
              <div style={{ fontSize:14, fontWeight:700, marginBottom:4, display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:form.is_available?'#10b981':'rgba(240,236,228,0.2)', boxShadow:form.is_available?'0 0 8px rgba(16,185,129,0.7)':'none', flexShrink:0 }}/>
                {form.is_available ? '✅ Disponueshëm për punë' : '🔴 Jo aktiv momentalisht'}
              </div>
              <div style={{ fontSize:12, color:'rgba(240,236,228,0.4)', lineHeight:1.5 }}>
                {form.is_available ? 'Klientët mund të shohin profilin tënd dhe të dërgojnë oferta.' : 'Nuk do të shfaqesh në kërkim. Ndrysho kur të jesh gati.'}
              </div>
            </div>
            <button onClick={() => { set('is_available')(!form.is_available); setDirty(true) }}
              style={{ width:52, height:28, borderRadius:20, border:'none', cursor:'pointer', transition:'all 0.25s', background:form.is_available?'#10b981':'rgba(240,236,228,0.12)', position:'relative', flexShrink:0, boxShadow:form.is_available?'0 0 12px rgba(16,185,129,0.35)':'none' }}>
              <div style={{ position:'absolute', top:3, left:form.is_available?26:3, width:22, height:22, borderRadius:'50%', background:'#fff', transition:'left 0.25s', boxShadow:'0 1px 4px rgba(0,0,0,0.3)' }}/>
            </button>
          </div>

          {/* Personal info */}
          <div style={{ background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:16, padding:'20px 22px' }}>
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
              <FormField label="Telefoni" name="phone" type="tel" value={form.phone||''} onChange={set('phone') as any} placeholder="+383 44 123 456" focused={focused} onFocus={setFocused} onBlur={()=>setFocused(null)} />
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:'rgba(240,236,228,0.5)', display:'block', marginBottom:6 }}>Profesioni</label>
                <select value={form.profession} onChange={e => { set('profession')(e.target.value); setDirty(true) }}
                  style={{ width:'100%', padding:'12px 14px', background:'rgba(240,236,228,0.04)', border:'1px solid rgba(240,236,228,0.09)', borderRadius:12, color:'#f0ece4', fontFamily:'inherit', fontSize:14, outline:'none', cursor:'pointer' }}>
                  <option value="">Zgjedh profesionin</option>
                  {PROFESSIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <FormField label="Vite eksperience" name="experience_years" type="number" value={form.experience_years} onChange={set('experience_years') as any} placeholder="p.sh. 5" hint="Vite pune efektive" focused={focused} onFocus={setFocused} onBlur={()=>setFocused(null)} />
            </div>
          </div>

          {/* Bio */}
          <div style={{ background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:16, padding:'20px 22px' }}>
            <h2 style={{ fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:'1rem', marginBottom:18, display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ width:30, height:30, borderRadius:9, background:'rgba(232,98,26,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>✍️</span>
              Bio profesionale
            </h2>
            <FormField label="Bio" name="bio" value={form.bio} onChange={set('bio') as any} type="textarea" rows={5} placeholder="Shkruaj rreth eksperiencës, projekteve të kryera, specializimeve dhe çfarë të bën të veçantë si profesionist..." hint={`${(form.bio||'').length}/600 · Min 40 karaktere rekomandohet`} focused={focused} onFocus={setFocused} onBlur={()=>setFocused(null)} />
          </div>
        </div>
      )}

      {/* ── SKILLS TAB ── */}
      {activeTab === 'skills' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16, animation:'fadeUp 0.3s ease' }}>
          <div style={{ background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:16, padding:'20px 22px' }}>
            <h2 style={{ fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:'1rem', marginBottom:6, display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ width:30, height:30, borderRadius:9, background:'rgba(16,185,129,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>🛠️</span>
              Aftësitë tuaja
            </h2>
            <p style={{ fontSize:12, color:'rgba(240,236,228,0.4)', marginBottom:18, lineHeight:1.6 }}>Shtoni min 3 aftësi — këto shfaqen tek klientët dhe ndikojnë në rankim.</p>

            {/* Current skills */}
            {skillsList.length > 0 && (
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
                {skillsList.map(s => (
                  <span key={s} className="skill-chip" style={{ fontSize:12, fontWeight:700, color:'#10b981', background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:8, padding:'5px 12px', display:'flex', alignItems:'center', gap:6, cursor:'default' }}>
                    {s}
                    <button className="remove-skill" onClick={() => removeSkill(s)}
                      style={{ opacity:0, background:'none', border:'none', color:'#f87171', cursor:'pointer', fontSize:12, padding:0, lineHeight:1, transition:'opacity 0.15s' }}>✕</button>
                  </span>
                ))}
              </div>
            )}

            {/* Add skill input */}
            <div style={{ display:'flex', gap:8, marginBottom:16 }}>
              <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => { if (e.key==='Enter') { e.preventDefault(); addSkill(skillInput) } }}
                placeholder="Shto aftësi (Enter për konfirmim)..."
                style={{ flex:1, padding:'10px 14px', background:'rgba(240,236,228,0.04)', border:'1px solid rgba(240,236,228,0.09)', borderRadius:11, fontSize:13, color:'#f0ece4', fontFamily:'inherit', outline:'none' }}/>
              <button onClick={() => addSkill(skillInput)}
                style={{ padding:'10px 18px', borderRadius:11, background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.25)', color:'#10b981', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s', whiteSpace:'nowrap' }}>
                + Shto
              </button>
            </div>

            {/* Suggestions */}
            <div>
              <p style={{ fontSize:11, fontWeight:700, color:'rgba(240,236,228,0.3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:10 }}>Sugjerimet e popullarizuara</p>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {ALL_SKILLS.filter(s => !skillsList.includes(s)).map(s => (
                  <button key={s} className="suggestion" onClick={() => addSkill(s)}
                    style={{ fontSize:11, fontWeight:600, color:'rgba(240,236,228,0.5)', background:'rgba(240,236,228,0.04)', border:'1px solid rgba(240,236,228,0.08)', borderRadius:7, padding:'4px 11px', cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s' }}>
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Skill strength indicator */}
          {skillsList.length > 0 && (
            <div style={{ padding:'14px 18px', background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:14, display:'flex', gap:14, alignItems:'center' }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, fontWeight:700, marginBottom:6 }}>Forca e profilit nga aftësitë</div>
                <div style={{ height:5, background:'rgba(240,236,228,0.08)', borderRadius:10, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${Math.min(100, skillsList.length * 14)}%`, background:'linear-gradient(90deg,#10b981,#22d3a5)', borderRadius:10, transition:'width 0.5s ease' }}/>
                </div>
              </div>
              <div style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:'1.2rem', color:'#10b981' }}>{skillsList.length}<span style={{ fontSize:12, color:'rgba(240,236,228,0.4)', fontFamily:'inherit', fontWeight:400 }}>/10</span></div>
            </div>
          )}
        </div>
      )}

      {/* ── PREVIEW TAB ── */}
      {activeTab === 'preview' && (
        <div style={{ animation:'fadeUp 0.3s ease' }}>
          <div style={{ padding:'14px 18px', background:'rgba(251,191,36,0.05)', border:'1px solid rgba(251,191,36,0.15)', borderRadius:12, marginBottom:16, fontSize:12, color:'rgba(240,236,228,0.5)' }}>
            👁 Ky është si klientët shohin profilin tënd
          </div>
          {/* Public profile preview card */}
          <div style={{ padding:'28px', background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.1)', borderRadius:22 }}>
            <div style={{ display:'flex', gap:18, alignItems:'flex-start', marginBottom:20 }}>
              <div style={{ width:64, height:64, borderRadius:18, background:'linear-gradient(135deg,#10b981,#22d3a5)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:24, color:'#fff', flexShrink:0, overflow:'hidden' }}>
                {avatar ? <img src={avatar} style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : (form.full_name||'P').slice(0,2).toUpperCase()}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4, flexWrap:'wrap' }}>
                  <h2 style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:'1.25rem', letterSpacing:'-0.02em' }}>{form.full_name || 'Emri yt'}</h2>
                  {form.is_available && <span style={{ fontSize:10, fontWeight:700, color:'#10b981', background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:20, padding:'2px 10px' }}>🟢 Disponueshëm</span>}
                </div>
                <div style={{ fontSize:14, color:'rgba(240,236,228,0.6)', marginBottom:4 }}>{form.profession || 'Profesioni'}</div>
                <div style={{ display:'flex', gap:12, fontSize:12, color:'rgba(240,236,228,0.4)' }}>
                  {form.city && <span>📍 {form.city}</span>}
                  {form.experience_years && <span>🏆 {form.experience_years} vite</span>}
                  {worker?.rating_avg > 0 && <span>⭐ {worker.rating_avg.toFixed(1)} ({worker.total_reviews} review)</span>}
                </div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:'1.5rem', color:'#10b981' }}>{successRate}%</div>
                <div style={{ fontSize:10, color:'rgba(240,236,228,0.4)' }}>Norma suksesit</div>
              </div>
            </div>
            {form.bio && <p style={{ fontSize:13, color:'rgba(240,236,228,0.55)', lineHeight:1.75, padding:'14px 16px', background:'rgba(240,236,228,0.03)', borderRadius:12, borderLeft:'3px solid rgba(16,185,129,0.3)', marginBottom:16 }}>{form.bio}</p>}
            {skillsList.length > 0 && (
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {skillsList.slice(0,8).map(s => (
                  <span key={s} style={{ fontSize:11, fontWeight:700, color:'#10b981', background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.18)', borderRadius:7, padding:'4px 12px' }}>{s}</span>
                ))}
                {skillsList.length > 8 && <span style={{ fontSize:11, color:'rgba(240,236,228,0.35)', alignSelf:'center' }}>+{skillsList.length-8}</span>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Save button */}
      <div style={{ display:'flex', justifyContent:'flex-end', gap:12, alignItems:'center', marginTop:20, paddingTop:20, borderTop:'1px solid rgba(240,236,228,0.06)' }}>
        {dirty && <span style={{ fontSize:12, color:'rgba(240,236,228,0.35)' }}>● Ka ndryshime të paruajtura</span>}
        <button onClick={handleSave} disabled={saving || !dirty}
          style={{ padding:'12px 28px', borderRadius:13, background:dirty&&!saving?'linear-gradient(135deg,#e8621a,#ff7c35)':'rgba(240,236,228,0.07)', border:'none', color:dirty&&!saving?'#fff':'rgba(240,236,228,0.3)', fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:'0.95rem', cursor:dirty&&!saving?'pointer':'not-allowed', transition:'all 0.2s', display:'flex', alignItems:'center', gap:8, boxShadow:dirty&&!saving?'0 4px 16px rgba(232,98,26,0.25)':'none' }}>
          {saving ? (<><div style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid #fff', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>Duke ruajtur...</>) : 'Ruaj ndryshimet →'}
        </button>
      </div>
    </div>
  )
}