# Kodeva — Technical Skill Test Fullstack Developer (PT Digital Solusi Grup)

Situs demo untuk brand fiktif **Kodeva**: landing page campaign, blog ber-CMS, dan mini
marketplace lisensi software (kasir, HR & payroll, add-on) — dibangun sesuai brief
_Technical Skill Test Fullstack Developer DSG_.

- **Live demo:** `https://<akan-diisi-setelah-deploy>.vercel.app` _(update setelah deploy)_
- **Studio CMS (marketing):** `https://<domain>/studio`
- **AI log:** lihat [`AI_LOG.md`](./AI_LOG.md)
- **Laporan Lighthouse:** lihat [`docs/lighthouse/`](./docs/lighthouse) (JSON + HTML + screenshot)

> Semua konten (produk, harga, testimoni, artikel, kontak) adalah data dummy untuk keperluan
> skill test. Tidak ada transaksi/ pembayaran sungguhan.

---

## 1. Requirement brief → di mana implementasinya

### A. Landing page + blog dengan CMS (editable oleh marketing)

| Requirement                               | Implementasi                                                                                                                                                     |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hero, unggulan, testimoni, lead form, FAQ | `src/app/(site)/page.tsx` — seluruh copy & item berasal dari CMS (`getLandingContent()`), fallback lokal bila CMS kosong                                         |
| Blog list + halaman detail                | `src/app/(site)/blog/page.tsx`, `src/app/(site)/blog/[slug]/page.tsx` (Portable Text, kategori, produk terkait, pagination)                                      |
| CMS-nya bisa dipakai non-teknis           | Sanity Studio ter-embed di `/studio` — form berlabel Bahasa Indonesia + group tab (Hero, Testimoni, FAQ, dll.) di `src/sanity/schemaTypes/`                      |
| Perubahan muncul cepat                    | On-demand revalidation: webhook Sanity → `/api/revalidate` → `revalidateTag('landing'/'posts', 'max')`; jaring pengaman TTL 10 menit bila webhook tidak dipasang |
| Lead form (bonus pendukung)               | `POST /api/leads` — validasi Zod, honeypot, minimum waktu isi, rate limit per IP; lead tersimpan ke Sanity (atau `.data/leads.jsonl` di mode lokal)              |

### B. Mini marketplace (frontend only + mock payment)

| Requirement                          | Implementasi                                                                                                                                        |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Katalog ≥6 produk                    | 8 produk di `src/lib/catalog/data.ts`; katalog dengan filter kategori di `/katalog`                                                                 |
| Halaman detail + 3 paket             | `/produk/[slug]` — paket Basic/Pro/Business, galeri mockup, keunggulan, JSON-LD Product                                                             |
| Promo dengan kuota lintas baris      | Model kuota di-share **per produk** (total lisensi semua paket promo produk yang sama), bukan per paket — lihat `src/lib/cart/logic.ts`             |
| Keranjang persist                    | Zustand + `localStorage` (`kodeva:cart`), rehidrasi aman (`skipHydration`) + rekonsiliasi saat memuat (produk hilang, duplikat, qty melebihi kuota) |
| Checkout + mock payment sukses/gagal | `/checkout` + `POST /api/mock-payment`; **harga & kuota dihitung ulang di server** — keranjang yang kedaluwarsa ditolak `409`                       |
| Aturan uji gagal deterministik       | Email pelanggan yang diawali `fail` (contoh `fail@bisnis.com`) **selalu gagal**; email lain selalu berhasil                                         |

### C. Marketing & growth

| Requirement                | Implementasi                                                                                                                                                                     |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lighthouse mobile ≥80      | **Performance 96–99** di 4 halaman utama (A11y/Best Practices/SEO = 100) — bukti di `docs/lighthouse/`                                                                           |
| Tracking GA4 / dataLayer   | `view_item`, `add_to_cart`, `begin_checkout` (format GA4 ecommerce), + `cta_click` (custom) di `src/lib/analytics/datalayer.ts`; dedup agar tidak dobel saat re-render / remount |
| Atribusi UTM               | Last-touch, disimpan (`kodeva:attribution`, TTL 30 hari), ikut terkirim di payload lead & checkout                                                                               |
| Bukti event untuk reviewer | Buka halaman mana pun dengan `?debug=events` → panel dataLayer tampil di kiri bawah                                                                                              |

