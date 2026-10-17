import Link from 'next/link';
import { categories, getCategories, getProductsByCategory, getProducts } from '@/lib/catalog';
import type { CategoryId } from '@/lib/catalog/types';
import { ProductCard } from './product-card';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Mode data mock untuk kebutuhan demo/testing:
 * - `?mock=empty`  -> tampilan katalog kosong
 * - `?mock=slow`   -> respons lambat (menguji skeleton/Suspense)
 * - `?mock=fail`   -> memicu error boundary (error.tsx)
 */
export async function CatalogResults({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const mock = first(params.mock);
  const kategoriParam = first(params.kategori);

  if (mock === 'slow') {
    await new Promise((resolve) => setTimeout(resolve, 2200));
  }
  if (mock === 'fail') {
    throw new Error('Simulasi kegagalan memuat katalog (mock=fail).');
  }

  const validCategoryIds = new Set(categories.map((category) => category.id));
  const activeCategory =
    kategoriParam && validCategoryIds.has(kategoriParam as CategoryId)
      ? (kategoriParam as CategoryId)
      : undefined;
  const categoryNotFound = Boolean(kategoriParam) && !activeCategory;

  const allProducts = getProducts();
  const productList = activeCategory ? getProductsByCategory(activeCategory) : allProducts;
  const shownProducts = mock === 'empty' ? [] : productList;

  return (
    <div>
      <div className="mt-6 flex flex-wrap gap-2" role="navigation" aria-label="Filter kategori">
        <FilterChip href="/katalog" active={!activeCategory} label="Semua" />
        {getCategories().map((category) => (
          <FilterChip
            key={category.id}
            href={`/katalog?kategori=${category.id}`}
            active={activeCategory === category.id}
            label={category.name}
          />
        ))}
      </div>

      {categoryNotFound && (
        <p
          role="status"
          className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          Kategori “{kategoriParam}” tidak ditemukan — menampilkan semua produk.
        </p>
      )}

      {mock === 'empty' ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
          <p className="text-lg font-bold text-slate-800">Belum ada produk di kategori ini</p>
          <p className="mt-1 text-sm text-slate-500">
            Ini adalah mode demo <code className="rounded bg-slate-200 px-1">?mock=empty</code>.
            Pada data nyata, beri tahu tim kami produk yang Anda butuhkan.
          </p>
          <Link
            href="/katalog"
            className="mt-5 inline-block rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Tampilkan semua produk
          </Link>
        </div>
      ) : (
        <>
          <h2 className="mt-4 text-sm font-normal text-slate-500">
            Menampilkan {shownProducts.length} produk
            {activeCategory ? ` di kategori ${activeCategory}` : ' di semua kategori'}.
          </h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {shownProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FilterChip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`inline-flex min-h-9 items-center rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
        active
          ? 'border-indigo-600 bg-indigo-600 text-white'
          : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
      }`}
    >
      {label}
    </Link>
  );
}
