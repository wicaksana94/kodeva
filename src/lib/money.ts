const idrFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

/** Format angka Rupiah tanpa desimal, contoh: 199000 -> "Rp199.000". */
export function formatIDR(value: number): string {
  return idrFormatter.format(value);
}
