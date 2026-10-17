'use client';

import { createImageUrlBuilder } from '@sanity/image-url';
import { dataset, projectId } from '@/sanity/env';

const builder = createImageUrlBuilder({ projectId: projectId || 'placeholder', dataset });

/**
 * Loader next/image seluruh aplikasi (dikonfigurasi via `images.loaderFile` di
 * next.config.ts): biarkan Sanity Image CDN yang melakukan resize & konversi
 * format (avif/webp) sehingga gambar responsif tanpa optimasi ganda.
 *
 * Harus berada di file ber-`'use client'` karena `loader` tidak dapat dikirim
 * sebagai prop fungsi dari Server Component ke next/image (Client Component).
 */
export default function sanityImageLoader(input: {
  src: string;
  width: number;
  quality?: number;
}): string {
  return builder
    .image(input.src)
    .width(input.width)
    .quality(input.quality ?? 75)
    .auto('format')
    .fit('max')
    .url();
}
