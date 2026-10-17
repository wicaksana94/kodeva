'use client';

import { useState } from 'react';
import type { CategoryId } from '@/lib/catalog/types';
import { ProductMockup } from './product-mockup';

const VARIANTS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'transaksi', label: 'Transaksi' },
  { id: 'laporan', label: 'Laporan' },
] as const;

type VariantId = (typeof VARIANTS)[number]['id'];

interface ProductGalleryProps {
  productName: string;
  categoryId: CategoryId;
}

/** Galeri mockup produk dengan tab antar tampilan aplikasi. */
export function ProductGallery({ productName, categoryId }: ProductGalleryProps) {
  const [active, setActive] = useState<VariantId>('dashboard');

  return (
    <div>
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-indigo-50/60 p-4 sm:p-8">
        <ProductMockup productName={productName} categoryId={categoryId} variant={active} />
      </div>
      <div className="mt-4 flex gap-2" role="tablist" aria-label="Pilih tampilan aplikasi">
        {VARIANTS.map((variant) => (
          <button
            key={variant.id}
            type="button"
            role="tab"
            aria-selected={active === variant.id}
            onClick={() => setActive(variant.id)}
            className={`min-h-9 rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
              active === variant.id
                ? 'border-indigo-600 bg-indigo-600 text-white'
                : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {variant.label}
          </button>
        ))}
      </div>
    </div>
  );
}
