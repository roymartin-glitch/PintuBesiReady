# 📱 FLOW PEMESANAN VIA WHATSAPP

## ✅ STATUS: SUDAH TERIMPLEMENTASI LENGKAP!

Sistem Anda **sudah mengikuti konsep** yang diminta dengan sempurna:

```
Customer browse katalog di web
            ↓
Klik produk → lihat detail
            ↓
Klik "Pesan via WhatsApp"
            ↓
Otomatis buka WA dengan pesan template terisi
(nama produk, ukuran, harga, jumlah)
            ↓
Customer tinggal edit/tambah info & send
```

---

## 🎯 ALUR LENGKAP CUSTOMER JOURNEY

### 1️⃣ STEP 1: BROWSE KATALOG

**Lokasi:** http://localhost:3000 atau http://localhost:3000/produk

**Customer bisa:**
- ✅ Lihat semua produk di homepage (8 produk terbaru)
- ✅ Klik "Jelajahi Katalog" → masuk ke halaman katalog lengkap
- ✅ Filter by kategori (Pintu Garasi, Pagar, Teralis, dll)
- ✅ Sort by harga (Terendah/Tertinggi/Terbaru)
- ✅ Filter "Ready Stock" only
- ✅ Search produk by nama

**UI Katalog:**
```
┌─────────────────────────────────────────┐
│  KATALOG PRODUK PINTU BESI              │
├─────────────────────────────────────────┤
│ Filter:                                  │
│ [📂 Kategori] [🔃 Sort] [📦 Stock]      │
├─────────────────────────────────────────┤
│ ┌────────┐ ┌────────┐ ┌────────┐       │
│ │ Pintu  │ │ Pagar  │ │ Teralis│       │
│ │ Garasi │ │ Besi   │ │ Jendela│       │
│ │        │ │        │ │        │       │
│ │ Foto   │ │ Foto   │ │ Foto   │       │
│ │        │ │        │ │        │       │
│ │ Rp 7.5M│ │ Rp 5M  │ │ Rp 1.5M│       │
│ └────────┘ └────────┘ └────────┘       │
└─────────────────────────────────────────┘
```

---

### 2️⃣ STEP 2: KLIK PRODUK → LIHAT DETAIL

**Lokasi:** http://localhost:3000/produk/[slug-produk]

**Customer bisa:**
- ✅ Lihat foto besar (main image)
- ✅ Klik thumbnail → ganti main image (jika ada multiple photos)
- ✅ Lihat harga lengkap (harga coret + diskon badge)
- ✅ Lihat spesifikasi detail:
  - Dimensi ukuran
  - Material besi
  - Status stock
- ✅ Baca deskripsi lengkap
- ✅ Pilih jumlah unit (qty selector)
- ✅ Lihat produk rekomendasi terkait

**UI Detail Produk:**
```
┌───────────────────────────────────────────────────┐
│  PINTU GARASI LIPAT BESI HOLLOW PREMIUM          │
├───────────────────────────────────────────────────┤
│ ┌──────────────┐  ┌───────────────────────────┐ │
│ │              │  │ Harga: Rp 7.500.000       │ │
│ │  MAIN IMAGE  │  │ ~~Rp 8.500.000~~ -12%     │ │
│ │  (Gallery)   │  │                            │ │
│ │              │  │ Spesifikasi:               │ │
│ │              │  │ • Ukuran: 200x100 cm      │ │
│ │              │  │ • Material: Besi Hollow   │ │
│ └──────────────┘  │ • Stock: Ready (5 unit)   │ │
│ [🖼️][🖼️][🖼️][🖼️] │                            │ │
│  Thumbnails      │ Jumlah: [-] 1 [+]         │ │
│                   │                            │ │
│                   │ [Tambah ke Keranjang]     │ │
│                   │ [📱 Pesan via WhatsApp]  │ │
│                   └───────────────────────────┘ │
└───────────────────────────────────────────────────┘
```

---

### 3️⃣ STEP 3: KLIK "PESAN VIA WHATSAPP"

**Component:** `OrderActions.js`

