// lib/stripe/index.ts
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript:  true,
})

// ── Price IDs (set in .env.local) ─────────────────────────────────
export const PRICES = {
  monthly: process.env.STRIPE_PRICE_MONTHLY!, // e.g. price_xxxxx
  yearly:  process.env.STRIPE_PRICE_YEARLY!,  // e.g. price_yyyyy
}

// ── Create/get Stripe customer ────────────────────────────────────
export async function getOrCreateCustomer(userId: string, email: string, name: string) {
  // Search by metadata
  const existing = await stripe.customers.search({
    query: `metadata['supabase_uid']:'${userId}'`,
    limit: 1,
  })
  if (existing.data.length > 0) return existing.data[0]

  return stripe.customers.create({
    email, name,
    metadata: { supabase_uid: userId },
  })
}

// ── Create checkout session ────────────────────────────────────────
export async function createCheckoutSession({
  customerId, priceId, userId, successUrl, cancelUrl,
}: {
  customerId: string; priceId: string; userId: string
  successUrl: string; cancelUrl:  string
}) {
  return stripe.checkout.sessions.create({
    customer:             customerId,
    mode:                 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  cancelUrl,
    metadata:    { supabase_uid: userId },
    subscription_data: { metadata: { supabase_uid: userId } },
    allow_promotion_codes: true,
  })
}

// ── Create billing portal session ─────────────────────────────────
export async function createPortalSession(customerId: string, returnUrl: string) {
  return stripe.billingPortal.sessions.create({
    customer:   customerId,
    return_url: returnUrl,
  })
}

// ── Verify webhook signature ──────────────────────────────────────
export function constructWebhookEvent(payload: string | Buffer, signature: string) {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
}