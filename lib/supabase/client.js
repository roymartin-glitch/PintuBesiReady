import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://btvycizmtxoouqanedwv.supabase.co'
  const supabaseAnonKey = 'sb_publishable_GGH4UinVz3WB2LHZuAtcQg_H1D9ywcj'

  if (!supabaseUrl) {
    console.error('❌ Supabase URL missing!')
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )
}
