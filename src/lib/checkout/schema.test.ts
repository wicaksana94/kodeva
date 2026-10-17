import { describe, expect, it } from 'vitest';
import { checkoutRequestSchema } from './schema';
import { fieldErrorsFromZod } from '@/lib/validation';

const validPayload = {
  customer: {
    name: 'Budi Santoso',
    email: 'budi@bisnis.com',
    phone: '0812-3456-7890',
    businessName: 'Kopi Senja',
  },
  paymentMethod: 'transfer' as const,
  items: [{ productId: 'kasir-prima', packageId: 'pro' as const, quantity: 3 }],
};

describe('checkoutRequestSchema', () => {
  it('menerima payload checkout yang valid', () => {
    expect(checkoutRequestSchema.safeParse(validPayload).success).toBe(true);
  });

  it('menormalisasi nomor telepon (spasi/tanda hubung dibuang)', () => {
    const result = checkoutRequestSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.customer.phone).toBe('081234567890');
    }
  });

  it('menolak keranjang kosong dengan pesan jelas', () => {
    const result = checkoutRequestSchema.safeParse({ ...validPayload, items: [] });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(fieldErrorsFromZod(result.error).items).toContain('kosong');
    }
  });

  it('menolak metode pembayaran yang tidak dikenal', () => {
    const result = checkoutRequestSchema.safeParse({ ...validPayload, paymentMethod: 'bitcoin' });
    expect(result.success).toBe(false);
  });

  it('menolak quantity tidak wajar (0, negatif, pecahan, >100)', () => {
    for (const quantity of [0, -2, 2.5, 101]) {
      const result = checkoutRequestSchema.safeParse({
        ...validPayload,
        items: [{ productId: 'kasir-prima', packageId: 'pro', quantity }],
      });
      expect(result.success, `quantity ${quantity} seharusnya ditolak`).toBe(false);
    }
  });

  it('menolak paket yang tidak dikenal', () => {
    const result = checkoutRequestSchema.safeParse({
      ...validPayload,
      items: [{ productId: 'kasir-prima', packageId: 'enterprise', quantity: 1 }],
    });
    expect(result.success).toBe(false);
  });

  it('menerima email berawalan "fail" (aturan gagal dicek di API, bukan validasi)', () => {
    const result = checkoutRequestSchema.safeParse({
      ...validPayload,
      customer: { ...validPayload.customer, email: 'fail@bisnis.com' },
    });
    expect(result.success).toBe(true);
  });

  it('menerima atribusi UTM opsional', () => {
    const result = checkoutRequestSchema.safeParse({
      ...validPayload,
      attribution: {
        utmSource: 'google',
        utmMedium: 'cpc',
        utmCampaign: 'promo-akhir-tahun',
        capturedAt: '2026-10-01T00:00:00.000Z',
      },
    });
    expect(result.success).toBe(true);
  });
});