### Deliverable

- [x] Git repo dengan riwayat commit granular (bukan satu commit besar)
- [x] README.md (dokumen ini)
- [x] AI_LOG.md
- [ ] Link deploy — _diisi setelah deploy_

---

## 2. Coba cepat (demo flow untuk reviewer)

1. **Landing** `/` — perhatikan CTA, produk unggulan (harga promo + sisa kuota), FAQ.
2. **Tracking** — buka `/katalog?debug=events`, klik produk, tambah ke keranjang, lalu lihat
   panel event: `view_item`, `add_to_cart`, dst.
3. **UTM** — buka `/katalog?utm_source=google&utm_medium=cpc&utm_campaign=promo-akhir-tahun`,
   lanjut sampai checkout (event + payload memuat atribusi).
4. **Promo lintas baris** — di `/produk/kasir-prima`, tambahkan **Pro** beberapa lisensi, lalu
   **Business**; perhatikan kuota 87 lisensi terbagi dari dua baris dan total harga promo benar.
5. **Checkout sukses** — isi data apa pun (email bebas), bayar → pesanan `KV-...` + rincian.
6. **Checkout gagal** — ulangi dengan email `fail@bisnis.com` → panel gagal + tombol coba lagi.
7. **Keranjang nakal** — tambah item, ubah `kodeva:cart` di localStorage devtools (mis. produk
   asing / qty 999), reload → keranjang direkonsiliasi dengan notifikasi.
8. **State simulasi katalog** — `/katalog?mock=empty`, `?mock=slow`, `?mock=fail`
   (error boundary dengan tombol reset).
9. **Blog** — `/blog`, buka artikel, perhatikan JSON-LD + artikel terkait produk.
10. **CMS** — buka `/studio`, ubah judul hero → publish → landing berubah dalam detik
    (setelah webhook terpasang).

---

## 3. Menjalankan secara lokal

Prasyarat: **Node.js ≥ 24**, **pnpm 11**.

```bash
pnpm install
cp .env.example .env.local   # opsional — semua kosong pun situs tetap jalan
pnpm dev                     # http://localhost:3000
```

### Mode tanpa kredensial (default reviewer)

Situs berjalan penuh **tanpa** Sanity: konten landing & artikel memakai fallback lokal
(`src/sanity/fallback.ts`), lead tersimpan ke `.data/leads.jsonl`. Ini disengaja agar build &
demo tidak pernah gagal karena env.

### Mode dengan Sanity

Isi `.env.local`:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID="xxxxxxx"
NEXT_PUBLIC_SANITY_DATASET="production"
SANITY_API_READ_TOKEN=""            # opsional (dataset publik tidak butuh)
SANITY_API_WRITE_TOKEN="sk..."      # untuk lead & seed
SANITY_REVALIDATE_SECRET="rahasia"  # untuk webhook
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

Lalu isi konten awal:

```bash
pnpm seed    # idempotent: menulis landingPage, kategori, dan 3 artikel demo ke Sanity
```

### Skrip yang tersedia

| Skrip                                    | Fungsi                                |
| ---------------------------------------- | ------------------------------------- |
| `pnpm dev` / `pnpm build` / `pnpm start` | Next.js dev / build / produksi        |
| `pnpm test`                              | Unit test (Vitest) — **53 test**      |
| `pnpm typecheck`                         | `tsc --noEmit`                        |
| `pnpm lint`                              | ESLint (bersih tanpa error/warning)   |
| `pnpm format`                            | Prettier (termasuk plugin Tailwind)   |
| `pnpm seed`                              | Seed konten Sanity dari data fallback |

---

## 4. Keputusan teknis (dan alasannya)

### 4.1 Next.js 16 App Router dengan Cache Components + on-demand revalidation

Konten CMS dibungkus `"use cache"` + `cacheLife({stale: 300, revalidate: 600})` + `cacheTag`
(`landing`, `posts`, `post-<slug>`). Halaman ter-prerender statis (cepat, murah), lalu webhook
Sanity memanggil `revalidateTag(tag, 'max')` sehingga publish **langsung** tampil. TTL 10 menit
adalah jaring pengaman bila webhook mati. Konsekuensi yang diterima secara sadar: route dinamis
ber-`searchParams` (`/katalog`, `/blog?page=`) memakai pola static shell + `<Suspense>` untuk
bagian dinamisnya.

