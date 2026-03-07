'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Message {
  id: string; conversation_id: string; sender_id: string
  content: string; is_read: boolean; created_at: string
}
interface Conversation {
  id: string; application_id: string; last_message: string
  last_message_at: string; created_at: string
  other_name: string; other_id: string; unread: number
}
interface Props {
  userId:    string
  userRole:  'client' | 'company' | 'worker'
  userName:  string
}

function timeAgo(d: string) {
  const diff  = Date.now() - new Date(d).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  if (mins  < 1)  return 'Tani'
  if (mins  < 60) return `${mins}m`
  if (hours < 24) return `${hours}h`
  return new Date(d).toLocaleDateString('sq-AL', { day:'numeric', month:'short' })
}

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString('sq-AL', { hour: '2-digit', minute: '2-digit' })
}

function groupByDate(messages: Message[]) {
  const groups: { date: string; msgs: Message[] }[] = []
  messages.forEach(msg => {
    const date = new Date(msg.created_at).toLocaleDateString('sq-AL', { weekday:'long', day:'numeric', month:'long' })
    const last = groups[groups.length - 1]
    if (last && last.date === date) last.msgs.push(msg)
    else groups.push({ date, msgs: [msg] })
  })
  return groups
}

export default function ChatInterface({ userId, userRole, userName }: Props) {
  const supabase        = createClient()
  const bottomRef       = useRef<HTMLDivElement>(null)
  const inputRef        = useRef<HTMLTextAreaElement>(null)
  const channelRef      = useRef<any>(null)

  const [conversations, setConversations]   = useState<Conversation[]>([])
  const [selectedConv,  setSelectedConv]    = useState<Conversation | null>(null)
  const [messages,      setMessages]        = useState<Message[]>([])
  const [input,         setInput]           = useState('')
  const [sending,       setSending]         = useState(false)
  const [loadingConvs,  setLoadingConvs]    = useState(true)
  const [loadingMsgs,   setLoadingMsgs]     = useState(false)
  const [typing,        setTyping]          = useState(false)

  // ── Load conversations ─────────────────────────────────────
  const loadConversations = useCallback(async () => {
    setLoadingConvs(true)
    const field = userRole === 'client' ? 'client_id' : 'company_id'

    const { data } = await supabase
      .from('conversations')
      .select(`
        id, application_id, last_message, last_message_at, created_at,
        client_id, company_id,
        client:profiles!conversations_client_id_fkey(full_name),
        company:profiles!conversations_company_id_fkey(full_name)
      `)
      .eq(field, userId)
      .order('last_message_at', { ascending: false })

    if (!data) { setLoadingConvs(false); return }

    // Count unread per conversation
    const convIds = data.map(c => c.id)
    const { data: unreadData } = await supabase
      .from('messages')
      .select('conversation_id')
      .in('conversation_id', convIds)
      .eq('is_read', false)
      .neq('sender_id', userId)

    const unreadMap: Record<string, number> = {}
    ;(unreadData || []).forEach(m => {
      unreadMap[m.conversation_id] = (unreadMap[m.conversation_id] || 0) + 1
    })

    const mapped: Conversation[] = data.map(c => ({
      id:              c.id,
      application_id:  c.application_id,
      last_message:    c.last_message || '',
      last_message_at: c.last_message_at || c.created_at,
      created_at:      c.created_at,
      other_id:    userRole === 'client' ? c.company_id : c.client_id,
      other_name:  userRole === 'client'
        ? (c.company as any)?.full_name || 'Kompania'
        : (c.client  as any)?.full_name || 'Klienti',
      unread: unreadMap[c.id] || 0,
    }))

    setConversations(mapped)
    setLoadingConvs(false)
  }, [userId, userRole])

  useEffect(() => { loadConversations() }, [loadConversations])

  // ── Load messages when conversation selected ───────────────
  useEffect(() => {
    if (!selectedConv) return
    setLoadingMsgs(true)
    setMessages([])

    supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', selectedConv.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setMessages(data || [])
        setLoadingMsgs(false)
        // Mark as read
        supabase.from('messages').update({ is_read: true })
          .eq('conversation_id', selectedConv.id)
          .neq('sender_id', userId)
          .then(() => {
            setConversations(prev => prev.map(c =>
              c.id === selectedConv.id ? { ...c, unread: 0 } : c
            ))
          })
      })

    // ── Realtime subscription ──────────────────────────────
    if (channelRef.current) supabase.removeChannel(channelRef.current)

    const channel = supabase
      .channel(`conv:${selectedConv.id}`)
      .on('postgres_changes', {
        event:  'INSERT',
        schema: 'public',
        table:  'messages',
        filter: `conversation_id=eq.${selectedConv.id}`,
      }, (payload) => {
        const newMsg = payload.new as Message
        setMessages(prev => {
          if (prev.find(m => m.id === newMsg.id)) return prev
          return [...prev, newMsg]
        })
        // Auto-mark as read if from other person
        if (newMsg.sender_id !== userId) {
          supabase.from('messages').update({ is_read: true }).eq('id', newMsg.id)
        }
        // Update last message in conversation list
        setConversations(prev => prev.map(c =>
          c.id === selectedConv.id
            ? { ...c, last_message: newMsg.content, last_message_at: newMsg.created_at }
            : c
        ))
      })
      .subscribe()

    channelRef.current = channel
    return () => { supabase.removeChannel(channel) }
  }, [selectedConv?.id, userId])

  // ── Scroll to bottom on new messages ──────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: messages.length > 10 ? 'smooth' : 'instant' })
  }, [messages])

  // ── Send message ───────────────────────────────────────────
  async function sendMessage() {
    const text = input.trim()
    if (!text || sending || !selectedConv) return
    setSending(true)
    setInput('')

    // Optimistic update
    const tempMsg: Message = {
      id: `temp-${Date.now()}`, conversation_id: selectedConv.id,
      sender_id: userId, content: text, is_read: false,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, tempMsg])

    try {
      const res  = await fetch('/api/messages/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id: selectedConv.id, content: text, recipient_id: selectedConv.other_id }),
      })
      const data = await res.json()
      if (res.ok) {
        // Replace temp with real
        setMessages(prev => prev.map(m => m.id === tempMsg.id ? data.message : m))
      } else {
        setMessages(prev => prev.filter(m => m.id !== tempMsg.id))
      }
    } catch {
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id))
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const totalUnread = conversations.reduce((s, c) => s + c.unread, 0)
  const grouped     = groupByDate(messages)

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 130px)', gap: 0, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, overflow: 'hidden' }}>
      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes blink   { 0%,80%,100%{opacity:0} 40%{opacity:1} }
        .conv-item:hover   { background:rgba(255,255,255,0.05) !important; }
        .conv-active       { background:rgba(232,98,26,0.1) !important; border-right:2px solid #e8621a !important; }
        textarea:focus     { outline:none; }
        textarea           { resize:none; }
      `}</style>

      {/* ── LEFT: Conversation list ────────── */}
      <div style={{ width: 300, borderRight: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

        {/* Header */}
        <div style={{ padding: '20px 18px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontFamily: "'Fraunces',serif", fontWeight: 900, fontSize: '1.1rem' }}>Bisedat</h2>
            {totalUnread > 0 && (
              <span style={{ background: '#e8621a', color: '#fff', fontSize: 11, fontWeight: 800, borderRadius: 100, padding: '2px 8px', minWidth: 20, textAlign: 'center' as const }}>{totalUnread}</span>
            )}
          </div>
          <div style={{ position: 'relative' as const }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, opacity: 0.35 }}>🔍</span>
            <input placeholder="Kërko bisedë..." style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9, padding: '8px 12px 8px 30px', fontSize: 12, color: '#e8eaf0', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' as const }} />
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loadingConvs ? (
            [1,2,3].map(i => (
              <div key={i} style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', flexShrink: 0, animation: 'pulse 1.5s ease infinite' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 12, background: 'rgba(255,255,255,0.06)', borderRadius: 4, marginBottom: 7, width: '70%', animation: 'pulse 1.5s ease infinite' }} />
                  <div style={{ height: 10, background: 'rgba(255,255,255,0.04)', borderRadius: 4, width: '50%', animation: 'pulse 1.5s ease infinite' }} />
                </div>
              </div>
            ))
          ) : conversations.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: 'rgba(232,234,240,0.3)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>Nuk ka biseda ende</div>
              <p style={{ fontSize: 12, lineHeight: 1.6 }}>Bisedat do të shfaqen pas pranimit të një oferte.</p>
            </div>
          ) : conversations.map(conv => (
            <button key={conv.id} onClick={() => setSelectedConv(conv)}
              className={`conv-item ${selectedConv?.id === conv.id ? 'conv-active' : ''}`}
              style={{ width: '100%', textAlign: 'left', padding: '14px 18px', background: selectedConv?.id === conv.id ? 'rgba(232,98,26,0.1)' : 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', borderRight: selectedConv?.id === conv.id ? '2px solid #e8621a' : '2px solid transparent', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', display: 'flex', gap: 12, alignItems: 'flex-start' }}>

              {/* Avatar */}
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: `linear-gradient(135deg,#e8621a,#ff7c35)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: '#fff', flexShrink: 0, position: 'relative' as const }}>
                {conv.other_name.slice(0,2).toUpperCase()}
                {conv.unread > 0 && (
                  <div style={{ position: 'absolute', top: -2, right: -2, width: 16, height: 16, borderRadius: '50%', background: '#e8621a', border: '2px solid #080b12', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: '#fff' }}>
                    {conv.unread > 9 ? '9+' : conv.unread}
                  </div>
                )}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontWeight: conv.unread > 0 ? 800 : 600, fontSize: 13, color: '#e8eaf0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, maxWidth: 150 }}>{conv.other_name}</span>
                  <span style={{ fontSize: 11, color: 'rgba(232,234,240,0.3)', flexShrink: 0 }}>{timeAgo(conv.last_message_at)}</span>
                </div>
                <p style={{ fontSize: 12, color: conv.unread > 0 ? 'rgba(232,234,240,0.7)' : 'rgba(232,234,240,0.4)', fontWeight: conv.unread > 0 ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{conv.last_message || 'Fillo bisedën...'}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── RIGHT: Chat window ─────────────── */}
      {!selectedConv ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(232,98,26,0.08)', border: '1px solid rgba(232,98,26,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, marginBottom: 20 }}>💬</div>
          <div style={{ fontFamily: "'Fraunces',serif", fontSize: '1.15rem', fontWeight: 800, marginBottom: 8, color: 'rgba(232,234,240,0.5)' }}>Zgjedh një bisedë</div>
          <p style={{ fontSize: 13, color: 'rgba(232,234,240,0.3)', lineHeight: 1.7, maxWidth: 240 }}>Kliko mbi një bisedë nga lista për të filluar komunikimin</p>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          {/* Chat header */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#e8621a,#ff7c35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff' }}>
              {selectedConv.other_name.slice(0,2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{selectedConv.other_name}</div>
              <div style={{ fontSize: 11, color: '#22d3a5', display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22d3a5' }} /> Online
              </div>
            </div>
          </div>

          {/* Messages area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 0 }}>
            {loadingMsgs ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 10, color: 'rgba(232,234,240,0.4)' }}>
                <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.1)', borderTop: '2px solid #e8621a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Duke ngarkuar...
              </div>
            ) : messages.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', color: 'rgba(232,234,240,0.3)' }}>
                <div style={{ fontSize: 44, marginBottom: 14 }}>👋</div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Filloni bisedën</div>
                <p style={{ fontSize: 13, lineHeight: 1.65 }}>Dërgoni mesazhin e parë tek {selectedConv.other_name}</p>
              </div>
            ) : (
              grouped.map(group => (
                <div key={group.date}>
                  {/* Date separator */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                    <span style={{ fontSize: 11, color: 'rgba(232,234,240,0.3)', fontWeight: 600, whiteSpace: 'nowrap' as const }}>{group.date}</span>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {group.msgs.map((msg, i) => {
                      const isMe    = msg.sender_id === userId
                      const isTemp  = msg.id.startsWith('temp-')
                      const showAvatar = !isMe && (i === 0 || group.msgs[i-1].sender_id !== msg.sender_id)

                      return (
                        <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'flex-end', animation: isTemp ? 'none' : 'fadeUp 0.2s ease' }}>

                          {/* Other person avatar */}
                          {!isMe && (
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: showAvatar ? 'linear-gradient(135deg,#e8621a,#ff7c35)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                              {showAvatar ? selectedConv.other_name.slice(0,2).toUpperCase() : ''}
                            </div>
                          )}

                          {/* Bubble */}
                          <div style={{ maxWidth: '68%' }}>
                            <div style={{
                              padding: '10px 14px',
                              borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                              background: isMe
                                ? 'linear-gradient(135deg,#e8621a,#ff7c35)'
                                : 'rgba(255,255,255,0.07)',
                              color: isMe ? '#fff' : '#e8eaf0',
                              fontSize: 14, lineHeight: 1.6,
                              opacity: isTemp ? 0.65 : 1,
                              wordBreak: 'break-word' as const,
                              boxShadow: isMe ? '0 2px 12px rgba(232,98,26,0.25)' : 'none',
                            }}>
                              {msg.content}
                            </div>
                            <div style={{ fontSize: 10, color: 'rgba(232,234,240,0.3)', marginTop: 4, textAlign: isMe ? 'right' : 'left', display: 'flex', alignItems: 'center', justifyContent: isMe ? 'flex-end' : 'flex-start', gap: 4 }}>
                              {formatTime(msg.created_at)}
                              {isMe && !isTemp && (
                                <span style={{ color: msg.is_read ? '#60a5fa' : 'rgba(232,234,240,0.3)', fontSize: 11 }}>
                                  {msg.is_read ? '✓✓' : '✓'}
                                </span>
                              )}
                              {isTemp && <span style={{ animation: 'pulse 1s ease infinite' }}>●</span>}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => { setInput(e.target.value) }}
                onKeyDown={handleKeyDown}
                placeholder={`Shkruaj mesazh tek ${selectedConv.other_name}...`}
                rows={1}
                style={{
                  flex: 1, background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 13, padding: '12px 16px',
                  fontSize: 14, color: '#e8eaf0',
                  fontFamily: 'inherit', lineHeight: 1.5,
                  maxHeight: 120, overflowY: 'auto' as const,
                  boxSizing: 'border-box' as const,
                }}
                onInput={e => {
                  const t = e.target as HTMLTextAreaElement
                  t.style.height = 'auto'
                  t.style.height = Math.min(t.scrollHeight, 120) + 'px'
                }}
              />
              <button onClick={sendMessage} disabled={!input.trim() || sending}
                style={{
                  width: 46, height: 46, borderRadius: 13, border: 'none',
                  background: input.trim() && !sending ? 'linear-gradient(135deg,#e8621a,#ff7c35)' : 'rgba(255,255,255,0.07)',
                  color: input.trim() && !sending ? '#fff' : 'rgba(232,234,240,0.3)',
                  cursor: input.trim() && !sending ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, transition: 'all 0.2s', flexShrink: 0,
                  boxShadow: input.trim() && !sending ? '0 4px 16px rgba(232,98,26,0.3)' : 'none',
                }}>
                {sending
                  ? <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  : '↑'
                }
              </button>
            </div>
            <p style={{ fontSize: 11, color: 'rgba(232,234,240,0.25)', marginTop: 8 }}>Enter për dërgim · Shift+Enter për rresht të ri</p>
          </div>
        </div>
      )}
    </div>
  )
}