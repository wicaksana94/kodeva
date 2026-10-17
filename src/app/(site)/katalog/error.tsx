'use client';

import Link from 'next/link';

export default function CatalogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div
        role="alert"
        className="rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center"
      >
        <p className="text-sm font-bold tracking-widest text-red-600 uppercase">Terjadi kesalahan</p>
        <h1 className="mt-2 text-2xl font-extrabold text-slate-900">
          Katalog gagal dimuat
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
          Silakan coba lagi. Jika Anda mengakses dengan{' '}
          <code className="rounded bg-red-100 px-1">?mock=fail</code>, ini adalah simulasi kegagalan
          yang memang disengaja untuk pengujian.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Coba lagi
          </button>
          <Link
            href="/katalog"
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Muat ulang katalog
          </Link>
        </div>
        {error.digest && <p className="mt-4 text-[11px] text-slate-500">Ref: {error.digest}</p>}
      </div>
    </div>
  );
}
