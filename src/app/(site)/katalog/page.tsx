import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CatalogResults } from '@/components/marketplace/catalog-results';

export const metadata: Metadata = {
  title: 'Katalog Produk',
  description:
    'Jelajahi produk Kodeva: aplikasi kasir, HR & payroll, dan add-on pendukung untuk bisnis Anda.',
  alternates: { canonical: '/katalog' },
};

export default function CatalogPage(props: PageProps<'/katalog'>) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Katalog Produk</h1>
        <p className="mt-2 text-slate-600">
          Semua produk Kodeva dengan tiga tingkat paket (Basic, Pro, Business). Harga di bawah
          adalah harga per lisensi per bulan.
        </p>
      </div>
      <Suspense fallback={<CatalogSkeleton />}>
        <CatalogResults searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

function CatalogSkeleton() {
  return (
    <div aria-label="Memuat katalog…" role="status">
      <div className="mt-6 flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <span key={index} className="h-9 w-28 animate-pulse rounded-full bg-slate-200" />
        ))}
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
          />
        ))}
      </div>
    </div>
  );
}
