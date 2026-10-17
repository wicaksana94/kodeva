'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getCartTotals, getPromoUsages } from '@/lib/cart/logic';
import { formatIDR } from '@/lib/money';
import { useCartStore } from '@/lib/store/cart';
import { useToastStore } from '@/lib/store/toasts';
import { useUiStore } from '@/lib/store/ui';
import { trackBeginCheckout } from '@/lib/analytics/datalayer';
import { markCheckoutStarted } from '@/lib/analytics/checkout-session';
import { DEFAULT_CAMPAIGN } from '@/lib/campaign';
import { CartLineRow } from './cart-line-row';

export function CartDrawer() {
  const open = useUiStore((state) => state.cartOpen);
  const closeCart = useUiStore((state) => state.closeCart);
  const items = useCartStore((state) => state.items);
  const hydrated = useCartStore((state) => state.hydrated);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const remove = useCartStore((state) => state.remove);
  const pushToast = useToastStore((state) => state.push);
  const router = useRouter();

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const totals = useMemo(() => getCartTotals(items), [items]);
  const usages = useMemo(() => getPromoUsages(items), [items]);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeCart();
    }
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused.current?.focus?.();
    };
  }, [open, closeCart]);

  function handleQuantityChange(
    productId: string,
    packageId: string,
    productName: string,
    next: number,
  ) {
    const check = setQuantity(productId, packageId, next);
    if (!check.ok) pushToast(check.reason, 'error');
  }

  function handleCheckout() {
    trackBeginCheckout(totals.lines, { campaign: DEFAULT_CAMPAIGN.name });
    markCheckoutStarted();
    closeCart();
    router.push('/checkout');
  }

  return (
    <div className={`fixed inset-0 z-60 ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div
        onClick={closeCart}
        className={`pointer-events-auto absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity duration-200 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Keranjang belanja"
        inert={!open}
        className={`absolute top-0 right-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-200 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="text-base font-bold text-slate-900">
            Keranjang{' '}
            {hydrated && totals.itemCount > 0 && (
              <span className="text-sm font-normal text-slate-500">
                ({totals.licenseCount} lisensi)
              </span>
            )}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeCart}
            className="-m-1 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Tutup keranjang"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-5">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4">
          {!hydrated ? (
            <div className="space-y-4 py-4" aria-hidden="true">
              {[0, 1].map((index) => (
                <div key={index} className="flex animate-pulse gap-3">
                  <div className="size-14 rounded-xl bg-slate-200" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3.5 w-2/3 rounded bg-slate-200" />
                    <div className="h-3 w-1/3 rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : totals.lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="grid size-16 place-items-center rounded-2xl bg-slate-100">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="size-8 text-slate-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                  />
                </svg>
              </div>
              <p className="font-semibold text-slate-900">Keranjang Anda masih kosong</p>
              <p className="max-w-60 text-sm text-slate-500">
                Jelajahi katalog dan tambahkan lisensi produk Kodeva.
              </p>
              <Link
                href="/katalog"
                onClick={closeCart}
                className="mt-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Lihat katalog produk
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {totals.lines.map((line) => {
                const usage = usages.find((u) => u.product.id === line.product.id);
                const quotaNote =
                  usage && line.usesPromoQuota
                    ? `Kuota promo produk ini tersisa ${usage.remaining} lisensi (dihitung untuk semua paket promo di keranjang).`
                    : undefined;
                return (
                  <CartLineRow
                    key={`${line.productId}-${line.packageId}`}
                    line={line}
                    quotaNote={quotaNote}
                    onQuantityChange={(next) =>
                      handleQuantityChange(line.productId, line.packageId, line.product.name, next)
                    }
                    onRemove={() => remove(line.productId, line.packageId)}
                  />
                );
              })}
            </ul>
          )}
        </div>

        {hydrated && totals.lines.length > 0 && (
          <div className="border-t border-slate-200 px-4 py-4">
            {totals.discount > 0 && (
              <div className="mb-1 flex justify-between text-sm text-emerald-700">
                <span>Hemat promo</span>
                <span className="font-medium tabular-nums">-{formatIDR(totals.discount)}</span>
              </div>
            )}
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-slate-600">Subtotal</span>
              <span className="text-lg font-bold text-slate-900 tabular-nums">
                {formatIDR(totals.subtotal)}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCheckout}
              className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Lanjut ke checkout
            </button>
            <Link
              href="/keranjang"
              onClick={closeCart}
              className="mt-2 block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Lihat keranjang lengkap
            </Link>
            <p className="mt-2 text-center text-xs text-slate-500">
              Harga per lisensi/bulan. Belum termasuk PPN.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
