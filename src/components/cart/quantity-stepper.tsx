'use client';

interface QuantityStepperProps {
  value: number;
  min?: number;
  max: number;
  onChange: (next: number) => void;
  label: string;
  disabled?: boolean;
}

export function QuantityStepper({
  value,
  min = 1,
  max,
  onChange,
  label,
  disabled = false,
}: QuantityStepperProps) {
  const atMin = value <= min;
  const atMax = value >= max;

  return (
    <div className="flex items-center gap-1" role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={disabled || atMin}
        aria-label={`Kurangi ${label}`}
        className="grid size-9 place-items-center rounded-lg border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-4">
          <path d="M5 10a.75.75 0 0 1 .75-.75h8.5a.75.75 0 0 1 0 1.5h-8.5A.75.75 0 0 1 5 10Z" />
        </svg>
      </button>
      <span
        className="min-w-8 text-center text-sm font-semibold tabular-nums"
        aria-live="polite"
        aria-label={`${label} saat ini ${value}`}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={disabled || atMax}
        aria-label={`Tambah ${label}`}
        className="grid size-9 place-items-center rounded-lg border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-4">
          <path d="M10 5a.75.75 0 0 1 .75.75v3.5h3.5a.75.75 0 0 1 0 1.5h-3.5v3.5a.75.75 0 0 1-1.5 0v-3.5h-3.5a.75.75 0 0 1 0-1.5h3.5v-3.5A.75.75 0 0 1 10 5Z" />
        </svg>
      </button>
    </div>
  );
}
