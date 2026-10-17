'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { trackCtaClick } from '@/lib/analytics/datalayer';

type Variant = 'primary' | 'secondary' | 'ghost';

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-indigo-600 text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-indigo-600',
  secondary:
    'border border-slate-300 bg-white text-slate-800 transition hover:border-slate-500 hover:bg-slate-50',
  ghost: 'text-indigo-700 underline-offset-4 transition hover:underline',
};

interface TrackedCtaProps {
  href: string;
  label: string;
  ctaId: string;
  location: string;
  campaign?: string;
  variant?: Variant;
  className?: string;
  children?: ReactNode;
}

/** Tombol CTA yang mengirim event `cta_click` ke dataLayer saat diklik. */
export function TrackedCta({
  href,
  label,
  ctaId,
  location,
  campaign,
  variant = 'primary',
  className = '',
  children,
}: TrackedCtaProps) {
  const baseClass = `inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold ${variantStyles[variant]} ${className}`;

  function handleClick() {
    trackCtaClick({ ctaId, ctaText: label, location, destination: href, campaign });
  }

  if (href.startsWith('#') || href.startsWith('http')) {
    return (
      <a href={href} onClick={handleClick} className={baseClass}>
        {children ?? label}
      </a>
    );
  }
  return (
    <Link href={href} onClick={handleClick} className={baseClass}>
      {children ?? label}
    </Link>
  );
}
