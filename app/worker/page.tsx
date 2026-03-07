import { redirect }             from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import WorkerDashboard           from './dashboard/WorkerDashboard'

export default async function WorkerDashboardPage() {
  const supabase = await createServerSupabase()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, workers(*)')
    .eq('id', session.user.id)
    .single()

  if (!profile)                 redirect('/login')
  if (profile.role !== 'worker') redirect(`/${profile.role}/dashboard`)

  return <WorkerDashboard profile={profile} worker={profile.workers} />
}