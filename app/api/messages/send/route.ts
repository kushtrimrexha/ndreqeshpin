import { NextResponse }          from 'next/server'
import { createServerSupabase }  from '@/lib/supabase/server'
import { supabaseAdmin }         from '@/lib/supabase/admin'
import { sendNewMessageEmail }   from '@/lib/email/sender'

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { conversation_id, content } = await req.json()
    if (!conversation_id || !content?.trim()) {
      return NextResponse.json({ error: 'Fushat e detyrueshme mungojnë' }, { status: 400 })
    }

    // Fetch conversation participants
    const { data: conv } = await supabaseAdmin
      .from('conversations')
      .select('participant_one, participant_two')
      .eq('id', conversation_id)
      .single()

    if (!conv) return NextResponse.json({ error: 'Konversacioni nuk u gjet' }, { status: 404 })

    // Verify sender is participant
    if (conv.participant_one !== session.user.id && conv.participant_two !== session.user.id) {
      return NextResponse.json({ error: 'Nuk ke leje' }, { status: 403 })
    }

    // Insert message
    const { data: message, error } = await supabaseAdmin.from('messages').insert({
      conversation_id,
      sender_id: session.user.id,
      content:   content.trim(),
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Update conversation last_message_at
    await supabaseAdmin.from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversation_id)

    // Determine receiver
    const receiverId = conv.participant_one === session.user.id
      ? conv.participant_two
      : conv.participant_one

    const [{ data: sender }, { data: receiver }] = await Promise.all([
      supabaseAdmin.from('profiles').select('full_name').eq('id', session.user.id).single(),
      supabaseAdmin.from('profiles').select('full_name, email, role, notification_prefs').eq('id', receiverId).single(),
    ])

    const senderName = sender?.full_name || 'Dikush'

    // In-app notification
    await supabaseAdmin.from('notifications').insert({
      user_id: receiverId,
      type:    'message',
      title:   `💬 Mesazh nga ${senderName}`,
      message: content.trim().length > 80 ? content.trim().slice(0,80) + '...' : content.trim(),
      is_read: false,
    })

    // Email notification — only if enabled in preferences
    const prefs = receiver?.notification_prefs as any
    const emailEnabled = prefs?.email_messages !== false // default true

    if (receiver?.email && emailEnabled) {
      await sendNewMessageEmail(receiver.email, {
        receiverName: receiver.full_name,
        senderName,
        preview:      content.trim(),
        role:         receiver.role,
      })
    }

    return NextResponse.json({ message })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}