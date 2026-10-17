'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  fieldErrorsFromZod,
  leadRequestSchema,
  type LeadRequest,
} from '@/lib/leads/schema';
import { getStoredAttribution } from '@/lib/analytics/utm';

type ContactType = 'email' | 'whatsapp';
type Status = 'idle' | 'submitting' | 'success' | 'error';

interface LeadFormProps {
  source?: string;
}

export function LeadForm({ source = 'landing-lead-form' }: LeadFormProps) {
  const [name, setName] = useState('');
  const [contactType, setContactType] = useState<ContactType>('whatsapp');
  const [contactValue, setContactValue] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    const payload: LeadRequest = {
      name,
      contactType,
      contactValue,
      source,
      honeypot: honeypot || undefined,
      elapsedMs: startedAt.current ? Date.now() - startedAt.current : undefined,
      utm: getStoredAttribution() ?? undefined,
    };

    const parsed = leadRequestSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(fieldErrorsFromZod(parsed.error));
      setStatus('idle');
      return;
    }
    setErrors({});
    setStatus('submitting');

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      const data = (await response.json().catch(() => null)) as {
        ok?: boolean;
        errors?: Record<string, string>;
        error?: string;
      } | null;

      if (response.ok && data?.ok) {
        setStatus('success');
        return;
      }
      if (data?.errors) {
        setErrors(data.errors);
        setStatus('idle');
        return;
      }
      setSubmitError(data?.error ?? 'Terjadi kesalahan. Silakan coba lagi.');
      setStatus('error');
    } catch {
      setSubmitError('Tidak dapat terhubung ke server. Periksa koneksi Anda lalu coba lagi.');
      setStatus('error');
    }
  }

  function resetForm() {
    setName('');
    setContactValue('');
    setHoneypot('');
    setErrors({});
    setSubmitError(null);
    setStatus('idle');
    startedAt.current = Date.now();
  }

  if (status === 'success') {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center" role="status">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-600 text-white">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="mt-3 text-lg font-bold text-emerald-900">Terima kasih, {name.split(' ')[0]}!</h3>
        <p className="mt-1 text-sm text-emerald-800">
          Data Anda sudah kami terima. Tim Kodeva akan menghubungi Anda melalui{' '}
          {contactType === 'email' ? 'email' : 'WhatsApp'} dalam 1×24 jam kerja.
        </p>
        <button
          type="button"
          onClick={resetForm}
          className="mt-4 rounded-xl border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
        >
          Kirim lead lain
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="lead-name" className="block text-sm font-semibold text-slate-800">
            Nama lengkap
          </label>
          <input
            id="lead-name"
            name="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'lead-name-error' : undefined}
            placeholder="Contoh: Budi Santoso"
            className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
          />
          {errors.name && (
            <p id="lead-name-error" className="mt-1 text-xs font-medium text-red-600">
              {errors.name}
            </p>
          )}
        </div>

        <fieldset>
          <legend className="text-sm font-semibold text-slate-800">Dihubungi via</legend>
          <div className="mt-1.5 grid grid-cols-2 gap-2" role="radiogroup">
            {(
              [
                { value: 'whatsapp', label: 'WhatsApp' },
                { value: 'email', label: 'Email' },
              ] as const
            ).map((option) => (
              <label
                key={option.value}
                className={`flex min-h-11 cursor-pointer items-center justify-center rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                  contactType === option.value
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="contactType"
                  value={option.value}
                  checked={contactType === option.value}
                  onChange={() => {
                    setContactType(option.value);
                    setContactValue('');
                    setErrors((prev) => ({ ...prev, contactValue: '' }));
                  }}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="lead-contact" className="block text-sm font-semibold text-slate-800">
            {contactType === 'email' ? 'Alamat email' : 'Nomor WhatsApp'}
          </label>
          <input
            id="lead-contact"
            name="contactValue"
            type={contactType === 'email' ? 'email' : 'tel'}
            inputMode={contactType === 'email' ? 'email' : 'tel'}
            autoComplete={contactType === 'email' ? 'email' : 'tel'}
            value={contactValue}
            onChange={(event) => setContactValue(event.target.value)}
            aria-invalid={Boolean(errors.contactValue)}
            aria-describedby={errors.contactValue ? 'lead-contact-error' : undefined}
            placeholder={contactType === 'email' ? 'nama@bisnis.com' : '081234567890'}
            className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
          />
          {errors.contactValue && (
            <p id="lead-contact-error" className="mt-1 text-xs font-medium text-red-600">
              {errors.contactValue}
            </p>
          )}
        </div>

        <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
          <label htmlFor="lead-website">Website (kosongkan)</label>
          <input
            id="lead-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(event) => setHoneypot(event.target.value)}
          />
        </div>

        {submitError && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="min-h-11 w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === 'submitting' ? 'Mengirim…' : 'Hubungi Saya'}
        </button>
        <p className="text-center text-xs text-slate-500">
          Dengan mengirim data, Anda menyetujui{' '}
          <Link href="/blog" className="underline hover:text-indigo-700">
            kebijakan privasi
          </Link>{' '}
          kami. Kami tidak pernah membagikan data Anda.
        </p>
      </div>
    </form>
  );
}
