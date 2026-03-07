import { NextResponse }        from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { newEmail, password } = await req.json()
    if (!newEmail) return NextResponse.json({ error: 'Email-i i ri është i detyrueshëm' }, { status: 400 })

    // Verify password first
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: session.user.email!,
      password,
    })
    if (signInErr)
      return NextResponse.json({ error: 'Fjalëkalimi është i gabuar' }, { status: 400 })

    const { error } = await supabase.auth.updateUser({ email: newEmail })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ success: true, message: 'Konfirmo email-in e ri nga kutia hyrëse.' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}