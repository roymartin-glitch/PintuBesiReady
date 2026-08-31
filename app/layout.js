import { CartProvider } from '@/components/CartContext'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
})

export const metadata = {
  title: 'Pintu Besi Shop | Toko Pintu Besi Premium & Konstruksi Kokoh',
  description: 'Spesialis pintu besi berkualitas tinggi untuk pagar, garasi, pintu utama rumah, teralis, dan rolling door. Awet, aman, dan bergaransi.',
  keywords: 'pintu besi, pintu pagar, pintu garasi, pintu rumah, rolling door, teralis, pintu besi premium',
  authors: [{ name: 'Pintu Besi Shop' }],
  creator: 'Pintu Besi Shop',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover',
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' }
  ],
  robots: 'index, follow',
  canonical: 'https://pintu-besi-shop.vercel.app/',
  openGraph: {
    title: 'Pintu Besi Shop | Toko Pintu Besi Premium & Konstruksi Kokoh',
    description: 'Beli pintu besi berkualitas untuk pagar, garasi, dan gudang langsung dari pengrajin terpercaya.',
    url: 'https://pintu-besi-shop.vercel.app/',
    siteName: 'Pintu Besi Shop',
    type: 'website',
    locale: 'id_ID',
    images: [
      {
        url: 'https://pintu-besi-shop.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Pintu Besi Shop - Toko Pintu Besi Premium',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pintu Besi Shop | Toko Pintu Besi Premium & Konstruksi Kokoh',
    description: 'Beli pintu besi berkualitas untuk pagar, garasi, dan gudang langsung dari pengrajin terpercaya.',
    images: ['https://pintu-besi-shop.vercel.app/og-image.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Pintu Besi Shop',
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="scroll-smooth">
      <head>
        {/* Additional meta tags for better mobile support */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=yes" />
      </head>
      <body className={`${plusJakartaSans.className} bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased overflow-x-hidden`}>
        <CartProvider>
          <div className="flex flex-col min-h-screen w-full overflow-x-hidden">
            {children}
          </div>
        </CartProvider>
      </body>
    </html>
  )
}
