import { NextResponse }             from 'next/server'
import { headers }                   from 'next/headers'
import { constructWebhookEvent }     from '@/lib/stripe'
import { supabaseAdmin }             from '@/lib/supabase/admin'
import { sendPremiumActivatedEmail } from '@/lib/email/sender'
import Stripe from 'stripe'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const body      = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) return NextResponse.json({ error: 'No signature' }, { status: 400 })

  let event: Stripe.Event

  try {
    event = constructWebhookEvent(body, signature)
  } catch (err: any) {
    console.error('Webhook signature error:', err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  try {
    switch (event.type) {

      // ── Subscription created / activated ──────────────────────
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub        = event.data.object as Stripe.Subscription
        const userId     = sub.metadata?.supabase_uid
        if (!userId) break

        const isActive   = sub.status === 'active' || sub.status === 'trialing'
        const planType   = sub.items.data[0]?.plan?.interval === 'year' ? 'yearly' : 'monthly'
        const periodEnd  = new Date(sub.current_period_end * 1000).toISOString()

        await supabaseAdmin.from('profiles').update({
          package_type:           isActive ? 'premium' : 'free',
          stripe_customer_id:     sub.customer as string,
          stripe_subscription_id: sub.id,
          premium_plan_type:      planType,
          premium_expires_at:     periodEnd,
          updated_at:             new Date().toISOString(),
        }).eq('id', userId)

        // Send email on new activation
        if (event.type === 'customer.subscription.created' && isActive) {
          const { data: profile } = await supabaseAdmin
            .from('profiles').select('full_name, email').eq('id', userId).single()
          if (profile) {
            await sendPremiumActivatedEmail(profile.email, {
              name: profile.full_name,
              planType,
            })
          }
        }
        break
      }

      // ── Subscription cancelled / ended ────────────────────────
      case 'customer.subscription.deleted': {
        const sub    = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.supabase_uid
        if (!userId) break

        await supabaseAdmin.from('profiles').update({
          package_type:           'free',
          stripe_subscription_id: null,
          premium_plan_type:      null,
          premium_expires_at:     null,
          updated_at:             new Date().toISOString(),
        }).eq('id', userId)

        // Notify user
        const { data: profile } = await supabaseAdmin
          .from('profiles').select('id').eq('id', userId).single()
        if (profile) {
          await supabaseAdmin.from('notifications').insert({
            user_id: userId,
            type:    'subscription',
            title:   '⚠️ Abonimi Premium u anulua',
            message: 'Abonimi yt Premium ka skaduar. Riaktivizohu nga faqja e çmimit.',
            is_read: false,
          })
        }
        break
      }

      // ── Payment succeeded ─────────────────────────────────────
      case 'invoice.payment_succeeded': {
        const invoice  = event.data.object as Stripe.Invoice
        const subId    = (invoice as any).subscription as string
        if (!subId) break

        // Renew premium_expires_at
        const { data: profile } = await supabaseAdmin
          .from('profiles').select('id').eq('stripe_subscription_id', subId).single()

        if (profile) {
          await supabaseAdmin.from('notifications').insert({
            user_id: profile.id,
            type:    'subscription',
            title:   '✅ Pagesa u krye me sukses',
            message: `Abonimi juaj Premium u rinovua. Fatura: €${((invoice.amount_paid || 0) / 100).toFixed(2)}`,
            is_read: false,
          })
        }
        break
      }

      // ── Payment failed ────────────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice  = event.data.object as Stripe.Invoice
        const subId    = (invoice as any).subscription as string
        if (!subId) break

        const { data: profile } = await supabaseAdmin
          .from('profiles').select('id').eq('stripe_subscription_id', subId).single()

        if (profile) {
          await supabaseAdmin.from('notifications').insert({
            user_id: profile.id,
            type:    'subscription',
            title:   '❌ Pagesa dështoi',
            message: 'Nuk mundëm ta procesojmë pagesën për abonimin tënd. Kontrollo kartën nga Cilësimet.',
            is_read: false,
          })
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}