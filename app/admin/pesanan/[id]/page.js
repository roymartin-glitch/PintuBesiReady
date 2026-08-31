'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

export default function AdminOrderDetailPage() {
  const supabase = createClient()
  const params = useParams()
  const router = useRouter()
  const orderId = params.id

  const [order, setOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  async function fetchOrderDetail() {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', orderId)
        .single()

      if (error) throw error
      setOrder(data)
    } catch (err) {
      console.error('Failed to load order detail:', err)
      setErrorMessage('Gagal memuat detail pesanan.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (orderId) {
      fetchOrderDetail()
    }
  }, [orderId])

  async function handleStatusChange(newStatus) {
    if (isUpdating || !order) return

    setIsUpdating(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error

      setSuccessMessage(`Status pesanan berhasil diubah menjadi "${newStatus}"!`)
      // Refresh local order state
      setOrder({ ...order, status: newStatus })
    } catch (err) {
      console.error('Failed to update status:', err)
      setErrorMessage(err.message || 'Gagal mengubah status pesanan.')
    } finally {
      setIsUpdating(false)
    }
  }

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

  const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER || '6285276358423'
  const clientWaUrl = order ? `https://wa.me/${order.customer_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Halo ${order.customer_name}, kami dari Pintu Besi Shop ingin mengonfirmasi pesanan Anda dengan ID: #${order.id.slice(0, 8).toUpperCase()}...`)}` : '#'

  return (
    <div className="space-y-8 flex-1 flex flex-col">
      
      {/* Navigation Breadcrumbs */}
      <div className="flex gap-2 text-xs text-slate-400">
        <Link href="/admin" className="hover:text-blue-600 transition">Dashboard</Link>
        <span>/</span>
        <Link href="/admin/pesanan" className="hover:text-blue-600 transition">Pesanan</Link>
        <span>/</span>
        <span className="text-slate-600 font-semibold truncate max-w-[200px]">Detail #{orderId?.slice(0, 8)}</span>
      </div>

      {isLoading ? (
        <div className="text-center py-20 flex flex-col items-center justify-center my-auto">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : order ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-1">
          
          {/* Left Column: Order Items & Delivery Details */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Invoice items */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Item Transaksi</h3>
                  <p className="text-slate-400 text-[10px] mt-0.5">Dibuat pada {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB</p>
                </div>
                <span className="text-xs font-bold text-slate-500 font-mono">
                  #{order.id.toUpperCase()}
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="py-4 flex justify-between items-center text-xs">
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-850">{item.product_name}</p>
                      <p className="text-[10px] text-slate-400">
                        {item.quantity} Unit x Rp {Number(item.price).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <p className="font-extrabold text-slate-900">
                      Rp {Number(item.subtotal).toLocaleString('id-ID')}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-700">Total Harga Pesanan</span>
                <span className="text-xl font-black text-slate-950">
                  Rp {Number(order.total_price).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Delivery address */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b pb-3">
                Informasi & Alamat Penerima
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/20">
                  <span className="text-slate-400 block mb-0.5">Nama Customer</span>
                  <span className="font-bold text-slate-800">{order.customer_name}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/20">
                  <span className="text-slate-400 block mb-0.5">Nomor HP / WhatsApp</span>
                  <span className="font-bold text-slate-800 block mb-1">{order.customer_phone}</span>
                  <a
                    href={clientWaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] text-green-600 font-extrabold hover:underline"
                  >
                    💬 Hubungi Chat WA Customer
                  </a>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/20 sm:col-span-2">
                  <span className="text-slate-400 block mb-0.5">Alamat Pengiriman Lengkap</span>
                  <span className="font-bold text-slate-800 leading-relaxed">{order.customer_address || '-'}</span>
                </div>
                {order.notes && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/20 sm:col-span-2">
                    <span className="text-slate-400 block mb-0.5">Catatan Tambahan Pesanan</span>
                    <span className="font-bold text-slate-800">{order.notes}</span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Order Status Controls */}
          <div className="lg:col-span-4 bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-6 sticky top-24">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider border-b pb-3">
                Kelola Status
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">Ubah tahapan pengerjaan atau status transaksi pesanan ini</p>
            </div>

            {/* Current status info */}
            <div className="space-y-1 text-xs">
              <span className="text-slate-400 block">Status Saat Ini:</span>
              <span className={`inline-block px-3 py-1 rounded-lg border font-bold uppercase tracking-wider text-[10px] ${statusColors[order.status]}`}>
                {statusLabels[order.status]}
              </span>
            </div>

            {/* Dropdown status update */}
            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-500 uppercase tracking-wider block">Ubah Menjadi:</label>
              <select
                disabled={isUpdating}
                value={order.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              >
                <option value="pending">Menunggu Konfirmasi</option>
                <option value="confirmed">Dikonfirmasi</option>
                <option value="processing">Sedang Fabrikasi (Processing)</option>
                <option value="shipped">Sedang Dikirim (Shipped)</option>
                <option value="completed">Selesai (Completed)</option>
                <option value="cancelled">Dibatalkan (Cancelled)</option>
              </select>
            </div>

            {/* Status alerts */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-650 rounded-xl font-medium text-xs">
                ⚠️ {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl font-medium text-xs">
                ✓ {successMessage}
              </div>
            )}

            <div className="text-[10px] text-slate-400 text-center leading-relaxed">
              Mengubah status pesanan di sini akan langsung memperbarui dashboard riwayat pesanan milik pelanggan secara real-time.
            </div>

          </div>

        </div>
      ) : (
        <div className="text-center py-20 border border-slate-200/60 bg-white rounded-3xl p-6">
          <p className="text-slate-500 text-sm">Pesanan dengan ID tersebut tidak ditemukan.</p>
          <Link href="/admin/pesanan" className="text-blue-600 font-bold text-xs mt-3 inline-block">
            ← Kembali ke Semua Pesanan
          </Link>
        </div>
      )}

    </div>
  )
}
