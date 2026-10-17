import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getCategoryById,
  getLicenseUnitLabel,
  getLowestUnitPrice,
  getProductBySlug,
  getProducts,
  productHasActivePromo,
} from '@/lib/catalog';
import { formatIDR } from '@/lib/money';
import { ProductGallery } from '@/components/marketplace/product-gallery';
import { AddToCartPanel } from '@/components/marketplace/add-to-cart-panel';
import { ViewItemTracker } from '@/components/analytics/view-item-tracker';
import { JsonLd } from '@/components/seo/json-ld';
import { DEFAULT_CAMPAIGN } from '@/lib/campaign';

export function generateStaticParams() {
  return getProducts().map((product) => ({ slug: product.slug }));
}

export async function generateMetadata(props: PageProps<'/produk/[slug]'>): Promise<Metadata> {
  const { slug } = await props.params;
  const product = getProductBySlug(slug);
  if (!product) return { title: 'Produk tidak ditemukan' };
  return {
    title: `${product.name} — ${product.tagline}`,
    description: product.description,
    alternates: { canonical: `/produk/${product.slug}` },
    openGraph: {
      title: `${product.name} | Kodeva`,
      description: product.tagline,
      url: `/produk/${product.slug}`,
      type: 'website',
    },
  };
}

export default async function ProductDetailPage(props: PageProps<'/produk/[slug]'>) {
  const { slug } = await props.params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const category = getCategoryById(product.categoryId);
  const lowestPrice = getLowestUnitPrice(product);
  const promoActive = productHasActivePromo(product);
  const licenseUnit = getLicenseUnitLabel(product);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: product.description,
            brand: { '@type': 'Brand', name: 'Kodeva' },
            category: category?.name,
            offers: {
              '@type': 'AggregateOffer',
              priceCurrency: 'IDR',
              lowPrice: lowestPrice,
              highPrice: Math.max(...product.packages.map((pkg) => pkg.pricePerLicensePerMonth)),
              offerCount: product.packages.length,
              availability: 'https://schema.org/InStock',
              url: `${siteUrl}/produk/${product.slug}`,
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: product.rating,
              bestRating: 5,
              reviewCount: 120,
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Beranda', item: siteUrl },
              { '@type': 'ListItem', position: 2, name: 'Katalog', item: `${siteUrl}/katalog` },
              {
                '@type': 'ListItem',
                position: 3,
                name: product.name,
                item: `${siteUrl}/produk/${product.slug}`,
              },
            ],
          },
        ]}
      />
      <ViewItemTracker productId={product.id} campaign={DEFAULT_CAMPAIGN.name} />

      <nav aria-label="Breadcrumb" className="text-xs text-slate-500">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-indigo-700">
              Beranda
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/katalog" className="hover:text-indigo-700">
              Katalog
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-semibold text-slate-700">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="mt-5 grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/katalog?kategori=${product.categoryId}`}
              className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200 hover:bg-indigo-100"
            >
              {category?.name ?? product.categoryId}
            </Link>
            <span className="text-xs text-slate-500">★ {product.rating.toFixed(1)}</span>
            <span className="text-xs text-slate-500">· {product.customers}</span>
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-2 text-lg text-slate-600">{product.tagline}</p>

          <div className="mt-6">
            <ProductGallery productName={product.name} categoryId={product.categoryId} />
          </div>

          <section className="mt-8">
            <h2 className="text-lg font-bold text-slate-900">Tentang produk ini</h2>
            <p className="mt-2 leading-relaxed text-slate-600">{product.description}</p>
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-bold text-slate-900">Keunggulan utama</h2>
            <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {product.highlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="size-3"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  {highlight}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-sm font-bold text-slate-900">Detail lisensi</h2>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-slate-500">Satuan lisensi</dt>
                <dd className="font-semibold text-slate-900 capitalize">Per {licenseUnit}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Masa aktif</dt>
                <dd className="font-semibold text-slate-900">12 bulan</dd>
              </div>
              <div>
                <dt className="text-slate-500">Mulai dari</dt>
                <dd className="font-semibold text-slate-900">{formatIDR(lowestPrice)}</dd>
              </div>
            </dl>
            {promoActive && product.promo && product.promoQuota && (
              <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                {product.promo.label}: {product.promo.note} Sisa kuota{' '}
                {product.promoQuota.remaining} lisensi.
              </p>
            )}
          </section>
        </div>

        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-20">
            <AddToCartPanel product={product} campaign={DEFAULT_CAMPAIGN.name} />
            <ul className="mt-4 space-y-2 text-xs text-slate-500">
              <li>✓ Garansi uang kembali 30 hari</li>
              <li>✓ Instalasi &amp; migrasi data dibantu tim kami</li>
              <li>✓ Support Bahasa Indonesia via WhatsApp</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
