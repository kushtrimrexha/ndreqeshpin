import { redirect }             from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import PageShell                from '@/components/PageShell'
import ClientApplicationsList   from './ClientApplicationsList'

export default async function Page() {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
  if (!profile || profile.role !== 'client') redirect('/login')

  const { data: applications } = await supabase
    .from('applications')
    .select('*, categories(name,icon)')
    .eq('client_id', profile.id)
    .order('created_at', { ascending: false })

  return (
    <PageShell role="client" userName={profile.full_name} pageTitle="Aplikimet e mia" pageIcon="📋" package={profile.package_type}>
      <ClientApplicationsList applications={applications || []} />
    </PageShell>
  )
}