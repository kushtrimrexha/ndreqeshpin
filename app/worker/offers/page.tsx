import { redirect }             from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { supabaseAdmin }        from '@/lib/supabase/admin'
import PageShell                from '@/components/PageShell'
import WorkerOffersClient       from './WorkerOffersClient'

export default async function WorkerOffersPage() {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*, workers(*)').eq('id', session.user.id).single()
  if (!profile || profile.role !== 'worker' || !profile.workers) redirect('/login')

  const { data: offers } = await supabaseAdmin
    .from('offers')
    .select(`
      id, price, duration_days, description, status, created_at,
      applications(id, title, city, status,
        profiles!client_id(full_name)
      )
    `)
    .eq('worker_id', profile.workers.id)
    .order('created_at', { ascending: false })

  return (
    <PageShell role="worker" userName={profile.full_name} pageTitle="Ofertat e mia" pageIcon="💼" package={profile.package_type}>
      <WorkerOffersClient offers={offers || []} />
    </PageShell>
  )
}