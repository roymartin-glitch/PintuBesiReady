'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function NewProductPage() {
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({
    name: '', 
    price: '', 
    discount_price: '',
    discount_percentage: '',
    stock: '', 
    size: '', 
    material: '', 
    description: '', 
    category_id: ''
  })
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState([]) // Array untuk menyimpan file gambar yang dipilih
  const [previewUrls, setPreviewUrls] = useState([]) // Array URL preview
  const [categories, setCategories] = useState([]) // List kategori untuk dropdown

  // Fetch categories saat component mount
  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from('categories').select('id, name').order('name')
      setCategories(data || [])
    }
    fetchCategories()
  }, [supabase])

  function slugify(text) {
    return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
  }

  // Handle file selection dengan validasi
  function handleImageChange(e) {
    const files = Array.from(e.target.files)
    const validImages = []
    const validPreviews = []
    let hasError = false

    files.forEach((file) => {
      // Validasi tipe file
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!validTypes.includes(file.type)) {
        alert(`File ${file.name} bukan format gambar yang valid. Gunakan JPG, PNG, atau WEBP.`)
        hasError = true
        return
      }

      // Validasi ukuran file (max 2MB)
      const maxSize = 2 * 1024 * 1024 // 2MB dalam bytes
      if (file.size > maxSize) {
        alert(`File ${file.name} terlalu besar. Maksimal 2MB per foto.`)
        hasError = true
        return
      }

      validImages.push(file)
      validPreviews.push(URL.createObjectURL(file))
    })

    if (!hasError && validImages.length > 0) {
      setImages([...images, ...validImages])
      setPreviewUrls([...previewUrls, ...validPreviews])
    }
  }

  // Hapus foto dari list sebelum upload
  function removeImage(index) {
    const newImages = images.filter((_, i) => i !== index)
    const newPreviews = previewUrls.filter((_, i) => i !== index)
    
    // Revoke URL object untuk bebas memory
    URL.revokeObjectURL(previewUrls[index])
    
    setImages(newImages)
    setPreviewUrls(newPreviews)
  }

  // Upload gambar ke Supabase Storage
  async function uploadImages(productId) {
    const uploadedUrls = []

    for (let i = 0; i < images.length; i++) {
      const file = images[i]
      const fileExt = file.name.split('.').pop()
      const fileName = `${productId}/${Date.now()}-${i}.${fileExt}`

      console.log('🔄 Uploading:', fileName, 'Size:', file.size, 'bytes')

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('❌ Upload error:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
        throw new Error(`Gagal upload ${file.name}: ${error.message}`)
      }

      console.log('✅ Upload success:', data)

      // Dapatkan public URL
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName)

      console.log('📷 Public URL:', urlData.publicUrl)
      uploadedUrls.push(urlData.publicUrl)
    }

    return uploadedUrls
  }

  // Simpan URL foto ke tabel product_images
  async function saveImageUrls(productId, urls) {
    const imageRecords = urls.map((url, index) => ({
      product_id: productId,
      image_url: url,
      is_primary: index === 0, // Foto pertama jadi primary
      sort_order: index,
    }))

    const { error } = await supabase
      .from('product_images')
      .insert(imageRecords)

    if (error) throw error
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Simpan produk dulu
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          name: form.name,
          slug: slugify(form.name) + '-' + Date.now().toString().slice(-4),
          price: Number(form.price),
          discount_price: form.discount_price ? Number(form.discount_price) : null,
          discount_percentage: form.discount_percentage ? Number(form.discount_percentage) : 0,
          stock: Number(form.stock),
          size: form.size,
          material: form.material,
          description: form.description,
          category_id: form.category_id || null,
          is_active: true,
        })
        .select()
        .single()

      if (productError) throw productError

      // 2. Upload foto jika ada
      if (images.length > 0) {
        const uploadedUrls = await uploadImages(product.id)
        await saveImageUrls(product.id, uploadedUrls)
      }

      // Cleanup preview URLs
      previewUrls.forEach((url) => URL.revokeObjectURL(url))

      alert('Produk berhasil disimpan!')
      router.push('/admin/produk')
    } catch (error) {
      console.error('Error:', error)
      alert('Gagal menyimpan: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-8">
      {/* Link Navigasi */}
      <div className="mb-4 flex gap-4 text-sm">
        <Link href="/admin/produk" className="text-blue-600 hover:underline">
          ← Kembali ke Daftar Produk
        </Link>
        <Link href="/" className="text-blue-600 hover:underline">
          Beranda
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-slate-800 mb-6">Tambah Produk Baru</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input required placeholder="Nama Produk" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full border rounded px-3 py-2 text-sm" />

        <input required type="number" placeholder="Harga Jual (Final yang dibayar customer)" value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="w-full border rounded px-3 py-2 text-sm" />

        <input type="number" placeholder="Harga Sebelum Diskon / Harga Coret (Opsional)" value={form.discount_price}
          onChange={(e) => setForm({ ...form, discount_price: e.target.value })}
          className="w-full border rounded px-3 py-2 text-sm" />

        <input type="number" min="0" max="100" placeholder="Label Persentase Diskon (contoh: 20 untuk badge 'DISKON 20%')" value={form.discount_percentage}
          onChange={(e) => setForm({ ...form, discount_percentage: e.target.value })}
          className="w-full border rounded px-3 py-2 text-sm" />

        <input required type="number" placeholder="Stok" value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
          className="w-full border rounded px-3 py-2 text-sm" />

        <input placeholder="Ukuran (misal: 200x100 cm)" value={form.size}
          onChange={(e) => setForm({ ...form, size: e.target.value })}
          className="w-full border rounded px-3 py-2 text-sm" />

        <input placeholder="Material (misal: Besi Hollow 4x4)" value={form.material}
          onChange={(e) => setForm({ ...form, material: e.target.value })}
          className="w-full border rounded px-3 py-2 text-sm" />

        {/* Dropdown Kategori */}
        <select
          value={form.category_id}
          onChange={(e) => setForm({ ...form, category_id: e.target.value })}
          className="w-full border rounded px-3 py-2 text-sm"
        >
          <option value="">-- Pilih Kategori (Opsional) --</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <textarea placeholder="Deskripsi" rows={4} value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full border rounded px-3 py-2 text-sm" />

        {/* Upload Foto Produk */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Foto Produk <span className="text-slate-400">(Opsional, max 2MB per foto)</span>
          </label>
          
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            onChange={handleImageChange}
            className="w-full border rounded px-3 py-2 text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
          />

          {/* Preview Foto */}
          {previewUrls.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-slate-200">
                    <Image
                      src={url}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  {/* Badge "Foto Utama" untuk foto pertama */}
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      Foto Utama
                    </div>
                  )}

                  {/* Tombol Hapus */}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-slate-500">
            Format: JPG, PNG, atau WEBP. Foto pertama akan menjadi foto utama produk.
          </p>
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-slate-800 hover:bg-slate-900 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">
          {loading ? 'Menyimpan...' : 'Simpan Produk'}
        </button>
      </form>
    </main>
  )
}
