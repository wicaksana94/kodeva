import type { Metadata } from 'next';
import { NotFoundView } from '@/components/site/not-found-view';

export const metadata: Metadata = { title: 'Halaman tidak ditemukan' };

export default function NotFound() {
  return <NotFoundView />;
}
