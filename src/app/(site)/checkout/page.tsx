import type { Metadata } from 'next';
import { CheckoutView } from '@/components/checkout/checkout-view';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Selesaikan pesanan lisensi produk Kodeva (pembayaran disimulasikan).',
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Checkout</h1>
      <p className="mt-2 text-slate-600">
        Lengkapi data pemesan. Harga final dihitung ulang di server saat pembayaran.
      </p>
      <CheckoutView />
    </div>
  );
}
