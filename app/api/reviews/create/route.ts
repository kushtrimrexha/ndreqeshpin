import { NextResponse }          from 'next/server'
import { createServerSupabase }  from '@/lib/supabase/server'
import { supabaseAdmin }         from '@/lib/supabase/admin'
import { sendNewReviewEmail }    from '@/lib/email/sender'

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { reviewed_id, rating, comment, role } = await req.json()
    if (!reviewed_id || !rating) {
      return NextResponse.json({ error: 'Fushat e detyrueshme mungojnë' }, { status: 400 })
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Vlerësimi duhet të jetë 1-5' }, { status: 400 })
    }

    // Check duplicate
    const { data: existing } = await supabaseAdmin.from('reviews')
      .select('id').eq('reviewer_id', session.user.id).eq('reviewed_id', reviewed_id).single()
    if (existing) return NextResponse.json({ error: 'Ke vlerësuar tashmë këtë përdorues' }, { status: 409 })

    const { data: review, error } = await supabaseAdmin.from('reviews').insert({
      reviewer_id: session.user.id,
      reviewed_id,
      rating:      Number(rating),
      comment:     comment || null,
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Fetch reviewer name + reviewed email
    const [{ data: reviewer }, { data: reviewed }] = await Promise.all([
      supabaseAdmin.from('profiles').select('full_name').eq('id', session.user.id).single(),
      supabaseAdmin.from('profiles').select('full_name, email, role').eq('id', reviewed_id).single(),
    ])

    if (reviewed) {
      // Notification
      await supabaseAdmin.from('notifications').insert({
        user_id: reviewed_id,
        type:    'review',
        title:   `⭐ Vlerësim i ri — ${rating}/5`,
        message: `${reviewer?.full_name || 'Klient'} të dha ${rating} yje${comment ? ': "' + comment.slice(0,60) + '"' : ''}`,
        is_read: false,
      })

      // Email
      await sendNewReviewEmail(reviewed.email, {
        receiverName: reviewed.full_name,
        reviewerName: reviewer?.full_name || 'Klient',
        rating:       Number(rating),
        comment:      comment || undefined,
        role:         reviewed.role,
      })
    }

    return NextResponse.json({ review })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}