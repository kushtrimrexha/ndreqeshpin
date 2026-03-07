import { redirect }             from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { supabaseAdmin }        from '@/lib/supabase/admin'
import PageShell                from '@/components/PageShell'
import CompanyOffersClient      from './CompanyOffersClient'

export default async function CompanyOffersPage() {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*, companies(*)').eq('id', session.user.id).single()
  if (!profile || profile.role !== 'company' || !profile.companies) redirect('/login')

  const { data: offers } = await supabaseAdmin
    .from('offers')
    .select(`
      id, price, duration_days, description, status, created_at,
      applications(id, title, city, status,
        profiles!client_id(full_name)
      )
    `)
    .eq('company_id', profile.companies.id)
    .order('created_at', { ascending: false })

  return (
    <PageShell role="company" userName={profile.full_name} pageTitle="Ofertat e mia" pageIcon="💼" package={profile.package_type}>
      <CompanyOffersClient offers={offers || []} />
    </PageShell>
  )
}