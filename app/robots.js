export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/dashboard/', '/auth/', '/checkout/', '/api/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin/', '/dashboard/', '/auth/', '/checkout/', '/api/'],
      },
    ],
    sitemap: 'https://pintu-besi-shop.vercel.app/sitemap.xml',
  }
}
