'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface SearchResult {
  id:       string
  title:    string
  subtitle: string
  icon:     string
  href:     string
  category: string
}

interface Props {
  role:   'client' | 'company' | 'worker' | 'admin'
  userId?: string
}

const STATIC_LINKS: Record<string, SearchResult[]> = {
  client: [
    { id:'1', title:'Dashboard',          subtitle:'Shiko aplikimet dhe ofertat',  icon:'⊞', href:'/client/dashboard',        category:'Navigim' },
    { id:'2', title:'Aplikim i Ri',       subtitle:'Posto projekt të ri',           icon:'✚', href:'/client/applications/new', category:'Veprime' },
    { id:'3', title:'Aplikimet e mia',    subtitle:'Shiko listën e aplikimeve',     icon:'📋', href:'/client/applications',     category:'Navigim' },
    { id:'4', title:'Ofertat e mia',      subtitle:'Krahaso dhe prano oferta',      icon:'💼', href:'/client/offers',           category:'Navigim' },
    { id:'5', title:'Mesazhet',           subtitle:'Komuniko me profesionistët',    icon:'💬', href:'/client/messages',         category:'Navigim' },
    { id:'6', title:'Vlerësimet',         subtitle:'Shiko dhe lër feedback',        icon:'⭐', href:'/client/reviews',          category:'Navigim' },
    { id:'7', title:'Profili im',         subtitle:'Edito të dhënat personale',     icon:'👤', href:'/client/profile',          category:'Llogaria' },
    { id:'8', title:'Cilësimet',          subtitle:'Fjalëkalim, njoftimet, email',  icon:'⚙️', href:'/client/settings',         category:'Llogaria' },
    { id:'9', title:'Premium',            subtitle:'Shiko planet e abonimit',       icon:'💎', href:'/pricing',                 category:'Llogaria' },
  ],
  company: [
    { id:'1', title:'Dashboard',          subtitle:'Shiko statistikat dhe aplikimet',icon:'⊞', href:'/company/dashboard',      category:'Navigim' },
    { id:'2', title:'Aplikimet',          subtitle:'Gjej klientë të rinj',          icon:'📋', href:'/company/applications',   category:'Navigim' },
    { id:'3', title:'Ofertat e mia',      subtitle:'Menaxho ofertat e dërguara',    icon:'💼', href:'/company/offers',          category:'Navigim' },
    { id:'4', title:'Mesazhet',           subtitle:'Chat me klientët',              icon:'💬', href:'/company/messages',        category:'Navigim' },
    { id:'5', title:'Statistikat',        subtitle:'Analytics dhe raporte',         icon:'📊', href:'/company/stats',           category:'Navigim' },
    { id:'6', title:'Vlerësimet',         subtitle:'Reputacioni i kompanisë',       icon:'⭐', href:'/company/reviews',         category:'Navigim' },
    { id:'7', title:'Profili i biznesit', subtitle:'Edito kompaninë',              icon:'🏢', href:'/company/profile',         category:'Llogaria' },
    { id:'8', title:'Cilësimet',          subtitle:'Fjalëkalim, email',             icon:'⚙️', href:'/company/settings',        category:'Llogaria' },
    { id:'9', title:'Premium',            subtitle:'Shiko planet e abonimit',       icon:'💎', href:'/pricing',                 category:'Llogaria' },
  ],
  worker: [
    { id:'1', title:'Dashboard',          subtitle:'Shiko punët dhe statistikat',  icon:'⊞', href:'/worker/dashboard',        category:'Navigim' },
    { id:'2', title:'Aplikimet',          subtitle:'Gjej punë afër teje',          icon:'📋', href:'/worker/applications',     category:'Navigim' },
    { id:'3', title:'Ofertat e mia',      subtitle:'Menaxho bids-et',              icon:'💼', href:'/worker/offers',           category:'Navigim' },
    { id:'4', title:'Mesazhet',           subtitle:'Komuniko me klientët',         icon:'💬', href:'/worker/messages',         category:'Navigim' },
    { id:'5', title:'Statistikat',        subtitle:'Të ardhurat dhe analytics',    icon:'📊', href:'/worker/stats',            category:'Navigim' },
    { id:'6', title:'Vlerësimet',         subtitle:'Ndërtoji reputacionin',        icon:'⭐', href:'/worker/reviews',          category:'Navigim' },
    { id:'7', title:'Profili im',         subtitle:'Edito profilin profesional',   icon:'👤', href:'/worker/profile',          category:'Llogaria' },
    { id:'8', title:'Cilësimet',          subtitle:'Fjalëkalim, email',            icon:'⚙️', href:'/worker/settings',         category:'Llogaria' },
    { id:'9', title:'Premium',            subtitle:'Gjej më shumë punë',           icon:'💎', href:'/pricing',                 category:'Llogaria' },
  ],
  admin: [
    { id:'1', title:'Dashboard',          subtitle:'Overview i platformës',        icon:'⊞', href:'/admin/dashboard',         category:'Navigim' },
    { id:'2', title:'Kompanitë',          subtitle:'Verifiko dhe menaxho',         icon:'🏢', href:'/admin/companies',         category:'Navigim' },
    { id:'3', title:'Përdoruesit',        subtitle:'Ndrysho role dhe statuse',     icon:'👥', href:'/admin/users',             category:'Navigim' },
    { id:'4', title:'Aplikimet',          subtitle:'Shiko të gjitha aplikimet',    icon:'📋', href:'/admin/applications',      category:'Navigim' },
    { id:'5', title:'Ofertat',            subtitle:'Shiko të gjitha ofertat',      icon:'💼', href:'/admin/offers',            category:'Navigim' },
    { id:'6', title:'Statistikat',        subtitle:'Analytics globale',            icon:'📊', href:'/admin/stats',             category:'Navigim' },
    { id:'7', title:'Cilësimet',          subtitle:'Konfigurimi i platformës',     icon:'⚙️', href:'/admin/settings',          category:'Navigim' },
  ],
}

