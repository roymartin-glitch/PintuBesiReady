import { createClient } from './server'

/**
 * Get store settings from database
 * Returns single row with all store configuration
 * Used in Server Components
 */
export async function getStoreSettings() {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .limit(1)
    .single()

  if (error) {
    console.error('Error fetching store settings:', error)
    // Return default values if fetch fails
    return {
      store_name: 'Pintu Besi Shop',
      store_tagline: 'Konstruksi Besi Kokoh, Presisi & Premium',
      store_description: 'Toko pintu besi berkualitas',
      whatsapp_number: '6281331941357',
      phone_number: '0813-3194-1357',
      email: 'info@pintubesi.shop',
      address: 'Indonesia',
      business_hours: 'Senin - Sabtu: 08.00 - 17.00 WIB',
      footer_text: '© 2024 Pintu Besi Shop. All rights reserved.'
    }
  }

  return data
}

/**
 * Get store settings for Client Components
 * Use this in Client Components that need store info
 */
export async function getStoreSettingsClient(supabaseClient) {
  const { data, error } = await supabaseClient
    .from('store_settings')
    .select('*')
    .limit(1)
    .single()

  if (error) {
    console.error('Error fetching store settings:', error)
    return {
      store_name: 'Pintu Besi Shop',
      whatsapp_number: '6281331941357',
    }
  }

  return data
}
