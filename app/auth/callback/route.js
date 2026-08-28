import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirect = requestUrl.searchParams.get('redirect') || '/'

  if (code) {
    const supabase = createClient()
    
    // Exchange code for session
    await supabase.auth.exchangeCodeForSession(code)
    
    // Get user info
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      console.log('✅ Google OAuth successful for user:', user.email)
      
      // Check if profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // Create or update profile with Google data
      if (!profile) {
        // Create new profile for Google user
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
            phone: user.user_metadata?.phone || '',
            role: 'visitor', // Always visitor for Google OAuth
          })

        if (insertError) {
          console.error('Error creating profile:', insertError)
        } else {
          console.log('✅ Profile created for Google user')
        }
      } else {
        // Update existing profile with Google info if needed
        if (!profile.full_name && user.user_metadata?.full_name) {
          await supabase
            .from('profiles')
            .update({
              full_name: user.user_metadata.full_name || user.user_metadata.name,
            })
            .eq('id', user.id)
        }
        console.log('✅ Existing profile found, user logged in')
      }
    }
  }

  // Redirect to the original destination or homepage
  return NextResponse.redirect(new URL(redirect, requestUrl.origin))
}
