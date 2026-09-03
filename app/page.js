import { createClient } from '@/lib/supabase/server'
import { getStoreSettings } from '@/lib/supabase/getStoreSettings'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ImageCarousel from '@/components/ImageCarousel'

export default async function HomePage() {
  const supabase = createClient()
  const storeSettings = await getStoreSettings()

  // Fetch products (limit 8 for home, split to Featured and Latest)
  const { data: allProducts } = await supabase
    .from('products')
    .select('id, name, slug, price, discount_price, discount_percentage, size, material, stock, product_images(image_url, is_primary)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(8)

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name')

  const latestProducts = allProducts || []
  // Featured products (e.g. products with discount or first 4 products)
  const featuredProducts = latestProducts.slice(0, 4)

  const waNumber = storeSettings?.whatsapp_number || process.env.NEXT_PUBLIC_WA_NUMBER || '6285276358423'

  // Build banner slides from products that actually have photos (discounted ones first)
  const productsWithImages = latestProducts.filter((p) => p.product_images?.length > 0)
  const sortedForBanner = [...productsWithImages].sort((a, b) => {
    const aDisc = a.discount_price && a.discount_price > a.price ? 1 : 0
    const bDisc = b.discount_price && b.discount_price > b.price ? 1 : 0
    return bDisc - aDisc
  })

  const carouselSlides = sortedForBanner.slice(0, 5).map((product) => {
    const primaryImage =
      product.product_images?.find((img) => img.is_primary)?.image_url ||
      product.product_images?.[0]?.image_url
    const discount =
      product.discount_price && product.discount_price > product.price
        ? Math.round(((product.discount_price - product.price) / product.discount_price) * 100)
        : product.discount_percentage || 0

    return {
      image: primaryImage,
      title: product.name,
      subtitle: `Rp ${Number(product.price).toLocaleString('id-ID')}${product.size ? ' • ' + product.size : ''}`,
      badge: discount > 0 ? `DISKON ${discount}%` : null,
      link: `/produk/${product.slug}`,
    }
  })

  return (
    <>
      {/* Global Navbar */}
      <Navbar />

      <main className="flex-1 bg-[#f6f9fc]">

        {/* Banner Hero */}
        <section className="industrial-bg relative overflow-hidden text-white py-20 md:py-32 px-4 shadow-premium-lg animate-fade-in">
          <div className="hero-orb -top-24 right-0" />
          <div className="hero-orb bottom-[-12rem] left-[-10rem]" style={{ animationDelay: '-6s' }} />

          {/* Decorative Background Accents - Enhanced */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-600/15 to-purple-600/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-slate-500/10 to-blue-500/5 rounded-full blur-2xl pointer-events-none translate-y-1/3 -translate-x-1/4"></div>

          {/* Animated Dots Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="absolute top-20 right-20 w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-20 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-40 right-1/3 w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
          </div>

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            <div className="lg:col-span-7 space-y-6 text-left animate-slide-up">
              <span className="inline-flex items-center gap-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs px-4 py-2 rounded-full font-bold uppercase tracking-wider shadow-lg shadow-blue-500/10 hover:scale-105 transition-smooth">
                🛡️ Keamanan & Kualitas Terjamin
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-white drop-shadow-lg">
                {storeSettings?.store_tagline || 'Solusi Pintu Besi Berkualitas untuk Rumah & Bisnis Anda'}
              </h1>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl">
                {storeSettings?.store_description || 'Kami menyediakan pintu garasi, pagar minimalis, rolling door, dan teralis berkualitas tinggi dengan desain modern. Dikerjakan oleh pengrajin profesional dengan material pilihan dan garansi resmi.'}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Link
                  href="/produk"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-center text-white px-8 py-4 rounded-xl text-sm font-bold transition-smooth shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 active:scale-95 hover:-translate-y-0.5"
                >
                  Lihat Katalog Produk
                </Link>
                <a
                  href={`https://wa.me/${waNumber}?text=Halo%20${encodeURIComponent(storeSettings?.store_name || 'Pintu Besi Shop')},%20saya%20ingin%20konsultasi%20produk%20pintu%20besi.%20Mohon%20info%20lebih%20lanjut.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-800 hover:bg-slate-750 border border-slate-700 text-center text-white px-8 py-4 rounded-xl text-sm font-bold transition-smooth active:scale-95 hover:border-slate-600 hover:-translate-y-0.5"
                >
                  💬 Chat WhatsApp
                </a>
              </div>
            </div>

            {/* Industrial Design Mock Illustration Card */}
            <div className="lg:col-span-5 hidden lg:block animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <div className="glass-premium p-8 rounded-3xl relative hover-lift group">
                <div className="absolute -top-3 -left-3 bg-gradient-to-r from-blue-600 to-blue-700 text-xs px-3 py-1.5 rounded-lg font-bold shadow-lg shadow-blue-500/30 flex items-center gap-1 animate-pulse">
                  ⭐ BEST SELLER
                </div>
                <div className="space-y-4">
                  <div className="h-48 bg-gradient-to-br from-slate-800 to-slate-850 rounded-2xl flex items-center justify-center border border-slate-750 overflow-hidden group-hover:scale-105 transition-smooth">
                    <div className="text-center p-4">
                      <span className="text-4xl">🚪</span>
                      <h4 className="font-bold text-slate-200 mt-3 text-sm">Pintu Garasi Lipat Besi Hollow</h4>
                      <p className="text-xs text-slate-400 mt-2">Ketebalan plat 2.0mm standard industri</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-800 pt-4">
                    <span>Material: Besi Hollow & Plat Baja</span>
                    <span className="text-green-400 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      Ready Stock
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-slate-400 text-[10px] line-through">Rp 8.500.000</p>
                      <p className="text-xl font-black text-blue-400">Rp 7.500.000</p>
                    </div>
                    <Link
                      href="/produk"
                      className="bg-blue-600/30 text-blue-400 hover:bg-blue-600 hover:text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-smooth shadow-md hover:shadow-lg hover:scale-105"
                    >
                      Beli Sekarang
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sliding Promo Banner (ad-style carousel) */}
        {carouselSlides.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 -mb-6">
            <ImageCarousel slides={carouselSlides} autoPlayMs={4000} />
          </section>
        )}

        {/* Categories Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">Kategori Pilihan</h2>
            <p className="text-slate-500 text-sm sm:text-base">Kami merancang bermacam produk besi dengan desain modern yang sesuai dengan arsitektur rumah Anda.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {categories?.map((cat, idx) => (
              <Link
                key={cat.id}
                href={`/kategori/${cat.slug}`}
                className="group card-premium p-6 text-center hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-smooth flex flex-col items-center justify-center min-h-[150px] animate-scale-in"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 flex items-center justify-center text-2xl mb-4 group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white transition-smooth group-hover:scale-110 shadow-md group-hover:shadow-lg">
                  {cat.slug === 'pintu-pagar' && '柵'}
                  {cat.slug === 'pintu-garasi' && '🚗'}
                  {cat.slug === 'pintu-rumah' && '🏠'}
                  {cat.slug === 'rolling-door' && '🏭'}
                  {!['pintu-pagar', 'pintu-garasi', 'pintu-rumah', 'rolling-door'].includes(cat.slug) && '🔩'}
                </div>
                <h3 className="font-bold text-slate-800 text-sm sm:text-base group-hover:text-blue-600 transition-smooth">
                  {cat.name}
                </h3>
                <span className="text-xs text-slate-400 mt-2 inline-flex items-center gap-1 group-hover:text-blue-600 group-hover:translate-x-1 transition-smooth font-medium">
                  Lihat Produk <span className="text-[10px]">→</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="bg-gradient-to-b from-slate-100/50 to-white py-16 border-y border-slate-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2">Produk Unggulan</h2>
                <p className="text-slate-500 text-sm sm:text-base">Produk-produk dengan konstruksi terbaik dan diskon menarik.</p>
              </div>
              <Link href="/produk" className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline shrink-0 flex items-center gap-1 transition-smooth group">
                Lihat Semua
                <span className="text-xs group-hover:translate-x-1 transition-smooth">→</span>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product, idx) => {
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
                    className="card-premium overflow-hidden hover-lift flex flex-col relative group animate-scale-in cursor-pointer"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    {/* Badge Discount */}
                    {discount > 0 && (
                      <span className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-lg z-10 shadow-lg shadow-red-500/30 animate-pulse pointer-events-none">
                        DISKON {discount}%
                      </span>
                    )}

                    <div className="aspect-square bg-slate-50 relative overflow-hidden flex items-center justify-center cursor-pointer">
                      {primaryImage ? (
                        <img
                          src={primaryImage}
                          alt={`${product.name} - ${product.size || 'Pintu Besi'}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-smooth duration-500 cursor-pointer"
                        />
                      ) : (
                        <div className="text-slate-300 text-center">
                          <span className="text-5xl block mb-2">🚪</span>
                          <span className="text-[10px] uppercase font-bold text-slate-400">Belum Ada Foto</span>
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent opacity-0 group-hover:opacity-100 transition-smooth flex items-end justify-center pb-4 pointer-events-none">
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
                        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-10 pointer-events-none">
                          <span className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg">
                            Stok Habis
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <h3 className="font-bold text-slate-800 text-sm line-clamp-2 group-hover:text-blue-600 transition-smooth">
                          {product.name}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-1">{product.size || 'Ukuran Custom'}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-end justify-between">
                        <div>
                          {product.discount_price && product.discount_price > product.price && (
                            <p className="text-xs text-slate-400 line-through">
                              Rp {Number(product.discount_price).toLocaleString('id-ID')}
                            </p>
                          )}
                          <p className="font-black text-slate-900 text-sm sm:text-base">
                            Rp {Number(product.price).toLocaleString('id-ID')}
                          </p>
                        </div>
                        <span className="text-xs bg-gradient-to-r from-blue-50 to-indigo-50 group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white text-slate-700 px-3 py-1.5 rounded-lg font-bold transition-smooth shadow-sm group-hover:shadow-md pointer-events-none">
                          Beli
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            {featuredProducts.length === 0 && (
              <div className="text-center text-slate-400 py-20 bg-white border border-slate-200/50 rounded-3xl shadow-premium flex flex-col items-center justify-center">
                <span className="text-6xl mb-4">📦</span>
                <p className="text-lg font-bold text-slate-700 mb-2">Belum Ada Produk Unggulan</p>
                <p className="text-sm">Produk akan segera ditampilkan di sini.</p>
              </div>
            )}
          </div>
        </section>

        {/* WhatsApp CTA Banner */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
          <div className="industrial-bg bg-gradient-to-r from-[#0b1f3a] via-[#1558c0] to-[#123c78] text-white rounded-3xl p-8 md:p-12 shadow-premium-lg hover-lift flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
            {/* Enhanced Background Effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-500/20 rounded-full blur-2xl pointer-events-none translate-y-1/3 -translate-x-1/4"></div>

            {/* Animated Icons */}
            <div className="absolute top-5 right-10 text-white/10 text-6xl animate-pulse">💬</div>
            <div className="absolute bottom-5 left-10 text-white/10 text-5xl animate-pulse" style={{ animationDelay: '1s' }}>🔧</div>

            <div className="relative z-10 max-w-2xl text-center md:text-left space-y-4">
              <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Konsultasi Gratis
              </div>
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight">Punya Ukuran atau Model Sendiri?</h3>
              <p className="text-blue-100 text-sm md:text-base leading-relaxed">
                Kami melayani custom order pintu besi, pagar, pintu utama dengan ukuran, material, dan finishing warna sesuai permintaan Anda. Konsultasikan langsung dengan kami!
              </p>
            </div>
            <a
              href={`https://wa.me/${waNumber}?text=Halo%20Pintu%20Besi%20Shop,%20saya%20mau%20order%20pintu%20besi%20dengan%20ukuran%20dan%20model%20custom...`}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 bg-white hover:bg-slate-50 text-slate-900 px-8 py-4 rounded-2xl text-sm font-black transition-smooth shadow-lg hover:shadow-xl shrink-0 flex items-center gap-3 active:scale-95 hover:-translate-y-1 group"
            >
              <svg className="w-6 h-6 text-green-600 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.66.986 3.284 1.447 4.72 1.448 5.539 0 10.048-4.482 10.05-9.988.002-2.67-1.018-5.174-2.87-7.03C16.692 1.727 14.2 1.701 11.58 1.701c-5.54 0-10.046 4.49-10.049 9.996-.001 1.89.5 3.73 1.45 5.34L1.87 21.08l4.777-1.926z" />
              </svg>
              <span>Chat WhatsApp</span>
              <span className="group-hover:translate-x-1 transition-smooth">→</span>
            </a>
          </div>
        </section>
      </main>

      {/* Footer Component - Dynamic from Database */}
      <Footer />
    </>
  )
}