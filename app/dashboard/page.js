import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'Dashboard Pelanggan | Pintu Besi Shop',
  description: 'Kelola pesanan, ubah data profil, dan lihat status pengerjaan pintu besi Anda.',
}

export default async function DashboardPage() {
  const supabase = createClient()

  // Authenticate user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login?redirect=/dashboard')
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone, address, role')
    .eq('id', user.id)
    .single()

  // Fetch orders count
  const { count: orderCount } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        
        {/* Navigation Breadcrumbs */}
        <div className="mb-6 flex gap-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-blue-600 transition">Beranda</Link>
          <span>/</span>
          <span className="text-slate-600 font-semibold">Dashboard</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar Menu */}
          <aside className="lg:col-span-3 space-y-2">
            <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm space-y-1">
              <Link 
                href="/dashboard" 
                className="block text-xs font-bold px-4 py-3 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl"
              >
                📋 Riwayat Pesanan
              </Link>
              <Link 
                href="/dashboard/profil" 
                className="block text-xs font-semibold px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl"
              >
                👤 Ubah Profil / Alamat
              </Link>
            </div>
          </aside>

          {/* Main Dashboard Panel */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Greeting Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-2xl pointer-events-none -translate-y-1/3 translate-x-1/4"></div>
              <div className="relative z-10 space-y-2">
                <span className="text-xs font-bold bg-blue-600/30 text-blue-300 border border-blue-500/20 px-2.5 py-1 rounded-lg">
                  HALO PELANGGAN
                </span>
                <h2 className="text-2xl font-black tracking-tight">
                  Selamat Datang, {profile?.full_name?.split(' ')[0] || user.email?.split('@')[0]}!
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm">
                  Kelola pemesanan pintu besi Anda dan pantau status pengerjaan langsung di sini.
                </p>
              </div>
            </div>

            {/* Profile Summary & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Profile Card */}
              <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Informasi Profil</h3>
                  <Link href="/dashboard/profil" className="text-xs text-blue-600 hover:underline font-bold">
                    Ubah
                  </Link>
                </div>
                
                <div className="space-y-3 text-xs">
                  <div className="flex items-center">
                    <span className="w-24 text-slate-400 font-medium">Nama</span>
                    <span className="text-slate-800 font-bold">{profile?.full_name || '-'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-24 text-slate-400 font-medium">Email</span>
                    <span className="text-slate-800 font-semibold">{user.email}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-24 text-slate-400 font-medium">WhatsApp / HP</span>
                    <span className="text-slate-800 font-bold">{profile?.phone || '-'}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-24 text-slate-400 font-medium">Alamat Kirim</span>
                    <span className="text-slate-800 font-semibold flex-1 line-clamp-2">{profile?.address || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Pesanan Saya</h3>
                  <p className="text-slate-400 text-xs">Total transaksi pemesanan yang tercatat</p>
                </div>
                
                <div className="flex items-end justify-between mt-4">
                  <div>
                    <span className="text-4xl font-black text-slate-900">{orderCount || 0}</span>
                    <span className="text-slate-500 text-xs font-bold ml-1.5">Pesanan</span>
                  </div>
                  <Link 
                    href="/dashboard/pesanan" 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-md shadow-blue-500/10"
                  >
                    Lihat Semua Pesanan
                  </Link>
                </div>
              </div>

            </div>

          </div>

        </div>
      </main>
    </>
  )
}
