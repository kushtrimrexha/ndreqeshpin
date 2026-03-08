import { redirect }             from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { supabaseAdmin }        from '@/lib/supabase/admin'
import CompanyDashboard         from './CompanyDashboard'

export default async function CompanyDashboardPage() {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*, companies(*)').eq('id', session.user.id).single()
  if (!profile || profile.role !== 'company') redirect(`/${(profile as any)?.role || 'login'}/dashboard`)

  const company   = (profile.companies as any) || {}
  const companyId = company.id

  async function safeCount(q: any): Promise<number> {
    try { const r = await q; return r?.count ?? 0 } catch { return 0 }
  }
  async function safeList(q: any): Promise<any[]> {
    try { const r = await q; return r?.data ?? [] } catch { return [] }
  }

  const [
    totalOffers, acceptedOffers, pendingOffers,
    totalApplications, activeApplications,
    recentOffers, recentApplications, reviews,
  ] = await Promise.all([
    safeCount(supabaseAdmin.from('offers').select('*',{count:'exact',head:true}).eq('company_id',companyId)),
    safeCount(supabaseAdmin.from('offers').select('*',{count:'exact',head:true}).eq('company_id',companyId).eq('status','accepted')),
    safeCount(supabaseAdmin.from('offers').select('*',{count:'exact',head:true}).eq('company_id',companyId).eq('status','pending')),
    safeCount(supabaseAdmin.from('applications').select('*',{count:'exact',head:true})),
    safeCount(supabaseAdmin.from('applications').select('*',{count:'exact',head:true}).eq('status','active')),
    safeList(supabaseAdmin.from('offers').select('id,price,duration_days,status,created_at,applications(id,title,city)').eq('company_id',companyId).order('created_at',{ascending:false}).limit(5)),
    safeList(supabaseAdmin.from('applications').select('id,title,city,status,offer_count,budget_min,budget_max,expires_at,created_at,categories(name,icon)').eq('status','active').order('created_at',{ascending:false}).limit(8)),
    safeList(supabaseAdmin.from('reviews').select('id,rating,comment,created_at,profiles!reviewer_id(full_name,avatar_url)').eq('reviewee_id',profile.id).order('created_at',{ascending:false}).limit(4)),
  ])

  const totalEarned = recentOffers.filter((o:any)=>o.status==='accepted').reduce((s:number,o:any)=>s+(o.price||0),0)
  const rating      = reviews.length > 0 ? reviews.reduce((s:number,r:any)=>s+r.rating,0)/reviews.length : 0
  const successRate = totalOffers > 0 ? Math.round((acceptedOffers/totalOffers)*100) : 0

  return (
    <CompanyDashboard
      profile={profile}
      company={company}
      stats={{ totalOffers, acceptedOffers, pendingOffers, totalApplications, activeApplications, totalEarned, rating, totalReviews:reviews.length, successRate }}
      recentOffers={recentOffers}
      recentApplications={recentApplications}
      reviews={reviews}
    />
  )
}