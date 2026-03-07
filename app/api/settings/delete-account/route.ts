import { NextResponse }        from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { supabaseAdmin }        from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { password, confirmation } = await req.json()
    if (confirmation !== 'FSHI LLOGARINË')
      return NextResponse.json({ error: 'Konfirmimi nuk është i saktë' }, { status: 400 })

    // Verify password
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: session.user.email!,
      password,
    })
    if (signInErr)
      return NextResponse.json({ error: 'Fjalëkalimi është i gabuar' }, { status: 400 })

    // Delete user from auth (cascades to profiles via DB)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(session.user.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}