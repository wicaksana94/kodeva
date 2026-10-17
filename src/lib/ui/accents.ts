import type { CategoryId } from '@/lib/catalog/types';

export const categoryAccent: Record<CategoryId, string> = {
  kasir: 'from-indigo-500 to-violet-600',
  'hr-payroll': 'from-sky-500 to-blue-600',
  'add-on': 'from-amber-500 to-orange-600',
};

export const categorySoftBadge: Record<CategoryId, string> = {
  kasir: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  'hr-payroll': 'bg-sky-50 text-sky-700 ring-sky-200',
  'add-on': 'bg-amber-50 text-amber-700 ring-amber-200',
};

export function productInitials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  const initials = words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
  return initials || 'K';
}
