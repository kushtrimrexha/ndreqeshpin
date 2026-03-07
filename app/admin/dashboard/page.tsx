import { redirect }             from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { supabaseAdmin }        from '@/lib/supabase/admin'
import AdminDashboard           from './AdminDashboard'

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (!profile || profile.role !== 'admin') redirect('/login')

  // Load initial data
  const [
    { data: companies },
    { data: users },
    { count: appCount },
    { count: offerCount },
  ] = await Promise.all([
    supabaseAdmin.from('companies').select('*, profiles(full_name, city, created_at)').order('created_at', { ascending: false }),
    supabaseAdmin.from('profiles').select('*').order('created_at', { ascending: false }).limit(50),
    supabaseAdmin.from('applications').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('offers').select('*', { count: 'exact', head: true }),
  ])

  return (
    <AdminDashboard
      adminProfile={profile}
      initialCompanies={companies || []}
      initialUsers={users || []}
      totalApplications={appCount || 0}
      totalOffers={offerCount || 0}
    />
  )
}