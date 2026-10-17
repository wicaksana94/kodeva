import type { PortableTextBlock } from '@portabletext/react';

export function formatPostDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function estimateReadingMinutes(blocks: PortableTextBlock[]): number {
  let words = 0;
  for (const block of blocks) {
    const children = (block as { children?: { text?: string }[] }).children ?? [];
    for (const child of children) {
      if (child?.text) {
        words += child.text.trim().split(/\s+/).filter(Boolean).length;
      }
    }
  }
  return Math.max(1, Math.round(words / 200));
}
