import { z } from 'zod';
import {
  attributionSchema,
  isValidEmail,
  normalizeWhatsAppNumber,
} from '@/lib/leads/schema';

export const PAYMENT_METHOD_LABELS = {
  transfer: 'Transfer Bank (Virtual Account)',
  card: 'Kartu Kredit/Debit',
  ewallet: 'E-Wallet (GoPay/OVO/Dana)',
} as const;

export type PaymentMethod = keyof typeof PAYMENT_METHOD_LABELS;

const PHONE_PATTERN = /^(\+?62|0)8\d{7,12}$/;

export const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  packageId: z.enum(['basic', 'pro', 'business']),
  quantity: z.number().int().min(1).max(100),
});

export const checkoutRequestSchema = z.object({
  customer: z.object({
    name: z
      .string()
      .trim()
      .min(2, 'Nama minimal 2 karakter.')
      .max(80, 'Nama maksimal 80 karakter.'),
    email: z
      .string()
      .trim()
      .min(1, 'Email wajib diisi.')
      .max(120, 'Email terlalu panjang.')
      .refine(isValidEmail, 'Format email tidak valid. Contoh: nama@bisnis.com'),
    phone: z
      .string()
      .trim()
      .min(1, 'Nomor WhatsApp wajib diisi.')
      .transform(normalizeWhatsAppNumber)
      .refine(
        (value) => PHONE_PATTERN.test(value),
        'Nomor WhatsApp tidak valid. Contoh: 081234567890.',
      ),
    businessName: z.string().trim().max(120, 'Nama bisnis maksimal 120 karakter.').optional(),
    notes: z.string().trim().max(500, 'Catatan maksimal 500 karakter.').optional(),
  }),
  paymentMethod: z.enum(['transfer', 'card', 'ewallet'], {
    error: 'Pilih metode pembayaran.',
  }),
  items: z
    .array(checkoutItemSchema)
    .min(1, 'Keranjang kosong — tambahkan minimal satu produk.')
    .max(20, 'Maksimal 20 baris item per pesanan.'),
  attribution: attributionSchema,
});

export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;
