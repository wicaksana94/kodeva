import { createClient } from 'next-sanity';
import { apiVersion, dataset, isSanityConfigured, projectId } from './env';

export const sanityReadClient = createClient({
  projectId: projectId || 'placeholder',
  dataset,
  apiVersion,
  useCdn: true,
  perspective: 'published',
  token: process.env.SANITY_API_READ_TOKEN || undefined,
});

export function getSanityWriteClient() {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!isSanityConfigured || !token) {
    throw new Error(
      'Sanity belum dikonfigurasi: butuh NEXT_PUBLIC_SANITY_PROJECT_ID dan SANITY_API_WRITE_TOKEN.',
    );
  }
  return createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
  });
}
