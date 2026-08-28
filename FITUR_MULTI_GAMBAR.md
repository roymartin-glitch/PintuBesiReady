# 📸 FITUR MULTI GAMBAR PRODUK

## ✅ STATUS: SUDAH TERIMPLEMENTASI LENGKAP

Sistem Anda **sudah mendukung** upload dan display beberapa foto dalam 1 produk!

---

## 🎯 FITUR YANG SUDAH ADA

### 1️⃣ ADMIN - UPLOAD MULTIPLE IMAGES

#### Lokasi: `/admin/produk/baru` (Tambah Produk)

**Fitur yang tersedia:**
- ✅ Upload **multiple files** sekaligus (banyak foto dalam 1x pilih)
- ✅ Preview semua foto yang dipilih dalam **grid 2 kolom**
- ✅ **Foto pertama = Foto Utama** (primary) dengan badge biru
- ✅ Hapus foto individual sebelum save dengan tombol ❌
- ✅ Validasi format: JPG, PNG, WEBP
- ✅ Validasi ukuran: Max 2MB per foto
- ✅ Hover effect untuk show tombol hapus

**Cara Kerja:**
```javascript
// 1. User pilih multiple files
<input type="file" accept="image/*" multiple />

// 2. Validasi & preview
images = [file1, file2, file3, ...]
previewUrls = [url1, url2, url3, ...]

// 3. Upload ke Supabase Storage
for (let i = 0; i < images.length; i++) {
  upload to: product-images/[product-id]/[timestamp]-[i].jpg
}

// 4. Simpan URLs ke database
INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
// Foto pertama: is_primary = true
// Foto lainnya: is_primary = false
```

**Struktur File di Storage:**
```
product-images/
  ├── [product-id-1]/
  │   ├── 1703123456789-0.jpg  ← Foto Utama (primary)
  │   ├── 1703123456789-1.jpg
  │   ├── 1703123456789-2.jpg
  │   └── 1703123456789-3.jpg
  ├── [product-id-2]/
  │   ├── 1703123499999-0.png
  │   └── 1703123499999-1.webp
  └── ...
```

---

### 2️⃣ CUSTOMER - GALLERY INTERAKTIF

#### Lokasi: `/produk/[slug]` (Detail Produk)

**Fitur yang tersedia:**
- ✅ **Main Display**: Foto besar aktif (aspect-square)
- ✅ **Thumbnail Row**: Semua foto ditampilkan di bawah
- ✅ **Click to Switch**: Klik thumbnail → ganti main image
- ✅ **Active Indicator**: Border hitam pada thumbnail aktif
- ✅ **Hover Effects**: Border abu saat hover pada thumbnail
- ✅ **Responsive**: Scroll horizontal untuk banyak thumbnail
- ✅ **Primary First**: Foto utama tampil pertama kali

**UI Component: `ProductGallery`**
```jsx
<ProductGallery images={product.product_images} name={product.name} />

// Output:
// ┌─────────────────────┐
// │                     │
// │   MAIN IMAGE        │  ← Foto besar aktif
// │   (Active)          │
// │                     │
// └─────────────────────┘
// ┌───┐ ┌───┐ ┌───┐ ┌───┐
// │ 1 │ │ 2 │ │ 3 │ │ 4 │  ← Thumbnails (80x80px)
// └───┘ └───┘ └───┘ └───┘
```

---

### 3️⃣ DATABASE STRUCTURE

**Tabel: `product_images`**
```sql
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,  -- Foto utama
  sort_order INT DEFAULT 0,           -- Urutan tampil
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1 produk bisa punya banyak gambar (1-to-many)
-- Hanya 1 foto yang is_primary = true per produk
```

**Contoh Data:**
```
product_id           | image_url                                    | is_primary | sort_order
---------------------|----------------------------------------------|------------|------------
123-abc-456          | https://.../123-abc-456/1703123456-0.jpg     | true       | 0
123-abc-456          | https://.../123-abc-456/1703123456-1.jpg     | false      | 1
123-abc-456          | https://.../123-abc-456/1703123456-2.jpg     | false      | 2
789-def-012          | https://.../789-def-012/1703123999-0.png     | true       | 0
```

---

## 🚀 CARA MENGGUNAKAN

### A. ADMIN - Tambah Produk dengan Beberapa Foto

1. **Login sebagai Admin**
   ```
   http://localhost:3000/admin/login
   Email: roy.martin@student.tau.ac.id
   ```

2. **Buka Halaman Tambah Produk**
   ```
   http://localhost:3000/admin/produk/baru
   ```

