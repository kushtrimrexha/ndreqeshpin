'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
  const email    = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createServerSupabase()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: 'Email ose fjalëkalimi është gabim.' }
  }

  // Merr rolin nga profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  const redirectMap: Record<string, string> = {
    client:  '/client/dashboard',
    company: '/company/dashboard',
    worker:  '/worker/dashboard',
    admin:   '/admin/dashboard',
  }

  redirect(redirectMap[profile?.role || 'client'])
}