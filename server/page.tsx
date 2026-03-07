import { redirect }             from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import NewApplicationPage        from './NewApplicationPage'

export default async function NewApplicationRoute() {
  const supabase = await createServerSupabase()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, city, package_type, role')
    .eq('id', session.user.id)
    .single()

  if (!profile)               redirect('/login')
  if (profile.role !== 'client') redirect('/client/dashboard')

  return <NewApplicationPage profile={profile} />
}