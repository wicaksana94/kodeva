'use client';

import { useEffect } from 'react';
import { shouldFireOnce, trackViewItem } from '@/lib/analytics/datalayer';
import { getLowestUnitPrice, getProductById } from '@/lib/catalog';

interface ViewItemTrackerProps {
  productId: string;
  campaign?: string;
}

/** Mengirim event `view_item` sekali per kunjungan halaman detail produk. */
export function ViewItemTracker({ productId, campaign }: ViewItemTrackerProps) {
  useEffect(() => {
    const product = getProductById(productId);
    if (!product) return;
    if (!shouldFireOnce(`view_item:${productId}`, 10 * 60 * 1000)) return;
    trackViewItem(product, getLowestUnitPrice(product), { campaign });
  }, [productId, campaign]);

  return null;
}
