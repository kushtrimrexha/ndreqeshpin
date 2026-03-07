import { redirect }             from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { supabaseAdmin }        from '@/lib/supabase/admin'
import PageShell                from '@/components/PageShell'
import AdminCompaniesClient     from './AdminCompaniesClient'

export default async function AdminCompaniesPage() {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role, full_name, package_type').eq('id', session.user.id).single()
  if (!profile || profile.role !== 'admin') redirect('/login')

  const { data: companies } = await supabaseAdmin
    .from('companies')
    .select(`
      id, business_name, description, website, is_verified, rating_avg,
      created_at, package_type,
      profiles!companies_profile_id_fkey(id, full_name, email, city, phone, avatar_url, created_at)
    `)
    .order('created_at', { ascending: false })

  // Offer counts per company
  const { data: offerCounts } = await supabaseAdmin
    .from('offers')
    .select('company_id, status')

  const countMap: Record<string, { total: number; accepted: number }> = {}
  ;(offerCounts || []).forEach(o => {
    if (!o.company_id) return
    if (!countMap[o.company_id]) countMap[o.company_id] = { total: 0, accepted: 0 }
    countMap[o.company_id].total++
    if (o.status === 'accepted') countMap[o.company_id].accepted++
  })

  return (
    <PageShell role="admin" userName={profile.full_name} pageTitle="Kompanitë" pageIcon="🏢" package={profile.package_type}>
      <AdminCompaniesClient companies={companies || []} offerCounts={countMap} />
    </PageShell>
  )
}