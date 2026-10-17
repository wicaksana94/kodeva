import { getProductById, getProductPackage, getUnitPrice } from '@/lib/catalog';
import type {
  CartItem,
  CartTotals,
  PricingLine,
  Product,
  ProductPackage,
  PromoUsage,
  QuantityCheckResult,
} from '@/lib/catalog/types';

/** Batas jumlah lisensi per baris di keranjang. */
export const MAX_LICENSE_PER_LINE = 100;

interface LineMeta {
  product: Product;
  pkg: ProductPackage;
  usesPromoQuota: boolean;
}

function getLineMeta(productId: string, packageId: string): LineMeta | null {
  const product = getProductById(productId);
  if (!product) return null;
  const pkg = getProductPackage(product, packageId);
  if (!pkg) return null;
  const usesPromoQuota = pkg.promoPricePerLicensePerMonth !== null && product.promoQuota !== null;
  return { product, pkg, usesPromoQuota };
}

function sameLine(a: CartItem, b: CartItem): boolean {
  return a.productId === b.productId && a.packageId === b.packageId;
}

function isSameProductExceptLine(
  a: CartItem,
  b: { productId: string; packageId: string },
): boolean {
  return a.productId === b.productId && !sameLine(a, b as CartItem);
}

/**
 * Total lisensi promo sebuah produk di keranjang. Kuota promo dihitung dari AKUMULASI
 * semua baris paket promo produk tersebut (bukan per baris), sesuai aturan bisnis.
 */
export function getPromoUsedByProduct(items: CartItem[], productId: string): number {
  return items.reduce((total, item) => {
    if (item.productId !== productId) return total;
    const meta = getLineMeta(item.productId, item.packageId);
    return meta?.usesPromoQuota ? total + item.quantity : total;
  }, 0);
}

/** Sisa kuota promo produk yang masih bisa dialokasikan setelah memperhitungkan isi keranjang. */
export function getAvailablePromoQuota(items: CartItem[], product: Product): number {
  if (!product.promoQuota) return Infinity;
  return Math.max(0, product.promoQuota.remaining - getPromoUsedByProduct(items, product.id));
}

/**
 * Jumlah maksimal yang boleh diisi untuk satu baris. Untuk baris promo, batasnya adalah
 * sisa kuota promo produk dikurangi pemakaian baris-baris promo lain dari produk yang sama.
 */
export function getMaxQuantityForLine(
  items: CartItem[],
  productId: string,
  packageId: string,
): number {
  const meta = getLineMeta(productId, packageId);
  if (!meta) return 0;
  if (!meta.usesPromoQuota) return MAX_LICENSE_PER_LINE;
  const usedByOtherLines = items
    .filter((item) => isSameProductExceptLine(item, { productId, packageId }))
    .reduce((total, item) => {
      const otherMeta = getLineMeta(item.productId, item.packageId);
      return otherMeta?.usesPromoQuota ? total + item.quantity : total;
    }, 0);
  return Math.max(
    0,
    Math.min(MAX_LICENSE_PER_LINE, meta.product.promoQuota!.remaining - usedByOtherLines),
  );
}

export function checkQuantity(
  items: CartItem[],
  productId: string,
  packageId: string,
  quantity: number,
): QuantityCheckResult {
  const meta = getLineMeta(productId, packageId);
  const maxAllowed = getMaxQuantityForLine(items, productId, packageId);

  if (!meta) {
    return { ok: false, reason: 'Produk atau paket tidak ditemukan.', maxAllowed: 0 };
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    return { ok: false, reason: 'Jumlah lisensi harus bilangan bulat minimal 1.', maxAllowed };
  }
  if (quantity > MAX_LICENSE_PER_LINE) {
    return {
      ok: false,
      reason: `Maksimal ${MAX_LICENSE_PER_LINE} lisensi per item per pesanan.`,
      maxAllowed: Math.min(maxAllowed, MAX_LICENSE_PER_LINE),
    };
  }
  if (meta.usesPromoQuota && quantity > maxAllowed) {
    const remainingQuota = maxAllowed;
    return {
      ok: false,
      reason:
        remainingQuota > 0
          ? `Sisa kuota promo produk ini untuk keranjang Anda tinggal ${remainingQuota} lisensi.`
          : 'Kuota promo produk ini sudah habis untuk keranjang Anda.',
      maxAllowed,
    };
  }
  return { ok: true };
}

export interface LineMutationOutcome {
  items: CartItem[];
  check: QuantityCheckResult;
}

