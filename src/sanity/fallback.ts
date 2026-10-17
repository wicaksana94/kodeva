import type { PortableTextBlock } from '@portabletext/react';
import { DEFAULT_CAMPAIGN } from '@/lib/campaign';
import { DEFAULT_FEATURED_PRODUCT_IDS } from '@/lib/catalog/data';
import type { LandingContent, PostDetail } from './types';

type Inline = string | { text: string; bold?: boolean };

let keyCounter = 0;
function nextKey(prefix: string): string {
  keyCounter += 1;
  return `${prefix}-${keyCounter}`;
}

function richBlock(style: string, segments: Inline[]): PortableTextBlock {
  return {
    _type: 'block',
    _key: nextKey(style),
    style,
    markDefs: [],
    children: segments.map((segment, index) => {
      const text = typeof segment === 'string' ? segment : segment.text;
      const bold = typeof segment === 'string' ? false : Boolean(segment.bold);
      return {
        _type: 'span',
        _key: `${nextKey('span')}-${index}`,
        text,
        marks: bold ? ['strong'] : [],
      };
    }),
  } as PortableTextBlock;
}

function bulletList(items: string[]): PortableTextBlock[] {
  return items.map(
    (item) =>
      ({
        _type: 'block',
        _key: nextKey('bullet'),
        style: 'normal',
        listItem: 'bullet',
        level: 1,
        markDefs: [],
        children: [{ _type: 'span', _key: nextKey('span'), text: item, marks: [] }],
      }) as PortableTextBlock,
  );
}

export const fallbackLanding: LandingContent = {
  campaignName: DEFAULT_CAMPAIGN.name,
  hero: {
    eyebrow: 'Promo Akhir Tahun — kuota terbatas',
    title: 'Software bisnis lengkap untuk UMKM yang siap tumbuh',
    subtitle:
      'Aplikasi kasir, HR & payroll, dan add-on pendukung dalam satu ekosistem lisensi. Diskon hingga 25% sepanjang Promo Akhir Tahun.',
    image: null,
    imageAlt: 'Tangkapan layar aplikasi Kodeva',
    mockupProductId: 'kasir-prima',
    stats: [
      { value: '15.000+', label: 'bisnis memakai' },
      { value: '4,8/5', label: 'rating pengguna' },
      { value: '99,9%', label: 'uptime layanan' },
    ],
    ctaPrimaryLabel: 'Belanja Promo Sekarang',
    ctaPrimaryHref: '/katalog',
    ctaSecondaryLabel: 'Konsultasi Gratis',
    ctaSecondaryHref: '#konsultasi',
  },
  featuredHeading: 'Produk unggulan bulan ini',
  featuredSubheading:
    'Paling banyak dipakai UMKM Indonesia — dari warung hingga jaringan resto dan tim HR.',
  featuredProductIds: DEFAULT_FEATURED_PRODUCT_IDS,
  featuredCtaLabel: 'Lihat semua produk',
  testimonialsHeading: 'Dipercaya ribuan pemilik usaha',
  testimonialsSubheading: 'Cerita nyata dari pengguna produk Kodeva.',
  testimonials: [
    {
      name: 'Rina Wijaya',
      role: 'Pemilik, Toko Rina Mart (3 outlet)',
      quote:
        'Sejak pakai Kasir Prima, laporan penjualan semua outlet bisa saya pantau dari HP sambil sarapan. Stok tidak pernah lagi kosong diam-diam.',
    },
    {
      name: 'Budi Santoso',
      role: 'Founder, Kopi Senja',
      quote:
        'Split bill dan pesanan ke dapur lewat Kitchen Display bikin pelayanan kami jauh lebih cepat. Pelanggan tidak lagi mengeluh menunggu lama.',
    },
    {
      name: 'Maya Kusuma',
      role: 'HR Manager, PT Sinar Abadi',
      quote:
        'Proses payroll 120 karyawan yang dulu 3 hari sekarang selesai 2 jam. Hitungan PPh 21 dan BPJS-nya otomatis, tidak ada lagi koreksi manual.',
    },
  ],
  faqHeading: 'Pertanyaan yang sering diajukan',
  faqSubheading: 'Belum menemukan jawabannya? Tim kami siap membantu setiap hari kerja.',
  faqItems: [
    {
      question: 'Apakah harga promo berlaku untuk semua paket?',
      answer:
        'Kuota promo berlaku untuk paket yang bertanda harga coret di halaman produk. Kuota dihitung dari total lisensi produk yang sama di keranjang Anda, berlaku hingga kuota produk habis.',
    },
    {
      question: 'Bagaimana cara saya mulai berlangganan?',
      answer:
        'Pilih produk dan paket di katalog, tentukan jumlah lisensi, lalu selesaikan checkout. Setelah pembayaran berhasil, lisensi dikirim ke email Anda dan bisa langsung diaktivasi.',
    },
    {
      question: 'Apakah data saya aman?',
      answer:
        'Data tersimpan terenkripsi di pusat data di Indonesia dengan backup harian. Anda juga dapat mengekspor seluruh data kapan saja tanpa biaya tambahan.',
    },
    {
      question: 'Bisakah saya berganti paket di tengah langganan?',
      answer:
        'Bisa. Upgrade paket dapat dilakukan kapan saja dan hanya membayar selisih prorata. Downgrade berlaku pada periode tagihan berikutnya.',
    },
  ],
  leadHeading: 'Dapatkan penawaran khusus untuk bisnis Anda',
  leadSubheading:
    'Tinggalkan kontak Anda, tim kami akan menghubungi Anda dengan rekomendasi paket dan penawaran Promo Akhir Tahun yang masih tersisa.',
  leadBullets: [
    'Konsultasi gratis 30 menit dengan tim produk',
    'Rekomendasi paket sesuai ukuran usaha',
    'Prioritas kuota promo akhir tahun',
  ],
  promoLabel: DEFAULT_CAMPAIGN.name,
  promoNote: 'Diskon hingga 25% selama kuota lisensi promo masih tersedia.',
};

