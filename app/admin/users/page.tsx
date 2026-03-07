import { redirect }             from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { supabaseAdmin }        from '@/lib/supabase/admin'
import PageShell                from '@/components/PageShell'
import AdminUsersClient         from './AdminUsersClient'

export default async function AdminUsersPage() {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role, full_name, package_type').eq('id', session.user.id).single()
  if (!profile || profile.role !== 'admin') redirect('/login')

  const { data: users } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, email, role, city, phone, package_type, created_at, avatar_url')
    .order('created_at', { ascending: false })

  return (
    <PageShell role="admin" userName={profile.full_name} pageTitle="Përdoruesit" pageIcon="👥" package={profile.package_type}>
      <AdminUsersClient users={users || []} currentAdminId={session.user.id} />
    </PageShell>
  )
}