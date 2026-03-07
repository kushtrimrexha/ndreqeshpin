import { redirect }             from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { supabaseAdmin }        from '@/lib/supabase/admin'
import PageShell                from '@/components/PageShell'
import ReviewsClient            from '@/components/ReviewsClient'

export default async function ClientReviewsPage() {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', session.user.id).single()
  if (!profile || profile.role !== 'client') redirect('/login')

  // Projektet e pranuara — kandidatë për vlerësim
  const { data: acceptedApps } = await supabaseAdmin
    .from('applications')
    .select(`
      id, title, city, updated_at,
      offers!inner(
        company_id, status,
        companies(profile_id, business_name)
      )
    `)
    .eq('client_id', profile.id)
    .eq('status', 'accepted')
    .eq('offers.status', 'accepted')

  // Vlerësimet që ka dhënë ky klient
  const { data: givenReviews } = await supabaseAdmin
    .from('reviews').select('application_id').eq('reviewer_id', profile.id)

  const givenSet = new Set((givenReviews || []).map(r => r.application_id))

  const pendingProjects = (acceptedApps || []).map((app: any) => {
    const offer   = app.offers?.[0]
    const company = offer?.companies
    return {
      id:                app.id,
      title:             app.title,
      city:              app.city,
      accepted_at:       app.updated_at,
      company_profile_id: company?.profile_id || '',
      company_name:      company?.business_name || 'Kompania',
      already_reviewed:  givenSet.has(app.id),
    }
  })

  // Vlerësimet e marra (nëse klienti ka marrë vlerësim — opsionale)
  const { data: receivedReviews } = await supabaseAdmin
    .from('reviews')
    .select('*, reviewer:profiles!reviews_reviewer_id_fkey(full_name), application:applications(title)')
    .eq('reviewee_id', profile.id)
    .order('created_at', { ascending: false })

  return (
    <PageShell role="client" userName={profile.full_name} pageTitle="Vlerësimet" pageIcon="⭐" package={profile.package_type}>
      <ReviewsClient
        userId={profile.id}
        userRole="client"
        receivedReviews={receivedReviews || []}
        pendingProjects={pendingProjects}
        ratingAvg={0}
        ratingCount={0}
      />
    </PageShell>
  )
}