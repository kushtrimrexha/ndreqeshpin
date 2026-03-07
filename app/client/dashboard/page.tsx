import { redirect }             from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import ClientDashboard           from './ClientDashboard'

export default async function ClientDashboardPage() {
  const supabase = await createServerSupabase()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (!profile)                   redirect('/login')
  if (profile.role !== 'client')  redirect(`/${profile.role}/dashboard`)

  return <ClientDashboard profile={profile} />
}