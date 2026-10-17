'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { getCartTotals } from '@/lib/cart/logic';
import { getStoredAttribution } from '@/lib/analytics/utm';
import {
  hasRecentCheckoutStart,
  markCheckoutStarted,
} from '@/lib/analytics/checkout-session';
import { trackBeginCheckout } from '@/lib/analytics/datalayer';
import { PAYMENT_METHOD_LABELS, checkoutRequestSchema, type PaymentMethod } from '@/lib/checkout/schema';
import { formatIDR } from '@/lib/money';
import { DEFAULT_CAMPAIGN } from '@/lib/campaign';
import { useCartStore } from '@/lib/store/cart';
import { useToastStore } from '@/lib/store/toasts';
import { fieldErrorsFromZod } from '@/lib/validation';

interface PaymentTotals {
  subtotal: number;
  discount: number;
  total: number;
  licenseCount: number;
}

interface PaymentLine {
  productName: string;
  packageName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  usesPromoQuota: boolean;
}

interface PaymentResponse {
  ok: boolean;
  status?: 'success' | 'failed';
  orderId?: string;
  reason?: string;
  error?: string;
  errors?: Record<string, string>;
  totals?: PaymentTotals;
  lines?: PaymentLine[];
  email?: string;
}

type Result =
  | { kind: 'success'; orderId: string; totals: PaymentTotals; lines: PaymentLine[]; email: string }
  | { kind: 'failed'; reason: string }
  | null;

