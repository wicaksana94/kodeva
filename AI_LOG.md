# AI_LOG — Penggunaan AI selama pengerjaan

> Dokumen ini mencatat penggunaan AI secara jujur selama pengerjaan Technical Skill Test
> Fullstack Developer (PT Digital Solusi Grup). Log diisi **secara inkremental** selama sesi
> pengerjaan; entri baru ditambahkan setiap kali ada kejadian penting (kesalahan AI yang
> ditemukan, bagian yang diverifikasi, dsb.). Referensi commit ikut dicantumkan agar dapat
> ditelusuri di riwayat Git.

## 1. Tools yang dipakai dan untuk bagian apa

| Tool                                                         | Dipakai untuk                                                                                                                                                    |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **opencode CLI** (model `opencode/deepseek-v4.1-flash-free`) | Pair-programming utama sepanjang sesi: menganalisis brief, memutuskan arsitektur, menulis hampir seluruh kode, unit test, dokumentasi README/AI_LOG              |
| **firecrawl CLI** (skill `firecrawl-parse` di opencode)      | Mengonversi brief PDF `Fullstack_Developer_Skill_Test_DSG.pdf` menjadi markdown (`.firecrawl/skill-test.md`) karena model tidak bisa membaca PDF secara langsung |
| Terminal via opencode (pnpm, Node.js 24, git)                | Scaffold project, install dependency, menjalankan lint/typecheck/test/build, commit                                                                              |

Catatan: tidak ada kode yang di-generate di luar sesi opencode ini. Seluruh prompt & keputusan
kunci tercatat di bawah.

## 2. Keputusan yang sengaja ditanyakan ke manusia (bukan diasumsikan AI)

Sesuai instruksi brief ("kalau ada hal yang ambigu, tanyakan atau tulis asumsi"), AI awalnya
**berhenti dan bertanya** sebelum menulis kode. Tiga keputusan diambil oleh user, bukan AI:

1. **CMS: Sanity** — dipilih karena paling andal untuk kriteria "marketing non-teknis bisa edit
   sendiri" + Studio bisa di-embed satu deploy dengan Next.js.
2. **Scope: requirement wajib saja, kualitas maksimal** — sesuai catatan brief "lebih baik
   sebagian selesai rapi daripada semua ada tapi rapuh".
3. **Deployment: dibantu via CLI** (user sudah punya akun Vercel & Sanity).

## 3. Contoh prompt yang paling membantu (2–3)

1. > "baca [brief PDF] lalu kerjakan sesuai instruksi dan kriteria penilaian. Jika ada yang
   > perlu dikonfirmasi, silahkan chat"

   **Kenapa membantu:** memberi mandat eksekusi penuh _sekaligus_ izin eksplisit untuk bertanya
   saat ambigu. Hasilnya AI tidak menebak-nebak stack/CMS, melainkan menyusun 3 pertanyaan
   terstruktur (CMS, scope, deploy) via fitur question sebelum menulis satu baris kode pun.
   Ini mencegah pemborosan waktu karena salah asumsi arsitektur.

2. > "Cantumkan log penggunaan ai di opencode pada sesi ini di AI_LOG.md"

   **Kenapa membantu:** permintaan deliverable yang eksplisit menyebut _format_ (AI_LOG.md),
   _sumber_ (sesi opencode ini), dan _lokasi_. AI langsung bisa mengeksekusi tanpa tanya balik,
   dan penilaian "Dokumentasi & AI log" (20 poin) terpenuhi dengan pencatatan yang terjadi
   _selama_ proses, bukan rekonstruksi setelah selesai.

3. > "pastikan username git adalah Arya Wicaksana, jika belum maka ganti ke Arya Wicaksana"

   **Kenapa membantu:** instruksi verifikasi identitas menjelang deliverable repo. AI langsung
   mengecek `git config user.name/email` + author seluruh commit yang ada, lalu melaporkan hasil
   (ternyata sudah benar) alih-alih langsung "memperbaiki" yang tidak perlu. Menunjukkan pola
   kerja: verifikasi dulu, baru bertindak.

