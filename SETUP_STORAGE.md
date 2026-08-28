# Setup Supabase Storage untuk Upload Foto Produk

## Langkah 1: Buat Storage Bucket

1. Buka Supabase Dashboard project Anda
2. Klik menu **Storage** di sidebar kiri
3. Klik tombol **New bucket**
4. Isi detail bucket:
   - **Name**: `product-images`
   - **Public bucket**: ✅ **CENTANG** (agar foto bisa diakses publik)
5. Klik **Create bucket**

## Langkah 2: Setup Storage Policy (RLS)

Setelah bucket dibuat, klik bucket `product-images`, lalu klik tab **Policies**.

Buat 2 policy berikut:

### Policy 1: Public Read Access (Semua orang bisa lihat foto)

```sql
CREATE POLICY "Public Access untuk foto produk"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');
```

**Atau via Dashboard:**
- Target roles: `public`
- Policy command: `SELECT`
- Policy definition: `bucket_id = 'product-images'`

### Policy 2: Admin Upload Access (Hanya admin bisa upload)

```sql
CREATE POLICY "Admin bisa upload foto produk"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

**Atau via Dashboard:**
- Target roles: `authenticated`
- Policy command: `INSERT`
- Policy definition: `bucket_id = 'product-images' AND (EXISTS ( SELECT 1 FROM profiles WHERE ((id = auth.uid()) AND (role = 'admin'))))`

### Policy 3: Admin Delete Access (Hanya admin bisa hapus foto)

```sql
CREATE POLICY "Admin bisa hapus foto produk"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

## Langkah 3: Update next.config.js

Tambahkan domain Supabase Storage ke `images.domains` agar Next.js bisa load gambar dari Supabase:

```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['<PROJECT_REF>.supabase.co'], // ganti <PROJECT_REF> dengan ref project Anda
  },
}
```

Project ref bisa dilihat di URL Supabase project Anda, contoh:
- URL: `https://abcdefghijk.supabase.co`
- Project ref: `abcdefghijk`

## Selesai!

Setelah langkah-langkah di atas selesai, fitur upload foto produk akan berfungsi.
