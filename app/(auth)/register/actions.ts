'use server'

import { supabaseAdmin }        from '@/lib/supabase/admin'
import { createServerSupabase } from '@/lib/supabase/server'
import { redirect }             from 'next/navigation'

export async function registerAction(formData: FormData) {
  const email       = formData.get('email')       as string
  const password    = formData.get('password')    as string
  const full_name   = formData.get('full_name')   as string
  const role        = formData.get('role')        as 'client' | 'company' | 'worker'
  const city        = formData.get('city')        as string
  const phone       = formData.get('phone')       as string
  const business_name = formData.get('business_name') as string | null

  // Validim bazik
  if (!email || !password || !full_name || !role) {
    return { error: 'Të gjitha fushat e detyrueshme duhet të plotësohen.' }
  }

  if (password.length < 8) {
    return { error: 'Fjalëkalimi duhet të jetë të paktën 8 karaktere.' }
  }

  // 1. Krijo userin me Admin client (konfirmon email automatikisht)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, role },
  })

  if (authError) {
    if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
      return { error: 'Ky email është i regjistruar tashmë.' }
    }
    return { error: authError.message }
  }

  const userId = authData.user.id

  // 2. Update profile (trigger e ka krijuar automatikisht)
  await supabaseAdmin
    .from('profiles')
    .update({ full_name, role, city, phone })
    .eq('id', userId)

  // 3. Nëse kompani → krijo rekord në companies
  if (role === 'company' && business_name) {
    await supabaseAdmin
      .from('companies')
      .insert({ profile_id: userId, business_name })
  }

  // 4. Nëse punëtor → krijo rekord në workers
  if (role === 'worker') {
    await supabaseAdmin
      .from('workers')
      .insert({ profile_id: userId })
  }

  // 5. Kyç automatikisht pas regjistrimit
  const supabase = await createServerSupabase()
  await supabase.auth.signInWithPassword({ email, password })

  // 6. Ridirektoje sipas rolit
  const redirectMap: Record<string, string> = {
    client:  '/client/dashboard',
    company: '/company/dashboard',
    worker:  '/worker/dashboard',
  }

  redirect(redirectMap[role])
}