4. > "Continue if you have next steps, or stop and ask for clarification if you are unsure how to proceed."

   **Kenapa membantu:** memberi sinyal eksplisit untuk melanjutkan pekerjaan berurutan tanpa
   duduk menunggu konfirmasi tiap langkah, sekaligus memberi izin berhenti saat ambigu. AI
   melanjutkan rantai kerja marketplace → blog → ops → tests → Lighthouse secara mandiri dengan
   verifikasi build/test di setiap titik.

## 4. Contoh ketika AI memberi hasil yang salah / kurang tepat / tidak memenuhi requirement

### 4.1 Konfigurasi build-scripts pnpm 11 (salah, ditemukan & diperbaiki di sesi ini)

- **Nat**: AI menambahkan pengaturan `pnpm.onlyBuiltDependencies` ke `package.json` (cara yang
  berlaku di pnpm ≤ 10) agar postinstall `esbuild`/`sharp` diizinkan berjalan.
- **Masalah ditemukan dari peringatan pnpm itu sendiri:**
  `The "pnpm" field in package.json is no longer read by pnpm. The following keys were ignored: "pnpm.onlyBuiltDependencies"`.
- **Perbaikan iterasi 1 (masih salah):** memindahkan ke `onlyBuiltDependencies` di
  `pnpm-workspace.yaml` → masih muncul `ERR_PNPM_IGNORED_BUILDS: esbuild@0.28.2`. Ternyata nama
  kuncinya berubah lagi di pnpm 11.
- **Perbaikan final:** `allowBuilds: { esbuild: true, sharp: true }` di `pnpm-workspace.yaml`.
- **Verifikasi:** `pnpm install` menjalankan postinstall esbuild (`postinstall: Done`) dan
  `node_modules/.bin/esbuild --version` → `0.28.2`. Perubahan ikut ter-commit
  (`chore: scaffold Next.js 16 + TypeScript + Tailwind with tooling`, `3a7e938`).

### 4.2 Keterbatasan alat: model tidak bisa membaca PDF secara langsung

- **Nat:** permintaan awal adalah "baca [PDF 1]". Model menjawab dengan error
  `Cannot read "Fullstack_Developer_Skill_Test_DSG.pdf" (this model does not support pdf input)` —
  yaitu AI **berhenti dan memberi tahu user**, bukan mengarang isi brief.
- **Perbaikan:** konversi PDF → markdown memakai firecrawl CLI (`firecrawl parse`), hasil di
  `.firecrawl/skill-test.md`.
- **Verifikasi:** seluruh 235 baris brief terbaca lengkap (instruksi umum, skenario, Bagian A/B/C,
  bonus, tabel kriteria penilaian) dan dicocokkan ulang terhadap aksi yang dikerjakan.

### 4.3 Bundling Sanity Studio gagal di Server Component (ditemukan saat `next build`)

- **Nat:** halaman `/studio` dibuat sebagai Server Component yang meng-import `sanity.config.ts`
  langsung. Build gagal dengan `Error: Export default doesn't exist in target module … swr/dist/index/react-server.mjs`
  — paket `sanity` ikut ter-bundle ke graph **Server Component** (kondisi `react-server`),
  sementara `swr` tidak menyediakan default export di kondisi tersebut.
- **Analisis:** import trace build menunjukkan rantai
  `page.tsx (Server Component) → sanity.config.ts → sanity/lib/index.js → swr`.
- **Perbaikan:** config dipindahkan ke balik client boundary — komponen baru
  `src/components/studio/studio-shell.tsx` (`'use client'`) meng-import `NextStudio` + config,
  sementara `page.tsx` tetap Server Component (agar bisa mengekspor `metadata`/`viewport` khusus
  Studio dari `next-sanity/studio`).
- **Verifikasi:** `pnpm build` hijau; `/studio` di smoke test produksi mengembalikan 200.

