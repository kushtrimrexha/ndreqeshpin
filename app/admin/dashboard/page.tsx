import { redirect }             from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { supabaseAdmin }        from '@/lib/supabase/admin'
import AdminDashboard           from './AdminDashboard'

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabaseAdmin
    .from('profiles').select('*').eq('id', session.user.id).single()
  if (!profile || profile.role !== 'admin') redirect('/login')

  async function safeCount(q: any): Promise<number> {
    try { const r = await q; return r?.count ?? 0 } catch { return 0 }
  }
  async function safeList(q: any): Promise<any[]> {
    try { const r = await q; return r?.data ?? [] } catch { return [] }
  }

  const now       = new Date()
  const weekAgo   = new Date(now.getTime() - 7*86_400_000).toISOString()
  const monthAgo  = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    totalUsers, totalCompanies, totalApplications, totalOffers, totalReviews,
    verifiedCompanies, premiumUsers, newUsersWeek,
    companies, recentUsers, recentApplications,
  ] = await Promise.all([
    safeCount(supabaseAdmin.from('profiles').select('*',{count:'exact',head:true})),
    safeCount(supabaseAdmin.from('companies').select('*',{count:'exact',head:true})),
    safeCount(supabaseAdmin.from('applications').select('*',{count:'exact',head:true})),
    safeCount(supabaseAdmin.from('offers').select('*',{count:'exact',head:true})),
    safeCount(supabaseAdmin.from('reviews').select('*',{count:'exact',head:true})),
    safeCount(supabaseAdmin.from('companies').select('*',{count:'exact',head:true}).eq('is_verified',true)),
    safeCount(supabaseAdmin.from('profiles').select('*',{count:'exact',head:true}).eq('package_type','premium')),
    safeCount(supabaseAdmin.from('profiles').select('*',{count:'exact',head:true}).gte('created_at',weekAgo)),
    safeList(supabaseAdmin.from('companies').select('id,business_name,is_verified,rating_avg,package_type,created_at,profiles(full_name,city,avatar_url)').order('created_at',{ascending:false}).limit(30)),
    safeList(supabaseAdmin.from('profiles').select('id,full_name,email,role,city,package_type,created_at').order('created_at',{ascending:false}).limit(40)),
    safeList(supabaseAdmin.from('applications').select('id,title,city,status,offer_count,created_at,profiles!client_id(full_name)').order('created_at',{ascending:false}).limit(15)),
  ])

  return (
    <AdminDashboard
      adminProfile={profile}
      initialCompanies={companies}
      initialUsers={recentUsers}
      recentApplications={recentApplications}
      stats={{ totalUsers, totalCompanies, totalApplications, totalOffers, totalReviews, verifiedCompanies, premiumUsers, newUsersWeek }}
    />
  )
}