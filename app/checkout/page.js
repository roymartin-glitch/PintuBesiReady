'use client'

import { useCart } from '@/components/CartContext'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function CheckoutPage() {
  const { cart, cartSubtotal, cartCount, clearCart } = useCart()
  const router = useRouter()
  const supabase = createClient()

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
  })

  // Auth & Profile Check
  useEffect(() => {
    async function checkUserAndProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        // Redirect to login if guest attempts checkout
        router.push('/auth/login?redirect=/checkout')
        return
      }

      // Fetch profile to prefill form
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone, address')
        .eq('id', user.id)
        .single()

      if (profile) {
        setForm({
          name: profile.full_name || '',
          phone: profile.phone || '',
          address: profile.address || '',
          notes: '',
        })
      }
      setIsLoading(false)
    }

    checkUserAndProfile()
  }, [supabase, router])

  // Redirect to cart if empty
  useEffect(() => {
    if (!isLoading && cart.length === 0) {
      router.push('/cart')
    }
  }, [cart, isLoading, router])

  async function handleSubmit(e) {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: form.name,
          customer_phone: form.phone,
          customer_address: form.address,
          notes: form.notes,
          items: cart.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
          })),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Terjadi kesalahan saat memproses pesanan')
      }

      // Clear local shopping cart state on success
      clearCart()

      // Redirect to checkout success page
      router.push(`/checkout/success?order_id=${data.order_id}`)
    } catch (err) {
      setErrorMessage(err.message)
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center flex-1 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 mt-4 text-sm font-semibold">Mengotentikasi & memuat profil Anda...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        
        {/* Header Breadcrumbs */}
        <div className="mb-8 border-b border-slate-200/80 pb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Checkout Pemesanan</h1>
          <p className="text-slate-500 text-sm mt-1">Lengkapi informasi pengiriman Anda untuk menyelesaikan pemesanan</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Checkout Forms Column */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Section 1: Customer Information */}
            <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b pb-3">
                <span className="text-blue-600">👤</span> Informasi Penerima
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Nama Lengkap</label>
                  <input
                    required
                    type="text"
                    placeholder="Contoh: Budi Santoso"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Nomor WhatsApp / HP</label>
                  <input
                    required
                    type="tel"
                    placeholder="Contoh: 08123456789"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Shipping/Address */}
            <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b pb-3">
                <span className="text-blue-600">📍</span> Alamat Pengiriman
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Alamat Lengkap Rumah / Properti</label>
                  <textarea
                    required
                    placeholder="Nama jalan, nomor rumah, RT/RW, kecamatan, kota, kode pos..."
                    rows={4}
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Catatan Tambahan (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Warna cat pintu, catatan pengiriman, patokan alamat, dll."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Section 3: Order Summary Column */}
          <div className="lg:col-span-4 bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-6 sticky top-24">
            <h3 className="font-extrabold text-slate-800 text-base border-b pb-3 flex items-center gap-2">
              <span>📋</span> Detail Pesanan
            </h3>

            {/* Items Summary list */}
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.product_id} className="flex justify-between items-center text-xs gap-3">
                  <span className="text-slate-600 font-medium line-clamp-1 flex-1">
                    {item.name} <span className="text-slate-400 font-bold">x{item.quantity}</span>
                  </span>
                  <span className="font-bold text-slate-800">
                    Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>

            {/* Subtotals & Total */}
            <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Jumlah Unit</span>
                <span className="font-semibold text-slate-800">{cartCount} Unit</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ongkos Kirim</span>
                <span className="font-semibold text-green-600">Belum Termasuk (Hubungi Admin)</span>
              </div>
              
              <div className="border-t border-slate-100 pt-4 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-700">Total Pembayaran</span>
                <span className="text-xl font-black text-slate-900">
                  Rp {cartSubtotal.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-semibold leading-relaxed">
                ⚠️ {errorMessage}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-350 text-white text-center py-4 rounded-xl font-extrabold text-sm transition shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Memproses Pesanan...
                </>
              ) : (
                'Buat Pesanan & Selesaikan'
              )}
            </button>

            <div className="text-[10px] text-slate-400 text-center leading-relaxed">
              Dengan membuat pesanan, pesanan Anda akan dicatat ke dalam database kami. Admin kami akan menghubungi Anda melalui WhatsApp untuk mengkonfirmasi pesanan dan metode pembayaran.
            </div>

          </div>

        </form>
      </main>
    </>
  )
}