### 4.2 Konten CMS, data domain di kode

Copy marketing sepenuhnya di CMS; namun **produk, harga, dan kuota promo** sengaja hidup di
`src/lib/catalog/data.ts` (typed). Alasannya: integritas data transaksi tidak cocok
diedit-bebas dari CMS tanpa validasi bisnis; schema Sanity untuk landing/artikel memakai
`options.list` yang di-generate dari file yang sama sehingga marketing tetap memilih dari daftar
valid. Ini juga membuat fallback, seed, dan server-validation memakai satu sumber kebenaran.

### 4.3 Harga & kuota: dipercaya hanya di server

`/checkout` menampilkan estimasi dari keranjang (Zustand), tapi `POST /api/mock-payment`
**menghitung ulang** semua harga dari katalog dan memvalidasi ulang kuota promo; permintaan yang
melebihi kuota dijawab `409` dengan pesan actionable. Logika kuota lintas baris ada di fungsi
murni `src/lib/cart/logic.ts` — dipakai bersama oleh store, UI, dan server, dan ditutup
22 unit test.

### 4.4 Rekonsiliasi keranjang yang tahan data lokal usang

Data localStorage bisa kedaluwarsa (harga/kuota/produk berubah). Saat rehidrasi, keranjang:
membuang produk yang tidak dikenal, menggabungkan baris duplikat, membatasi quantity ke rentang
wajar, dan memotong kelebihan kuota promo (prioritas baris yang lebih dulu) — dengan notifikasi
ke pengguna. Detail di `reconcileCartItems()`.

### 4.5 Tracking yang tidak dobel + dapat dibuktikan

Event GA4 dikirim via `window.dataLayer.push` (siap disambungkan ke GTM/GA4). `view_item` dan
`begin_checkout` dilindungi dedup (registry + penanda `sessionStorage` 30 menit) agar tidak
terkirim ulang saat React re-render/re-mount. Reviewer bisa melihat event aslinya lewat
`?debug=events` tanpa perlu membuka GTM.

### 4.6 Alur gagal yang bisa diuji (failure path deterministik)

Mock payment memakai aturan sederhana yang dapat diprediksi reviewer: email diawali `fail` ⇒
gagal. Katalog punya `?mock=empty|slow|fail` untuk melatih empty state, Suspense/skeleton, dan
error boundary. Lead API memiliki honeypot + minimum waktu pengisian + rate limit 5/10 menit
per IP (in-memory — cukup untuk demo; produksi perlu penyimpanan bersama).

### 4.7 Aksesibilitas & performa sebagai bagian definisi "selesai"

Iterasi Lighthouse (`docs/lighthouse/`) dipakai untuk memperbaiki kontras teks kecil dan ARIA
(hasil akhir: Performance **96–99**, Accessibility/Best Practices/SEO **100** di 4 halaman
utama). Rincian iterasi (termasuk kesalahan yang ditemukan) ada di `AI_LOG.md` §4–§5.

### 4.8 Batasan yang diketahui (jujur)

- **Soft-404 pada route dinamis**: `/blog/<slug-tak-dikenal>` menampilkan halaman 404 dengan
  status HTTP 200. Ini konsekuensi streaming/PPR (status terkirim bersama shell sebelum lookup
  konten selesai). `dynamicParams = false` bisa memaksa 404 keras tapi akan memblokir artikel
  baru yang di-publish tanpa rebuild — trade-off yang dipilih demi alur publish yang instan.
- Rate limit in-memory tidak cocok multi-instance (produksi: Redis/Upstash).
- Lead & order tidak dikirim ke CRM/email — hanya tersimpan (Sanity/JSONL) dan log server.
- Uang: semua harga rupiah bilangan bulat; tanpa pajak/PPN (di luar scope brief).

---

## 5. Struktur proyek (ringkas)

