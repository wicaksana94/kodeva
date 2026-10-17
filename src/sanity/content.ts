import { cacheLife, cacheTag } from 'next/cache';
import { sanityReadClient } from './client';
import { isSanityConfigured } from './env';
import { fallbackLanding, fallbackPosts } from './fallback';
import {
  landingPageQuery,
  postBySlugQuery,
  postSlugsQuery,
  postsCountQuery,
  postsPageQuery,
} from './queries';
import type { LandingContent, PostDetail, PostSummary } from './types';

export const POSTS_PAGE_SIZE = 6;

/**
 * Cache lifecycle konten CMS:
 * - `stale`/`revalidate`: jaring pengaman agar perubahan tetap muncul (maks. 10 menit)
 *   walau webhook revalidasi tidak berjalan.
 * - `cacheTag`: webhook dari Sanity memanggil revalidateTag() sehingga perubahan
 *   tampil dalam hitungan detik setelah publish.
 */
const CONTENT_CACHE_LIFE = { stale: 300, revalidate: 600, expire: 86400 } as const;

function normalizeLanding(doc: Partial<LandingContent>): LandingContent {
  return {
    campaignName: doc.campaignName ?? fallbackLanding.campaignName,
    hero: { ...fallbackLanding.hero, ...(doc.hero ?? {}) },
    featuredHeading: doc.featuredHeading ?? fallbackLanding.featuredHeading,
    featuredSubheading: doc.featuredSubheading ?? fallbackLanding.featuredSubheading,
    featuredProductIds:
      doc.featuredProductIds && doc.featuredProductIds.length > 0
        ? doc.featuredProductIds
        : fallbackLanding.featuredProductIds,
    testimonialsHeading: doc.testimonialsHeading ?? fallbackLanding.testimonialsHeading,
    testimonialsSubheading: doc.testimonialsSubheading ?? fallbackLanding.testimonialsSubheading,
    testimonials:
      doc.testimonials && doc.testimonials.length > 0
        ? doc.testimonials
        : fallbackLanding.testimonials,
    faqHeading: doc.faqHeading ?? fallbackLanding.faqHeading,
    faqSubheading: doc.faqSubheading ?? fallbackLanding.faqSubheading,
    faqItems: doc.faqItems && doc.faqItems.length > 0 ? doc.faqItems : fallbackLanding.faqItems,
    leadHeading: doc.leadHeading ?? fallbackLanding.leadHeading,
    leadSubheading: doc.leadSubheading ?? fallbackLanding.leadSubheading,
    leadBullets:
      doc.leadBullets && doc.leadBullets.length > 0 ? doc.leadBullets : fallbackLanding.leadBullets,
    promoLabel: doc.promoLabel ?? fallbackLanding.promoLabel,
    promoNote: doc.promoNote ?? fallbackLanding.promoNote,
  };
}

export async function getLandingContent(): Promise<LandingContent> {
  'use cache';
  cacheLife(CONTENT_CACHE_LIFE);
  cacheTag('landing');

  if (!isSanityConfigured) return fallbackLanding;
  try {
    const doc = await sanityReadClient.fetch<Partial<LandingContent> | null>(landingPageQuery);
    if (!doc) return fallbackLanding;
    return normalizeLanding(doc);
  } catch (error) {
    console.error('[sanity] gagal memuat landing page, memakai konten fallback:', error);
    return fallbackLanding;
  }
}

export interface PostsPage {
  posts: PostSummary[];
  total: number;
  totalPages: number;
  page: number;
}

function paginateFallback(page: number): PostsPage {
  const total = fallbackPosts.length;
  const totalPages = Math.max(1, Math.ceil(total / POSTS_PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * POSTS_PAGE_SIZE;
  return {
    posts: fallbackPosts.slice(start, start + POSTS_PAGE_SIZE).map(toSummary),
    total,
    totalPages,
    page: safePage,
  };
}

function toSummary(post: PostDetail): PostSummary {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    cover: post.cover,
    category: post.category,
    publishedAt: post.publishedAt,
  };
}

export async function getPostsPage(page: number): Promise<PostsPage> {
  'use cache';
  cacheLife(CONTENT_CACHE_LIFE);
  cacheTag('posts');

  const safePage = Math.max(1, Math.floor(page) || 1);
  if (!isSanityConfigured) return paginateFallback(safePage);

  try {
    const offset = (safePage - 1) * POSTS_PAGE_SIZE;
    const [total, posts] = await Promise.all([
      sanityReadClient.fetch<number>(postsCountQuery),
      sanityReadClient.fetch<PostSummary[]>(postsPageQuery, {
        start: offset,
        end: offset + POSTS_PAGE_SIZE,
      }),
    ]);
    if (total === 0) return paginateFallback(1);
    const totalPages = Math.max(1, Math.ceil(total / POSTS_PAGE_SIZE));
    return { posts, total, totalPages, page: Math.min(safePage, totalPages) };
  } catch (error) {
    console.error('[sanity] gagal memuat daftar artikel, memakai konten fallback:', error);
    return paginateFallback(safePage);
  }
}

export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  'use cache';
  cacheLife(CONTENT_CACHE_LIFE);
  cacheTag('posts', `post-${slug}`);

  if (!isSanityConfigured) {
    return fallbackPosts.find((post) => post.slug === slug) ?? null;
  }
  try {
    const post = await sanityReadClient.fetch<PostDetail | null>(postBySlugQuery, { slug });
    if (post) return post;
    return fallbackPosts.find((item) => item.slug === slug) ?? null;
  } catch (error) {
    console.error('[sanity] gagal memuat artikel, memakai konten fallback:', error);
    return fallbackPosts.find((post) => post.slug === slug) ?? null;
  }
}

export async function getPostSlugs(): Promise<string[]> {
  'use cache';
  cacheLife(CONTENT_CACHE_LIFE);
  cacheTag('posts');

  if (!isSanityConfigured) return fallbackPosts.map((post) => post.slug);
  try {
    const slugs = await sanityReadClient.fetch<string[]>(postSlugsQuery);
    return slugs.length > 0 ? slugs : fallbackPosts.map((post) => post.slug);
  } catch {
    return fallbackPosts.map((post) => post.slug);
  }
}
