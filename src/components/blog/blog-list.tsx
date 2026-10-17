import Link from 'next/link';
import { getPostsPage, POSTS_PAGE_SIZE } from '@/sanity/content';
import { PostCard } from './post-card';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function parsePage(value: string | string[] | undefined): { page: number; invalid: boolean } {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === undefined) return { page: 1, invalid: false };
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1) return { page: 1, invalid: true };
  return { page: parsed, invalid: false };
}

export async function BlogList({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const { page: requestedPage, invalid } = parsePage(params.page);
  const data = await getPostsPage(requestedPage);
  const clamped = data.page !== requestedPage;

  if (data.posts.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
        <p className="text-lg font-bold text-slate-800">Belum ada artikel</p>
        <p className="mt-1 text-sm text-slate-500">
          Artikel pertama sedang disiapkan tim marketing. Cek kembali sebentar lagi.
        </p>
      </div>
    );
  }

  return (
    <div>
      {(invalid || clamped) && (
        <p
          role="status"
          className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          {invalid
            ? `Parameter halaman tidak valid — menampilkan halaman 1 dari ${data.totalPages}.`
            : `Halaman ${requestedPage} tidak tersedia — menampilkan halaman terakhir (${data.page} dari ${data.totalPages}).`}
        </p>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {data.totalPages > 1 && (
        <nav
          aria-label="Navigasi halaman artikel"
          className="mt-10 flex items-center justify-between gap-4"
        >
          {data.page > 1 ? (
            <Link
              href={data.page === 2 ? '/blog' : `/blog?page=${data.page - 1}`}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              ← Sebelumnya
            </Link>
          ) : (
            <span aria-hidden="true" />
          )}
          <span className="text-sm text-slate-500" role="status">
            Halaman {data.page} dari {data.totalPages} · {data.total} artikel
          </span>
          {data.page < data.totalPages ? (
            <Link
              href={`/blog?page=${data.page + 1}`}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Berikutnya →
            </Link>
          ) : (
            <span aria-hidden="true" />
          )}
        </nav>
      )}
      {data.totalPages === 1 && (
        <p className="mt-8 text-center text-sm text-slate-500" role="status">
          {data.total} artikel · {POSTS_PAGE_SIZE} per halaman
        </p>
      )}
    </div>
  );
}
