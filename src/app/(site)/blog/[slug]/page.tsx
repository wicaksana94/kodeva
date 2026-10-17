import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug, getPostSlugs } from '@/sanity/content';
import { estimateReadingMinutes, formatPostDate } from '@/lib/blog';
import { getProductsByIds } from '@/lib/catalog';
import { absoluteUrl, getSiteUrl } from '@/lib/site';
import { sanityImageLoader, sanityImageSrc } from '@/lib/sanity/image';
import { PostBody } from '@/components/blog/post-body';
import { ProductCard } from '@/components/marketplace/product-card';
import { TrackedCta } from '@/components/marketing/tracked-cta';
import { JsonLd } from '@/components/seo/json-ld';
import { DEFAULT_CAMPAIGN } from '@/lib/campaign';

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps<'/blog/[slug]'>): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Artikel tidak ditemukan' };
  const coverSrc = sanityImageSrc(post.cover);
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.publishedAt ?? undefined,
      ...(coverSrc ? { images: [{ url: coverSrc }] } : {}),
    },
  };
}

export default async function BlogPostPage(props: PageProps<'/blog/[slug]'>) {
  const { slug } = await props.params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const relatedProducts = getProductsByIds(post.relatedProductIds).slice(0, 3);
  const coverSrc = sanityImageSrc(post.cover);
  const readingMinutes = estimateReadingMinutes(post.body);

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt,
            datePublished: post.publishedAt,
            dateModified: post.publishedAt,
            inLanguage: 'id-ID',
            author: { '@type': 'Organization', name: 'Tim Kodeva' },
            publisher: { '@type': 'Organization', name: 'Kodeva', url: getSiteUrl() },
            mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
            ...(coverSrc ? { image: coverSrc } : {}),
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Beranda', item: getSiteUrl() },
              { '@type': 'ListItem', position: 2, name: 'Blog', item: absoluteUrl('/blog') },
              {
                '@type': 'ListItem',
                position: 3,
                name: post.title,
                item: absoluteUrl(`/blog/${post.slug}`),
              },
            ],
          },
        ]}
      />

      <nav aria-label="Breadcrumb" className="text-xs text-slate-500">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-indigo-700">
              Beranda
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/blog" className="hover:text-indigo-700">
              Blog
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="truncate font-semibold text-slate-700">
            {post.title}
          </li>
        </ol>
      </nav>

      <header className="mt-5">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {post.category && (
            <span className="rounded-full bg-indigo-50 px-3 py-1 font-semibold text-indigo-700 ring-1 ring-indigo-200">
              {post.category.name}
            </span>
          )}
          <time dateTime={post.publishedAt ?? undefined} className="text-slate-500">
            {formatPostDate(post.publishedAt)}
          </time>
          <span className="text-slate-500">·</span>
          <span className="text-slate-500">{readingMinutes} menit baca</span>
        </div>
        <h1 className="mt-3 text-3xl leading-tight font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          {post.title}
        </h1>
        <p className="mt-3 text-lg text-slate-600">{post.excerpt}</p>
        <p className="mt-4 text-sm text-slate-500">
          Oleh <span className="font-semibold text-slate-700">Tim Kodeva</span>
        </p>
      </header>

      {coverSrc && (
        <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl border border-slate-200">
          <Image
            src={coverSrc}
            loader={sanityImageLoader}
            alt={post.cover?.alt || post.title}
            fill
            sizes="(max-width: 768px) 100vw, 720px"
            priority
            className="object-cover"
          />
        </div>
      )}

      <div className="mt-6">
        <PostBody value={post.body} />
      </div>

      {relatedProducts.length > 0 && (
        <section className="mt-12 border-t border-slate-200 pt-8">
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
            Produk yang dibahas di artikel ini
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 p-6 text-center sm:p-8">
        <h2 className="text-xl font-extrabold text-white">
          Siap rapikan operasional bisnis Anda?
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-indigo-100">
          Konsultasi gratis dengan tim kami, atau langsung jelajahi {DEFAULT_CAMPAIGN.name}.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <TrackedCta
            href="/#konsultasi"
            label="Konsultasi Gratis"
            ctaId="blog-post-consult-cta"
            location="blog-post"
            campaign={DEFAULT_CAMPAIGN.name}
            className="bg-white! text-indigo-700! hover:bg-indigo-50!"
          />
          <Link
            href="/katalog"
            className="inline-flex min-h-11 items-center rounded-xl border border-indigo-300/60 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Lihat Katalog
          </Link>
        </div>
      </section>
    </article>
  );
}
