'use client';

import { useState, useSyncExternalStore } from 'react';
import { subscribeToEvents } from '@/lib/analytics/datalayer';
import type { DataLayerEvent } from '@/lib/analytics/datalayer';

const MAX_VISIBLE_EVENTS = 8;

const emptyQuerySubscribe = () => () => {};

/**
 * Panel debug kecil untuk membuktikan event GA4 memang terkirim ke dataLayer.
 * Aktif hanya jika URL memiliki query `?debug=events`.
 */
export function DebugEventsPanel() {
  const [open, setOpen] = useState(true);

  const enabled = useSyncExternalStore(
    emptyQuerySubscribe,
    () => new URLSearchParams(window.location.search).get('debug') === 'events',
    () => false,
  );

  const events = useSyncExternalStore(subscribeStore, getEventsSnapshot, () => EMPTY_SNAPSHOT);

  if (!enabled) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[80] w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-700 bg-slate-900/95 text-slate-100 shadow-2xl backdrop-blur">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-bold tracking-wide uppercase"
        aria-expanded={open}
      >
        <span>dataLayer events ({events.length})</span>
        <span aria-hidden="true">{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div className="max-h-72 overflow-y-auto border-t border-slate-700 px-3 py-2 font-mono text-[11px] leading-relaxed">
          {events.length === 0 ? (
            <p className="py-2 text-slate-500">
              Belum ada event. Coba klik CTA / tambah ke keranjang.
            </p>
          ) : (
            <ul className="space-y-2">
              {[...events].reverse().map((entry, index) => (
                <li
                  key={events.length - index}
                  className="border-b border-slate-800 pb-2 last:border-0"
                >
                  <span className="text-emerald-400">{entry.event}</span>
                  <pre className="mt-0.5 break-all whitespace-pre-wrap text-slate-300">
                    {JSON.stringify(entry, null, 1)}
                  </pre>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

const EMPTY_SNAPSHOT: DataLayerEvent[] = [];
let snapshot: DataLayerEvent[] = EMPTY_SNAPSHOT;

function subscribeStore(listener: () => void): () => void {
  return subscribeToEvents((entry) => {
    snapshot = [...snapshot, entry].slice(-MAX_VISIBLE_EVENTS);
    listener();
  });
}

function getEventsSnapshot(): DataLayerEvent[] {
  return snapshot;
}
