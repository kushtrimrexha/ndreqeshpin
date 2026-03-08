'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface Message      { id:string; conversation_id:string; sender_id:string; content:string; is_read:boolean; created_at:string }
interface Conversation { id:string; application_id:string; last_message:string; last_message_at:string; created_at:string; other_name:string; other_id:string; unread:number; app_title?:string }
interface Props        { userId:string; userRole:'client'|'company'|'worker'; userName:string }

const ROLE_COLOR: Record<string,'string'> = { client:'#3b82f6', company:'#e8621a', worker:'#10b981' }

function timeAgo(d:string){const diff=Date.now()-new Date(d).getTime(),mins=Math.floor(diff/60000),hours=Math.floor(diff/3600000);if(mins<1)return'Tani';if(mins<60)return`${mins}m`;if(hours<24)return`${hours}h`;return new Date(d).toLocaleDateString('sq-AL',{day:'numeric',month:'short'})}
function formatTime(d:string){return new Date(d).toLocaleTimeString('sq-AL',{hour:'2-digit',minute:'2-digit'})}
function groupByDate(msgs:Message[]){const g:{date:string;msgs:Message[]}[]=[];msgs.forEach(m=>{const date=new Date(m.created_at).toLocaleDateString('sq-AL',{weekday:'long',day:'numeric',month:'long'});const last=g[g.length-1];if(last&&last.date===date)last.msgs.push(m);else g.push({date,msgs:[m]})});return g}

const QUICK_REPLIES = ['Faleminderit!','Mirë, dakord.','Kur mund të fillojmë?','Ju dërgoj detaje brenda pak.','A mund të takohemi?','Çmimi është i negociueshëm.']

