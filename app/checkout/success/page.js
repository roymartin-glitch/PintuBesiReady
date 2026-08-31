'use client'

import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SuccessPageContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id') || ''

  const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER || '6285276358423'
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(`Halo Admin Pintu Besi Shop, saya baru saja membuat pesanan dengan ID Order: *${orderId}*.\n\nMohon konfirmasi pesanan saya dan berikan petunjuk untuk langkah selanjutnya. Terima kasih.`)}`

  return (
    <div className="max-w-xl mx-auto my-auto py-12 px-6 bg-white border border-slate-200/60 rounded-3xl shadow-lg text-center space-y-6">
      
      {/* Success Animation Emblem */}
      <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center text-4xl mx-auto shadow-inner border border-green-100">
        ✓
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Pesanan Berhasil Dibuat!</h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          Terima kasih telah memesan di Pintu Besi Shop. Pesanan Anda telah tersimpan dengan aman di sistem kami.
        </p>
      </div>

      {orderId && (
        <div className="bg-slate-50 p-4 border border-slate-200/60 rounded-2xl">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">ID Transaksi / Order Reference</p>
          <code className="text-xs sm:text-sm font-mono text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg select-all border border-slate-200">
            {orderId}
          </code>
        </div>
      )}

      <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl text-xs text-blue-800 leading-relaxed text-left">
        💡 <strong>Langkah Selanjutnya:</strong> Hubungi admin kami via WhatsApp dengan tombol di bawah untuk detail biaya pengiriman, estimasi waktu fabrikasi, dan prosedur pembayaran down payment (DP).
      </div>

      {/* Navigation & Contact Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl text-sm font-bold transition shadow-lg shadow-green-500/10 flex items-center justify-center gap-2 active:scale-98"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.66.986 3.284 1.447 4.72 1.448 5.539 0 10.048-4.482 10.05-9.988.002-2.67-1.018-5.174-2.87-7.03C16.692 1.727 14.2 1.701 11.58 1.701c-5.54 0-10.046 4.49-10.049 9.996-.001 1.89.5 3.73 1.45 5.34L1.87 21.08l4.777-1.926z" />
          </svg>
          Hubungi Admin (WA)
        </a>
        <Link
          href="/dashboard"
          className="flex-1 bg-slate-900 hover:bg-slate-850 text-white text-center py-3.5 rounded-xl text-sm font-bold transition active:scale-98"
        >
          Lihat Status Pesanan
        </Link>
      </div>

      <div className="pt-2">
        <Link href="/produk" className="text-xs font-bold text-blue-600 hover:underline">
          ← Belanja Lagi
        </Link>
      </div>

    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 flex flex-col justify-center">
        <Suspense fallback={
          <div className="max-w-xl mx-auto py-12 px-6 text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        }>
          <SuccessPageContent />
        </Suspense>
      </main>
    </>
  )
}
