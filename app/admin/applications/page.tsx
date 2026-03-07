import { redirect }                from 'next/navigation'
import { createServerSupabase }    from '@/lib/supabase/server'
import { supabaseAdmin }           from '@/lib/supabase/admin'
import PageShell                   from '@/components/PageShell'
import AdminApplicationsClient     from './AdminApplicationsClient'

export default async function AdminApplicationsPage() {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role, full_name, package_type').eq('id', session.user.id).single()
  if (!profile || profile.role !== 'admin') redirect('/login')

  const { data: applications } = await supabaseAdmin
    .from('applications')
    .select(`
      id, title, description, city, area_sqm, budget_min, budget_max,
      status, provider_type, offer_count, expires_at, created_at,
      categories(name, icon),
      profiles!client_id(full_name, email, city)
    `)
    .order('created_at', { ascending: false })

  return (
    <PageShell role="admin" userName={profile.full_name} pageTitle="Aplikimet" pageIcon="📋" package={profile.package_type}>
      <AdminApplicationsClient applications={applications || []} />
    </PageShell>
  )
}