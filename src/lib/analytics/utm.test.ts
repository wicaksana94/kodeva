import { describe, expect, it } from 'vitest';
import {
  ATTRIBUTION_STORAGE_KEY,
  clearAttribution,
  getStoredAttribution,
  parseAttribution,
  saveAttribution,
} from './utm';

function fakeStorage(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => void map.set(key, value),
    removeItem: (key: string) => void map.delete(key),
    dump: () => Object.fromEntries(map),
  };
}

describe('parseAttribution', () => {
  it('mengembalikan null bila tidak ada parameter atribusi', () => {
    expect(parseAttribution('')).toBeNull();
    expect(parseAttribution('?kategori=kasir&page=2')).toBeNull();
  });

  it('mengekstrak semua parameter utm dan click id', () => {
    const attribution = parseAttribution(
      '?utm_source=google&utm_medium=cpc&utm_campaign=promo-akhir-tahun&utm_content=hero-cta&utm_term=aplikasi+kasir&gclid=abc123&fbclid=xyz789',
      {
        referrer: 'https://google.com/',
        pathname: '/',
        now: new Date('2026-10-17T03:00:00.000Z'),
      },
    );
    expect(attribution).toEqual({
      utmSource: 'google',
      utmMedium: 'cpc',
      utmCampaign: 'promo-akhir-tahun',
      utmContent: 'hero-cta',
      utmTerm: 'aplikasi kasir',
      gclid: 'abc123',
      fbclid: 'xyz789',
      referrer: 'https://google.com/',
      landingPath: '/',
      capturedAt: '2026-10-17T03:00:00.000Z',
    });
  });

  it('mengabaikan parameter kosong dan hanya memakai yang terisi', () => {
    const attribution = parseAttribution('?utm_source=&utm_medium=email');
    expect(attribution?.utmSource).toBeUndefined();
    expect(attribution?.utmMedium).toBe('email');
  });
});

describe('penyimpanan atribusi', () => {
  it('menyimpan dan membaca atribusi yang masih berlaku', () => {
    const storage = fakeStorage();
    const attribution = parseAttribution('?utm_source=newsletter', {
      now: new Date('2026-10-01T00:00:00.000Z'),
    })!;
    saveAttribution(attribution, storage);

    const found = getStoredAttribution({ now: new Date('2026-10-10T00:00:00.000Z') }, storage);
    expect(found?.utmSource).toBe('newsletter');
  });

  it('menganggap kedaluwarsa setelah TTL 30 hari', () => {
    const storage = fakeStorage();
    const attribution = parseAttribution('?utm_source=newsletter', {
      now: new Date('2026-01-01T00:00:00.000Z'),
    })!;
    saveAttribution(attribution, storage);

    const found = getStoredAttribution({ now: new Date('2026-02-15T00:00:00.000Z') }, storage);
    expect(found).toBeNull();
  });

  it('tahan terhadap data rusak di storage', () => {
    const storage = fakeStorage({ [ATTRIBUTION_STORAGE_KEY]: '{bukan json' });
    expect(getStoredAttribution({}, storage)).toBeNull();

    const missingTimestamp = fakeStorage({
      [ATTRIBUTION_STORAGE_KEY]: JSON.stringify({ utmSource: 'x' }),
    });
    expect(getStoredAttribution({}, missingTimestamp)).toBeNull();
  });

  it('clearAttribution menghapus data tersimpan', () => {
    const storage = fakeStorage();
    saveAttribution(
      parseAttribution('?utm_source=a', { now: new Date('2026-10-01T00:00:00.000Z') })!,
      storage,
    );
    clearAttribution(storage);
    expect(storage.dump()[ATTRIBUTION_STORAGE_KEY]).toBeUndefined();
    expect(getStoredAttribution({}, storage)).toBeNull();
  });
});
