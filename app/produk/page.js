import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Katalog Produk Pintu Besi | Pintu Besi Shop',
  description: 'Jelajahi berbagai jenis pintu besi premium, pagar otomatis, pintu garasi lipat, rolling door, dan teralis berkualitas tinggi.',
}

export default async function ProductsCatalogPage({ searchParams }) {
  const supabase = createClient()

  const q = searchParams.q || ''
  const categorySlug = searchParams.category || ''
  const sortBy = searchParams.sort || 'latest'
  const inStock = searchParams.in_stock === 'true'

  // Fetch all categories for filter
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name')

  // Build query
  let query = supabase
    .from('products')
    .select('id, name, slug, price, discount_price, discount_percentage, stock, size, material, is_active, product_images(image_url, is_primary)')
    .eq('is_active', true)

  // Apply search query
  if (q) {
    query = query.ilike('name', `%${q}%`)
  }

  // Apply category filter
  if (categorySlug) {
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single()

    if (categoryData) {
      query = query.eq('category_id', categoryData.id)
    }
  }

  // Apply stock filter
  if (inStock) {
    query = query.gt('stock', 0)
  }

  // Apply sorting
  if (sortBy === 'price-asc') {
    query = query.order('price', { ascending: true })
  } else if (sortBy === 'price-desc') {
    query = query.order('price', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data: products, error: prodError } = await query

  return (
    <>
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Error display for debugging production database issues */}
        {prodError && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl mb-6 text-sm">
            <h4 className="font-bold mb-1">⚠️ Error Fetching Products:</h4>
            <p className="font-mono text-xs">{prodError.message} ({prodError.code || 'No code'})</p>
          </div>
        )}
        {catError && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl mb-6 text-sm">
            <h4 className="font-bold mb-1">⚠️ Error Fetching Categories:</h4>
            <p className="font-mono text-xs">{catError.message} ({catError.code || 'No code'})</p>
          </div>
        )}

        {/* Title Section */}
        <div className="mb-8 border-b border-slate-200/80 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {q ? `Hasil Pencarian: "${q}"` : 'Katalog Produk Pintu Besi'}
            </h1>
            <p className="text-slate-500 text-sm mt-1.5">
              Menemukan {products?.length || 0} unit pintu & konstruksi besi berkualitas tinggi
            </p>
          </div>
          <div className="text-xs text-slate-400">
            <Link href="/" className="hover:text-blue-600 transition">Beranda</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-600">Katalog</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="bg-white border border-slate-200/60 rounded-2xl p-6 sticky top-24 space-y-6 shadow-sm">
              
              {/* Category Filter */}
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <span>📂</span> Kategori Produk
                </h3>
                <div className="flex flex-wrap lg:flex-col gap-1.5">
                  <Link
                    href={{
                      pathname: '/produk',
                      query: { ...searchParams, category: '' }
                    }}
                    className={`text-xs px-3.5 py-2.5 rounded-xl transition font-medium w-full text-left ${!categorySlug ? 'bg-blue-50 text-blue-600 font-bold border border-blue-100' : 'text-slate-600 hover:bg-slate-50 border border-transparent'}`}
                  >
                    Semua Kategori
                  </Link>
                  {categories?.map((cat) => (
                    <Link
                      key={cat.id}
                      href={{
                        pathname: '/produk',
                        query: { ...searchParams, category: cat.slug }
                      }}
                      className={`text-xs px-3.5 py-2.5 rounded-xl transition font-medium w-full text-left ${categorySlug === cat.slug ? 'bg-blue-50 text-blue-600 font-bold border border-blue-100' : 'text-slate-600 hover:bg-slate-50 border border-transparent'}`}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Sort Filter */}
              <div className="border-t border-slate-100 pt-5">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <span>🔃</span> Urutkan Harga
                </h3>
                <div className="flex flex-wrap lg:flex-col gap-1.5">
                  {[
                    { label: 'Terbaru', value: 'latest' },
                    { label: 'Harga Terendah', value: 'price-asc' },
                    { label: 'Harga Tertinggi', value: 'price-desc' }
                  ].map((opt) => (
                    <Link
                      key={opt.value}
                      href={{
                        pathname: '/produk',
                        query: { ...searchParams, sort: opt.value }
                      }}
                      className={`text-xs px-3.5 py-2.5 rounded-xl transition font-medium w-full text-left ${sortBy === opt.value ? 'bg-blue-50 text-blue-600 font-bold border border-blue-100' : 'text-slate-600 hover:bg-slate-50 border border-transparent'}`}
                    >
                      {opt.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Stock Filter */}
              <div className="border-t border-slate-100 pt-5">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <span>📦</span> Ketersediaan
                </h3>
                <div>
                  <Link
                    href={{
                      pathname: '/produk',
                      query: { ...searchParams, in_stock: inStock ? 'false' : 'true' }
                    }}
                    className={`flex items-center gap-2.5 text-xs p-2.5 border rounded-xl transition font-medium ${inStock ? 'bg-blue-50 text-blue-600 border-blue-100 font-bold' : 'text-slate-600 hover:bg-slate-50 border-slate-200'}`}
                  >
                    <span className={`w-4 h-4 border rounded flex items-center justify-center text-[10px] ${inStock ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-350 bg-white'}`}>
                      {inStock && '✓'}
                    </span>
                    Hanya Ready Stock
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <section className="flex-1">
            {products && products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => {
                  const primaryImage =
                    product.product_images?.find((img) => img.is_primary)?.image_url ||
                    product.product_images?.[0]?.image_url

                  const discount =
                    product.discount_price && product.discount_price > product.price
                      ? Math.round(((product.discount_price - product.price) / product.discount_price) * 100)
                      : product.discount_percentage || 0

                  return (
                    <Link
                      key={product.id}
                      href={`/produk/${product.slug}`}
                      className="border border-slate-200/60 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col bg-white relative group"
                    >
                      {/* Discount Badge */}
                      {discount > 0 && (
                        <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg z-10 shadow-md">
                          -{discount}%
                        </span>
                      )}

                      <div className="aspect-square bg-slate-50 relative overflow-hidden flex items-center justify-center">
                        {primaryImage ? (
                          <img
                            src={primaryImage}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <div className="text-slate-300 text-center">
                            <span className="text-3xl block mb-1">🚪</span>
                            <span className="text-[10px] uppercase font-bold text-slate-400">Belum Ada Foto</span>
                          </div>
                        )}

                        {/* Out of Stock Overlay */}
                        {product.stock <= 0 && (
                          <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center z-10">
                            <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow">
                              Stok Habis
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <h3 className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-2 group-hover:text-blue-600 transition">
                            {product.name}
                          </h3>
                          <p className="text-[11px] text-slate-400 line-clamp-1">{product.size} • {product.material}</p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-end justify-between">
                          <div>
                            {product.discount_price && product.discount_price > product.price && (
                              <p className="text-[10px] text-slate-400 line-through">
                                Rp {Number(product.discount_price).toLocaleString('id-ID')}
                              </p>
                            )}
                            <p className="font-black text-slate-900 text-xs sm:text-sm md:text-base">
                              Rp {Number(product.price).toLocaleString('id-ID')}
                            </p>
                          </div>
                          
                          <span className={`text-[10px] px-2 py-1 rounded-lg font-bold shadow-sm ${product.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {product.stock > 0 ? 'Ready' : 'Habis'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-20 border border-slate-200/60 rounded-2xl bg-white shadow-sm flex flex-col items-center justify-center p-6">
                <span className="text-5xl mb-4">🔍</span>
                <h3 className="font-bold text-slate-800 text-lg mb-2">Produk Tidak Ditemukan</h3>
                <p className="text-slate-400 text-sm max-w-sm mb-6">
                  Maaf, produk yang Anda cari tidak ada atau tidak aktif. Coba ubah pencarian Anda atau reset filter.
                </p>
                <Link href="/produk" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/10">
                  Reset Semua Filter
                </Link>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </>
  )
}
