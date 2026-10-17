import { NextRequest } from 'next/server';
import { buildPricingLines, getCartTotals, getPromoUsedByProduct } from '@/lib/cart/logic';
import { getProductById } from '@/lib/catalog';
import type { CartItem } from '@/lib/catalog/types';
import { fieldErrorsFromZod } from '@/lib/validation';
import { checkRateLimit } from '@/lib/leads/rate-limit';
import { checkoutRequestSchema } from '@/lib/checkout/schema';

const MAX_BODY_BYTES = 20_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildOrderId(now: Date): string {
  const year = String(now.getFullYear()).slice(2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `KV-${year}${month}-${random}`;
}

/**
 * Simulasi pembayaran (tidak ada transaksi sungguhan).
 *
 * Aturan sukses/gagal yang deterministik untuk pengujian:
 * - Email yang diawali "fail" SELALU gagal (contoh: fail@bisnis.com).
 * - Selain itu berhasil, dengan jeda 0,7–1,5 detik untuk mensimulasikan
 *   proses ke payment gateway.
 *
 * Harga TIDAK dipercaya dari client: total selalu dihitung ulang di server
 * dari data katalog, dan permintaan yang melebihi sisa kuota promo ditolak
 * dengan status 409 agar data keranjang yang kedaluwarsa tidak lolos.
 */
export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return Response.json({ ok: false, error: 'Payload terlalu besar.' }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { ok: false, error: 'Body harus berupa JSON yang valid.' },
      { status: 400 },
    );
  }

  const parsed = checkoutRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, errors: fieldErrorsFromZod(parsed.error) }, { status: 400 });
  }
  const order = parsed.data;

  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
  const rateLimit = checkRateLimit(`payment:${ip}`);
  if (!rateLimit.allowed) {
    return Response.json(
      { ok: false, error: 'Terlalu banyak percobaan pembayaran. Coba lagi beberapa menit lagi.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } },
    );
  }

  // Validasi item terhadap katalog terkini.
  for (const item of order.items) {
    const product = getProductById(item.productId);
    if (!product) {
      return Response.json(
        { ok: false, error: `Produk ${item.productId} tidak ditemukan. Muat ulang keranjang.` },
        { status: 409 },
      );
    }
    if (!product.packages.some((pkg) => pkg.id === item.packageId)) {
      return Response.json(
        { ok: false, error: `Paket ${item.packageId} tidak tersedia untuk ${product.name}.` },
        { status: 409 },
      );
    }
  }

  const cartItems: CartItem[] = order.items.map((item) => ({
    productId: item.productId,
    packageId: item.packageId,
    quantity: item.quantity,
  }));

  // Cek kuota promo: jumlah lisensi promo per produk tidak boleh melebihi sisa kuota.
  const productIds = [...new Set(cartItems.map((item) => item.productId))];
  for (const productId of productIds) {
    const product = getProductById(productId)!;
    if (!product.promoQuota) continue;
    const promoUsed = getPromoUsedByProduct(cartItems, productId);
    if (promoUsed > product.promoQuota.remaining) {
      return Response.json(
        {
          ok: false,
          error: `Kuota promo ${product.name} tinggal ${product.promoQuota.remaining} lisensi, permintaan Anda ${promoUsed} lisensi. Silakan sesuaikan jumlah di keranjang.`,
        },
        { status: 409 },
      );
    }
  }

  const totals = getCartTotals(cartItems);
  const orderId = buildOrderId(new Date());

  await sleep(700 + Math.random() * 800);

  const email = order.customer.email.toLowerCase();
  const shouldFail = email.startsWith('fail');

  if (shouldFail) {
    console.info(`[mock-payment] ${orderId} GAGAL (aturan simulasi: email diawali "fail")`);
    return Response.json({
      ok: true,
      status: 'failed',
      orderId,
      reason:
        'Pembayaran ditolak oleh sistem simulasi. Ini terjadi karena email Anda diawali dengan kata "fail" (aturan pengujian). Ganti email pelanggan atau coba metode pembayaran lain.',
      totals: {
        subtotal: totals.subtotal,
        discount: totals.discount,
        total: totals.subtotal,
        licenseCount: totals.licenseCount,
      },
    });
  }

  console.info(`[mock-payment] ${orderId} BERHASIL — total ${totals.subtotal}`);
  return Response.json({
    ok: true,
    status: 'success',
    orderId,
    paymentMethod: order.paymentMethod,
    email: order.customer.email,
    totals: {
      subtotal: totals.subtotal,
      discount: totals.discount,
      total: totals.subtotal,
      licenseCount: totals.licenseCount,
    },
    lines: buildPricingLines(cartItems).map((line) => ({
      productName: line.product.name,
      packageName: line.package.name,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      lineTotal: line.lineTotal,
      usesPromoQuota: line.usesPromoQuota,
    })),
  });
}
