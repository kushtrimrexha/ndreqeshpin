import { redirect }             from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { supabaseAdmin }        from '@/lib/supabase/admin'
import PageShell                from '@/components/PageShell'
import CompanyApplicationsClient from './CompanyApplicationsClient'

export default async function CompanyApplicationsPage() {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*, companies(*)').eq('id', session.user.id).single()
  if (!profile || profile.role !== 'company' || !profile.companies) redirect('/login')

  const { data: applications } = await supabaseAdmin
    .from('applications')
    .select('*, categories(name,icon), profiles!client_id(full_name,city)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  // Ofertat e kësaj kompanie — për të treguar nëse ka ofertuar tashmë
  const { data: myOffers } = await supabaseAdmin
    .from('offers')
    .select('application_id, status')
    .eq('company_id', profile.companies.id)

  const offeredSet = new Set((myOffers || []).map(o => o.application_id))

  return (
    <PageShell role="company" userName={profile.full_name} pageTitle="Aplikimet" pageIcon="📋" package={profile.package_type}>
      <CompanyApplicationsClient
        applications={applications || []}
        offeredSet={Array.from(offeredSet)}
        company={profile.companies}
      />
    </PageShell>
  )
}