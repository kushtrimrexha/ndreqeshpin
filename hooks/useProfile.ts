'use client'

import { useEffect, useState, createContext, useContext, ReactNode } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export interface Profile {
  id: string
  full_name: string
  email: string
  role: 'client' | 'company' | 'worker' | 'admin'
  city?: string
  avatar_url?: string
  package_type: 'free' | 'premium'
  premium_expires_at?: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
  premium_plan_type?: string
  companies?: { id: string; business_name: string; is_verified: boolean; logo_url?: string }
  workers?: { id: string; profession: string; rating_avg?: number }
  created_at: string
}

interface ProfileContextType {
  profile: Profile | null
  loading: boolean
  refresh: () => Promise<void>
  isPremium: boolean
}

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  loading: true,
  refresh: async () => {},
  isPremium: false,
})

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const fetchProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setLoading(false); return }

    const { data } = await supabase
      .from('profiles')
      .select('*, companies(*), workers(*)')
      .eq('id', session.user.id)
      .single()

    setProfile(data as Profile)
    setLoading(false)
  }

  useEffect(() => {
    fetchProfile()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) { setProfile(null); setLoading(false) }
      else fetchProfile()
    })

    return () => subscription.unsubscribe()
  }, [])

  const isPremium = profile?.package_type === 'premium' &&
    (!profile.premium_expires_at || new Date(profile.premium_expires_at) > new Date())

  return (
    <ProfileContext.Provider value={{ profile, loading, refresh: fetchProfile, isPremium }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  return useContext(ProfileContext)
}