**Yang Terjadi:**
1. ✅ Sistem ambil data produk (nama, harga, ukuran, material)
2. ✅ Sistem ambil quantity yang dipilih customer
3. ✅ Sistem hitung total harga otomatis
4. ✅ Sistem generate template message WhatsApp
5. ✅ Sistem buka WhatsApp di tab baru dengan message pre-filled

**Tombol:**
```jsx
<button
  onClick={handleWhatsAppOrder}
  className="bg-green-600 text-white py-3 px-6 rounded-2xl font-bold flex items-center gap-2"
>
  <svg>📱</svg>
  Pesan via WhatsApp
</button>
```

---

### 4️⃣ STEP 4: WHATSAPP TERBUKA DENGAN TEMPLATE

**Template Message yang Auto Terisi:**

```
Halo, saya mau pesan:

*Pintu Garasi Lipat Besi Hollow Premium*
Jumlah: 2 unit
Harga satuan: Rp 7.500.000
Total: Rp 15.000.000
Ukuran: 200x100 cm
Material: Besi Hollow 4x4

Mohon info ketersediaan dan detail pengirimannya. Terima kasih.
```

**URL WhatsApp yang Di-generate:**
```javascript
const message = `Halo, saya mau pesan:

*${product.name}*
Jumlah: ${qty} unit
Harga satuan: Rp ${Number(product.price).toLocaleString('id-ID')}
Total: Rp ${(product.price * qty).toLocaleString('id-ID')}
Ukuran: ${product.size || '-'}
Material: ${product.material || '-'}

Mohon info ketersediaan dan detail pengirimannya. Terima kasih.`

const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`
window.open(url, '_blank')
```

---

### 5️⃣ STEP 5: CUSTOMER EDIT & KIRIM

**Customer bisa:**
- ✅ Edit template sesuai kebutuhan
- ✅ Tambah info alamat pengiriman
- ✅ Tanya custom request (warna, ukuran, dll)
- ✅ Upload foto referensi desain
- ✅ Langsung chat dengan admin/sales

**Contoh Edit Customer:**
```
Halo, saya mau pesan:

*Pintu Garasi Lipat Besi Hollow Premium*
Jumlah: 2 unit
Harga satuan: Rp 7.500.000
Total: Rp 15.000.000
Ukuran: 200x100 cm
Material: Besi Hollow 4x4

[CUSTOMER TAMBAHKAN:]
Alamat: Jl. Kenanga No. 45, Jakarta Selatan
Request: Cat warna hitam doff + handle kuningan
Jadwal survey: Senin pagi (9-11)

Mohon info ketersediaan dan detail pengirimannya. Terima kasih.
```

---

## 🔧 KONFIGURASI NOMOR WHATSAPP

**File:** `.env.local`

```env
NEXT_PUBLIC_WA_NUMBER=6281331941357
```

**Format:**
- ✅ Harus pakai kode negara (62 untuk Indonesia)
- ✅ Tanpa tanda + di depan
- ✅ Nomor 08xxx jadi 628xxx

**Contoh:**
```
❌ SALAH: +62 813-3194-1357
❌ SALAH: 0813-3194-1357
✅ BENAR: 6281331941357
```

---

## 📊 FLOW DIAGRAM LENGKAP

```
┌─────────────────────────────────────────────────┐
│             CUSTOMER JOURNEY                     │
└─────────────────────────────────────────────────┘

1. HOMEPAGE / KATALOG
   ┌──────────────────┐
   │ Browse Produk    │
   │ • Filter         │
   │ • Search         │
   │ • Sort           │
   └────────┬─────────┘
            ↓
            
2. KLIK PRODUK
   ┌──────────────────┐
   │ Detail Produk    │
   │ • Foto Gallery   │
   │ • Spesifikasi    │
   │ • Harga          │
   │ • Stock          │
   │ • Qty Selector   │
   └────────┬─────────┘
            ↓
            
3. PILIH JUMLAH & KLIK BUTTON
   ┌──────────────────┐
   │ [-] 2 [+]        │
   │                  │
   │ [Keranjang] ← Optional (checkout di web)
   │                  │
   │ [📱 WhatsApp] ← KLIK INI!
   └────────┬─────────┘
            ↓
            
