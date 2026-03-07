import { redirect }             from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import PageShell                from '@/components/PageShell'
import ClientProfileClient      from './ClientProfileClient'

export default async function ClientProfilePage() {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (!profile || profile.role !== 'client') redirect('/login')

  const { count: appCount }    = await supabase.from('applications').select('*', { count: 'exact', head: true }).eq('client_id', profile.id)
  const { count: acceptCount } = await supabase.from('applications').select('*', { count: 'exact', head: true }).eq('client_id', profile.id).eq('status', 'accepted')

  return (
    <PageShell role="client" userName={profile.full_name} pageTitle="Profili im" pageIcon="👤" package={profile.package_type}>
      <ClientProfileClient
        profile={profile}
        stats={{ applications: appCount || 0, accepted: acceptCount || 0 }}
      />
    </PageShell>
  )
}