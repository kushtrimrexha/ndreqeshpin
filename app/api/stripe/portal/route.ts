import { NextResponse }          from 'next/server'
import { createServerSupabase }  from '@/lib/supabase/server'
import { stripe, createPortalSession, getOrCreateCustomer } from '@/lib/stripe'
import { supabaseAdmin }         from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabaseAdmin
      .from('profiles').select('full_name, role').eq('id', session.user.id).single()

    const customer = await getOrCreateCustomer(session.user.id, session.user.email!, profile?.full_name || '')
    const baseUrl  = process.env.NEXT_PUBLIC_APP_URL || 'https://ndreqeshpin.com'

    const portalSession = await createPortalSession(
      customer.id,
      `${baseUrl}/${profile?.role || 'client'}/settings`
    )

    return NextResponse.json({ url: portalSession.url })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}