import { redirect }             from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { supabaseAdmin }        from '@/lib/supabase/admin'
import PageShell                from '@/components/PageShell'
import ClientOffersClient       from './ClientOffersClient'

export default async function ClientOffersPage() {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', session.user.id).single()
  if (!profile || profile.role !== 'client') redirect('/login')

  const { data: offers } = await supabaseAdmin
    .from('offers')
    .select(`
      id, price, duration_days, description, status, created_at,
      applications!inner(id, title, city, status, client_id),
      companies(id, business_name, is_verified, rating_avg)
    `)
    .eq('applications.client_id', profile.id)
    .order('created_at', { ascending: false })

  return (
    <PageShell role="client" userName={profile.full_name} pageTitle="Ofertat e mia" pageIcon="💼" package={profile.package_type}>
      <ClientOffersClient offers={offers || []} />
    </PageShell>
  )
}