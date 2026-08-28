'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/components/CartContext'
import { createClient } from '@/lib/supabase/client'

export default function OrderActions({ product }) {
  const { addToCart } = useCart()
  const supabase = createClient()
  const [qty, setQty] = useState(1)
  const [showSuccessMsg, setShowSuccessMsg] = useState(false)
  const [waNumber, setWaNumber] = useState('628123456789')

  // Fetch WhatsApp number from store settings
  useEffect(() => {
    async function fetchWaNumber() {
      const { data } = await supabase
        .from('store_settings')
        .select('whatsapp_number')
        .limit(1)
        .single()

      if (data?.whatsapp_number) {
        setWaNumber(data.whatsapp_number)
      } else {
        // Fallback to env variable
        setWaNumber(process.env.NEXT_PUBLIC_WA_NUMBER || '628123456789')
      }
    }
    fetchWaNumber()
  }, [supabase])

  function handleAddToCartClick() {
    addToCart(product, qty)
    setShowSuccessMsg(true)
    setTimeout(() => {
      setShowSuccessMsg(false)
    }, 3000)
  }

  function handleWhatsAppOrder() {
    const message = `Halo, saya mau pesan:\n\n*${product.name}*\nJumlah: ${qty} unit\nHarga satuan: Rp ${Number(product.price).toLocaleString('id-ID')}\nTotal: Rp ${(product.price * qty).toLocaleString('id-ID')}\nUkuran: ${product.size || '-'}\nMaterial: ${product.material || '-'}\n\nMohon info ketersediaan dan detail pengirimannya. Terima kasih.`
    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  return (
    <div className="mt-4 space-y-4">
      
      {/* Quantity Selector */}
      <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/40 w-fit">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jumlah Unit:</label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={product.stock <= 0 || qty <= 1}
            onClick={() => setQty(qty - 1)}
            className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold hover:bg-slate-50 text-slate-700 disabled:opacity-40 select-none shadow-sm"
          >
            -
          </button>
          <span className="w-10 text-center font-extrabold text-sm text-slate-800">
            {product.stock <= 0 ? 0 : qty}
          </span>
          <button
            type="button"
            disabled={product.stock <= 0 || qty >= product.stock}
            onClick={() => setQty(qty + 1)}
            className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold hover:bg-slate-50 text-slate-700 disabled:opacity-40 select-none shadow-sm"
          >
            +
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={handleAddToCartClick}
          disabled={product.stock <= 0}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white py-3 px-6 rounded-2xl text-sm font-bold transition shadow-lg shadow-blue-500/10 active:scale-98"
        >
          {product.stock <= 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
        </button>
        <button
          onClick={handleWhatsAppOrder}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-2xl text-sm font-bold transition shadow-lg shadow-green-500/10 flex items-center justify-center gap-2 active:scale-98"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.66.986 3.284 1.447 4.72 1.448 5.539 0 10.048-4.482 10.05-9.988.002-2.67-1.018-5.174-2.87-7.03C16.692 1.727 14.2 1.701 11.58 1.701c-5.54 0-10.046 4.49-10.049 9.996-.001 1.89.5 3.73 1.45 5.34L1.87 21.08l4.777-1.926z" />
          </svg>
          Pesan via WhatsApp
        </button>
      </div>

      {/* Success Notification Alert Toast */}
      {showSuccessMsg && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <span>✓</span> Berhasil ditambahkan ke keranjang belanja Anda!
        </div>
      )}

    </div>
  )
}
