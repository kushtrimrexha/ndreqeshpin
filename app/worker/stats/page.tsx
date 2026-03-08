import { redirect }             from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { supabaseAdmin }        from '@/lib/supabase/admin'
import PageShell                from '@/components/PageShell'
import WorkerStatsClient        from './WorkerStatsClient'

export default async function WorkerStatsPage() {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*, workers(*)').eq('id', session.user.id).single()
  if (!profile || profile.role !== 'worker') redirect('/login')

  const worker = profile.workers
  const now    = new Date()

  async function safeList(q: any): Promise<any[]> {
    try { const r = await q; return r?.data ?? [] } catch { return [] }
  }

  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString()

  const [offers, reviews, recentOffers] = await Promise.all([
    safeList(supabaseAdmin.from('offers').select('id,price,status,created_at,applications(title,city)').eq('worker_id', worker?.id||'').order('created_at',{ascending:false})),
    safeList(supabaseAdmin.from('reviews').select('id,rating,comment,created_at,reviewer:profiles!reviews_reviewer_id_fkey(full_name,avatar_url),application:applications(title)').eq('reviewee_id', profile.id).order('created_at',{ascending:false}).limit(20)),
    safeList(supabaseAdmin.from('offers').select('id,price,status,created_at,applications(title,city)').eq('worker_id', worker?.id||'').gte('created_at', sixMonthsAgo).order('created_at',{ascending:true})),
  ])

  // Monthly earnings last 6 months
  const months: Record<string,{earned:number;sent:number}> = {}
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth()-i, 1)
    months[d.toLocaleDateString('sq-AL',{month:'short',year:'2-digit'})] = {earned:0, sent:0}
  }
  recentOffers.forEach((o:any) => {
    try {
      const key = new Date(o.created_at).toLocaleDateString('sq-AL',{month:'short',year:'2-digit'})
      if (key in months) {
        months[key].sent++
        if (o.status==='accepted') months[key].earned += (o.price||0)
      }
    } catch {}
  })

  // Status breakdown
  const statusCounts = offers.reduce((acc:any,o:any)=>{acc[o.status]=(acc[o.status]||0)+1;return acc},{})
  const totalEarned  = offers.filter((o:any)=>o.status==='accepted').reduce((s:number,o:any)=>s+(o.price||0),0)
  const avgPrice     = offers.length > 0 ? Math.round(offers.reduce((s:any,o:any)=>s+o.price,0)/offers.length) : 0
  const ratingBreakdown = [1,2,3,4,5].map(r=>({ r, count: reviews.filter((rv:any)=>rv.rating===r).length }))

  return (
    <PageShell role="worker" userName={profile.full_name} userId={session.user.id} pageTitle="Statistikat" pageIcon="📊" package={profile.package_type}>
      <WorkerStatsClient
        workerName={profile.full_name}
        offers={offers}
        reviews={reviews}
        monthlyData={Object.entries(months).map(([label,v])=>({label,...v}))}
        statusCounts={statusCounts}
        stats={{
          totalOffers:    offers.length,
          acceptedOffers: statusCounts.accepted||0,
          pendingOffers:  statusCounts.pending||0,
          totalEarned,
          avgPrice,
          successRate:    offers.length>0?Math.round(((statusCounts.accepted||0)/offers.length)*100):0,
          ratingAvg:      worker?.rating_avg||0,
          totalReviews:   reviews.length,
        }}
        ratingBreakdown={ratingBreakdown}
      />
    </PageShell>
  )
}