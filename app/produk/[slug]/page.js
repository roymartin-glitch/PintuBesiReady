import { createClient } from '@/lib/supabase/server'
import OrderActions from './OrderActions'
import ProductGallery from '@/components/ProductGallery'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
  const supabase = createClient()
  const { data: product } = await supabase
    .from('products')
    .select('name, description, product_images(image_url, is_primary)')
    .eq('slug', params.slug)
    .single()

  if (!product) {
    return {
      title: 'Produk Tidak Ditemukan | Pintu Besi Shop',
    }
  }

  const primaryImage =
    product.product_images?.find((img) => img.is_primary)?.image_url ||
    product.product_images?.[0]?.image_url

  return {
    title: `${product.name} Premium | Pintu Besi Shop`,
    description: product.description || `Beli ${product.name} premium berkualitas tinggi dengan pengerjaan presisi dan besi tebal. Tahan cuaca, bergaransi resmi.`,
    canonical: `https://pintu-besi-shop.vercel.app/produk/${params.slug}`,
    openGraph: {
      title: `${product.name} Premium | Pintu Besi Shop`,
      description: product.description || `Beli ${product.name} berkualitas tinggi dari Pintu Besi Shop`,
      url: `https://pintu-besi-shop.vercel.app/produk/${params.slug}`,
      type: 'website',
      locale: 'id_ID',
      siteName: 'Pintu Besi Shop',
      images: primaryImage
        ? [
            {
              url: primaryImage,
              width: 1200,
              height: 630,
              alt: product.name,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} Premium | Pintu Besi Shop`,
      description: product.description || `Beli ${product.name} berkualitas tinggi dari Pintu Besi Shop`,
      images: primaryImage ? [primaryImage] : [],
    },
  }
}

export default async function ProductDetailPage({ params }) {
  const supabase = createClient()

  // Fetch product
  const { data: product } = await supabase
    .from('products')
    .select('*, product_images(image_url, is_primary), categories(name, slug)')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single()

  if (!product) notFound()

  // Fetch related products (same category)
  const { data: relatedProducts } = await supabase
    .from('products')
    .select('id, name, slug, price, discount_price, discount_percentage, size, material, stock, product_images(image_url, is_primary)')
    .eq('category_id', product.category_id)
    .eq('is_active', true)
    .neq('id', product.id)
    .limit(4)

  const discount =
    product.discount_price && product.discount_price > product.price
      ? Math.round(((product.discount_price - product.price) / product.discount_price) * 100)
      : product.discount_percentage || 0

  // Generate JSON-LD Product Schema
  const primaryImage =
    product.product_images?.find((img) => img.is_primary)?.image_url ||
    product.product_images?.[0]?.image_url

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `Produk ${product.name} premium berkualitas tinggi`,
    image: primaryImage || 'https://pintu-besi-shop.vercel.app/default-product.png',
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'Pintu Besi Shop',
    },
    offers: {
      '@type': 'Offer',
      url: `https://pintu-besi-shop.vercel.app/produk/${params.slug}`,
      priceCurrency: 'IDR',
      price: product.price.toString(),
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Pintu Besi Shop',
      },
    },
  }

  // Generate JSON-LD Breadcrumb Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Beranda',
        item: 'https://pintu-besi-shop.vercel.app',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Katalog',
        item: 'https://pintu-besi-shop.vercel.app/produk',
      },
      ...(product.categories?.slug
        ? [
            {
              '@type': 'ListItem',
              position: 3,
              name: product.categories.name,
              item: `https://pintu-besi-shop.vercel.app/kategori/${product.categories.slug}`,
            },
            {
              '@type': 'ListItem',
              position: 4,
              name: product.name,
              item: `https://pintu-besi-shop.vercel.app/produk/${params.slug}`,
            },
          ]
        : [
            {
              '@type': 'ListItem',
              position: 3,
              name: product.name,
              item: `https://pintu-besi-shop.vercel.app/produk/${params.slug}`,
            },
          ]),
    ],
  }

  return (
    <>
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        suppressHydrationWarning
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        suppressHydrationWarning
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        
        {/* Breadcrumbs */}
        <div className="mb-8 flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-blue-600 transition">Beranda</Link>
          <span>/</span>
          <Link href="/produk" className="hover:text-blue-600 transition">Katalog</Link>
          <span>/</span>
          <span className="text-slate-600 font-semibold truncate max-w-[200px]">{product.name}</span>
        </div>

        {/* Product Grid Split Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm mb-16">
          
          {/* Gallery Column */}
          <div className="lg:col-span-6">
            <ProductGallery images={product.product_images} name={product.name} />
          </div>

          {/* Details Column */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              
              {/* Category Badge */}
              <span className="inline-flex items-center bg-blue-50 text-blue-600 border border-blue-100 text-xs px-3 py-1 rounded-xl font-bold uppercase tracking-wider">
                {product.categories?.name || 'Konstruksi Besi'}
              </span>

              {/* Product Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {product.name}
              </h1>

              {/* Price Panel */}
              <div className="p-4 bg-slate-50 border border-slate-200/50 rounded-2xl flex flex-wrap items-baseline gap-3">
                <span className="text-3xl font-black text-slate-900">
                  Rp {Number(product.price).toLocaleString('id-ID')}
                </span>
                {discount > 0 && product.discount_price && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400 line-through">
                      Rp {Number(product.discount_price).toLocaleString('id-ID')}
                    </span>
                    <span className="bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-lg shadow-sm">
                      -{discount}%
                    </span>
                  </div>
                )}
              </div>

              {/* Specifications List */}
              <div className="border-y border-slate-100 py-5 space-y-3">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Spesifikasi Detail</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  {product.size && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/30">
                      <span className="text-slate-400 block mb-0.5">Dimensi Ukuran</span>
                      <span className="font-bold text-slate-800">{product.size}</span>
                    </div>
                  )}
                  {product.material && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/30">
                      <span className="text-slate-400 block mb-0.5">Material Besi</span>
                      <span className="font-bold text-slate-800">{product.material}</span>
                    </div>
                  )}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/30 col-span-2 sm:col-span-1">
                    <span className="text-slate-400 block mb-0.5">Status Ketersediaan</span>
                    <span className={`font-extrabold ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {product.stock > 0 ? `Ready Stock (${product.stock} Unit)` : 'Stok Habis / Hubungi WA'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description Box */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Deskripsi Lengkap</h3>
                <p className="text-slate-650 leading-relaxed text-sm whitespace-pre-line bg-slate-50/40 p-4 rounded-xl border border-slate-200/20">
                  {product.description || 'Tidak ada spesifikasi deskripsi detail tambahan untuk produk besi ini.'}
                </p>
              </div>

            </div>

            {/* Actions panel (Add to Cart / Checkout / WhatsApp) */}
            <div className="pt-4 border-t border-slate-100">
              <OrderActions product={product} />
            </div>

          </div>
        </div>

        {/* Related Products Grid */}
        {relatedProducts && relatedProducts.length > 0 && (
          <section className="border-t border-slate-200/80 pt-10">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6 tracking-tight">Rekomendasi Terkait</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => {
                const imgUrl =
                  p.product_images?.find((img) => img.is_primary)?.image_url ||
                  p.product_images?.[0]?.image_url

                const d =
                  p.discount_price && p.discount_price > p.price
                    ? Math.round(((p.discount_price - p.price) / p.discount_price) * 100)
                    : p.discount_percentage || 0

                return (
                  <Link
                    key={p.id}
                    href={`/produk/${p.slug}`}
                    className="border border-slate-200/60 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col bg-white relative group"
                  >
                    {d > 0 && (
                      <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg z-10 shadow-md">
                        -{d}%
                      </span>
                    )}
                    <div className="aspect-square bg-slate-50 relative overflow-hidden flex items-center justify-center">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={`${p.name} - ${p.size || ''}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="text-slate-350 text-center">
                          <span className="text-3xl block mb-1">🚪</span>
                        </div>
                      )}

                      {/* Stock Alert */}
                      {p.stock <= 0 && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center z-10">
                          <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow">
                            Habis
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-2 group-hover:text-blue-600 transition">
                          {p.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{p.size}</p>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-end justify-between">
                        <div>
                          {p.discount_price && p.discount_price > p.price && (
                            <p className="text-[9px] text-slate-400 line-through">
                              Rp {Number(p.discount_price).toLocaleString('id-ID')}
                            </p>
                          )}
                          <p className="font-black text-slate-900 text-xs sm:text-sm">
                            Rp {Number(p.price).toLocaleString('id-ID')}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold bg-slate-50 px-2 py-1 rounded border border-slate-150 group-hover:bg-blue-600 group-hover:text-white transition">
                          Lihat
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  )
}
