import { redirect }             from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { supabaseAdmin }        from '@/lib/supabase/admin'
import PageShell                from '@/components/PageShell'
import CompanyStatsClient       from './CompanyStatsClient'

export default async function CompanyStatsPage() {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*, companies(*)').eq('id', session.user.id).single()
  if (!profile || profile.role !== 'company') redirect('/login')

  const company   = (profile.companies as any) || {}
  const companyId = company.id

  async function safeCount(q: any): Promise<number> {
    try { const r = await q; return r?.count ?? 0 } catch { return 0 }
  }
  async function safeList(q: any): Promise<any[]> {
    try { const r = await q; return r?.data ?? [] } catch { return [] }
  }

  const now          = new Date()
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString()

  const [
    totalOffers, acceptedOffers, pendingOffers, rejectedOffers,
    totalApplications, activeApplications,
    recentOffers, reviews, monthlyData,
  ] = await Promise.all([
    safeCount(supabaseAdmin.from('offers').select('*',{ count:'exact', head:true }).eq('company_id', companyId)),
    safeCount(supabaseAdmin.from('offers').select('*',{ count:'exact', head:true }).eq('company_id', companyId).eq('status','accepted')),
    safeCount(supabaseAdmin.from('offers').select('*',{ count:'exact', head:true }).eq('company_id', companyId).eq('status','pending')),
    safeCount(supabaseAdmin.from('offers').select('*',{ count:'exact', head:true }).eq('company_id', companyId).eq('status','rejected')),
    safeCount(supabaseAdmin.from('applications').select('*',{ count:'exact', head:true })),
    safeCount(supabaseAdmin.from('applications').select('*',{ count:'exact', head:true }).eq('status','active')),
    safeList(supabaseAdmin.from('offers').select('id, price, duration_days, status, created_at, applications(title, city)').eq('company_id', companyId).order('created_at',{ ascending:false }).limit(20)),
    safeList(supabaseAdmin.from('reviews').select('rating, created_at').eq('reviewee_id', profile.id).order('created_at',{ ascending:false })),
    safeList(supabaseAdmin.from('offers').select('created_at, price, status').eq('company_id', companyId).gte('created_at', sixMonthsAgo)),
  ])

  // Monthly offers trend
  const months: Record<string,number> = {}
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months[d.toLocaleDateString('sq-AL', { month:'short', year:'2-digit' })] = 0
  }
  monthlyData.forEach((o: any) => {
    try {
      const key = new Date(o.created_at).toLocaleDateString('sq-AL', { month:'short', year:'2-digit' })
      if (key in months) months[key]++
    } catch {}
  })

  // City breakdown
  const cityMap: Record<string,number> = {}
  recentOffers.forEach((o: any) => {
    const city = o.applications?.city
    if (city) cityMap[city] = (cityMap[city] || 0) + 1
  })

  const acceptedList   = recentOffers.filter((o:any) => o.status === 'accepted')
  const totalEarnings  = acceptedList.reduce((s:number,o:any) => s + (o.price||0), 0)
  const avgPrice       = totalOffers > 0 ? totalEarnings / Math.max(acceptedOffers, 1) : 0
  const rating         = reviews.length > 0 ? reviews.reduce((s:number,r:any) => s + r.rating, 0) / reviews.length : 0
  const successRate    = totalOffers > 0 ? Math.round((acceptedOffers / totalOffers) * 100) : 0

  return (
    <PageShell role="company" userName={profile.full_name} userId={session.user.id} pageTitle="Statistikat" pageIcon="📊" package={profile.package_type}>
      <CompanyStatsClient
        stats={{ totalOffers, acceptedOffers, pendingOffers, rejectedOffers, totalApplications, activeApplications, avgPrice, totalEarnings, rating, totalReviews:reviews.length, successRate }}
        recentOffers={recentOffers}
        monthlyOffers={months}
        cityBreakdown={cityMap}
      />
    </PageShell>
  )
}