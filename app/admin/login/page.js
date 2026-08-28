'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export default function AdminLoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setLoading(false)
      setError('Email atau password salah.')
      return
    }

    console.log('✅ Login berhasil:', data.user.email)

    // PENTING: refresh() dulu untuk memastikan session ter-sync
    router.refresh()
    
    // Tunggu sebentar agar refresh selesai, baru redirect
    setTimeout(() => {
      router.push('/admin/produk')
    }, 100)
  }

  return (
    <main className="max-w-sm mx-auto px-4 py-16">
      {/* Link ke Beranda */}
      <div className="mb-6 text-center">
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          ← Kembali ke Beranda
        </Link>
      </div>

      <h1 className="text-xl font-bold text-slate-800 mb-6 text-center">Login Admin</h1>

      <form onSubmit={handleLogin} className="space-y-4">
        <input required type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm" />

        <input required type="password" placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm" />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button type="submit" disabled={loading}
          className="w-full bg-slate-800 hover:bg-slate-900 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">
          {loading ? 'Masuk...' : 'Masuk'}
        </button>
      </form>
    </main>
  )
}
