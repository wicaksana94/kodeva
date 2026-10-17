# AI_LOG — Penggunaan AI selama pengerjaan

> Dokumen ini mencatat penggunaan AI secara jujur selama pengerjaan Technical Skill Test
> Fullstack Developer (PT Digital Solusi Grup). Log diisi **secara inkremental** selama sesi
> pengerjaan; entri baru ditambahkan setiap kali ada kejadian penting (kesalahan AI yang
> ditemukan, bagian yang diverifikasi, dsb.). Referensi commit ikut dicantumkan agar dapat
> ditelusuri di riwayat Git.

## 1. Tools yang dipakai dan untuk bagian apa

| Tool | Dipakai untuk |
| --- | --- |
| **opencode CLI** (model `opencode/deepseek-v4.1-flash-free`) | Pair-programming utama sepanjang sesi: menganalisis brief, memutuskan arsitektur, menulis hampir seluruh kode, unit test, dokumentasi README/AI_LOG |
| **firecrawl CLI** (skill `firecrawl-parse` di opencode) | Mengonversi brief PDF `Fullstack_Developer_Skill_Test_DSG.pdf` menjadi markdown (`.firecrawl/skill-test.md`) karena model tidak bisa membaca PDF secara langsung |
| Terminal via opencode (pnpm, Node.js 24, git) | Scaffold project, install dependency, menjalankan lint/typecheck/test/build, commit |

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

   **Kenapa membantu:** memberi mandat eksekusi penuh *sekaligus* izin eksplisit untuk bertanya
   saat ambigu. Hasilnya AI tidak menebak-nebak stack/CMS, melainkan menyusun 3 pertanyaan
   terstruktur (CMS, scope, deploy) via fitur question sebelum menulis satu baris kode pun.
   Ini mencegah pemborosan waktu karena salah asumsi arsitektur.

2. > "Cantumkan log penggunaan ai di opencode pada sesi ini di AI_LOG.md"

   **Kenapa membantu:** permintaan deliverable yang eksplisit menyebut *format* (AI_LOG.md),
   *sumber* (sesi opencode ini), dan *lokasi*. AI langsung bisa mengeksekusi tanpa tanya balik,
   dan penilaian "Dokumentasi & AI log" (20 poin) terpenuhi dengan pencatatan yang terjadi
   *selama* proses, bukan rekonstruksi setelah selesai.

3. *(akan ditambah jika ada prompt lanjutan yang terbukti produktif — mis. prompt verifikasi
   Lighthouse/deploy)*

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
  (`chore: scaffold ...`, `aff95f3`).

### 4.2 Keterbatasan alat: model tidak bisa membaca PDF secara langsung

- **Nat:** permintaan awal adalah "baca [PDF 1]". Model menjawab dengan error
  `Cannot read "Fullstack_Developer_Skill_Test_DSG.pdf" (this model does not support pdf input)` —
  yaitu AI **berhenti dan memberi tahu user**, bukan mengarang isi brief.
- **Perbaikan:** konversi PDF → markdown memakai firecrawl CLI (`firecrawl parse`), hasil di
  `.firecrawl/skill-test.md`.
- **Verifikasi:** seluruh 235 baris brief terbaca lengkap (instruksi umum, skenario, Bagian A/B/C,
  bonus, tabel kriteria penilaian) dan dicocokkan ulang terhadap aksi yang dikerjakan.

### 4.3 *(slot contoh ke-3 — akan diisi bila ditemukan lagi; mis. bug yang tertangkap unit test)*

## 5. Bagian implementasi yang banyak dibantu AI + edge case yang diuji

- **Logika harga & kuota promo (`src/lib/cart/logic.ts`) + unit test** — akan dilaporkan lengkap
  di sini setelah bagian keranjang selesai (unit test kuota lintas baris, paket campuran,
  pelepasan kuota saat qty dikurangi, dsb.).
- **Tracking GA4/dataLayer + atribusi UTM** — akan dilaporkan setelah bagian tracking selesai
  (bukti event tidak terkirim ulang saat re-render).

## 6. Bagian yang sengaja dikerjakan tanpa AI

*(Diisi oleh user di akhir pengerjaan — berisi bagian mana yang sengaja ditulis/diputuskan
tanpa bantuan AI beserta alasannya, mis. review akhir terhadap kode yang di-generate AI atau
penulisan konten copy landing page.)*

---

### Riwayat singkat sesi (untuk konteks)

1. Brief PDF dikonversi ke markdown, requirement & kriteria penilaian dianalisis AI.
2. User memutuskan CMS (Sanity), scope (wajib saja), dan alur deploy (via CLI).
3. Scaffold `kodeva`: Next.js 16 (App Router) + TypeScript + Tailwind 4; dependency: `sanity`,
   `next-sanity`, `zustand`, `zod`; tooling: `vitest`, `prettier`, `tsx`.
4. `pnpm-workspace.yaml` diperbaiki (`allowBuilds`) — lihat §4.1.
5. Lapisan domain katalog (`src/lib/catalog/types.ts`) mulai disusun.
6. AI_LOG.md ini dibuat dan di-commit agar tercatat sebagai bagian dari deliverable.
