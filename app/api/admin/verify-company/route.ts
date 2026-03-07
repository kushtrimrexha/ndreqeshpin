import { NextResponse }        from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { supabaseAdmin }        from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verifiko që është admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Nuk ke leje admin' }, { status: 403 })
    }

    const { company_id, is_verified } = await req.json()
    if (!company_id) return NextResponse.json({ error: 'company_id mungon' }, { status: 400 })

    const { error } = await supabaseAdmin
      .from('companies')
      .update({ is_verified, updated_at: new Date().toISOString() })
      .eq('id', company_id)

    if (error) throw error

    // Dërgo notifikim tek kompania
    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('profile_id, business_name')
      .eq('id', company_id)
      .single()

    if (company?.profile_id) {
      await supabaseAdmin.from('notifications').insert({
        user_id: company.profile_id,
        type:    is_verified ? 'account_verified' : 'account_unverified',
        title:   is_verified ? '✅ Llogaria u verifikua!' : '⚠️ Verifikimi u hoq',
        message: is_verified
          ? `Kompania "${company.business_name}" u verifikua me sukses. Tani mund të dërgoni oferta.`
          : `Verifikimi i kompanisë "${company.business_name}" u hoq nga administratori.`,
        is_read: false,
      })
    }

    return NextResponse.json({ success: true, is_verified })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}