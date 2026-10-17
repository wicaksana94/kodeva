import Link from 'next/link';
import { getCategoryById, getLowestUnitPrice, productHasActivePromo } from '@/lib/catalog';
import { formatIDR } from '@/lib/money';
import { categorySoftBadge } from '@/lib/ui/accents';
import type { Product } from '@/lib/catalog/types';
import { ProductMockup } from './product-mockup';

interface ProductCardProps {
  product: Product;
  priorityMockup?: boolean;
}

export function ProductCard({ product }: ProductCardProps) {
  const category = getCategoryById(product.categoryId);
  const promoActive = productHasActivePromo(product);
  const lowestPrice = getLowestUnitPrice(product);
  const lowestList = Math.min(...product.packages.map((pkg) => pkg.pricePerLicensePerMonth));
  const discounted = promoActive && lowestPrice < lowestList;
  const licenseUnit = product.licenseUnit === 'user' ? 'pengguna' : 'outlet';

  return (
    <Link
      href={`/produk/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg"
    >
      <div className="relative aspect-[16/9] overflow-hidden border-b border-slate-100 bg-slate-50 p-3">
        <div className="pointer-events-none absolute inset-x-3 top-3 origin-top scale-[1.02]">
          <ProductMockup
            productName={product.name}
            categoryId={product.categoryId}
            variant="dashboard"
          />
        </div>
        {discounted && (
          <span className="absolute top-2 right-2 rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-amber-950 shadow-sm">
            Promo
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${categorySoftBadge[product.categoryId]}`}
          >
            {category?.name ?? product.categoryId}
          </span>
          <span className="text-[11px] text-slate-500">★ {product.rating.toFixed(1)}</span>
          <span className="hidden text-[11px] text-slate-500 sm:inline">· {product.customers}</span>
        </div>

        <h3 className="mt-2 text-base font-bold text-slate-900 group-hover:text-indigo-700">
          {product.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{product.tagline}</p>

        <div className="mt-auto pt-3">
          <p className="text-xs text-slate-500">Mulai dari</p>
          <div className="flex items-baseline gap-2">
            {discounted && (
              <span className="text-xs text-slate-500 line-through">{formatIDR(lowestList)}</span>
            )}
            <span className="text-lg font-extrabold text-slate-900">{formatIDR(lowestPrice)}</span>
            <span className="text-xs text-slate-500">/{licenseUnit}/bln</span>
          </div>
          {promoActive && product.promoQuota && (
            <p className="mt-1 text-[11px] font-medium text-amber-700">
              Sisa kuota promo: {product.promoQuota.remaining} lisensi
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
