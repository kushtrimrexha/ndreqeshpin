import { NextResponse }        from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { supabaseAdmin }        from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { ids, all } = await req.json()

    if (all) {
      await supabaseAdmin.from('notifications').update({ is_read: true }).eq('user_id', session.user.id)
    } else if (ids?.length) {
      await supabaseAdmin.from('notifications').update({ is_read: true }).in('id', ids).eq('user_id', session.user.id)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}