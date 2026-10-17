import type { MetadataRoute } from 'next';
import { getProducts } from '@/lib/catalog';
import { getPostSlugs } from '@/sanity/content';
import { absoluteUrl } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), priority: 1 },
    { url: absoluteUrl('/katalog'), priority: 0.9 },
    { url: absoluteUrl('/blog'), priority: 0.8 },
  ];

  const productRoutes: MetadataRoute.Sitemap = getProducts().map((product) => ({
    url: absoluteUrl(`/produk/${product.slug}`),
    priority: 0.8,
  }));

  let postRoutes: MetadataRoute.Sitemap = [];
  try {
    const slugs = await getPostSlugs();
    postRoutes = slugs.map((slug) => ({
      url: absoluteUrl(`/blog/${slug}`),
      priority: 0.6,
    }));
  } catch {
    postRoutes = [];
  }

  return [...staticRoutes, ...productRoutes, ...postRoutes];
}