export default function GlobalSearch({ role, userId }: Props) {
  const router = useRouter()
  const [open,     setOpen]     = useState(false)
  const [query,    setQuery]    = useState('')
  const [results,  setResults]  = useState<SearchResult[]>([])
  const [selected, setSelected] = useState(0)
  const inputRef   = useRef<HTMLInputElement>(null)
  const listRef    = useRef<HTMLDivElement>(null)

  const staticLinks = STATIC_LINKS[role] || []

  // Keyboard shortcut — Cmd+K / Ctrl+K
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(p => !p)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery('')
      setResults(staticLinks)
      setSelected(0)
    }
  }, [open])

  useEffect(() => {
    if (!query.trim()) {
      setResults(staticLinks)
      setSelected(0)
      return
    }
    const q = query.toLowerCase()
    const filtered = staticLinks.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.subtitle.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q)
    )
    setResults(filtered)
    setSelected(0)
  }, [query])

  function navigate(href: string) {
    router.push(href)
    setOpen(false)
    setQuery('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(p => Math.min(p+1, results.length-1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(p => Math.max(p-1, 0)) }
    if (e.key === 'Enter' && results[selected]) { navigate(results[selected].href) }
  }

  // Scroll selected into view
  useEffect(() => {
    const el = listRef.current?.children[selected] as HTMLElement
    el?.scrollIntoView({ block: 'nearest' })
  }, [selected])

  // Group by category
  const grouped = results.reduce((acc, r) => {
    if (!acc[r.category]) acc[r.category] = []
    acc[r.category].push(r)
    return acc
  }, {} as Record<string, SearchResult[]>)

  let globalIndex = 0

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 14px', background:'rgba(240,236,228,0.04)', border:'1px solid rgba(240,236,228,0.08)', borderRadius:10, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", color:'rgba(240,236,228,0.4)', fontSize:13, transition:'all 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(240,236,228,0.15)'; e.currentTarget.style.color='rgba(240,236,228,0.7)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(240,236,228,0.08)'; e.currentTarget.style.color='rgba(240,236,228,0.4)' }}>
        <span style={{ fontSize:15 }}>🔍</span>
        <span>Kërko...</span>
        <kbd style={{ marginLeft:4, padding:'2px 7px', background:'rgba(240,236,228,0.06)', border:'1px solid rgba(240,236,228,0.1)', borderRadius:5, fontSize:10, fontFamily:'inherit', color:'rgba(240,236,228,0.3)' }}>⌘K</kbd>
      </button>
    )
  }

  return (
    <>
      <style>{`
        @keyframes searchIn { from{opacity:0;transform:scale(0.96) translateY(-8px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes overlayIn { from{opacity:0} to{opacity:1} }
        .search-item:hover { background: rgba(240,236,228,0.06) !important; }
      `}</style>

      {/* Overlay */}
      <div onClick={() => setOpen(false)}
        style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:998, backdropFilter:'blur(8px)', animation:'overlayIn 0.15s ease' }} />

      {/* Search panel */}
      <div style={{ position:'fixed', top:'15%', left:'50%', transform:'translateX(-50%)', width:'min(600px,calc(100vw - 32px))', zIndex:999, animation:'searchIn 0.2s cubic-bezier(0.4,0,0.2,1)' }}>
        <div style={{ background:'#111010', border:'1px solid rgba(240,236,228,0.12)', borderRadius:18, overflow:'hidden', boxShadow:'0 32px 64px rgba(0,0,0,0.7)', fontFamily:"'DM Sans',sans-serif" }}>

          {/* Input */}
          <div style={{ display:'flex', alignItems:'center', gap:12, padding:'16px 20px', borderBottom:'1px solid rgba(240,236,228,0.07)' }}>
            <span style={{ fontSize:18, opacity:0.4, flexShrink:0 }}>🔍</span>
            <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={handleKeyDown}
              placeholder="Kërko faqe, veprime..."
              style={{ flex:1, background:'none', border:'none', outline:'none', fontSize:16, color:'#f0ece4', fontFamily:'inherit', caretColor:'#e8621a' }} />
            {query && (
              <button onClick={() => setQuery('')} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(240,236,228,0.3)', fontSize:18, padding:0, lineHeight:1 }}>✕</button>
            )}
            <kbd style={{ padding:'3px 8px', background:'rgba(240,236,228,0.06)', border:'1px solid rgba(240,236,228,0.1)', borderRadius:6, fontSize:11, color:'rgba(240,236,228,0.3)', fontFamily:'inherit', flexShrink:0 }}>ESC</kbd>
          </div>

          {/* Results */}
          <div ref={listRef} style={{ maxHeight:400, overflowY:'auto', padding:'8px 0' }}>
            {results.length === 0 ? (
              <div style={{ padding:'32px 20px', textAlign:'center', color:'rgba(240,236,228,0.3)' }}>
                <div style={{ fontSize:32, marginBottom:8 }}>🔍</div>
                <div style={{ fontSize:14, fontWeight:600 }}>Asnjë rezultat për "{query}"</div>
              </div>
            ) : (
              Object.entries(grouped).map(([category, items]) => (
                <div key={category}>
                  <div style={{ padding:'6px 20px 4px', fontSize:10, fontWeight:700, color:'rgba(240,236,228,0.25)', textTransform:'uppercase', letterSpacing:'0.1em' }}>{category}</div>
                  {items.map(item => {
                    const idx = globalIndex++
                    const isSelected = idx === selected
                    return (
                      <div key={item.id} className="search-item"
                        onClick={() => navigate(item.href)}
                        onMouseEnter={() => setSelected(idx)}
                        style={{ display:'flex', alignItems:'center', gap:14, padding:'10px 20px', cursor:'pointer', background: isSelected ? 'rgba(232,98,26,0.08)' : 'transparent', transition:'background 0.1s', borderLeft: isSelected ? '2px solid #e8621a' : '2px solid transparent' }}>
                        <div style={{ width:36, height:36, borderRadius:10, background: isSelected ? 'rgba(232,98,26,0.12)' : 'rgba(240,236,228,0.05)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{item.icon}</div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:14, fontWeight:600, color: isSelected ? '#f0ece4' : 'rgba(240,236,228,0.8)', marginBottom:2 }}>{item.title}</div>
                          <div style={{ fontSize:12, color:'rgba(240,236,228,0.35)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.subtitle}</div>
                        </div>
                        {isSelected && <span style={{ fontSize:11, color:'rgba(240,236,228,0.3)', flexShrink:0 }}>↵</span>}
                      </div>
                    )
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div style={{ padding:'10px 20px', borderTop:'1px solid rgba(240,236,228,0.06)', display:'flex', gap:16, alignItems:'center' }}>
            {[['↑↓', 'navigo'], ['↵', 'hap'], ['Esc', 'mbyll']].map(([key, desc]) => (
              <div key={key} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'rgba(240,236,228,0.25)' }}>
                <kbd style={{ padding:'2px 6px', background:'rgba(240,236,228,0.06)', border:'1px solid rgba(240,236,228,0.1)', borderRadius:5, fontFamily:'inherit' }}>{key}</kbd>
                {desc}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}