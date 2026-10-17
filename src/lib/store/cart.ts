'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  addToCart as addToCartLogic,
  reconcileCartItems,
  removeLine,
  setLineQuantity as setLineQuantityLogic,
} from '@/lib/cart/logic';
import type { CartItem, QuantityCheckResult } from '@/lib/catalog/types';

export const CART_STORAGE_KEY = 'kodeva:cart';

interface CartState {
  items: CartItem[];
  /** True setelah isi keranjang selesai dipulihkan dari localStorage. */
  hydrated: boolean;
  /** Notifikasi ketika isi keranjang tersimpan harus disesuaikan. */
  adjustmentNotice: string | null;
  add: (productId: string, packageId: string, quantity?: number) => QuantityCheckResult;
  setQuantity: (productId: string, packageId: string, quantity: number) => QuantityCheckResult;
  remove: (productId: string, packageId: string) => void;
  clear: () => void;
  markHydrated: () => void;
  applyReconciliation: () => void;
  dismissAdjustmentNotice: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      hydrated: false,
      adjustmentNotice: null,

      add: (productId, packageId, quantity = 1) => {
        const outcome = addToCartLogic(get().items, productId, packageId, quantity);
        if (outcome.check.ok) set({ items: outcome.items });
        return outcome.check;
      },

      setQuantity: (productId, packageId, quantity) => {
        const outcome = setLineQuantityLogic(get().items, productId, packageId, quantity);
        if (outcome.check.ok) set({ items: outcome.items });
        return outcome.check;
      },

      remove: (productId, packageId) => {
        set({ items: removeLine(get().items, productId, packageId) });
      },

      clear: () => set({ items: [] }),

      markHydrated: () => set({ hydrated: true }),

      applyReconciliation: () => {
        const outcome = reconcileCartItems(get().items);
        if (outcome.changed) {
          set({
            items: outcome.items,
            adjustmentNotice:
              'Beberapa item di keranjang disesuaikan karena sisa kuota promo atau ketersediaan produk berubah.',
          });
        }
      },

      dismissAdjustmentNotice: () => set({ adjustmentNotice: null }),
    }),
    {
      name: CART_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state, error) => {
        if (error || !state) {
          useCartStore.setState({ hydrated: true });
          return;
        }
        state.applyReconciliation();
        state.markHydrated();
      },
    },
  ),
);

export function selectCartCount(state: CartState): number {
  return state.items.reduce((total, item) => total + item.quantity, 0);
}
