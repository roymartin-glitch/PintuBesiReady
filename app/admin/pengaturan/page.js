'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function StoreSettingsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const [form, setForm] = useState({
    store_name: '',
    store_tagline: '',
    store_description: '',
    
    phone_number: '',
    whatsapp_number: '',
    email: '',
    address: '',
    city: '',
    province: '',
    postal_code: '',
    google_maps_url: '',
    
    instagram_url: '',
    facebook_url: '',
    tiktok_url: '',
    youtube_url: '',
    
    business_hours: '',
    established_year: '',
    
    footer_text: '',
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .limit(1)
        .single()

      if (error) throw error

      if (data) {
        setForm({
          store_name: data.store_name || '',
          store_tagline: data.store_tagline || '',
          store_description: data.store_description || '',
          phone_number: data.phone_number || '',
          whatsapp_number: data.whatsapp_number || '',
          email: data.email || '',
          address: data.address || '',
          city: data.city || '',
          province: data.province || '',
          postal_code: data.postal_code || '',
          google_maps_url: data.google_maps_url || '',
          instagram_url: data.instagram_url || '',
          facebook_url: data.facebook_url || '',
          tiktok_url: data.tiktok_url || '',
          youtube_url: data.youtube_url || '',
          business_hours: data.business_hours || '',
          established_year: data.established_year || '',
          footer_text: data.footer_text || '',
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      alert('Gagal memuat pengaturan: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()

      // Check if settings exist
      const { data: existing } = await supabase
        .from('store_settings')
        .select('id')
        .limit(1)
        .single()

      const payload = {
        ...form,
        established_year: form.established_year ? parseInt(form.established_year) : null,
        updated_at: new Date().toISOString(),
        updated_by: user?.id,
      }

      let result

      if (existing) {
        // Update existing
        result = await supabase
          .from('store_settings')
          .update(payload)
          .eq('id', existing.id)
      } else {
        // Insert new (first time)
        result = await supabase
          .from('store_settings')
          .insert([payload])
      }

      if (result.error) throw result.error

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      
      // Refresh page to update navbar/footer
      window.location.reload()
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Gagal menyimpan: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Pengaturan Toko</h1>
          <p className="text-slate-500 text-xs mt-1">Kelola informasi toko, kontak, dan branding</p>
        </div>
        <Link
          href="/admin/produk"
          className="text-sm text-blue-600 hover:underline font-medium"
        >
          ← Kembali ke Dashboard
        </Link>
      </div>

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium">
          ✅ Pengaturan berhasil disimpan! Halaman akan di-refresh...
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Informasi Dasar Toko */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">
            🏪 Informasi Dasar Toko
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Nama Toko <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              placeholder="Contoh: Pintu Besi Shop"
              value={form.store_name}
              onChange={(e) => setForm({ ...form, store_name: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
            />
            <p className="text-xs text-slate-400 mt-1">Nama ini akan muncul di Navbar, Footer, dan halaman About</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Tagline / Slogan
            </label>
            <input
              type="text"
              placeholder="Contoh: Konstruksi Besi Kokoh, Presisi & Premium"
              value={form.store_tagline}
              onChange={(e) => setForm({ ...form, store_tagline: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Deskripsi Toko
            </label>
            <textarea
              rows={4}
              placeholder="Deskripsi singkat tentang bisnis Anda..."
              value={form.store_description}
              onChange={(e) => setForm({ ...form, store_description: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Tahun Berdiri
            </label>
            <input
              type="number"
              placeholder="Contoh: 2010"
              value={form.established_year}
              onChange={(e) => setForm({ ...form, established_year: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
            />
          </div>
        </div>

        {/* Kontak */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">
            📞 Kontak & Komunikasi
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Nomor Telepon
              </label>
              <input
                type="tel"
                placeholder="0813-3194-1357"
                value={form.phone_number}
                onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                WhatsApp Number <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                placeholder="6281331941357 (format: 628xxx tanpa +)"
                value={form.whatsapp_number}
                onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
              <p className="text-xs text-red-500 mt-1">Format: 628xxx (tanpa tanda +)</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="info@tokobesi.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Jam Operasional
            </label>
            <input
              type="text"
              placeholder="Senin - Sabtu: 08.00 - 17.00 WIB"
              value={form.business_hours}
              onChange={(e) => setForm({ ...form, business_hours: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
            />
          </div>
        </div>

        {/* Alamat */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">
            📍 Lokasi Toko
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Alamat Lengkap
            </label>
            <textarea
              rows={3}
              placeholder="Jl. Industri Besi No. 123, Kelurahan..."
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Kota
              </label>
              <input
                type="text"
                placeholder="Jakarta"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Provinsi
              </label>
              <input
                type="text"
                placeholder="DKI Jakarta"
                value={form.province}
                onChange={(e) => setForm({ ...form, province: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Kode Pos
              </label>
              <input
                type="text"
                placeholder="12345"
                value={form.postal_code}
                onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Google Maps URL (Share Link)
            </label>
            <input
              type="url"
              placeholder="https://maps.app.goo.gl/..."
              value={form.google_maps_url}
              onChange={(e) => setForm({ ...form, google_maps_url: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
            />
            <p className="text-xs text-slate-400 mt-1">Copy "Share link" dari Google Maps</p>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">
            📱 Media Sosial
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Instagram URL
              </label>
              <input
                type="url"
                placeholder="https://instagram.com/tokobesi"
                value={form.instagram_url}
                onChange={(e) => setForm({ ...form, instagram_url: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Facebook URL
              </label>
              <input
                type="url"
                placeholder="https://facebook.com/tokobesi"
                value={form.facebook_url}
                onChange={(e) => setForm({ ...form, facebook_url: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                TikTok URL
              </label>
              <input
                type="url"
                placeholder="https://tiktok.com/@tokobesi"
                value={form.tiktok_url}
                onChange={(e) => setForm({ ...form, tiktok_url: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                YouTube URL
              </label>
              <input
                type="url"
                placeholder="https://youtube.com/@tokobesi"
                value={form.youtube_url}
                onChange={(e) => setForm({ ...form, youtube_url: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">
            📄 Footer & Lain-lain
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Teks Footer (Copyright)
            </label>
            <input
              type="text"
              placeholder="© 2024 Pintu Besi Shop. All rights reserved."
              value={form.footer_text}
              onChange={(e) => setForm({ ...form, footer_text: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl text-sm font-bold disabled:opacity-50 transition shadow-lg shadow-blue-500/10"
          >
            {saving ? 'Menyimpan...' : '💾 Simpan Pengaturan'}
          </button>
          
          <Link
            href="/admin/produk"
            className="px-6 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
          >
            Batal
          </Link>
        </div>

      </form>

    </div>
  )
}
