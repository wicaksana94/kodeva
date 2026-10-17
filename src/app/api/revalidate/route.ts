import { revalidateTag } from 'next/cache';
import { parseBody } from 'next-sanity/webhook';
import type { NextRequest } from 'next/server';

interface SanityWebhookPayload {
  _type?: string;
  slug?: { current?: string };
}

/**
 * Webhook revalidasi dari Sanity: publish konten di Studio -> halaman terkait
 * langsung segar dalam hitungan detik (tanpa menunggu TTL cache 10 menit).
 *
 * Setup di sanity.io/manage -> API -> Webhooks:
 *   URL: https://<domain>/api/revalidate
 *   Secret: samakan dengan env SANITY_REVALIDATE_SECRET
 *   Trigger: Create/Update/Delete
 */
export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return Response.json(
      { ok: false, error: 'SANITY_REVALIDATE_SECRET belum diatur di environment.' },
      { status: 501 },
    );
  }

  try {
    const { isValidSignature, body } = await parseBody<SanityWebhookPayload>(request, secret);
    if (!isValidSignature) {
      return Response.json({ ok: false, error: 'Signature webhook tidak valid.' }, { status: 401 });
    }

    const tags = new Set<string>(['landing', 'posts']);
    if (body?._type === 'post' && body.slug?.current) {
      tags.add(`post-${body.slug.current}`);
    }
    for (const tag of tags) {
      revalidateTag(tag, 'max');
    }

    return Response.json({ ok: true, type: body?._type ?? null, revalidated: [...tags] });
  } catch (error) {
    console.error('[revalidate] gagal memproses webhook:', error);
    return Response.json({ ok: false, error: 'Gagal memproses webhook.' }, { status: 500 });
  }
}