### 4.4 Nilai waktu non-deterministik melanggar aturan Cache Components (ditemukan saat `next build`)

- **Nat:** `SiteFooter` memakai `new Date().getFullYear()` langsung saat prerender. Build gagal:
  `Next.js encountered the unstable value new Date() while prerendering … blocked by
blocking-prerender-current-time` (aturan baru Cache Components di Next 16).
- **Perbaikan:** helper `src/lib/time.ts` ber-`'use cache'` + `cacheLife('days')` sehingga tahun
  di-prerender, aman, dan tetap ter-refresh otomatis harian — bukan sekadar menambahkan
  `force-dynamic` yang membuang manfaat statis halaman.
- **Verifikasi:** build hijau; halaman `/` tetap `○ Static` di output build.

### 4.5 Kesalahan sendiri saat perbaikan aksesibilitas (tertangkap re-audit Lighthouse)

- **Nat:** demi memperbaiki urutan heading, elemen `<h2>` diberi `role="status"`. Re-run
  Lighthouse justru memunculkan **dua** temuan baru: `aria-allowed-role` (role `status` tidak
  boleh di heading) dan `heading-order` tetap gagal (karena role yang tidak valid membuat h2
  tidak lagi dihitung sebagai heading di accessibility tree).
- **Perbaikan:** hapus `role="status"` dari elemen heading (status announcement memang bukan
  kebutuhan di situ). Pelajaran: setiap perubahan a11y diverifikasi ulang dengan audit, bukan
  dianggap selesai setelah kode diubah.
- **Verifikasi:** katalog naik ke aksesibilitas 100; keempat halaman utama kini
  96–99 perf & 100 a11y/BP/SEO.

### 4.6 Studio tanpa konfigurasi menampilkan error mentah (ditemukan user saat mencoba `/studio`)

- **Nat:** user menjalankan `pnpm dev` lalu membuka `/studio` tanpa mengisi env Sanity.
  Implementasi awal selalu me-render `NextStudio` dengan `projectId` placeholder
  (`ganti-dengan-project-id`), sehingga browser menampilkan layar error Sanity yang membingungkan
  alih-alih pesan "belum dikonfigurasi".
- **Analisis:** mode fallback situs (tanpa kredensial) sudah dirancang sejak awal, tetapi route
  `/studio` tidak punya jalur fallback yang setara — hanya kontennya yang fallback, bukan UI CMS.
- **Perbaikan:** `src/app/studio/[[...tool]]/page.tsx` kini mengecek `isSanityConfigured`; bila
  belum, dirender `StudioSetupNotice` — halaman server-rendered berisi 4 langkah setup (buat
  project, isi `.env.local`, CORS, restart dev) dan tautan kembali ke situs.
- **Verifikasi:** `curl /studio` pada dev & produksi memuat teks "Sanity Studio belum
  dikonfigurasi" (server-rendered, HTTP 200); bila env Sanity diisi, jalur `StudioShell` lama
  tetap dipakai. Lint/typecheck/test tetap hijau.

### 4.7 React key hilang di `/blog` saat data beralih ke Sanity (ditemukan user)

- **Nat:** setelah Sanity tersambung, `/blog` memunculkan console error
  `Each child in a list should have a unique "key" prop` di `blog-list.tsx` — React memakai
  `key={post.id}` tetapi `post.id` bernilai `undefined`. Penyebabnya: projection GROQ
  (`postSummaryFields`) mengambil `_id` tanpa di-alias ke `id`, sementara tipe `PostSummary`
  (dan seluruh komponen) mengharapkan `id: string`.
- **Kenapa lolos sejak awal:** selama konten masih memakai fallback lokal — yang datanya memiliki
  field `id` — jalur ini tidak pernah dieksekusi. Bug batas-data seperti ini hanya muncul setelah
  integrasi CMS sungguhan; unit test fungsi murni tidak akan menangkapnya.
