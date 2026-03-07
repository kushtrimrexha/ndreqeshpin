import { redirect }             from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import CompanyDashboard          from './CompanyDashboard'

export default async function CompanyDashboardPage() {
  const supabase = await createServerSupabase()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, companies(*)')
    .eq('id', session.user.id)
    .single()

  if (!profile)                    redirect('/login')
  if (profile.role !== 'company')  redirect(`/${profile.role}/dashboard`)

  // Nëse company nuk ekziston ende, kthehu tek login
  if (!profile.companies)          redirect('/login')

  return <CompanyDashboard profile={profile} company={profile.companies} />
}