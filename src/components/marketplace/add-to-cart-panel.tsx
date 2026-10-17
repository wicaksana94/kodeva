'use client';

import { useMemo, useState } from 'react';
import { getUnitPrice } from '@/lib/catalog';
import type { PackageId, PricingLine, Product } from '@/lib/catalog/types';
import {
  getAvailablePromoQuota,
  getMaxQuantityForLine,
  MAX_LICENSE_PER_LINE,
} from '@/lib/cart/logic';
import { getLicenseUnitLabel } from '@/lib/catalog';
import { formatIDR } from '@/lib/money';
import { trackAddToCart } from '@/lib/analytics/datalayer';
import { useCartStore } from '@/lib/store/cart';
import { useToastStore } from '@/lib/store/toasts';
import { useUiStore } from '@/lib/store/ui';
import { QuantityStepper } from '@/components/cart/quantity-stepper';

interface AddToCartPanelProps {
  product: Product;
  campaign?: string;
}

export function AddToCartPanel({ product, campaign }: AddToCartPanelProps) {
  const defaultPackage = product.packages.find((pkg) => pkg.popular) ?? product.packages[0];
  const [selectedPackageId, setSelectedPackageId] = useState<PackageId>(defaultPackage.id);
  const [quantity, setQuantity] = useState(1);

  const items = useCartStore((state) => state.items);
  const add = useCartStore((state) => state.add);
  const pushToast = useToastStore((state) => state.push);
  const openCart = useUiStore((state) => state.openCart);

  const selectedPackage = product.packages.find((pkg) => pkg.id === selectedPackageId)!;
  const unitPrice = getUnitPrice(selectedPackage);
  const usesPromo = selectedPackage.promoPricePerLicensePerMonth !== null;

  const lineInCart = items.find(
    (item) => item.productId === product.id && item.packageId === selectedPackageId,
  );

  const { maxAddable, availableQuota } = useMemo(() => {
    const maxForLine = getMaxQuantityForLine(items, product.id, selectedPackageId);
    return {
      maxAddable: Math.max(0, maxForLine - (lineInCart?.quantity ?? 0)),
      availableQuota: product.promoQuota ? getAvailablePromoQuota(items, product) : Infinity,
    };
  }, [items, product, selectedPackageId, lineInCart]);

  const effectiveMaxAdd = usesPromo
    ? Math.min(maxAddable, MAX_LICENSE_PER_LINE)
    : MAX_LICENSE_PER_LINE;
  const clampedQuantity = Math.max(1, Math.min(quantity, Math.max(effectiveMaxAdd, 1)));
  const soldOut = usesPromo && maxAddable <= 0;
  const licenseUnit = getLicenseUnitLabel(product);
  const subtotal = unitPrice * clampedQuantity;
  const listSubtotal = selectedPackage.pricePerLicensePerMonth * clampedQuantity;

  function handleAdd() {
    const result = add(product.id, selectedPackageId, clampedQuantity);
    if (result.ok) {
      const line: PricingLine = {
        productId: product.id,
        packageId: selectedPackageId,
        quantity: clampedQuantity,
        product,
        package: selectedPackage,
        unitPrice,
        listUnitPrice: selectedPackage.pricePerLicensePerMonth,
        lineTotal: subtotal,
        lineListTotal: listSubtotal,
        usesPromoQuota: usesPromo && product.promoQuota !== null,
      };
      trackAddToCart(line, { campaign });
      pushToast(
        `${clampedQuantity} lisensi ${product.name} (${selectedPackage.name}) masuk keranjang.`,
        'success',
      );
      setQuantity(1);
      openCart();
      return;
    }
    pushToast(result.reason || 'Tidak bisa menambahkan ke keranjang.', 'error');
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <fieldset>
        <legend className="text-sm font-bold text-slate-900">Pilih paket</legend>
        <div className="mt-3 space-y-2.5">
          {product.packages.map((pkg) => {
            const pkgUsesPromo = pkg.promoPricePerLicensePerMonth !== null;
            const pkgPrice = getUnitPrice(pkg);
            const pkgDiscount = pkgUsesPromo
              ? Math.round(
                  (1 - pkg.promoPricePerLicensePerMonth! / pkg.pricePerLicensePerMonth) * 100,
                )
              : 0;
            const selected = pkg.id === selectedPackageId;
            return (
              <label
                key={pkg.id}
                className={`block cursor-pointer rounded-xl border p-3.5 transition ${
                  selected
                    ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="package"
                  value={pkg.id}
                  checked={selected}
                  onChange={() => {
                    setSelectedPackageId(pkg.id);
                    setQuantity(1);
                  }}
                  className="sr-only"
                />
                <span className="flex items-start justify-between gap-3">
                  <span>
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{pkg.name}</span>
                      {pkg.popular && (
                        <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white">
                          Populer
                        </span>
                      )}
                      {pkgUsesPromo && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                          Hemat {pkgDiscount}%
                        </span>
                      )}
                    </span>
                    <span className="mt-1 block text-xs text-slate-600">
                      {pkg.featureSummary.slice(0, 3).join(' · ')}
                    </span>
                  </span>
                  <span className="text-right">
                    {pkgUsesPromo && (
                      <span className="block text-[11px] text-slate-600 line-through">
                        {formatIDR(pkg.pricePerLicensePerMonth)}
                      </span>
                    )}
                    <span className="block text-sm font-extrabold text-slate-900">
                      {formatIDR(pkgPrice)}
                    </span>
                    <span className="block text-[11px] text-slate-600">/{licenseUnit}/bln</span>
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {usesPromo && product.promoQuota && (
        <p
          className={`mt-3 rounded-lg px-3 py-2 text-xs font-medium ${
            soldOut ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-800'
          }`}
        >
          {soldOut
            ? 'Kuota promo produk ini sudah habis untuk keranjang Anda. Kurangi lisensi promo lain atau pilih paket non-promo.'
            : `Kuota promo tersisa ${availableQuota} lisensi (berlaku untuk seluruh paket promo produk ini).`}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
        <div>
          <p className="text-sm font-semibold text-slate-800">Jumlah lisensi</p>
          <p className="text-xs text-slate-500">dihitung per {licenseUnit}</p>
        </div>
        <QuantityStepper
          value={clampedQuantity}
          max={Math.max(effectiveMaxAdd, 1)}
          onChange={setQuantity}
          label="jumlah lisensi"
          disabled={soldOut}
        />
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 p-3.5">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-slate-600">Subtotal</span>
          <span className="text-right">
            {usesPromo && (
              <span className="mr-2 text-xs text-slate-500 line-through">
                {formatIDR(listSubtotal)}
              </span>
            )}
            <span className="text-lg font-extrabold text-slate-900">{formatIDR(subtotal)}</span>
          </span>
        </div>
        {usesPromo && (
          <p className="mt-1 text-right text-xs font-semibold text-emerald-700">
            Hemat {formatIDR(listSubtotal - subtotal)}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={soldOut}
        className="mt-4 min-h-11 w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {soldOut ? 'Kuota promo habis' : 'Tambah ke Keranjang'}
      </button>
      <p className="mt-2 text-center text-[11px] text-slate-500">
        {lineInCart
          ? `Sudah ada ${lineInCart.quantity} lisensi paket ini di keranjang.`
          : 'Pembayaran disimulasikan — tidak ada transaksi sungguhan.'}
      </p>
    </div>
  );
}
