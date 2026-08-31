import { createClient } from '@/lib/supabase/server'

export default async function sitemap() {
  const baseUrl = 'https://pintu-besi-shop.vercel.app'
  const supabase = createClient()

  // Fetch all active products with updated_at
  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('is_active', true)
    .order('updated_at', { ascending: false })

  // Fetch all active categories
  const { data: categories } = await supabase
    .from('categories')
    .select('slug')
    .order('name')

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/produk`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  // Category pages
  const categoryPages = (categories || []).map((category) => ({
    url: `${baseUrl}/kategori/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // Product pages
  const productPages = (products || []).map((product) => ({
    url: `${baseUrl}/produk/${product.slug}`,
    lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticPages, ...categoryPages, ...productPages]
}
