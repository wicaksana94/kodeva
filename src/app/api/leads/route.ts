import { NextRequest } from 'next/server';
import { fieldErrorsFromZod, leadRequestSchema } from '@/lib/leads/schema';
import { checkRateLimit } from '@/lib/leads/rate-limit';
import { storeLead } from '@/lib/leads/store';

const MAX_BODY_BYTES = 10_000;
const MIN_FILL_MS = 1200;

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return Response.json({ ok: false, error: 'Payload terlalu besar.' }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'Body harus berupa JSON yang valid.' }, { status: 400 });
  }

  const parsed = leadRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { ok: false, errors: fieldErrorsFromZod(parsed.error) },
      { status: 400 },
    );
  }
  const lead = parsed.data;

  // Proteksi spam lapis 1: honeypot terisi -> pura-pura sukses tanpa menyimpan.
  if (lead.honeypot && lead.honeypot.trim().length > 0) {
    return Response.json({ ok: true });
  }
  // Proteksi spam lapis 2: form terisi lebih cepat dari manusia wajar.
  if (typeof lead.elapsedMs === 'number' && lead.elapsedMs < MIN_FILL_MS) {
    return Response.json({ ok: true });
  }

  // Proteksi spam lapis 3: rate limit per IP.
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
  const rateLimit = checkRateLimit(`lead:${ip}`);
  if (!rateLimit.allowed) {
    return Response.json(
      { ok: false, error: 'Terlalu banyak pengiriman. Silakan coba lagi beberapa menit lagi.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } },
    );
  }

  try {
    await storeLead(lead, {
      referrer: request.headers.get('referer') ?? undefined,
      landingPath: new URL(request.url).pathname,
      userAgent: request.headers.get('user-agent') ?? undefined,
    });
    return Response.json({ ok: true });
  } catch (error) {
    console.error('[leads] gagal menyimpan lead:', error);
    return Response.json(
      { ok: false, error: 'Terjadi kesalahan saat menyimpan data. Silakan coba lagi.' },
      { status: 500 },
    );
  }
}
