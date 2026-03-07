import { redirect }             from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import PageShell                from '@/components/PageShell'
import CompanyProfileClient     from './CompanyProfileClient'

export default async function CompanyProfilePage() {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, companies(*)')
    .eq('id', session.user.id)
    .single()

  if (!profile || profile.role !== 'company') redirect('/login')
  if (!profile.companies) redirect('/login')

  const { count: totalOffers } = await supabase
    .from('offers')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', profile.companies.id)

  const { count: acceptedOffers } = await supabase
    .from('offers')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', profile.companies.id)
    .eq('status', 'accepted')

  return (
    <PageShell
      role="company"
      userName={profile.full_name}
      pageTitle="Profili i biznesit"
      pageIcon="🏢"
      package={profile.package_type}
    >
      <CompanyProfileClient
        profile={profile}
        company={profile.companies}
        stats={{
          totalOffers:    totalOffers    || 0,
          acceptedOffers: acceptedOffers || 0,
        }}
      />
    </PageShell>
  )
}