- **Perbaikan:** alias `"id": _id` pada projection; sekalian menghapus `tabIndex={-1}` di tautan
  kartu artikel (kartu sebelumnya tidak dapat difokus dengan keyboard — temuan a11y saat
  investigasi).
- **Verifikasi:** query Sanity mengembalikan `id`; `/blog` merender 3 tautan `/blog/<slug>` yang
  benar, halaman detailnya `200`, dan tidak ada lagi kartu ber-`tabindex="-1"`;
  lint/typecheck/53 test tetap hijau.

### 4.8 Overlay drawer keranjang tertutup memblokir seluruh klik halaman (ditemukan user)

- **Nat:** laporan lanjutan user: "Baca selengkapnya" di kartu `/blog` tetap tidak bisa diklik.
  Investigasi dengan browser headless (Chrome + CDP): `document.elementsFromPoint()` di titik
  tengah kartu menunjukkan elemen teratas bukan isi kartu, melainkan backdrop drawer keranjang —
  `fixed inset-0`, `opacity-0` (tak terlihat), tetapi **selalu** `pointer-events-auto`, sehingga
  menelan setiap klik konten selama drawer tertutup. Klik mouse sungguhan pada titik itu memang
  tidak mengubah URL.
- **Kenapa lolos sejak awal:** seluruh verifikasi sebelumnya berbasis `curl`/HTML (markup benar,
  tautan ada) — bug murni interaksi ini hanya muncul di browser sungguhan. Temuan sampingan saat
  yang sama: class `z-60` tidak ter-generate Tailwind v4 (computed `z-index: auto`), sehingga
  drawer terbuka pun tidak benar-benar berada di atas header; diganti `z-[60]`.
- **Perbaikan (`src/components/cart/cart-drawer.tsx`):** backdrop hanya `pointer-events-auto`
  saat drawer terbuka; saat tertutup `pointer-events-none`.
- **Verifikasi (browser sungguhan, bukan `curl`):** sebelum perbaikan klik tidak berpindah;
  sesudahnya klik mouse asli di kartu berpindah ke `/blog/<slug>`; alur drawer tetap utuh —
  buka via tombol header (`pointer-events: auto`, `opacity: 1`, aside tidak `inert`), klik
  backdrop menutup kembali (`none`, `0`, `inert`), lalu halaman tetap interaktif.
  lint/typecheck/53 unit test tetap hijau.

### 4.9 Dua bagian konten landing belum CMS-editable (temuan audit requirement)

- **Nat:** audit ulang requirement brief — "konten setiap section (teks, gambar, item seperti
  produk/testimoni/FAQ) bisa diedit lewat CMS oleh user non-teknis": hampir seluruh section
  sudah CMS-driven, tetapi statistik hero (15.000+, 4,8/5, 99,9%) dan label tombol "Lihat
  semua produk" masih hardcoded di `page.tsx`; testimoni juga belum bisa menampilkan foto.
- **Perbaikan:** tambah `hero.stats[]`, `featuredCtaLabel`, dan foto testimoni (opsional —
  fallback inisial nama) di schema Sanity `landingPage` dengan label Bahasa Indonesia; alur
  query, normalisasi konten, fallback, dan seed ikut diperbarui agar satu sumber kebenaran.
- **Verifikasi:** marker test terhadap CMS live — nilai spesifik `[[CMS-STAT]]` & `[[CMS-CTA]]`
  ditulis ke dokumen via API lalu **tampil di HTML halaman** (render dari Sanity, bukan
  fallback: log server tanpa error fetch), kemudian dipulihkan ke nilai normal dan state
  dokumen dicek via query API. lint/typecheck/53 test hijau.

### 4.10 Item array hasil seed tanpa `_key` — FAQ tidak bisa dikelola di Studio (ditemukan user)

- **Nat:** user melaporkan konten FAQ tidak bisa diatur lewat Sanity Studio. Penyebab: seed
  script menulis item array-of-objects (`faqItems`, `testimonials`, `hero.stats`) tanpa `_key`
  (fungsi `stripKeys` sengaja menghapusnya). Sanity mewajibkan `_key` unik per item untuk
  dokumen — konten yang dibuat via API/script harus menulisnya sendiri; tanpa `_key`,
  pengelolaan item di Studio (edit, urutkan, hapus) tidak andal.
