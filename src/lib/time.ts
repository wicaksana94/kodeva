'use cache';

import { cacheLife } from 'next/cache';

/**
 * Tahun berjalan untuk copyright. Dibungkus `use cache` supaya aman di
 * prerender (nilai waktu non-deterministik) dan diperbarui otomatis setiap hari.
 */
export async function getCurrentYear(): Promise<number> {
  cacheLife('days');
  return new Date().getFullYear();
}
