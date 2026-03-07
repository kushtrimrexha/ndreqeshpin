import { redirect }              from 'next/navigation'
import { createServerSupabase }  from '@/lib/supabase/server'
import { supabaseAdmin }         from '@/lib/supabase/admin'
import PageShell                 from '@/components/PageShell'
import WorkerApplicationsClient  from './WorkerApplicationsClient'

export default async function WorkerApplicationsPage() {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*, workers(*)').eq('id', session.user.id).single()
  if (!profile || profile.role !== 'worker') redirect('/login')

  const { data: applications } = await supabaseAdmin
    .from('applications')
    .select('*, categories(name,icon), profiles!client_id(full_name,city)')
    .in('status', ['active'])
    .in('provider_type', ['worker','both'])
    .order('created_at', { ascending: false })

  const { data: myOffers } = await supabaseAdmin
    .from('offers')
    .select('application_id, status')
    .eq('worker_id', profile.workers?.id || '')

  const offeredSet = new Set((myOffers || []).map(o => o.application_id))

  return (
    <PageShell role="worker" userName={profile.full_name} pageTitle="Aplikimet" pageIcon="📋" package={profile.package_type}>
      <WorkerApplicationsClient
        applications={applications || []}
        offeredSet={Array.from(offeredSet)}
        worker={profile.workers}
      />
    </PageShell>
  )
}