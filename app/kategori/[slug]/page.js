import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export async function generateMetadata({ params }) {
  const supabase = createClient()
  const { data: category } = await supabase
    .from('categories')
    .select('name')
    .eq('slug', params.slug)
    .single()

  if (!category) {
    return {
      title: 'Kategori Tidak Ditemukan | Pintu Besi Shop',
    }
  }

  return {
    title: `Jual Pintu Besi ${category.name} Premium | Pintu Besi Shop`,
    description: `Temukan koleksi lengkap ${category.name} premium berkualitas tinggi. Material kokoh, pengerjaan presisi, awet, dan bergaransi resmi.`,
  }
}

export default async function CategoryPage({ params }) {
  const supabase = createClient()

  // Fetch current category
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!category) notFound()

  // Fetch products under this category
  const { data: products } = await supabase
    .from('products')
    .select('id, name, slug, price, original_price, stock, size, material, product_images(image_url, is_primary)')
    .eq('category_id', category.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return (
    <>
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Breadcrumbs */}
        <div className="mb-6 flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-blue-600 transition">Beranda</Link>
          <span>/</span>
          <Link href="/produk" className="hover:text-blue-600 transition">Katalog</Link>
          <span>/</span>
          <span className="text-slate-600 font-semibold">{category.name}</span>
        </div>

        {/* Category Header */}
        <header className="mb-10 border-b border-slate-200/80 pb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">
              {category.slug === 'pintu-pagar' && '柵'}
              {category.slug === 'pintu-garasi' && '🚗'}
              {category.slug === 'pintu-rumah' && '🏠'}
              {category.slug === 'rolling-door' && '🏭'}
              {!['pintu-pagar', 'pintu-garasi', 'pintu-rumah', 'rolling-door'].includes(category.slug) && '🔩'}
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{category.name}</h1>
          </div>
          <p className="text-slate-500 text-sm mt-2 leading-relaxed max-w-2xl">
            Menampilkan koleksi terbaik produk {category.name.toLowerCase()} dengan pengerjaan presisi dan material premium demi ketahanan maksimal.
          </p>
        </header>

        {/* Products Grid */}
        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const primaryImage =
                product.product_images?.find((img) => img.is_primary)?.image_url ||
                product.product_images?.[0]?.image_url

              const discount =
                product.original_price && product.original_price > product.price
                  ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
                  : 0

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
                        <span className="text-4xl block mb-1">🚪</span>
                        <span className="text-[10px] uppercase font-bold text-slate-400">Belum Ada Foto</span>
                      </div>
                    )}

                    {/* Stock Alert */}
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
                        {product.original_price && product.original_price > product.price && (
                          <p className="text-[10px] text-slate-400 line-through">
                            Rp {Number(product.original_price).toLocaleString('id-ID')}
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
            <span className="text-5xl mb-4">📂</span>
            <h3 className="font-bold text-slate-800 text-lg mb-2">Produk Belum Tersedia</h3>
            <p className="text-slate-400 text-sm max-w-sm mb-6">
              Maaf, belum ada produk aktif yang masuk ke dalam kategori ini saat ini. Cek kembali nanti.
            </p>
            <Link href="/produk" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/10">
              Lihat Kategori Lain
            </Link>
          </div>
        )}
      </main>
    </>
  )
}
