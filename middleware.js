import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Proteksi semua route di bawah /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Halaman login admin sendiri tidak diproteksi
    if (request.nextUrl.pathname === '/admin/login') {
      return response
    }

    // Debug log
    console.log('🔍 Middleware - Path:', request.nextUrl.pathname)
    console.log('👤 User:', user ? user.email : 'No user')

    if (!user) {
      console.log('❌ Tidak ada user, redirect ke /admin/login')
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    console.log('👔 Profile role:', profile?.role || 'No profile')
    if (profileError) {
      console.log('❌ Profile error:', profileError.message)
    }

    if (!profile || profile.role !== 'admin') {
      console.log('❌ Bukan admin, redirect ke /')
      return NextResponse.redirect(new URL('/', request.url))
    }

    console.log('✅ Admin verified, allow access')
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
