import type { PricingLine, Product } from '@/lib/catalog/types';

export interface GA4Item {
  item_id: string;
  item_name: string;
  item_category: string;
  item_variant: string;
  price: number;
  quantity: number;
}

export interface DataLayerEvent {
  event: string;
  [key: string]: unknown;
}

declare global {
  interface Window {
    dataLayer?: DataLayerEvent[];
  }
}

type Listener = (entry: DataLayerEvent) => void;

const listeners = new Set<Listener>();

/** Mengirim event ke window.dataLayer (format GA4). */
export function pushEvent(entry: DataLayerEvent): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(entry);
  for (const listener of listeners) listener(entry);
}

/** Berlangganan semua event yang dikirim (dipakai panel debug ?debug=events). */
export function subscribeToEvents(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Dedup berbasis waktu untuk event yang boleh terkirim sekali per aksi. */
const dedupRegistry = new Map<string, number>();

export function shouldFireOnce(key: string, windowMs: number, now = Date.now()): boolean {
  const last = dedupRegistry.get(key);
  if (last !== undefined && now - last < windowMs) return false;
  dedupRegistry.set(key, now);
  return true;
}

export function resetDedupForTests(): void {
  dedupRegistry.clear();
}

export function buildGA4Item(line: PricingLine): GA4Item {
  return {
    item_id: line.product.id,
    item_name: line.product.name,
    item_category: line.product.categoryId,
    item_variant: line.package.name,
    price: line.unitPrice,
    quantity: line.quantity,
  };
}

export function trackViewItem(
  product: Product,
  unitPrice: number,
  options: { campaign?: string } = {},
): void {
  pushEvent({
    event: 'view_item',
    ...(options.campaign ? { campaign: options.campaign } : {}),
    ecommerce: {
      currency: 'IDR',
      value: unitPrice,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          item_category: product.categoryId,
          price: unitPrice,
          quantity: 1,
        },
      ],
    },
  });
}

export function trackAddToCart(line: PricingLine, options: { campaign?: string } = {}): void {
  pushEvent({
    event: 'add_to_cart',
    ...(options.campaign ? { campaign: options.campaign } : {}),
    ecommerce: {
      currency: 'IDR',
      value: line.lineTotal,
      items: [buildGA4Item(line)],
    },
  });
}

export function trackBeginCheckout(
  lines: PricingLine[],
  options: { campaign?: string } = {},
): void {
  const value = lines.reduce((total, line) => total + line.lineTotal, 0);
  pushEvent({
    event: 'begin_checkout',
    ...(options.campaign ? { campaign: options.campaign, coupon: options.campaign } : {}),
    ecommerce: {
      currency: 'IDR',
      value,
      items: lines.map(buildGA4Item),
    },
  });
}

export interface CtaClickPayload {
  ctaId: string;
  ctaText: string;
  location: string;
  destination: string;
  campaign?: string;
}

export function trackCtaClick(payload: CtaClickPayload): void {
  pushEvent({
    event: 'cta_click',
    cta_id: payload.ctaId,
    cta_text: payload.ctaText,
    cta_location: payload.location,
    destination: payload.destination,
    ...(payload.campaign ? { campaign: payload.campaign } : {}),
  });
}
