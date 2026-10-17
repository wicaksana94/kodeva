'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { selectCartCount, useCartStore } from '@/lib/store/cart';
import { useUiStore } from '@/lib/store/ui';

const navItems = [
  { href: '/katalog', label: 'Katalog' },
  { href: '/blog', label: 'Blog' },
];

export function SiteHeader() {
  const openCart = useUiStore((state) => state.openCart);
  const cartCount = useCartStore(selectCartCount);
  const hydrated = useCartStore((state) => state.hydrated);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4">
        <Link href="/" className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-black text-white"
          >
            K
          </span>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">Kodeva</span>
        </Link>

        <nav aria-label="Navigasi utama" className="flex items-center gap-1">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={openCart}
          className="relative inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:bg-slate-50"
          aria-label={
            hydrated && cartCount > 0
              ? `Buka keranjang, ${cartCount} lisensi di dalamnya`
              : 'Buka keranjang'
          }
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="size-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
            />
          </svg>
          <span className="hidden sm:inline">Keranjang</span>
          {hydrated && cartCount > 0 && (
            <span className="absolute -top-2 -right-2 grid min-w-5 place-items-center rounded-full bg-indigo-600 px-1.5 py-0.5 text-xs font-bold text-white">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
