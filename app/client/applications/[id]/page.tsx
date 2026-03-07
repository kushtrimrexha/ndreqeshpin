import { redirect, notFound }   from 'next/navigation'
import { createServerSupabase }  from '@/lib/supabase/server'
import { supabaseAdmin }         from '@/lib/supabase/admin'
import PageShell                 from '@/components/PageShell'
import ApplicationDetailClient  from './ApplicationDetailClient'

export default async function ApplicationDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', session.user.id).single()
  if (!profile || profile.role !== 'client') redirect('/login')

  const { data: application } = await supabaseAdmin
    .from('applications')
    .select(`
      *,
      categories(name, icon),
      profiles!client_id(full_name, city, avatar_url)
    `)
    .eq('id', params.id)
    .eq('client_id', profile.id)
    .single()

  if (!application) notFound()

  const { data: offers } = await supabaseAdmin
    .from('offers')
    .select(`
      *,
      companies(id, business_name, is_verified, rating_avg, profile_id,
        profiles!companies_profile_id_fkey(full_name, avatar_url)
      ),
      workers(id, bio, skills, rating_avg, experience_years,
        profiles!workers_profile_id_fkey(full_name, avatar_url)
      )
    `)
    .eq('application_id', params.id)
    .order('created_at', { ascending: false })

  return (
    <PageShell
      role="client"
      userName={profile.full_name}
      pageTitle={application.title}
      pageIcon="📋"
      package={profile.package_type}
    >
      <ApplicationDetailClient
        application={application}
        offers={offers || []}
        profileId={profile.id}
      />
    </PageShell>
  )
}