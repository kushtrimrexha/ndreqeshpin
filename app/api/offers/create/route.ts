import { NextResponse }          from 'next/server'
import { createServerSupabase }  from '@/lib/supabase/server'
import { supabaseAdmin }         from '@/lib/supabase/admin'
import { sendNewOfferEmail }     from '@/lib/email/sender'

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { application_id, price, duration_days, description, company_id, worker_id } = body

    if (!application_id || !price || !duration_days) {
      return NextResponse.json({ error: 'Fushat e detyrueshme mungojnë' }, { status: 400 })
    }

    // Fetch application + client info
    const { data: application } = await supabaseAdmin
      .from('applications')
      .select('id, title, client_id, profiles:client_id(full_name, email)')
      .eq('id', application_id)
      .single()

    if (!application) return NextResponse.json({ error: 'Aplikimi nuk u gjet' }, { status: 404 })

    // Insert offer
    const { data: offer, error } = await supabaseAdmin.from('offers').insert({
      application_id,
      price:         Number(price),
      duration_days: Number(duration_days),
      description:   description || null,
      status:        'pending',
      company_id:    company_id || null,
      worker_id:     worker_id  || null,
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Sender name
    const { data: sender } = await supabaseAdmin
      .from('profiles').select('full_name').eq('id', session.user.id).single()
    const senderName = sender?.full_name || 'Profesionist'

    // Notification to client
    await supabaseAdmin.from('notifications').insert({
      user_id: application.client_id,
      type:    'offer',
      title:   '💼 Ofertë e re!',
      message: `${senderName} dërgoi ofertë për "${application.title}" — €${Number(price).toLocaleString()}`,
      is_read: false,
    })

    // Email to client
    const clientProfile = application.profiles as any
    if (clientProfile?.email) {
      await sendNewOfferEmail(clientProfile.email, {
        clientName:    clientProfile.full_name,
        senderName,
        appTitle:      application.title,
        price:         Number(price),
        durationDays:  Number(duration_days),
        description:   description || undefined,
        applicationId: application_id,
      })
    }

    return NextResponse.json({ offer })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}