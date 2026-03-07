import { NextResponse }   from 'next/server'
import { supabaseAdmin }  from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const {
      email, password, full_name, role,
      city, phone, business_name,
    } = await req.json()

    // Validim
    if (!email || !password || !full_name || !role) {
      return NextResponse.json(
        { error: 'Fushat e detyrueshme mungojnë.' },
        { status: 400 }
      )
    }

    // 1. Krijo userin
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name, role },
      })

      console.error('Auth error details:', authError)

    if (authError) {
      if (authError.message.toLowerCase().includes('already')) {
        return NextResponse.json(
          { error: 'Ky email është i regjistruar tashmë.' },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    const userId = authData.user.id

    // 2. Update profile
    await supabaseAdmin
      .from('profiles')
      .update({ full_name, role, city: city || null, phone: phone || null })
      .eq('id', userId)

    // 3. Kompani
    if (role === 'company' && business_name) {
      await supabaseAdmin
        .from('companies')
        .insert({ profile_id: userId, business_name })
    }

    // 4. Punëtor
    if (role === 'worker') {
      await supabaseAdmin
        .from('workers')
        .insert({ profile_id: userId })
    }

    return NextResponse.json({ success: true, userId })

  } catch (err: any) {
    console.error('Register error:', err)
    return NextResponse.json(
      { error: 'Gabim i brendshëm.' },
      { status: 500 }
    )
  }
}