import type { Metadata } from 'next';
import { Suspense } from 'react';
import { BlogList } from '@/components/blog/blog-list';

export const metadata: Metadata = {
  title: 'Blog & Panduan',
  description:
    'Tips praktis mengelola kasir, stok, HR, dan payroll untuk UMKM — dari tim Kodeva.',
  alternates: { canonical: '/blog' },
};

export default function BlogPage(props: PageProps<'/blog'>) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Blog &amp; Panduan</h1>
        <p className="mt-2 text-slate-600">
          Cerita, panduan, dan tips operasional dari tim produk Kodeva untuk bisnis Anda.
        </p>
      </div>
      <Suspense fallback={<BlogSkeleton />}>
        <BlogList searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

function BlogSkeleton() {
  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Memuat artikel…">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
      ))}
    </div>
  );
}