- **Perbaikan:** `stripKeys()` diganti `withKeys(items, prefix)` yang menulis `_key`
  deterministik (`faq-0`, `testi-1`, `stat-2`, …) sehingga seed tetap idempotent; dokumen di
  dataset di-seed ulang.
- **Verifikasi:** query API memastikan `_key` ada di ketiga array; marker test FAQ end-to-end —
  `faqItems[0].question` diganti `[[CMS-FAQ]]` via API, **tampil di HTML halaman** (render dari
Sanity, log server tanpa error fetch), lalu dikembalikan ke teks asli. lint/typecheck/53
test hijau.

### 4.11 Urutan FAQ di web tidak ikut Studio — cache konten basi di development (ditemukan user)

- **Nat:** user menggeser/mengubah item FAQ di Studio, tetapi situs lokal masih menampilkan urutan
  lama. Dokumen di dataset sudah benar (dicek via query API; tidak ada draft) — yang basi adalah
  cache konten: webhook revalidasi Sanity tidak bisa memanggil `localhost`, sehingga di dev
  perubahan menunggu TTL produksi (5–10 menit) dan revalidasi latar sering gagal karena jaringan.
- **Perbaikan:** `cacheLife` kini sadar environment — development `{stale: 5, revalidate: 15,
  expire: 60}` detik, produksi tetap `{stale: 300, revalidate: 600, expire: 86400}`. Percobaan
  pertama memakai konstanta bersama berisi ternary `process.env.NODE_ENV`; Next menandainya
  sebagai data uncached ("uncached data during prerendering" berulang di log dev), sehingga nilai
  akhir ditulis **literal** di cabang `if/else` dalam tiap fungsi `"use cache"` agar tetap dapat
  dianalisis statis.
- **Verifikasi:** dev server uji di port terpisah (salinan project, server dev user tidak
  diganggu): log tanpa "uncached data"; marker `[[TTL2]]` pada `featuredCtaLabel` ditulis via API
  lalu tampil di halaman **tanpa restart** (91 detik — dominan propagasi CDN Sanity), lantas
  dipulihkan dan dicek via query API. `pnpm build` (branch produksi `cacheLife`) hijau: 28 rute.

### 4.12 Audit hero dari pesan Head of Marketing — promo tak tampil saat banner diisi + mockup hardcoded

- **Nat:** permintaan "hero section harus customizable" (konteks: marketing ganti banner/promo
  mingguan tanpa developer) memicu audit alur hero. Hampir semua sudah CMS-driven, tetapi ada dua
  gap nyata: (a) teks `promoLabel`/`promoNote` hanya dirender di kasus *tanpa* gambar hero —
  begitu marketing mengunggah banner mingguan, teks promo justru hilang; (b) produk mockup hero
  (kasus tanpa banner) hardcoded `getProductBySlug('kasir-prima')` di `page.tsx` sehingga produk
  yang ditampilkan tidak bisa diganti dari Studio.
- **Perbaikan:** baris promo dipindah ke kolom teks hero (selalu tampil selama label/catatan
  promo terisi, dengan fallback nama campaign) dan caption di mockup dihapus; field baru
  `hero.mockupProductId` (dropdown produk valid, `initialValue` kasir-prima, fallback + seed ikut
  diperbarui). Sekaligus melengkapi metrik "klik tombol dari landing": klik tombol kartu produk
  unggulan kini mengirim `cta_click` (`featured-product-*`) lewat `TrackedCardCta` — varian
  non-link yang aman dipakai di dalam kartu ber-`<Link>` (tidak ada `<a>` bersarang).
