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
  if (!profile || profile.role !== 'company' || !profile.companies) redirect('/login')

  const companyId = profile.companies.id

  const [
    { count: totalOffers },
    { count: acceptedOffers },
    { count: pendingOffers },
    { data: recentOffers },
    { data: reviews },
  ] = await Promise.all([
    supabaseAdmin.from('offers').select('*', { count:'exact', head:true }).eq('company_id', companyId),
    supabaseAdmin.from('offers').select('*', { count:'exact', head:true }).eq('company_id', companyId).eq('status','accepted'),
    supabaseAdmin.from('offers').select('*', { count:'exact', head:true }).eq('company_id', companyId).eq('status','pending'),
    supabaseAdmin.from('offers').select('id,price,status,created_at, applications(title,city)').eq('company_id', companyId).order('created_at', { ascending:false }).limit(10),
    supabaseAdmin.from('reviews').select('rating,created_at').eq('reviewee_id', profile.id).order('created_at', { ascending:false }),
  ])

  const totalRevenue = (recentOffers || []).filter(o => o.status === 'accepted').reduce((s,o) => s + o.price, 0)
  const successRate  = totalOffers ? Math.round(((acceptedOffers || 0) / totalOffers) * 100) : 0

  return (
    <PageShell role="company" userName={profile.full_name} pageTitle="Statistikat" pageIcon="📊" package={profile.package_type}>
      <CompanyStatsClient
        company={profile.companies}
        stats={{ totalOffers: totalOffers||0, acceptedOffers: acceptedOffers||0, pendingOffers: pendingOffers||0, totalRevenue, successRate }}
        recentOffers={recentOffers || []}
        reviews={reviews || []}
      />
    </PageShell>
  )
}