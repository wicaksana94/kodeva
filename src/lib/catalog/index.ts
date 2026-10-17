import { categories, products } from './data';
import type { Category, CategoryId, Product, ProductPackage } from './types';

export * from './types';
export { categories, products, DEFAULT_FEATURED_PRODUCT_IDS } from './data';

export function getCategories(): Category[] {
  return categories;
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find((category) => category.id === id);
}

export function getProducts(): Product[] {
  return products;
}

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function getProductsByCategory(categoryId: CategoryId): Product[] {
  return products.filter((product) => product.categoryId === categoryId);
}

export function getProductPackage(product: Product, packageId: string): ProductPackage | undefined {
  return product.packages.find((pkg) => pkg.id === packageId);
}

export function getProductsByIds(ids: string[]): Product[] {
  return ids
    .map((id) => getProductById(id))
    .filter((product): product is Product => product !== undefined);
}

/** Harga per lisensi per bulan untuk sebuah paket (harga promo bila ada). */
export function getUnitPrice(pkg: ProductPackage): number {
  return pkg.promoPricePerLicensePerMonth ?? pkg.pricePerLicensePerMonth;
}

/** Harga terendah (sudah termasuk promo) yang bisa ditampilkan sebagai "mulai dari". */
export function getLowestUnitPrice(product: Product): number {
  return Math.min(...product.packages.map(getUnitPrice));
}

export function productHasActivePromo(product: Product): boolean {
  return (
    product.promoQuota !== null &&
    product.promoQuota.remaining > 0 &&
    product.packages.some((pkg) => pkg.promoPricePerLicensePerMonth !== null)
  );
}

export function getLicenseUnitLabel(product: Product): string {
  return product.licenseUnit === 'user' ? 'pengguna' : 'outlet';
}
