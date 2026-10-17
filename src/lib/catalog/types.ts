export type CategoryId = 'kasir' | 'hr-payroll' | 'add-on';

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
}

export type PackageId = 'basic' | 'pro' | 'business';

export interface ProductPackage {
  id: PackageId;
  name: string;
  /** Harga normal per lisensi per bulan (Rupiah, bilangan bulat). */
  pricePerLicensePerMonth: number;
  /**
   * Harga promo per lisensi per bulan. `null` berarti paket ini tidak ikut promo
   * dan tidak memakai kuota promo produk.
   */
  promoPricePerLicensePerMonth: number | null;
  featureSummary: string[];
  popular?: boolean;
}

export interface PromoQuota {
  /** Total kuota lisensi promo (jumlah lisensi, bukan jumlah pesanan). */
  total: number;
  /** Sisa kuota promo yang bisa dipakai. */
  remaining: number;
}

export interface Screenshot {
  /** Varian mockup layar aplikasi yang dirender di halaman detail. */
  variant: 'dashboard' | 'transaksi' | 'laporan';
  label: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  categoryId: CategoryId;
  /** Satuan lisensi produk: per pengguna atau per outlet. */
  licenseUnit: 'user' | 'outlet';
  highlights: string[];
  packages: ProductPackage[];
  /**
   * Kuota promo berlaku untuk TOTAL lisensi produk ini di keranjang,
   * digabung dari semua paket yang punya harga promo (kuota di-share).
   */
  promoQuota: PromoQuota | null;
  promo?: {
    label: string;
    note: string;
  };
  screenshots: Screenshot[];
  rating: number;
  customers: string;
}

export interface CartItem {
  productId: string;
  packageId: PackageId;
  /** Jumlah lisensi (user/outlet) sesuai satuan lisensi produk. */
  quantity: number;
}

export interface PricingLine extends CartItem {
  product: Product;
  package: ProductPackage;
  unitPrice: number;
  listUnitPrice: number;
  lineTotal: number;
  lineListTotal: number;
  usesPromoQuota: boolean;
}

export interface CartTotals {
  lines: PricingLine[];
  subtotal: number;
  listSubtotal: number;
  discount: number;
  /** Jumlah baris item (produk + paket) di keranjang. */
  itemCount: number;
  /** Total lisensi dari semua baris. */
  licenseCount: number;
}

export interface PromoUsage {
  product: Product;
  /** Total lisensi promo produk ini yang ada di keranjang. */
  used: number;
  remaining: number;
  quota: number;
}

export type QuantityCheckResult =
  | { ok: true }
  | { ok: false; reason: string; maxAllowed: number };