3. **Isi Form Produk**
   - Nama: "Pintu Besi Minimalis Modern"
   - Harga: 5000000
   - Stok: 10
   - dll.

4. **Upload Multiple Images**
   - Klik area "Foto Produk"
   - Pilih **multiple files** (Ctrl+Click atau Shift+Click)
   - Atau drag & drop beberapa file sekaligus
   - Max 2MB per foto

5. **Preview & Manage**
   - Lihat preview grid 2 kolom
   - Foto pertama = badge "Foto Utama"
   - Hover foto → muncul tombol ❌ untuk hapus
   - Bisa tambah lagi dengan klik input file lagi

6. **Simpan Produk**
   - Klik "Simpan Produk"
   - Sistem akan:
     1. Simpan data produk ke `products` table
     2. Upload semua foto ke Supabase Storage
     3. Simpan URLs ke `product_images` table
     4. Set foto pertama sebagai `is_primary = true`

7. **Success!**
   - Redirect ke `/admin/produk`
   - Produk muncul dengan foto utama sebagai thumbnail

---

### B. CUSTOMER - Lihat Gallery Produk

1. **Buka Halaman Produk**
   ```
   http://localhost:3000/produk/[slug-produk]
   ```

2. **Lihat Main Image**
   - Foto utama (primary) tampil besar di atas

3. **Switch Image**
   - Klik thumbnail di bawah
   - Main image berubah instant
   - Border hitam pada thumbnail aktif

4. **Scroll Thumbnails**
   - Jika banyak foto, scroll horizontal
   - Responsive di mobile

---

## 📋 CHECKLIST IMPLEMENTASI

### ✅ Backend/Database
- [x] Tabel `product_images` dengan relasi ke `products`
- [x] Column `is_primary` untuk foto utama
- [x] Column `sort_order` untuk urutan
- [x] Supabase Storage bucket `product-images`
- [x] RLS Policies untuk admin upload & public read

### ✅ Admin Panel - Upload
- [x] Input file dengan `multiple` attribute
- [x] Validasi format file (JPG, PNG, WEBP)
- [x] Validasi ukuran file (max 2MB)
- [x] Preview grid dengan Image component
- [x] Remove image sebelum upload
- [x] Badge "Foto Utama" untuk foto pertama
- [x] Upload semua foto ke Storage
- [x] Save URLs ke `product_images` table
- [x] Set `is_primary = true` untuk foto pertama

### ✅ Admin Panel - Display
- [x] Show primary image di list produk
- [x] Thumbnail di tabel admin produk

### ✅ Customer View - Gallery
- [x] Component `ProductGallery` terpisah
- [x] Main image display (aspect-square)
- [x] Thumbnail row di bawah
- [x] Click thumbnail → switch main image
- [x] Active state dengan border
- [x] Hover effects
- [x] Responsive horizontal scroll
- [x] Primary image tampil pertama

### ✅ UX/UI
- [x] Smooth transitions
- [x] Loading states
- [x] Error handling
- [x] Mobile responsive
- [x] Accessibility (alt text)

---

## 🎨 SCREENSHOT REFERENCE

### Admin - Upload Page
```
┌──────────────────────────────────────────┐
│  TAMBAH PRODUK BARU                      │
├──────────────────────────────────────────┤
│  Nama: [Pintu Besi Minimalis Modern]    │
│  Harga: [5000000]                        │
│  ...                                      │
│                                           │
│  Foto Produk: [Pilih File] [Multiple OK] │
│                                           │
│  PREVIEW:                                 │
│  ┌─────────┐  ┌─────────┐               │
│  │  IMG 1  │  │  IMG 2  │               │
│  │  🔵Utama│  │    ❌   │               │
│  └─────────┘  └─────────┘               │
│  ┌─────────┐  ┌─────────┐               │
│  │  IMG 3  │  │  IMG 4  │               │
│  │    ❌   │  │    ❌   │               │
│  └─────────┘  └─────────┘               │
│                                           │
│  [Simpan Produk]                         │
└──────────────────────────────────────────┘
```

### Customer - Product Gallery
```
┌────────────────────────────────────┐
│                                    │
│         MAIN IMAGE DISPLAY         │
│         (Click to enlarge)         │
│                                    │
└────────────────────────────────────┘
┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐
│ 🖼️ │ │    │ │    │ │    │ │    │
│ 📌 │ │    │ │    │ │    │ │    │  ← Thumbnails
└────┘ └────┘ └────┘ └────┘ └────┘
  ↑
Active (border hitam)
```

---

## 🔧 TROUBLESHOOTING

### ❌ Problem: Upload Gagal

**Symptom:** Error "Gagal upload [filename]"

