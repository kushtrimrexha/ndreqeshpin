import { redirect }             from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import PageShell                from '@/components/PageShell'
import AdminSettingsClient      from './AdminSettingsClient'

export default async function AdminSettingsPage() {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', session.user.id).single()
  if (!profile || profile.role !== 'admin') redirect('/login')

  return (
    <PageShell role="admin" userName={profile.full_name} pageTitle="Cilësimet" pageIcon="⚙️" package={profile.package_type}>
      <AdminSettingsClient profile={profile} userEmail={session.user.email || ''} />
    </PageShell>
  )
}