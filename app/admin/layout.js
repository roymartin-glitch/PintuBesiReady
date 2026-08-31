import { createClient } from '@/lib/supabase/server'
import { getStoreSettings } from '@/lib/supabase/getStoreSettings'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminBottomNav from '@/components/AdminBottomNav'

export const metadata = {
  title: 'Panel Admin | Pintu Besi Shop',
  description: 'Kelola produk, kategori, dan pesanan pelanggan di Pintu Besi Shop.',
}

export default async function AdminLayout({ children }) {
  const supabase = createClient()
  const storeSettings = await getStoreSettings()

  // 1. Authenticate user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/admin/login')
  }

  // 2. Validate admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/') // Redirect unauthorized users to homepage
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900 antialiased font-sans">
      
      {/* Sidebar Navigation - Desktop only, replaced by bottom tab bar on mobile */}
      <aside className="hidden md:flex md:w-64 bg-gradient-to-b from-slate-900 to-slate-950 text-white shrink-0 shadow-premium-lg border-r border-slate-800/50 flex-col justify-between">
        <div>
          {/* Logo Brand Panel */}
          <div className="p-6 border-b border-slate-800/50 flex items-center justify-between group hover:bg-slate-800/30 transition-smooth">
            <span className="text-xl font-black tracking-tight text-white flex items-center gap-1 flex-wrap">
              {storeSettings?.store_name?.toUpperCase().split(' ').map((word, i) => (
                i === storeSettings.store_name.split(' ').length - 1 ? 
                  <span key={i} className="text-blue-500 group-hover:text-blue-400 transition-smooth">{word}</span> : 
                  <span key={i} className="group-hover:text-slate-200 transition-smooth">{word}</span>
              )) || (
                <>PINTU<span className="text-blue-500 group-hover:text-blue-400 transition-smooth">BESI</span></>
              )}
              <span className="text-[10px] bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-2 py-1 rounded font-extrabold ml-1 shadow-lg shadow-purple-500/20">ADMIN</span>
            </span>
          </div>

          {/* User Logged Info */}
          <div className="p-6 border-b border-slate-800/50 bg-slate-950/30 text-xs">
            <p className="text-slate-400 text-[10px] uppercase tracking-wider font-bold mb-2">Pengelola Aktif:</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold shadow-md">
                {(profile.full_name || user.email)?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-100 truncate">{profile.full_name || user.email}</p>
                <p className="text-[10px] text-slate-400">Administrator</p>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="p-4 space-y-1">
            <Link 
              href="/admin" 
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800/50 transition-smooth text-sm font-semibold text-slate-300 hover:text-white group"
            >
              <span className="text-xl group-hover:scale-110 transition-smooth">📊</span>
              <span>Dashboard</span>
            </Link>
            <Link 
              href="/admin/produk" 
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800/50 transition-smooth text-sm font-semibold text-slate-300 hover:text-white group"
            >
              <span className="text-xl group-hover:scale-110 transition-smooth">🚪</span>
              <span>Kelola Produk</span>
            </Link>
            <Link 
              href="/admin/kategori" 
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800/50 transition-smooth text-sm font-semibold text-slate-300 hover:text-white group"
            >
              <span className="text-xl group-hover:scale-110 transition-smooth">📂</span>
              <span>Kelola Kategori</span>
            </Link>
            <Link 
              href="/admin/pesanan" 
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800/50 transition-smooth text-sm font-semibold text-slate-300 hover:text-white group"
            >
              <span className="text-xl group-hover:scale-110 transition-smooth">📋</span>
              <span>Kelola Pesanan</span>
            </Link>
            
            {/* Divider */}
            <div className="border-t border-slate-800/50 my-3"></div>
            
            <Link 
              href="/admin/pengaturan" 
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-600/20 transition-smooth text-sm font-semibold text-slate-300 hover:text-white bg-blue-600/10 border border-blue-500/20 group"
            >
              <span className="text-xl group-hover:scale-110 transition-smooth">⚙️</span>
              <span>Pengaturan Toko</span>
            </Link>
          </nav>
        </div>

        {/* Footer & Logout Actions */}
        <div className="p-4 border-t border-slate-800/50 space-y-2">
          <Link 
            href="/" 
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800/50 transition-smooth text-xs font-bold group"
          >
            <span className="group-hover:-translate-x-1 transition-smooth">←</span>
            Lihat Website
          </Link>
          <form action="/api/auth/logout" method="POST" className="w-full">
            <button
              type="submit"
              aria-label="Keluar Panel"
              className="w-full text-center px-4 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-smooth text-white text-xs font-bold shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30"
            >
              🚪
            </button>
          </form>
        </div>
      </aside>

      {/* Main Panel Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        
        {/* Topbar Panel */}
        <header className="bg-white/95 backdrop-blur-xl border-b border-slate-200/80 h-16 flex items-center px-6 sm:px-8 justify-between shadow-premium sticky top-0 z-30 shrink-0">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="hidden sm:inline">Sistem Kelola Toko Online</span>
            <span className="sm:hidden">Panel Admin</span>
          </h2>
          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-400 hidden md:flex items-center gap-2">
              <span>📅</span>
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            {/* Mobile-only quick actions (sidebar with these is hidden on mobile) */}
            <div className="flex items-center gap-1.5 md:hidden">
              <Link
                href="/"
                aria-label="Lihat Website"
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-smooth text-sm"
              >
                🌐
              </Link>
            </div>
          </div>
        </header>

        {/* Scrollable Children view */}
        <div className="p-6 sm:p-8 flex-1 flex flex-col pb-24 md:pb-8">
          {children}
        </div>

      </div>

      {/* Mobile Bottom Tab Navigation */}
      <AdminBottomNav />

    </div>
  )
}