**Solution:**
1. Pastikan bucket `product-images` sudah dibuat:
   ```
   Supabase Dashboard → Storage → Create Bucket
   Name: product-images
   Public: ✅ YES (MUST!)
   ```

2. Jalankan storage policies:
   ```sql
   -- Run: supabase/FIX_STORAGE_POLICIES.sql
   ```

3. Cek dokumentasi: `FIX_UPLOAD_GAMBAR.md`

---

### ❌ Problem: Gambar Tidak Tampil

**Symptom:** Broken image icon atau blank

**Check:**
1. **Bucket is Public?**
   ```sql
   SELECT * FROM storage.buckets WHERE id = 'product-images';
   -- public column must be TRUE
   ```

2. **URLs tersimpan dengan benar?**
   ```sql
   SELECT * FROM product_images WHERE product_id = '[your-product-id]';
   -- Check image_url format
   ```

3. **RLS Policies untuk SELECT?**
   ```sql
   -- Public harus bisa SELECT
   SELECT * FROM pg_policies 
   WHERE schemaname = 'storage' 
   AND policyname LIKE '%melihat gambar%';
   ```

---

### ❌ Problem: Thumbnail Tidak Muncul

**Symptom:** Main image OK, tapi thumbnails tidak muncul

**Check:**
```jsx
// ProductGallery.js - pastikan kondisi ini:
{images && images.length > 1 && (
  <div className="flex gap-3">
    {images.map(...)}
  </div>
)}

// Artinya: thumbnails hanya muncul jika ada > 1 foto
// Jika hanya 1 foto, tidak ada thumbnails (expected behavior)
```

---

## 💡 TIPS & BEST PRACTICES

### 1. Foto Optimal
- **Resolusi**: 1000x1000px atau 1200x1200px (square)
- **Format**: WEBP (ukuran kecil) > JPG > PNG
- **Ukuran File**: 200KB - 500KB per foto (compress sebelum upload)
- **Jumlah**: 3-5 foto per produk (optimal)

### 2. Urutan Foto
- **Foto 1**: Full view produk (jadi foto utama)
- **Foto 2-3**: Detail closeup (material, finishing, dll)
- **Foto 4-5**: Variasi angle atau aplikasi real

### 3. Naming Convention
- Storage: `[product-id]/[timestamp]-[index].[ext]`
- Automatic: Tidak perlu manual naming

### 4. Delete Produk
- **Cascade Delete**: Saat hapus produk, foto AUTO terhapus dari database
- **Storage Manual**: Files di Storage TIDAK auto terhapus (manual cleanup)

---

## 🔮 FUTURE ENHANCEMENTS (Optional)

### 1. Drag & Reorder Photos
```jsx
// Drag to change primary image or sort order
import { DndContext } from '@dnd-kit/core'
```

### 2. Image Compression
```jsx
// Auto compress before upload
import imageCompression from 'browser-image-compression'

async function compressImage(file) {
  const options = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1200
  }
  return await imageCompression(file, options)
}
```

### 3. Zoom on Click
```jsx
// Lightbox gallery
import Lightbox from 'yet-another-react-lightbox'
```

### 4. Edit Mode
- Tambah foto baru ke produk existing
- Hapus foto individual dari produk
- Change primary photo
- Reorder photos

---

## 📊 SUMMARY

| Fitur | Status | Lokasi File |
|-------|--------|-------------|
| Upload Multiple Files | ✅ Done | `/app/admin/produk/baru/page.js` |
| Preview Grid | ✅ Done | `/app/admin/produk/baru/page.js` |
| Remove Before Save | ✅ Done | `/app/admin/produk/baru/page.js` |
| Primary Photo Badge | ✅ Done | `/app/admin/produk/baru/page.js` |
| Storage Upload | ✅ Done | `/app/admin/produk/baru/page.js` |
| Database Insert | ✅ Done | `/app/admin/produk/baru/page.js` |
| Gallery Component | ✅ Done | `/components/ProductGallery.js` |
| Thumbnail Switching | ✅ Done | `/components/ProductGallery.js` |
| Product Detail Page | ✅ Done | `/app/produk/[slug]/page.js` |

---

## ✅ KESIMPULAN

**Sistem multi gambar produk Anda SUDAH LENGKAP dan PRODUCTION READY!**

Tinggal pastikan:
1. ✅ Storage bucket `product-images` sudah dibuat (public)
2. ✅ Storage policies sudah dijalankan
3. ✅ Test upload di `/admin/produk/baru`
4. ✅ Test gallery di `/produk/[slug]`

**Happy Uploading! 📸🚀**