4. WHATSAPP TERBUKA
   ┌──────────────────────────────────┐
   │ WhatsApp Chat                    │
   │                                  │
   │ To: +62 813-3194-1357           │
   │                                  │
   │ Message:                         │
   │ ┌──────────────────────────────┐│
   │ │ Halo, saya mau pesan:        ││
   │ │                              ││
   │ │ *Pintu Garasi ...*           ││
   │ │ Jumlah: 2 unit               ││
   │ │ Harga satuan: Rp 7.500.000  ││
   │ │ Total: Rp 15.000.000        ││
   │ │ Ukuran: 200x100 cm          ││
   │ │ Material: Besi Hollow       ││
   │ │                              ││
   │ │ [Customer edit di sini]     ││
   │ │                              ││
   │ │ Mohon info ketersediaan...  ││
   │ └──────────────────────────────┘│
   │                                  │
   │         [SEND MESSAGE] ←         │
   └──────────────────────────────────┘
            ↓
            
5. ADMIN TERIMA CHAT
   ┌──────────────────┐
   │ Admin WhatsApp   │
   │ • Balas inquiry  │
   │ • Nego harga     │
   │ • Schedule survey│
   │ • Confirm order  │
   └──────────────────┘
```

---

## 🎨 UI COMPONENTS YANG TERLIBAT

### 1. Catalog Cards (`/produk`)
```jsx
<Link href={`/produk/${product.slug}`}>
  <div className="product-card">
    <img src={primaryImage} />
    <h3>{product.name}</h3>
    <p>Rp {price}</p>
    <span>{stock > 0 ? 'Ready' : 'Habis'}</span>
  </div>
</Link>
```

### 2. Product Gallery (`/produk/[slug]`)
```jsx
<ProductGallery images={product.product_images} name={product.name} />
// → Main image + thumbnails yang bisa diklik
```

### 3. Order Actions Button (`OrderActions.js`)
```jsx
<button onClick={handleWhatsAppOrder}>
  📱 Pesan via WhatsApp
</button>

