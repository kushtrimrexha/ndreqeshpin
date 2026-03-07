import { NextResponse }          from 'next/server'
import { createServerSupabase }  from '@/lib/supabase/server'
import { supabaseAdmin }         from '@/lib/supabase/admin'
import { stripe, PRICES, getOrCreateCustomer, createCheckoutSession } from '@/lib/stripe'

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { planType } = await req.json() // 'monthly' | 'yearly'
    const priceId = planType === 'yearly' ? PRICES.yearly : PRICES.monthly
    if (!priceId) return NextResponse.json({ error: 'Plan i pavlefshëm' }, { status: 400 })

    const { data: profile } = await supabaseAdmin
      .from('profiles').select('full_name, email').eq('id', session.user.id).single()
    if (!profile) return NextResponse.json({ error: 'Profili nuk u gjet' }, { status: 404 })

    const customer = await getOrCreateCustomer(session.user.id, session.user.email!, profile.full_name)

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ndreqeshpin.com'
    const role    = (await supabaseAdmin.from('profiles').select('role').eq('id', session.user.id).single()).data?.role || 'client'

    const checkoutSession = await createCheckoutSession({
      customerId:  customer.id,
      priceId,
      userId:      session.user.id,
      successUrl: `${baseUrl}/${role}/dashboard?premium=success`,
      cancelUrl:  `${baseUrl}/pricing`,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (err: any) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}