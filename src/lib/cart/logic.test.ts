import { describe, expect, it } from 'vitest';
import {
  MAX_LICENSE_PER_LINE,
  addToCart,
  checkQuantity,
  getCartTotals,
  getMaxQuantityForLine,
  getPromoUsages,
  reconcileCartItems,
  removeLine,
  setLineQuantity,
} from './logic';
import type { CartItem } from '@/lib/catalog/types';

const primaLicense = (packageId: 'basic' | 'pro' | 'business', quantity: number): CartItem => ({
  productId: 'kasir-prima',
  packageId,
  quantity,
});

/** Baris "kotor" seperti yang bisa ada di localStorage lama/rusak. */
const untrusted = (item: { productId: string; packageId: string; quantity: number }): CartItem =>
  item as CartItem;

const QUOTA_KASIR_PRIMA = 87;
const QUOTA_KASIR_RESTO = 52;
const QUOTA_STOK = 38;

describe('batas baris (MAX_LICENSE_PER_LINE)', () => {
  it('menolak quantity 0, negatif, pecahan, dan NaN', () => {
    for (const quantity of [0, -3, 1.5, Number.NaN]) {
      const result = checkQuantity([], 'kasir-prima', 'basic', quantity);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.reason).toContain('bilangan bulat');
      }
    }
  });

  it('menolak melebihi batas maksimal per baris pada paket non-promo', () => {
    const ok = checkQuantity([], 'faktur-pajak', 'basic', MAX_LICENSE_PER_LINE);
    expect(ok.ok).toBe(true);
    const tooMany = checkQuantity([], 'faktur-pajak', 'basic', MAX_LICENSE_PER_LINE + 1);
    expect(tooMany.ok).toBe(false);
    if (!tooMany.ok) {
      expect(tooMany.maxAllowed).toBe(MAX_LICENSE_PER_LINE);
    }
  });
});

describe('kuota promo lintas baris (produk & paket sama)', () => {
  it('membatasi quantity paket promo pada sisa kuota produk', () => {
    expect(checkQuantity([], 'kasir-prima', 'basic', QUOTA_KASIR_PRIMA).ok).toBe(true);
    const over = checkQuantity([], 'kasir-prima', 'basic', QUOTA_KASIR_PRIMA + 1);
    expect(over.ok).toBe(false);
    if (!over.ok) {
      expect(over.maxAllowed).toBe(QUOTA_KASIR_PRIMA);
      expect(over.reason).toContain(`${QUOTA_KASIR_PRIMA} lisensi`);
    }
  });

  it('menjumlahkan pemakaian dari beberapa paket promo produk yang sama', () => {
    const items = [primaLicense('basic', 50)];
    expect(getMaxQuantityForLine(items, 'kasir-prima', 'pro')).toBe(QUOTA_KASIR_PRIMA - 50);
    const addPro = addToCart(items, 'kasir-prima', 'pro', QUOTA_KASIR_PRIMA - 50);
    expect(addPro.check.ok).toBe(true);

    const full = addPro.items;
    expect(checkQuantity(full, 'kasir-prima', 'business', 1).ok).toBe(false);
    const overflow = addToCart(full, 'kasir-prima', 'pro', 1);
    expect(overflow.check.ok).toBe(false);
  });

  it('paket non-promo tidak memakai kuota promo', () => {
    const items: CartItem[] = [{ productId: 'kasir-resto', packageId: 'basic', quantity: 80 }];
    const proCheck = checkQuantity(items, 'kasir-resto', 'pro', QUOTA_KASIR_RESTO);
    expect(proCheck.ok).toBe(true);
    expect(getPromoUsages(items)).toHaveLength(0);
  });

  it('paket promo berbagi kuota yang sama (contoh Kasir Resto: Pro + Business)', () => {
    const items: CartItem[] = [{ productId: 'kasir-resto', packageId: 'pro', quantity: 30 }];
    expect(getMaxQuantityForLine(items, 'kasir-resto', 'business')).toBe(QUOTA_KASIR_RESTO - 30);
    const over = checkQuantity(items, 'kasir-resto', 'business', QUOTA_KASIR_RESTO - 29);
    expect(over.ok).toBe(false);
  });

  it('mengurangi quantity membebaskan kuota untuk paket lain', () => {
    const full = addToCart([], 'kasir-prima', 'pro', QUOTA_KASIR_PRIMA);
    expect(full.check.ok).toBe(true);
    const reduced = setLineQuantity(full.items, 'kasir-prima', 'pro', 10);
    expect(reduced.check.ok).toBe(true);

    const addBusiness = addToCart(reduced.items, 'kasir-prima', 'business', QUOTA_KASIR_PRIMA - 10);
    expect(addBusiness.check.ok).toBe(true);
    const overflow = addToCart(addBusiness.items, 'kasir-prima', 'business', 1);
    expect(overflow.check.ok).toBe(false);
  });
});

