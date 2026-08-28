import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'Riwayat Pesanan Pelanggan | Pintu Besi Shop',
  description: 'Tinjau daftar riwayat pesanan dan pantau pengerjaan pintu besi Anda secara real-time.',
}

export default async function UserOrdersPage() {
  const supabase = createClient()

  // Authenticate user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login?redirect=/dashboard/pesanan')
  }

  // Get orders
  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const statusColors = {
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-250',
    confirmed: 'bg-blue-50 text-blue-700 border-blue-250',
    processing: 'bg-indigo-50 text-indigo-700 border-indigo-250',
    shipped: 'bg-purple-50 text-purple-700 border-purple-250',
    completed: 'bg-green-50 text-green-700 border-green-250',
    cancelled: 'bg-red-50 text-red-700 border-red-250',
  }

  const statusLabels = {
    pending: 'Menunggu Konfirmasi',
    confirmed: 'Dikonfirmasi',
    processing: 'Sedang Fabrikasi',
    shipped: 'Sedang Dikirim',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
  }

  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        
        {/* Navigation Breadcrumbs */}
        <div className="mb-6 flex gap-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-blue-600 transition">Beranda</Link>
          <span>/</span>
          <Link href="/dashboard" className="hover:text-blue-600 transition">Dashboard</Link>
          <span>/</span>
          <span className="text-slate-600 font-semibold">Pesanan Saya</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar Menu */}
          <aside className="lg:col-span-3 space-y-2">
            <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm space-y-1">
              <Link 
                href="/dashboard" 
                className="block text-xs font-bold px-4 py-3 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl"
              >
                📋 Riwayat Pesanan
              </Link>
              <Link 
                href="/dashboard/profil" 
                className="block text-xs font-semibold px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl"
              >
                👤 Ubah Profil / Alamat
              </Link>
            </div>
          </aside>

          {/* Orders List Column */}
          <div className="lg:col-span-9 space-y-6">
            
            <div className="border-b pb-4">
              <h2 className="text-xl font-bold text-slate-800">Daftar Transaksi Pemesanan</h2>
              <p className="text-slate-500 text-xs mt-1">Gunakan tautan detail untuk melihat progress fabrikasi besi dan estimasi pengiriman</p>
            </div>

            {(!orders || orders.length === 0) ? (
              <div className="text-center py-20 border border-slate-200/60 rounded-3xl bg-white shadow-sm flex flex-col items-center justify-center p-6">
                <span className="text-5xl mb-4">📋</span>
                <h3 className="font-bold text-slate-800 text-base mb-2">Belum Ada Transaksi</h3>
                <p className="text-slate-400 text-xs max-w-sm mb-6 leading-relaxed">
                  Anda belum pernah memesan produk pintu besi, pagar otomatis, teralis, atau canopy di toko kami.
                </p>
                <Link
                  href="/produk"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-md shadow-blue-500/10"
                >
                  Mulai Belanja Sekarang
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div 
                    key={order.id} 
                    className="bg-white border border-slate-200/60 rounded-2xl p-5 sm:p-6 hover:shadow-md transition duration-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                  >
                    
                    {/* Left Info Column */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-xs font-bold text-slate-700 font-mono">
                          ID: #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className="text-slate-200 font-light">|</span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {new Date(order.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-lg border font-bold uppercase tracking-wider ${statusColors[order.status]}`}>
                          {statusLabels[order.status]}
                        </span>
                      </div>

                      {/* Snippet Items */}
                      <div className="text-xs text-slate-500 font-medium leading-relaxed">
                        {order.order_items?.map((item) => (
                          <div key={item.id} className="line-clamp-1">
                            • {item.product_name} <span className="text-slate-400 font-bold">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right Price & Actions Column */}
                    <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-4 sm:pt-0 gap-3 w-full sm:w-auto shrink-0 border-slate-100">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold text-left sm:text-right uppercase">Total Bayar</p>
                        <p className="font-extrabold text-slate-900 text-base sm:text-lg">
                          Rp {Number(order.total_price).toLocaleString('id-ID')}
                        </p>
                      </div>
                      <Link
                        href={`/dashboard/pesanan/${order.id}`}
                        className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-200/80 transition"
                      >
                        Detail Pesanan
                      </Link>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>

        </div>
      </main>
    </>
  )
}
