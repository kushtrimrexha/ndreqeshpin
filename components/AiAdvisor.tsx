'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
type Role = 'client' | 'company' | 'worker' | 'admin'
interface Msg { id: string; role: 'user' | 'assistant'; content: string; ts: Date }

// ─── Role config ──────────────────────────────────────────────────────────────
const ROLE_CFG: Record<Role, {
  color:     string
  gradient:  string
  label:     string
  avatar:    string
  welcome:   string
  starters:  string[]
}> = {
  client: {
    color:    '#3b82f6',
    gradient: 'linear-gradient(135deg,#1d4ed8,#3b82f6)',
    label:    'Asistent Klienti',
    avatar:   '🏠',
    welcome:  'Mirë se vini! Jam **NdreqeShpin AI**, këshilltari juaj personal për rinovime. Mund t\'ju ndihmoj me çmime, materiale, zgjedhje profesionistësh, dhe çdo pyetje tjetër rreth projektit tuaj.',
    starters: [
      'Sa kushton rinovimi i një banjoje?',
      'Si ta zgjedh ofertën më të mirë?',
      'Cilat materiale rekomandoni për dysheme?',
      'Sa duhet të jetë buxheti për kuzhine?',
    ],
  },
  worker: {
    color:    '#10b981',
    gradient: 'linear-gradient(135deg,#059669,#10b981)',
    label:    'Mentor Punëtori',
    avatar:   '🔧',
    welcome:  'Çkemi! Jam **NdreqeShpin AI**, mentori juaj për sukses në platformë. Mund të ju ndihmoj të fitoni më shumë kontrata, të çmoni punët saktë, dhe të ndërtoni reputacion të fortë.',
    starters: [
      'Si të shkruaj një ofertë bindëse?',
      'Si ta çmoj punën time saktë?',
      'Çfarë shkruaj në profilin tim?',
      'Si të marr vlerësime pozitive?',
    ],
  },
  company: {
    color:    '#e8621a',
    gradient: 'linear-gradient(135deg,#c2410c,#e8621a)',
    label:    'Konsulent Biznesi',
    avatar:   '🏢',
    welcome:  'Mirë se vini! Jam **NdreqeShpin AI**, konsulenti juaj strategjik. Mund t\'ju ndihmoj të fitoni kontrata më të mëdha, të menaxhoni ekipin, dhe të rritni biznesin tuaj.',
    starters: [
      'Si ta shkruaj ofertën ideale?',
      'Si të çmoj projektet komplekse?',
      'Si të rrit numrin e kontratave?',
      'Strategji për klientë premium?',
    ],
  },
  admin: {
    color:    '#a78bfa',
    gradient: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
    label:    'Asistent Admin',
    avatar:   '⚙️',
    welcome:  'Mirë se vini! Jam **NdreqeShpin AI** i konfiguruar për administratorët. Mund të ju ndihmoj me analitikë, strategji platforme, dhe vendimmarrje operacionale.',
    starters: [
      'Analizo tendencën e aplikimeve',
      'Strategji për rritjen e kompanive',
      'Si të optimizojmë onboarding?',
      'KPI-të kryesore të platformës',
    ],
  },
}

