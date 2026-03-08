/* versioni i pare qe ishte me error dhe nuk me lejojke me publiku ne vercel
import { createServerClient } from '@supabase/ssr'
import { cookies }            from 'next/headers'

export async function createServerSupabase() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get:    (n) => cookieStore.get(n)?.value,
        set:    (n, v, o) => cookieStore.set({ name: n, value: v, ...o }),
        remove: (n, o) => cookieStore.set({ name: n, value: '', ...o }),
      },
    }
  )
} */
import { createServerClient } from '@supabase/ssr'
import { cookies }            from 'next/headers'

export async function createServerSupabase() {
  const cookieStore = await cookies()

  // Heqim "!" dhe shtojmë "|| ''"
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        // Kontrollojmë nëse cookieStore ekziston para se të bëjmë get
        get: (n) => {
          try {
            return cookieStore.get(n)?.value;
          } catch {
            return undefined;
          }
        },
        set: (n, v, o) => {
          try {
            cookieStore.set({ name: n, value: v, ...o });
          } catch {
            // Injorohet gjatë build-it statik
          }
        },
        remove: (n, o) => {
          try {
            cookieStore.set({ name: n, value: '', ...o });
          } catch {
            // Injorohet gjatë build-it statik
          }
        },
      },
    }
  )
}