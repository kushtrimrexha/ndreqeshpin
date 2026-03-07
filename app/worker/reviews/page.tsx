import { redirect }             from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { supabaseAdmin }        from '@/lib/supabase/admin'
import PageShell                from '@/components/PageShell'
import ReviewsClient            from '@/components/ReviewsClient'

export default async function WorkerReviewsPage() {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*, workers(*)').eq('id', session.user.id).single()
  if (!profile || profile.role !== 'worker') redirect('/login')

  const { data: reviews } = await supabaseAdmin
    .from('reviews')
    .select('*, reviewer:profiles!reviews_reviewer_id_fkey(full_name, avatar_url), application:applications(title)')
    .eq('reviewee_id', profile.id)
    .order('created_at', { ascending: false })

  const ratingAvg   = profile.workers?.rating_avg || 0
  const ratingCount = reviews?.length || 0

  return (
    <PageShell role="worker" userName={profile.full_name} pageTitle="Vlerësimet" pageIcon="⭐" package={profile.package_type}>
      <ReviewsClient
        userId={profile.id}
        userRole="worker"
        receivedReviews={reviews || []}
        pendingProjects={[]}
        ratingAvg={ratingAvg}
        ratingCount={ratingCount}
      />
    </PageShell>
  )
}