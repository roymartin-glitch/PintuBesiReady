import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'Detail Pesanan Saya | Pintu Besi Shop',
  description: 'Tinjau status dan rincian transaksi pemesanan pintu besi Anda.',
}

export default async function UserOrderDetailPage({ params }) {
  const supabase = createClient()

  // Authenticate user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/auth/login?redirect=/dashboard/pesanan/${params.id}`)
  }

  // Fetch specific order & order items
  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', params.id)
    .eq('user_id', user.id) // Ensure security check (owner validation)
    .single()

  if (!order) notFound()

  const statusColors = {
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
    processing: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    shipped: 'bg-purple-50 text-purple-700 border-purple-200',
    completed: 'bg-green-50 text-green-700 border-green-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
  }

  const statusLabels = {
    pending: 'Menunggu Konfirmasi',
    confirmed: 'Dikonfirmasi',
    processing: 'Sedang Fabrikasi',
    shipped: 'Sedang Dikirim',
    completed: 'Pesanan Selesai',
    cancelled: 'Pesanan Dibatalkan',
  }

  const steps = ['pending', 'confirmed', 'processing', 'completed']
  const currentStepIndex = steps.indexOf(order.status)

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
          <Link href="/dashboard/pesanan" className="hover:text-blue-600 transition">Pesanan</Link>
          <span>/</span>
          <span className="text-slate-600 font-semibold truncate max-w-[200px]">Detail</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar menu */}
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

          {/* Details Content Card */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Header info */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Detail Pesanan</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Dibuat pada {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB</p>
                </div>
                <span className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border ${statusColors[order.status]}`}>
                  {statusLabels[order.status]}
                </span>
              </div>

              {/* Order status tracking timeline */}
              {order.status !== 'cancelled' && (
                <div className="py-6 border-b border-slate-100">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-6">Status Pengerjaan</h4>
                  <div className="relative flex justify-between items-center max-w-lg mx-auto">
                    {/* Progress Bar Line */}
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 z-0"></div>
                    <div 
                      className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-500"
                      style={{ width: `${currentStepIndex >= 0 ? (currentStepIndex / (steps.length - 1)) * 100 : 0}%` }}
                    ></div>

                    {/* Steps dots */}
                    {steps.map((step, idx) => {
                      const isCompleted = idx <= currentStepIndex
                      const isActive = idx === currentStepIndex
                      const stepLabel = {
                        pending: 'Checkout',
                        confirmed: 'Konfirmasi',
                        processing: 'Fabrikasi',
                        completed: 'Selesai',
                      }[step]

                      return (
                        <div key={step} className="flex flex-col items-center relative z-10">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 shadow-sm transition-all duration-300 ${
                            isCompleted 
                              ? 'bg-blue-600 border-blue-600 text-white' 
                              : 'bg-white border-slate-200 text-slate-400'
                          } ${isActive ? 'ring-4 ring-blue-500/20' : ''}`}>
                            {isCompleted ? '✓' : idx + 1}
                          </div>
                          <span className={`text-[10px] mt-2 font-bold ${isCompleted ? 'text-blue-600' : 'text-slate-400'}`}>
                            {stepLabel}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Items List Invoice */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Item Pesanan</h4>
                <div className="divide-y divide-slate-150">
                  {order.order_items?.map((item) => (
                    <div key={item.id} className="py-4 flex justify-between items-center gap-4 text-sm">
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-800">{item.product_name}</p>
                        <p className="text-xs text-slate-400">
                          {item.quantity} x Rp {Number(item.price).toLocaleString('id-ID')}
                        </p>
                      </div>
                      <p className="font-extrabold text-slate-900">
                        Rp {Number(item.subtotal).toLocaleString('id-ID')}
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-slate-100 pt-4 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-700">Total Pembayaran</span>
                  <span className="text-xl font-black text-slate-900">
                    Rp {Number(order.total_price).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

            </div>

            {/* Customer Shipping Information Card */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b pb-3 flex items-center gap-2">
                <span>📍</span> Informasi Pengiriman
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/20">
                  <span className="text-slate-400 block mb-1">Nama Penerima</span>
                  <span className="font-bold text-slate-800">{order.customer_name}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/20">
                  <span className="text-slate-400 block mb-1">WhatsApp / No. HP</span>
                  <span className="font-bold text-slate-800">{order.customer_phone}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/20 sm:col-span-2">
                  <span className="text-slate-400 block mb-1">Alamat Lengkap Pengiriman</span>
                  <span className="font-bold text-slate-800 leading-relaxed">{order.customer_address || '-'}</span>
                </div>
                {order.notes && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/20 sm:col-span-2">
                    <span className="text-slate-400 block mb-1">Catatan Pesanan</span>
                    <span className="font-bold text-slate-800">{order.notes}</span>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </main>
    </>
  )
}
