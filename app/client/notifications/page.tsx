import { redirect }             from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import PageShell                from '@/components/PageShell'
import NotificationsClient      from '@/components/NotificationsClient'

export default async function ClientNotificationsPage() {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (!profile || profile.role !== 'client') redirect('/login')

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(60)

  const unread = (notifications || []).filter((n: any) => !n.is_read).length

  return (
    <PageShell
      role="client"
      userName={profile.full_name}
      pageTitle="Njoftimet"
      pageIcon="🔔"
      package={profile.package_type}
      unread={unread}
    >
      <NotificationsClient initialNotifications={notifications || []} />
    </PageShell>
  )
}