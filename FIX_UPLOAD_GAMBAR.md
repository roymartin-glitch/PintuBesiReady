# 🔧 FIX: Upload Gambar Gagal

## ❌ MASALAH
Ketika admin tambah produk dengan upload gambar, muncul error:
```
Gagal menyimpan: Gagal upload [nama-file]
```

## 🔍 PENYEBAB UMUM

### 1. Storage Bucket Belum Dibuat
- Bucket `product-images` belum ada di Supabase Storage

### 2. Storage Policies Salah
- Policies tidak mengizinkan admin untuk upload
- RLS policies terlalu ketat atau tidak ada

### 3. Bucket Bukan Public
- Bucket harus PUBLIC agar gambar bisa diakses

---

## ✅ SOLUSI LENGKAP

### LANGKAH 1: Buat Storage Bucket (Manual di Dashboard)

1. **Buka Supabase Dashboard**
   ```
   https://supabase.com/dashboard
   ```

2. **Pilih Project Anda**

3. **Buka Storage**
   - Klik menu "Storage" di sidebar kiri

4. **Create New Bucket**
   - Klik tombol "New Bucket"
   - **Bucket name**: `product-images` (HARUS PERSIS SAMA)
   - **Public bucket**: ✅ **CENTANG INI** (sangat penting!)
   - Klik "Create bucket"

5. **Verifikasi**
   - Bucket `product-images` muncul di list
   - Ada label "Public" di samping nama bucket

---

### LANGKAH 2: Setup Storage Policies (SQL Editor)

1. **Buka SQL Editor** di Supabase Dashboard

2. **Jalankan Script Ini**:
   ```sql
   -- File: supabase/FIX_STORAGE_POLICIES.sql
   
   -- 1. Create bucket jika belum ada
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('product-images', 'product-images', true)
   ON CONFLICT (id) DO NOTHING;

   -- 2. Drop existing policies
   DROP POLICY IF EXISTS "Public Access untuk melihat gambar" ON storage.objects;
   DROP POLICY IF EXISTS "Admin dapat upload gambar" ON storage.objects;
   DROP POLICY IF EXISTS "Admin dapat update gambar" ON storage.objects;
   DROP POLICY IF EXISTS "Admin dapat delete gambar" ON storage.objects;

   -- 3. Policy PUBLIC READ
   CREATE POLICY "Public Access untuk melihat gambar"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'product-images');

   -- 4. Policy ADMIN UPLOAD
   CREATE POLICY "Admin dapat upload gambar"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'product-images' 
     AND EXISTS (
       SELECT 1 FROM public.profiles 
       WHERE profiles.id = auth.uid() 
       AND profiles.role = 'admin'
     )
   );

   -- 5. Policy ADMIN UPDATE
   CREATE POLICY "Admin dapat update gambar"
   ON storage.objects FOR UPDATE
   USING (
     bucket_id = 'product-images'
     AND EXISTS (
       SELECT 1 FROM public.profiles 
       WHERE profiles.id = auth.uid() 
       AND profiles.role = 'admin'
     )
   )
   WITH CHECK (
     bucket_id = 'product-images'
     AND EXISTS (
       SELECT 1 FROM public.profiles 
       WHERE profiles.id = auth.uid() 
       AND profiles.role = 'admin'
     )
   );

   -- 6. Policy ADMIN DELETE
   CREATE POLICY "Admin dapat delete gambar"
   ON storage.objects FOR DELETE
   USING (
     bucket_id = 'product-images'
     AND EXISTS (
       SELECT 1 FROM public.profiles 
       WHERE profiles.id = auth.uid() 
       AND profiles.role = 'admin'
     )
   );
   ```

3. **Klik "Run"** untuk execute SQL

4. **Verifikasi Policies**:
   ```sql
   SELECT * FROM pg_policies 
   WHERE schemaname = 'storage' 
   AND tablename = 'objects';
   ```

---

### LANGKAH 3: Test Upload Lagi

