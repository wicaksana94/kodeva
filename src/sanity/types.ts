import type { PortableTextBlock } from '@portabletext/react';

export interface SanityImage {
  _type: 'image';
  asset: { _ref: string; _type: 'reference' };
  alt?: string;
}

export interface HeroStat {
  _key?: string;
  value: string;
  label: string;
}

export interface HeroContent {
  eyebrow?: string | null;
  title: string;
  subtitle: string;
  image: SanityImage | null;
  imageAlt: string;
  stats: HeroStat[];
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel?: string | null;
  ctaSecondaryHref?: string | null;
}

export interface TestimonialItem {
  _key?: string;
  name: string;
  role: string;
  quote: string;
  photo?: SanityImage | null;
}

export interface FaqItem {
  _key?: string;
  question: string;
  answer: string;
}

export interface LandingContent {
  campaignName: string;
  hero: HeroContent;
  featuredHeading: string;
  featuredSubheading?: string | null;
  featuredProductIds: string[];
  featuredCtaLabel: string;
  testimonialsHeading: string;
  testimonialsSubheading?: string | null;
  testimonials: TestimonialItem[];
  faqHeading: string;
  faqSubheading?: string | null;
  faqItems: FaqItem[];
  leadHeading: string;
  leadSubheading: string;
  leadBullets: string[];
  promoLabel?: string | null;
  promoNote?: string | null;
}

export interface PostCategoryRef {
  name: string;
  slug: string;
}

export interface PostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover: SanityImage | null;
  category: PostCategoryRef | null;
  publishedAt: string | null;
}

export interface PostDetail extends PostSummary {
  body: PortableTextBlock[];
  relatedProductIds: string[];
}
