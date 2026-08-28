'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminOrdersListPage() {
  const supabase = createClient()

  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  async function fetchOrders() {
    setIsLoading(true)
    try {
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      const { data, error } = await query
      if (error) throw error
      setOrders(data || [])
    } catch (err) {
      console.error('Failed to fetch orders:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  // Filter orders based on state query and search inputs
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    const matchesSearch = 
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesStatus && matchesSearch
  })

  const statusColors = {
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
    processing: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    shipped: 'bg-purple-50 text-purple-700 border-purple-200',
    completed: 'bg-green-50 text-green-700 border-green-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
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
    <div className="space-y-8 flex-1 flex flex-col">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Kelola Pesanan</h1>
          <p className="text-slate-500 text-xs mt-1">Ubah status pesanan, kelola detail pengiriman, dan verifikasi antrean fabrikasi</p>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm space-y-4">
        
        {/* Search */}
        <div className="relative text-xs">
          <input
            type="text"
            placeholder="Cari berdasarkan nama customer atau Order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
          />
          <span className="absolute left-3.5 top-3 text-slate-400">🔍</span>
        </div>

        {/* Status Filters Grid */}
        <div className="border-t border-slate-100 pt-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3">Filter Status</span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: 'Semua', value: 'all' },
              { label: 'Menunggu', value: 'pending' },
              { label: 'Dikonfirmasi', value: 'confirmed' },
              { label: 'Fabrikasi', value: 'processing' },
              { label: 'Dikirim', value: 'shipped' },
              { label: 'Selesai', value: 'completed' },
              { label: 'Batal', value: 'cancelled' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`text-xs px-3.5 py-2 rounded-xl border font-bold transition ${
                  statusFilter === tab.value
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/10'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Orders Table Container */}
      <div className="bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm flex-1 flex flex-col">
        {isLoading ? (
          <div className="text-center py-20 flex flex-col items-center justify-center my-auto">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-450 border-b">
                <tr>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">ID Order</th>
                  <th className="px-4 py-3">Nama Customer</th>
                  <th className="px-4 py-3">Nomor WhatsApp</th>
                  <th className="px-4 py-3 text-right">Nilai Tagihan</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-700">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-800">
                      {order.customer_name}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-600">
                      {order.customer_phone}
                    </td>
                    <td className="px-4 py-3.5 text-right font-black text-slate-900 whitespace-nowrap">
                      Rp {Number(order.total_price).toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-lg border font-bold text-[10px] uppercase tracking-wider ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link 
                        href={`/admin/pesanan/${order.id}`}
                        className="text-blue-600 hover:text-blue-750 font-bold"
                      >
                        Detail & Kelola
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400 my-auto flex flex-col items-center justify-center p-6">
            <span className="text-4xl mb-3">📋</span>
            <p className="text-sm font-bold text-slate-600">Tidak Ada Pesanan Ditemukan</p>
            <p className="text-slate-400 text-xs mt-1">Tidak ada transaksi yang cocok dengan kriteria filter/pencarian Anda.</p>
          </div>
        )}
      </div>

    </div>
  )
}
