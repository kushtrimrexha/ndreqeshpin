import { NextResponse }        from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { supabaseAdmin }        from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { full_name, city, phone, bio, avatar_url, // profiles fields
            business_name, description, website, category_ids, // company fields
            skills, experience_years, hourly_rate,             // worker fields
          } = body

    // 1. Update profiles table
    const profileUpdate: Record<string, any> = { updated_at: new Date().toISOString() }
    if (full_name)   profileUpdate.full_name  = full_name.trim()
    if (city)        profileUpdate.city       = city.trim()
    if (phone !== undefined) profileUpdate.phone = phone
    if (bio   !== undefined) profileUpdate.bio   = bio
    if (avatar_url)  profileUpdate.avatar_url = avatar_url

    const { error: profileErr } = await supabaseAdmin
      .from('profiles')
      .update(profileUpdate)
      .eq('id', session.user.id)

    if (profileErr) throw profileErr

    // 2. Get user role
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    // 3. Update company table if role is company
    if (profile?.role === 'company') {
      const companyUpdate: Record<string, any> = { updated_at: new Date().toISOString() }
      if (business_name !== undefined) companyUpdate.business_name = business_name
      if (description   !== undefined) companyUpdate.description   = description
      if (website       !== undefined) companyUpdate.website       = website

      if (Object.keys(companyUpdate).length > 1) {
        await supabaseAdmin
          .from('companies')
          .update(companyUpdate)
          .eq('profile_id', session.user.id)
      }
    }

    // 4. Update worker table if role is worker
    if (profile?.role === 'worker') {
      const workerUpdate: Record<string, any> = { updated_at: new Date().toISOString() }
      if (bio              !== undefined) workerUpdate.bio              = bio
      if (skills           !== undefined) workerUpdate.skills           = skills
      if (experience_years !== undefined) workerUpdate.experience_years = experience_years
      if (hourly_rate      !== undefined) workerUpdate.hourly_rate      = hourly_rate

      if (Object.keys(workerUpdate).length > 1) {
        await supabaseAdmin
          .from('workers')
          .update(workerUpdate)
          .eq('profile_id', session.user.id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Profile update error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}