import { redirect }             from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import PageShell                from '@/components/PageShell'
import WorkerProfileClient      from './WorkerProfileClient'

export default async function WorkerProfilePage() {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, workers(*)')
    .eq('id', session.user.id)
    .single()

  if (!profile || profile.role !== 'worker') redirect('/login')

  const worker = profile.workers

  const { count: totalOffers } = await supabase
    .from('offers')
    .select('*', { count: 'exact', head: true })
    .eq('worker_id', worker?.id || '')

  const { count: acceptedOffers } = await supabase
    .from('offers')
    .select('*', { count: 'exact', head: true })
    .eq('worker_id', worker?.id || '')
    .eq('status', 'accepted')

  return (
    <PageShell
      role="worker"
      userName={profile.full_name}
      pageTitle="Profili im"
      pageIcon="👤"
      package={profile.package_type}
    >
      <WorkerProfileClient
        profile={profile}
        worker={worker || null}
        stats={{
          totalOffers:    totalOffers    || 0,
          acceptedOffers: acceptedOffers || 0,
        }}
      />
    </PageShell>
  )
}