'use client'

import { useCart } from '@/components/CartContext'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartSubtotal, cartCount } = useCart()
  const router = useRouter()
  const supabase = createClient()
  
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
      setIsAuthLoading(false)
    }
    checkSession()
  }, [supabase])

  const handleCheckoutRedirect = () => {
    if (isAuthLoading) return
    
    if (isAuthenticated) {
      router.push('/checkout')
    } else {
      router.push('/auth/login?redirect=/checkout')
    }
  }

  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col justify-between">
        
        {/* Header Title */}
        <div className="mb-8 border-b border-slate-200/80 pb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Keranjang Belanja</h1>
            <p className="text-slate-500 text-sm mt-1">Mengelola item terpilih sebelum melakukan proses pemesanan</p>
          </div>
          <Link href="/produk" className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline">
            ← Lanjut Belanja
          </Link>
        </div>

        {cart.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              {cart.map((item) => (
                <div 
                  key={item.product_id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 bg-white border border-slate-200/60 rounded-2xl gap-4 hover:shadow-md transition duration-300"
                >
                  <div className="flex items-center gap-4">
                    {/* Item Thumbnail */}
                    <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-200/50 flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xl">🚪</span>
                      )}
                    </div>

                    {/* Item Info */}
                    <div className="space-y-1">
                      <Link href={`/produk/${item.slug}`} className="font-bold text-slate-800 hover:text-blue-600 transition text-sm sm:text-base line-clamp-1">
                        {item.name}
                      </Link>
                      <p className="text-xs text-slate-400">Harga Satuan: Rp {Number(item.price).toLocaleString('id-ID')}</p>
                    </div>
                  </div>

                  {/* Quantity and Actions Controls */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0">
                    
                    {/* Quantity Edit Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center font-bold hover:bg-slate-100 text-slate-700"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-bold text-sm text-slate-800">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center font-bold hover:bg-slate-100 text-slate-700 disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>

                    {/* Item Subtotal Price */}
                    <div className="text-right min-w-[100px]">
                      <p className="font-extrabold text-slate-900 text-sm sm:text-base">
                        Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                      </p>
                    </div>

                    {/* Remove Action Button */}
                    <button
                      onClick={() => removeFromCart(item.product_id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                      aria-label="Hapus item"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-9v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>

                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-4 bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-4 sticky top-24">
              <h3 className="font-extrabold text-slate-800 text-base">Ringkasan Belanja</h3>
              
              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-3 flex justify-between">
                  <span className="text-slate-500">Total Jumlah Barang</span>
                  <span className="font-semibold text-slate-800">{cartCount} Unit</span>
                </div>
                <div className="py-4 flex justify-between items-baseline">
                  <span className="text-slate-600 font-bold text-sm">Subtotal Tagihan</span>
                  <span className="font-black text-slate-900 text-lg">
                    Rp {cartSubtotal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckoutRedirect}
                disabled={isAuthLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3.5 rounded-xl font-bold text-sm transition shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2"
              >
                {isAuthLoading ? 'Memuat...' : 'Lanjutkan ke Checkout'}
              </button>

              <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-[10px] text-blue-800 leading-relaxed">
                ℹ️ Anda wajib masuk/register ke akun Anda untuk menyelesaikan proses transaksi pada halaman checkout selanjutnya.
              </div>
            </div>

          </div>
        ) : (
          <div className="text-center py-24 border border-slate-200/60 rounded-3xl bg-white shadow-sm flex flex-col items-center justify-center p-6 my-auto">
            <span className="text-6xl mb-4">🛒</span>
            <h3 className="font-black text-slate-800 text-xl mb-2">Keranjang Belanja Kosong</h3>
            <p className="text-slate-400 text-sm max-w-sm mb-8 leading-relaxed">
              Anda belum menambahkan pintu besi atau konstruksi teralis apa pun ke dalam daftar keranjang Anda.
            </p>
            <Link href="/produk" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl text-sm font-bold transition shadow-lg shadow-blue-500/10">
              Lihat Katalog Produk
            </Link>
          </div>
        )}
      </main>
    </>
  )
}
