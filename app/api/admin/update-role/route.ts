import { NextResponse }        from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { supabaseAdmin }        from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Nuk ke leje admin' }, { status: 403 })
    }

    const { user_id, role } = await req.json()
    if (!user_id || !role) return NextResponse.json({ error: 'user_id dhe role mungojnë' }, { status: 400 })

    const validRoles = ['client', 'company', 'worker', 'admin']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Rol i pavlefshëm' }, { status: 400 })
    }

    // Mos lejo të ndryshosh rolin e vetes
    if (user_id === session.user.id) {
      return NextResponse.json({ error: 'Nuk mund të ndryshosh rolin tënd' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', user_id)

    if (error) throw error

    return NextResponse.json({ success: true, role })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}