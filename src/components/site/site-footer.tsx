import Link from 'next/link';
import { getCurrentYear } from '@/lib/time';

export async function SiteFooter() {
  const year = await getCurrentYear();
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-base font-black text-white">
                K
              </span>
              <span className="text-base font-extrabold tracking-tight text-slate-900">Kodeva</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-slate-600">
              Software bisnis untuk UMKM Indonesia: aplikasi kasir, HR &amp; payroll, dan add-on
              pendukungnya dalam satu ekosistem lisensi.
            </p>
          </div>
          <nav aria-label="Tautan footer">
            <h2 className="text-sm font-bold text-slate-900">Navigasi</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/katalog" className="hover:text-indigo-700">
                  Katalog produk
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-indigo-700">
                  Blog &amp; panduan
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-indigo-700">
                  Pertanyaan umum
                </Link>
              </li>
              <li>
                <Link href="/studio" className="hover:text-indigo-700">
                  Admin CMS
                </Link>
              </li>
            </ul>
          </nav>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Kontak</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>halo@kodeva.example</li>
              <li>WhatsApp: 0812-0000-0000</li>
              <li>Jakarta Selatan, Indonesia</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-200 pt-6 text-xs text-slate-500">
          <p>
            © {year} Kodeva (brand fiktif). Situs demo untuk keperluan technical skill test —
            seluruh produk, harga, testimoni, dan kontak adalah data dummy.
          </p>
        </div>
      </div>
    </footer>
  );
}
