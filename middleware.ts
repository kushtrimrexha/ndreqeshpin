import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (n) => request.cookies.get(n)?.value,
        set: (n, v, o) => {
          request.cookies.set({ name: n, value: v, ...o })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name: n, value: v, ...o })
        },
        remove: (n, o) => {
          request.cookies.set({ name: n, value: '', ...o })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name: n, value: '', ...o })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  const { pathname } = request.nextUrl

  // Këto route lejohen gjithmonë — pa login
  if (
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('favicon')
  ) {
    return response
  }

  // Nëse nuk ka session, dërgo tek login
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\..*).*)'],
}