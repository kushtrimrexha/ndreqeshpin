import { redirect }             from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import PageShell                from '@/components/PageShell'
import ChatInterface            from '@/components/ChatInterface'

export default async function MessagesPage() {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (!profile || profile.role !== 'worker') redirect('/login')

  const { count: unread } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false)
    .neq('sender_id', profile.id)

  return (
    <PageShell
      role="worker"
      userName={profile.full_name}
      pageTitle="Mesazhet"
      pageIcon="💬"
      package={profile.package_type}
      unread={unread || 0}
    >
      <ChatInterface
        userId={profile.id}
        userRole="worker"
        userName={profile.full_name}
      />
    </PageShell>
  )
}