- **Verifikasi:** marker test terhadap CMS live (teks promo diganti `[[HOOK-PROMO]]` → tampil di
  HTML; `hero.mockupProductId` diganti produk lain → nama produk di mockup berubah), lalu
  dipulihkan; klik tombol kartu unggulan di browser headless memunculkan event `cta_click` di
  `?debug=events`. lint/typecheck/53 test + build hijau.

### 4.13 Laporan user: `/` gagal render setelah banner hero diunggah — loader fungsi melintasi batas Server→Client

- **Nat:** setelah user mengunggah gambar hero lewat Studio, halaman `/` memunculkan overlay
  "Blocking Route" + "Next.js encountered uncached data during prerendering" (dan sempat 500).
  Akar masalahnya bukan cache: `sanityImageLoader` adalah **fungsi** yang diteruskan sebagai prop
  `loader` dari Server Component ke `next/image`. Selama hero belum pernah terisi, jalur ini tidak
  pernah dieksekusi — begitu banner diunggah, batas Server→Client dilanggar
  ("Functions cannot be passed directly to Client Components").
- **Perbaikan:** memakai pola resmi dokumen — loader global lewat `images.loaderFile`
  (`src/lib/sanity/image-loader.ts`; modul `'use client'`, default export), dan prop `loader`
  dihapus dari lima call-site (`page.tsx` hero + testimoni, kartu artikel, body artikel, sampul
  artikel).
- **Verifikasi:** reproduksi di salinan project (server dev user tidak diganggu): HTTP 500 → 200,
  srcset memakai URL CDN langsung (`?w=…&q=75&fit=max&auto=format`), fetch gambar 200. `pnpm build`
  hijau (28 rute) + smoke test `next start`: `/` 200 dengan judul CMS ter-bake, seluruh rute utama
  200.

## 5. Bagian implementasi yang banyak dibantu AI + edge case yang diuji

### 5.1 Logika harga & kuota promo (`src/lib/cart/logic.ts`) — 22 unit test

Fungsi murni (tanpa React) supaya bisa dites langsung dan dipakai bersama oleh UI + server:
`checkQuantity`, `getMaxQuantityForLine`, `addToCart`, `setLineQuantity`, `removeLine`,
`getCartTotals`, `getPromoUsages`, `reconcileCartItems`. Edge case yang diuji:

- Kuota promo **di-share lintas paket** untuk produk yang sama (Pro + Business kasir-prima
  berbagi sisa 87 lisensi), termasuk akumulasi lintas baris.
- **Pelepasan kuota** saat quantity baris promo dikurangi atau baris dihapus.
- Paket tanpa harga promo **tidak memakai kuota**; produk tanpa promo sama sekali bebas
  (tidak terpengaruh kuota).
- Batas `MAX_LICENSE_PER_LINE = 100`, quantity pecahan/negatif/0 ditolak dengan pesan.
- **Rekonsiliasi data usang dari localStorage**: membuang produk/paket tak dikenal, merge
  baris duplikat, memotong qty melebihi kuota secara FCFS (baris lebih awal menang), dan
  menandai `changed` supaya UI memberi notifikasi ke pengguna.

### 5.2 Tracking GA4/dataLayer + atribusi UTM

- Event `view_item`/`add_to_cart`/`begin_checkout` dalam format GA4 ecommerce (`items[]`,
  `currency: 'IDR'`) + `cta_click` custom dengan konteks (id/lokasi/tujuan/campaign).
- **Anti-dobel**: registry `shouldFireOnce(key, windowMs)` untuk view_item per produk, dan
  penanda `sessionStorage` 30 menit untuk begin_checkout (teruji di unit test dengan waktu
  yang di-inject, tanpa `sleep`).
- UTM last-touch: parsing, TTL 30 hari, tahan JSON rusak, disertakan di payload lead & order.
- Alat bukti untuk reviewer: panel `?debug=events` (murni membaca `dataLayer` yang sama).

### 5.3 Validasi & failure path (bagian "Validasi/error/testing" pada nilai)

