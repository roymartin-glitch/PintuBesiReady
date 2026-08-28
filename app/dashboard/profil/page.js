'use client'

import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function UserProfilePage() {
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' })

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
  })

  useEffect(() => {
    async function getProfile() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        router.push('/auth/login?redirect=/dashboard/profil')
        return
      }
      setUser(currentUser)

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone, address')
        .eq('id', currentUser.id)
        .single()

      if (profile) {
        setForm({
          name: profile.full_name || '',
          phone: profile.phone || '',
          address: profile.address || '',
        })
      }
      setIsLoading(false)
    }

    getProfile()
  }, [supabase, router])

  async function handleSave(e) {
    e.preventDefault()
    if (isSaving || !user) return

    setIsSaving(true)
    setStatusMessage({ type: '', text: '' })

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: form.name,
          phone: form.phone,
          address: form.address,
        })
        .eq('id', user.id)

      if (error) throw error

      setStatusMessage({ type: 'success', text: 'Profil Anda berhasil diperbarui!' })
    } catch (err) {
      console.error('Failed to update profile:', err)
      setStatusMessage({ type: 'error', text: err.message || 'Gagal memperbarui profil. Coba lagi.' })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center flex-1 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 mt-4 text-sm font-semibold">Memuat data profil Anda...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        
        {/* Navigation Breadcrumbs */}
        <div className="mb-6 flex gap-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-blue-600 transition">Beranda</Link>
          <span>/</span>
          <Link href="/dashboard" className="hover:text-blue-600 transition">Dashboard</Link>
          <span>/</span>
          <span className="text-slate-600 font-semibold">Ubah Profil</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar Menu User Dashboard */}
          <aside className="md:col-span-3 space-y-2">
            <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm space-y-1">
              <Link 
                href="/dashboard" 
                className="block text-xs font-semibold px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl"
              >
                📋 Riwayat Pesanan
              </Link>
              <Link 
                href="/dashboard/profil" 
                className="block text-xs font-bold px-4 py-3 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl"
              >
                👤 Ubah Profil / Alamat
              </Link>
            </div>
          </aside>

          {/* Form Editor Card */}
          <div className="md:col-span-9 bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="border-b pb-4 mb-6">
              <h2 className="text-xl font-bold text-slate-800">Ubah Informasi Profil</h2>
              <p className="text-slate-500 text-xs mt-1">Ubah nama, nomor kontak WhatsApp, dan alamat pengiriman default Anda</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Nama Lengkap</label>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Nomor WhatsApp / HP</label>
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Alamat Pengiriman Default</label>
                <textarea
                  required
                  placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kota, provinsi, kode pos..."
                  rows={4}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                />
              </div>

              {/* Status Alert Messages */}
              {statusMessage.text && (
                <div className={`p-4 rounded-xl text-xs font-semibold border ${statusMessage.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                  {statusMessage.type === 'success' ? '✓' : '⚠️'} {statusMessage.text}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <Link href="/dashboard" className="border border-slate-200 text-slate-700 font-bold px-6 py-2.5 rounded-xl text-xs hover:bg-slate-50 transition">
                  Kembali
                </Link>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-350 text-white font-bold px-8 py-2.5 rounded-xl text-xs transition shadow-md shadow-blue-500/10"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>

            </form>

          </div>

        </div>
      </main>
    </>
  )
}