```
src/
  app/
    (site)/            # layout dengan header/footer; halaman publik
      page.tsx         # landing (CMS-driven)
      katalog/ produk/[slug]/ keranjang/ checkout/
      blog/ [slug]/
      error.tsx (katalog)  not-found.tsx
    studio/[[...tool]]/ # Sanity Studio ter-embed
    api/               # leads, mock-payment, revalidate
    sitemap.ts robots.ts opengraph-image.tsx
  components/          # cart, checkout, marketplace, blog, marketing, site, seo, analytics
  lib/
    catalog/           # data + tipe produk (sumber kebenaran)
    cart/logic.ts      # harga & kuota lintas baris (fungsi murni) + tests
    analytics/         # dataLayer (GA4), UTM, penanda checkout
    store/             # zustand: cart, ui, toasts
    leads/ checkout/   # schema zod + penyimpanan + rate limit
    sanity/            # loader gambar
  sanity/              # client, queries, content (cache), fallback, schemaTypes
scripts/seed.ts
docs/lighthouse/       # bukti audit (JSON/HTML/PNG)
```

---

## 6. Untuk tim marketing (cara pakai CMS)

1. Buka `/studio` (login sekali dengan akun Sanity yang diundang).
2. **Landing Page** (singleton): edit hero, produk unggulan (pilih dari daftar produk valid),
   testimoni, FAQ, dan copy form lead — semua berlabel Bahasa Indonesia, dikelompokkan per
   seksi. Klik **Publish** → webhook memicu revalidasi → perubahan tampil dalam hitungan detik.
3. **Artikel Blog**: buat draft → isi judul/ringkasan/kategori/body (mendukung heading, kutipan,
   list, tautan, gambar) → pilih produk terkait → **Publish**.
4. **Lead yang masuk** tampil sebagai dokumen `Lead` di Studio (nama, kontak, UTM asal) — siap
   ditarik tim sales.
5. Butuh bantuan? Semua field penting punya deskripsi singkat di panel field.

---

## 7. Deploy

### Vercel

```bash
pnpm dlx vercel link        # pilih scope & project
pnpm dlx vercel env add NEXT_PUBLIC_SANITY_PROJECT_ID
# ...ulangi untuk semua env di .env.example (kecuali NEXT_PUBLIC_SITE_URL, isi dengan domain final)
pnpm dlx vercel --prod
```

### Sanity

1. `pnpm dlx sanity login` → `pnpm dlx sanity projects create` (atau pakai project yang ada),
   lalu pastikan `projectId` di env Vercel sudah benar. Dataset `production` dibuat otomatis.
2. Tambahkan domain deploy ke **CORS origins** (sanity.io/manage → API → CORS) — izinkan
   `https://<domain-vercel>` (credentials: tidak perlu untuk dataset publik).
3. Isi konten: jalankan `pnpm seed` (lokal, dengan env produksi) atau salin dokumen lewat Studio.
4. **Webhook revalidasi** (sanity.io/manage → API → Webhooks):
   - URL: `https://<domain-vercel>/api/revalidate`
   - Method: POST, HTTP header secret (`sanity-webhook-signature`)
   - Secret: sama dengan env `SANITY_REVALIDATE_SECRET`
   - Trigger: Create + Update + Delete, filter: kosongkan (tag dihitung di route)

---

## 8. Pengujian

- 53 unit test (`pnpm test`) pada logika yang paling mudah salah:
  - **Kuota promo lintas baris** (22 test): pembagian kuota Pro+Business satu produk, pelepasan
    kuota saat qty dikurangi/dihapus, batas per baris, produk tanpa promo bebas kuota,
    rekonsiliasi data localStorage kedaluwarsa.
  - Schema lead & checkout (validasi email/WA, normalisasi nomor, honeypot, quantity bandel).
  - dataLayer: bentuk payload GA4, dedup, subscriber, event CTA.
  - UTM: parsing, prioritas, TTL 30 hari, data rusak.
- `pnpm lint` + `pnpm typecheck` bersih; `pnpm build` hijau dengan Cache Components aktif.
- Bukti Lighthouse mobile (Perf / A11y / BP / SEO): home **97/100/100/100**, katalog
  **99/100/100/100**, produk **99/100/100/100**, blog **96/100/100/100** — file lengkap di
  `docs/lighthouse/`.

---

## 9. Dokumentasi penggunaan AI

Seluruh penggunaan AI (tools, prompt terbaik, kesalahan AI yang ditemukan & diperbaiki,
bagian yang dibantu AI + edge case yang diuji, dan bagian yang dikerjakan tanpa AI) dicatat
di [`AI_LOG.md`](./AI_LOG.md).
