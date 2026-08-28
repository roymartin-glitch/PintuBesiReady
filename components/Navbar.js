'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useCart } from './CartContext'

function NavbarContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { cartCount } = useCart()

  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [storeSettings, setStoreSettings] = useState({
    store_name: 'Pintu Besi Shop',
    whatsapp_number: '6281331941357'
  })

  const dropdownRef = useRef(null)

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '')
  }, [searchParams])

  // Fetch store settings
  useEffect(() => {
    async function fetchStoreSettings() {
      const { data, error } = await supabase
        .from('store_settings')
        .select('store_name, whatsapp_number')
        .limit(1)
        .single()

      if (data) {
        setStoreSettings(data)
      }
    }
    fetchStoreSettings()
  }, [supabase])

  useEffect(() => {
    async function getUser() {
      try {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error('❌ Navbar auth error:', error)
          return
        }

        if (currentUser) {
          console.log('✅ User detected in Navbar:', currentUser.email)
          setUser(currentUser)
          
          const { data: currentProfile, error: profileError } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('id', currentUser.id)
            .single()
          
          if (profileError) {
            console.error('❌ Profile fetch error:', profileError)
          } else {
            console.log('✅ Profile loaded:', currentProfile)
            setProfile(currentProfile)
          }
        } else {
          console.log('ℹ️ No user logged in')
        }
      } catch (err) {
        console.error('❌ Navbar getUser error:', err)
      }
    }
    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.email)
      
      if (session?.user) {
        setUser(session.user)
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', session.user.id)
          .single()
        setProfile(currentProfile)
      } else {
        setUser(null)
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/produk?q=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      router.push('/produk')
    }
    setIsMobileMenuOpen(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/')
  }

  return (
    <nav className="border-b border-slate-200/80 bg-white/95 backdrop-blur-xl sticky top-0 z-50 shadow-premium transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center gap-4 animate-fade-in">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <span className="text-2xl font-black text-slate-900 tracking-tight flex items-center transition-smooth">
              {storeSettings.store_name?.split(' ').map((word, i) => (
                i === storeSettings.store_name.split(' ').length - 1 ? 
                  <span key={i} className="text-blue-600 group-hover:text-blue-700 transition-smooth">{word}</span> : 
                  <span key={i} className="group-hover:text-slate-700 transition-smooth">{word}</span>
              ))}
              <span className="text-[10px] font-extrabold bg-gradient-to-br from-blue-500 to-blue-600 text-white px-1.5 py-0.5 rounded ml-2 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-smooth">SHOP</span>
            </span>
          </Link>

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative group">
            <input
              type="text"
              placeholder="Cari pintu pagar, garasi, teralis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 focus:bg-white transition-smooth group-hover:border-slate-300"
            />
            <button type="submit" className="absolute right-3 top-3 text-slate-400 hover:text-blue-600 transition-smooth">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          {/* Desktop Actions */}
          <div className="hidden md:flex gap-6 items-center text-sm animate-fade-in">
            <Link href="/produk" className="font-semibold text-slate-600 hover:text-slate-900 transition-smooth relative group">
              <span>Katalog</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
            </Link>

            {/* Cart Icon Link */}
            <Link href="/cart" className="relative p-2 text-slate-600 hover:text-slate-900 transition-smooth hover:bg-slate-100 rounded-xl group">
              <svg className="w-6 h-6 transition-transform group-hover:scale-110 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-br from-blue-500 to-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-extrabold shadow-lg shadow-blue-500/40 animate-scale-in">
                  {cartCount}
                </span>
              )}
            </Link>

            <span className="text-slate-200 w-px h-6 bg-slate-200"></span>

            {/* User Dropdown / Auth Link */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 font-semibold text-slate-700 hover:text-slate-900 transition-smooth focus:outline-none p-2 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-200 group"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-md group-hover:shadow-lg uppercase group-hover:scale-105 transition-smooth">
                    {(profile?.full_name || user.email)?.[0]}
                  </div>
                  <span className="max-w-[120px] truncate">
                    {profile?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                  </span>
                  <svg className={`w-4 h-4 transition-transform duration-300 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200/80 rounded-2xl shadow-premium-lg py-2 z-50 animate-scale-in origin-top-right">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-xs text-slate-400 font-medium">Masuk sebagai</p>
                      <p className="text-sm font-bold text-slate-800 truncate mt-0.5">{profile?.full_name || user.email}</p>
                    </div>
                    <Link 
                      href="/dashboard" 
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-smooth text-sm font-medium"
                    >
                      <span className="text-lg">📊</span>
                      Dashboard Saya
                    </Link>
                    <Link 
                      href="/dashboard/profil" 
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-smooth text-sm font-medium"
                    >
                      <span className="text-lg">⚙️</span>
                      Ubah Profil
                    </Link>
                    {profile?.role === 'admin' && (
                      <Link 
                        href="/admin" 
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-purple-700 hover:bg-purple-50 font-semibold transition-smooth border-t border-purple-50/50 text-sm"
                      >
                        <span className="text-lg">👑</span>
                        Panel Admin
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-red-600 hover:bg-red-50 transition-smooth border-t border-slate-100 font-medium text-sm"
                    >
                      <span className="text-lg">🚪</span>
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/auth/login" className="text-slate-600 hover:text-slate-900 font-semibold transition-smooth">
                  Masuk
                </Link>
                <Link href="/auth/register" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2 rounded-xl font-semibold transition-smooth shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95">
                  Daftar
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button & Cart icon */}
          <div className="flex items-center gap-2 md:hidden">
            <Link href="/cart" className="relative p-2 text-slate-600 hover:text-slate-900 transition-smooth hover:bg-slate-100 rounded-xl group">
              <svg className="w-6 h-6 transition-transform group-hover:scale-110 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-extrabold shadow-md">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-950 focus:outline-none hover:bg-slate-100 rounded-xl transition-smooth"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-4 animate-slide-up shadow-lg">
          <form onSubmit={handleSearchSubmit} className="flex relative">
            <input
              type="text"
              placeholder="Cari pintu pagar, garasi, teralis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-smooth"
            />
            <button type="submit" className="absolute right-3 top-3.5 text-slate-400 hover:text-blue-600 transition-smooth">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          <div className="flex flex-col gap-2 text-sm">
            <Link 
              href="/produk" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 font-semibold py-3 px-4 hover:bg-slate-50 rounded-xl text-slate-700 transition-smooth"
            >
              <span className="text-lg">🛍️</span>
              Semua Katalog Produk
            </Link>

            {user ? (
              <>
                <Link 
                  href="/dashboard" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 font-semibold py-3 px-4 hover:bg-slate-50 rounded-xl text-slate-700 transition-smooth"
                >
                  <span className="text-lg">📊</span>
                  Dashboard Saya
                </Link>
                <Link 
                  href="/dashboard/profil" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 font-semibold py-3 px-4 hover:bg-slate-50 rounded-xl text-slate-700 transition-smooth"
                >
                  <span className="text-lg">⚙️</span>
                  Ubah Profil / Alamat
                </Link>
                {profile?.role === 'admin' && (
                  <Link 
                    href="/admin" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 font-semibold py-3 px-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl text-purple-700 border border-purple-100 transition-smooth"
                  >
                    <span className="text-lg">👑</span>
                    Panel Admin
                  </Link>
                )}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2 text-left font-semibold py-3 px-4 hover:bg-red-50 rounded-xl text-red-600 transition-smooth"
                >
                  <span className="text-lg">🚪</span>
                  Keluar
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                <Link 
                  href="/auth/login" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="border border-slate-200 text-center py-3 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition-smooth"
                >
                  Masuk
                </Link>
                <Link 
                  href="/auth/register" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-center text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-500/20 transition-smooth"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default function Navbar() {
  return (
    <Suspense fallback={
      <nav className="border-b bg-white h-16 sticky top-0 z-50 shadow-sm flex items-center">
        <div className="max-w-7xl mx-auto px-4 w-full flex justify-between">
          <span className="text-2xl font-black text-slate-900 tracking-tight">PINTU<span className="text-blue-600">BESI</span></span>
          <div className="h-8 w-64 bg-slate-100 rounded"></div>
        </div>
      </nav>
    }>
      <NavbarContent />
    </Suspense>
  )
}
