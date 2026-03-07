import { redirect }             from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { supabaseAdmin }        from '@/lib/supabase/admin'
import PageShell                from '@/components/PageShell'
import AdminOffersClient        from './AdminOffersClient'

export default async function AdminOffersPage() {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role, full_name, package_type').eq('id', session.user.id).single()
  if (!profile || profile.role !== 'admin') redirect('/login')

  const { data: offers } = await supabaseAdmin
    .from('offers')
    .select(`
      id, price, duration_days, description, status, created_at,
      applications(id, title, city),
      companies(id, business_name, is_verified),
      workers(id, profiles!workers_profile_id_fkey(full_name))
    `)
    .order('created_at', { ascending: false })

  return (
    <PageShell role="admin" userName={profile.full_name} pageTitle="Ofertat" pageIcon="💼" package={profile.package_type}>
      <AdminOffersClient offers={offers || []} />
    </PageShell>
  )
}