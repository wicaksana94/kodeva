import type { Metadata } from 'next';
import Image from 'next/image';
import { getLandingContent } from '@/sanity/content';
import { getProductsByIds, getProductBySlug } from '@/lib/catalog';
import { productInitials } from '@/lib/ui/accents';
import { sanityImageLoader, sanityImageSrc } from '@/lib/sanity/image';
import { ProductCard } from '@/components/marketplace/product-card';
import { ProductMockup } from '@/components/marketplace/product-mockup';
import { TrackedCta } from '@/components/marketing/tracked-cta';
import { LeadForm } from '@/components/marketing/lead-form';
import { JsonLd } from '@/components/seo/json-ld';
import { DEFAULT_CAMPAIGN } from '@/lib/campaign';

export async function generateMetadata(): Promise<Metadata> {
  const content = await getLandingContent();
  return {
    title: content.hero.title,
    description: content.hero.subtitle,
    alternates: { canonical: '/' },
    openGraph: {
      title: content.hero.title,
      description: content.hero.subtitle,
      url: '/',
      type: 'website',
    },
  };
}

export default async function LandingPage() {
  const content = await getLandingContent();
  const campaignName = content.campaignName || DEFAULT_CAMPAIGN.name;
  const featuredProducts = getProductsByIds(content.featuredProductIds);
  const heroImageSrc = sanityImageSrc(content.hero.image);
  const heroMockupProduct = getProductBySlug('kasir-prima');

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  return (
    <>
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Kodeva',
            url: siteUrl,
            description:
              'Software bisnis untuk UMKM Indonesia: aplikasi kasir, HR & payroll, dan add-on pendukung.',
          },
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Kodeva',
            url: siteUrl,
            inLanguage: 'id-ID',
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: content.faqItems.map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: { '@type': 'Answer', text: item.answer },
            })),
          },
        ]}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/80 via-white to-white">
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-24 size-96 rounded-full bg-indigo-100/60 blur-3xl"
        />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 lg:grid-cols-2 lg:py-20">
          <div>
            {content.hero.eyebrow && (
              <p className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
                <span className="size-1.5 rounded-full bg-amber-500" aria-hidden="true" />
                {content.hero.eyebrow}
              </p>
            )}
            <h1 className="mt-4 text-3xl leading-tight font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              {content.hero.title}
            </h1>
            <p className="mt-4 max-w-xl text-base text-slate-600 sm:text-lg">
              {content.hero.subtitle}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <TrackedCta
                href={content.hero.ctaPrimaryHref || '/katalog'}
                label={content.hero.ctaPrimaryLabel}
                ctaId="hero-primary-cta"
                location="hero"
                campaign={campaignName}
              />
              {content.hero.ctaSecondaryLabel && (
                <TrackedCta
                  href={content.hero.ctaSecondaryHref || '#konsultasi'}
                  label={content.hero.ctaSecondaryLabel}
                  ctaId="hero-secondary-cta"
                  location="hero"
                  campaign={campaignName}
                  variant="secondary"
                />
              )}
            </div>
            <dl className="mt-8 grid max-w-md grid-cols-3 gap-4">
              {[
                { value: '15.000+', label: 'bisnis memakai' },
                { value: '4,8/5', label: 'rating pengguna' },
                { value: '99,9%', label: 'uptime layanan' },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="text-xs text-slate-500">{stat.label}</dt>
                  <dd className="text-lg font-extrabold text-slate-900">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            {heroImageSrc ? (
              <div className="relative aspect-[16/11] overflow-hidden rounded-3xl border border-slate-200 shadow-xl">
                <Image
                  src={heroImageSrc}
                  loader={sanityImageLoader}
                  alt={content.hero.image?.alt || content.hero.imageAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 560px"
                  priority
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="relative rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 p-6 shadow-xl sm:p-10">
                <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.25),transparent_55%)]" />
                <div className="relative rotate-[-1.5deg]">
                  {heroMockupProduct && (
                    <ProductMockup
                      productName={heroMockupProduct.name}
                      categoryId={heroMockupProduct.categoryId}
                      variant="dashboard"
                    />
                  )}
                </div>
                <p className="relative mt-4 text-center text-xs font-medium text-indigo-100">
                  {content.promoLabel ?? campaignName} —{' '}
                  {content.promoNote ?? 'diskon hingga 25% selama kuota tersedia'}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Produk unggulan */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {content.featuredHeading}
          </h2>
          {content.featuredSubheading && (
            <p className="mt-2 text-slate-600">{content.featuredSubheading}</p>
          )}
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <TrackedCta
            href="/katalog"
            label="Lihat semua produk"
            ctaId="featured-see-all"
            location="featured-products"
            campaign={campaignName}
            variant="secondary"
          />
        </div>
      </section>

      {/* Testimoni */}
      <section className="bg-slate-50 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              {content.testimonialsHeading}
            </h2>
            {content.testimonialsSubheading && (
              <p className="mt-2 text-slate-600">{content.testimonialsSubheading}</p>
            )}
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {content.testimonials.map((testimonial, index) => (
              <figure
                key={testimonial._key ?? `${testimonial.name}-${index}`}
                className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="flex gap-0.5 text-amber-400" aria-label="Rating 5 dari 5">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <svg key={starIndex} aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-4">
                      <path d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-slate-700">
                  “{testimonial.quote}”
                </blockquote>
                <figcaption className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
                  <span className="grid size-10 place-items-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                    {productInitials(testimonial.name)}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{testimonial.name}</p>
                    <p className="text-xs text-slate-500">{testimonial.role}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Lead capture */}
      <section id="konsultasi" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              {content.leadHeading}
            </h2>
            <p className="mt-3 text-slate-600">{content.leadSubheading}</p>
            <ul className="mt-6 space-y-3">
              {content.leadBullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                    <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-3">
                      <path
                        fillRule="evenodd"
                        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
          <LeadForm source="landing-lead-form" />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20 bg-slate-50 py-14">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-center text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {content.faqHeading}
          </h2>
          {content.faqSubheading && (
            <p className="mt-2 text-center text-slate-600">{content.faqSubheading}</p>
          )}
          <div className="mt-8 space-y-3">
            {content.faqItems.map((item, index) => (
              <details
                key={item._key ?? `${item.question}-${index}`}
                className="group rounded-2xl border border-slate-200 bg-white px-5 py-4 open:border-indigo-200 open:shadow-sm"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-slate-900 [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <span
                    aria-hidden="true"
                    className="grid size-6 shrink-0 place-items-center rounded-full border border-slate-300 text-slate-500 transition group-open:rotate-45 group-open:border-indigo-300 group-open:text-indigo-600"
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" className="size-3.5">
                      <path d="M10 5a.75.75 0 0 1 .75.75v3.5h3.5a.75.75 0 0 1 0 1.5h-3.5v3.5a.75.75 0 0 1-1.5 0v-3.5h-3.5a.75.75 0 0 1 0-1.5h3.5v-3.5A.75.75 0 0 1 10 5Z" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