/** Menambah quantity ke baris (atau membuat baris baru) dengan validasi kuota. */
export function addToCart(
  items: CartItem[],
  productId: string,
  packageId: string,
  quantity = 1,
): LineMutationOutcome {
  const existing = items.find(
    (item) => item.productId === productId && item.packageId === packageId,
  );
  const nextQuantity = (existing?.quantity ?? 0) + quantity;
  return setLineQuantityInternal(items, productId, packageId, nextQuantity);
}

/** Mengubah quantity satu baris dengan validasi kuota. */
export function setLineQuantity(
  items: CartItem[],
  productId: string,
  packageId: string,
  quantity: number,
): LineMutationOutcome {
  return setLineQuantityInternal(items, productId, packageId, quantity);
}

function setLineQuantityInternal(
  items: CartItem[],
  productId: string,
  packageId: string,
  quantity: number,
): LineMutationOutcome {
  const check = checkQuantity(items, productId, packageId, quantity);
  if (!check.ok) return { items, check };

  const exists = items.some((item) => item.productId === productId && item.packageId === packageId);
  const nextItems = exists
    ? items.map((item) =>
        item.productId === productId && item.packageId === packageId ? { ...item, quantity } : item,
      )
    : [...items, { productId, packageId: packageId as CartItem['packageId'], quantity }];

  return { items: nextItems, check };
}

export function removeLine(items: CartItem[], productId: string, packageId: string): CartItem[] {
  return items.filter((item) => !(item.productId === productId && item.packageId === packageId));
}

export function buildPricingLines(items: CartItem[]): PricingLine[] {
  const lines: PricingLine[] = [];
  for (const item of items) {
    const meta = getLineMeta(item.productId, item.packageId);
    if (!meta) continue;
    const unitPrice = getUnitPrice(meta.pkg);
    const listUnitPrice = meta.pkg.pricePerLicensePerMonth;
    lines.push({
      ...item,
      product: meta.product,
      package: meta.pkg,
      unitPrice,
      listUnitPrice,
      lineTotal: unitPrice * item.quantity,
      lineListTotal: listUnitPrice * item.quantity,
      usesPromoQuota: meta.usesPromoQuota,
    });
  }
  return lines;
}

export function getCartTotals(items: CartItem[]): CartTotals {
  const lines = buildPricingLines(items);
  const subtotal = lines.reduce((total, line) => total + line.lineTotal, 0);
  const listSubtotal = lines.reduce((total, line) => total + line.lineListTotal, 0);
  return {
    lines,
    subtotal,
    listSubtotal,
    discount: listSubtotal - subtotal,
    itemCount: lines.length,
    licenseCount: lines.reduce((total, line) => total + line.quantity, 0),
  };
}

/** Pemakaian kuota promo per produk untuk produk yang ada di keranjang. */
export function getPromoUsages(items: CartItem[]): PromoUsage[] {
  const productIds = [...new Set(items.map((item) => item.productId))];
  const usages: PromoUsage[] = [];
  for (const productId of productIds) {
    const product = getProductById(productId);
    if (!product?.promoQuota) continue;
    const used = getPromoUsedByProduct(items, productId);
    if (used <= 0) continue;
    usages.push({
      product,
      used,
      remaining: Math.max(0, product.promoQuota.remaining - used),
      quota: product.promoQuota.total,
    });
  }
  return usages;
}

export interface ReconcileOutcome {
  items: CartItem[];
  changed: boolean;
}

/**
 * Menyesuaikan isi keranjang yang tersimpan (localStorage) dengan data katalog terkini:
 * - membuang baris dengan produk/paket yang tidak dikenal,
 * - menggabungkan baris duplikat,
 * - membatasi quantity ke rentang wajar, dan
 * - memotong quantity yang melebihi sisa kuota promo (prioritas baris yang lebih dulu).
 */
export function reconcileCartItems(items: CartItem[]): ReconcileOutcome {
  let changed = false;

  const merged: CartItem[] = [];
  for (const item of items) {
    if (!getLineMeta(item.productId, item.packageId)) {
      changed = true;
      continue;
    }
    const existing = merged.find((line) => sameLine(line, item));
    const quantity = Number.isFinite(item.quantity) ? Math.trunc(item.quantity) : 1;
    if (existing) {
      existing.quantity += quantity;
      changed = true;
    } else {
      merged.push({ ...item, quantity });
    }
  }

  const accepted: CartItem[] = [];
  for (const item of merged) {
    const max = getMaxQuantityForLine(accepted, item.productId, item.packageId);
    if (item.quantity > max) {
      changed = true;
      if (max >= 1) accepted.push({ ...item, quantity: max });
    } else {
      accepted.push(item);
    }
  }

  return { items: accepted, changed };
}