function handleWhatsAppOrder() {
  const message = `...template...`
  const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`
  window.open(url, '_blank')
}
```

---

## 🔥 FITUR BONUS YANG SUDAH ADA

### A. Tambah ke Keranjang
Customer juga bisa:
- ✅ Tambah produk ke keranjang
- ✅ Lanjut belanja (multi-product)
- ✅ Checkout via web (form lengkap)
- ✅ Generate invoice otomatis

**Flow Alternatif:**
```
Pilih produk → Tambah ke keranjang → Lanjut belanja
→ Buka keranjang → Checkout → Isi form → Simpan pesanan
→ Admin lihat di `/admin/pesanan`
```

### B. WhatsApp dari Homepage
```jsx
<a href={`https://wa.me/${waNumber}?text=Halo...`}>
  Konsultasi Gratis
</a>
```

### C. WhatsApp dari Navbar
```jsx
// Navbar.js - Link kontak
<a href={`https://wa.me/${waNumber}`}>
  📱 WhatsApp
</a>
```

---

## 📱 TESTING CHECKLIST

### ✅ Test Flow Lengkap

**1. Test Browse & Filter**
```
□ Buka http://localhost:3000
□ Klik "Jelajahi Katalog"
□ Test filter kategori
□ Test sort harga
□ Test search produk
□ Klik salah satu produk
```

**2. Test Product Detail**
```
□ Lihat foto gallery (klik thumbnails)
□ Baca spesifikasi lengkap
□ Ubah quantity (+ dan -)
□ Check harga total berubah
```

**3. Test WhatsApp Button**
```
□ Klik "Pesan via WhatsApp"
□ WhatsApp terbuka di tab baru
□ Check message template terisi lengkap:
  ✓ Nama produk (bold)
  ✓ Jumlah unit
  ✓ Harga satuan (format Rp xxx.xxx)
  ✓ Total harga (qty × harga)
  ✓ Ukuran produk
  ✓ Material produk
  ✓ Pesan penutup
□ Nomor tujuan benar (6281331941357)
```

**4. Test Edit & Send**
```
□ Edit message template
□ Tambah alamat/request custom
□ Klik "Send" di WhatsApp
□ Admin terima chat
```

---

## 💡 TIPS OPTIMASI

### 1. Custom Message per Kategori

Tambah kondisi di `handleWhatsAppOrder()`:

```javascript
function handleWhatsAppOrder() {
  let message = `Halo, saya mau pesan:\n\n*${product.name}*\n`
  
  // Custom untuk Pintu Garasi
  if (product.category?.slug === 'pintu-garasi') {
    message += `\n📍 Request Survey Lokasi: [isi alamat]\n`
    message += `📝 Custom Request: [warna, model, dll]\n`
  }
  
  // Custom untuk Teralis
  if (product.category?.slug === 'teralis') {
    message += `\n📐 Jumlah Jendela: [isi jumlah]\n`
    message += `📏 Ukuran per Jendela: [isi ukuran]\n`
  }
  
  message += `\nJumlah: ${qty} unit\n...`
  
  const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`
  window.open(url, '_blank')
}
```

### 2. Tracking Analytics

Track berapa customer klik WhatsApp button:

```javascript
function handleWhatsAppOrder() {
  // Track click event
  if (typeof gtag !== 'undefined') {
    gtag('event', 'whatsapp_order_click', {
      product_name: product.name,
      product_price: product.price,
      quantity: qty
    })
  }
  
  // Generate & open WA
  const message = `...`
  window.open(url, '_blank')
}
```

### 3. Multiple Contact Numbers

Untuk different departments:

```javascript
// .env.local
NEXT_PUBLIC_WA_SALES=6281331941357
NEXT_PUBLIC_WA_CS=6281234567890
NEXT_PUBLIC_WA_TECH=6281987654321

// OrderActions.js
const waNumber = product.stock > 0 
  ? process.env.NEXT_PUBLIC_WA_SALES  // Stock ready → Sales
  : process.env.NEXT_PUBLIC_WA_CS     // Stock habis → CS
```

---

## 🐛 TROUBLESHOOTING

### ❌ WhatsApp Tidak Terbuka

**Check:**
1. Format nomor WA di `.env.local` benar?
   ```
   NEXT_PUBLIC_WA_NUMBER=6281331941357  ← NO SPACES!
   ```

2. Browser block popup?
   - Allow popup untuk localhost
   - Test di browser berbeda

3. Message terlalu panjang?
   - Max ~2000 characters
   - Simplify template jika perlu

### ❌ Message Template Tidak Muncul

**Check:**
1. Data produk lengkap di database?
   ```sql
   SELECT name, price, size, material FROM products WHERE slug = '...';
   ```

2. Encoding URL benar?
   ```javascript
   encodeURIComponent(message)  // MUST USE THIS
   ```

### ❌ Quantity Tidak Ter-include

**Check:**
```javascript
// OrderActions.js - line ~12
const [qty, setQty] = useState(1)  // Default 1

// line ~16
function handleWhatsAppOrder() {
  const message = `...Jumlah: ${qty} unit...`  // Make sure ${qty} here
}
```

---

## ✅ KESIMPULAN

**Flow WhatsApp ordering Anda SUDAH PERFECT mengikuti konsep:**

```
✅ Customer browse katalog
✅ Klik produk → detail lengkap
✅ Klik "Pesan via WhatsApp"
✅ WhatsApp buka dengan template terisi otomatis
✅ Customer tinggal edit & send
```

**File-file terkait:**
- `/app/page.js` - Homepage dengan showcase
- `/app/produk/page.js` - Katalog lengkap dengan filter
- `/app/produk/[slug]/page.js` - Detail produk
- `/app/produk/[slug]/OrderActions.js` - WhatsApp button logic
- `/components/ProductGallery.js` - Multi-image gallery
- `/.env.local` - Config nomor WA

**Nomor WhatsApp aktif:**
📱 **+62 813-3194-1357**

**Server running:**
🚀 http://localhost:3000

**Semua READY TO USE!** 🎉
