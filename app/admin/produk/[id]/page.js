'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  
  const [form, setForm] = useState({
    name: '', price: '', discount_price: '', discount_percentage: '', stock: '', size: '', material: '', description: '', category_id: ''
  })
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  
  // Foto yang sudah ada di database
  const [existingImages, setExistingImages] = useState([])
  const [imagesToDelete, setImagesToDelete] = useState([])
  
  // Foto baru yang akan diupload
  const [newImages, setNewImages] = useState([])
  const [newPreviewUrls, setNewPreviewUrls] = useState([])
  
  // Kategori untuk dropdown
  const [categories, setCategories] = useState([])

  // Fetch data produk saat halaman load
  useEffect(() => {
    async function fetchProduct() {
      setLoadingData(true)

      // Fetch produk
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('*, product_images(*)')
        .eq('id', params.id)
        .single()

      if (productError || !product) {
        alert('Produk tidak ditemukan')
        router.push('/admin/produk')
        return
      }

      // Set form data
      setForm({
        name: product.name || '',
        price: product.price || '',
        discount_price: product.discount_price || '',
        discount_percentage: product.discount_percentage || '',
        stock: product.stock || '',
        size: product.size || '',
        material: product.material || '',
        description: product.description || '',
        category_id: product.category_id || '',
      })

      // Set existing images
      setExistingImages(product.product_images || [])

      // Fetch categories
      const { data: cats } = await supabase
        .from('categories')
        .select('id, name')
        .order('name')

      setCategories(cats || [])
      setLoadingData(false)
    }

    fetchProduct()
  }, [params.id, router, supabase])

  // Handle new image selection
  function handleNewImageChange(e) {
    const files = Array.from(e.target.files)
    const validImages = []
    const validPreviews = []

    files.forEach((file) => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!validTypes.includes(file.type)) {
        alert(`File ${file.name} bukan format gambar yang valid. Gunakan JPG, PNG, atau WEBP.`)
        return
      }

      const maxSize = 2 * 1024 * 1024
      if (file.size > maxSize) {
        alert(`File ${file.name} terlalu besar. Maksimal 2MB per foto.`)
        return
      }

      validImages.push(file)
      validPreviews.push(URL.createObjectURL(file))
    })

    if (validImages.length > 0) {
      setNewImages([...newImages, ...validImages])
      setNewPreviewUrls([...newPreviewUrls, ...validPreviews])
    }
  }

  // Hapus foto baru dari preview
  function removeNewImage(index) {
    const filtered = newImages.filter((_, i) => i !== index)
    const filteredPreviews = newPreviewUrls.filter((_, i) => i !== index)
    URL.revokeObjectURL(newPreviewUrls[index])
    setNewImages(filtered)
    setNewPreviewUrls(filteredPreviews)
  }

  // Tandai foto existing untuk dihapus
  function markExistingImageForDelete(imageId, imageUrl) {
    setImagesToDelete([...imagesToDelete, { id: imageId, url: imageUrl }])
    setExistingImages(existingImages.filter((img) => img.id !== imageId))
  }

  // Upload foto baru ke Storage
  async function uploadNewImages(productId) {
    const uploadedUrls = []

    for (let i = 0; i < newImages.length; i++) {
      const file = newImages[i]
      const fileExt = file.name.split('.').pop()
      const fileName = `${productId}/${Date.now()}-${i}.${fileExt}`

      const { error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file)

      if (error) {
        console.error('Error upload:', error)
        throw new Error(`Gagal upload ${file.name}`)
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName)

      uploadedUrls.push(publicUrl)
    }

    return uploadedUrls
  }

  // Simpan URL foto baru ke database
  async function saveNewImageUrls(productId, urls) {
    // Cek berapa foto yang sudah ada
    const currentCount = existingImages.length

    const imageRecords = urls.map((url, index) => ({
      product_id: productId,
      image_url: url,
      is_primary: currentCount === 0 && index === 0, // Jadi primary hanya jika tidak ada foto lain
      sort_order: currentCount + index,
    }))

    const { error } = await supabase
      .from('product_images')
      .insert(imageRecords)

    if (error) throw error
  }

  // Hapus foto dari Storage dan database
  async function deleteMarkedImages() {
    for (const img of imagesToDelete) {
      // Hapus dari database
      await supabase.from('product_images').delete().eq('id', img.id)

      // Hapus dari Storage (extract path dari URL)
      try {
        const urlPath = new URL(img.url).pathname
        const filePath = urlPath.split('/storage/v1/object/public/product-images/')[1]
        
        if (filePath) {
          await supabase.storage.from('product-images').remove([filePath])
        }
      } catch (error) {
        console.error('Error deleting from storage:', error)
      }
    }
  }

  // Submit form
  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Update data produk
      const { error: updateError } = await supabase
        .from('products')
        .update({
          name: form.name,
          price: Number(form.price),
          discount_price: form.discount_price ? Number(form.discount_price) : null,
          discount_percentage: form.discount_percentage ? Number(form.discount_percentage) : 0,
          stock: Number(form.stock),
          size: form.size,
          material: form.material,
          description: form.description,
          category_id: form.category_id || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.id)

      if (updateError) throw updateError

      // 2. Hapus foto yang ditandai
      if (imagesToDelete.length > 0) {
        await deleteMarkedImages()
      }

      // 3. Upload dan simpan foto baru
      if (newImages.length > 0) {
        const uploadedUrls = await uploadNewImages(params.id)
        await saveNewImageUrls(params.id, uploadedUrls)
      }

      // Cleanup preview URLs
      newPreviewUrls.forEach((url) => URL.revokeObjectURL(url))

      alert('Produk berhasil diupdate!')
      router.push('/admin/produk')
    } catch (error) {
      console.error('Error:', error)
      alert('Gagal update produk: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <main className="max-w-xl mx-auto px-4 py-8">
        <p className="text-center text-slate-500">Memuat data produk...</p>
      </main>
    )
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

      <h1 className="text-2xl font-bold text-slate-800 mb-6">Edit Produk</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          required
          placeholder="Nama Produk"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full border rounded px-3 py-2 text-sm"
        />

        <input
          required
          type="number"
          placeholder="Harga Jual (Final)"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="w-full border rounded px-3 py-2 text-sm"
        />

        <input
          type="number"
          placeholder="Harga Sebelum Diskon (Harga Coret)"
          value={form.discount_price}
          onChange={(e) => setForm({ ...form, discount_price: e.target.value })}
          className="w-full border rounded px-3 py-2 text-sm"
        />

        <input
          type="number"
          min="0"
          max="100"
          placeholder="Label Persentase Diskon (contoh: 20)"
          value={form.discount_percentage}
          onChange={(e) => setForm({ ...form, discount_percentage: e.target.value })}
          className="w-full border rounded px-3 py-2 text-sm"
        />

        <input
          required
          type="number"
          placeholder="Stok"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
          className="w-full border rounded px-3 py-2 text-sm"
        />

        <input
          placeholder="Ukuran (misal: 200x100 cm)"
          value={form.size}
          onChange={(e) => setForm({ ...form, size: e.target.value })}
          className="w-full border rounded px-3 py-2 text-sm"
        />

        <input
          placeholder="Material (misal: Besi Hollow 4x4)"
          value={form.material}
          onChange={(e) => setForm({ ...form, material: e.target.value })}
          className="w-full border rounded px-3 py-2 text-sm"
        />

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

        <textarea
          placeholder="Deskripsi"
          rows={4}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full border rounded px-3 py-2 text-sm"
        />

        {/* Foto yang Sudah Ada */}
        {existingImages.length > 0 && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Foto Saat Ini
            </label>
            <div className="grid grid-cols-2 gap-3">
              {existingImages.map((img, index) => (
                <div key={img.id} className="relative group">
                  <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-slate-200">
                    <Image src={img.image_url} alt={`Foto ${index + 1}`} fill className="object-cover" />
                  </div>

                  {img.is_primary && (
                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      Foto Utama
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => markExistingImageForDelete(img.id, img.image_url)}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Foto Baru */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Tambah Foto Baru <span className="text-slate-400">(Opsional, max 2MB per foto)</span>
          </label>

          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            onChange={handleNewImageChange}
            className="w-full border rounded px-3 py-2 text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
          />

          {/* Preview Foto Baru */}
          {newPreviewUrls.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              {newPreviewUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-green-200">
                    <Image src={url} alt={`Preview ${index + 1}`} fill className="object-cover" />
                  </div>

                  <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                    Baru
                  </div>

                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
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
            Format: JPG, PNG, atau WEBP. Foto baru akan ditambahkan setelah foto yang sudah ada.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-800 hover:bg-slate-900 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </form>
    </main>
  )
}
