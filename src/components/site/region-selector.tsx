'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type RegionCode = 'id' | 'my' | 'sg';

const CURRENT_REGION: RegionCode = 'id';

const REGIONS: { code: RegionCode; label: string }[] = [
  { code: 'id', label: 'Indonesia' },
  { code: 'my', label: 'Malaysia' },
  { code: 'sg', label: 'Singapore' },
];

const MALAYSIA_STAR =
  '7.9,3 8.26,4.1 9.42,4.11 8.49,4.79 8.84,5.89 7.9,5.22 6.96,5.89 7.31,4.79 6.38,4.11 7.54,4.1';

const SPARKLE = 'M0-0.65 L0.16-0.16 L0.65 0 L0.16 0.16 L0 0.65 L-0.16 0.16 L-0.65 0 L-0.16-0.16 Z';

const SINGAPORE_STARS: [number, number][] = [
  [8.1, 2.4],
  [9.5, 3.42],
  [8.97, 5.04],
  [7.23, 5.04],
  [6.7, 3.42],
];

function flagClassName(className: string) {
  return `${className} shrink-0 rounded-[3px] ring-1 ring-slate-900/10`;
}

function IndonesiaFlag({ className = 'h-4 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 16" aria-hidden="true" className={flagClassName(className)}>
      <rect width="24" height="8" fill="#CE1126" />
      <rect y="8" width="24" height="8" fill="#FFFFFF" />
    </svg>
  );
}

function MalaysiaFlag({ className = 'h-4 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 16" aria-hidden="true" className={flagClassName(className)}>
      {Array.from({ length: 14 }, (_, index) => (
        <rect
          key={index}
          y={(index * 16) / 14}
          width="24"
          height={16 / 14}
          fill={index % 2 === 0 ? '#CC0001' : '#FFFFFF'}
        />
      ))}
      <rect width="12" height="9.15" fill="#010066" />
      <circle cx="5.2" cy="4.6" r="2.5" fill="#FFCC00" />
      <circle cx="6.25" cy="4.6" r="2.2" fill="#010066" />
      <polygon points={MALAYSIA_STAR} fill="#FFCC00" />
    </svg>
  );
}

function SingaporeFlag({ className = 'h-4 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 16" aria-hidden="true" className={flagClassName(className)}>
      <rect width="24" height="8" fill="#EF3340" />
      <rect y="8" width="24" height="8" fill="#FFFFFF" />
      <circle cx="5" cy="4" r="2.6" fill="#FFFFFF" />
      <circle cx="6.05" cy="4" r="2.35" fill="#EF3340" />
      {SINGAPORE_STARS.map(([x, y]) => (
        <path
          key={`${x}-${y}`}
          d={SPARKLE}
          transform={`translate(${x} ${y}) scale(0.8)`}
          fill="#FFFFFF"
        />
      ))}
    </svg>
  );
}

function flagFor(code: RegionCode) {
  if (code === 'my') return <MalaysiaFlag />;
  if (code === 'sg') return <SingaporeFlag />;
  return <IndonesiaFlag />;
}

function regionLabel(code: RegionCode) {
  return REGIONS.find((region) => region.code === code)?.label ?? 'Indonesia';
}

function ComingSoonDialog({ region, onClose }: { region: RegionCode; onClose: () => void }) {
  const okButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    okButtonRef.current?.focus();
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused.current?.focus?.();
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[65] grid place-items-center p-4">
      <div onClick={onClose} className="absolute inset-0" aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="region-coming-soon-title"
        className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
      >
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-slate-100">
          {region === 'my' ? (
            <MalaysiaFlag className="h-7 w-10" />
          ) : (
            <SingaporeFlag className="h-7 w-10" />
          )}
        </span>
        <h2 id="region-coming-soon-title" className="mt-3 text-lg font-bold text-slate-900">
          Segera hadir di {regionLabel(region)}
        </h2>
        <p className="mt-1.5 text-sm text-slate-600">
          Katalog lisensi Kodeva untuk region ini sedang disiapkan. Sementara itu, semua produk
          tetap dapat dibeli melalui region Indonesia.
        </p>
        <button
          ref={okButtonRef}
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Baik, mengerti
        </button>
      </div>
    </div>,
    document.body,
  );
}

export function RegionSelector() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [comingSoon, setComingSoon] = useState<RegionCode | null>(null);
  const menuRootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    function onPointerDown(event: PointerEvent) {
      if (!menuRootRef.current?.contains(event.target as Node)) setMenuOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  function selectRegion(code: RegionCode) {
    setMenuOpen(false);
    if (code !== 'id') setComingSoon(code);
  }

  return (
    <>
      <div ref={menuRootRef} className="relative">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-controls="region-menu"
          aria-label={`Pilih region — saat ini ${regionLabel(CURRENT_REGION)}`}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:bg-slate-50"
        >
          {flagFor(CURRENT_REGION)}
          <span aria-hidden="true" className="hidden sm:inline">
            {regionLabel(CURRENT_REGION)}
          </span>
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`size-4 text-slate-400 transition ${menuOpen ? 'rotate-180' : ''}`}
          >
            <path
              fillRule="evenodd"
              d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {menuOpen && (
          <div
            id="region-menu"
            role="menu"
            aria-label="Pilih region"
            className="absolute top-[calc(100%+0.5rem)] right-0 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl"
          >
            {REGIONS.map((region) => (
              <button
                key={region.code}
                type="button"
                role="menuitem"
                onClick={() => selectRegion(region.code)}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                {flagFor(region.code)}
                <span className="flex-1">{region.label}</span>
                {region.code === CURRENT_REGION && (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="size-4 text-indigo-600"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 5.29a.75.75 0 0 1 .006 1.06l-7.25 7.34a.75.75 0 0 1-1.066-.006l-3.25-3.29a.75.75 0 1 1 1.06-1.06l2.72 2.75 6.72-6.79a.75.75 0 0 1 1.06.006Z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {comingSoon && <ComingSoonDialog region={comingSoon} onClose={() => setComingSoon(null)} />}
    </>
  );
}
