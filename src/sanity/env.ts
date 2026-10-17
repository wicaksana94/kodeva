export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? '';
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production';
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2025-01-01';

/**
 * True bila project Sanity sudah dikonfigurasi. Bila belum, situs otomatis memakai
 * konten fallback lokal sehingga tetap bisa dijalankan tanpa kredensial apa pun.
 */
export const isSanityConfigured = projectId.length > 0;