export function CheckoutView() {
  const items = useCartStore((state) => state.items);
  const hydrated = useCartStore((state) => state.hydrated);
  const clearCart = useCartStore((state) => state.clear);
  const pushToast = useToastStore((state) => state.push);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transfer');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result>(null);

  const totals = getCartTotals(items);
  const beginCheckoutTracked = useRef(false);

  useEffect(() => {
    if (beginCheckoutTracked.current || !hydrated || items.length === 0) return;
    beginCheckoutTracked.current = true;
    if (!hasRecentCheckoutStart()) {
      trackBeginCheckout(getCartTotals(items).lines, { campaign: DEFAULT_CAMPAIGN.name });
      markCheckoutStarted();
    }
  }, [hydrated, items]);

  async function submitOrder() {
    const payload = {
      customer: {
        name,
        email,
        phone,
        businessName: businessName.trim() || undefined,
        notes: notes.trim() || undefined,
      },
      paymentMethod,
      items: items.map((item) => ({
        productId: item.productId,
        packageId: item.packageId,
        quantity: item.quantity,
      })),
      attribution: getStoredAttribution() ?? undefined,
    };

    const parsed = checkoutRequestSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(fieldErrorsFromZod(parsed.error));
      return;
    }
    setErrors({});
    setSubmitting(true);
    setResult(null);
    try {
      const response = await fetch('/api/mock-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      const data = (await response.json().catch(() => null)) as PaymentResponse | null;

      if (!response.ok) {
        if (data?.errors) {
          setErrors(data.errors);
        } else {
          setResult({
            kind: 'failed',
            reason: data?.error ?? 'Pesanan tidak dapat diproses. Silakan coba lagi.',
          });
        }
        return;
      }

      if (data?.status === 'success' && data.orderId && data.totals) {
        setResult({
          kind: 'success',
          orderId: data.orderId,
          totals: data.totals,
          lines: data.lines ?? [],
          email: data.email ?? email,
        });
        clearCart();
        pushToast(`Pembayaran berhasil. Pesanan ${data.orderId} diterima.`, 'success');
        return;
      }

      setResult({
        kind: 'failed',
        reason: data?.reason ?? 'Pembayaran gagal karena alasan yang tidak diketahui.',
      });
    } catch {
      setResult({
        kind: 'failed',
        reason: 'Tidak dapat terhubung ke server pembayaran. Periksa koneksi lalu coba lagi.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (result?.kind === 'success') {
    return (
      <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-emerald-600 text-white">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </span>
          <div>
            <h2 className="text-xl font-extrabold text-emerald-900">Pembayaran berhasil!</h2>
            <p className="mt-1 text-sm text-emerald-800">
              Nomor pesanan <span className="font-bold">{result.orderId}</span>. Email konfirmasi
              (simulasi) dikirim ke <span className="font-semibold">{result.email}</span>.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-emerald-200 bg-white p-5">
          <h3 className="text-sm font-bold text-slate-900">Rincian lisensi</h3>
          <ul className="mt-3 divide-y divide-slate-100">
            {result.lines.map((line, index) => (
              <li key={index} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <div>
                  <p className="font-semibold text-slate-900">
                    {line.productName} — {line.packageName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {line.quantity} lisensi × {formatIDR(line.unitPrice)}
                    {line.usesPromoQuota && ' · harga promo'}
                  </p>
                </div>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {formatIDR(line.lineTotal)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-1.5 border-t border-slate-100 pt-3 text-sm">
            {result.totals.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <dt>Hemat dari promo</dt>
                <dd className="font-semibold tabular-nums">−{formatIDR(result.totals.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="font-bold text-slate-900">Total dibayar</dt>
              <dd className="text-lg font-extrabold text-slate-900 tabular-nums">
                {formatIDR(result.totals.total)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/katalog"
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Belanja lagi
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-emerald-300 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
          >
            Kembali ke beranda
          </Link>
        </div>
      </div>
    );
  }

  if (hydrated && items.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
        <p className="text-lg font-bold text-slate-800">Tidak ada yang bisa di-checkout</p>
        <p className="mt-1 text-sm text-slate-500">Keranjang Anda kosong.</p>
        <Link
          href="/katalog"
          className="mt-5 inline-block rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Lihat katalog produk
        </Link>
      </div>
    );
  }

  function fieldError(key: string) {
    return errors[key] ? (
      <p className="mt-1 text-xs font-medium text-red-600">{errors[key]}</p>
    ) : null;
  }

  return (
    <div className="mt-6 grid items-start gap-8 lg:grid-cols-5">
      <div className="lg:col-span-3">
        {result?.kind === 'failed' && (
          <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5">
            <p className="text-sm font-bold text-red-800">Pembayaran gagal</p>
            <p className="mt-1 text-sm text-red-700">{result.reason}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={submitOrder}
                disabled={submitting}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                Coba bayar lagi
              </button>
              <Link
                href="/keranjang"
                className="rounded-lg border border-red-300 bg-white px-4 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100"
              >
                Ubah keranjang
              </Link>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          <strong>Mode simulasi pembayaran:</strong> transaksi tidak nyata. Untuk menguji alur
          gagal, gunakan email yang diawali “fail” (contoh: <code>fail@bisnis.com</code>) — semua
          email lain akan berhasil.
        </div>

        <form
          className="mt-5 space-y-5"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            submitOrder();
          }}
        >
          <fieldset className="rounded-2xl border border-slate-200 bg-white p-5">
            <legend className="px-1 text-sm font-bold text-slate-900">Data pemesan</legend>
            <div className="mt-2 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="co-name" className="block text-sm font-semibold text-slate-800">
                  Nama lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  id="co-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  aria-invalid={Boolean(errors['customer.name'])}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                />
                {fieldError('customer.name')}
              </div>
              <div>
                <label htmlFor="co-email" className="block text-sm font-semibold text-slate-800">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="co-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-invalid={Boolean(errors['customer.email'])}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                />
                {fieldError('customer.email')}
              </div>
              <div>
                <label htmlFor="co-phone" className="block text-sm font-semibold text-slate-800">
                  Nomor WhatsApp <span className="text-red-500">*</span>
                </label>
                <input
                  id="co-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="081234567890"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  aria-invalid={Boolean(errors['customer.phone'])}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                />
                {fieldError('customer.phone')}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="co-business" className="block text-sm font-semibold text-slate-800">
                  Nama bisnis <span className="text-xs font-normal text-slate-500">(opsional)</span>
                </label>
                <input
                  id="co-business"
                  type="text"
                  autoComplete="organization"
                  value={businessName}
                  onChange={(event) => setBusinessName(event.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                />
                {fieldError('customer.businessName')}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="co-notes" className="block text-sm font-semibold text-slate-800">
                  Catatan <span className="text-xs font-normal text-slate-500">(opsional)</span>
                </label>
                <textarea
                  id="co-notes"
                  rows={3}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Contoh: minta dibantu migrasi data dari aplikasi lama"
                  className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                />
                {fieldError('customer.notes')}
              </div>
            </div>
          </fieldset>

          <fieldset className="rounded-2xl border border-slate-200 bg-white p-5">
            <legend className="px-1 text-sm font-bold text-slate-900">Metode pembayaran</legend>
            <div className="mt-2 space-y-2.5">
              {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((method) => (
                <label
                  key={method}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition ${
                    paymentMethod === method
                      ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={() => setPaymentMethod(method)}
                    className="mt-0.5 accent-indigo-600"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">
                      {PAYMENT_METHOD_LABELS[method]}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      {method === 'transfer' && 'Instruksi Virtual Account dikirim setelah pesanan dibuat.'}
                      {method === 'card' && 'Simulasi pembayaran kartu 3D Secure.'}
                      {method === 'ewallet' && 'Simulasi deeplink ke aplikasi e-wallet.'}
                    </span>
                  </span>
                </label>
              ))}
            </div>
            {fieldError('paymentMethod')}
          </fieldset>

          <button
            type="submit"
            disabled={submitting}
            className="min-h-12 w-full rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Memproses pembayaran…' : `Bayar Sekarang — ${formatIDR(totals.subtotal)}`}
          </button>
          <p aria-live="polite" className="sr-only">
            {submitting ? 'Sedang memproses pembayaran' : ''}
          </p>
        </form>
      </div>

      <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2 lg:sticky lg:top-20">
        <h2 className="text-base font-bold text-slate-900">Pesanan Anda</h2>
        {!hydrated ? (
          <div className="mt-4 space-y-3" role="status" aria-label="Memuat pesanan…">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="h-14 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : (
          <>
            <ul className="mt-4 divide-y divide-slate-100">
              {totals.lines.map((line) => (
                <li
                  key={`${line.productId}-${line.packageId}`}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {line.product.name} — {line.package.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {line.quantity} lisensi × {formatIDR(line.unitPrice)}
                    </p>
                  </div>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {formatIDR(line.lineTotal)}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-2 border-t border-slate-100 pt-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-600">Subtotal</dt>
                <dd className="font-semibold text-slate-900 tabular-nums">
                  {formatIDR(totals.listSubtotal)}
                </dd>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <dt>Diskon promo</dt>
                  <dd className="font-semibold tabular-nums">−{formatIDR(totals.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="font-bold text-slate-900">Total</dt>
                <dd className="text-lg font-extrabold text-slate-900 tabular-nums">
                  {formatIDR(totals.subtotal)}
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-[11px] text-slate-500">
              Total final dihitung ulang di server dari katalog terkini saat pembayaran diproses.
            </p>
          </>
        )}
      </aside>
    </div>
  );
}
