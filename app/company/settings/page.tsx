import { redirect }             from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import PageShell                from '@/components/PageShell'
import SettingsClient           from '@/components/SettingsClient'

export default async function SettingsPage() {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', session.user.id).single()
  if (!profile || profile.role !== 'company') redirect('/login')

  return (
    <PageShell
      role="company"
      userName={profile.full_name}
      pageTitle="Cilësimet"
      pageIcon="⚙️"
      package={profile.package_type}
    >
      <SettingsClient
        profile={profile}
        userEmail={session.user.email || ''}
      />
    </PageShell>
  )
}