'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/lib/store/cart';

/** Memulihkan isi keranjang dari localStorage setelah halaman ter-hidrasi. */
export function CartHydrator() {
  useEffect(() => {
    void useCartStore.persist.rehydrate();
  }, []);

  return null;
}