// ─── Markdown renderer (minimal, no deps) ────────────────────────────────────
function renderMarkdown(text: string, accent: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, `<strong style="color:${accent};font-weight:700">$1</strong>`)
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:rgba(240,236,228,0.1);padding:1px 5px;border-radius:4px;font-family:monospace;font-size:12px">$1</code>')
    .replace(/^### (.+)$/gm, `<div style="font-weight:800;font-size:13px;color:${accent};margin:12px 0 5px;font-family:'DM Sans',sans-serif">$1</div>`)
    .replace(/^## (.+)$/gm, `<div style="font-weight:900;font-size:14px;color:${accent};margin:12px 0 6px;font-family:'Fraunces',serif">$1</div>`)
    .replace(/^- (.+)$/gm, `<div style="display:flex;gap:7px;margin:3px 0"><span style="color:${accent};flex-shrink:0;margin-top:2px">›</span><span>$1</span></div>`)
    .replace(/^\d+\. (.+)$/gm, (_, t, o) => `<div style="display:flex;gap:7px;margin:3px 0"><span style="color:${accent};flex-shrink:0;font-weight:700;margin-top:1px">${o.match(/(\d+)\./)?.[1]}.</span><span>${t}</span></div>`)
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')
}

// ─── Typing animation ─────────────────────────────────────────────────────────
function TypingDots({ color }: { color: string }) {
  return (
    <div style={{ display:'flex', gap:4, padding:'4px 2px', alignItems:'center' }}>
      {[0,1,2].map(i => (
        <div key={i} style={{
          width:6, height:6, borderRadius:'50%', background:color,
          animation:`aiDot 1.2s ease-in-out ${i*0.2}s infinite`,
        }}/>
      ))}
    </div>
  )
}

// ─── Time format ──────────────────────────────────────────────────────────────
function fmt(d: Date) {
  return d.toLocaleTimeString('sq-AL', { hour:'2-digit', minute:'2-digit' })
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AiAdvisor({
  role, userName, userId,
}: {
  role:     Role
  userName: string
  userId?:  string
}) {
  const cfg = ROLE_CFG[role]

  const [open,    setOpen]    = useState(false)
  const [msgs,    setMsgs]    = useState<Msg[]>([])
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const [pulse,   setPulse]   = useState(true)
  const [unread,  setUnread]  = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const [initiated, setInitiated]   = useState(false)

  const bottomRef  = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLTextAreaElement>(null)
  const historyRef = useRef<{ role: 'user'|'assistant'; content: string }[]>([])

  // Stop the pulse ring after 6 seconds
  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 6000)
    return () => clearTimeout(t)
  }, [])

  // Scroll to bottom
  useEffect(() => {
    if (open) setTimeout(() => bottomRef.current?.scrollIntoView({ behavior:'smooth' }), 60)
  }, [msgs, open, loading])

  // Focus input on open
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300)
  }, [open])

  // Clear unread on open
  useEffect(() => {
    if (open) setUnread(0)
  }, [open])

  // Add welcome message on first open
  function handleOpen() {
    setOpen(true)
    if (!initiated) {
      setInitiated(true)
      const welcome: Msg = {
        id:      crypto.randomUUID(),
        role:    'assistant',
        content: cfg.welcome,
        ts:      new Date(),
      }
      setMsgs([welcome])
      historyRef.current = [{ role:'assistant', content: cfg.welcome }]
    }
  }

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return
    setInput('')

    const userMsg: Msg = { id: crypto.randomUUID(), role:'user', content: trimmed, ts: new Date() }
    setMsgs(p => [...p, userMsg])
    historyRef.current = [...historyRef.current, { role:'user', content: trimmed }]
    setLoading(true)

    try {
      const res = await fetch('/api/ai-chat', {
        method:  'POST',
        headers: { 'Content-Type':'application/json' },
        body:    JSON.stringify({
          messages: historyRef.current,
          role,
          userName,
        }),
      })
      const data = await res.json()
      const reply = data.reply || 'Nuk munda të procesoj kërkesën. Provo sërish.'
      const aiMsg: Msg = { id: crypto.randomUUID(), role:'assistant', content: reply, ts: new Date() }
      setMsgs(p => [...p, aiMsg])
      historyRef.current = [...historyRef.current, { role:'assistant', content: reply }]
      if (!open) setUnread(p => p + 1)
    } catch {
      const errMsg: Msg = { id: crypto.randomUUID(), role:'assistant', content: '⚠️ Gabim lidhjeje. Kontrollo internetin dhe provo sërish.', ts: new Date() }
      setMsgs(p => [...p, errMsg])
    } finally {
      setLoading(false)
    }
  }, [loading, role, userName, open])

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) }
  }

  function clearChat() {
    setMsgs([])
    historyRef.current = []
    setInitiated(false)
  }

  const W = fullscreen ? 'min(90vw,860px)' : 'min(88vw,420px)'
  const H = fullscreen ? 'min(90vh,720px)' : '540px'

  return (
    <>
      <style>{`
        @keyframes aiDot    { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }
        @keyframes aiSlideUp{ from{opacity:0;transform:translateY(24px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes aiPulse  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        @keyframes aiRing   { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(1.8);opacity:0} }
        @keyframes aiFade   { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes aiGlow   { 0%,100%{box-shadow:0 0 20px ${cfg.color}30} 50%{box-shadow:0 0 35px ${cfg.color}60} }
        .ai-starter:hover   { background:rgba(240,236,228,0.06)!important; border-color:${cfg.color}60!important; transform:translateY(-1px) }
        .ai-send:hover      { transform:scale(1.05)!important; box-shadow:0 6px 20px ${cfg.color}50!important }
        .ai-clear:hover     { color:rgba(240,236,228,0.7)!important }
        .ai-msg-user        { animation:aiFade 0.2s ease }
        .ai-msg-ai          { animation:aiFade 0.3s ease }
      `}</style>

      {/* ── FAB Button ─────────────────────────────────────────────────────── */}
      {!open && (
        <div style={{ position:'fixed', bottom:28, right:28, zIndex:9000 }}>
          {/* Pulse ring */}
          {pulse && (
            <div style={{
              position:'absolute', inset:-6, borderRadius:'50%',
              border:`2px solid ${cfg.color}`,
              animation:'aiRing 1.5s ease-out 0.5s 3 forwards',
            }}/>
          )}
          {/* Unread badge */}
          {unread > 0 && (
            <div style={{
              position:'absolute', top:-6, right:-6, width:20, height:20,
              background:'#ef4444', borderRadius:'50%',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:10, fontWeight:900, color:'#fff', fontFamily:'DM Sans,sans-serif',
              zIndex:1, border:'2px solid #0a0908',
            }}>{unread}</div>
          )}
          {/* Button */}
          <button onClick={handleOpen}
            style={{
              width:60, height:60, borderRadius:'50%', background:cfg.gradient,
              border:'none', cursor:'pointer', display:'flex', alignItems:'center',
              justifyContent:'center', fontSize:26, boxShadow:`0 8px 32px ${cfg.color}50`,
              animation:`aiGlow 3s ease-in-out infinite, ${pulse?'aiPulse 0.6s ease-in-out 0.5s 1':'none'}`,
              transition:'transform 0.2s, box-shadow 0.2s', outline:'none',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform='scale(1.08)')}
            onMouseLeave={e => (e.currentTarget.style.transform='scale(1)')}>
            🤖
          </button>
          {/* Tooltip */}
          <div style={{
            position:'absolute', bottom:'calc(100% + 10px)', right:0,
            background:'rgba(10,9,8,0.95)', border:`1px solid ${cfg.color}30`,
            borderRadius:10, padding:'7px 12px', whiteSpace:'nowrap',
            fontSize:12, fontWeight:700, color:'#f0ece4', fontFamily:'DM Sans,sans-serif',
            boxShadow:`0 4px 20px rgba(0,0,0,0.4)`, pointerEvents:'none',
            opacity: pulse ? 1 : 0, transition:'opacity 0.3s',
          }}>
            ✨ {cfg.label}
          </div>
        </div>
      )}

      {/* ── Chat Window ────────────────────────────────────────────────────── */}
      {open && (
        <div style={{
          position:'fixed', bottom:20, right:20, zIndex:9000,
          width:W, height:H,
          background:'#0d1117',
          border:`1px solid ${cfg.color}25`,
          borderRadius:22,
          display:'flex', flexDirection:'column',
          boxShadow:`0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(240,236,228,0.04), inset 0 1px 0 rgba(240,236,228,0.06)`,
          animation:'aiSlideUp 0.3s cubic-bezier(0.16,1,0.3,1)',
          fontFamily:"'DM Sans','Helvetica Neue',sans-serif",
          overflow:'hidden',
          transition:'width 0.3s ease, height 0.3s ease',
        }}>

          {/* ── Header ──────────────────────────────────────────────────── */}
          <div style={{
            padding:'14px 18px', flexShrink:0,
            background:`linear-gradient(135deg,rgba(10,9,8,0.9),${cfg.color}15)`,
            borderBottom:`1px solid ${cfg.color}20`,
            display:'flex', alignItems:'center', gap:12,
          }}>
            {/* Avatar with glow */}
            <div style={{
              width:40, height:40, borderRadius:14,
              background:cfg.gradient,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:20, flexShrink:0,
              boxShadow:`0 4px 16px ${cfg.color}50`,
            }}>🤖</div>

            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:14, fontWeight:800, color:'#f0ece4', display:'flex', alignItems:'center', gap:7 }}>
                NdreqeShpin AI
                <div style={{
                  width:6, height:6, borderRadius:'50%', background:'#22d3a5',
                  boxShadow:'0 0 6px #22d3a5', animation:'aiDot 2s ease-in-out infinite',
                }}/>
              </div>
              <div style={{ fontSize:11, color:`${cfg.color}`, fontWeight:700, marginTop:1 }}>
                {cfg.label} · Gjithmonë i disponueshëm
              </div>
            </div>

            {/* Controls */}
            <div style={{ display:'flex', gap:4, flexShrink:0 }}>
              {/* Fullscreen toggle */}
              <button onClick={() => setFullscreen(p=>!p)}
                title={fullscreen ? 'Minimizo' : 'Zgjero'}
                style={{ width:30, height:30, borderRadius:9, background:'rgba(240,236,228,0.05)', border:'1px solid rgba(240,236,228,0.08)', color:'rgba(240,236,228,0.5)', cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s' }}
                onMouseEnter={e=>(e.currentTarget.style.color='#f0ece4')}
                onMouseLeave={e=>(e.currentTarget.style.color='rgba(240,236,228,0.5)')}>
                {fullscreen ? '⊡' : '⊞'}
              </button>
              {/* Clear */}
              <button onClick={clearChat} className="ai-clear"
                title="Fshi bisedën"
                style={{ width:30, height:30, borderRadius:9, background:'rgba(240,236,228,0.05)', border:'1px solid rgba(240,236,228,0.08)', color:'rgba(240,236,228,0.4)', cursor:'pointer', fontSize:12, display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s' }}>
                🗑
              </button>
              {/* Close */}
              <button onClick={() => setOpen(false)}
                style={{ width:30, height:30, borderRadius:9, background:'rgba(240,236,228,0.05)', border:'1px solid rgba(240,236,228,0.08)', color:'rgba(240,236,228,0.5)', cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s', fontWeight:700 }}
                onMouseEnter={e=>(e.currentTarget.style.color='#f87171')}
                onMouseLeave={e=>(e.currentTarget.style.color='rgba(240,236,228,0.5)')}>
                ✕
              </button>
            </div>
          </div>

          {/* ── Messages ────────────────────────────────────────────────── */}
          <div style={{ flex:1, overflowY:'auto', padding:'16px 16px 8px', display:'flex', flexDirection:'column', gap:12,
            scrollbarWidth:'thin', scrollbarColor:`${cfg.color}20 transparent` }}>

            {/* Starter prompts (shown before first message or after clear) */}
            {msgs.length === 0 && (
              <div style={{ textAlign:'center', padding:'20px 10px' }}>
                <div style={{ fontSize:36, marginBottom:12 }}>{cfg.avatar}</div>
                <div style={{ fontSize:13, fontWeight:600, color:'rgba(240,236,228,0.5)', marginBottom:20, lineHeight:1.6 }}>
                  Pyetni çdo gjë rreth renovimeve, çmimeve, materialeve, dhe strategjive.
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                  {cfg.starters.map(s => (
                    <button key={s} className="ai-starter"
                      onClick={() => { setOpen(true); send(s) }}
                      style={{
                        padding:'10px 14px', borderRadius:12, textAlign:'left',
                        background:'rgba(240,236,228,0.02)', border:`1px solid ${cfg.color}25`,
                        color:'rgba(240,236,228,0.7)', fontFamily:'inherit', fontSize:12,
                        fontWeight:600, cursor:'pointer', transition:'all 0.18s',
                        display:'flex', alignItems:'center', gap:8,
                      }}>
                      <span style={{ color:cfg.color, fontSize:10, flexShrink:0 }}>▶</span>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {msgs.map((m, i) => {
              const isUser = m.role === 'user'
              const showTime = i === msgs.length - 1 || msgs[i+1]?.role !== m.role
              return (
                <div key={m.id} className={isUser ? 'ai-msg-user' : 'ai-msg-ai'}
                  style={{ display:'flex', flexDirection:'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>

                  {/* Avatar row */}
                  {!isUser && (
                    <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:4 }}>
                      <div style={{ width:24, height:24, borderRadius:8, background:cfg.gradient, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, boxShadow:`0 2px 8px ${cfg.color}40` }}>🤖</div>
                      <span style={{ fontSize:10, fontWeight:700, color:`${cfg.color}`, textTransform:'uppercase', letterSpacing:'0.06em' }}>AI</span>
                    </div>
                  )}

                  {/* Bubble */}
                  <div style={{
                    maxWidth:'88%', padding:'11px 14px',
                    borderRadius: isUser ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                    background: isUser
                      ? `${cfg.gradient}`
                      : 'rgba(240,236,228,0.05)',
                    border: isUser ? 'none' : '1px solid rgba(240,236,228,0.08)',
                    fontSize:13, lineHeight:1.65,
                    color: isUser ? '#fff' : '#e8eaf0',
                    boxShadow: isUser ? `0 4px 16px ${cfg.color}30` : 'none',
                  }}>
                    {isUser
                      ? m.content
                      : <div dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content, cfg.color) }}/>
                    }
                  </div>

                  {/* Timestamp */}
                  {showTime && (
                    <div style={{ fontSize:10, color:'rgba(240,236,228,0.25)', marginTop:3, padding:'0 2px' }}>
                      {fmt(m.ts)}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Loading indicator */}
            {loading && (
              <div className="ai-msg-ai" style={{ display:'flex', flexDirection:'column', alignItems:'flex-start' }}>
                <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:4 }}>
                  <div style={{ width:24, height:24, borderRadius:8, background:cfg.gradient, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12 }}>🤖</div>
                  <span style={{ fontSize:10, fontWeight:700, color:`${cfg.color}`, textTransform:'uppercase', letterSpacing:'0.06em' }}>Duke shkruar...</span>
                </div>
                <div style={{ padding:'11px 16px', background:'rgba(240,236,228,0.05)', border:'1px solid rgba(240,236,228,0.08)', borderRadius:'4px 18px 18px 18px' }}>
                  <TypingDots color={cfg.color}/>
                </div>
              </div>
            )}

            <div ref={bottomRef}/>
          </div>

          {/* ── Quick chips ─────────────────────────────────────────────── */}
          {msgs.length > 0 && msgs.length < 4 && (
            <div style={{ padding:'0 14px 8px', display:'flex', gap:6, flexWrap:'wrap' }}>
              {cfg.starters.slice(0,2).map(s => (
                <button key={s} onClick={() => send(s)} disabled={loading}
                  style={{
                    padding:'5px 11px', borderRadius:20, fontSize:11, fontWeight:600,
                    background:'rgba(240,236,228,0.03)', border:`1px solid ${cfg.color}20`,
                    color:`${cfg.color}`, cursor:'pointer', fontFamily:'inherit',
                    transition:'all 0.15s', opacity: loading ? 0.4 : 1,
                  }}
                  onMouseEnter={e=>{(e.currentTarget.style.background=`${cfg.color}12`);(e.currentTarget.style.borderColor=`${cfg.color}50`)}}
                  onMouseLeave={e=>{(e.currentTarget.style.background='rgba(240,236,228,0.03)');(e.currentTarget.style.borderColor=`${cfg.color}20`)}}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* ── Input ───────────────────────────────────────────────────── */}
          <div style={{
            padding:'12px 14px 14px', flexShrink:0,
            borderTop:'1px solid rgba(240,236,228,0.07)',
            background:'rgba(10,9,8,0.5)',
          }}>
            <div style={{ display:'flex', gap:10, alignItems:'flex-end' }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                disabled={loading}
                placeholder="Shkruani pyetjen tuaj… (Enter për dërgim)"
                rows={1}
                style={{
                  flex:1, resize:'none', minHeight:40, maxHeight:120,
                  background:'rgba(240,236,228,0.04)',
                  border:`1px solid ${input ? `${cfg.color}40` : 'rgba(240,236,228,0.08)'}`,
                  borderRadius:14, padding:'10px 14px',
                  fontSize:13, color:'#f0ece4', fontFamily:'inherit',
                  outline:'none', transition:'border-color 0.2s, box-shadow 0.2s',
                  overflowY:'auto', lineHeight:1.5,
                  boxShadow: input ? `0 0 0 3px ${cfg.color}12` : 'none',
                }}
                onFocus={e => { e.target.style.borderColor=`${cfg.color}60`; e.target.style.boxShadow=`0 0 0 3px ${cfg.color}15` }}
                onBlur={e  => { e.target.style.borderColor='rgba(240,236,228,0.08)'; e.target.style.boxShadow='none' }}
              />
              <button
                className="ai-send"
                onClick={() => send(input)}
                disabled={loading || !input.trim()}
                style={{
                  width:42, height:42, borderRadius:13, border:'none', flexShrink:0,
                  background: input.trim() && !loading ? cfg.gradient : 'rgba(240,236,228,0.08)',
                  color: input.trim() && !loading ? '#fff' : 'rgba(240,236,228,0.3)',
                  cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:17,
                  transition:'all 0.2s',
                  boxShadow: input.trim() && !loading ? `0 4px 14px ${cfg.color}35` : 'none',
                }}>
                {loading
                  ? <div style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid rgba(255,255,255,0.8)', borderRadius:'50%', animation:'aiDot 0.8s linear infinite' }}/>
                  : '↑'}
              </button>
            </div>
            <div style={{ fontSize:10, color:'rgba(240,236,228,0.2)', marginTop:7, textAlign:'center', letterSpacing:'0.03em' }}>
              Powered by · NdreqeShpin AI · Gjithmonë këshillë profesionale
            </div>
          </div>
        </div>
      )}
    </>
  )
}