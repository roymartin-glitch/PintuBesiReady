import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://btvycizmtxoouqanedwv.supabase.co'
  const supabaseAnonKey = 'sb_publishable_GGH4UinVz3WB2LHZuAtcQg_H1D9ywcj'

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // dipanggil dari Server Component, boleh diabaikan
            // karena middleware yang akan refresh session
          }
        },
      },
    }
  )
}