- Checkout: harga **tidak pernah** dipercaya dari client — dihitung ulang di
  `/api/mock-payment`; kuota promo divalidasi ulang dan pelanggar dijawab `409` + pesan jelas.
- Lead: honeypot + minimum waktu pengisian (1,2 detik) + rate limit 5/10 menit per IP; error per
  field dari Zod ditampilkan inline di form (satu sumber schema untuk client & server).
- Katalog: `?mock=empty|slow|fail` + `error.tsx` dengan tombol reset; 404 kustom di dua level
  (root & `(site)`).
- Semua di atas diverifikasi juga lewat smoke test produksi via `curl` (status code + isi).

### 5.4 Performa & aksesibilitas (Lighthouse, mobile)

- Skor akhir 4 halaman utama: perf **96–99**, a11y/BP/SEO **100** (laporan JSON+HTML+screenshot
  di `docs/lighthouse/`).
- Perbaikan yang didorong audit: kontras teks kecil (slate-400 → slate-500/600 pada badge dan
  price coret), `role="img"` untuk deretan bintang rating, `aria-hidden` untuk logo mark,
  menghapus `aria-label` yang menduplikasi teks logo, dan memperbaiki heading order katalog.
- Catatan jujur: proses ini iteratif — dua di antaranya justru memperkenalkan kesalahan baru
  yang tertangkap re-audit (lihat §4.5).

## 6. Bagian yang sengaja dikerjakan tanpa AI

_(Diisi oleh user di akhir pengerjaan — berisi bagian mana yang sengaja ditulis/diputuskan
tanpa bantuan AI beserta alasannya. Bahan yang bisa dipakai: (a) review akhir manual terhadap
kode yang di-generate AI (baca ulang logika kuota & alur checkout); (b) verifikasi manual di
browser — mis. menambah produk promo dari dua paket, cek angka kuota, dan memastikan event di
`?debug=events` sesuai harapan; (c) keputusan bisnis yang Anda ambil sendiri (scope, prioritas,
copy/konten); (d) pengecekan hasil deploy.)_

---

### Riwayat singkat sesi (untuk konteks)

1. Brief PDF dikonversi ke markdown, requirement & kriteria penilaian dianalisis AI.
2. User memutuskan CMS (Sanity), scope (wajib saja), dan alur deploy (via CLI).
3. Scaffold `kodeva`: Next.js 16 (App Router, Cache Components) + TypeScript + Tailwind 4;
   dependency: `sanity`, `next-sanity`, `zustand`, `zod`; tooling: `vitest`, `prettier`, `tsx`.
4. `pnpm-workspace.yaml` diperbaiki (`allowBuilds`) — lihat §4.1.
5. Lapisan domain katalog + logika keranjang/kuota + 22 unit test (commit `5fe4153`).
6. Attribution capture, dataLayer GA4, store zustand (cart persist + reconcile, ui, toasts),
   drawer keranjang, header/footer, panel debug — di-commit menyusul bersama landing.
7. Landing page CMS-driven + form lead + API leads (validasi/honeypot/rate-limit) + JSON-LD +
   studio ter-embed (commit `cb6ea49`). Dua kegagalan build nyata diperbaiki di sini (§4.3, §4.4).
8. Marketplace lengkap: katalog (filter + mock states + error boundary), detail produk
   (galeri mockup, panel paket + kuota, view_item), keranjang, checkout + `/api/mock-payment`
   dengan kalkulasi ulang di server (commit `0f6ec1c`).
9. Blog list/detail (Portable Text, pagination dengan validasi parameter), sitemap, robots,
   OG image brand (commit `5926633`).
10. Webhook revalidasi, seed script idempotent, 31 unit test tambahan (total 53) (commit `5adb1d9`).
11. Iterasi Lighthouse → perbaikan kontras/ARIA, laporan & screenshot di `docs/lighthouse/`
    (commit `a36cb9a`), lint/typecheck/test/build bersih.
