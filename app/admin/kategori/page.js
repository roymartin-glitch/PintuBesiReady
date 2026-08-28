'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminCategoriesPage() {
  const supabase = createClient()

  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [form, setForm] = useState({ name: '', slug: '' })
  const [editId, setEditId] = useState(null) // null for create mode, category ID for edit mode

  // Load categories
  async function fetchCategories() {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (err) {
      console.error('Failed to load categories:', err)
      setErrorMessage('Gagal memuat kategori.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // Auto-generate slug from name
  function handleNameChange(nameVal) {
    const slugVal = nameVal
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // remove special chars
      .replace(/[\s_]+/g, '-')  // replace spaces with hyphens
      .replace(/^-+|-+$/g, '')  // trim trailing hyphens

    setForm({ name: nameVal, slug: slugVal })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      if (editId) {
        // Edit mode
        const { error } = await supabase
          .from('categories')
          .update({
            name: form.name,
            slug: form.slug,
          })
          .eq('id', editId)

        if (error) throw error
        setSuccessMessage('Kategori berhasil diperbarui!')
      } else {
        // Create mode
        const { error } = await supabase
          .from('categories')
          .insert([
            {
              name: form.name,
              slug: form.slug,
            },
          ])

        if (error) throw error
        setSuccessMessage('Kategori baru berhasil ditambahkan!')
      }

      setForm({ name: '', slug: '' })
      setEditId(null)
      fetchCategories()
    } catch (err) {
      console.error('Failed to save category:', err)
      setErrorMessage(err.message || 'Gagal menyimpan kategori. Pastikan slug unik.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus kategori ini? Semua produk yang terasosiasi akan terlepas kategorinya.')) return

    setErrorMessage('')
    setSuccessMessage('')

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) throw error
      setSuccessMessage('Kategori berhasil dihapus!')
      fetchCategories()
    } catch (err) {
      console.error('Failed to delete category:', err)
      setErrorMessage('Gagal menghapus kategori.')
    }
  }

  function startEdit(cat) {
    setEditId(cat.id)
    setForm({ name: cat.name, slug: cat.slug })
    setErrorMessage('')
    setSuccessMessage('')
  }

  function cancelEdit() {
    setEditId(null)
    setForm({ name: '', slug: '' })
  }

  return (
    <div className="space-y-8 flex-1 flex flex-col">
      
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Kelola Kategori</h1>
        <p className="text-slate-500 text-xs mt-1">Kelompokkan katalog produk pintu besi Anda ke dalam kategori terstruktur</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-1">
        
        {/* Category Form Column */}
        <div className="lg:col-span-4 bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b pb-3">
            {editId ? 'Ubah Kategori' : 'Kategori Baru'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-500 block">Nama Kategori</label>
              <input
                required
                type="text"
                placeholder="Contoh: Pintu Pagar Otomatis"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-500 block">Slug (URL Friendly)</label>
              <input
                required
                type="text"
                placeholder="pintu-pagar-otomatis"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 font-mono text-slate-650 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
            </div>

            {/* Notifications */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-650 rounded-xl font-medium">
                ⚠️ {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl font-medium">
                ✓ {successMessage}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              {editId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex-1 py-2 rounded-xl border border-slate-200 font-bold hover:bg-slate-50 transition"
                >
                  Batal
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-350 text-white font-bold transition shadow-md shadow-blue-500/5"
              >
                {isSubmitting ? 'Memproses...' : editId ? 'Simpan' : 'Tambah Kategori'}
              </button>
            </div>

          </form>
        </div>

        {/* Categories List Table Column */}
        <div className="lg:col-span-8 bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm flex-1 flex flex-col">
          <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider border-b pb-4 mb-6">
            Daftar Kategori Terdaftar
          </h3>

          {isLoading ? (
            <div className="text-center py-12 flex flex-col items-center justify-center my-auto">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : categories.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-450 border-b">
                  <tr>
                    <th className="px-4 py-3">Nama Kategori</th>
                    <th className="px-4 py-3">Slug Kategori</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-4 py-3.5 font-semibold text-slate-800">{cat.name}</td>
                      <td className="px-4 py-3.5 font-mono text-slate-500">{cat.slug}</td>
                      <td className="px-4 py-3.5 text-right space-x-3">
                        <button
                          onClick={() => startEdit(cat)}
                          className="text-blue-600 hover:text-blue-750 font-bold"
                        >
                          Ubah
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="text-red-600 hover:text-red-750 font-bold"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 my-auto">
              Belum ada kategori terdaftar. Gunakan formulir di sebelah kiri untuk membuat.
            </div>
          )}
        </div>

      </div>

    </div>
  )
}
