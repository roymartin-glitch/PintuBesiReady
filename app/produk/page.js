import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ProductFilters from '@/components/ProductFilters'

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
          <ProductFilters
            categories={categories}
            categorySlug={categorySlug}
            sortBy={sortBy}
            inStock={inStock}
            searchParams={searchParams}
          />

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
                      className="border border-slate-200/60 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col bg-white relative group cursor-pointer"
                    >
                      {/* Discount Badge */}
                      {discount > 0 && (
                        <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg z-10 shadow-md pointer-events-none">
                          -{discount}%
                        </span>
                      )}

                      <div className="aspect-square bg-slate-50 relative overflow-hidden flex items-center justify-center cursor-pointer">
                        {primaryImage ? (
                          <img
                            src={primaryImage}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300 cursor-pointer"
                          />
                        ) : (
                          <div className="text-slate-300 text-center">
                            <span className="text-3xl block mb-1">🚪</span>
                            <span className="text-[10px] uppercase font-bold text-slate-400">Belum Ada Foto</span>
                          </div>
                        )}

                        {/* Hover Overlay - Lihat Detail */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end justify-center pb-4 pointer-events-none">
                          <span className="text-white text-xs font-bold flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Lihat Detail
                          </span>
                        </div>

                        {/* Out of Stock Overlay */}
                        {product.stock <= 0 && (
                          <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center z-10 pointer-events-none">
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

                          <span className={`text-[10px] px-2 py-1 rounded-lg font-bold shadow-sm ${product.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'} pointer-events-none`}>
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