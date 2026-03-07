import { createServerSupabase } from '@/lib/supabase/server'
import { redirect }             from 'next/navigation'
import PricingClient            from './PricingClient'

export const metadata = { title: 'Çmimi — NdreqeShpin' }

export default async function PricingPage() {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('package_type, role')
    .eq('id', session.user.id)
    .single()

  return (
    <PricingClient
      isPremium={profile?.package_type === 'premium'}
      userRole={profile?.role || 'client'}
    />
  )
}