'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, Suspense, useEffect } from 'react'
import Link from 'next/link'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  const [form, setForm] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  const redirectTo = searchParams.get('redirect') || '/'

  // Check if user is already logged in
  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        // User already logged in, redirect
        router.replace(redirectTo)
      } else {
        setCheckingSession(false)
      }
    }
    checkSession()
  }, [router, redirectTo, supabase])

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })

      if (signInError) throw signInError

      if (data?.session) {
        console.log('✅ User berhasil login:', data.user.email)
        // Redirect ke halaman yang diminta
        router.push(redirectTo)
        router.refresh()
      }
    } catch (err) {
      console.error('Login error:', err)
      setError(err.message || 'Email atau password salah')
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
      },
    })

    if (error) {
      setLoading(false)
      setError(error.message)
      console.error('Google signin error:', error)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 to-slate-100">
      {checkingSession ? (
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200/60 p-8">
        
        {/* Link ke Beranda */}
        <div className="mb-6 text-center">
          <Link href="/" className="text-sm text-blue-600 hover:underline font-medium flex items-center justify-center gap-1">
            <span>←</span> Kembali ke Beranda
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1 mb-4">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              PINTU<span className="text-blue-600">BESI</span>
            </span>
            <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">SHOP</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Masuk ke Akun Anda</h1>
          <p className="text-sm text-slate-500">
            Belum punya akun?{' '}
            <Link href={`/auth/register?redirect=${encodeURIComponent(redirectTo)}`} className="text-blue-600 hover:underline font-medium">
              Daftar di sini
            </Link>
          </p>
        </div>

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 py-3 rounded-xl text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-3 shadow-sm transition mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {loading ? 'Memuat...' : 'Continue with Google'}
        </button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-white text-gray-500">Atau masuk dengan email</span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email</label>
            <input
              required
              type="email"
              placeholder="nama@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Password</label>
            <input
              required
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-bold disabled:opacity-50 transition shadow-lg shadow-blue-500/10"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        {/* Additional Links */}
        <div className="mt-6 text-center text-xs text-slate-500">
          Dengan masuk, Anda menyetujui{' '}
          <Link href="/" className="text-blue-600 hover:underline">Syarat & Ketentuan</Link>
          {' '}dan{' '}
          <Link href="/" className="text-blue-600 hover:underline">Kebijakan Privasi</Link>
        </div>
      </div>
      )}
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
