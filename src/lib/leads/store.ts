import { promises as fs } from 'node:fs';
import path from 'node:path';
import { getSanityWriteClient } from '@/sanity/client';
import { isSanityConfigured } from '@/sanity/env';
import type { LeadRequest } from './schema';

export interface StoredLeadResult {
  stored: 'sanity' | 'local';
}

/**
 * Menyimpan lead. Jika Sanity terkonfigurasi, lead disimpan sebagai dokumen agar
 * bisa dilihat tim marketing di Studio. Tanpa kredensial (mode lokal), lead
 * ditulis ke `.data/leads.jsonl` supaya alur tetap bisa diuji end-to-end.
 */
export async function storeLead(
  lead: LeadRequest,
  meta: { referrer?: string; landingPath?: string; userAgent?: string },
): Promise<StoredLeadResult> {
  const createdAt = new Date().toISOString();

  if (isSanityConfigured && process.env.SANITY_API_WRITE_TOKEN) {
    const client = getSanityWriteClient();
    await client.create({
      _type: 'lead',
      name: lead.name,
      contactType: lead.contactType,
      contactValue:
        lead.contactType === 'whatsapp'
          ? lead.contactValue.replace(/[\s\-.()]/g, '')
          : lead.contactValue,
      source: lead.source ?? 'landing',
      utmSource: lead.utm?.utmSource,
      utmMedium: lead.utm?.utmMedium,
      utmCampaign: lead.utm?.utmCampaign,
      utmContent: lead.utm?.utmContent,
      utmTerm: lead.utm?.utmTerm,
      referrer: lead.utm?.referrer ?? meta.referrer,
      landingPath: lead.utm?.landingPath ?? meta.landingPath,
      createdAt,
    });
    return { stored: 'sanity' };
  }

  const dataDir = path.join(process.cwd(), '.data');
  await fs.mkdir(dataDir, { recursive: true });
  await fs.appendFile(
    path.join(dataDir, 'leads.jsonl'),
    `${JSON.stringify({
      ...lead,
      honeypot: undefined,
      referrer: lead.utm?.referrer ?? meta.referrer,
      landingPath: lead.utm?.landingPath ?? meta.landingPath,
      userAgent: meta.userAgent,
      createdAt,
    })}\n`,
    'utf8',
  );
  return { stored: 'local' };
}
