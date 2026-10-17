import { describe, expect, it } from 'vitest';
import {
  fieldErrorsFromZod,
  isValidEmail,
  isValidWhatsApp,
  leadRequestSchema,
  normalizeWhatsAppNumber,
} from './schema';

const validLead = {
  name: 'Budi Santoso',
  contactType: 'whatsapp' as const,
  contactValue: '0812-3456-7890',
};

describe('leadRequestSchema', () => {
  it('menerima lead valid dengan kontak WhatsApp', () => {
    const result = leadRequestSchema.safeParse(validLead);
    expect(result.success).toBe(true);
  });

  it('menerima lead valid dengan kontak email', () => {
    const result = leadRequestSchema.safeParse({
      name: 'Rina Wijaya',
      contactType: 'email',
      contactValue: 'rina@tokorina.co.id',
    });
    expect(result.success).toBe(true);
  });

  it('menolak nama terlalu pendek dengan pesan yang jelas', () => {
    const result = leadRequestSchema.safeParse({ ...validLead, name: 'B' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = fieldErrorsFromZod(result.error);
      expect(errors.name).toContain('minimal 2 karakter');
    }
  });

  it('menolak email tidak valid', () => {
    const result = leadRequestSchema.safeParse({
      name: 'Budi Santoso',
      contactType: 'email',
      contactValue: 'budi[at]bisnis',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(fieldErrorsFromZod(result.error).contactValue).toContain('email');
    }
  });

  it('menolak nomor WhatsApp tidak valid', () => {
    for (const value of ['12345', '081', 'abc-def', '+12-345']) {
      const result = leadRequestSchema.safeParse({ ...validLead, contactValue: value });
      expect(result.success, `nilai ${value} seharusnya ditolak`).toBe(false);
    }
  });

  it('menerima variasi format nomor WhatsApp yang lazim di Indonesia', () => {
    for (const value of ['081234567890', '+62 812-3456-7890', '6281234567890', '0812 3456 7890']) {
      expect(isValidWhatsApp(value), `nilai ${value} seharusnya diterima`).toBe(true);
    }
  });

  it('honeypot dan elapsedMs lolos skema (aturan bot dicek di route)', () => {
    const result = leadRequestSchema.safeParse({
      ...validLead,
      honeypot: 'http://spam.example',
      elapsedMs: 50,
    });
    expect(result.success).toBe(true);
  });
});

describe('normalisasi & validasi kontak', () => {
  it('normalisasi membuang spasi, tanda hubung, titik, dan kurung', () => {
    expect(normalizeWhatsAppNumber('+62 (812) 3456-7890')).toBe('+6281234567890');
  });

  it('isValidEmail menolak format tanpa domain', () => {
    expect(isValidEmail('nama@bisnis')).toBe(false);
    expect(isValidEmail('nama@bisnis.com')).toBe(true);
  });
});
