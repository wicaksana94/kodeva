'use client';

import { useEffect } from 'react';
import { parseAttribution, saveAttribution } from '@/lib/analytics/utm';

/**
 * Menangkap parameter atribusi (UTM/gclid/fbclid) dari URL ketika user pertama kali
 * membuka situs, lalu menyimpannya di localStorage agar tetap menempel selama user
 * berpindah-pindah halaman (last-touch, berlaku 30 hari).
 */
export function AttributionCapture() {
  useEffect(() => {
    const attribution = parseAttribution(window.location.search, {
      referrer: document.referrer || undefined,
      pathname: window.location.pathname,
    });
    if (attribution) saveAttribution(attribution);
  }, []);

  return null;
}
