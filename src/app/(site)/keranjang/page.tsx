import type { Metadata } from 'next';
import { CartPageView } from '@/components/cart/cart-page-view';

export const metadata: Metadata = {
  title: 'Keranjang',
  description: 'Tinjau lisensi produk yang Anda pilih sebelum melanjutkan ke pembayaran.',
  robots: { index: false },
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Keranjang</h1>
      <p className="mt-2 text-slate-600">
        Cek kembali paket dan jumlah lisensi. Kuota promo dibagi per produk, bukan per paket.
      </p>
      <CartPageView />
    </div>
  );
}