12. README final + pembaruan AI_LOG (commit `b31e4b7`).
13. Pemeriksaan ulang kepatuhan deliverable terhadap brief → README dilengkapi bagian wajib
    (waktu pengerjaan, asumsi, status & roadmap 1 minggu, rencana backend marketplace) dan
    alasan pemilihan stack ditegaskan eksplisit (commit `6ec0af3` dan `1074445`).
14. Normalisasi seluruh pesan commit ke **Conventional Commits** (rewrite message via
    `git filter-branch --msg-filter`); konten tidak berubah — diverifikasi `git diff` kosong
    terhadap HEAD lama — dan seluruh referensi hash di dokumen ini disinkronkan.
15. Laporan user: `/studio` error saat dijalankan tanpa env Sanity → dibuat halaman panduan
    setup (`StudioSetupNotice`) dan diverifikasi (§4.6).
16. Sanity lokal terhubung (project `smtzb99u`): `pnpm seed` mengisi 4 kategori + landing + 3
    artikel; verifikasi end-to-end — marker test judul hero tampil di halaman, lead form
    tersimpan sebagai dokumen `lead` di Sanity, dan `/studio` memuat shell Studio (bukan lagi
    halaman panduan). Kredensial hanya berada di `.env.local` (gitignored) dan tidak pernah
    masuk repository.
17. Laporan user: console warning React key di `/blog` setelah data beralih ke Sanity → projection
    GROQ tidak meng-alias `_id` ke `id`; diperbaiki dan diverifikasi end-to-end (§4.7).
18. Laporan lanjutan user: kartu artikel tetap tidak bisa diklik → investigasi browser headless
    (Chrome + CDP) menemukan backdrop drawer tertutup memblokir seluruh klik halaman (plus class
    `z-60` tidak valid); diperbaiki dan diverifikasi dengan klik mouse sungguhan (§4.8).
19. Audit kepatuhan requirement CMS ("konten tiap section bisa diedit non-teknis"): statistik
    hero, label tombol produk unggulan, dan foto testimoni ditambahkan ke schema Sanity —
    sebelumnya dua yang pertama hardcoded di `page.tsx`; diverifikasi marker test (§4.9).
20. Laporan user: konten FAQ tidak bisa dikelola lewat Studio → item array hasil seed tidak
    punya `_key`; `stripKeys` diganti `withKeys` (deterministik), dokumen di-seed ulang, dan
    diverifikasi marker test FAQ end-to-end (§4.10).
21. Laporan user: urutan FAQ di web tidak sesuai Studio → akar masalahnya cache konten basi di
    development (webhook tidak bisa menghubungi localhost); `cacheLife` dibuat sadar environment
    (dev 5/15/60 detik, produksi 5/10 menit) dengan nilai literal, diverifikasi marker test tanpa
    restart + build hijau (§4.11).
22. Permintaan user: tombol CTA di card katalog — tombol "Lihat Detail" ditambahkan di tiap card
    `/katalog` (seluruh card tetap satu tautan; ikon chevron + gaya tombol utama); diverifikasi
    browser headless: 8/8 card menampilkan CTA.
23. Pesan Head of Marketing (banner/promo mingguan tanpa developer, tracking klik beli dari
    landing, SEO, preview WhatsApp, ekspansi MY/SG) memicu audit hero: teks promo kini selalu
    tampil walau banner diisi, produk mockup hero dapat dipilih di CMS, dan klik tombol kartu
    produk unggulan ter-track `cta_click`; diverifikasi marker test + klik headless (§4.12).
24. Laporan user: `/` gagal render setelah banner hero diunggah — `sanityImageLoader` adalah
    fungsi yang dilewatkan dari Server Component ke `next/image` (pelanggaran batas RSC); loader
    dipindah ke `images.loaderFile` global dan prop `loader` dihapus dari lima call-site;
    diverifikasi reproduksi 500→200 + build & smoke produksi hijau (§4.13).
25. Deploy Vercel + Sanity, push repo, dan pengisian §6 oleh user — langkah penutup yang
    tersisa setelah sesi ini.
