import { getStoreSettings } from '@/lib/supabase/getStoreSettings'
import Link from 'next/link'

export default async function Footer() {
  const settings = await getStoreSettings()

  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-b from-slate-900 to-slate-950 text-slate-300 border-t border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-white font-black text-lg tracking-tight flex items-center gap-2">
              <span className="text-2xl">🏗️</span>
              {settings?.store_name || 'Pintu Besi Shop'}
            </h3>
            <p className="text-sm leading-relaxed text-slate-400">
              {settings?.store_description || 'Konstruksi besi berkualitas tinggi untuk properti Anda.'}
            </p>
            {settings?.established_year && (
              <div className="inline-flex items-center gap-2 bg-slate-800/50 border border-slate-700 px-3 py-1.5 rounded-lg">
                <span className="text-xs text-slate-400">Berdiri sejak</span>
                <span className="text-sm font-bold text-blue-400">{settings.established_year}</span>
              </div>
            )}
          </div>

          {/* Contact Section */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
              <span className="text-blue-400">●</span> Hubungi Kami
            </h4>
            <div className="space-y-3 text-sm">
              {settings?.phone_number && (
                <div className="flex items-start gap-3 group">
                  <span className="text-blue-400 text-lg">📞</span>
                  <div>
                    <p className="text-slate-400 text-xs">Telepon</p>
                    <a href={`tel:${settings.phone_number}`} className="text-slate-200 hover:text-white transition-smooth font-medium">
                      {settings.phone_number}
                    </a>
                  </div>
                </div>
              )}
              {settings?.whatsapp_number && (
                <div className="flex items-start gap-3 group">
                  <span className="text-green-400 text-lg">💬</span>
                  <div>
                    <p className="text-slate-400 text-xs">WhatsApp</p>
                    <a 
                      href={`https://wa.me/${settings.whatsapp_number}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-200 hover:text-white transition-smooth font-medium inline-flex items-center gap-1"
                    >
                      Chat Sekarang
                      <span className="text-xs group-hover:translate-x-1 transition-smooth">→</span>
                    </a>
                  </div>
                </div>
              )}
              {settings?.email && (
                <div className="flex items-start gap-3 group">
                  <span className="text-slate-400 text-lg">✉️</span>
                  <div>
                    <p className="text-slate-400 text-xs">Email</p>
                    <a href={`mailto:${settings.email}`} className="text-slate-200 hover:text-white transition-smooth font-medium">
                      {settings.email}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Location Section */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
              <span className="text-blue-400">●</span> Lokasi
            </h4>
            <div className="space-y-2 text-sm">
              {settings?.address && (
                <p className="text-slate-400 leading-relaxed">{settings.address}</p>
              )}
              {settings?.city && settings?.province && (
                <p className="text-slate-400">
                  {settings.city}, {settings.province}
                  {settings.postal_code && ` ${settings.postal_code}`}
                </p>
              )}
              {settings?.business_hours && (
                <div className="pt-2 border-t border-slate-800">
                  <p className="text-slate-500 text-xs mb-1 font-medium">Jam Operasional:</p>
                  <p className="text-slate-300 text-sm font-semibold">{settings.business_hours}</p>
                </div>
              )}
              {settings?.google_maps_url && (
                <a 
                  href={settings.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-smooth text-xs font-bold pt-2 group"
                >
                  📍 Lihat di Google Maps
                  <span className="group-hover:translate-x-1 transition-smooth">→</span>
                </a>
              )}
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
              <span className="text-blue-400">●</span> Link Cepat
            </h4>
            <div className="space-y-2 text-sm">
              <Link href="/produk" className="block text-slate-400 hover:text-white transition-smooth hover:translate-x-1 duration-200">
                → Katalog Produk
              </Link>
              <Link href="/cart" className="block text-slate-400 hover:text-white transition-smooth hover:translate-x-1 duration-200">
                → Keranjang Belanja
              </Link>
              <Link href="/dashboard" className="block text-slate-400 hover:text-white transition-smooth hover:translate-x-1 duration-200">
                → Dashboard Akun
              </Link>
              <Link href="/auth/register" className="block text-slate-400 hover:text-white transition-smooth hover:translate-x-1 duration-200">
                → Daftar Akun Baru
              </Link>
            </div>

            {/* Social Media */}
            {(settings?.instagram_url || settings?.facebook_url || settings?.tiktok_url || settings?.youtube_url) && (
              <div className="pt-4 border-t border-slate-800">
                <p className="text-slate-500 text-xs mb-3 font-medium">Ikuti Kami:</p>
                <div className="flex gap-2">
                  {settings.instagram_url && (
                    <a 
                      href={settings.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-xl bg-slate-800/50 hover:bg-gradient-to-br hover:from-pink-500 hover:to-orange-500 border border-slate-700 hover:border-transparent flex items-center justify-center transition-smooth text-slate-400 hover:text-white hover:scale-110"
                      aria-label="Instagram"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                  )}
                  {settings.facebook_url && (
                    <a 
                      href={settings.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-xl bg-slate-800/50 hover:bg-blue-600 border border-slate-700 hover:border-transparent flex items-center justify-center transition-smooth text-slate-400 hover:text-white hover:scale-110"
                      aria-label="Facebook"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                  )}
                  {settings.tiktok_url && (
                    <a 
                      href={settings.tiktok_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-xl bg-slate-800/50 hover:bg-slate-950 border border-slate-700 hover:border-transparent flex items-center justify-center transition-smooth text-slate-400 hover:text-white hover:scale-110"
                      aria-label="TikTok"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                      </svg>
                    </a>
                  )}
                  {settings.youtube_url && (
                    <a 
                      href={settings.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-xl bg-slate-800/50 hover:bg-red-600 border border-slate-700 hover:border-transparent flex items-center justify-center transition-smooth text-slate-400 hover:text-white hover:scale-110"
                      aria-label="YouTube"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p className="text-slate-500 text-center md:text-left text-sm">
            {settings?.footer_text || `© ${currentYear} ${settings?.store_name || 'Pintu Besi Shop'}. All rights reserved.`}
          </p>
          <div className="flex gap-6 text-xs">
            <Link href="/" className="text-slate-500 hover:text-slate-300 transition-smooth">
              Syarat & Ketentuan
            </Link>
            <Link href="/" className="text-slate-500 hover:text-slate-300 transition-smooth">
              Kebijakan Privasi
            </Link>
          </div>
        </div>

      </div>
    </footer>
  )
}
