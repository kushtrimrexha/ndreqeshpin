import { NextResponse }               from 'next/server'
import { createServerSupabase }       from '@/lib/supabase/server'
import { supabaseAdmin }              from '@/lib/supabase/admin'
import { sendOfferAcceptedEmail }     from '@/lib/email/sender'

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { offer_id } = await req.json()
    if (!offer_id) return NextResponse.json({ error: 'offer_id mungon' }, { status: 400 })

    // Fetch offer with relations
    const { data: offer } = await supabaseAdmin
      .from('offers')
      .select(`
        id, price, duration_days,
        application_id,
        applications:application_id(title, client_id, profiles:client_id(full_name, email)),
        company:company_id(id, full_name, email),
        worker:worker_id(id, full_name, email)
      `)
      .eq('id', offer_id)
      .single()

    if (!offer) return NextResponse.json({ error: 'Oferta nuk u gjet' }, { status: 404 })

    const app         = offer.applications as any
    const clientProf  = app?.profiles as any

    // Verify client owns application
    if (app?.client_id !== session.user.id) {
      return NextResponse.json({ error: 'Nuk ke leje' }, { status: 403 })
    }

    // Accept this offer + decline others
    await supabaseAdmin.from('offers')
      .update({ status: 'declined' })
      .eq('application_id', offer.application_id)
      .neq('id', offer_id)

    const { error } = await supabaseAdmin.from('offers')
      .update({ status: 'accepted' })
      .eq('id', offer_id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Mark application as in_progress
    await supabaseAdmin.from('applications')
      .update({ status: 'in_progress' })
      .eq('id', offer.application_id)

    // Determine sender (company or worker)
    const senderProfile = (offer.company || offer.worker) as any
    const senderName    = senderProfile?.full_name || 'Profesionist'
    const senderEmail   = senderProfile?.email
    const clientName    = clientProf?.full_name || 'Klient'

    // Notify sender
    if (senderProfile?.id) {
      await supabaseAdmin.from('notifications').insert({
        user_id: senderProfile.id,
        type:    'offer',
        title:   '🎉 Oferta jote u pranua!',
        message: `${clientName} pranoi ofertën tënde për "${app?.title}"`,
        is_read: false,
      })
    }

    // Email to sender
    if (senderEmail) {
      await sendOfferAcceptedEmail(senderEmail, {
        senderName,
        clientName,
        appTitle:     app?.title || 'Projekt',
        price:        offer.price,
        durationDays: offer.duration_days,
        applicationId: offer.application_id,
      })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}