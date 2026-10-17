import Link from 'next/link';

const steps = [
  <>
    Buat project Sanity gratis di{' '}
    <a
      href="https://sanity.io/manage"
      target="_blank"
      rel="noreferrer"
      className="font-medium text-indigo-600 underline underline-offset-2 hover:text-indigo-700"
    >
      sanity.io/manage
    </a>{' '}
    (dataset default{' '}
    <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[13px]">production</code>
    ), lalu salin <strong>Project ID</strong>-nya.
  </>,
  <>
    Jalankan{' '}
    <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[13px]">
      cp .env.example .env.local
    </code>{' '}
    lalu isi{' '}
    <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[13px]">
      NEXT_PUBLIC_SANITY_PROJECT_ID
    </code>{' '}
    (tambahkan{' '}
    <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[13px]">SANITY_API_WRITE_TOKEN</code>{' '}
    bila ingin menjalankan{' '}
    <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[13px]">pnpm seed</code> dan menyimpan
    lead ke Sanity).
  </>,
  <>
    Di sanity.io/manage → <strong>API → CORS origins</strong>, tambahkan{' '}
    <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[13px]">http://localhost:3000</code>{' '}
    (nanti juga domain produksi).
  </>,
  <>
    Restart <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[13px]">pnpm dev</code>, buka{' '}
    <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[13px]">/studio</code> lagi, dan login
    dengan akun Sanity pemilik project.
  </>,
];

export function StudioSetupNotice() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-16">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <p className="text-xs font-semibold tracking-widest text-indigo-600 uppercase">
          Kodeva CMS
        </p>
        <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
          Sanity Studio belum dikonfigurasi
        </h1>
        <p className="mt-3 leading-relaxed text-slate-600">
          Situs tetap berjalan normal dengan konten <em>fallback</em> lokal. Studio ini aktif
          setelah project Sanity tersambung — ikuti langkah berikut:
        </p>
        <ol className="mt-6 space-y-4 text-sm leading-relaxed text-slate-700">
          {steps.map((step, index) => (
            <li key={index} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <div className="mt-8 border-t border-slate-100 pt-6">
          <Link
            href="/"
            className="text-sm font-medium text-indigo-600 underline underline-offset-2 hover:text-indigo-700"
          >
            ← Kembali ke situs
          </Link>
        </div>
      </div>
    </main>
  );
}
