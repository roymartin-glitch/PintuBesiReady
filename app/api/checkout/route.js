import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const supabase = createClient()
  
  // 1. Verifikasi status login user di server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Pengguna harus login terlebih dahulu' }, { status: 401 })
  }

  const body = await request.json()
  const { customer_name, customer_phone, customer_address, notes, items } = body

  // 2. Validasi input dasar
  if (!customer_name || !customer_phone || !items?.length) {
    return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
  }

  // 3. Panggil RPC process_checkout di Supabase. 
  // Database akan mengecek stok, mengambil harga asli dari DB (Single Source of Truth),
  // mengurangi stok, serta mencatat data order & items dalam satu transaksi.
  const { data: orderId, error: checkoutError } = await supabase.rpc('process_checkout', {
    p_customer_name: customer_name,
    p_customer_phone: customer_phone,
    p_customer_address: customer_address || '',
    p_notes: notes || '',
    p_items: items.map((item) => ({
      product_id: item.product_id,
      quantity: Number(item.quantity)
    }))
  })

  // 4. Jika database mengembalikan error (misalnya stok tidak cukup, produk tidak aktif, dll)
  if (checkoutError) {
    console.error('❌ Checkout error:', checkoutError.message)
    return NextResponse.json({ error: checkoutError.message }, { status: 400 })
  }

  return NextResponse.json({ success: true, order_id: orderId })
}
