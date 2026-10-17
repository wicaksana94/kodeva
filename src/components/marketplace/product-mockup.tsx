import { categoryAccent } from '@/lib/ui/accents';
import type { CategoryId } from '@/lib/catalog/types';

interface ProductMockupProps {
  productName: string;
  categoryId: CategoryId;
  variant: 'dashboard' | 'transaksi' | 'laporan';
}

const screenTitles: Record<ProductMockupProps['variant'], string> = {
  dashboard: 'Dashboard',
  transaksi: 'Transaksi Baru',
  laporan: 'Laporan',
};

/**
 * Mockup "screenshot" aplikasi yang dirender sebagai DOM (bukan file gambar) agar
 * tajam di semua ukuran layar, ringan, dan tidak menambah permintaan jaringan.
 */
export function ProductMockup({ productName, categoryId, variant }: ProductMockupProps) {
  const accent = categoryAccent[categoryId];
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2">
        <span className="flex gap-1">
          <span className="size-2 rounded-full bg-red-400" />
          <span className="size-2 rounded-full bg-amber-400" />
          <span className="size-2 rounded-full bg-emerald-400" />
        </span>
        <span className="truncate text-[11px] font-medium text-slate-500">
          {productName} · {screenTitles[variant]}
        </span>
      </div>
      <div
        className={`bg-gradient-to-br p-3 ${variant === 'transaksi' ? 'from-slate-50 to-slate-100' : 'from-white to-slate-50'}`}
      >
        {variant === 'dashboard' && <DashboardBody accent={accent} />}
        {variant === 'transaksi' && <TransaksiBody accent={accent} />}
        {variant === 'laporan' && <LaporanBody accent={accent} />}
      </div>
    </div>
  );
}

function DashboardBody({ accent }: { accent: string }) {
  return (
    <div className="flex gap-3">
      <div className="hidden w-10 shrink-0 flex-col gap-2 sm:flex">
        {[0, 1, 2, 3].map((index) => (
          <span
            key={index}
            className={`size-6 rounded-lg ${index === 0 ? `bg-gradient-to-br ${accent}` : 'bg-slate-200'}`}
          />
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Omzet hari ini', value: 'Rp12,4 jt' },
            { label: 'Transaksi', value: '183' },
            { label: 'Rata-rata', value: 'Rp67 rb' },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-lg border border-slate-100 bg-white p-2">
              <p className="truncate text-[9px] text-slate-500">{kpi.label}</p>
              <p className="text-xs font-bold text-slate-800">{kpi.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-2 rounded-lg border border-slate-100 bg-white p-2">
          <svg viewBox="0 0 200 48" className="h-12 w-full">
            <defs>
              <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0 38 L25 30 L50 33 L75 22 L100 26 L125 14 L150 18 L175 8 L200 12 L200 48 L0 48 Z"
              fill="url(#chartFill)"
              className="text-indigo-500"
            />
            <path
              d="M0 38 L25 30 L50 33 L75 22 L100 26 L125 14 L150 18 L175 8 L200 12"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              className="stroke-indigo-500"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

function TransaksiBody({ accent }: { accent: string }) {
  const items = [
    { name: 'Kopi Susu', price: 'Rp22.000' },
    { name: 'Nasi Goreng', price: 'Rp28.000' },
    { name: 'Es Teh', price: 'Rp8.000' },
    { name: 'Roti Bakar', price: 'Rp18.000' },
  ];
  return (
    <div className="grid grid-cols-[1fr_auto] gap-3">
      <div className="grid grid-cols-2 gap-2">
        {items.map((item, index) => (
          <div
            key={item.name}
            className={`rounded-lg border p-2 ${index === 0 ? 'border-slate-300 bg-white shadow-sm' : 'border-slate-100 bg-white/70'}`}
          >
            <div
              className={`mb-1 h-8 rounded ${index % 2 === 0 ? 'bg-slate-100' : 'bg-slate-50'}`}
            />
            <p className="truncate text-[10px] font-semibold text-slate-700">{item.name}</p>
            <p className="text-[10px] text-slate-500">{item.price}</p>
          </div>
        ))}
      </div>
      <div className="flex w-24 flex-col rounded-lg border border-slate-100 bg-white p-2">
        <p className="text-[9px] font-semibold text-slate-500">Pesanan #1287</p>
        <div className="mt-1 space-y-1">
          {['2 × Kopi Susu', '1 × Nasi Goreng', '3 × Es Teh'].map((row) => (
            <p key={row} className="text-[9px] text-slate-500">
              {row}
            </p>
          ))}
        </div>
        <div className="mt-auto border-t border-dashed border-slate-200 pt-1">
          <p className="text-[9px] text-slate-500">Total</p>
          <p className="text-xs font-bold text-slate-800">Rp96.000</p>
        </div>
        <div
          className={`mt-1 rounded bg-gradient-to-r py-1 text-center text-[9px] font-bold text-white ${accent}`}
        >
          Bayar
        </div>
      </div>
    </div>
  );
}

function LaporanBody({ accent }: { accent: string }) {
  const rows = [
    { name: 'Kopi Susu', qty: 214, total: 'Rp4,7 jt', width: '92%' },
    { name: 'Nasi Goreng', qty: 187, total: 'Rp5,2 jt', width: '81%' },
    { name: 'Es Teh', qty: 402, total: 'Rp3,2 jt', width: '68%' },
    { name: 'Roti Bakar', qty: 96, total: 'Rp1,7 jt', width: '44%' },
  ];
  return (
    <div className="rounded-lg border border-slate-100 bg-white p-2">
      <div className="grid grid-cols-[1.4fr_auto_auto] items-center gap-2 border-b border-slate-100 pb-1 text-[9px] font-semibold text-slate-500">
        <span>Produk</span>
        <span>Terjual</span>
        <span>Omzet</span>
      </div>
      {rows.map((row) => (
        <div
          key={row.name}
          className="grid grid-cols-[1.4fr_auto_auto] items-center gap-2 border-b border-slate-50 py-1.5 last:border-0"
        >
          <div className="min-w-0">
            <p className="truncate text-[10px] font-medium text-slate-700">{row.name}</p>
            <div
              className={`h-1 rounded-full bg-gradient-to-r ${accent}`}
              style={{ width: row.width }}
            />
          </div>
          <span className="text-[10px] text-slate-500 tabular-nums">{row.qty}</span>
          <span className="text-[10px] font-semibold text-slate-700 tabular-nums">{row.total}</span>
        </div>
      ))}
    </div>
  );
}
