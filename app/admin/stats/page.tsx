import { redirect }             from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { supabaseAdmin }        from '@/lib/supabase/admin'
import PageShell                from '@/components/PageShell'
import AdminStatsClient         from './AdminStatsClient'
export const dynamic = 'force-dynamic';

export default async function AdminStatsPage() {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, full_name, package_type')
    .eq('id', session.user.id)
    .single()

  if (!profile || profile.role !== 'admin') redirect('/login')

  const now          = new Date()
  const month        = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const week         = new Date(now.getTime() - 7 * 86_400_000).toISOString()
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString()

  // Helpers — never throw, always return safe defaults
  async function safeCount(q: any): Promise<number> {
    try { const r = await q; return r?.count ?? 0 } catch { return 0 }
  }
  async function safeList(q: any): Promise<any[]> {
    try { const r = await q; return r?.data ?? [] } catch { return [] }
  }

  const [
    totalUsers, totalCompanies, totalApplications, totalOffers,
    totalReviews, activeApplications, acceptedOffers, verifiedCompanies,
    newUsersMonth, newAppsMonth, newOffersWeek,
    recentUsers, recentApps, monthlyData,
  ] = await Promise.all([
    safeCount(supabaseAdmin.from('profiles').select('*',    { count:'exact', head:true })),
    safeCount(supabaseAdmin.from('companies').select('*',   { count:'exact', head:true })),
    safeCount(supabaseAdmin.from('applications').select('*',{ count:'exact', head:true })),
    safeCount(supabaseAdmin.from('offers').select('*',      { count:'exact', head:true })),
    safeCount(supabaseAdmin.from('reviews').select('*',     { count:'exact', head:true })),
    safeCount(supabaseAdmin.from('applications').select('*',{ count:'exact', head:true }).eq('status','active')),
    safeCount(supabaseAdmin.from('offers').select('*',      { count:'exact', head:true }).eq('status','accepted')),
    safeCount(supabaseAdmin.from('companies').select('*',   { count:'exact', head:true }).eq('is_verified',true)),
    safeCount(supabaseAdmin.from('profiles').select('*',    { count:'exact', head:true }).gte('created_at', month)),
    safeCount(supabaseAdmin.from('applications').select('*',{ count:'exact', head:true }).gte('created_at', month)),
    safeCount(supabaseAdmin.from('offers').select('*',      { count:'exact', head:true }).gte('created_at', week)),
    safeList(supabaseAdmin.from('profiles').select('id, full_name, role, city, created_at').order('created_at',{ ascending:false }).limit(8)),
    safeList(supabaseAdmin.from('applications').select('id, title, city, status, created_at').order('created_at',{ ascending:false }).limit(8)),
    safeList(supabaseAdmin.from('profiles').select('created_at').gte('created_at', sixMonthsAgo)),
  ])

  // Monthly registrations — last 6 months
  const months: Record<string, number> = {}
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months[d.toLocaleDateString('sq-AL', { month:'short', year:'2-digit' })] = 0
  }
  monthlyData.forEach((u: any) => {
    try {
      const key = new Date(u.created_at).toLocaleDateString('sq-AL', { month:'short', year:'2-digit' })
      if (key in months) months[key]++
    } catch {}
  })

  return (
    <PageShell
      role="admin"
      userName={profile.full_name}
      userId={session.user.id}
      pageTitle="Statistikat"
      pageIcon="📊"
      package={profile.package_type}
    >
      <AdminStatsClient
        stats={{
          totalUsers, totalCompanies, totalApplications, totalOffers,
          totalReviews, activeApplications, acceptedOffers, verifiedCompanies,
          newUsersMonth, newAppsMonth, newOffersWeek,
          successRate: totalOffers > 0
            ? Math.round((acceptedOffers / totalOffers) * 100)
            : 0,
        }}
        recentUsers={recentUsers}
        recentApps={recentApps}
        monthlyRegistrations={months}
      />
    </PageShell>
  )
}