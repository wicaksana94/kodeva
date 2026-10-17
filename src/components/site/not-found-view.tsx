import Link from 'next/link';

export function NotFoundView() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
      <p className="text-sm font-bold tracking-widest text-indigo-600 uppercase">Error 404</p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        Halaman tidak ditemukan
      </h1>
      <p className="mt-3 max-w-md text-slate-600">
        Halaman yang Anda cari mungkin sudah dipindahkan, dihapus, atau alamatnya salah ketik.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Kembali ke beranda
        </Link>
        <Link
          href="/katalog"
          className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
        >
          Jelajahi katalog produk
        </Link>
      </div>
    </div>
  );
}
