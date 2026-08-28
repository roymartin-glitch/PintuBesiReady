import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const metadata = {
  title: 'Dashboard Ringkasan Admin | Pintu Besi Shop',
}

export default async function AdminDashboardPage() {
  const supabase = createClient()

  // 1. Fetch metrics from DB
  const { count: totalOrders } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })

  const { count: totalProducts } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })

  // Stock alert query (< 5 items)
  const { count: lowStockProducts } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .lt('stock', 5)

  // Sum of total_price for confirmed, processing, shipped, completed orders (Total revenue)
  const { data: revenueData } = await supabase
    .from('orders')
    .select('total_price')
    .in('status', ['confirmed', 'processing', 'shipped', 'completed'])

  const totalRevenue = revenueData?.reduce((sum, order) => sum + Number(order.total_price), 0) || 0

  // 2. Fetch 5 recent orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('id, customer_name, total_price, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  const statusColors = {
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    confirmed: 'bg-blue-50 text-blue-700 border-blue-100',
    processing: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    shipped: 'bg-purple-50 text-purple-700 border-purple-100',
    completed: 'bg-green-50 text-green-700 border-green-100',
    cancelled: 'bg-red-50 text-red-700 border-red-100',
  }

  const statusLabels = {
    pending: 'Menunggu',
    confirmed: 'Dikonfirmasi',
    processing: 'Fabrikasi',
    shipped: 'Dikirim',
    completed: 'Selesai',
    cancelled: 'Batal',
  }

  return (
    <div className="space-y-8 flex-1 flex flex-col animate-fade-in">
      
      {/* Page Title */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <span className="text-blue-600">📊</span>
          Ringkasan Kinerja Toko
        </h1>
        <p className="text-slate-500 text-sm">Pantau performa penjualan, ketersediaan produk, dan daftar antrean fabrikasi pintu besi</p>
      </div>

      {/* Metrics Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1: Revenue */}
        <div className="card-premium p-6 flex flex-col justify-between min-h-[140px] hover-lift group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-smooth"></div>
          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💰</span>
              <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Total Pendapatan</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">
              Rp {totalRevenue.toLocaleString('id-ID')}
            </h3>
          </div>
          <p className="text-[10px] text-slate-400 mt-3 relative z-10">Dihitung dari pesanan aktif (non-pending & batal)</p>
        </div>

        {/* Metric 2: Total Orders */}
        <div className="card-premium p-6 flex flex-col justify-between min-h-[140px] hover-lift group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-smooth"></div>
          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📦</span>
              <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Total Transaksi</span>
            </div>
            <h3 className="text-4xl font-black text-slate-900 leading-none">
              {totalOrders || 0}
            </h3>
          </div>
          <Link href="/admin/pesanan" className="text-[10px] text-blue-600 font-bold hover:underline mt-3 flex items-center gap-1 group relative z-10">
            Kelola Antrean Pesanan
            <span className="group-hover:translate-x-1 transition-smooth">→</span>
          </Link>
        </div>

        {/* Metric 3: Active Products */}
        <div className="card-premium p-6 flex flex-col justify-between min-h-[140px] hover-lift group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-smooth"></div>
          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🚪</span>
              <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Total Produk Aktif</span>
            </div>
            <h3 className="text-4xl font-black text-slate-900 leading-none">
              {totalProducts || 0}
            </h3>
          </div>
          <Link href="/admin/produk" className="text-[10px] text-blue-600 font-bold hover:underline mt-3 flex items-center gap-1 group relative z-10">
            Kelola Katalog Produk
            <span className="group-hover:translate-x-1 transition-smooth">→</span>
          </Link>
        </div>

        {/* Metric 4: Low Stock warning */}
        <div className={`p-6 flex flex-col justify-between min-h-[140px] hover-lift group overflow-hidden relative rounded-2xl shadow-premium border transition-smooth ${
          lowStockProducts > 0 
            ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200/60' 
            : 'bg-white border-slate-200/60'
        }`}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-500/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-smooth"></div>
          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{lowStockProducts > 0 ? '⚠️' : '✅'}</span>
              <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Produk Tipis Stok (&lt;5)</span>
            </div>
            <h3 className={`text-4xl font-black leading-none ${lowStockProducts > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {lowStockProducts || 0}
            </h3>
          </div>
          <Link href="/admin/produk" className="text-[10px] text-blue-600 font-bold hover:underline mt-3 flex items-center gap-1 group relative z-10">
            Tinjau Jumlah Stok
            <span className="group-hover:translate-x-1 transition-smooth">→</span>
          </Link>
        </div>

      </div>

      {/* Recent Orders Section */}
      <div className="card-premium p-6 sm:p-8 flex-1 flex flex-col hover-lift">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base uppercase tracking-wider flex items-center gap-2">
              <span className="text-xl">📋</span>
              Antrean Pesanan Terbaru
            </h3>
            <p className="text-slate-500 text-xs mt-1">5 pesanan masuk terakhir dalam antrean</p>
          </div>
          <Link 
            href="/admin/pesanan"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-smooth flex items-center gap-1 group"
          >
            Semua Pesanan
            <span className="group-hover:translate-x-1 transition-smooth">→</span>
          </Link>
        </div>

        {recentOrders && recentOrders.length > 0 ? (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-xs text-left">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100/50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 rounded-tl-xl">Tanggal</th>
                  <th className="px-4 py-3">ID Order</th>
                  <th className="px-4 py-3">Nama Customer</th>
                  <th className="px-4 py-3 text-right">Nilai Tagihan</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right rounded-tr-xl">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-smooth group">
                    <td className="px-4 py-4 text-slate-500 whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-4 font-mono font-bold text-slate-700">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-800">
                      {order.customer_name}
                    </td>
                    <td className="px-4 py-4 text-right font-bold text-slate-900 whitespace-nowrap">
                      Rp {Number(order.total_price).toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 rounded-lg border font-bold text-[10px] uppercase tracking-wider ${statusColors[order.status]} transition-smooth`}>
                        {statusLabels[order.status]}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link 
                        href={`/admin/pesanan/${order.id}`}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-bold transition-smooth group"
                      >
                        Detail
                        <span className="group-hover:translate-x-1 transition-smooth">→</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400 my-auto flex flex-col items-center justify-center">
            <span className="text-5xl mb-3">📋</span>
            <p className="text-sm font-semibold text-slate-700 mb-1">Belum Ada Pesanan</p>
            <p className="text-xs">Pesanan masuk akan ditampilkan di sini.</p>
          </div>
        )}
      </div>

    </div>
  )
}
