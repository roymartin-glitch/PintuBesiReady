'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminProductsPage() {
  const supabase = createClient()
  const router = useRouter()
  
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // all, active, inactive

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, stock, is_active, slug, product_images(image_url, is_primary)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      console.error('Failed to fetch products:', err)
    } finally {
      setIsLoading(false)
    }
  }

  async function toggleActiveStatus(productId, currentStatus) {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', productId)

      if (error) throw error

      // Update local state
      setProducts(products.map(p => 
        p.id === productId ? { ...p, is_active: !currentStatus } : p
      ))

      alert(`Produk berhasil ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}!`)
    } catch (err) {
      console.error('Failed to toggle status:', err)
      alert('Gagal mengubah status: ' + err.message)
    }
  }

  async function deleteProduct(productId, productName) {
    if (!confirm(`Yakin ingin MENGHAPUS PERMANEN produk "${productName}"?\n\nData produk dan gambar akan dihapus dari database.\n\nAlternatif: Gunakan tombol "Nonaktifkan" untuk menyembunyikan produk tanpa menghapus.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) throw error

      // Remove from local state
      setProducts(products.filter(p => p.id !== productId))
      alert('Produk berhasil dihapus!')
    } catch (err) {
      console.error('Failed to delete product:', err)
      alert('Gagal menghapus produk: ' + err.message)
    }
  }

  // Filter products based on search and status
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && p.is_active) ||
                         (statusFilter === 'inactive' && !p.is_active)
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <span className="text-blue-600">🚪</span>
            Kelola Produk
          </h1>
          <p className="text-slate-500 text-sm mt-1">CRUD penuh: Tambah, Edit, Hapus, dan Nonaktifkan produk</p>
        </div>
        <Link
          href="/admin/produk/baru"
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl text-sm font-bold transition-smooth shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 flex items-center gap-2 active:scale-95"
        >
          <span className="text-lg">+</span> Tambah Produk Baru
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="card-premium p-6 hover-lift space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative group">
            <input
              type="text"
              placeholder="Cari nama produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 focus:bg-white transition-smooth group-hover:border-slate-300"
            />
            <span className="absolute left-4 top-3.5 text-slate-400 text-lg group-hover:scale-110 transition-smooth">🔍</span>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {[
              { label: 'Semua', value: 'all' },
              { label: 'Aktif', value: 'active' },
              { label: 'Nonaktif', value: 'inactive' }
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`flex-1 px-4 py-3 rounded-xl text-xs font-bold transition-smooth ${
                  statusFilter === tab.value
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="card-premium overflow-hidden hover-lift">
        {isLoading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-500 text-sm mt-4 font-semibold">Memuat produk...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100/50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-4 w-12 rounded-tl-xl">#</th>
                  <th className="text-left px-4 py-4">Produk</th>
                  <th className="text-left px-4 py-4">Harga</th>
                  <th className="text-left px-4 py-4">Stok</th>
                  <th className="text-left px-4 py-4">Status</th>
                  <th className="text-right px-4 py-4 rounded-tr-xl">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p, idx) => {
                  const primaryImage = p.product_images?.find(img => img.is_primary)?.image_url || 
                                      p.product_images?.[0]?.image_url

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-smooth group">
                      <td className="px-4 py-4 text-slate-400 font-mono text-xs">{idx + 1}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-smooth shadow-sm">
                            {primaryImage ? (
                              <img src={primaryImage} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xl">🚪</span>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-smooth">{p.name}</p>
                            <p className="text-xs text-slate-400 font-mono">/{p.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-bold text-slate-900">
                        Rp {Number(p.price).toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`font-bold ${p.stock > 5 ? 'text-green-600' : p.stock > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => toggleActiveStatus(p.id, p.is_active)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-smooth ${
                            p.is_active 
                              ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 shadow-sm' 
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
                          }`}
                        >
                          {p.is_active ? '✓ Aktif' : '✕ Nonaktif'}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link 
                            href={`/admin/produk/${p.id}`}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg text-xs font-bold transition-smooth border border-blue-200 shadow-sm hover:shadow-md"
                          >
                            ✏️ Edit
                          </Link>
                          <button
                            onClick={() => deleteProduct(p.id, p.name)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-xs font-bold transition-smooth border border-red-200 shadow-sm hover:shadow-md"
                          >
                            🗑️ Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20">
            <span className="text-6xl mb-4 block">📦</span>
            <h3 className="font-bold text-slate-800 mb-2 text-lg">
              {searchQuery || statusFilter !== 'all' ? 'Tidak Ada Produk yang Cocok' : 'Belum Ada Produk'}
            </h3>
            <p className="text-slate-400 text-sm mb-8">
              {searchQuery || statusFilter !== 'all' 
                ? 'Coba ubah filter atau kata kunci pencarian'
                : 'Klik tombol "Tambah Produk Baru" untuk memulai'
              }
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Link
                href="/admin/produk/baru"
                className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl text-sm font-bold transition-smooth shadow-lg shadow-blue-500/20"
              >
                + Tambah Produk Pertama
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {!isLoading && products.length > 0 && (
        <div className="grid grid-cols-3 gap-4 animate-scale-in">
          <div className="card-premium p-5 text-center hover-lift group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-xl group-hover:scale-150 transition-smooth"></div>
            <p className="text-3xl font-black text-slate-900 relative z-10">{products.length}</p>
            <p className="text-xs text-slate-500 font-bold mt-2 relative z-10">Total Produk</p>
          </div>
          <div className="card-premium p-5 text-center hover-lift group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/10 to-transparent rounded-full blur-xl group-hover:scale-150 transition-smooth"></div>
            <p className="text-3xl font-black text-green-600 relative z-10">{products.filter(p => p.is_active).length}</p>
            <p className="text-xs text-slate-500 font-bold mt-2 relative z-10">Produk Aktif</p>
          </div>
          <div className="card-premium p-5 text-center hover-lift group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-500/10 to-transparent rounded-full blur-xl group-hover:scale-150 transition-smooth"></div>
            <p className="text-3xl font-black text-red-600 relative z-10">{products.filter(p => p.stock <= 5).length}</p>
            <p className="text-xs text-slate-500 font-bold mt-2 relative z-10">Stok Rendah (≤5)</p>
          </div>
        </div>
      )}

    </div>
  )
}
