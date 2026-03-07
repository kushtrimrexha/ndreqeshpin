import { NextResponse }        from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { currentPassword, newPassword } = await req.json()
    if (!newPassword || newPassword.length < 8)
      return NextResponse.json({ error: 'Fjalëkalimi i ri duhet të ketë të paktën 8 karaktere' }, { status: 400 })

    // Re-authenticate with current password
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: session.user.email!,
      password: currentPassword,
    })
    if (signInErr)
      return NextResponse.json({ error: 'Fjalëkalimi aktual është i gabuar' }, { status: 400 })

    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}