describe('addToCart / setLineQuantity / removeLine', () => {
  it('menambah baris baru lalu menggabungkan quantity pada baris yang sama', () => {
    const first = addToCart([], 'hr-prima', 'pro', 5);
    expect(first.items).toHaveLength(1);
    const second = addToCart(first.items, 'hr-prima', 'pro', 3);
    expect(second.items).toHaveLength(1);
    expect(second.items[0].quantity).toBe(8);
  });

  it('tidak mengubah item ketika penambahan melebihi kuota', () => {
    const items = [primaLicense('basic', QUOTA_KASIR_PRIMA)];
    const result = addToCart(items, 'kasir-prima', 'basic', 1);
    expect(result.check.ok).toBe(false);
    expect(result.items).toBe(items);
  });

  it('menolak produk atau paket yang tidak dikenal', () => {
    expect(checkQuantity([], 'produk-hantu', 'basic', 1).ok).toBe(false);
    expect(checkQuantity([], 'kasir-prima', 'ultra', 1).ok).toBe(false);
    expect(getMaxQuantityForLine([], 'kasir-prima', 'ultra')).toBe(0);
  });

  it('removeLine hanya menghapus baris yang dituju', () => {
    const items = [primaLicense('basic', 2), primaLicense('pro', 3)];
    const result = removeLine(items, 'kasir-prima', 'basic');
    expect(result).toHaveLength(1);
    expect(result[0].packageId).toBe('pro');
  });
});

describe('getCartTotals', () => {
  it('memakai harga promo untuk baris promo dan harga normal untuk lainnya', () => {
    const totals = getCartTotals([primaLicense('basic', 2)]);
    expect(totals.lines[0].unitPrice).toBe(149_000);
    expect(totals.lines[0].listUnitPrice).toBe(199_000);
    expect(totals.subtotal).toBe(298_000);
    expect(totals.listSubtotal).toBe(398_000);
    expect(totals.discount).toBe(100_000);
    expect(totals.licenseCount).toBe(2);
  });

  it('menghitung campuran paket promo dan non-promo', () => {
    const totals = getCartTotals([
      { productId: 'kasir-resto', packageId: 'basic', quantity: 1 },
      { productId: 'kasir-resto', packageId: 'pro', quantity: 1 },
      { productId: 'faktur-pajak', packageId: 'pro', quantity: 1 },
    ]);
    expect(totals.subtotal).toBe(249_000 + 349_000 + 89_000);
    expect(totals.listSubtotal).toBe(249_000 + 449_000 + 89_000);
    expect(totals.discount).toBe(100_000);
    expect(totals.itemCount).toBe(3);
  });

  it('mengabaikan baris dengan produk tidak dikenal', () => {
    const totals = getCartTotals([
      primaLicense('basic', 1),
      untrusted({ productId: 'produk-hantu', packageId: 'basic', quantity: 5 }),
    ]);
    expect(totals.itemCount).toBe(1);
  });
});

describe('getPromoUsages', () => {
  it('menghitung pemakaian hanya dari baris paket promo', () => {
    const items: CartItem[] = [
      { productId: 'kasir-resto', packageId: 'basic', quantity: 80 },
      { productId: 'kasir-resto', packageId: 'pro', quantity: 12 },
    ];
    const usages = getPromoUsages(items);
    expect(usages).toHaveLength(1);
    expect(usages[0].used).toBe(12);
    expect(usages[0].remaining).toBe(QUOTA_KASIR_RESTO - 12);
  });

  it('tidak menampilkan produk tanpa kuota promo', () => {
    const usages = getPromoUsages([{ productId: 'faktur-pajak', packageId: 'basic', quantity: 1 }]);
    expect(usages).toHaveLength(0);
  });
});

describe('reconcileCartItems', () => {
  it('membuang produk/paket tidak dikenal dan menggabungkan duplikat', () => {
    const outcome = reconcileCartItems([
      primaLicense('basic', 2),
      primaLicense('basic', 3),
      untrusted({ productId: 'produk-hantu', packageId: 'basic', quantity: 1 }),
      untrusted({ productId: 'kasir-prima', packageId: 'ultra', quantity: 1 }),
    ]);
    expect(outcome.changed).toBe(true);
    expect(outcome.items).toHaveLength(1);
    expect(outcome.items[0].quantity).toBe(5);
  });

  it('memotong quantity melebihi kuota dengan prioritas baris teratas', () => {
    const outcome = reconcileCartItems([primaLicense('pro', 60), primaLicense('business', 60)]);
    expect(outcome.changed).toBe(true);
    expect(outcome.items[0].quantity).toBe(60);
    expect(outcome.items[1].quantity).toBe(QUOTA_KASIR_PRIMA - 60);
  });

  it('membuang baris yang tidak mendapat jatah kuota sama sekali', () => {
    const outcome = reconcileCartItems([
      primaLicense('pro', QUOTA_KASIR_PRIMA),
      primaLicense('business', 5),
    ]);
    expect(outcome.changed).toBe(true);
    expect(outcome.items).toHaveLength(1);
    expect(outcome.items[0].packageId).toBe('pro');
  });

  it('membatasi quantity ke MAX_LICENSE_PER_LINE dan memperbaiki nilai rusak', () => {
    const outcome = reconcileCartItems([
      { productId: 'faktur-pajak', packageId: 'basic', quantity: 999 },
      { productId: 'faktur-pajak', packageId: 'pro', quantity: Number.NaN },
    ]);
    expect(outcome.changed).toBe(true);
    expect(outcome.items[0].quantity).toBe(MAX_LICENSE_PER_LINE);
    expect(outcome.items[1].quantity).toBe(1);
  });

  it('tidak menandai perubahan untuk keranjang yang sudah bersih', () => {
    const outcome = reconcileCartItems([primaLicense('basic', 2)]);
    expect(outcome.changed).toBe(false);
    expect(outcome.items).toHaveLength(1);
  });

  it('menghormati kuota ketat produk dengan sisa kecil', () => {
    const outcome = reconcileCartItems([
      { productId: 'manajemen-stok', packageId: 'pro', quantity: QUOTA_STOK - 2 },
      { productId: 'manajemen-stok', packageId: 'business', quantity: 10 },
    ]);
    expect(outcome.items[1].quantity).toBe(2);
  });
});
