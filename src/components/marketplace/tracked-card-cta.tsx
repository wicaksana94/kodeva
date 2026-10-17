'use client';

import type { ReactNode } from 'react';
import { trackCtaClick } from '@/lib/analytics/datalayer';

interface TrackedCardCtaProps {
  className?: string;
  ctaId: string;
  ctaText: string;
  location: string;
  destination: string;
  campaign?: string;
  children: ReactNode;
}

/**
 * CTA non-link untuk dipakai di dalam kartu yang seluruhnya sudah berupa `<Link>`
 * (tidak boleh ada `<a>` bersarang): klik tombol tetap mengirim event `cta_click`,
 * sementara navigasi ditangani oleh tautan kartu.
 */
export function TrackedCardCta({
  className,
  ctaId,
  ctaText,
  location,
  destination,
  campaign,
  children,
}: TrackedCardCtaProps) {
  return (
    <span
      className={className}
      onClick={() => trackCtaClick({ ctaId, ctaText, location, destination, campaign })}
    >
      {children}
    </span>
  );
}
