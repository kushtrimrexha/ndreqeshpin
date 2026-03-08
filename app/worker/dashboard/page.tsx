import { redirect }             from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { supabaseAdmin }        from '@/lib/supabase/admin'
import WorkerDashboard          from './WorkerDashboard'

export default async function WorkerDashboardPage() {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*, workers(*)').eq('id', session.user.id).single()
  if (!profile || profile.role !== 'worker') redirect(`/${(profile as any)?.role||'login'}/dashboard`)

  async function safeCount(q: any): Promise<number> {
    try { const r = await q; return r?.count ?? 0 } catch { return 0 }
  }
  async function safeList(q: any): Promise<any[]> {
    try { const r = await q; return r?.data ?? [] } catch { return [] }
  }

  const worker    = (profile.workers as any) || {}
  const workerId  = worker.id

  const [totalOffers, acceptedOffers, pendingOffers, recentOffers, applications] = await Promise.all([
    safeCount(supabaseAdmin.from('offers').select('*',{count:'exact',head:true}).eq('worker_id',workerId)),
    safeCount(supabaseAdmin.from('offers').select('*',{count:'exact',head:true}).eq('worker_id',workerId).eq('status','accepted')),
    safeCount(supabaseAdmin.from('offers').select('*',{count:'exact',head:true}).eq('worker_id',workerId).eq('status','pending')),
    safeList(supabaseAdmin.from('offers').select('id,price,status,created_at,applications(id,title,city)').eq('worker_id',workerId).order('created_at',{ascending:false}).limit(4)),
    safeList(supabaseAdmin.from('applications').select('id,title,description,city,area_sqm,budget_min,budget_max,offer_count,expires_at,created_at,categories(name,icon)').eq('status','active').order('created_at',{ascending:false}).limit(12)),
  ])

  const totalEarned = recentOffers.filter((o:any)=>o.status==='accepted').reduce((s:number,o:any)=>s+(o.price||0),0)

  return (
    <WorkerDashboard
      profile={profile}
      worker={worker}
      stats={{ totalOffers, acceptedOffers, pendingOffers, totalEarned, successRate: totalOffers>0?Math.round((acceptedOffers/totalOffers)*100):0 }}
      recentOffers={recentOffers}
      applications={applications}
    />
  )
}