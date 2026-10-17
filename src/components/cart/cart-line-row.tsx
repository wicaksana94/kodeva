'use client';

import Link from 'next/link';
import { formatIDR } from '@/lib/money';
import type { PricingLine } from '@/lib/catalog/types';
import { categoryAccent, productInitials } from '@/lib/ui/accents';
import { getLicenseUnitLabel } from '@/lib/catalog';
import { QuantityStepper } from './quantity-stepper';
import { MAX_LICENSE_PER_LINE } from '@/lib/cart/logic';

interface CartLineRowProps {
  line: PricingLine;
  quotaNote?: string;
  onQuantityChange: (next: number) => void;
  onRemove: () => void;
}

export function CartLineRow({ line, quotaNote, onQuantityChange, onRemove }: CartLineRowProps) {
  const discounted = line.unitPrice < line.listUnitPrice;

  return (
    <li className="flex gap-3 py-4">
      <Link
        href={`/produk/${line.product.slug}`}
        className={`grid size-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-sm font-bold text-white ${categoryAccent[line.product.categoryId]}`}
        aria-hidden="true"
        tabIndex={-1}
      >
        {productInitials(line.product.name)}
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/produk/${line.product.slug}`}
              className="block truncate text-sm font-semibold text-slate-900 hover:text-indigo-700"
            >
              {line.product.name}
            </Link>
            <p className="text-xs text-slate-500">
              Paket {line.package.name} · per {getLicenseUnitLabel(line.product)}
            </p>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="-m-1 rounded p-1 text-slate-500 transition hover:text-red-600"
            aria-label={`Hapus ${line.product.name} paket ${line.package.name} dari keranjang`}
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-4">
              <path
                fillRule="evenodd"
                d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482 41.03 41.03 0 0 0-2.365-.298V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <QuantityStepper
            value={line.quantity}
            max={MAX_LICENSE_PER_LINE}
            onChange={onQuantityChange}
            label={`jumlah ${getLicenseUnitLabel(line.product)} ${line.product.name}`}
          />
          <div className="text-right">
            {discounted && (
              <p className="text-xs text-slate-500 line-through">{formatIDR(line.lineListTotal)}</p>
            )}
            <p className="text-sm font-semibold tabular-nums text-slate-900">
              {formatIDR(line.lineTotal)}
            </p>
          </div>
        </div>

        {quotaNote && <p className="mt-1.5 text-xs text-amber-700">{quotaNote}</p>}
      </div>
    </li>
  );
}