export const fallbackPosts: PostDetail[] = [
  {
    id: 'fallback-post-1',
    title: '5 Cara Meningkatkan Penjualan Toko dengan Aplikasi Kasir',
    slug: '5-cara-meningkatkan-penjualan-toko-dengan-aplikasi-kasir',
    excerpt:
      'Aplikasi kasir bukan sekadar alat hitung. Lima cara praktis ini membantu toko Anda menjual lebih banyak tanpa menambah jam kerja.',
    cover: null,
    category: { name: 'Tips Bisnis', slug: 'tips-bisnis' },
    publishedAt: '2026-10-16T09:00:00.000Z',
    relatedProductIds: ['kasir-prima', 'kasir-warung'],
    body: [
      richBlock('normal', [
        'Banyak pemilik toko masih memakai aplikasi kasir hanya untuk menghitung total belanja. Padahal, data yang terkumpul di kasir bisa menjadi mesin pertumbuhan jika dimanfaatkan dengan benar.',
      ]),
      richBlock('h2', ['1. Kenali jam dan hari paling ramai']),
      richBlock('normal', [
        'Laporan penjualan per jam memberi tahu kapan toko Anda paling ramai. Tambah staf pada jam sibuk, dan jadwalkan promosi pada jam sepi untuk meratakan kunjungan pelanggan.',
      ]),
      richBlock('h2', ['2. Susun rak berdasarkan data, bukan perkiraan']),
      richBlock('normal', [
        'Produk terlaris sebaiknya berada di area paling terlihat. Keluarkan laporan penjualan per produk setiap minggu, lalu geser rak dan etalase mengikuti data tersebut.',
      ]),
      richBlock('h2', ['3. Pasang batas stok minimum']),
      richBlock('normal', [
        'Kehilangan penjualan karena stok kosong adalah hal yang bisa dicegah. Atur notifikasi stok menipis sehingga Anda bisa memesan ulang sebelum barang habis.',
        { text: ' ', bold: false },
      ]),
      richBlock('h2', ['4. Manfaatkan data pelanggan setia']),
      richBlock('normal', [
        'Dengan mencatat pelanggan di kasir, Anda bisa mengirim promosi langsung ke pembeli yang paling sering datang. Pelanggan lama lima kali lebih mudah membeli lagi dibanding pelanggan baru.',
      ]),
      richBlock('h2', ['5. Evaluasi dengan angka, bukan perasaan']),
      richBlock('normal', [
        'Tutup hari dengan membaca tiga angka: omzet, jumlah transaksi, dan rata-rata nilai belanja. Ketika rata-rata nilai belanja turun, dorong paket bundling; ketika jumlah transaksi turun, gencarkan promosi.',
      ]),
      richBlock('h2', ['Mulai dari yang kecil']),
      richBlock('normal', [
        'Anda tidak perlu semua fitur sekaligus. Mulai dari mencatat transaksi, lihat pola di laporan, lalu terapkan satu perbaikan setiap minggu. Dalam sebulan, dampaknya akan terasa di omzet.',
      ]),
      ...bulletList([
        'Baca laporan harian dalam 5 menit setiap pagi',
        'Tandai 10 produk terlaris dan pastikan selalu tersedia',
        'Kirim satu promosi per minggu ke pelanggan setia',
      ]),
    ],
  },
  {
    id: 'fallback-post-2',
    title: 'Panduan Menghitung Gaji, BPJS, dan PPh 21 Karyawan UMKM',
    slug: 'panduan-menghitung-gaji-bpjs-pph-21-karyawan-umkm',
    excerpt:
      'Aturan penggajian berubah setiap tahun. Panduan ringkas ini membantu Anda menghitung gaji bersih karyawan secara benar tanpa menjadi ahli pajak.',
    cover: null,
    category: { name: 'HR & Payroll', slug: 'hr-payroll' },
    publishedAt: '2026-10-14T08:30:00.000Z',
    relatedProductIds: ['hr-prima', 'payroll-express'],
    body: [
      richBlock('normal', [
        'Menghitung gaji karyawan melibatkan lebih dari sekadar gaji pokok: ada potongan BPJS, PPh 21, dan komponen lain yang harus tepat. Kesalahan kecil bisa berdampak pada sanksi dan kepercayaan tim.',
      ]),
      richBlock('h2', ['Langkah 1 — Kumpulkan komponen penghasilan']),
      richBlock('normal', [
        'Mulai dari gaji pokok, lalu tambahkan tunjangan tetap (jabatan, transportasi, makan). Tunjangan tetap menjadi dasar perhitungan BPJS, sedangkan bonus dan THR diperlakukan berbeda.',
      ]),
      richBlock('h2', ['Langkah 2 — Hitung potongan BPJS Kesehatan dan Ketenagakerjaan']),
      richBlock('normal', [
        'BPJS Kesehatan karyawan menanggung 1% dari upah, perusahaan 4%. Untuk JKK, JKM, dan JHT, persentasenya berbeda-beda sesuai profil risiko perusahaan. Pastikan batas atas upah mengikuti ketentuan terbaru.',
      ]),
      richBlock('h2', ['Langkah 3 — Hitung PPh 21 dengan tarif efektif']),
      richBlock('normal', [
        'Sejak 2024, pemotongan PPh 21 bulanan memakai tarif efektif rata-rata (TER) berdasarkan status PTKP dan kategori penghasilan. Sistem seperti HR Prima menghitung ini otomatis sehingga Anda tidak perlu membuka tabel tarif setiap bulan.',
      ]),
      richBlock('h2', ['Langkah 4 — Terbitkan slip gaji dan arsipkan']),
      richBlock('normal', [
        'Slip gaji wajib diberikan setiap bulan, dan arsip perhitungan harus disimpan rapi untuk keperluan pemeriksaan. Slip digital mengurangi waktu distribusi sekaligus menjadi arsip yang mudah dicari.',
      ]),
      ...bulletList([
        'Simpan bukti potong dan bukti setor minimal 10 tahun',
        'Rekonsiliasi data absensi sebelum payroll untuk menghindari salah bayar',
        'Berikan slip gaji paling lambat bersamaan dengan pembayaran gaji',
      ]),
    ],
  },
  {
    id: 'fallback-post-3',
    title: 'Promo Akhir Tahun Kodeva: Cara Klaim Diskon Lisensi hingga 25%',
    slug: 'promo-akhir-tahun-kodeva-cara-klaim-disku-lisensi',
    excerpt:
      'Kuota lisensi promo terbatas per produk. Ini cara memastikan bisnis Anda mendapat harga terbaik sebelum kuota habis.',
    cover: null,
    category: { name: 'Promo', slug: 'promo' },
    publishedAt: '2026-10-10T07:00:00.000Z',
    relatedProductIds: ['kasir-prima', 'manajemen-stok', 'hr-prima'],
    body: [
      richBlock('normal', [
        'Promo Akhir Tahun Kodeva berlangsung selama kuota lisensi promo masih tersedia. Diskon hingga 25% berlaku untuk paket bertanda harga coret di halaman produk, baik untuk lisensi per pengguna maupun per outlet.',
      ]),
      richBlock('h2', ['Bagaimana kuota promo dihitung?']),
      richBlock('normal', [
        'Setiap produk memiliki kuota lisensi promo tersendiri. Jika beberapa paket dari produk yang sama sama-sama bertanda promo, kuota dihitung dari total lisensi produk tersebut di keranjang — bukan per paket — sehingga Anda leluasa mengombinasikan paket.',
      ]),
      richBlock('h2', ['Tips mendapatkan harga terbaik']),
      ...bulletList([
        'Cek sisa kuota promo di halaman detail produk sebelum checkout',
        'Kombinasikan paket Pro untuk staf dan Business untuk manajer dalam satu checkout',
        'Selesaikan checkout Anda — lisensi promo dikirim setelah pembayaran berhasil',
      ]),
      richBlock('h2', ['Setelah pembayaran berhasil']),
      richBlock('normal', [
        'Lisensi dikirim ke email pembeli lengkap dengan kode aktivasi. Anda dapat langsung mengaktivasi di dashboard Kodeva tanpa menunggu tim sales.',
      ]),
    ],
  },
];

export const fallbackDraftPost = {
  title: 'Checklist Digitalisasi Warung dari Nol',
  slug: 'checklist-digitalisasi-warung-dari-nol',
  excerpt:
    'Langkah demi langkah memindahkan warung manual ke kasir digital tanpa mengganggu operasional harian.',
  category: { name: 'Tips Bisnis', slug: 'tips-bisnis' },
  relatedProductIds: ['kasir-warung'],
};

export const fallbackCategories = [
  { name: 'Tips Bisnis', slug: 'tips-bisnis' },
  { name: 'HR & Payroll', slug: 'hr-payroll' },
  { name: 'Promo', slug: 'promo' },
  { name: 'Berita Produk', slug: 'berita-produk' },
];