1. **Refresh Halaman Admin**
   - Tekan `F5` atau `Ctrl + R`

2. **Tambah Produk Baru**
   - Go to: http://localhost:3000/admin/produk/baru

3. **Fill Form & Upload Gambar**
   - Nama: Test Produk
   - Harga: 1000000
   - Stok: 10
   - Upload gambar (max 2MB)

4. **Klik "Simpan Produk"**

5. **Check Console Browser** (F12)
   - Lihat log upload process:
     ```
     🔄 Uploading: [product-id]/[timestamp].jpg
     ✅ Upload success
     📷 Public URL: https://...
     ```

---

## 🔍 DEBUGGING

### Cek di Browser Console (F12)

Buka console dan lihat error details:

```javascript
// Error yang mungkin muncul:
❌ Upload error: {
  message: "new row violates row-level security policy",
  statusCode: "403"
}
```

**Artinya**: RLS policies tidak mengizinkan upload
**Solusi**: Jalankan ulang SQL policies di LANGKAH 2

```javascript
❌ Upload error: {
  message: "Bucket not found",
  statusCode: "404"
}
```

**Artinya**: Bucket `product-images` tidak ada
**Solusi**: Buat bucket di LANGKAH 1

---

## ✅ VERIFIKASI BERHASIL

### 1. Cek Bucket Exists
```sql
SELECT * FROM storage.buckets WHERE id = 'product-images';
```

**Expected Output**:
```
id             | name           | public
product-images | product-images | true
```

### 2. Cek Policies Exists
```sql
SELECT policyname FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%gambar%';
```

**Expected Output**: 4 policies
- Public Access untuk melihat gambar
- Admin dapat upload gambar
- Admin dapat update gambar
- Admin dapat delete gambar

### 3. Test Upload Manual

Di browser console, test upload:
```javascript
// Test upload manual
const { data, error } = await supabase.storage
  .from('product-images')
  .upload('test/test.txt', new Blob(['hello']), {
    cacheControl: '3600',
    upsert: false
  })

console.log('Result:', { data, error })
// Expected: data should have path, error should be null
```

---

## 🎯 CHECKLIST

Sebelum test lagi, pastikan:

- ✅ User sudah login sebagai admin
- ✅ `profiles.role = 'admin'` di database
- ✅ Bucket `product-images` sudah dibuat
- ✅ Bucket setting: **Public = YES**
- ✅ Storage policies sudah dijalankan
- ✅ Browser di-refresh (F5)
- ✅ Console browser terbuka untuk lihat log

---

## 📝 NOTES

### File Size Limit
- Max 2MB per file
- Format: JPG, PNG, WEBP only
- Validasi di frontend & backend

### File Path Format
```
product-images/
  [product-id]/
    [timestamp]-0.jpg
    [timestamp]-1.png
    [timestamp]-2.webp
```

### Public URL Format
```
https://[project-id].supabase.co/storage/v1/object/public/product-images/[product-id]/[filename]
```

---

## 🆘 MASIH GAGAL?

### Check Authentication
```javascript
// Di browser console:
const { data: { session } } = await supabase.auth.getSession()
console.log('User:', session?.user?.email)

const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', session?.user?.id)
  .single()
console.log('Role:', profile?.role)
// Expected: role = 'admin'
```

### Check Bucket Permissions
1. Buka Supabase Dashboard
2. Storage > product-images
3. Klik "Policies" tab
4. Pastikan ada policies untuk INSERT

### Check Network Tab (F12)
1. Buka Network tab
2. Filter: "upload"
3. Klik request yang error
4. Lihat Response tab untuk detail error

---

## ✅ KESIMPULAN

Setelah setup lengkap:
- ✅ Admin bisa upload gambar saat tambah produk
- ✅ Admin bisa upload gambar saat edit produk
- ✅ Admin bisa hapus gambar
- ✅ Public bisa lihat gambar di website
- ✅ User biasa TIDAK bisa upload/delete

**Storage sudah production-ready!** 🚀
