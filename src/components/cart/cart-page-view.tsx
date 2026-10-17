'use client';

import Link from 'next/link';
import { getCartTotals, getPromoUsages } from '@/lib/cart/logic';
import { formatIDR } from '@/lib/money';
import { useCartStore } from '@/lib/store/cart';
import { useToastStore } from '@/lib/store/toasts';
import { DEFAULT_CAMPAIGN } from '@/lib/campaign';
import { TrackedCta } from '@/components/marketing/tracked-cta';
import { CartLineRow } from './cart-line-row';

export function CartPageView() {
  const items = useCartStore((state) => state.items);
  const hydrated = useCartStore((state) => state.hydrated);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const remove = useCartStore((state) => state.remove);
  const adjustmentNotice = useCartStore((state) => state.adjustmentNotice);
  const dismissAdjustmentNotice = useCartStore((state) => state.dismissAdjustmentNotice);
  const pushToast = useToastStore((state) => state.push);

  if (!hydrated) {
    return (
      <div aria-label="Memuat keranjang…" role="status" className="mt-8 space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
          />
        ))}
      </div>
    );
  }

  const totals = getCartTotals(items);
  const promoUsages = getPromoUsages(items);

  if (totals.lines.length === 0) {
    return (
      <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
        <p className="text-lg font-bold text-slate-800">Keranjang Anda masih kosong</p>
        <p className="mt-1 text-sm text-slate-500">
          Pilih produk dari katalog, lalu atur paket dan jumlah lisensinya.
        </p>
        <Link
          href="/katalog"
          className="mt-5 inline-block rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Lihat katalog produk
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6 grid items-start gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        {adjustmentNotice && (
          <div
            role="alert"
            className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
          >
            <p>{adjustmentNotice}</p>
            <button
              type="button"
              onClick={dismissAdjustmentNotice}
              className="shrink-0 text-xs font-bold text-amber-900 underline"
            >
              Mengerti
            </button>
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white px-5">
          <ul className="divide-y divide-slate-100">
            {totals.lines.map((line) => {
              const usage = promoUsages.find((item) => item.product.id === line.product.id);
              const quotaNote =
                line.usesPromoQuota && usage
                  ? `Paket promo: ${usage.used} dari ${usage.quota} kuota produk ini terpakai di keranjang Anda (sisa ${usage.remaining}).`
                  : undefined;
              return (
                <CartLineRow
                  key={`${line.productId}-${line.packageId}`}
                  line={line}
                  quotaNote={quotaNote}
                  onQuantityChange={(next) => {
                    const result = setQuantity(line.productId, line.packageId, next);
                    if (!result.ok) pushToast(result.reason, 'error');
                  }}
                  onRemove={() => {
                    remove(line.productId, line.packageId);
                    pushToast(
                      `${line.product.name} (${line.package.name}) dihapus dari keranjang.`,
                    );
                  }}
                />
              );
            })}
          </ul>
        </div>
        <Link
          href="/katalog"
          className="mt-4 inline-block text-sm font-semibold text-indigo-700 underline-offset-4 hover:underline"
        >
          ← Lanjut belanja
        </Link>
      </div>

      <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-20">
        <h2 className="text-base font-bold text-slate-900">Ringkasan Pesanan</h2>
        <dl className="mt-4 space-y-2.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-600">Jumlah item</dt>
            <dd className="font-semibold text-slate-900">{totals.itemCount} baris</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-600">Total lisensi</dt>
            <dd className="font-semibold text-slate-900">{totals.licenseCount}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-600">Subtotal (harga normal)</dt>
            <dd className="font-semibold text-slate-900 tabular-nums">
              {formatIDR(totals.listSubtotal)}
            </dd>
          </div>
          {totals.discount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <dt>Diskon promo</dt>
              <dd className="font-semibold tabular-nums">−{formatIDR(totals.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-slate-100 pt-3">
            <dt className="font-bold text-slate-900">Total</dt>
            <dd className="text-lg font-extrabold text-slate-900 tabular-nums">
              {formatIDR(totals.subtotal)}
            </dd>
          </div>
        </dl>

        {promoUsages.length > 0 && (
          <div className="mt-4 rounded-xl bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
            <p className="font-semibold">Kuota promo terpakai:</p>
            <ul className="mt-1 space-y-0.5">
              {promoUsages.map((usage) => (
                <li key={usage.product.id}>
                  {usage.product.name}: {usage.used}/{usage.quota} lisensi (sisa {usage.remaining})
                </li>
              ))}
            </ul>
          </div>
        )}

        <TrackedCta
          href="/checkout"
          label="Lanjut ke Checkout"
          ctaId="cart-checkout-cta"
          location="cart-page"
          campaign={DEFAULT_CAMPAIGN.name}
          className="mt-5 w-full"
        />
        <p className="mt-3 text-center text-[11px] text-slate-500">
          Pembayaran disimulasikan untuk keperluan demo — tidak ada transaksi sungguhan.
        </p>
      </aside>
    </div>
  );
}
