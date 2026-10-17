import { createImageUrlBuilder } from '@sanity/image-url';
import { dataset, projectId } from '@/sanity/env';
import type { SanityImage } from '@/sanity/types';

const builder = createImageUrlBuilder({ projectId: projectId || 'placeholder', dataset });

export function sanityImageSrc(image: SanityImage | null | undefined): string | null {
  if (!image?.asset?._ref) return null;
  return builder.image(image).url();
}

/**
 * Custom loader untuk next/image: biarkan Sanity Image CDN yang melakukan resize &
 * konversi format (avif/webp) sehingga gambar responsif tanpa optimasi ganda.
 */
export function sanityImageLoader(input: { src: string; width: number; quality?: number }): string {
  return builder
    .image(input.src)
    .width(input.width)
    .quality(input.quality ?? 75)
    .auto('format')
    .fit('max')
    .url();
}
