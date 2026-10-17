import { createImageUrlBuilder } from '@sanity/image-url';
import { dataset, projectId } from '@/sanity/env';
import type { SanityImage } from '@/sanity/types';

const builder = createImageUrlBuilder({ projectId: projectId || 'placeholder', dataset });

export function sanityImageSrc(image: SanityImage | null | undefined): string | null {
  if (!image?.asset?._ref) return null;
  return builder.image(image).url();
}
