import { createServerSupabase } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export interface NotificationPayload {
  user_id: string
  title: string
  message: string
  type?: 'offer' | 'message' | 'review' | 'payment' | 'system'
  link?: string
}

// Internal helper — can also be used directly from other server-side code
export async function sendNotification(payload: NotificationPayload) {
  const supabase = createServerSupabase()
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: payload.user_id,
      title: payload.title,
      message: payload.message,
      type: payload.type || 'system',
      link: payload.link || null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Send to multiple users at once
export async function sendNotificationBulk(payloads: NotificationPayload[]) {
  const supabase = createServerSupabase()
  const { data, error } = await supabase
    .from('notifications')
    .insert(payloads.map(p => ({
      user_id: p.user_id,
      title: p.title,
      message: p.message,
      type: p.type || 'system',
      link: p.link || null,
    })))
    .select()

  if (error) throw error
  return data
}

// POST /api/notifications/send — for internal API calls
export async function POST(req: Request) {
  try {
    const supabase = createServerSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Only admin can send notifications via API directly
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json() as NotificationPayload | NotificationPayload[]
    const payloads = Array.isArray(body) ? body : [body]

    const result = await sendNotificationBulk(payloads)
    return NextResponse.json({ ok: true, sent: result?.length || 0 })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}