export default function ChatInterface({ userId, userRole, userName }: Props) {
  const supabase   = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const bottomRef  = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLTextAreaElement>(null)
  const channelRef = useRef<any>(null)

  const [conversations,  setConversations]  = useState<Conversation[]>([])
  const [selectedConv,   setSelectedConv]   = useState<Conversation|null>(null)
  const [messages,       setMessages]       = useState<Message[]>([])
  const [input,          setInput]          = useState('')
  const [sending,        setSending]        = useState(false)
  const [loadingConvs,   setLoadingConvs]   = useState(true)
  const [loadingMsgs,    setLoadingMsgs]    = useState(false)
  const [search,         setSearch]         = useState('')
  const [isTyping,       setIsTyping]       = useState(false)
  const [showQuick,      setShowQuick]      = useState(false)
  const typingTimeout    = useRef<any>(null)

  const loadConversations = useCallback(async () => {
    setLoadingConvs(true)
    const field = userRole === 'client' ? 'client_id' : 'company_id'
    const { data } = await supabase
      .from('conversations')
      .select(`id,application_id,last_message,last_message_at,created_at,client_id,company_id,
        client:profiles!conversations_client_id_fkey(full_name),
        company:profiles!conversations_company_id_fkey(full_name),
        application:applications(title)`)
      .eq(field, userId)
      .order('last_message_at', { ascending:false })

    if (!data) { setLoadingConvs(false); return }

    const { data: unreadData } = await supabase
      .from('messages').select('conversation_id')
      .in('conversation_id', data.map(c=>c.id))
      .eq('is_read', false).neq('sender_id', userId)

    const unreadMap: Record<string,number> = {}
    ;(unreadData||[]).forEach(m => { unreadMap[m.conversation_id] = (unreadMap[m.conversation_id]||0)+1 })

    setConversations(data.map(c => ({
      id:              c.id,
      application_id:  c.application_id,
      last_message:    c.last_message||'',
      last_message_at: c.last_message_at||c.created_at,
      created_at:      c.created_at,
      other_id:    userRole==='client' ? c.company_id : c.client_id,
      other_name:  userRole==='client' ? (c.company as any)?.full_name||'Kompania' : (c.client as any)?.full_name||'Klienti',
      app_title:   (c.application as any)?.title,
      unread: unreadMap[c.id]||0,
    })))
    setLoadingConvs(false)
  }, [userId, userRole])

  useEffect(() => { loadConversations() }, [loadConversations])

  // Load messages + realtime
  useEffect(() => {
    if (!selectedConv) return
    setLoadingMsgs(true); setMessages([])

    supabase.from('messages').select('*').eq('conversation_id', selectedConv.id).order('created_at',{ascending:true})
      .then(({data}) => {
        setMessages(data||[]); setLoadingMsgs(false)
        supabase.from('messages').update({is_read:true}).eq('conversation_id',selectedConv.id).neq('sender_id',userId)
          .then(() => setConversations(prev => prev.map(c => c.id===selectedConv.id ? {...c,unread:0} : c)))
      })

    if (channelRef.current) supabase.removeChannel(channelRef.current)
    const channel = supabase.channel(`conv:${selectedConv.id}`)
      .on('postgres_changes', {event:'INSERT',schema:'public',table:'messages',filter:`conversation_id=eq.${selectedConv.id}`},
        payload => {
          const m = payload.new as Message
          setMessages(prev => prev.find(x=>x.id===m.id) ? prev : [...prev,m])
          if (m.sender_id !== userId) supabase.from('messages').update({is_read:true}).eq('id',m.id)
          setConversations(prev => prev.map(c => c.id===selectedConv.id ? {...c,last_message:m.content,last_message_at:m.created_at} : c))
          // Simulate typing stops when message arrives
          setIsTyping(false)
        })
      .subscribe()
    channelRef.current = channel
    return () => { supabase.removeChannel(channel) }
  }, [selectedConv?.id, userId])

  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:messages.length>15?'smooth':'instant'}) }, [messages])

  async function sendMessage(text?: string) {
    const t = (text || input).trim()
    if (!t || sending || !selectedConv) return
    setSending(true); setInput(''); setShowQuick(false)
    const tempMsg: Message = { id:`temp-${Date.now()}`, conversation_id:selectedConv.id, sender_id:userId, content:t, is_read:false, created_at:new Date().toISOString() }
    setMessages(prev => [...prev, tempMsg])
    try {
      const res  = await fetch('/api/messages/send', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({conversation_id:selectedConv.id,content:t,recipient_id:selectedConv.other_id}) })
      const data = await res.json()
      if (res.ok) setMessages(prev => prev.map(m => m.id===tempMsg.id ? data.message : m))
      else setMessages(prev => prev.filter(m => m.id!==tempMsg.id))
    } catch { setMessages(prev => prev.filter(m => m.id!==tempMsg.id)) }
    finally { setSending(false); inputRef.current?.focus() }
  }

  function handleKeyDown(e: React.KeyboardEvent) { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage()} }

  const filteredConvs = conversations.filter(c => c.other_name.toLowerCase().includes(search.toLowerCase()) || c.app_title?.toLowerCase().includes(search.toLowerCase())||false)
  const totalUnread   = conversations.reduce((s,c)=>s+c.unread,0)
  const grouped       = groupByDate(messages)
  const accentColor   = ROLE_COLOR[userRole] || '#e8621a'

  return (
    <div style={{ display:'flex', height:'calc(100vh - 130px)', background:'rgba(240,236,228,0.015)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:20, overflow:'hidden' }}>
      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes bounce  { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
        @keyframes msgIn   { from{opacity:0;transform:scale(0.95) translateY(4px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .conv-row:hover    { background:rgba(240,236,228,0.04)!important; }
        .conv-active       { background:rgba(232,98,26,0.08)!important; border-right:2px solid #e8621a!important; }
        .quick-reply:hover { background:rgba(240,236,228,0.1)!important; border-color:rgba(240,236,228,0.2)!important; transform:translateY(-1px); }
        textarea           { resize:none; }
        textarea:focus     { outline:none; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:rgba(240,236,228,0.1); border-radius:4px; }
      `}</style>

      {/* ── LEFT PANEL: Conversations ─────────────────────────── */}
      <div style={{ width:290, borderRight:'1px solid rgba(240,236,228,0.07)', display:'flex', flexDirection:'column', flexShrink:0 }}>

        {/* Header */}
        <div style={{ padding:'18px 16px 12px', borderBottom:'1px solid rgba(240,236,228,0.06)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <h2 style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:'1.05rem', letterSpacing:'-0.02em' }}>Bisedat</h2>
            {totalUnread > 0 && (
              <span style={{ background:'#e8621a', color:'#fff', fontSize:11, fontWeight:800, borderRadius:100, padding:'2px 9px', minWidth:20, textAlign:'center' }}>
                {totalUnread}
              </span>
            )}
          </div>
          {/* Search */}
          <div style={{ position:'relative' }}>
            <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', fontSize:12, opacity:0.35 }}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Kërko bisedë..."
              style={{ width:'100%', background:'rgba(240,236,228,0.05)', border:'1px solid rgba(240,236,228,0.08)', borderRadius:9, padding:'8px 12px 8px 28px', fontSize:12, color:'#f0ece4', fontFamily:'inherit', outline:'none', boxSizing:'border-box' }}/>
          </div>
        </div>

        {/* Conversation list */}
        <div style={{ flex:1, overflowY:'auto' }}>
          {loadingConvs ? (
            [1,2,3,4].map(i => (
              <div key={i} style={{ padding:'14px 16px', display:'flex', gap:10, alignItems:'center', borderBottom:'1px solid rgba(240,236,228,0.05)' }}>
                <div style={{ width:40, height:40, borderRadius:'50%', background:'rgba(240,236,228,0.06)', flexShrink:0, animation:'pulse 1.5s ease infinite' }}/>
                <div style={{ flex:1 }}>
                  <div style={{ height:11, background:'rgba(240,236,228,0.06)', borderRadius:4, marginBottom:6, width:'65%', animation:'pulse 1.5s ease infinite' }}/>
                  <div style={{ height:9, background:'rgba(240,236,228,0.04)', borderRadius:4, width:'80%', animation:'pulse 1.5s ease infinite' }}/>
                </div>
              </div>
            ))
          ) : filteredConvs.length === 0 ? (
            <div style={{ padding:'48px 20px', textAlign:'center', color:'rgba(240,236,228,0.3)' }}>
              <div style={{ fontSize:36, marginBottom:12 }}>💬</div>
              <div style={{ fontWeight:700, fontSize:13, marginBottom:6 }}>
                {search ? 'Nuk u gjet bisedë' : 'Nuk ka biseda ende'}
              </div>
              <p style={{ fontSize:12, lineHeight:1.65, opacity:.7 }}>
                {search ? 'Provo kërkim tjetër' : 'Bisedat shfaqen pas pranimit të ofertave.'}
              </p>
            </div>
          ) : filteredConvs.map(conv => (
            <button key={conv.id} onClick={() => setSelectedConv(conv)}
              className={`conv-row ${selectedConv?.id===conv.id?'conv-active':''}`}
              style={{ width:'100%', textAlign:'left', padding:'13px 16px', background:selectedConv?.id===conv.id?'rgba(232,98,26,0.08)':'transparent', border:'none', borderBottom:'1px solid rgba(240,236,228,0.05)', borderRight:`2px solid ${selectedConv?.id===conv.id?'#e8621a':'transparent'}`, cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s', display:'flex', gap:10, alignItems:'flex-start' }}>

              {/* Avatar */}
              <div style={{ width:40, height:40, borderRadius:'50%', background:`linear-gradient(135deg,${accentColor},${accentColor}88)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:'#fff', flexShrink:0, position:'relative' }}>
                {conv.other_name.slice(0,2).toUpperCase()}
                {conv.unread > 0 && (
                  <div style={{ position:'absolute', top:-2, right:-2, width:16, height:16, borderRadius:'50%', background:'#e8621a', border:'2px solid #0a0908', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:800, color:'#fff' }}>
                    {conv.unread > 9 ? '9+' : conv.unread}
                  </div>
                )}
              </div>

              {/* Content */}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:3 }}>
                  <span style={{ fontWeight:conv.unread>0?800:600, fontSize:13, color:'#f0ece4', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:140 }}>{conv.other_name}</span>
                  <span style={{ fontSize:10, color:'rgba(240,236,228,0.3)', flexShrink:0 }}>{timeAgo(conv.last_message_at)}</span>
                </div>
                {conv.app_title && (
                  <div style={{ fontSize:10, color:accentColor, fontWeight:700, marginBottom:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', opacity:0.8 }}>
                    📋 {conv.app_title}
                  </div>
                )}
                <p style={{ fontSize:12, color:conv.unread>0?'rgba(240,236,228,0.65)':'rgba(240,236,228,0.35)', fontWeight:conv.unread>0?600:400, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {conv.last_message || 'Fillo bisedën...'}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL: Chat window ──────────────────────────── */}
      {!selectedConv ? (
        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:40, textAlign:'center' }}>
          <div style={{ width:72, height:72, borderRadius:20, background:`${accentColor}12`, border:`1px solid ${accentColor}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, marginBottom:20 }}>💬</div>
          <div style={{ fontFamily:"'Fraunces',serif", fontSize:'1.15rem', fontWeight:800, marginBottom:8, color:'rgba(240,236,228,0.4)' }}>Zgjedh një bisedë</div>
          <p style={{ fontSize:13, color:'rgba(240,236,228,0.25)', lineHeight:1.7, maxWidth:220 }}>
            {conversations.length > 0 ? 'Klikoni mbi një bisedë nga lista.' : 'Bisedat shfaqen pas pranimit të ofertave.'}
          </p>
        </div>
      ) : (
        <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>

          {/* Chat header */}
          <div style={{ padding:'14px 20px', borderBottom:'1px solid rgba(240,236,228,0.07)', display:'flex', alignItems:'center', gap:12, background:'rgba(240,236,228,0.01)' }}>
            <div style={{ width:40, height:40, borderRadius:'50%', background:`linear-gradient(135deg,${accentColor},${accentColor}88)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:800, color:'#fff', flexShrink:0 }}>
              {selectedConv.other_name.slice(0,2).toUpperCase()}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:15, marginBottom:2 }}>{selectedConv.other_name}</div>
              {selectedConv.app_title && (
                <div style={{ fontSize:11, color:'rgba(240,236,228,0.35)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  📋 {selectedConv.app_title}
                </div>
              )}
            </div>
            {/* Unread badge */}
            {messages.filter(m=>m.sender_id!==userId&&!m.is_read).length > 0 && (
              <span style={{ fontSize:11, fontWeight:700, color:'#e8621a', background:'rgba(232,98,26,0.1)', border:'1px solid rgba(232,98,26,0.2)', borderRadius:20, padding:'3px 10px' }}>
                {messages.filter(m=>m.sender_id!==userId&&!m.is_read).length} të palexuara
              </span>
            )}
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'20px', display:'flex', flexDirection:'column', gap:0 }}>
            {loadingMsgs ? (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', gap:10, color:'rgba(240,236,228,0.4)', fontSize:14 }}>
                <div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.1)', borderTop:`2px solid ${accentColor}`, borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
                Duke ngarkuar...
              </div>
            ) : messages.length === 0 ? (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', textAlign:'center', gap:12 }}>
                <div style={{ fontSize:48 }}>👋</div>
                <div style={{ fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:'1.05rem', color:'rgba(240,236,228,0.5)' }}>Fillo bisedën</div>
                <p style={{ fontSize:13, color:'rgba(240,236,228,0.3)', lineHeight:1.65, maxWidth:220 }}>Dërgoni mesazhin e parë tek {selectedConv.other_name}</p>
                {/* Quick start suggestions */}
                <div style={{ display:'flex', flexWrap:'wrap', gap:6, justifyContent:'center', marginTop:8 }}>
                  {QUICK_REPLIES.slice(0,3).map(q => (
                    <button key={q} onClick={() => sendMessage(q)} className="quick-reply"
                      style={{ padding:'7px 14px', borderRadius:20, border:'1px solid rgba(240,236,228,0.1)', background:'rgba(240,236,228,0.04)', color:'rgba(240,236,228,0.6)', fontFamily:'inherit', fontSize:12, fontWeight:600, cursor:'pointer', transition:'all 0.2s' }}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              grouped.map(group => (
                <div key={group.date}>
                  {/* Date separator */}
                  <div style={{ display:'flex', alignItems:'center', gap:10, margin:'16px 0 10px' }}>
                    <div style={{ flex:1, height:1, background:'rgba(240,236,228,0.06)' }}/>
                    <span style={{ fontSize:10, color:'rgba(240,236,228,0.3)', fontWeight:700, whiteSpace:'nowrap', padding:'3px 10px', background:'rgba(240,236,228,0.04)', borderRadius:20, border:'1px solid rgba(240,236,228,0.07)' }}>
                      {group.date}
                    </span>
                    <div style={{ flex:1, height:1, background:'rgba(240,236,228,0.06)' }}/>
                  </div>

                  <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                    {group.msgs.map((msg, i) => {
                      const isMe     = msg.sender_id === userId
                      const isTemp   = msg.id.startsWith('temp-')
                      const prevMsg  = group.msgs[i-1]
                      const nextMsg  = group.msgs[i+1]
                      const showAvatar = !isMe && (!prevMsg || prevMsg.sender_id !== msg.sender_id)
                      const isLast   = !nextMsg || nextMsg.sender_id !== msg.sender_id
                      const isFirst  = !prevMsg || prevMsg.sender_id !== msg.sender_id

                      return (
                        <div key={msg.id} style={{ display:'flex', justifyContent:isMe?'flex-end':'flex-start', gap:8, alignItems:'flex-end', animation:isTemp?'none':'msgIn 0.2s ease', marginBottom: isLast ? 8 : 2 }}>

                          {/* Other avatar */}
                          {!isMe && (
                            <div style={{ width:28, height:28, borderRadius:'50%', background:showAvatar&&isFirst?`linear-gradient(135deg,${accentColor},${accentColor}88)`:'transparent', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800, color:'#fff', flexShrink:0 }}>
                              {showAvatar&&isFirst ? selectedConv.other_name.slice(0,2).toUpperCase() : ''}
                            </div>
                          )}

                          <div style={{ maxWidth:'68%' }}>
                            {/* Sender name (first bubble only) */}
                            {!isMe && isFirst && (
                              <div style={{ fontSize:10, fontWeight:700, color:'rgba(240,236,228,0.4)', marginBottom:4, paddingLeft:2 }}>
                                {selectedConv.other_name}
                              </div>
                            )}
                            {/* Bubble */}
                            <div style={{
                              padding:'10px 14px',
                              borderRadius: isMe
                                ? (isFirst?'16px 16px 4px 16px':'16px 4px 4px 16px')
                                : (isFirst?'4px 16px 16px 16px':'4px 16px 16px 4px'),
                              background: isMe
                                ? `linear-gradient(135deg,${accentColor},${accentColor}cc)`
                                : 'rgba(240,236,228,0.06)',
                              border: isMe ? 'none' : '1px solid rgba(240,236,228,0.07)',
                              color: isMe ? '#fff' : '#f0ece4',
                              fontSize:14, lineHeight:1.6,
                              opacity: isTemp ? 0.65 : 1,
                              wordBreak:'break-word',
                              boxShadow: isMe ? `0 2px 12px ${accentColor}30` : 'none',
                              transition:'opacity 0.2s',
                            }}>
                              {msg.content}
                            </div>
                            {/* Timestamp + read status */}
                            {isLast && (
                              <div style={{ fontSize:10, color:'rgba(240,236,228,0.3)', marginTop:4, textAlign:isMe?'right':'left', display:'flex', alignItems:'center', justifyContent:isMe?'flex-end':'flex-start', gap:4 }}>
                                {formatTime(msg.created_at)}
                                {isMe && !isTemp && (
                                  <span style={{ color:msg.is_read?'#60a5fa':'rgba(240,236,228,0.3)', fontSize:12, fontWeight:700 }}>
                                    {msg.is_read ? '✓✓' : '✓'}
                                  </span>
                                )}
                                {isTemp && <span style={{ animation:'pulse 1s ease infinite' }}>●</span>}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))
            )}

            {/* Typing indicator */}
            {isTyping && (
              <div style={{ display:'flex', alignItems:'flex-end', gap:8, marginTop:4 }}>
                <div style={{ width:28, height:28, borderRadius:'50%', background:`linear-gradient(135deg,${accentColor},${accentColor}88)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800, color:'#fff', flexShrink:0 }}>
                  {selectedConv.other_name.slice(0,2).toUpperCase()}
                </div>
                <div style={{ padding:'10px 16px', borderRadius:'4px 16px 16px 16px', background:'rgba(240,236,228,0.06)', border:'1px solid rgba(240,236,228,0.08)', display:'flex', gap:4, alignItems:'center' }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:'rgba(240,236,228,0.4)', animation:`bounce 1.2s ease ${i*0.15}s infinite` }}/>
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef}/>
          </div>

          {/* Quick replies */}
          {showQuick && messages.length > 0 && (
            <div style={{ padding:'8px 16px', borderTop:'1px solid rgba(240,236,228,0.06)', display:'flex', gap:6, flexWrap:'wrap', background:'rgba(240,236,228,0.01)' }}>
              {QUICK_REPLIES.map(q => (
                <button key={q} onClick={() => sendMessage(q)} className="quick-reply"
                  style={{ padding:'6px 12px', borderRadius:20, border:'1px solid rgba(240,236,228,0.1)', background:'rgba(240,236,228,0.04)', color:'rgba(240,236,228,0.6)', fontFamily:'inherit', fontSize:12, fontWeight:600, cursor:'pointer', transition:'all 0.2s', whiteSpace:'nowrap' }}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input area */}
          <div style={{ padding:'12px 16px', borderTop:'1px solid rgba(240,236,228,0.07)', background:'rgba(240,236,228,0.01)' }}>
            <div style={{ display:'flex', gap:8, alignItems:'flex-end' }}>

              {/* Quick replies toggle */}
              <button onClick={() => setShowQuick(p=>!p)} title="Përgjigje të shpejta"
                style={{ width:38, height:38, borderRadius:11, border:`1px solid ${showQuick?accentColor:'rgba(240,236,228,0.1)'}`, background:showQuick?`${accentColor}15`:'rgba(240,236,228,0.04)', color:showQuick?accentColor:'rgba(240,236,228,0.4)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, transition:'all 0.2s', flexShrink:0 }}>
                ⚡
              </button>

              {/* Textarea */}
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Shkruaj tek ${selectedConv.other_name}... (Enter për dërgim)`}
                rows={1}
                style={{ flex:1, background:'rgba(240,236,228,0.05)', border:'1px solid rgba(240,236,228,0.1)', borderRadius:13, padding:'10px 14px', fontSize:14, color:'#f0ece4', fontFamily:'inherit', lineHeight:1.5, maxHeight:100, overflowY:'auto', boxSizing:'border-box' }}
                onInput={e => { const t=e.target as HTMLTextAreaElement; t.style.height='auto'; t.style.height=Math.min(t.scrollHeight,100)+'px' }}
              />

              {/* Send button */}
              <button onClick={() => sendMessage()} disabled={!input.trim()||sending}
                style={{ width:42, height:42, borderRadius:13, border:'none', background:input.trim()&&!sending?`linear-gradient(135deg,${accentColor},${accentColor}cc)`:'rgba(240,236,228,0.07)', color:input.trim()&&!sending?'#fff':'rgba(240,236,228,0.25)', cursor:input.trim()&&!sending?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, transition:'all 0.2s', flexShrink:0, boxShadow:input.trim()&&!sending?`0 4px 16px ${accentColor}35`:'none' }}>
                {sending
                  ? <div style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid #fff', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
                  : '↑'}
              </button>
            </div>
            <p style={{ fontSize:10, color:'rgba(240,236,228,0.2)', marginTop:6 }}>Enter · dërgim &nbsp;·&nbsp; Shift+Enter · rresht i ri</p>
          </div>
        </div>
      )}
    </div>
  )
}