// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildGA4Item,
  pushEvent,
  resetDedupForTests,
  shouldFireOnce,
  subscribeToEvents,
  trackAddToCart,
  trackCtaClick,
} from './datalayer';
import { getProductById, getProductPackage, getUnitPrice } from '@/lib/catalog';
import type { PricingLine } from '@/lib/catalog/types';

function buildLine(productId: string, packageId: string, quantity: number): PricingLine {
  const product = getProductById(productId)!;
  const pkg = getProductPackage(product, packageId)!;
  const unitPrice = getUnitPrice(pkg);
  return {
    productId,
    packageId: packageId as PricingLine['packageId'],
    quantity,
    product,
    package: pkg,
    unitPrice,
    listUnitPrice: pkg.pricePerLicensePerMonth,
    lineTotal: unitPrice * quantity,
    lineListTotal: pkg.pricePerLicensePerMonth * quantity,
    usesPromoQuota: pkg.promoPricePerLicensePerMonth !== null && product.promoQuota !== null,
  };
}

beforeEach(() => {
  window.dataLayer = [];
  resetDedupForTests();
});

describe('pushEvent', () => {
  it('mendorong event ke window.dataLayer', () => {
    pushEvent({ event: 'cta_click', cta_id: 'hero' });
    expect(window.dataLayer).toHaveLength(1);
    expect(window.dataLayer?.[0]).toMatchObject({ event: 'cta_click', cta_id: 'hero' });
  });

  it('memberi tahu semua subscriber dan berhenti setelah unsubscribe', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToEvents(listener);
    pushEvent({ event: 'view_item' });
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    pushEvent({ event: 'add_to_cart' });
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe('shouldFireOnce', () => {
  it('mencegah event ganda dalam window waktu', () => {
    const now = 1_000_000;
    expect(shouldFireOnce('view_item:kasir-prima', 60_000, now)).toBe(true);
    expect(shouldFireOnce('view_item:kasir-prima', 60_000, now + 30_000)).toBe(false);
    expect(shouldFireOnce('view_item:kasir-prima', 60_000, now + 61_000)).toBe(true);
  });

  it('kunci berbeda tidak saling memblokir', () => {
    const now = 1_000_000;
    expect(shouldFireOnce('view_item:a', 60_000, now)).toBe(true);
    expect(shouldFireOnce('view_item:b', 60_000, now)).toBe(true);
  });
});

describe('event GA4', () => {
  it('buildGA4Item memetakan field sesuai spesifikasi GA4', () => {
    const line = buildLine('kasir-prima', 'pro', 5);
    const item = buildGA4Item(line);
    expect(item).toEqual({
      item_id: 'kasir-prima',
      item_name: line.product.name,
      item_category: 'kasir',
      item_variant: line.package.name,
      price: line.unitPrice,
      quantity: 5,
    });
  });

  it('trackAddToCart mengirim nilai promo dan campaign', () => {
    const line = buildLine('kasir-prima', 'pro', 3);
    trackAddToCart(line, { campaign: 'Promo Akhir Tahun' });
    const entry = window.dataLayer?.[0];
    expect(entry?.event).toBe('add_to_cart');
    expect(entry?.campaign).toBe('Promo Akhir Tahun');
    expect(entry?.ecommerce).toMatchObject({
      currency: 'IDR',
      value: line.unitPrice * 3,
      items: [{ item_id: 'kasir-prima', quantity: 3, price: line.unitPrice }],
    });
  });

  it('trackCtaClick mengirim metadata CTA lengkap', () => {
    trackCtaClick({
      ctaId: 'hero-primary-cta',
      ctaText: 'Belanja Promo',
      location: 'hero',
      destination: '/katalog',
      campaign: 'Promo Akhir Tahun',
    });
    expect(window.dataLayer?.[0]).toMatchObject({
      event: 'cta_click',
      cta_id: 'hero-primary-cta',
      cta_text: 'Belanja Promo',
      cta_location: 'hero',
      destination: '/katalog',
      campaign: 'Promo Akhir Tahun',
    });
  });
});
