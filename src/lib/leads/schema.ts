import { z } from 'zod';

export const attributionSchema = z
  .object({
    utmSource: z.string().max(200).optional(),
    utmMedium: z.string().max(200).optional(),
    utmCampaign: z.string().max(200).optional(),
    utmContent: z.string().max(200).optional(),
    utmTerm: z.string().max(200).optional(),
    gclid: z.string().max(300).optional(),
    fbclid: z.string().max(300).optional(),
    referrer: z.string().max(500).optional(),
    landingPath: z.string().max(300).optional(),
    capturedAt: z.string().max(40).optional(),
  })
  .optional();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const WA_PATTERN = /^(\+?62|0)8\d{7,12}$/;

/** Normalisasi nomor WhatsApp: buang spasi, tanda hubung, titik, dan tanda kurung. */
export function normalizeWhatsAppNumber(value: string): string {
  return value.replace(/[\s\-.()]/g, '');
}

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export function isValidWhatsApp(value: string): boolean {
  return WA_PATTERN.test(normalizeWhatsAppNumber(value));
}

export const leadRequestSchema = z
  .object({
    name: z
      .string({ error: 'Nama wajib diisi.' })
      .trim()
      .min(2, 'Nama minimal 2 karakter.')
      .max(80, 'Nama maksimal 80 karakter.'),
    contactType: z.enum(['email', 'whatsapp'], { error: 'Pilih jenis kontak.' }),
    contactValue: z
      .string({ error: 'Kontak wajib diisi.' })
      .trim()
      .min(1, 'Kontak wajib diisi.')
      .max(120, 'Kontak terlalu panjang.'),
    source: z.string().trim().max(120).optional(),
    /** Honeypot: harus kosong; diisi artinya bot. */
    honeypot: z.string().max(200).optional(),
    /** Lama waktu pengisian form (ms) — submit terlalu cepat dianggap bot. */
    elapsedMs: z.number().int().nonnegative().max(24 * 60 * 60 * 1000).optional(),
    utm: attributionSchema,
  })
  .superRefine((data, ctx) => {
    if (data.contactType === 'email' && !isValidEmail(data.contactValue)) {
      ctx.addIssue({
        code: 'custom',
        path: ['contactValue'],
        message: 'Format email tidak valid. Contoh: nama@bisnis.com',
      });
    }
    if (data.contactType === 'whatsapp' && !isValidWhatsApp(data.contactValue)) {
      ctx.addIssue({
        code: 'custom',
        path: ['contactValue'],
        message: 'Nomor WhatsApp tidak valid. Contoh: 081234567890 atau +6281234567890',
      });
    }
  });

export type LeadRequest = z.infer<typeof leadRequestSchema>;

export function fieldErrorsFromZod(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form');
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}
