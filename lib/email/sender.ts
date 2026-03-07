// lib/email/sender.ts
// Central email sending utility via Resend

import { Resend } from 'resend'
import {
  welcomeEmail, newOfferEmail, offerAcceptedEmail,
  companyVerifiedEmail, newReviewEmail, newMessageEmail,
  premiumActivatedEmail, passwordResetEmail,
} from './templates'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = 'NdreqeShpin <noreply@ndreqeshpin.com>'

// ── Generic send ──────────────────────────────────────────────────
async function sendEmail(to: string, subject: string, html: string) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('[Email] RESEND_API_KEY not set — skipping email send')
      return { success: true, skipped: true }
    }
    const { data, error } = await resend.emails.send({ from: FROM, to, subject, html })
    if (error) { console.error('[Email] Send error:', error); return { success: false, error } }
    return { success: true, id: data?.id }
  } catch (err) {
    console.error('[Email] Unexpected error:', err)
    return { success: false, error: err }
  }
}

// ── Named senders ─────────────────────────────────────────────────
export async function sendWelcomeEmail(to: string, name: string, role: string) {
  const { subject, html } = welcomeEmail({ name, role })
  return sendEmail(to, subject, html)
}

export async function sendNewOfferEmail(to: string, params: Parameters<typeof newOfferEmail>[0]) {
  const { subject, html } = newOfferEmail(params)
  return sendEmail(to, subject, html)
}

export async function sendOfferAcceptedEmail(to: string, params: Parameters<typeof offerAcceptedEmail>[0]) {
  const { subject, html } = offerAcceptedEmail(params)
  return sendEmail(to, subject, html)
}

export async function sendCompanyVerifiedEmail(to: string, params: Parameters<typeof companyVerifiedEmail>[0]) {
  const { subject, html } = companyVerifiedEmail(params)
  return sendEmail(to, subject, html)
}

export async function sendNewReviewEmail(to: string, params: Parameters<typeof newReviewEmail>[0]) {
  const { subject, html } = newReviewEmail(params)
  return sendEmail(to, subject, html)
}

export async function sendNewMessageEmail(to: string, params: Parameters<typeof newMessageEmail>[0]) {
  const { subject, html } = newMessageEmail(params)
  return sendEmail(to, subject, html)
}

export async function sendPremiumActivatedEmail(to: string, params: Parameters<typeof premiumActivatedEmail>[0]) {
  const { subject, html } = premiumActivatedEmail(params)
  return sendEmail(to, subject, html)
}

export async function sendPasswordResetEmail(to: string, params: Parameters<typeof passwordResetEmail>[0]) {
  const { subject, html } = passwordResetEmail(params)
  return sendEmail(to, subject, html)
}