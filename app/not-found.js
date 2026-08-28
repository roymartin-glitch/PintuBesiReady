import Link from 'next/link'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'Halaman Tidak Ditemukan (404) | Pintu Besi Shop',
}

export default function NotFoundPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-xl mx-auto my-auto px-6 py-16 text-center space-y-6 flex-1 flex flex-col justify-center">
        
        {/* Large 404 text icon */}
        <div className="text-8xl select-none font-black text-slate-200">
          404
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Halaman Tidak Ditemukan</h1>
          <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
            Maaf, halaman yang Anda tuju tidak tersedia atau telah dipindahkan ke alamat lain.
          </p>
        </div>

        {/* Navigation CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-3.5 rounded-xl text-xs font-bold transition shadow-lg shadow-blue-500/10 active:scale-98"
          >
            Kembali ke Beranda
          </Link>
          <Link
            href="/produk"
            className="flex-1 bg-slate-900 hover:bg-slate-850 text-white text-center py-3.5 rounded-xl text-xs font-bold transition active:scale-98"
          >
            Lihat Katalog Produk
          </Link>
        </div>

      </main>
    </>
  )
}
