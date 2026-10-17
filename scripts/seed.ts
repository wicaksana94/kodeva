/**
 * Seed konten awal ke Sanity dari data fallback lokal.
 *
 * Cara pakai:
 *   pnpm seed
 *
 * Butuh env (boleh via .env / .env.local):
 *   NEXT_PUBLIC_SANITY_PROJECT_ID
 *   NEXT_PUBLIC_SANITY_DATASET (default: production)
 *   SANITY_API_WRITE_TOKEN
 *
 * Script ini idempotent: setiap dokumen memakai _id tetap dan ditulis dengan
 * createOrReplace, jadi aman dijalankan berulang kali.
 */
import { getSanityWriteClient } from '../src/sanity/client';
import {
  fallbackCategories,
  fallbackLanding,
  fallbackPosts,
} from '../src/sanity/fallback';
import type { PortableTextBlock } from '@portabletext/react';

function slugField(current: string) {
  return { _type: 'slug' as const, current };
}

function stripKeys<T extends { _key?: string }>(items: T[]): T[] {
  return items.map(({ _key: _ignored, ...rest }) => rest as T);
}

async function main() {
  const client = getSanityWriteClient();
  console.log('Seed: menulis konten ke Sanity…');

  // 1. Kategori artikel
  for (const category of fallbackCategories) {
    await client.createOrReplace({
      _id: `category-${category.slug}`,
      _type: 'category',
      name: category.name,
      slug: slugField(category.slug),
    });
    console.log(`  ✓ category: ${category.name}`);
  }

  // 2. Landing page (singleton, _id tetap "landingPage")
  const hero = { ...fallbackLanding.hero };
  await client.createOrReplace({
    _id: 'landingPage',
    _type: 'landingPage',
    campaignName: fallbackLanding.campaignName,
    promoLabel: fallbackLanding.promoLabel,
    promoNote: fallbackLanding.promoNote,
    hero: {
      eyebrow: hero.eyebrow,
      title: hero.title,
      subtitle: hero.subtitle,
      ctaPrimaryLabel: hero.ctaPrimaryLabel,
      ctaPrimaryHref: hero.ctaPrimaryHref,
      ctaSecondaryLabel: hero.ctaSecondaryLabel,
      ctaSecondaryHref: hero.ctaSecondaryHref,
    },
    featuredHeading: fallbackLanding.featuredHeading,
    featuredSubheading: fallbackLanding.featuredSubheading,
    featuredProducts: fallbackLanding.featuredProductIds,
    testimonialsHeading: fallbackLanding.testimonialsHeading,
    testimonialsSubheading: fallbackLanding.testimonialsSubheading,
    testimonials: stripKeys(fallbackLanding.testimonials),
    faqHeading: fallbackLanding.faqHeading,
    faqSubheading: fallbackLanding.faqSubheading,
    faqItems: stripKeys(fallbackLanding.faqItems),
    leadHeading: fallbackLanding.leadHeading,
    leadSubheading: fallbackLanding.leadSubheading,
    leadBullets: fallbackLanding.leadBullets,
  });
  console.log('  ✓ landingPage');

  // 3. Artikel blog
  for (const post of fallbackPosts) {
    const categorySlug = post.category?.slug;
    await client.createOrReplace({
      _id: `post-${post.slug}`,
      _type: 'post',
      title: post.title,
      slug: slugField(post.slug),
      excerpt: post.excerpt,
      publishedAt: post.publishedAt ?? new Date().toISOString(),
      body: post.body as PortableTextBlock[],
      relatedProducts: post.relatedProductIds,
      ...(categorySlug
        ? { category: { _type: 'reference' as const, _ref: `category-${categorySlug}` } }
        : {}),
    });
    console.log(`  ✓ post: ${post.title}`);
  }

  console.log('Selesai. Buka /studio untuk melihat konten.');
}

main().catch((error) => {
  console.error('Seed gagal:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
